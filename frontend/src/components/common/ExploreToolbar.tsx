import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import type { ExploreFilters } from '../../types'
import { TYPE_OPTIONS } from '../../utils/exploreFilters'
import { getToggleClasses } from './buttonStyles'

interface ExploreToolbarProps {
  filters: ExploreFilters
  onChange: (changes: Partial<ExploreFilters>) => void
  // Day, rating and reliable: the choices that narrow, counted on the button so a closed panel still says it's on.
  filterCount: number
  panel: ReactNode
  // Phones get the full-height drawer with its "Show N members" button instead of a popover.
  onOpenSheet: () => void
}

const pill = (isOn: boolean) => getToggleClasses(isOn)

// The one choice most members make (which deal) stays visible as a switch; the rest wait behind one button.
export default function ExploreToolbar({ filters, onChange, filterCount, panel, onOpenSheet }: ExploreToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => setIsOpen(false), [])
  useDismiss(ref, isOpen, close, triggerRef)

  function openFilters() {
    if (window.matchMedia('(min-width: 64rem)').matches) setIsOpen((current) => !current)
    else onOpenSheet()
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div role="group" aria-label="Deal" className="flex gap-1">
        {TYPE_OPTIONS.map((option) => (
          <button key={option.value} type="button" aria-pressed={filters.type === option.value} onClick={() => onChange({ type: option.value })} className={pill(filters.type === option.value)}>
            {option.label}
          </button>
        ))}
      </div>
      <div ref={ref} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          onClick={openFilters}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium outline-none transition-colors hover:border-muted focus-visible:ring-2 focus-visible:ring-accent lg:min-h-9"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 6h14M3 14h14" />
            <circle cx="7" cy="6" r="2" className="fill-surface" />
            <circle cx="13" cy="14" r="2" className="fill-surface" />
          </svg>
          Filters
          {filterCount > 0 && <span className="figures inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-next px-1 text-xs text-white">{filterCount}</span>}
        </button>
        {isOpen && (
          <div role="dialog" aria-label="Filters" className="absolute top-full right-0 z-30 mt-2 w-80 rounded-xl border border-line bg-surface p-4 shadow-[0_8px_24px_rgb(24_29_38/0.12)]">
            {panel}
          </div>
        )}
      </div>
    </div>
  )
}
