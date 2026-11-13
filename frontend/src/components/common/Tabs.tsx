import { useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { getToggleClasses } from './buttonStyles'

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
  // Settings lists its sections down the side on wide screens; Wallet keeps a row inside its panel header.
  vertical?: boolean
  listClassName?: string
  panelClassName?: string
}

export default function Tabs<T extends string>({ label, tabs, active, onChange, children, vertical = false, listClassName = '', panelClassName = 'mt-5' }: TabsProps<T>) {
  const baseId = useId()
  const listRef = useRef<HTMLDivElement>(null)

  // Tab pattern: Tab enters the active tab once, and arrow keys switch between tabs.
  function handleKeyDown(event: KeyboardEvent, index: number) {
    const forward = ['ArrowRight', 'ArrowDown'].includes(event.key)
    if (!forward && !['ArrowLeft', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    const delta = forward ? 1 : -1
    const next = (index + delta + tabs.length) % tabs.length
    onChange(tabs[next].id)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div className={vertical ? 'lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start lg:gap-8' : ''}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        // Scrolls sideways on a phone rather than wrapping, so the tabs stay one row.
        className={`flex gap-1 overflow-x-auto ${vertical ? 'lg:sticky lg:top-6 lg:flex-col' : ''} ${listClassName}`}
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
            className={getToggleClasses(tab.id === active, 'text-left')}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${active}`} className={vertical ? `${panelClassName} lg:mt-0` : panelClassName}>
        {children}
      </div>
    </div>
  )
}
