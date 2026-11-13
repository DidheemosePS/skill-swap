# Skill Swap

A peer-to-peer skill-sharing platform. Members list what they can teach and what they want to learn, find a peer, agree on a time, and meet for a live one-hour online session, without paying money.

## How it works

- **Free two-way swaps.** You teach someone while they teach you. No credits change hands.
- **One-way sessions with credits.** Teaching an hour earns 1 credit; a credit books an hour with anyone. This removes the need for a perfect mutual match.
- **Booking.** A request proposes up to three times from the other member's weekly hours. They can accept one, suggest other times, or decline. Chat opens once a time is agreed.
- **Settling.** A learner's credit is held until the session happens. After it ends, members confirm it happened (or report a no-show), and the credit is released or returned.
- **Trust.** Ratings, reviews and a Reliable Swapper badge help members choose who to book.

## Status

| Part | State |
| --- | --- |
| Frontend | Complete, running on mock data |
| Backend (FastAPI, PostgreSQL) | Planned; the contract is in [`frontend/API_INTEGRATION_MAP.md`](frontend/API_INTEGRATION_MAP.md) |

## Pages

| Route | What it does |
| --- | --- |
| `/onboarding` | Three steps: skills you teach, skills you want, weekly hours. Ends with a short welcome tour. |
| `/dashboard` | The session starting soon, your turn and their turn, your credits, what's coming up, and people to swap with. |
| `/explore` | Search and filter members, grouped into free swaps and credit sessions. Book straight from a card. |
| `/user/:id` | A member's profile: what they teach, when you can both meet, reviews, and booking. |
| `/messages` | Conversations, request cards with accept and suggest-times, and chat once a time is agreed. |
| `/sessions` | Sessions to confirm, ones under review, what's coming up, and past sessions with credits moved. |
| `/wallet` | Your balance, held credits, and every credit earned or spent. |
| `/settings` | Profile, skills, weekly hours, sign-in accounts and sign out. |

## Tech stack

- React 19, TypeScript, Vite, React Router 7
- Tailwind CSS 4 with design tokens in `frontend/src/styles/globals.css`
- React Compiler, oxlint
- Fonts: Bricolage Grotesque (headings) and Instrument Sans (text), self-hosted

## Getting started

Requirements: Node 20 or newer and [pnpm](https://pnpm.io).

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:5173
```

Other commands:

```bash
pnpm tsc -b       # typecheck
pnpm oxlint       # lint
pnpm build        # production build
```

## Mock data and demo modes

The frontend works without a backend. Every service in `frontend/src/services/` reads from `frontend/src/data/` through `mockRequest`, which adds a short delay so loading states are visible. Environment variables switch the mocks into other states, which is useful for reviewing the design:

| Variable | Effect | Example |
| --- | --- | --- |
| `VITE_MOCK_EMPTY` | Returns empty data for the listed features. `me` makes you a brand-new member who sees onboarding. | `VITE_MOCK_EMPTY=matches,members,conversations pnpm dev` |
| `VITE_MOCK_FAIL` | Makes the listed requests fail, to see error cards and toasts. | `VITE_MOCK_FAIL=swap-action,save-settings pnpm dev` |
| `VITE_MOCK_LATENCY` | Sets the mock delay in milliseconds. | `VITE_MOCK_LATENCY=2500 pnpm dev` |

Feature names match the first argument of each `mockRequest(...)` call in `frontend/src/services/`.

## Project layout

```
frontend/src/
  pages/        one file per route
  components/   cards, chat, common, dashboard, schedule, settings, wallet
  hooks/        data and UI hooks
  context/      auth, wallet, WebSocket and toast providers
  services/     API layer (mocked today)
  data/         mock fixtures
  types/        shared TypeScript types
  utils/        pure helpers
```

## Documentation

- [`PROJECT_PLAN.md`](PROJECT_PLAN.md): product requirements, pages and flows
- [`PRODUCT.md`](PRODUCT.md): who it's for and the product principles
- [`DESIGN.md`](DESIGN.md): the visual system ("People & swap") and component rules
- [`frontend/API_INTEGRATION_MAP.md`](frontend/API_INTEGRATION_MAP.md): every endpoint, payload and response the backend needs to provide

## License

[MIT](LICENSE) © 2026 DidheemosePS. Fonts, libraries and provider logos keep their own licenses; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
