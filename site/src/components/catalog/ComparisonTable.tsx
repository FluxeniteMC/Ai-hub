import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatContext, formatUsd, KIND_LABELS } from '../../lib/format';
import { sharedAttributeLabels } from '../../lib/catalog';
import type { CatalogEntry } from '../../types/catalog';

interface ComparisonTableProps {
  entries: CatalogEntry[];
}

type Row = {
  label: string;
  /** Returns a React node, or null when the README does not state the value. */
  render: (entry: CatalogEntry) => React.ReactNode;
};

function NotStated() {
  return <span className="compare-table__unknown">Not stated</span>;
}

export function ComparisonTable({ entries }: ComparisonTableProps) {
  const coreRows: Row[] = [
    {
      label: 'Provider',
      render: (entry) => entry.provider ?? <NotStated />,
    },
    {
      label: 'Type',
      render: (entry) => KIND_LABELS[entry.kind],
    },
    {
      label: 'Category',
      render: (entry) => entry.subsection ?? entry.section,
    },
    {
      label: 'Grouping',
      render: (entry) => (entry.groups.length ? entry.groups.join(', ') : <NotStated />),
    },
    {
      label: 'Context window',
      render: (entry) => {
        const value = formatContext(entry);
        return value ? <span className="mono">{value}</span> : <NotStated />;
      },
    },
    {
      label: 'Input / 1M tokens',
      render: (entry) => {
        const value = formatUsd(entry.inputPerMTokens);
        return value ? <span className="mono">{value}</span> : <NotStated />;
      },
    },
    {
      label: 'Output / 1M tokens',
      render: (entry) => {
        const value = formatUsd(entry.outputPerMTokens);
        return value ? <span className="mono">{value}</span> : <NotStated />;
      },
    },
    {
      label: 'Pricing note',
      render: (entry) =>
        entry.costText ? (
          <span className="compare-table__wrap">{entry.costText}</span>
        ) : (
          <NotStated />
        ),
    },
    {
      label: 'Free tier mentioned',
      render: (entry) => (entry.isFree ? 'Yes' : <NotStated />),
    },
    {
      label: 'Listed in README tables',
      render: (entry) => (
        <span>
          {entry.listingCount} · {entry.sections.join(', ')}
        </span>
      ),
    },
    {
      label: 'Source link',
      render: (entry) =>
        entry.url ? (
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            Official source
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        ) : (
          <NotStated />
        ),
    },
  ];

  // Only surface README columns that exist for every selected listing.
  const attributeRows: Row[] = sharedAttributeLabels(entries).map((label) => ({
    label,
    render: (entry) => {
      const attribute = entry.attributes.find((item) => item.label === label);
      return attribute ? (
        <span className="compare-table__wrap">{attribute.value}</span>
      ) : (
        <NotStated />
      );
    },
  }));

  return (
    <div className="table-scroll compare-table__scroll">
      <table className="data-table compare-table">
        <caption className="sr-only">
          Side-by-side comparison of {entries.length} selected listings, using only fields present
          in the repository README.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="compare-table__corner">
              Field
            </th>
            {entries.map((entry) => (
              <th key={entry.id} scope="col">
                <Link className="compare-table__name" to={`/listing/${entry.id}`}>
                  {entry.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {coreRows.map((row) => (
            <tr key={row.label}>
              <th scope="row" className="compare-table__rowhead">
                {row.label}
              </th>
              {entries.map((entry) => (
                <td key={entry.id}>{row.render(entry)}</td>
              ))}
            </tr>
          ))}
          {attributeRows.length > 0 ? (
            <>
              <tr>
                <th scope="col" colSpan={entries.length + 1} className="compare-table__section">
                  Additional README columns
                </th>
              </tr>
              {attributeRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="compare-table__rowhead">
                    {row.label}
                  </th>
                  {entries.map((entry) => (
                    <td key={entry.id}>{row.render(entry)}</td>
                  ))}
                </tr>
              ))}
            </>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}