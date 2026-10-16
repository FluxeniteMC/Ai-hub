import { Copy, ExternalLink, Filter, KeyRound, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  DEFAULT_MODEL_FILTERS,
  MODEL_SORT_OPTIONS,
  activeModelFilterCount,
  applyModelFilters,
  countWithoutQuery,
  formatPrice,
  hasStatedPrice,
  modelDataset,
  priceFor,
  providersFor,
  scopeSource,
} from '../lib/models';
import type { ModelFilters } from '../lib/models';
import { PROVIDER_LABELS, PROVIDER_ORDER, buildRequestExample } from '../lib/providerClients';
import type { ProviderId } from '../lib/providerClients';
import { CAPABILITY_LABELS } from '../lib/models';

import { Badge } from '../components/ui/Badge';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';

const PAGE_SIZE = 24;

export function ModelsPage() {
  useDocumentMeta(
    'AI Model Catalog',
    'Search the AI model catalog by name, alias, vendor or exact model ID. Verified pricing and the exact request for each provider API, generated from data/models.json.',
  );

  const [filters, setFilters] = useState<ModelFilters>(DEFAULT_MODEL_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  /** Which provider's exact id + price to show on a card. */
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);

  const source = useMemo(() => scopeSource(filters), [filters]);
  const matched = useMemo(() => applyModelFilters(source, filters), [source, filters]);
  const shown = matched.slice(0, visible);
  const facetCount = countWithoutQuery(source, filters);
  const activeCount = activeModelFilterCount(filters);
  const [copied, setCopied] = useState<string | null>(null);

  // Facet counts follow the active scope, otherwise switching scope leaves the
  // dropdowns advertising totals that no longer match what is listed.
  const scoped = useMemo(
    () => ({
      providers: PROVIDER_ORDER.map((provider) => ({
        id: provider,
        label: PROVIDER_LABELS[provider],
        count: source.filter((model) => model.providers.includes(provider)).length,
      })),
      capabilities: (() => {
        const counts = new Map<string, number>();
        for (const model of source) {
          for (const capability of model.capabilities) {
            counts.set(capability, (counts.get(capability) ?? 0) + 1);
          }
        }
        return [...counts.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([value, count]) => ({ value, count }));
      })(),
      verified: source.filter((model) => model.availability === 'verified').length,
      unverified: source.filter((model) => model.availability === 'readme-only').length,
    }),
    [source],
  );

  const patch = (next: Partial<ModelFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setVisible(PAGE_SIZE);
  };

  const reset = () => {
    setFilters(DEFAULT_MODEL_FILTERS);
    setVisible(PAGE_SIZE);
  };

  const copyExample = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard is unavailable (insecure context, denied permission). The
      // example is still on screen and selectable, so this is not an error.
    }
  };

  if (!modelDataset.available) {
    return (
      <div className="container">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              <ShieldCheck size={13} aria-hidden="true" />
              Verified catalog
            </p>
            <h1 className="page-header__title">Model catalog</h1>
            <p className="page-header__subtitle">
              Built from live provider APIs rather than prose.
            </p>
          </div>
        </header>
        <EmptyState
          icon={<RefreshCw size={20} aria-hidden="true" />}
          title="No provider catalog generated yet"
          description={modelDataset.reason ?? 'Run the catalog refresh to populate this page.'}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <ShieldCheck size={13} aria-hidden="true" />
            README catalog
          </p>
          <h1 className="page-header__title">AI model catalog</h1>
          <p className="page-header__subtitle">
            Every AI API, model and tool listed in this project&rsquo;s <code>README.md</code> —{' '}
            {modelDataset.stats.readmeListingCount.toLocaleString()} listings, generated at build
            time into <code>data/models.json</code>. The browser reads only that file and never
            calls a provider. A price the README does not state shows as “Not stated”; it is never
            shown as zero.
          </p>
        </div>
      </header>

      <dl className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat">
          <dt className="stat__label">README listings</dt>
          <dd className="stat__value">{modelDataset.stats.readmeListingCount.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">With stated price</dt>
          <dd className="stat__value">{modelDataset.stats.withPricing.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">Provider-confirmed</dt>
          <dd className="stat__value">
            {(modelDataset.stats.directoryCount - modelDataset.stats.readmeOnly).toLocaleString()}
          </dd>
        </div>
        <div className="stat">
          <dt className="stat__label">Needs review</dt>
          <dd className="stat__value">{modelDataset.stats.needsReview.toLocaleString()}</dd>
        </div>
      </dl>

      <div className="models-toolbar">
        <SearchInput
          value={filters.query}
          onChange={(value) => patch({ query: value })}
          label="Search models"
          placeholder="Name, alias, vendor or exact model id — try “gpt-4o-mini”"
        />

        <Select
          value={filters.provider ?? 'all'}
          onChange={(value) => patch({ provider: value === 'all' ? null : (value as ProviderId) })}
          label="Provider"
          options={[
            { value: 'all', label: 'All providers', hint: source.length },
            ...scoped.providers.map((p) => ({
              value: p.id,
              label: p.label,
              hint: p.count,
            })),
          ]}
        />

        <Select
          value={filters.capability ?? 'all'}
          onChange={(value) => patch({ capability: value === 'all' ? null : value })}
          label="Capability"
          options={[
            { value: 'all', label: 'Any capability', hint: source.length },
            ...scoped.capabilities.map((c) => ({
              value: c.value,
              label: CAPABILITY_LABELS[c.value] ?? c.value,
              hint: c.count,
            })),
          ]}
        />

        <Select
          value={filters.availability}
          onChange={(value) =>
            patch({ availability: value as ModelFilters['availability'] })
          }
          label="Availability"
          options={[
            { value: 'all', label: 'Any', hint: source.length },
            {
              value: 'verified',
              label: 'Provider-confirmed',
              hint: scoped.verified,
            },
            {
              value: 'readme-only',
              label: 'Not provider-confirmed',
              hint: scoped.unverified,
            },
          ]}
        />

        <Select
          value={filters.scope}
          onChange={(value) => patch({ scope: value as ModelFilters['scope'] })}
          label="Show"
          options={[
            {
              value: 'directory',
              label: 'README listings',
              hint: modelDataset.stats.directoryCount,
            },
            {
              value: 'provider-only',
              label: 'Raw provider listings',
              hint: modelDataset.stats.providerOnlyCount,
            },
            { value: 'all', label: 'Everything', hint: modelDataset.stats.total },
          ]}
        />

        <Select
          value={filters.sort}
          onChange={(value) => patch({ sort: value as ModelFilters['sort'] })}
          label="Sort by"
          options={MODEL_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      </div>

      <div className="explore__status">
        <span>
          <strong>{matched.length.toLocaleString()}</strong>
          {matched.length === 1 ? ' model' : ' models'} shown
        </span>
        {activeCount > 0 ? (
          <button type="button" className="button button--sm button--ghost" onClick={reset}>
            <Filter size={13} aria-hidden="true" />
            Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
          </button>
        ) : (
          <span className="explore__status-note">
            {facetCount.toLocaleString()} models before searching
          </span>
        )}
      </div>

      {matched.length === 0 ? (
        <EmptyState
          icon={<Filter size={20} aria-hidden="true" />}
          title="No models match these filters"
          description="Try a broader search term, or widen the provider and capability filters."
          actions={
            <button type="button" className="button button--primary" onClick={reset}>
              Clear all filters
            </button>
          }
        />
      ) : (
        <>
          <div className="model-grid">
            {shown.map((model) => {
              const providers = providersFor(model);
              const active: ProviderId | null =
                selectedProvider && providers.includes(selectedProvider) ? selectedProvider : providers[0] ?? null;
              const price = priceFor(model, active);
              const exactId = active ? model.modelIds[active] : null;
              const example = exactId && active ? buildRequestExample(active, exactId) : null;

              return (
                <article className="model-card" key={model.id}>
                  <header className="model-card__header">
                    <h2 className="model-card__name">{model.name}</h2>
                    {model.availability === 'verified' ? (
                      <Badge tone="positive" title="Confirmed by a live provider API">
                        <ShieldCheck size={11} aria-hidden="true" /> Verified
                      </Badge>
                    ) : (
                      <Badge tone="muted" title="Catalogued from the README; no provider confirmation">
                        README only
                      </Badge>
                    )}
                  </header>

                  {providers.length > 1 ? (
                    <div className="model-card__providers" role="group" aria-label={`Provider for ${model.name}`}>
                      {providers.map((provider) => (
                        <button
                          key={provider}
                          type="button"
                          className={`chip${active === provider ? ' chip--on' : ''}`}
                          aria-pressed={active === provider}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          {PROVIDER_LABELS[provider]}
                        </button>
                      ))}
                    </div>
                  ) : active ? (
                    <p className="model-card__provider">{PROVIDER_LABELS[active]}</p>
                  ) : null}

                  {exactId ? (
                    <p className="model-card__id mono" title={`Exact model id for ${PROVIDER_LABELS[active!]}`}>
                      {exactId}
                    </p>
                  ) : null}

                  {model.description ? (
                    <p className="model-card__description">{model.description}</p>
                  ) : null}

                  <dl className="model-card__facts">
                    <div>
                      <dt>Input / 1M</dt>
                      <dd>{hasStatedPrice(price) ? (formatPrice(price.inputPerMTokens) ?? 'Not stated') : 'Not stated'}</dd>
                    </div>
                    <div>
                      <dt>Output / 1M</dt>
                      <dd>{hasStatedPrice(price) ? (formatPrice(price.outputPerMTokens) ?? 'Not stated') : 'Not stated'}</dd>
                    </div>
                    <div>
                      <dt>Context</dt>
                      <dd>
                        {model.contextWindow === null
                          ? 'Not stated'
                          : model.contextWindow >= 1_000_000
                            ? `${(model.contextWindow / 1_000_000).toFixed(model.contextWindow % 1_000_000 === 0 ? 0 : 1)}M`
                            : `${Math.round(model.contextWindow / 1000)}K`}
                      </dd>
                    </div>
                  </dl>

                  {price.raw ? (
                    <p
                      className="model-card__raw"
                      title="Reproduced exactly as the source stated it; not a parsed price."
                    >
                      <span className="model-card__raw-label">Listed as</span>{' '}
                      <span className="mono">{price.raw}</span>
                    </p>
                  ) : null}

                  {model.capabilities.length > 0 ? (
                    <ul className="model-card__tags">
                      {model.capabilities.map((capability) => (
                        <li key={capability}>
                          <Badge tone="muted">{CAPABILITY_LABELS[capability] ?? capability}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {example ? (
                    <details className="model-card__request">
                      <summary>How to call this on {example.label}</summary>
                      <p className="model-card__request-meta">
                        {example.requiresKey ? (
                          <>
                            <KeyRound size={12} aria-hidden="true" /> Requires an API key from{' '}
                            <a href={example.keySource} target="_blank" rel="noopener noreferrer">
                              {example.keySource}
                              <ExternalLink size={10} aria-hidden="true" />
                            </a>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={12} aria-hidden="true" /> Runs without credentials
                          </>
                        )}
                      </p>
                      <pre className="code-block">
                        <code>{`POST ${example.url}\nmodel: ${example.modelId}\n\n${example.body}`}</code>
                      </pre>
                      <button
                        type="button"
                        className="button button--sm"
                        onClick={() =>
                          copyExample(
                            model.id,
                            `curl ${example.url} -X POST -H "Content-Type: application/json"${
                              example.requiresKey
                                ? ' -H "Authorization: Bearer $YOUR_API_KEY"'
                                : ''
                            } -d '${example.body.replace(/'/g, `'\\''`)}'`,
                          )
                        }
                      >
                        <Copy size={13} aria-hidden="true" />
                        {copied === model.id ? 'Copied' : 'Copy curl command'}
                      </button>
                    </details>
                  ) : null}

                  {model.needsReview ? (
                    <p className="model-card__review">
                      <TriangleAlert size={12} aria-hidden="true" />
                      Not confirmed against a provider
                      {model.candidates.length > 0 ? (
                        <> — possibly {model.candidates.map((c) => c.name).join(', ')}</>
                      ) : null}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>

          {visible < matched.length ? (
            <div className="explore__more">
              <span className="explore__more-count">
                Showing {shown.length.toLocaleString()} of {matched.length.toLocaleString()}
              </span>
              <button
                type="button"
                className="button"
                onClick={() => setVisible((current) => current + PAGE_SIZE)}
              >
                Show {Math.min(PAGE_SIZE, matched.length - visible).toLocaleString()} more
              </button>
            </div>
          ) : null}
        </>
      )}

      {modelDataset.reviewQueue.length > 0 ? (
        <Callout icon={<TriangleAlert size={16} />} className="legal-note">
          <div>
            <p className="callout__title">
              {modelDataset.reviewQueue.length} entries are not yet confirmed
            </p>
            <p>
              These README entries could not be matched to a provider model by identity, so they are
              listed separately rather than merged on a guess. Versions, quantisations, fine-tunes
              and variants are never merged automatically — a human resolves them in the catalog pull
              request.
            </p>
          </div>
        </Callout>
      ) : null}

      <Callout icon={<ShieldCheck size={16} />} className="legal-note">
        <div>
          <p className="callout__title">Where this data comes from</p>
          <p>
            The catalog is generated from <code>README.md</code> by <code>convert.py</code> at
            build time and bundled into <code>data/models.json</code>. The browser reads only that
            file — it never calls a provider, and no credential is shipped here.{' '}
            {modelDataset.stats.merged.toLocaleString()} entries are additionally confirmed against
            the OpenRouter and Groq model APIs, which is where their exact provider ids and live
            prices come from.{' '}
            {modelDataset.stats.providerOnlyCount.toLocaleString()} raw provider listings are held
            back under <strong>Show&nbsp;→&nbsp;Raw provider listings</strong> so they don&rsquo;t
            bury the README catalog. Pricing and availability change constantly — confirm on the
            provider&rsquo;s own documentation before committing money.
          </p>
        </div>
      </Callout>
    </div>
  );
}