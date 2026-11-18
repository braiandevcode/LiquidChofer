import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import type { ICarOwnerSelectorProps } from '../interfaces/props/ICarOwnerSelectorProps';
import { OPTIONS } from '../config/config.options.carOwner';

const CarOwnerSelector = ({ value, onChange, disabled = false }: ICarOwnerSelectorProps): ReactNode => (
  <div className="rounded-xl border border-border-subtle bg-bg-input/60 p-3">
    <p className="mb-2 text-sm font-medium text-text-secondary font-display">Dueño del auto</p>
    <div role="group" aria-label="Dueño del auto" className="grid grid-cols-2 gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'cursor-pointer rounded-lg border px-3 py-2.5 font-display text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50',
            value === option.value
              ? 'border-accent-violet/20 bg-accent-violet/15 text-accent-violet'
              : 'border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
    <p className="mt-2 text-xs text-text-muted">Al dueño se le descuentan el gas y la nafta.</p>
  </div>
)

export default CarOwnerSelector