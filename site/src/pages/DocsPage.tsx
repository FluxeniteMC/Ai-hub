import { BookOpen, ExternalLink, FileCode2, Github, Info, Scale, Workflow } from 'lucide-react';

import { Callout } from '../components/ui/Callout';
import { catalog } from '../lib/catalog';
import { formatIsoDate, formatRelativeTime } from '../lib/format';

const REPO_URL = catalog.source.repository;

const PIPELINE = [
  {
    icon: Github,
    title: 'Repository changes',
    body: 'The README is the authoritative source. It is edited by maintainers and refreshed daily by the project’s own automation.',
  },
  {
    icon: FileCode2,
    title: 'Build-time parse',
    body: 'site/scripts/generate-data.mjs runs before every build. The parser walks the markdown, collects catalog tables, and normalises each row.',
  },
  {
    icon: Scale,
    title: 'Validate',
    body: 'Every generated entry is checked for id uniqueness, slug safety, absolute URLs and finite numeric fields. A failure fails the build.',
  },
  {
    icon: Workflow,
    title: 'Build & deploy',
    body: 'Vite produces a static bundle containing the catalog inline. GitHub Actions uploads it to GitHub Pages.',
  },
];

export function DocsPage() {
  const { source, stats } = catalog;

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <BookOpen size={13} aria-hidden="true" />
            Documentation
          </p>
          <h1 className="page-header__title">How this site works</h1>
          <p className="page-header__subtitle">
            Fluxenite AI Hub is a static, read-only view of the community-maintained AI directory.
            This page documents where every value on the site comes from.
          </p>
        </div>
      </header>

      <section className="section" id="provenance">
        <div className="section__header">
          <h2 className="section__title">Data provenance</h2>
        </div>

        <div className="panel panel--padded doc-table-wrap">
          <dl className="fact-list">
            <div className="fact-list__row">
              <dt>Source of truth</dt>
              <dd>
                <a href={`${REPO_URL}/blob/main/README.md`} target="_blank" rel="noopener noreferrer">
                  README.md <ExternalLink size={12} aria-hidden="true" />
                </a>
              </dd>
            </div>
            <div className="fact-list__row">
              <dt>Catalog generated</dt>
              <dd>
                {formatIsoDate(catalog.generatedAt)}{' '}
                <span className="doc-muted">({formatRelativeTime(catalog.generatedAt)})</span>
              </dd>
            </div>
            <div className="fact-list__row">
              <dt>Content fingerprint</dt>
              <dd className="mono">{source.fingerprint}</dd>
            </div>
            <div className="fact-list__row">
              <dt>README tables parsed</dt>
              <dd>{stats.tableCount}</dd>
            </div>
            <div className="fact-list__row">
              <dt>Table rows read</dt>
              <dd>{stats.occurrenceCount}</dd>
            </div>
            <div className="fact-list__row">
              <dt>Unique listings</dt>
              <dd>
                {stats.entryCount}{' '}
                <span className="doc-muted">
                  ({stats.duplicateCount} repeated rows merged)
                </span>
              </dd>
            </div>
            {source.directoryVersion ? (
              <div className="fact-list__row">
                <dt>Directory version</dt>
                <dd>v{source.directoryVersion}</dd>
              </div>
            ) : null}
            {source.reportedListingCount ? (
              <div className="fact-list__row">
                <dt>README-reported listing count</dt>
                <dd>
                  {source.reportedListingCount}{' '}
                  <span className="doc-muted">
                    (from <code>data/stats.json</code>)
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <Callout icon={<Info size={16} />} className="doc-callout">
          Nothing on this site is fetched from GitHub at runtime. The catalog is parsed during the
          build and bundled into the JavaScript, so pages load instantly and work offline.
        </Callout>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Build pipeline</h2>
          <p className="section__description">
            Four steps run on every push that can affect the catalog.
          </p>
        </div>

        <ol className="pipeline">
          {PIPELINE.map((step, index) => (
            <li key={step.title} className="panel panel--padded pipeline__step">
              <span className="pipeline__index mono">{String(index + 1).padStart(2, '0')}</span>
              <step.icon size={18} className="pipeline__icon" aria-hidden="true" />
              <h3 className="pipeline__title">{step.title}</h3>
              <p className="pipeline__body">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Data rules</h2>
          <p className="section__description">
            Rules the build follows so the catalog stays trustworthy.
          </p>
        </div>

        <div className="panel panel--padded">
          <ul className="doc-list">
            <li>
              <strong>Nothing is invented.</strong> Fields the README does not state are left empty
              and rendered as “Not stated”.
            </li>
            <li>
              <strong>No inferred pricing.</strong> Input and output rates are only parsed when the
              source states a matching pair (for example <code>$6.00/$30.00 per 1M</code>). A value
              like <code>$15/1M image tokens</code> is kept as text, never split into two rates.
            </li>
            <li>
              <strong>Duplicates merge, they do not multiply.</strong> The same listing appearing in
              several tables becomes one entry with multiple sources, which keeps identifiers stable
              and search results honest.
            </li>
            <li>
              <strong>Unstable data is dropped.</strong> Rows from non-catalog tables (changelog,
              workflow docs, contribution guides) are excluded by section, and placeholder rows are
              skipped.
            </li>
            <li>
              <strong>Content inside code fences is ignored</strong> so documentation examples can
              never leak into the catalog.
            </li>
            <li>
              <strong>Builds fail loudly.</strong> Duplicate identifiers, malformed ids, or
              non-absolute URLs stop the deployment rather than shipping a broken catalog.
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Running it locally</h2>
        </div>

        <div className="panel panel--padded">
          <pre className="code-block">
            <code>{`cd site
npm ci
npm run dev      # generates the catalog, then starts Vite
npm run build    # generates, type-checks and builds
npm test         # parser and validation unit tests`}</code>
          </pre>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Repository links</h2>
        </div>

        <ul className="link-grid">
          <li>
            <a className="panel panel--padded link-card" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Github size={18} aria-hidden="true" />
              <span>
                <strong>FluxeniteMC/Ai-hub</strong>
                <span className="link-card__meta">Repository home</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              className="panel panel--padded link-card"
              href={`${REPO_URL}/blob/main/README.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen size={18} aria-hidden="true" />
              <span>
                <strong>README.md</strong>
                <span className="link-card__meta">Authoritative catalog</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              className="panel panel--padded link-card"
              href={`${REPO_URL}/tree/main/data`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileCode2 size={18} aria-hidden="true" />
              <span>
                <strong>data/</strong>
                <span className="link-card__meta">Automation data files</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              className="panel panel--padded link-card"
              href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Workflow size={18} aria-hidden="true" />
              <span>
                <strong>CONTRIBUTING.md</strong>
                <span className="link-card__meta">How to add or correct a listing</span>
              </span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}