import Button from './Button'

interface AlertBannerProps {
  message: string
  onRetry?: () => void
}

export default function AlertBanner({ message, onRetry }: AlertBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="shrink-0">
          Try again
        </Button>
      )}
    </div>
  )
}
