export type ButtonVariant = 'primary' | 'secondary'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong disabled:bg-line disabled:text-muted',
  secondary: 'border border-line bg-surface text-ink hover:bg-canvas disabled:text-muted',
}

// Shared with links styled as buttons, such as Join Meeting.
export const getButtonClasses = (variant: ButtonVariant = 'primary', className = '') =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition duration-150 outline-none hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100 motion-reduce:transform-none motion-reduce:transition-none ${VARIANTS[variant]} ${className}`
