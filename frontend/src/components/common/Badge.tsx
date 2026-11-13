interface BadgeProps {
  label: string
  onRemove?: () => void
}

export default function Badge({ label, onRemove }: BadgeProps) {
  return (
    <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-full bg-next-soft px-3 py-1 text-sm font-medium text-ink">
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="-mr-2 flex size-7 shrink-0 items-center justify-center rounded-full text-muted outline-none transition hover:bg-line hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></svg>
        </button>
      )}
    </span>
  )
}
