import { useCallback, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useDismiss } from '../../hooks/useDismiss'

interface InfoTipProps {
  // What the icon answers, read by screen readers and shown on hover ("What does held mean?").
  label: string
  children: ReactNode
  // Which edge the panel lines up with, so a tip near the right of a card doesn't run off it.
  align?: 'start' | 'end'
}

// Explanations live here instead of on the page: hover or focus shows them, and a tap pins them open on
// phones, where there is no hover. The text stays in the DOM, so it's also the icon's accessible description.
export default function InfoTip({ label, children, align = 'start' }: InfoTipProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tipId = useId()
  const close = useCallback(() => {
    setIsPinned(false)
    setIsHovered(false)
  }, [])
  useDismiss(ref, isPinned, close, triggerRef)
  const isOpen = isPinned || isHovered

  return (
    <span ref={ref} className="relative inline-flex align-middle" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-describedby={tipId}
        aria-expanded={isOpen}
        onClick={() => setIsPinned((current) => !current)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        // A 16px glyph: a 44px target on touch screens (the negative margin keeps it from pushing the heading),
        // 28px with a mouse.
        className="-m-2 inline-flex size-11 items-center lg:m-0 lg:size-7 justify-center rounded-full text-muted outline-none transition-colors hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7.25v3.5M8 5.1v.05" />
        </svg>
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`absolute top-full z-30 mt-1 w-64 rounded-lg border border-line bg-surface p-3 text-left text-sm font-normal text-ink shadow-[0_8px_24px_rgb(24_29_38/0.12)] ${
          align === 'end' ? 'right-0' : 'left-0'
        } ${isOpen ? 'block' : 'hidden'}`}
      >
        {children}
      </span>
    </span>
  )
}
