import {
  ArrowRight,
  Boxes,
  Database,
  FileCode2,
  GitCompare,
  Github,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { catalog, facets } from '../lib/catalog';
import { formatCount, formatIsoDate } from '../lib/format';
import { Callout } from '../components/ui/Callout';

const FEATURES = [
  {
    icon: Search,
    title: 'Client-side search',
    body: 'Full-text matching across names, providers, categories and every README column. Filtering and sorting run entirely in your browser — no requests, no tracking.',
  },
  {
    icon: Boxes,
    title: 'Verified listings only',
    body: 'Each entry is parsed from a README table at build time. Where the repository does not state a value, the field is left out rather than guessed.',
  },
  {
    icon: GitCompare,
    title: 'Side-by-side comparison',
    body: 'Select up to four listings and compare provider, context window, published pricing and any shared README columns in one table.',
  },
  {
    icon: RefreshCw,
    title: 'Rebuilt on every change',
    body: 'GitHub Actions parses the README on each push and redeploys GitHub Pages. The published site always matches the repository.',
  },
];

const KINDS = [
  { icon: Zap, label: 'Models', key: 'model' as const },
  { icon: Boxes, label: 'APIs', key: 'api' as const },
  { icon: FileCode2, label: 'Tools', key: 'tool' as const },
  { icon: Database, label: 'Databases', key: 'database' as const },
];

export function HomePage() {
  const { stats, source } = catalog;
  const topProviders = facets.providers
    .filter((provider) => provider.value !== 'Unspecified')
    .slice(0, 12);

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="eyebrow">
            <ShieldCheck size={13} aria-hidden="true" />
            Generated from the repository README
          </p>
          <h1 className="hero__title">
            Every AI API and model the community has catalogued — searchable.
          </h1>
          <p className="hero__subtitle">
            Fluxenite AI Hub turns the <code>FluxeniteMC/Ai-hub</code> README into a fast,
            filterable catalog. {formatCount(stats.entryCount)} listings across{' '}
            {facets.sections.length} sections, refreshed automatically on every repository update.
          </p>

          <div className="hero__actions">
            <Link className="button button--primary" to="/explore">
              <Search size={16} aria-hidden="true" />
              Explore the catalog
            </Link>
            <a
              className="button"
              href={source.repository}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} aria-hidden="true" />
              View repository
            </a>
          </div>

          <dl className="stat-grid hero__stats">
            <div className="panel stat">
              <dt className="stat__label">Listings</dt>
              <dd className="stat__value">{formatCount(stats.entryCount)}</dd>
            </div>
            <div className="panel stat">
              <dt className="stat__label">README tables parsed</dt>
              <dd className="stat__value">{stats.tableCount}</dd>
            </div>
            <div className="panel stat">
              <dt className="stat__label">Providers</dt>
              <dd className="stat__value">{formatCount(facets.providers.length - 1)}</dd>
            </div>
            <div className="panel stat">
              <dt className="stat__label">With free tier</dt>
              <dd className="stat__value">{formatCount(facets.freeCount)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">What this site does</h2>
            <p className="section__description">
              A thin, trustworthy presentation layer over the repository. No backend, no API keys,
              no invented metadata.
            </p>
          </div>

          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="panel panel--padded feature-card">
                <span className="feature-card__icon" aria-hidden="true">
                  <feature.icon size={18} />
                </span>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__body">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Browse by type</h2>
            <p className="section__description">
              Listings are grouped by the shape of the README table they came from.
            </p>
          </div>

          <div className="kind-grid">
            {KINDS.map((kind) => {
              const count = facets.kinds.find((item) => item.value === kind.key)?.count ?? 0;
              return (
                <Link
                  key={kind.key}
                  className="panel kind-card"
                  to={`/explore?kind=${kind.key}`}
                >
                  <span className="kind-card__icon" aria-hidden="true">
                    <kind.icon size={18} />
                  </span>
                  <span className="kind-card__label">{kind.label}</span>
                  <span className="kind-card__count mono">{formatCount(count)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__header">
            <h2 className="section__title">Most catalogued providers</h2>
            <p className="section__description">
              Providers appearing across the most README tables. Full filtering is available in the{' '}
              <Link to="/explore">explorer</Link>.
            </p>
          </div>

          <ul className="provider-cloud">
            {topProviders.map((provider) => (
              <li key={provider.value}>
                <Link className="panel provider-pill" to={`/explore?provider=${encodeURIComponent(provider.value)}`}>
                  {provider.value}
                  <span className="provider-pill__count mono">{provider.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-cta panel panel--padded">
            <div>
              <h2 className="section__title">Built from the source, always</h2>
              <p className="section__description">
                This catalog was generated on {formatIsoDate(catalog.generatedAt)} from{' '}
                <code>README.md</code>
                {source.readmeUpdated ? ` (last self-update ${source.readmeUpdated})` : ''}.
                {source.reportedListingCount
                  ? ` The repository reports ${formatCount(source.reportedListingCount)} API listings.`
                  : ''}
              </p>
            </div>
            <div className="home-cta__actions">
              <Link className="button button--primary" to="/docs">
                How this works
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link className="button" to="/updates">
                Repository updates
              </Link>
            </div>
          </div>

          <Callout
            tone="warning"
            icon={<ShieldCheck size={16} />}
            title="Accuracy notice"
            className="home-notice"
          >
            The upstream catalog is edited automatically and its pricing figures are community
            maintained. The most recent commit in this repository deliberately removed several model
            entries as unverified. This site reproduces whatever the README currently contains and
            never fills gaps with assumed values — verify pricing on official vendor pages before
            budgeting.
          </Callout>
        </div>
      </section>
    </>
  );
}