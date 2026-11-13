import { Link } from 'react-router-dom'
import { creditReturnRule } from '../../utils/credits'

interface CreditCostSummaryProps {
  firstName: string
  // Null when the wallet hasn't loaded, so no balance is guessed.
  credits: number | null
}

// Spending a credit is the one money-like step in booking, so the cost, the balance and the refund rule are spelled out.
export default function CreditCostSummary({ firstName, credits }: CreditCostSummaryProps) {
  return (
    // Sits inside the booking summary block, ruled off from the trade above it.
    <div className="border-t border-line pt-2">
      <p className="font-semibold">
        Uses 1 credit
        {credits !== null && (
          <span className="font-medium text-muted"> · leaves you <span className="figures">{credits - 1}</span> to spend</span>
        )}
      </p>
      <p className="mt-1 text-muted">
        It's held as soon as you send. {creditReturnRule(firstName)}
        {/* Spending the last credit is the nervous moment, so the way to earn one back is named. */}
        {credits === 1 && ' Each hour you teach earns one back.'}
      </p>
    </div>
  )
}

// With no credit to spend, both ways forward are links rather than advice.
export function OutOfCreditsNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-2 text-sm">
      <p className="text-muted">This session costs 1 credit and your balance is 0. Two ways forward:</p>
      <ul className="mt-3 space-y-2">
        <li>
          <Link to="/explore?type=2way" onClick={onClose} className="rounded font-medium text-accent-strong underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            Find a free 2-way swap
          </Link>
          <span className="text-muted">, where you teach each other.</span>
        </li>
        <li>
          <Link to="/settings?tab=skills" onClick={onClose} className="rounded font-medium text-accent-strong underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent">
            Add skills you can teach
          </Link>
          <span className="text-muted">. Each hour you teach earns 1 credit.</span>
        </li>
      </ul>
    </div>
  )
}
