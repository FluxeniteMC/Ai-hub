import type { ReactNode } from 'react';

import { cx } from '../../lib/format';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

/** Shown when a search or filter combination legitimately matches nothing. */
export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cx('state', className)} role="status">
      <span className="state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="state__title">{title}</h3>
      <p className="state__description">{description}</p>
      {actions ? <div className="state__actions">{actions}</div> : null}
    </div>
  );
}