import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useScrollSpy } from '../../hooks/useScrollSpy';
import { cx } from '../../lib/format';

export interface LegalSectionDef {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  eyebrow: string;
  eyebrowIcon: ReactNode;
  title: string;
  summary: ReactNode;
  effectiveDate: string;
  lastReviewed: string;
  facts: { label: string; value: string }[];
  sections: readonly LegalSectionDef[];
  children: ReactNode;
  tocNote?: ReactNode;
}

/**
 * Shared shell for the long-form legal pages.
 *
 * Renders a masthead with an effective-date fact strip, a scroll-spy table of
 * contents, and the numbered section body. The pages pass their own content so
 * the structure stays identical across Terms and Privacy.
 *
 * Because the router is a HashRouter, table-of-contents links are built as
 * router locations (`#/terms#liability`) rather than plain fragments.
 */
export function LegalLayout({
  eyebrow,
  eyebrowIcon,
  title,
  summary,
  effectiveDate,
  lastReviewed,
  facts,
  sections,
  children,
  tocNote,
}: LegalLayoutProps) {
  const { pathname } = useLocation();
  const activeId = useScrollSpy(sections.map((section) => section.id));

  return (
    <div className="container">
      <header className="legal-masthead">
        <p className="eyebrow">
          {eyebrowIcon}
          {eyebrow}
        </p>
        <h1 className="legal-masthead__title">{title}</h1>
        <div className="legal-masthead__summary">{summary}</div>

        <dl className="legal-facts">
          <div className="legal-fact legal-fact--accent">
            <dt className="legal-fact__label">Effective</dt>
            <dd className="legal-fact__value">{effectiveDate}</dd>
          </div>
          <div className="legal-fact">
            <dt className="legal-fact__label">Last reviewed</dt>
            <dd className="legal-fact__value">{lastReviewed}</dd>
          </div>
          {facts.map((fact) => (
            <div key={fact.label} className="legal-fact">
              <dt className="legal-fact__label">{fact.label}</dt>
              <dd className="legal-fact__value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="legal-layout">
        <nav className="legal-toc" aria-label={`Contents of ${title}`}>
          <p className="legal-toc__label">On this page</p>

          <ol className="legal-toc__list">
            {sections.map((section, index) => (
              <li key={section.id}>
                <Link
                  className={cx(
                    'legal-toc__link',
                    activeId === section.id && 'legal-toc__link--active',
                  )}
                  to={{ pathname, hash: `#${section.id}` }}
                  aria-current={activeId === section.id ? 'location' : undefined}
                >
                  <span className="legal-toc__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{section.title}</span>
                </Link>
              </li>
            ))}
          </ol>

          {tocNote ? <p className="legal-toc__meta">{tocNote}</p> : null}
        </nav>

        <article className="legal-content">{children}</article>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}

/** One numbered clause. `index` is zero-based and rendered as 01, 02, … */
export function LegalSection({ id, index, title, children }: LegalSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section className="legal-section" id={id} aria-labelledby={headingId}>
      <div className="legal-section__header">
        <span className="legal-section__index mono" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="legal-section__title" id={headingId}>
          {title}
        </h2>
      </div>
      <div className="legal-section__body">{children}</div>
    </section>
  );
}