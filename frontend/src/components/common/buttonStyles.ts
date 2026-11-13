export type ButtonVariant = 'primary' | 'secondary' | 'onNext'

const VARIANTS: Record<ButtonVariant, string> = {
  // Near-black: the primary is the member's next step; Airtable's confident, final button.
  // Disabled drops to a grey fill with muted text, so it reads as unavailable rather than as a faded primary.
  primary: 'bg-next text-white hover:bg-next-strong disabled:bg-next-soft disabled:text-muted',
  secondary: 'border border-line bg-surface text-ink hover:border-muted hover:bg-canvas disabled:text-muted',
  // The action on a dark card (Join): white on near-black, with a ring that shows on the dark ground.
  onNext: 'bg-white text-ink hover:bg-next-soft focus-visible:ring-white focus-visible:ring-offset-next',
}

// Shared with links styled as buttons, such as Join meeting.
export const getButtonClasses = (variant: ButtonVariant = 'primary', className = '') =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium whitespace-nowrap transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:scale-100 motion-reduce:transform-none motion-reduce:transition-none ${VARIANTS[variant]} ${className}`

// A switch between views (tabs, deal toggles): the chosen one is near-black with white text, the rest quiet.
// A count inside dims with opacity, so it reads on either fill.
export const getToggleClasses = (isOn: boolean, className = '') =>
  `inline-flex min-h-11 shrink-0 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 lg:min-h-9 ${
    isOn ? 'bg-next text-white' : 'text-muted hover:bg-canvas hover:text-ink'
  } ${className}`
