'use client'

import type { LucideIcon } from 'lucide-react'

export interface SegmentedSwitchOption<T extends string> {
  value: T
  label: string
  Icon?: LucideIcon
}

interface SegmentedSwitchProps<T extends string> {
  label: string
  value: T
  options: Array<SegmentedSwitchOption<T>>
  onChange: (value: T) => void
}

export default function SegmentedSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
}: SegmentedSwitchProps<T>) {
  return (
    <fieldset className="mb-6">
      <legend className="block text-sm font-semibold text-gray-700 mb-2">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-full border border-ink/20 bg-surface p-1"
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                selected ? 'bg-ink text-white shadow-sm' : 'text-ink/70 hover:text-ink'
              }`}
            >
              {option.Icon && <option.Icon className="h-4 w-4 shrink-0" aria-hidden />}
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
