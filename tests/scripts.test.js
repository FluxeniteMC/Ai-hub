/**
 * Tests for the automation scripts and the workflow YAML that runs them.
 *
 * These exist because the scripts had real, fatal bugs that no test caught:
 * a ReferenceError on module load, a temporal-dead-zone access, and an
 * installed package that did not match the imported one. Each of those fails
 * silently in review and loudly only on a schedule.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const SCRIPTS = path.join(ROOT, "scripts");
const WORKFLOWS = path.join(ROOT, ".github", "workflows");

/** A path that never exists, to force the regex fallback in countUniqueListings. */
const NO_CATALOG = path.join(ROOT, "tests", "no-such-catalog.json");

/** Every script under scripts/, including scripts/lib/, as paths relative to it. */
function scriptNames() {
  const found = [];
  const walk = (dir, prefix = "") => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
      else if (entry.name.endsWith(".js")) found.push(rel);
    }
  };
  walk(SCRIPTS);
  return found.sort();
}

// ── syntax ───────────────────────────────────────────────────────────

test("every script in scripts/ parses", () => {
  const names = scriptNames();
  assert.ok(names.length > 0, "expected to find scripts to check");
  for (const name of names) {
    assert.doesNotThrow(
      () =>
        execFileSync(process.execPath, ["--check", path.join(SCRIPTS, name)], { stdio: "pipe" }),
      `${name} should pass node --check`
    );
  }
});

// ── Gemini retry helper ──────────────────────────────────────────────

test("gemini-retry retries a 503 and returns the eventual success", async () => {
  const { withRetry } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));
  let calls = 0;
  const value = await withRetry(
    async () => {
      calls += 1;
      if (calls < 3) {
        // The shape the SDK actually produces for "high demand".
        const err = new Error("unavailable");
        err.error = { code: 503, status: "UNAVAILABLE" };
        throw err;
      }
      return "report";
    },
    { delaysMs: [0, 0, 0] }
  );
  assert.equal(value, "report");
  assert.equal(calls, 3);
});

test("gemini-retry does not retry a client error", async () => {
  const { withRetry } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls += 1;
        const err = new Error("bad request");
        err.status = 400;
        throw err;
      },
      { delaysMs: [0, 0, 0] }
    ),
    /bad request/
  );
  assert.equal(calls, 1, "a 400 must fail immediately");
});

test("gemini-retry recognises transient codes and ignores the rest", () => {
  const { isRetryable, statusOf } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));

  for (const code of [429, 500, 502, 503, 504]) {
    assert.equal(statusOf({ status: code }), code, `${code} should be read as retryable`);
    assert.equal(isRetryable({ status: code }), true);
  }

  for (const code of [400, 401, 403, 404]) {
    assert.equal(statusOf({ status: code }), null, `${code} is not transient`);
    assert.equal(isRetryable({ status: code }), false);
  }

  // The SDK nests the code under `error` for API-envelope failures.
  assert.equal(statusOf({ error: { code: 503 } }), 503);
  assert.equal(isRetryable({ error: { code: 429 } }), true);
  // Network failures carry no status at all.
  assert.equal(isRetryable(new Error("fetch failed")), true);
  assert.equal(isRetryable(new Error("something odd")), false);
});

test("gemini-retry rethrows the last error once the schedule is exhausted", async () => {
  const { withRetry } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls += 1;
        const err = new Error("still unavailable");
        err.error = { code: 503 };
        throw err;
      },
      { delaysMs: [0, 0, 0] }
    ),
    /still unavailable/
  );
  assert.equal(calls, 3, "every scheduled attempt should be used");
});

test("gemini-retry falls back to another model when one is unavailable", async () => {
  const { generateWithFallback } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));
  const tried = [];
  const { text, model } = await generateWithFallback(
    async (m) => {
      tried.push(m);
      if (m === "gemini-broken") {
        const err = new Error("high demand");
        err.error = { code: 503, status: "UNAVAILABLE" };
        throw err;
      }
      return { text: "ok" };
    },
    { model: "gemini-broken", fallbacks: ["gemini-works"], delaysMs: [0, 0, 0] }
  );
  assert.equal(text, "ok");
  assert.equal(model, "gemini-works");
  assert.equal(tried[0], "gemini-broken", "the configured model is tried first");
  assert.equal(tried[tried.length - 1], "gemini-works", "the request lands on the fallback");
  assert.ok(
    new Set(tried).size === 2 && tried.indexOf("gemini-works") === 3,
    `expected 3 attempts on the broken model before switching, saw ${JSON.stringify(tried)}`
  );
});

test("gemini-retry does not change models for a non-transient error", async () => {
  const { generateWithFallback } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));
  const tried = [];
  await assert.rejects(
    generateWithFallback(
      async (m) => {
        tried.push(m);
        const err = new Error("bad key");
        err.status = 401;
        throw err;
      },
      { model: "gemini-a", fallbacks: ["gemini-b"], delaysMs: [0, 0, 0] }
    ),
    /bad key/
  );
  assert.deepEqual(tried, ["gemini-a"], "a 401 must not be retried against other models");
});

test("gemini-retry fallback list is configurable and has a sane default", () => {
  const { fallbackModels } = require(path.join(SCRIPTS, "lib", "gemini-retry.js"));

  const saved = process.env.GEMINI_MODEL_FALLBACKS;
  try {
    delete process.env.GEMINI_MODEL_FALLBACKS;
    const fallback = fallbackModels();
    assert.ok(fallback.length >= 1, "a default fallback must exist");
    for (const name of fallback) {
      assert.match(name, /^gemini-/, `unexpected fallback model "${name}"`);
    }

    process.env.GEMINI_MODEL_FALLBACKS = " a-model , b-model ";
    assert.deepEqual(fallbackModels(), ["a-model", "b-model"]);
  } finally {
    if (saved === undefined) delete process.env.GEMINI_MODEL_FALLBACKS;
    else process.env.GEMINI_MODEL_FALLBACKS = saved;
  }
});

test("every Gemini call site goes through the retry helper", () => {
  // A bare generateContent call would still die on a transient 503.
  for (const name of scriptNames()) {
    const source = fs.readFileSync(path.join(SCRIPTS, name), "utf8");
    if (!/generateContent/.test(source)) continue;
    assert.match(
      source,
      /withRetry\(|generateWithFallback\(/,
      `${name} calls generateContent directly; wrap it in the retry helper`
    );
  }
});

// ── module loading ───────────────────────────────────────────────────

/**
 * Run a script in a child process with the environment the harness has, and
 * return { status, stdout, stderr }.
 */
function runNode(file, { env = {}, args = [] } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [file, ...args], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...env },
    });
    return { status: 0, stdout, stderr: "" };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? String(error),
    };
  }
}

test("gemini-analyzer.js fails on a missing key, not a ReferenceError", () => {
  const script = path.join(SCRIPTS, "gemini-analyzer.js");
  const result = runNode(script, {
    env: { GEMINI_API_KEY: "", PATH: process.env.PATH, SystemRoot: process.env.SystemRoot },
  });

  assert.notEqual(result.status, 0, "should exit non-zero without a key");

  const output = result.stdout + result.stderr;
  assert.doesNotMatch(
    output,
    /ReferenceError/,
    "the historical bug was a ReferenceError from an undefined GoogleGenerativeAI"
  );
  assert.doesNotMatch(
    output,
    /getGenerativeModel is not defined|GoogleGenerativeAI is not defined/,
    "the removed SDK call must not be reachable"
  );
  assert.match(output, /GEMINI_API_KEY/i, "the failure must name the missing credential");
});

test("weekly-report.js fails on a missing key, not a ReferenceError", () => {
  const script = path.join(SCRIPTS, "weekly-report.js");
  const result = runNode(script, {
    env: { GEMINI_API_KEY: "", PATH: process.env.PATH, SystemRoot: process.env.SystemRoot },
  });

  assert.notEqual(result.status, 0, "should exit non-zero without a key");

  const output = result.stdout + result.stderr;
  assert.doesNotMatch(
    output,
    /Cannot access 'GEMINI_API_KEY' before initialization/,
    "the historical bug was a temporal-dead-zone read of the key"
  );
  assert.doesNotMatch(output, /ReferenceError/, "no ReferenceError should remain");
  assert.match(output, /GEMINI_API_KEY/i, "the failure must name the missing credential");
});

test("both Gemini scripts are importable without side effects", () => {
  for (const name of ["gemini-analyzer.js", "weekly-report.js"]) {
    assert.doesNotThrow(() => {
      require(path.join(SCRIPTS, name));
    }, `${name} should be requirable without running its main`);
  }
});

test("no script reaches for the removed generative-ai client", () => {
  for (const name of scriptNames()) {
    const source = fs.readFileSync(path.join(SCRIPTS, name), "utf8");
    // Strip comments so the changelog-style notes about the removal do not match.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.doesNotMatch(code, /GoogleGenerativeAI/, `${name} still references GoogleGenerativeAI`);
    assert.doesNotMatch(code, /getGenerativeModel\(/, `${name} still calls getGenerativeModel()`);
  }
});

// ── validate-links classification ────────────────────────────────────

test("validate-links.js classifies 404 and 410 as dead", () => {
  const { classify, DEAD_STATUSES } = require(path.join(SCRIPTS, "validate-links.js"));
  assert.equal(classify({ status: 404, ok: false }), "dead");
  assert.equal(classify({ status: 410, ok: false }), "dead");
  assert.deepEqual([...DEAD_STATUSES].sort(), [404, 410]);
});

test("validate-links.js does not call 401/403/429 dead", () => {
  const { classify } = require(path.join(SCRIPTS, "validate-links.js"));
  // A bot shield and a rate limit say nothing about whether the page exists.
  assert.equal(classify({ status: 401, ok: false }), "blocked");
  assert.equal(classify({ status: 403, ok: false }), "blocked");
  assert.equal(classify({ status: 429, ok: false }), "blocked");
  assert.equal(classify({ status: 503, ok: false }), "blocked");
  assert.equal(classify({ status: 0, ok: false }), "blocked");
});

test("validate-links.js treats 2xx and 3xx as usable", () => {
  const { classify } = require(path.join(SCRIPTS, "validate-links.js"));
  assert.equal(classify({ status: 200, ok: true }), "valid");
  assert.equal(classify({ status: 200, ok: true, redirected: true }), "redirect");
});

test("validate-links.js retries a transient failure and then succeeds", async () => {
  const { fetchWithTimeout } = require(path.join(SCRIPTS, "validate-links.js"));
  let calls = 0;
  const responses = [
    { status: 503, ok: false },
    { status: 200, ok: true, url: "https://example.com/" },
  ];
  const fakeFetch = async () => {
    const next = responses[Math.min(calls, responses.length - 1)];
    calls += 1;
    return next;
  };

  const result = await fetchWithTimeout("https://example.com/", 50, fakeFetch);
  assert.equal(result.verdict, "valid", "a 503 followed by a 200 must not be reported dead");
  assert.ok(calls >= 2, `expected a retry, saw ${calls} call(s)`);
});

test("validate-links.js gives up on a 404 instead of retrying", async () => {
  const { fetchWithTimeout } = require(path.join(SCRIPTS, "validate-links.js"));
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    return { status: 404, ok: false };
  };

  const result = await fetchWithTimeout("https://example.com/gone", 50, fakeFetch);
  assert.equal(result.verdict, "dead");
  assert.equal(result.status, 404, "the final status must be retained for the report");
  assert.equal(calls, 1, "a 404 is final and must not be retried");
});

// ── stats counting ──────────────────────────────────────────────────

test("gemini-updater counts unique listings, not table rows", () => {
  const { countUniqueListings } = require(path.join(SCRIPTS, "gemini-updater.js"));

  const header = ["| API | Price |", "|-----|-------|"];
  const rows = [
    "| [Mistral](https://mistral.ai/) | $1 |",
    "| [Pinecone](https://pinecone.io/) | $2 |",
  ];
  // The same API listed twice — a pricing table and an embeddings table, say.
  // The old `^\| \[` row count double-counted every one of those.
  const once = countUniqueListings([...header, ...rows].join("\n"), { catalogPath: NO_CATALOG });
  const twice = countUniqueListings([...header, ...rows, ...rows].join("\n"), {
    catalogPath: NO_CATALOG,
  });

  assert.equal(
    twice,
    once,
    "re-listing the same models must not change the reported count"
  );
  assert.ok(once >= 2 && once <= rows.length + 1, `unexpected count ${once}`);
});

test("gemini-updater prefers the generated catalog count", () => {
  const { countUniqueListings } = require(path.join(SCRIPTS, "gemini-updater.js"));
  const generated = path.join(ROOT, "data", "readme-models.json");
  if (!fs.existsSync(generated)) return; // catalog not built yet

  const expected = JSON.parse(fs.readFileSync(generated, "utf8")).count;
  assert.equal(
    countUniqueListings(fs.readFileSync(path.join(ROOT, "README.md"), "utf8")),
    expected,
    "stats must match the catalog, not a regex approximation"
  );
});

// ── workflow wiring ──────────────────────────────────────────────────

function workflowFiles() {
  return fs
    .readdirSync(WORKFLOWS)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort();
}

/** The `run:` bodies of steps in a workflow, flattened to one string. */
function workflowText(name) {
  return fs.readFileSync(path.join(WORKFLOWS, name), "utf8");
}

test("workflows install the SDK the scripts actually import", () => {
  // scripts/*.js import `@google/genai` (GoogleGenAI). A workflow that installs
  // the deprecated `@google/generative-ai` satisfies the job with a package the
  // script never touches, and the job dies at require() time.
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert.ok(
    pkg.dependencies?.["@google/genai"],
    "package.json must declare @google/genai so a bare `npm install` provides it"
  );

  for (const file of workflowFiles()) {
    const text = workflowText(file);

    // Every @google/* package this workflow installs explicitly.
    const installed = [...text.matchAll(/npm (?:ci|install)\s+(@google\/[\w-]+)/g)].map((m) => m[1]);
    // Every @google/* package anything in the workflow actually requires.
    const required = new Set(
      [...text.matchAll(/require\(\s*["'](@google\/[\w-]+)["']\s*\)/g)].map((m) => m[1])
    );

    // Also credit packages required by the scripts this workflow runs.
    for (const [, script] of text.matchAll(/node (scripts\/[\w.-]+\.js)/g)) {
      const source = fs.readFileSync(path.join(ROOT, script), "utf8");
      for (const [, name] of source.matchAll(/require\(\s*["'](@google\/[\w-]+)["']\s*\)/g)) {
        required.add(name);
      }
    }

    for (const name of installed) {
      assert.ok(
        required.has(name),
        `${file} installs ${name} but nothing in the workflow requires it — ` +
          `a workflow that runs scripts importing @google/genai must not install @google/generative-ai`
      );
    }
  }
});

test("validate.yml installs @google/genai for gemini-analyzer.js", () => {
  // The specific regression: validate.yml installed @google/generative-ai while
  // running a script that imports @google/genai.
  const text = workflowText("validate.yml");
  // Drop comment lines: the step documents the old package name on purpose.
  const code = text
    .split(/\r?\n/)
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");

  assert.match(code, /node scripts\/gemini-analyzer\.js/);
  assert.match(code, /npm install @google\/genai/);
  assert.doesNotMatch(
    code,
    /@google\/generative-ai/,
    "validate.yml must not install the deprecated SDK"
  );
});

test("no workflow opens an unconditional issues.create for a repeating job", () => {
  // These run on a schedule. An unconditional create produced a fresh duplicate
  // issue every single run.
  const scheduled = ["validate.yml", "weekly-report.yml"];
  for (const file of scheduled) {
    const text = workflowText(file);
    const creates = text.match(/github\.rest\.issues\.create\(\{/g) ?? [];
    const finds = text.match(/github\.rest\.issues\.listForRepo/g) ?? [];
    assert.ok(
      finds.length > 0,
      `${file} creates issues but never looks for an existing one — it will duplicate every run`
    );
    // Every create must be guarded by a rollup lookup, not fired unconditionally.
    assert.ok(
      creates.length === finds.length,
      `${file}: ${creates.length} create(s) vs ${finds.length} lookup(s) — an unguarded create remains`
    );
  }
});

test("validate-links.js output name matches what the workflows read", () => {
  const script = fs.readFileSync(path.join(SCRIPTS, "validate-links.js"), "utf8");
  assert.match(script, /dead_links_count=/, "the workflow reads this output");
  // The report key the issue step reads must exist.
  assert.match(script, /dead_links:/, "report.dead_links is read by validate.yml");
  assert.match(script, /blocked_links:/, "blocked links are reported separately");
});

test("validate-links.js is importable without running a network scan", () => {
  // Importing must not kick off main(); a test run would otherwise hit the
  // network and take minutes.
  const before = Date.now();
  require(path.join(SCRIPTS, "validate-links.js"));
  assert.ok(Date.now() - before < 3000, "import must not run main()");
});