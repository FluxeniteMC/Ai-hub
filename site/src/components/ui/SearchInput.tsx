import { Search, X } from 'lucide-react';
import { useId } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}

/** Search field with a clear affordance and a proper accessible label. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
  className,
}: SearchInputProps) {
  const inputId = useId();

  return (
    <div className={`input-wrap ${className ?? ''}`}>
      <Search size={16} className="input-wrap__icon" aria-hidden="true" />
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <>
          <button
            type="button"
            className="input__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            Searching with “{value}”
          </span>
        </>
      ) : null}
    </div>
  );
}