import { CalendarClock, ExternalLink, FileJson, GitCommitVertical } from 'lucide-react';

import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/EmptyState';
import { changelog, catalog } from '../lib/catalog';
import { formatIsoDate, formatRelativeTime } from '../lib/format';

const REPO_URL = catalog.source.repository;

export function UpdatesPage() {
  const { stats, source } = catalog;

  const dataFiles = [
    { file: 'data/stats.json', label: 'Repository statistics' },
    { file: 'data/update-*.json', label: 'Full update run results' },
    { file: 'data/new-apis-*.json', label: 'Newly discovered APIs' },
    { file: 'data/pricing-updates-*.json', label: 'Pricing change logs' },
  ];

  return (
    <div className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            <CalendarClock size={13} aria-hidden="true" />
            Repository activity
          </p>
          <h1 className="page-header__title">Updates</h1>
          <p className="page-header__subtitle">
            The catalog is rebuilt from the README whenever the repository changes. This page shows
            the changelog recorded in the README and where to follow the source data.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Build status</h2>
        </div>

        <div className="panel panel--padded">
          <dl className="fact-list">
            <div className="fact-list__row">
              <dt>Catalog generated</dt>
              <dd>
                {formatIsoDate(catalog.generatedAt)}{' '}
                <span className="doc-muted">({formatRelativeTime(catalog.generatedAt)})</span>
              </dd>
            </div>
            <div className="fact-list__row">
              <dt>README last self-update</dt>
              <dd>{source.readmeUpdated ?? 'Not stated'}</dd>
            </div>
            <div className="fact-list__row">
              <dt>Listings in this build</dt>
              <dd>{stats.entryCount}</dd>
            </div>
            <div className="fact-list__row">
              <dt>Content fingerprint</dt>
              <dd className="mono">{source.fingerprint}</dd>
            </div>
            <div className="fact-list__row">
              <dt>Deployment</dt>
              <dd>
                <a
                  href={`${REPO_URL}/actions`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Actions runs <ExternalLink size={12} aria-hidden="true" />
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Changelog</h2>
          <p className="section__description">
            Reproduced from the README’s changelog table.
          </p>
        </div>

        {changelog.length === 0 ? (
          <div className="panel">
            <EmptyState
              icon={<GitCommitVertical size={22} />}
              title="No changelog entries found"
              description="The README changelog table could not be read at build time."
            />
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Change</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {changelog.map((item) => (
                  <tr key={`${item.date}-${item.change.slice(0, 40)}`}>
                    <td className="mono updates__date">{item.date}</td>
                    <td>{item.change}</td>
                    <td className="is-muted">{item.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Callout icon={<GitCommitVertical size={16} />} className="doc-callout">
          The full commit history, including automated daily updates, lives in the{' '}
          <a href={`${REPO_URL}/commits/main`} target="_blank" rel="noopener noreferrer">
            repository history
          </a>
          .
        </Callout>
      </section>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title">Source data files</h2>
          <p className="section__description">
            Automation artefacts written by the repository’s own workflows.
          </p>
        </div>

        <ul className="link-grid">
          {dataFiles.map((item) => (
            <li key={item.file}>
              <a
                className="panel panel--padded link-card"
                href={`${REPO_URL}/tree/main/${item.file.replace('*', '')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileJson size={18} aria-hidden="true" />
                <span>
                  <strong>{item.file}</strong>
                  <span className="link-card__meta">{item.label}</span>
                </span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}