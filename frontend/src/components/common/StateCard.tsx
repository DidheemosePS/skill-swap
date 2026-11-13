import type { ReactNode } from 'react'

export type StateTone = 'card' | 'inset' | 'plain'

interface StateCardProps {
  visual: ReactNode
  title: string
  description?: string
  action?: ReactNode
  // card: grey on the white page; inset: white inside a grey card (never grey on grey); plain: no fill at all.
  tone?: StateTone
  role?: 'alert' | 'status'
  // Always a centred column, for a way forward that is more than one button.
  stacked?: boolean
}

const TONES: Record<StateTone, string> = { card: 'bg-card', inset: 'bg-surface', plain: '' }

// The one shape every empty and error state takes: a small mark, one line (and at most one more), one way
// forward, in a compact centred card. Same as Recommended's "No new free swaps yet". It reads its container,
// not the viewport: in a narrow column (the Messages list, a side panel) it stacks rather than squeezing the line.
export default function StateCard({ visual, title, description, action, tone = 'card', role, stacked = false }: StateCardProps) {
  const row = stacked ? '' : '@md:flex-row @md:gap-x-4 @md:text-left'
  return (
    <div className="@container flex w-full justify-center">
      <div role={role} className={`flex w-full max-w-lg flex-col items-center gap-3 rounded-2xl p-5 text-center ${row} ${TONES[tone]}`}>
        <span aria-hidden="true" className="flex shrink-0 items-center">{visual}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-balance text-ink">{title}</p>
          {description && <p className="mt-0.5 text-sm text-pretty text-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
