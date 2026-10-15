import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cx } from '../../lib/format';

export interface SelectOption {
  value: string;
  label: string;
  /** Optional trailing count shown in a muted column. */
  hint?: number;
}

interface SelectProps {
  id?: string;
  /** Visible label rendered above the trigger. */
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Hide the visible label but keep it for assistive technology. */
  hideLabel?: boolean;
}

interface Position {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: 'bottom' | 'top';
}

/**
 * Accessible listbox styled for the dark theme.
 *
 * A native <select> cannot be themed: browsers paint its popup with OS colours,
 * which produces a white dropdown on a dark page. This renders a real listbox
 * in a portal so it is never clipped by scrolling ancestors, and supports the
 * expected keyboard interaction.
 */
export function Select({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className,
  hideLabel = false,
}: SelectProps) {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const computePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 6;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    // Flip above the trigger when there is not enough room below.
    const placement: 'bottom' | 'top' = spaceBelow < 240 && spaceAbove > spaceBelow ? 'top' : 'bottom';
    const available = placement === 'bottom' ? spaceBelow : spaceAbove;
    setPosition({
      top: placement === 'bottom' ? rect.bottom + 6 : rect.top - 6,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(160, Math.min(available, 320)),
      placement,
    });
  }, []);

  const openListbox = useCallback(() => {
    computePosition();
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [computePosition, selectedIndex]);

  const closeListbox = useCallback((focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [options, onChange],
  );

  // Position before paint so the listbox never flashes at the wrong spot.
  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
  }, [open, computePosition]);

  // Dismiss on outside click, scroll or resize.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (listboxRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScrollOrResize = () => computePosition();

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, computePosition]);

  // Keep the highlighted option inside the scroll viewport.
  useEffect(() => {
    if (!open || !listboxRef.current) return;
    const node = listboxRef.current.querySelector<HTMLElement>('[data-active="true"]');
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openListbox();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        closeListbox();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cx('select-field', className)}>
      <label
        className={cx('field__label', hideLabel && 'sr-only')}
        id={`${triggerId}-label`}
        htmlFor={triggerId}
      >
        {label}
      </label>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={cx('select', open && 'select--open')}
        onClick={() => (open ? closeListbox() : openListbox())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={`${triggerId}-label ${triggerId}`}
      >
        <span className={cx('select__value', !selected && 'select__value--empty')}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.hint !== undefined ? <span className="select__hint">{selected.hint}</span> : null}
        <ChevronDown
          size={15}
          className={cx('select__chevron', open && 'select__chevron--open')}
          aria-hidden="true"
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-labelledby={`${triggerId}-label`}
              aria-activedescendant={`${listboxId}-option-${activeIndex}`}
              tabIndex={-1}
              className="select-menu"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                transform:
                  position.placement === 'top' ? 'translateY(-100%)' : undefined,
              }}
              onKeyDown={onKeyDown}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <div
                    key={option.value || `__empty_${index}`}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive}
                    className={cx(
                      'select-menu__option',
                      isSelected && 'select-menu__option--selected',
                      isActive && 'select-menu__option--active',
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                  >
                    <span className="select-menu__label">{option.label}</span>
                    {option.hint !== undefined ? (
                      <span className="select-menu__hint">{option.hint}</span>
                    ) : null}
                    {isSelected ? (
                      <Check size={14} className="select-menu__check" aria-hidden="true" />
                    ) : null}
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}