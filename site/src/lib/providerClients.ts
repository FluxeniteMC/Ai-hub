/**
 * Provider request contracts.
 *
 * This module is the ONLY place in the frontend that knows how to talk to a
 * provider. Keeping it in one file is what stops endpoint, model-id and auth
 * handling from being duplicated across components.
 *
 * ── Security ──────────────────────────────────────────────────────────────
 *
 * This file describes requests; it never makes them, and it never contains a
 * credential.
 *
 *   - OpenRouter's chat endpoint works unauthenticated from a browser, so a
 *     request shape can be shown and copied verbatim.
 *   - Groq REQUIRES an `Authorization: Bearer` header. A key must never be
 *     embedded in a bundle that ships to every visitor, so Groq's example is
 *     emitted with an obvious placeholder and an explanation, not a working
 *     call. The site tells the user where to get a key and what to paste.
 *
 * The exact model ids come from the provider catalogs at build time and are
 * passed in. Nothing here guesses or constructs an id.
 */

export type ProviderId = 'openrouter' | 'groq';

export interface ProviderContract {
  id: ProviderId;
  label: string;
  docsUrl: string;
  accountUrl: string;
  /** Endpoint a chat completion is sent to. */
  chatEndpoint: string;
  /** Model-list endpoint this site reads at build time. */
  catalogEndpoint: string;
  auth: {
    required: boolean;
    /** Header the key goes in, or null when none is needed. */
    header: string | null;
    /** Where a browser can legitimately obtain the key. */
    where: string;
    note: string;
  };
  supportsStreaming: boolean;
  /** Extra headers a good citizen should send (attribution). */
  attributionHeaders?: Record<string, string>;
}

export const PROVIDER_CONTRACTS: Record<ProviderId, ProviderContract> = {
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    docsUrl: 'https://openrouter.ai/docs/quickstart',
    accountUrl: 'https://openrouter.ai/keys',
    chatEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
    catalogEndpoint: 'https://openrouter.ai/api/v1/models',
    auth: {
      required: false,
      header: null,
      where: 'Optional. https://openrouter.ai/keys',
      note: 'Works without a key for public models. A key raises rate limits and is tied to your account.',
    },
    supportsStreaming: true,
    attributionHeaders: {
      'HTTP-Referer': 'https://fluxenitemc.github.io/Ai-hub',
      'X-Title': 'Fluxenite AI Hub',
    },
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    docsUrl: 'https://console.groq.com/docs/quickstart',
    accountUrl: 'https://console.groq.com/keys',
    chatEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    catalogEndpoint: 'https://api.groq.com/openai/v1/models',
    auth: {
      required: true,
      header: 'Authorization: Bearer',
      where: 'https://console.groq.com/keys',
      note: 'A key is required. This site never ships one: a key in a public bundle would be readable by every visitor.',
    },
    supportsStreaming: true,
  },
};

export interface RequestExample {
  provider: ProviderId;
  label: string;
  /** The exact id to send, taken from the catalog. Never reconstructed. */
  modelId: string;
  method: 'POST';
  url: string;
  /** Headers to send. Groq carries a placeholder, never a real key. */
  headers: Record<string, string>;
  /** Request body as a JSON string, ready to paste. */
  body: string;
  requiresKey: boolean;
  keySource: string;
  /** True when the example is safe to run as-is with no credentials. */
  runnableWithoutCredentials: boolean;
  docsUrl: string;
  notes: string[];
}

/**
 * Builds a copy-pasteable request for one model on one provider.
 *
 * @param provider  which provider to address
 * @param modelId   the EXACT id from the catalog, e.g. "openai/gpt-4o-mini"
 */
export function buildRequestExample(provider: ProviderId, modelId: string, prompt = 'Hello'): RequestExample {
  const contract = PROVIDER_CONTRACTS[provider];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(contract.attributionHeaders ?? {}),
  };

  const notes: string[] = [];

  if (contract.auth.required) {
    // Deliberately a placeholder, never a value.
    headers[contract.auth.header ?? 'Authorization'] = 'Bearer YOUR_API_KEY';
    notes.push(`${contract.label} requires an API key: ${contract.auth.where}`);
    notes.push(contract.auth.note);
  } else {
    notes.push(`${contract.label} needs no key for public models.`);
  }

  notes.push(`Send the model id exactly as shown: "${modelId}".`);
  notes.push('Pricing and context on this page are snapshots and change constantly — confirm on the provider.');

  return {
    provider,
    label: contract.label,
    modelId,
    method: 'POST',
    url: contract.chatEndpoint,
    headers,
    body: JSON.stringify(
      { model: modelId, messages: [{ role: 'user', content: prompt }] },
      null,
      2,
    ),
    requiresKey: contract.auth.required,
    keySource: contract.auth.where,
    runnableWithoutCredentials: !contract.auth.required,
    docsUrl: contract.docsUrl,
    notes,
  };
}

/** Formats a request example as a shell one-liner with curl. */
export function asCurl(example: RequestExample): string {
  const headerArgs = Object.entries(example.headers)
    .map(([key, value]) => `-H ${JSON.stringify(`${key}: ${value}`)}`)
    .join(' ');

  return [
    `curl ${example.url} \\`,
    `  -X POST \\`,
    `  ${headerArgs} \\`,
    `  -d '${example.body.replace(/'/g, `'\\''`)}'`,
  ].join('\n');
}

export const PROVIDER_ORDER: ProviderId[] = ['openrouter', 'groq'];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  openrouter: 'OpenRouter',
  groq: 'Groq',
};