import { MAX_NOTE_LENGTH } from '../../utils/chat'

interface NoteFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
}

export default function NoteField({ value, onChange, placeholder, label = 'Add a note (optional)' }: NoteFieldProps) {
  return (
    <>
      <label className="mt-4 block text-sm font-medium">
        {label}
        <textarea
          value={value}
          rows={2}
          maxLength={MAX_NOTE_LENGTH}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-base font-normal outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
        />
      </label>
      <p className="mt-1 text-right text-xs text-muted tabular-nums">
        {value.length}/{MAX_NOTE_LENGTH}
        <span className="sr-only"> characters</span>
      </p>
    </>
  )
}
