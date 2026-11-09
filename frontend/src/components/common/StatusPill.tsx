export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

const TONES: Record<StatusTone, string> = {
  success: 'bg-accent-soft text-accent-strong',
  warning: 'bg-star/15 text-star',
  danger: 'bg-danger-soft text-danger',
  // Canvas rather than line behind the text: muted on line is 4.4:1, just under AA.
  neutral: 'bg-canvas text-muted ring-1 ring-inset ring-line',
}

export default function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{label}</span>
}
