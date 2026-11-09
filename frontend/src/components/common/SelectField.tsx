interface SelectFieldProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export default function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 min-h-11 w-full cursor-pointer rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
