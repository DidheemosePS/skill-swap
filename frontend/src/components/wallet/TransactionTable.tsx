import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LedgerEntry } from '../../types'
import StatusPill from '../common/StatusPill'
import EscrowDetails from './EscrowDetails'
import { TYPE_LABELS } from './ledgerFilters'

const dateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

const formatAmount = (amount: number) => (amount > 0 ? `+${amount}` : String(amount))

function PartnerName({ partner }: Pick<LedgerEntry, 'partner'>) {
  if (!partner) return <>Skill Swap</>
  return (
    <Link to={`/user/${partner.id}`} className="rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
      {partner.name}
    </Link>
  )
}

export default function TransactionTable({ entries }: { entries: LedgerEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const cell = 'px-4 py-3 align-top'

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Credit transactions, newest first</caption>
        <thead className="bg-canvas text-xs text-muted">
          <tr>
            <th scope="col" className={`${cell} hidden font-medium sm:table-cell`}>Date</th>
            <th scope="col" className={`${cell} font-medium`}>Type</th>
            <th scope="col" className={`${cell} hidden font-medium sm:table-cell`}>Partner</th>
            <th scope="col" className={`${cell} text-right font-medium`}>Amount</th>
            <th scope="col" className={`${cell} font-medium`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isEscrow = entry.status === 'in_escrow'
            const isOpen = openId === entry.id
            const detailsId = `escrow-${entry.id}`
            const date = dateFormatter.format(new Date(entry.createdAt))
            return (
              <Fragment key={entry.id}>
                <tr className="border-t border-line">
                  <td className={`${cell} hidden whitespace-nowrap text-muted sm:table-cell`}>{date}</td>
                  <td className={cell}>
                    {/* Only escrow rows open: they're the ones with something still to happen. */}
                    {isEscrow ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? detailsId : undefined}
                        onClick={() => setOpenId(isOpen ? null : entry.id)}
                        className="-mx-1 inline-flex items-center gap-1 rounded px-1 text-left font-medium text-accent-strong outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {TYPE_LABELS[entry.type]}
                        <svg aria-hidden="true" viewBox="0 0 16 16" className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <span className="font-medium">{TYPE_LABELS[entry.type]}</span>
                    )}
                    {/* Date and partner columns are hidden on phones, so they move under the type. */}
                    <p className="mt-0.5 text-xs text-muted sm:hidden"><PartnerName partner={entry.partner} /> · <span className="whitespace-nowrap">{date}</span></p>
                  </td>
                  <td className={`${cell} hidden sm:table-cell`}><PartnerName partner={entry.partner} /></td>
                  <td className={`${cell} text-right font-semibold whitespace-nowrap tabular-nums ${entry.amount > 0 ? 'text-accent-strong' : ''}`}>
                    {formatAmount(entry.amount)}<span className="sr-only"> {Math.abs(entry.amount) === 1 ? 'credit' : 'credits'}</span>
                  </td>
                  <td className={cell}>
                    <StatusPill label={isEscrow ? 'In Escrow' : 'Settled'} tone={isEscrow ? 'warning' : 'neutral'} />
                  </td>
                </tr>
                {isOpen && (
                  <tr id={detailsId}>
                    <td colSpan={5} className="px-4 pb-4"><EscrowDetails entry={entry} /></td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
