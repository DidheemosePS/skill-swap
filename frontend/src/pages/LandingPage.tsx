import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CreditModel from '../components/landing/CreditModel'
import HowItWorks from '../components/landing/HowItWorks'
import LandingClosing, { LandingFooter } from '../components/landing/LandingClosing'
import LandingFaq from '../components/landing/LandingFaq'
import LandingHeader from '../components/landing/LandingHeader'
import SkillTicker from '../components/landing/SkillTicker'
import SwapDemo from '../components/landing/SwapDemo'
import TrustPanel from '../components/landing/TrustPanel'
import { getButtonClasses } from '../components/common/buttonStyles'

// The public landing page: the only Persuade surface, outside AuthGate. It renders
// immediately for everyone (a marketing page never blocks on auth); a signed-in
// member sees it too, with every sign-in action swapped for a way into the app.
export default function LandingPage() {
  const { user, status } = useAuth()

  return (
    <div id="top">
      <title>Skill Swap · Teach an hour, learn an hour</title>
      <LandingHeader />

      {/* One main landmark from the hero to the closing section; the footer stays outside it. */}
      <main id="main">
        {/* The hero band: the brand's ultramarine as a full-bleed ground, the demo floating on it. */}
        <section className="bg-next text-white">
          <div className="mx-auto grid max-w-6xl gap-9 px-4 pt-12 pb-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pt-16 lg:pb-12">
            <div>
              <h1 className="font-display text-[2.4rem] leading-[1.06] font-semibold tracking-tight text-balance sm:text-6xl">
                {/* The category leads the h1, so the first thing read (and indexed) says what this is. */}
                <span className="mb-4 block font-sans text-sm font-semibold tracking-wide text-white/70 uppercase">A peer-to-peer skill exchange</span>
                Teach an hour.
                <br />
                <span aria-hidden="true" className="whitespace-nowrap text-white/40">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline size-[0.72em] align-[-0.08em]">
                    <path d="M3 5.5h9.5L10 3M13 10.5H3.5L6 13" />
                  </svg>
                </span>
                Learn an hour.
              </h1>
              <p className="mt-4.5 max-w-lg text-[1.0625rem] text-white/70">
                Skill Swap matches you with people who want what you know and know what you want. Swap directly for free, or teach anyone to earn a credit and spend it learning from anyone.
              </p>
              <div className="mt-6.5 flex flex-wrap gap-3">
                {user ? (
                  <Link to="/dashboard" className={getButtonClasses('onNext')}>
                    Go to your dashboard
                  </Link>
                ) : status === 'loading' ? (
                  // Placeholder in the button's shape (Skeleton's grey is for light surfaces,
                  // so the dark band draws its own), keeping the CTA from flashing at members.
                  <span aria-hidden="true" className="inline-flex h-11 w-60 max-w-full animate-pulse rounded-xl bg-white/10 motion-reduce:animate-none" />
                ) : (
                  <Link to="/login" className={getButtonClasses('onNext')}>
                    Get started with a free credit
                  </Link>
                )}
                <a href="#how" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-medium text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-next">
                  See how it works
                </a>
              </div>
              <p className="figures mt-3.5 text-sm text-white/75">1 hour taught earns 1 credit. Your first credit is free, and no money ever changes hands.</p>
            </div>
            <SwapDemo />
          </div>
          <SkillTicker />
        </section>

        <HowItWorks />
        <CreditModel />
        <TrustPanel />
        <LandingFaq />
        <LandingClosing />
      </main>
      <LandingFooter />
    </div>
  )
}
