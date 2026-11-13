import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

// A link in running text on the dark card: white and underlined, since link blue disappears on near-black.
export default function NoteLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="rounded font-medium text-white underline underline-offset-3 outline-none focus-visible:ring-2 focus-visible:ring-white">
      {children}
    </Link>
  )
}
