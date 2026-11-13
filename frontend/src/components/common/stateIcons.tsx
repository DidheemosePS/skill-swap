// Glyphs for empty states, one per subject, drawn on the same 16px grid and 1.6 stroke as the nav icons.
const PATHS = {
  people: 'M6 7.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM2 13c.4-2.2 2-3.5 4-3.5s3.6 1.3 4 3.5M11 3.2a2.2 2.2 0 0 1 0 4.1M12.2 9.8c1 .5 1.6 1.6 1.8 3.2',
  chat: 'M2.5 7.5c0-2.5 2.4-4.5 5.5-4.5s5.5 2 5.5 4.5S11.1 12 8 12c-.7 0-1.4-.1-2-.3L3 13l.8-2.4c-.8-.8-1.3-1.9-1.3-3.1Z',
  calendar: 'M3 5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 13 5v6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5V5ZM3 7h10M6 2v3M10 2v3',
  clock: 'M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 5v3.2l2 1.3',
  search: 'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM10.4 10.4 13.5 13.5',
  star: 'm8 2.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8L8 11.2 4.6 13l.7-3.8L2.5 6.5l3.8-.5L8 2.5Z',
  lock: 'M4.5 7.5h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1ZM5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2',
  ledger: 'M4 2.5h8v11l-2-1.2-2 1.2-2-1.2-2 1.2v-11ZM6 6h4M6 8.5h3',
} as const

export type StateIconName = keyof typeof PATHS

// An empty seat: a dashed white circle around the subject's glyph, the same mark as the open seat in SwapPair.
export function EmptyMark({ icon }: { icon: StateIconName }) {
  return (
    <span className="grid size-10 place-items-center rounded-full border-[1.5px] border-dashed border-faint/60 bg-surface text-muted">
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={PATHS[icon]} />
      </svg>
    </span>
  )
}

// A load that failed: a solid coral-tinted circle with an exclamation, so it never reads as "nothing here".
export function ErrorMark() {
  return (
    <span className="grid size-10 place-items-center rounded-full bg-danger-soft text-danger">
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M8 4v5M8 12h.01" />
      </svg>
    </span>
  )
}
