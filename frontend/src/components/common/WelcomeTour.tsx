import { useEffect, useRef, useState } from 'react'
import { useCurrentUser } from '../../hooks/useAuth'
import Button from './Button'
import SwapPair from './SwapPair'

// The four ideas behind every tag the app used to print on each row, said once, in order.
const STEPS = [
  { title: 'Swap an hour for an hour', body: 'When you each teach something the other wants, it’s a free swap. No credits move.' },
  { title: 'Teach to earn', body: 'Teach someone for an hour and you earn 1 credit.' },
  { title: 'Spend to learn from anyone', body: '1 credit books an hour with anyone. It’s held until the session happens, and comes back if it doesn’t.' },
  { title: 'It settles itself', body: 'The meeting records who joined, and the credit moves 24 hours after the session ends. If something went wrong, raise a concern before then.' },
]

// A short welcome for new members, centred over the dashboard. Esc or Skip ends it; it never comes back
// on its own (useWelcomeTour), and the Wallet page can replay it.
export default function WelcomeTour({ onClose }: { onClose: () => void }) {
  const me = useCurrentUser()
  const [step, setStep] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-surface p-7 text-center text-ink shadow-[0_24px_60px_rgb(22_24_29/0.25)] backdrop:bg-ink/40"
    >
      <div className="flex justify-center">
        <SwapPair me={me} partner={{ name: 'Swap Partner', avatarUrl: null }} size="lg" />
      </div>
      <p className="figures mt-5 text-sm text-faint">{step + 1} of {STEPS.length}</p>
      <h2 id="tour-title" className="mt-1 text-2xl font-semibold text-balance">{STEPS[step].title}</h2>
      <p id="tour-body" className="mt-2 text-pretty text-muted">{STEPS[step].body}</p>
      <div aria-hidden="true" className="mt-5 flex justify-center gap-1.5">
        {STEPS.map((item, index) => <span key={item.title} className={`size-2 rounded-full ${index === step ? 'bg-ink' : 'bg-line'}`} />)}
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center rounded px-2 text-sm font-medium text-muted outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent">
          {isLast ? 'Close' : 'Skip tour'}
        </button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={() => (isLast ? onClose() : setStep(step + 1))}>{isLast ? 'Start swapping' : 'Next'}</Button>
        </div>
      </div>
    </dialog>
  )
}
