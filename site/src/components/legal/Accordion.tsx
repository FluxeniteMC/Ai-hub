import { Plus } from 'lucide-react';
import { useId, useState } from 'react';

import { cx } from '../../lib/format';

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  /** Stable id prefix; must be unique per group on the page. */
  groupId: string;
  items: readonly FaqItem[];
  defaultOpenIndex?: number;
}

/**
 * Disclosure list for the FAQ.
 *
 * Follows the WAI-ARIA accordion pattern: each trigger is a real button with
 * `aria-expanded` and `aria-controls`, and the panel is a labelled region.
 *
 * Collapsed answers stay mounted in the DOM (the panel animates via
 * `grid-template-rows`, and `visibility: hidden` removes them from the tab
 * order), so question text is always present for assistive technology and
 * crawlers rather than being conditionally rendered.
 */
export function Accordion({ groupId, items, defaultOpenIndex = -1 }: AccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex);

  if (items.length === 0) return null;

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const triggerId = `${baseId}-${groupId}-t-${index}`;
        const panelId = `${baseId}-${groupId}-p-${index}`;

        return (
          <div className="accordion__item" key={item.question}>
            <h3>
              <button
                type="button"
                className="accordion__trigger"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span>{item.question}</span>
                <Plus size={18} className="accordion__marker" aria-hidden="true" />
              </button>
            </h3>

            <div
              className="accordion__panel"
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              data-open={isOpen}
            >
              <div className="accordion__panel-inner">
                <div className="accordion__answer">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface FaqResultCountProps {
  total: number;
  shown: number;
  query: string;
  className?: string;
}

/** Announces how many questions a filter or query matched. */
export function FaqResultCount({ total, shown, query, className }: FaqResultCountProps) {
  const summary = cx(className, 'faq-status');

  if (!query) {
    return (
      <p className={summary} role="status" aria-live="polite">
        {shown === total
          ? `${total} questions across ${shown > 0 ? 'the categories below' : 'this page'}.`
          : `${shown} of ${total} questions shown.`}
      </p>
    );
  }

  return (
    <p className={summary} role="status" aria-live="polite">
      {shown === 0 ? (
        <>
          No questions match <strong>{query}</strong>. Try a different word, or browse all{' '}
          {total} questions.
        </>
      ) : (
        <>
          {shown} of {total} questions match <strong>{query}</strong>.
        </>
      )}
    </p>
  );
}