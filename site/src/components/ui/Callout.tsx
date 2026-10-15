import type { ReactNode } from 'react';

import { cx } from '../../lib/format';

interface CalloutProps {
  icon?: ReactNode;
  title?: string;
  tone?: 'neutral' | 'warning';
  children: ReactNode;
  className?: string;
}

/** Inline note used for provenance, caveats and data-quality warnings. */
export function Callout({ icon, title, tone = 'neutral', children, className }: CalloutProps) {
  return (
    <div className={cx('callout', tone === 'warning' && 'callout--warning', className)}>
      {icon ? (
        <span className="callout__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div>
        {title ? <p className="callout__title">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}