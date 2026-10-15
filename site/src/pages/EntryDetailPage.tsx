import { ArrowLeft, ArrowUpRight, GitCompare, Info, Layers } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '../components/ui/Badge';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/EmptyState';
import { useCompareSelection } from '../hooks/useCompareSelection';
import { getEntryById } from '../lib/catalog';
import { formatContext, formatUsd, KIND_LABELS, readmeLineUrl } from '../lib/format';
import { catalog } from '../lib/catalog';

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const entry = id ? getEntryById(id) : undefined;
  const { isSelected, toggle, isFull } = useCompareSelection();

  if (!entry) {
    return (
      <div className="container">
        <EmptyState
          icon={<Info size={22} />}
          title="Listing not found"
          description="This listing does not exist in the current catalog. It may have been renamed or removed from the README."
          actions={
            <Link className="button button--primary" to="/explore">
              Back to the explorer
            </Link>
          }
        />
      </div>
    );
  }

  const context = formatContext(entry);
  const input = formatUsd(entry.inputPerMTokens);
  const output = formatUsd(entry.outputPerMTokens);
  const selected = isSelected(entry.id);

  const facts: { label: string; value: string }[] = [
    { label: 'Type', value: KIND_LABELS[entry.kind] },
    { label: 'Provider', value: entry.provider ?? 'Not stated in the README' },
    { label: 'Primary section', value: entry.section },
    { label: 'Category', value: entry.subsection ?? 'Not stated' },
    { label: 'Tier', value: entry.tier ?? 'Not stated' },
  ];
  if (context) facts.push({ label: 'Context window', value: context });
  if (entry.costText) facts.push({ label: 'Pricing note', value: entry.costText });
  if (input && output) facts.push({ label: 'Input / output per 1M', value: `${input} → ${output}` });

  return (
    <div className="container">
      <Link className="back-link" to="/explore">
        <ArrowLeft size={14} aria-hidden="true" />
        Back to explorer
      </Link>

      <header className="detail-header">
        <div className="detail-header__main">
          <div className="detail-header__tags">
            <Badge tone="accent">{KIND_LABELS[entry.kind]}</Badge>
            {entry.isFree ? <Badge tone="positive">Free tier mentioned</Badge> : null}
            {entry.groups.map((group) => (
              <Badge key={group} tone="muted">
                {group}
              </Badge>
            ))}
          </div>
          <h1 className="detail-header__title">{entry.name}</h1>
        </div>

        <div className="detail-header__actions">
          <button
            type="button"
            className={`button ${selected ? '' : 'button--primary'}`}
            onClick={() => toggle(entry.id)}
            disabled={!selected && isFull}
            aria-pressed={selected}
          >
            <GitCompare size={15} aria-hidden="true" />
            {selected ? 'Remove from comparison' : 'Add to comparison'}
          </button>
          {entry.url ? (
            <a
              className="button"
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Official source
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </header>

      {entry.notes ? <p className="detail-notes">{entry.notes}</p> : null}

      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel panel--padded" aria-labelledby="facts-heading">
            <h2 className="detail-section__title" id="facts-heading">
              Verified facts
            </h2>
            <dl className="fact-list">
              {facts.map((fact) => (
                <div className="fact-list__row" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            {entry.url ? null : (
              <Callout icon={<Info size={15} />} className="detail-callout">
                The README does not include a link for this listing, so no source is shown here.
              </Callout>
            )}
          </section>

          {entry.attributes.length > 0 ? (
            <section className="panel panel--padded" aria-labelledby="attributes-heading">
              <h2 className="detail-section__title" id="attributes-heading">
                README columns
              </h2>
              <p className="detail-section__hint">
                Reproduced verbatim from the catalog table, using that table's own column names.
              </p>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Column</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.attributes.map((attribute) => (
                      <tr key={`${attribute.label}-${attribute.value}`}>
                        <th scope="row" className="compare-table__rowhead">
                          {attribute.label}
                        </th>
                        <td>{attribute.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="detail-side">
          <section className="panel panel--padded" aria-labelledby="provenance-heading">
            <h2 className="detail-section__title" id="provenance-heading">
              <Layers size={15} aria-hidden="true" />
              Where this comes from
            </h2>
            <p className="detail-section__hint">
              This listing appears in {entry.listingCount}{' '}
              {entry.listingCount === 1 ? 'table' : 'tables'} in the repository README.
            </p>
            <ol className="occurrence-list">
              {entry.occurrences.map((occurrence, index) => (
                <li key={`${occurrence.line}-${index}`}>
                  <a
                    href={readmeLineUrl(catalog.source.repository, 'main', occurrence.line)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="occurrence-list__section">
                      {occurrence.subsection ?? occurrence.section}
                    </span>
                    <span className="occurrence-list__meta">
                      README.md:{occurrence.line}
                      <ArrowUpRight size={11} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}