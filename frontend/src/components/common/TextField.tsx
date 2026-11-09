import { useId } from 'react'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength: number
  placeholder?: string
  // Shows a textarea with this many rows instead of a single-line input.
  rows?: number
}

const FIELD_CLASSES =
  'mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base font-normal outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm'

export default function TextField({ label, value, onChange, maxLength, placeholder, rows }: TextFieldProps) {
  const counterId = useId()
  const shared = {
    value,
    maxLength,
    placeholder,
    'aria-describedby': counterId,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  }
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        {rows ? <textarea {...shared} rows={rows} className={`${FIELD_CLASSES} resize-y`} /> : <input {...shared} type="text" className={`${FIELD_CLASSES} min-h-11`} />}
      </label>
      <p id={counterId} className="mt-1 text-right text-xs text-muted tabular-nums">
        {value.length}/{maxLength}
        <span className="sr-only"> characters</span>
      </p>
    </div>
  )
}
