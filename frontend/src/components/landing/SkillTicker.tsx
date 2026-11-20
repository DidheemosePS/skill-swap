import { useState } from 'react'
import Avatar from '../common/Avatar'
import { TICKER_TRADES } from '../../data/landingDemo'

// Two counter-scrolling rows of example trades along the bottom of the dark hero band.
// Decorative (aria-hidden, duplicated content for the seamless loop), so the caption
// above carries the honest, readable version: these people are examples until launch.
function TickerRow({ trades, reverse, paused }: { trades: ReadonlyArray<readonly [string, string]>; reverse: boolean; paused: boolean }) {
  return (
    <div className="group overflow-hidden" aria-hidden="true">
      <div
        // Inline, because the animate shorthand (inside motion-safe) would reset a play-state class back to running.
        style={paused ? { animationPlayState: 'paused' } : undefined}
        className={`flex w-max gap-2.5 group-hover:[animation-play-state:paused] ${
          reverse ? 'motion-safe:animate-[tick_56s_linear_infinite] [animation-direction:reverse]' : 'motion-safe:animate-[tick_48s_linear_infinite]'
        }`}
      >
        {/* Rendered twice: the keyframe slides half the track width, landing exactly on the copy. */}
        {[0, 1].map((copy) =>
          trades.map(([name, skill]) => (
            <span
              key={`${copy}-${name}-${skill}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pr-3.5 pl-1.5 text-[0.8125rem] font-medium whitespace-nowrap text-white/80"
            >
              <Avatar name={name} url={null} size="xs" />
              {name} teaches <span className="font-semibold text-white">{skill}</span>
            </span>
          )),
        )}
      </div>
    </div>
  )
}

export default function SkillTicker() {
  // Motion that runs past five seconds needs a way to stop it (WCAG 2.2.2); hover alone misses touch and keyboard.
  const [isPaused, setIsPaused] = useState(false)
  const even = TICKER_TRADES.filter((_, index) => index % 2 === 0)
  const odd = TICKER_TRADES.filter((_, index) => index % 2 === 1)
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 pb-9">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">What members trade · example people until launch</p>
        <button
          type="button"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-pressed={isPaused}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-white/70 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white motion-reduce:hidden"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
            {isPaused ? <path d="M4.5 3v10l8-5z" /> : <path d="M4 3h3v10H4zM9 3h3v10H9z" />}
          </svg>
          {isPaused ? 'Play' : 'Pause'}
        </button>
      </div>
      {/* The rows end on the content edges and fade out there, instead of running off both sides of the screen. */}
      <div className="flex flex-col gap-2.5 [mask-image:linear-gradient(to_right,transparent,black_2.5rem,black_calc(100%-2.5rem),transparent)]">
        <TickerRow trades={even} reverse={false} paused={isPaused} />
        <TickerRow trades={odd} reverse paused={isPaused} />
      </div>
    </div>
  )
}
