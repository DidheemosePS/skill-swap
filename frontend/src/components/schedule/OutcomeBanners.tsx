import type { SessionDetail } from '../../types'
import Button from '../common/Button'

interface OutcomeBannersProps {
  needsOutcome: SessionDetail[]
  needsConfirmation: SessionDetail[]
  onResolve: (session: SessionDetail) => void
  onConfirm: (session: SessionDetail) => void
}

function Banner({ message, action, onClick }: { message: string; action: string; onClick: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-accent-strong">{message}</p>
      <Button onClick={onClick} className="shrink-0">{action}</Button>
    </div>
  )
}

export default function OutcomeBanners({ needsOutcome, needsConfirmation, onResolve, onConfirm }: OutcomeBannersProps) {
  return (
    <>
      {needsConfirmation.map((session) => (
        <Banner
          key={session.id}
          message={`${session.partner.name} marked your session completed. Please confirm it or raise a dispute.`}
          action="Confirm or dispute"
          onClick={() => onConfirm(session)}
        />
      ))}
      {needsOutcome.map((session) => (
        <Banner
          key={session.id}
          message={`Your session with ${session.partner.name} has ended. How did it go?`}
          action="Mark outcome"
          onClick={() => onResolve(session)}
        />
      ))}
    </>
  )
}
