import { ArrowUpRight, Check, GitCompare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatContext, formatUsd, KIND_LABELS } from '../../lib/format';
import type { CatalogEntry } from '../../types/catalog';
import { Badge } from '../ui/Badge';

interface EntryCardProps {
  entry: CatalogEntry;
  selected: boolean;
  selectionDisabled: boolean;
  onToggleSelect: (id: string) => void;
}

/** One listing in the explorer grid. Shows only fields the README states. */
export function EntryCard({
  entry,
  selected,
  selectionDisabled,
  onToggleSelect,
}: EntryCardProps) {
  const context = formatContext(entry);
  const input = formatUsd(entry.inputPerMTokens);
  const output = formatUsd(entry.outputPerMTokens);
  const pricePair = input && output ? `${input} → ${output} / 1M` : null;

  const description =
    entry.notes ??
    entry.attributes.find(
      (attribute) =>
        /strength|standout|special|best for|notes/i.test(attribute.label) &&
        attribute.value.length > 0,
    )?.value ??
    null;

  return (
    <article className={`entry-card ${selected ? 'entry-card--selected' : ''}`}>
      <header className="entry-card__header">
        <div className="entry-card__heading">
          <h3 className="entry-card__name">
            <Link to={`/listing/${entry.id}`}>{entry.name}</Link>
          </h3>
          <div className="entry-card__tags">
            <Badge tone="muted">{KIND_LABELS[entry.kind]}</Badge>
            {entry.isFree ? (
              <Badge tone="positive">
                <Sparkles size={11} aria-hidden="true" />
                Free tier
              </Badge>
            ) : null}
            {entry.listingCount > 1 ? (
              <Badge tone="muted" title={`Listed in ${entry.listingCount} README tables`}>
                ×{entry.listingCount}
              </Badge>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className={`entry-card__select ${selected ? 'entry-card__select--on' : ''}`}
          onClick={() => onToggleSelect(entry.id)}
          disabled={!selected && selectionDisabled}
          aria-pressed={selected}
          aria-label={
            selected ? `Remove ${entry.name} from comparison` : `Add ${entry.name} to comparison`
          }
          title={
            !selected && selectionDisabled
              ? 'Comparison is limited to 4 listings'
              : selected
                ? 'Remove from comparison'
                : 'Add to comparison'
          }
        >
          {selected ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <GitCompare size={15} aria-hidden="true" />
          )}
        </button>
      </header>

      <dl className="entry-card__meta">
        <div className="entry-card__meta-row">
          <dt>Provider</dt>
          <dd>{entry.provider ?? <span className="entry-card__unknown">Not stated</span>}</dd>
        </div>
        <div className="entry-card__meta-row">
          <dt>Category</dt>
          <dd>{entry.subsection ?? entry.section}</dd>
        </div>
        {context ? (
          <div className="entry-card__meta-row">
            <dt>Context</dt>
            <dd className="mono">{context}</dd>
          </div>
        ) : null}
        {pricePair ? (
          <div className="entry-card__meta-row">
            <dt>Price</dt>
            <dd className="mono">
              {pricePair} <span className="entry-card__unit">tokens</span>
            </dd>
          </div>
        ) : entry.costText ? (
          <div className="entry-card__meta-row">
            <dt>Cost</dt>
            <dd className="entry-card__cost">{entry.costText}</dd>
          </div>
        ) : null}
      </dl>

      {description ? <p className="entry-card__description">{description}</p> : null}

      <footer className="entry-card__footer">
        <Link className="entry-card__details" to={`/listing/${entry.id}`}>
          Details
        </Link>
        {entry.url ? (
          <a
            className="entry-card__external"
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Official source
            <ArrowUpRight size={13} aria-hidden="true" />
            <span className="sr-only">for {entry.name} (opens in a new tab)</span>
          </a>
        ) : (
          <span className="entry-card__external entry-card__external--disabled" title="The README does not link this listing">
            No source link
          </span>
        )}
      </footer>
    </article>
  );
}