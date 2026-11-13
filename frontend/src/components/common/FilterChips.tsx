interface FilterChipsProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

// One choice from a short list, shown as chips so every option is visible without opening a menu.
// The fieldset names the group for screen readers; aria-pressed marks the chosen chip.
export default function FilterChips<T extends string>({ label, value, options, onChange }: FilterChipsProps<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isOn = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isOn}
              onClick={() => onChange(option.value)}
              className={`${/\d/.test(option.label) ? 'figures' : ''} inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:min-h-9 ${
                isOn ? 'border-next bg-next font-medium text-white' : 'border-line bg-surface font-medium text-ink hover:border-muted'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
