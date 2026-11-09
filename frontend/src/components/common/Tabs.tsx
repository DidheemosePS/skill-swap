import { useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

interface Tab<T extends string> {
  id: T
  label: ReactNode
}

interface TabsProps<T extends string> {
  label: string
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  children: ReactNode
}

export default function Tabs<T extends string>({ label, tabs, active, onChange, children }: TabsProps<T>) {
  const baseId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  // Tab pattern: Tab enters the active tab once, and arrow keys switch between tabs.
  function handleKeyDown(event: KeyboardEvent, index: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const delta = event.key === 'ArrowRight' ? 1 : -1
    const next = (index + delta + tabs.length) % tabs.length
    onChange(tabs[next].id)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        className="grid gap-1 rounded-lg border border-line bg-surface p-1"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${baseId}-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-11 rounded-md px-2 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent ${tab.id === active ? 'bg-accent text-white' : 'text-muted hover:bg-canvas hover:text-ink'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${active}`} className="mt-5">
        {children}
      </div>
    </div>
  )
}
