import { cx } from '../../lib/format';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'positive' | 'caution' | 'muted';
  className?: string;
  title?: string;
}

export function Badge({ children, tone = 'neutral', className, title }: BadgeProps) {
  const toneClass =
    tone === 'accent'
      ? 'badge--accent'
      : tone === 'positive'
        ? 'badge--positive'
        : tone === 'caution'
          ? 'badge--caution'
          : tone === 'muted'
            ? 'badge--muted'
            : '';

  return (
    <span className={cx('badge', toneClass, className)} title={title}>
      {children}
    </span>
  );
}