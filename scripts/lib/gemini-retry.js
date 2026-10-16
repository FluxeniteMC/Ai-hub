/**
 * Shared retry helper for Gemini API calls.
 *
 * The Gemini API returns 503 UNAVAILABLE ("high demand") under load, and 429
 * when a quota window is exceeded. Both are transient and both were failing the
 * whole daily job: the report workflow died on a 503 that a retry fifteen
 * seconds later would have answered.
 *
 * Only genuinely transient conditions are retried. A 400 or 401 means the
 * request or the key is wrong, and retrying it just wastes quota and delays the
 * real error.
 */

const RETRYABLE_CODES = new Set([429, 500, 502, 503, 504]);

/** Delays before attempts 2..4. The first attempt is immediate. */
const DELAYS_MS = [0, 2000, 5000, 12000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Dig a numeric status out of an SDK error.
 *
 * The SDK surfaces this in several shapes depending on whether the failure came
 * from the transport or from the API's own error envelope, so check each.
 *
 * @returns {number|null}
 */
function statusOf(error) {
  if (!error || typeof error !== "object") return null;
  const candidates = [
    error.status,
    error.code,
    error.error?.status,
    error.error?.code,
    error.response?.status,
    error.response?.statusCode,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && RETRYABLE_CODES.has(candidate)) return candidate;
  }
  return null;
}

/** True when the failure is worth trying again. */
function isRetryable(error) {
  if (statusOf(error) !== null) return true;
  // Network-level failures surface without a status at all.
  const message = String(error?.message ?? error ?? "");
  return /fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|network/i.test(message);
}

/**
 * Run `fn`, retrying transient failures with backoff.
 *
 * `fn` receives the 1-based attempt number so callers can log progress.
 * The last error is rethrown once the schedule is exhausted, so the caller
 * still sees the genuine cause rather than a synthetic timeout.
 *
 * @template T
 * @param {(attempt: number) => Promise<T>} fn
 * @param {{ label?: string, delaysMs?: number[] }} [options]
 * @returns {Promise<T>}
 */
async function withRetry(fn, { label = "Gemini call", delaysMs = DELAYS_MS } = {}) {
  let lastError;

  for (let index = 0; index < delaysMs.length; index++) {
    if (delaysMs[index]) await sleep(delaysMs[index]);

    try {
      return await fn(index + 1);
    } catch (error) {
      lastError = error;
      const status = statusOf(error);
      const isLast = index === delaysMs.length - 1;

      if (isLast || !isRetryable(error)) throw error;

      console.warn(
        `⚠️  ${label} failed (${status ?? error?.message ?? "network error"})` +
          ` — retrying in ${delaysMs[index + 1] / 1000}s` +
          ` (attempt ${index + 1}/${delaysMs.length}).`
      );
    }
  }

  throw lastError;
}

/**
 * Call Gemini, falling back through alternative models when one is unavailable.
 *
 * A model returning a sustained 503 is a capacity or rollout problem for that
 * model specifically. Retrying the same name four times does not help — the
 * daily report died this way on `gemini-3-flash-preview`. Moving to the next
 * candidate answers the request instead of losing the run.
 *
 * A non-transient error (a 400 from a malformed prompt, a 401 from a bad key)
 * is rethrown immediately: trying another model would not fix it, and would
 * burn quota doing so.
 *
 * @param {(model: string) => Promise<any>} call receives a model name
 * @param {{ model: string, fallbacks?: string[], label?: string }} options
 * @returns {Promise<{ text: string, model: string }>}
 */
async function generateWithFallback(
  call,
  { model, fallbacks = [], label = "Gemini call", delaysMs }
) {
  const candidates = [model, ...fallbacks].filter(Boolean);
  let lastError;

  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index];
    try {
      const response = await withRetry(() => call(candidate), {
        label: `${label} [${candidate}]`,
        ...(delaysMs ? { delaysMs } : {}),
      });
      if (index > 0) {
        console.log(`✅ ${candidate} accepted the request after ${candidates[index - 1]} failed.`);
      }
      return { text: response?.text, model: candidate };
    } catch (error) {
      lastError = error;
      const isLast = index === candidates.length - 1;
      if (isLast || !isRetryable(error)) throw error;
      console.warn(
        `⚠️  ${label}: model "${candidate}" is unavailable ` +
          `(${statusOf(error) ?? error?.message ?? "network error"}) — trying "${candidates[index + 1]}".`
      );
    }
  }

  throw lastError;
}

/**
 * Default fallback models, overridable with GEMINI_MODEL_FALLBACKS
 * (comma-separated). Ordered most-preferred first.
 */
function fallbackModels() {
  const configured = process.env.GEMINI_MODEL_FALLBACKS;
  const list = (configured ?? "gemini-2.5-flash,gemini-2.0-flash")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  return list;
}

module.exports = {
  withRetry,
  isRetryable,
  statusOf,
  generateWithFallback,
  fallbackModels,
  RETRYABLE_CODES,
  DELAYS_MS,
};