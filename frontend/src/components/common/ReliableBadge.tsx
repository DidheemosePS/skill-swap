import { useId } from 'react'
import type { CSSProperties } from 'react'
import { ShieldIcon } from './icons'

// Mirrors the backend rule behind is_reliable; the frontend only displays the flag, never computes it.
const CRITERIA = [
  '5+ sessions, 95% attended',
  'Rated 4.8 or higher',
  'No concerns upheld against them in 30 days',
]

export default function ReliableBadge() {
  const popoverId = useId()
  // Anchor names must be valid CSS idents, and useId output contains colons.
  const anchor = `--reliable-${popoverId.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <>
      {/* A native popover gives light dismiss, Esc and focus return; it opens beside the badge
          where anchor positioning is supported, and centred otherwise. */}
      <button
        type="button"
        popoverTarget={popoverId}
        style={{ anchorName: anchor } as CSSProperties}
        className="inline-flex min-h-11 items-center gap-1 rounded text-sm text-muted underline decoration-line decoration-dotted underline-offset-4 outline-none hover:text-ink hover:decoration-muted focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ShieldIcon className="size-4 text-success" />Reliable Swapper
      </button>
      <div
        id={popoverId}
        popover="auto"
        style={{ positionAnchor: anchor } as CSSProperties}
        className="anchored-popover w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-line bg-surface p-3 text-sm text-ink shadow-[0_8px_24px_rgb(24_29_38/0.12)]"
      >
        <p className="font-medium">Reliable Swapper</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-muted">
          {CRITERIA.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </>
  )
}
