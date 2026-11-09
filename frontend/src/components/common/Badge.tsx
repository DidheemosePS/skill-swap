interface BadgeProps {
  label: string
  onRemove?: () => void
}

export default function Badge({ label, onRemove }: BadgeProps) {
  return (
    <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-strong">
      <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="-mr-2 flex size-7 shrink-0 items-center justify-center rounded-full text-base leading-none outline-none transition hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </span>
  )
}
