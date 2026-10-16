"use strict";

/**
 * HTTP client for provider catalog fetches.
 *
 * Requirements this exists to satisfy:
 *   - bounded timeouts, so a hung socket cannot stall a scheduled job;
 *   - bounded retries with exponential backoff and jitter;
 *   - explicit handling of 429 / 5xx / network failures, not a generic catch;
 *   - a seam for tests: `fetchImpl` is injectable so unit tests never touch
 *     the network and never need a paid API call.
 */

const log = require("./log");

/** Default per-request timeout. */
const DEFAULT_TIMEOUT_MS = 20_000;

/** Retry 429 and 5xx plus transport errors. Never retry a 4xx we caused. */
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

class HttpError extends Error {
  /**
   * @param {string} message
   * @param {{status?: number|null, retryable?: boolean, body?: string, url?: string}} [details]
   */
  constructor(message, details = {}) {
    super(message);
    this.name = "HttpError";
    this.status = details.status ?? null;
    this.retryable = details.retryable ?? false;
    this.body = details.body ?? null;
    this.url = details.url ?? null;
  }
}

/** Reads Retry-After (seconds or HTTP-date); returns seconds, or null. */
function parseRetryAfter(headerValue, now = Date.now()) {
  if (!headerValue) return null;
  const asNumber = Number(headerValue);
  if (Number.isFinite(asNumber) && asNumber >= 0) return asNumber;

  const asDate = Date.parse(headerValue);
  if (Number.isNaN(asDate)) return null;
  return Math.max(0, (asDate - now) / 1000);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches a URL as JSON with retries.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {Record<string,string>} [options.headers]
 * @param {number} [options.timeoutMs]
 * @param {number} [options.retries] Total attempts, including the first.
 * @param {number} [options.retryBaseMs]
 * @param {typeof fetch} [options.fetchImpl] Injected in tests.
 * @param {() => number} [options.random] Injected in tests for deterministic jitter.
 * @returns {Promise<{data: unknown, status: number, fetchedAt: string, headers: Record<string,string>}>}
 */
async function fetchJson(url, options = {}) {
  const {
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = 3,
    retryBaseMs = 500,
    fetchImpl = globalThis.fetch,
    random = Math.random,
  } = options;

  if (typeof fetchImpl !== "function") {
    throw new HttpError("No fetch implementation available (Node 18+ required)", { url });
  }

  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        headers: { accept: "application/json", ...headers },
        signal: controller.signal,
        redirect: "follow",
      });

      const text = await response.text();
      const responseHeaders = {};
      response.headers?.forEach?.((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      if (!response.ok) {
        const retryAfter = parseRetryAfter(responseHeaders["retry-after"]);
        const error = new HttpError(
          `HTTP ${response.status} ${response.statusText || ""}`.trim(),
          {
            status: response.status,
            retryable: RETRYABLE_STATUS.has(response.status),
            body: text.slice(0, 500),
            url,
          },
        );
        if (retryAfter !== null) error.retryAfterSeconds = retryAfter;

        if (!error.retryable || attempt === retries) throw error;
        lastError = error;

        const backoff = retryAfter !== null
          ? Math.min(retryAfter * 1000, 30_000)
          : retryBaseMs * 2 ** (attempt - 1) * (0.5 + random());

        log.warn(
          `${error.status} from ${url} — retry ${attempt}/${retries} in ${Math.round(backoff)}ms`,
        );
        await sleep(backoff);
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // A 200 with a non-JSON body is a real failure, never a silent empty.
        throw new HttpError("Response body was not valid JSON", {
          status: response.status,
          retryable: false,
          body: text.slice(0, 500),
          url,
        });
      }

      return { data, status: response.status, fetchedAt: new Date().toISOString(), headers: responseHeaders };
    } catch (error) {
      if (error instanceof HttpError) throw error;

      // AbortError and transport failures are retryable.
      const wrapped = new HttpError(
        error?.name === "AbortError" ? `Timed out after ${timeoutMs}ms` : String(error?.message || error),
        { retryable: true, url },
      );

      if (attempt === retries) throw wrapped;
      lastError = wrapped;

      const backoff = retryBaseMs * 2 ** (attempt - 1) * (0.5 + random());
      log.warn(`${wrapped.message} — retry ${attempt}/${retries} in ${Math.round(backoff)}ms`);
      await sleep(backoff);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new HttpError(`Failed to fetch ${url}`, { url });
}

module.exports = { fetchJson, HttpError, parseRetryAfter, DEFAULT_TIMEOUT_MS, RETRYABLE_STATUS };