"use strict";

/**
 * Provider fetcher tests.
 *
 * Every test injects `fetchImpl`, so the suite never touches the network and
 * never needs a paid API key. That is a hard requirement: a test suite that
 * needs credentials stops being run.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const openrouter = require("../js/openrouter");
const groq = require("../js/groq");
const { parseRetryAfter, HttpError } = require("../js/lib/http");

/** Builds a minimal Response-alike for the injected fetch. */
function response(status, body, { headers = {} } = {}) {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "",
    headers: { forEach: (cb) => Object.entries(lower).forEach(([k, v]) => cb(v, k)) },
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

/** A temp output path so tests never touch the repository's data files. */
function tempOutput(name) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aicatalog-"));
  return path.join(dir, name);
}

// ── OpenRouter normalisation ───────────────────────────────────────────────

test("openrouter: exact model id, pricing and context are preserved", () => {
  const { model, error } = openrouter.normalizeModel(
    {
      id: "openai/gpt-4o",
      name: "OpenAI: GPT-4o",
      context_length: 128000,
      description: "GPT-4o",
      architecture: { input_modalities: ["text", "image"], output_modalities: ["text"] },
      pricing: { prompt: "0.0000025", completion: "0.00001" },
      supported_parameters: ["tools", "response_format", "reasoning"],
      top_provider: { max_completion_tokens: 16384 },
    },
    "2026-01-01T00:00:00.000Z",
  );

  assert.equal(error, undefined);
  assert.equal(model.availability.openrouter.model_id, "openai/gpt-4o", "exact id preserved");
  assert.equal(model.pricing.input_per_1m_usd, 2.5);
  assert.equal(model.pricing.output_per_1m_usd, 10);
  assert.equal(model.context_window, 128000);
  assert.deepEqual(model.modalities.input, ["image", "text"]);
  assert.deepEqual(model.capabilities, ["reasoning", "structured_output", "tools"]);
  assert.ok(model.provenance.some((p) => p.source === "openrouter"));
});

test("openrouter: a missing price stays null, not zero", () => {
  const { model } = openrouter.normalizeModel(
    { id: "free/model", name: "Free Model", pricing: {} },
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(model.pricing.input_per_1m_usd, null);
  assert.equal(model.pricing.output_per_1m_usd, null);
});

test("openrouter: the verbatim price string is kept alongside parsed numbers", () => {
  const { model } = openrouter.normalizeModel(
    { id: "x/y", name: "Y", pricing: { prompt: "0.000003", completion: "0.000015" } },
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(model.pricing.raw, "0.000003/0.000015 per token");
});

test("openrouter: a record with no id is rejected, not invented", () => {
  const { error } = openrouter.normalizeModel({ name: "No Id" }, "2026-01-01T00:00:00.000Z");
  assert.equal(error, "missing id");
});

test("openrouter: unsupported parameters do not become invented capabilities", () => {
  const { model } = openrouter.normalizeModel(
    { id: "x/y", name: "Y", supported_parameters: ["wat", "frequency_penalty"] },
    "2026-01-01T00:00:00.000Z",
  );
  assert.deepEqual(model.capabilities, []);
});

test("openrouter: a full fetch writes a valid catalog", async () => {
  const output = tempOutput("openrouter.json");
  const result = await openrouter.sync({
    output,
    retries: 1,
    fetchImpl: async () =>
      response(200, {
        data: [
          {
            id: "openai/gpt-4o",
            name: "GPT-4o",
            context_length: 128000,
            pricing: { prompt: "0.0000025", completion: "0.00001" },
            supported_parameters: ["tools"],
          },
          { name: "Broken — no id at all" },
        ],
      }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.count, 1, "the malformed row is rejected");

  const written = JSON.parse(fs.readFileSync(output, "utf8"));
  assert.equal(written.count, 1);
  assert.equal(written.diagnostics.rejected.length, 1, "rejection is reported, not silent");
  assert.equal(written.source.status, "ok");
});

test("openrouter: a second identical run does not rewrite the file", async () => {
  const output = tempOutput("openrouter.json");
  const payload = {
    data: [{ id: "a/b", name: "B", pricing: { prompt: "0.000001", completion: "0.000002" } }],
  };
  const fetchImpl = async () => response(200, payload);

  const first = await openrouter.sync({ output, retries: 1, fetchImpl });
  const second = await openrouter.sync({ output, retries: 1, fetchImpl });

  assert.equal(first.changed, true);
  assert.equal(second.changed, false, "identical content must not rewrite the file");
});

test("openrouter: HTTP 500 is retried then reported, and the old catalog survives", async () => {
  const output = tempOutput("openrouter.json");

  // Seed a good catalog first.
  await openrouter.sync({
    output,
    retries: 1,
    fetchImpl: async () =>
      response(200, { data: [{ id: "keep/me", name: "Keep", pricing: { prompt: "1", completion: "2" } }] }),
  });
  const before = fs.readFileSync(output, "utf8");

  let attempts = 0;
  const result = await openrouter.sync({
    output,
    retries: 3,
    retryBaseMsOverride: undefined,
    fetchImpl: async () => {
      attempts += 1;
      return response(500, { error: "boom" });
    },
  }).catch((error) => ({ ok: false, error: error.message, attempts }));

  assert.ok(!result.ok, "a failed refresh must not report success");
  assert.equal(attempts, 3, "retries are bounded at 3 attempts");
  assert.equal(fs.readFileSync(output, "utf8"), before, "last known good catalog is preserved");
});

test("openrouter: a 404 is not retried", async () => {
  let attempts = 0;
  await openrouter.sync({
    output: tempOutput("openrouter.json"),
    retries: 3,
    fetchImpl: async () => {
      attempts += 1;
      return response(404, { error: "not found" });
    },
  });

  assert.equal(attempts, 1, "a 404 will not become a 200 by retrying");
});

test("openrouter: a 200 with a non-JSON body is an error, never an empty catalog", async () => {
  const output = tempOutput("openrouter.json");
  const result = await openrouter.sync({
    output,
    retries: 1,
    fetchImpl: async () => response(200, "<html>gateway error</html>"),
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /not valid JSON/);
  assert.equal(fs.existsSync(output), false, "nothing is written for an unparseable body");
});

test("openrouter: a 200 with an unexpected shape is refused", async () => {
  const result = await openrouter.sync({
    output: tempOutput("openrouter.json"),
    retries: 1,
    fetchImpl: async () => response(200, { unexpected: true }),
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /missing data/);
});

test("openrouter: an empty data array is accepted but reports zero", async () => {
  const result = await openrouter.sync({
    output: tempOutput("openrouter.json"),
    retries: 1,
    fetchImpl: async () => response(200, { data: [] }),
  });
  assert.equal(result.ok, true);
  assert.equal(result.count, 0);
});

// ── Groq ───────────────────────────────────────────────────────────────────

test("groq: no API key means skip, and an existing catalog is untouched", async () => {
  const output = tempOutput("groq.json");
  const result = await groq.sync({ output, apiKey: null });

  assert.equal(result.ok, false);
  assert.equal(result.status, "skipped");
  assert.equal(fs.existsSync(output), false);
});

test("groq: pricing stays null because the endpoint publishes none", () => {
  const { model } = groq.normalizeModel(
    { id: "llama-3.3-70b-versatile", object: "model", created: 1700000000, owned_by: "meta" },
    "2026-01-01T00:00:00.000Z",
  );

  assert.equal(model.availability.groq.model_id, "llama-3.3-70b-versatile");
  assert.equal(model.pricing.input_per_1m_usd, null, "unknown pricing is never zero");
  assert.equal(model.pricing.output_per_1m_usd, null);
  assert.equal(model.context_window, null, "not stated by this endpoint");
});

test("groq: the exact id is preserved and a display name derived", () => {
  const { model } = groq.normalizeModel({ id: "llama-3.3-70b-versatile" }, "2026-01-01T00:00:00.000Z");
  assert.equal(model.name, "Llama 3.3 70b Versatile");
  assert.deepEqual(model.aliases, ["llama-3.3-70b-versatile"]);
});

test("groq: a successful fetch sends the bearer token", async () => {
  const output = tempOutput("groq.json");
  let seenAuth = null;

  const result = await groq.sync({
    output,
    apiKey: "test-key",
    retries: 1,
    fetchImpl: async (_url, options) => {
      seenAuth = options.headers.authorization;
      return response(200, {
        object: "list",
        data: [{ id: "llama-3.1-70b-versatile", object: "model", created: 1, owned_by: "meta" }],
      });
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.count, 1);
  assert.equal(seenAuth, "Bearer test-key", "auth header is sent");
});

test("groq: a failed refresh preserves the previous catalog", async () => {
  const output = tempOutput("groq.json");

  await groq.sync({
    output,
    apiKey: "k",
    retries: 1,
    fetchImpl: async () =>
      response(200, { object: "list", data: [{ id: "keep/me", object: "model", created: 1 }] }),
  });
  const before = fs.readFileSync(output, "utf8");

  const result = await groq.sync({
    output,
    apiKey: "k",
    retries: 1,
    fetchImpl: async () => response(401, { error: "invalid api key" }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "stale");
  assert.equal(fs.readFileSync(output, "utf8"), before);
});

test("groq: a record with no id is rejected", () => {
  const { error } = groq.normalizeModel({ object: "model" }, "2026-01-01T00:00:00.000Z");
  assert.equal(error, "missing id");
});

// ── HTTP layer ─────────────────────────────────────────────────────────────

test("parseRetryAfter reads a numeric delay and an HTTP date", () => {
  assert.equal(parseRetryAfter("30"), 30);
  const now = Date.parse("2026-01-01T00:00:00Z");
  assert.equal(parseRetryAfter("Thu, 01 Jan 2026 00:00:10 GMT", now), 10);
  assert.equal(parseRetryAfter(null), null);
  assert.equal(parseRetryAfter("not-a-date", now), null);
});

test("a timeout is reported as retryable", async () => {
  const result = await openrouter.sync({
    output: tempOutput("openrouter.json"),
    retries: 1,
    timeoutMs: 20,
    fetchImpl: (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      }),
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /Timed out/);
});

test("HttpError carries the status so callers can distinguish 401 from 500", () => {
  const error = new HttpError("nope", { status: 401, retryable: false });
  assert.equal(error.status, 401);
  assert.equal(error.retryable, false);
});