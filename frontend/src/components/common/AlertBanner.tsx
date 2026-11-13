import Button from './Button'
import StateCard from './StateCard'
import type { StateTone } from './StateCard'
import { ErrorMark } from './stateIcons'

interface AlertBannerProps {
  message: string
  onRetry?: () => void
  tone?: StateTone
}

// Something that should be on the page didn't load. Same card as the empty states, with an error mark and a
// retry, so the page keeps its shape. Failed actions don't use this: they raise a toast (useToast).
export default function AlertBanner({ message, onRetry, tone = 'card' }: AlertBannerProps) {
  return (
    <StateCard
      role="alert"
      visual={<ErrorMark />}
      title={message}
      tone={tone}
      action={onRetry && <Button variant="secondary" onClick={onRetry} className="lg:min-h-9 lg:px-4">Try again</Button>}
    />
  )
}
