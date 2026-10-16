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
  modelFacets,
  models,
  priceFor,
  providersFor,
} from '../lib/models';
import type { ModelFilters } from '../lib/models';
import { PROVIDER_LABELS, buildRequestExample } from '../lib/providerClients';
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
    'Verified Model Catalog',
    'Search 900+ AI models by name, alias, provider or exact model ID. Filter by provider and capability, compare verified pricing, and get the exact request for each provider API.',
  );

  const [filters, setFilters] = useState<ModelFilters>(DEFAULT_MODEL_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);
  /** Which provider's exact id + price to show on a card. */
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(null);

  const matched = useMemo(() => applyModelFilters(models, filters), [filters]);
  const shown = matched.slice(0, visible);
  const facetCount = countWithoutQuery(models, filters);
  const activeCount = activeModelFilterCount(filters);
  const [copied, setCopied] = useState<string | null>(null);

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
            Verified catalog
          </p>
          <h1 className="page-header__title">Machine-verified models</h1>
          <p className="page-header__subtitle">
            {modelDataset.stats.total.toLocaleString()} models built from live provider APIs — exact
            model ids, stated pricing, and nothing filled in. A price that is not stated shows as
            “Not stated”; it is never shown as zero.
          </p>
        </div>
      </header>

      <dl className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat">
          <dt className="stat__label">Models</dt>
          <dd className="stat__value">{modelDataset.stats.total.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">With stated price</dt>
          <dd className="stat__value">{modelDataset.stats.withPricing.toLocaleString()}</dd>
        </div>
        <div className="stat">
          <dt className="stat__label">Provider-backed</dt>
          <dd className="stat__value">
            {(modelDataset.stats.total - modelDataset.stats.readmeOnly).toLocaleString()}
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
            { value: 'all', label: 'All providers', hint: models.length },
            ...modelFacets.providers.map((p) => ({
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
            { value: 'all', label: 'Any capability', hint: models.length },
            ...modelFacets.capabilities.map((c) => ({
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
            { value: 'all', label: 'Any', hint: models.length },
            {
              value: 'verified',
              label: 'Provider-confirmed',
              hint: modelDataset.stats.total - modelDataset.stats.readmeOnly,
            },
            { value: 'readme-only', label: 'README only', hint: modelDataset.stats.readmeOnly },
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

                  {price.raw ? <p className="model-card__raw mono">{price.raw}</p> : null}

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
            Built at build time from the OpenRouter and Groq model APIs plus the repository README.
            Pricing and availability change constantly — always confirm on the provider&rsquo;s own
            documentation before you commit money. No credentials are shipped to this page: Groq
            requires a key and you supply your own.
          </p>
        </div>
      </Callout>
    </div>
  );
}