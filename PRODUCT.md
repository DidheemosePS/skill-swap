# Product

## Platform

web

## Users

Any adult learner who has a skill to teach and a skill they want to learn: languages, music, cooking, design, code, or anything teachable in a 1-hour online session. They use Skill Swap to find a peer, agree on a time, and meet for a live session, without paying money.

## Product Purpose

A peer-to-peer skill-sharing platform. Members list what they can teach and what they want to learn, set weekly availability, and get matched with peers. Success is a booked, attended, and completed 1-hour session that both members rate.

## Positioning

A **Hybrid Credit Model**:

- **Direct 2-way swaps (mutual):** free and unlimited. A teaches B while B teaches A; no credits change hands.
- **1-way credit swaps:** teaching a 1-hour session earns 1 Swap Credit; a credit books a 1-hour session with any mentor. This removes the need for a perfect mutual match.

## Operating Context

- Sign-in, then a 3-step onboarding (teach skills, learn skills, weekly availability) that awards 1 free credit.
- Booking: a request proposes time slots from the peer's availability; the peer can Accept, Counter, or Decline inside an embedded Swap Request Card in chat. Chat is locked until a request is accepted. Requests and counters carry an optional note (max 200 chars).
- Sessions are fixed at 1 hour, online, with an auto-generated meeting link on confirmation. Join opens 10 minutes before start.
- Settlement: credit is held in escrow; "Mark as completed" releases it to the teacher and triggers a rating; "Report no-show" locks it for a 24-hour verification window.
- Pages and routing are fixed by `PROJECT_PLAN.md`: `/onboarding`, `/dashboard`, `/explore`, `/user/[id]`, `/messages`, `/sessions`, `/wallet`, `/settings`.

## Capabilities and Constraints

- Stack: React + TypeScript + Tailwind (pnpm, oxlint) frontend; FastAPI + WebSockets (uv) backend; PostgreSQL via SQLModel.
- Frontend currently runs on mock data (`frontend/src/data/mockData.ts`); backend contract lives in `frontend/API_INTEGRATION_MAP.md`.
- Every data surface must handle loading, error, and empty states.
- **Reliable Swapper badge:** a member qualifies only when all three hold across their completed sessions: (1) at least 5 completed sessions with a ≥95% attendance rate (no unexcused teacher or learner no-shows); (2) an average review rating of 4.8★ or higher; (3) zero attendance (telemetry) disputes ruled against them in the last 30 days. The backend computes it (`is_reliable`); the frontend only displays it and explains the criteria where it appears.
- `PROJECT_PLAN.md` is the source of truth; no new pages or routing changes.
- Undecided: notification/email delivery, cancellation rules, account linking across providers.

## Evidence on Hand

None. Pre-launch: no real members, reviews, ratings, session counts, testimonials, or partner logos. All people and numbers in the UI are mock fixtures and must never be presented as real social proof.

## Product Principles

1. **Getting to a booked session is the job.** Every surface should shorten the path from "found someone" to "meeting confirmed".
2. **Free mutual swaps first, credits as the fallback.** The 2-way swap is the default story; credits exist to solve liquidity, not to monetise.
3. **Trust before commitment.** Show reliability, availability, and what each side teaches before anyone spends a credit or an hour.
4. **Money-like state is never ambiguous.** Credit balance, escrow, and settlement status are always explicit and legible.
5. **Open to any skill.** Nothing in copy or structure should assume members are developers.

## Accessibility & Inclusion

No formal standard yet; follow WCAG AA for contrast, focus states and touch targets.
