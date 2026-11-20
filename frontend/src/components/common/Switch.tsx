interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  // Points at the visible text that names the setting.
  labelledBy: string
  describedBy?: string
}

// An on/off setting that takes effect as a choice (here, saved with the form): a sliding knob, near-black when on.
export default function Switch({ checked, onChange, labelledBy, describedBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      // 44px tall hit area around a 24px track.
      className="group inline-flex min-h-11 shrink-0 items-center rounded-full outline-none"
    >
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 motion-reduce:transition-none ${checked ? 'bg-next' : 'bg-line-strong'}`}>
        <span className={`size-5 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform motion-reduce:transition-none ${checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`} />
      </span>
    </button>
  )
}
