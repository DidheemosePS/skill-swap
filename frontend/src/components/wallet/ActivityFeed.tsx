import { Link } from 'react-router-dom'
import type { LedgerEntry } from '../../types'
import Avatar from '../common/Avatar'

const DAY_MS = 86_400_000
const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

// What happened, said as a sentence with the person in it ("Taught Dina Python"), not a type code.
function describe({ type, partner, session }: LedgerEntry) {
  const first = partner?.name.split(' ')[0] ?? ''
  if (type === 'onboarding_bonus') return 'Welcome credit'
  if (type === 'teaching_reward') return session ? `Taught ${first} ${session.skillName}` : `Taught ${first}`
  if (type === 'escrow_refund') return `Credit back from ${first}`
  return session ? `Booked ${session.skillName} with ${first}` : `Booked a session with ${first}`
}

// The newest week together, then one group per month, so the feed reads like a statement.
function groupOf(iso: string, now: number) {
  return now - Date.parse(iso) < 7 * DAY_MS ? 'This week' : monthFormatter.format(new Date(iso))
}

// The ledger as an activity feed: a face for each entry, one sentence, the date, and the amount on the right.
export default function ActivityFeed({ entries, now }: { entries: LedgerEntry[]; now: number }) {
  const groups = entries.reduce<{ label: string; items: LedgerEntry[] }[]>((list, entry) => {
    const label = groupOf(entry.createdAt, now)
    const last = list.at(-1)
    if (last?.label === label) last.items.push(entry)
    else list.push({ label, items: [entry] })
    return list
  }, [])

  return (
    <div>
      {groups.map((group) => (
        <section key={group.label} aria-label={group.label}>
          <h3 className="mt-5 mb-1 font-sans text-sm font-semibold tracking-normal text-faint first:mt-1">{group.label}</h3>
          <ul>
            {group.items.map((entry) => {
              const isHeld = entry.status === 'in_escrow'
              const name = entry.partner?.name ?? 'Skill Swap'
              return (
                <li key={entry.id} className="flex items-center gap-3 border-b border-line/70 py-3 last:border-b-0">
                  <Avatar name={name} url={null} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{describe(entry)}</p>
                    <p className="text-sm text-muted">
                      <span className="figures">{dateFormatter.format(new Date(entry.createdAt))}</span>
                      {isHeld && <> · held until it happens · <Link to="/sessions" className="rounded font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">See session</Link></>}
                    </p>
                  </div>
                  <p className={`figures shrink-0 font-display text-lg font-semibold ${isHeld ? 'text-held' : entry.amount > 0 ? 'text-success' : 'text-ink'}`}>
                    {entry.amount > 0 ? `+${entry.amount}` : `−${-entry.amount}`}
                    <span className="sr-only"> {Math.abs(entry.amount) === 1 ? 'credit' : 'credits'}{isHeld ? ', held' : ''}</span>
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
