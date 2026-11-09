interface StepIndicatorProps {
  steps: string[]
  current: number
}

export default function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="text-sm font-medium text-muted">
        Step {current} of {steps.length}
      </p>
      <ol className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((label, index) => {
          const position = index + 1
          return (
            <li key={label} aria-current={position === current ? 'step' : undefined}>
              <span
                aria-hidden="true"
                className={`block h-1 rounded-full transition-colors ${position <= current ? 'bg-accent' : 'bg-line'}`}
              />
              <span
                className={`mt-2 block text-xs sm:text-sm ${position === current ? 'font-semibold text-ink' : 'text-muted'}`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
