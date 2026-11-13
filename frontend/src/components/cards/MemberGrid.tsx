import { useState } from 'react'
import type { DirectoryMember } from '../../types'
import MemberCard from './MemberCard'

interface MemberGridProps {
  members: DirectoryMember[]
  search: string
  onBook: (member: DirectoryMember) => void
  label?: string
}

// Twelve fills four rows of three, or six of two, before the page asks for more.
const PAGE_SIZE = 12

// A long result list arrives a page at a time, so the cards stay quick to scan and the page stays short.
// Key it by the filters, so a new search starts again from the first page.
export default function MemberGrid({ members, search, onBook, label }: MemberGridProps) {
  const [shown, setShown] = useState(PAGE_SIZE)
  const left = members.length - shown

  return (
    <>
      <ul aria-label={label} className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {members.slice(0, shown).map((member) => <MemberCard key={member.user.id} member={member} search={search} onBook={onBook} />)}
      </ul>
      {left > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setShown(shown + PAGE_SIZE)}
            className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-ink outline-none hover:border-muted hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent"
          >
            Show <span className="figures mx-1">{Math.min(left, PAGE_SIZE)}</span> more <span className="figures ml-1 text-muted">· {left} left</span>
          </button>
        </div>
      )}
    </>
  )
}
