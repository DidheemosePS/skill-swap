import type { ReactNode } from 'react'

interface SettingsPanelProps {
  id: string
  title: string
  // One short line under the title; anything longer belongs in a tip or nowhere.
  hint?: ReactNode
  aside?: ReactNode
  children: ReactNode
}

// The card every settings group sits in, built like the dashboard panels: a header row, then the controls.
export default function SettingsPanel({ id, title, hint, aside, children }: SettingsPanelProps) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <h2 id={id} className="text-base font-medium text-ink">{title}</h2>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
        {aside}
      </div>
      <div className="px-4 py-5 sm:px-5">{children}</div>
    </section>
  )
}
