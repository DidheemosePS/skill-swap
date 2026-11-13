# Skill Swap: Master Blueprint & Project Plan

## 1. Executive Summary & Core Architectural Mechanics

**Skill Swap** is a peer-to-peer skill-sharing platform operating on a **Hybrid Credit Model**:
* **Direct 2-Way Matches (Mutual Swap):** Free and unlimited. When User A teaches User B a skill and User B teaches User A a skill simultaneously, no credits are consumed.
* **1-Way Credit Swaps (Asynchronous Exchange):** Users earn **1 Swap Credit** by teaching a 1-hour session to a peer. Earned credits can be redeemed to book 1-hour learning sessions with any mentor across the platform, solving liquidity and match-rate bottlenecks.

---

## 2. Platform Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND ARCHITECTURE                          │
│        React (TypeScript) + Tailwind CSS + WebSocket Client            │
│               Package Manager: pnpm | Linter: oxlint                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / WSS
┌──────────────────────────────────▼─────────────────────────────────────┐
│                         BACKEND API ROUTER                             │
│       FastAPI (Python) + WebSockets Engine | Tooling: uv               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ SQLModel ORM
┌──────────────────────────────────▼─────────────────────────────────────┐
│                          DATABASE & STORAGE                            │
│                     PostgreSQL (Relational Store)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Page Breakdown & Frontend Functionality

### 🌐 1. Onboarding Flow (`/onboarding`)
* **Purpose:** Transform a newly authenticated user into a fully discoverable swapper by capturing their teach/learn inventory and recurring weekly availability.
* **Layout & Key UI Elements:**
  * Multi-step progress container (`Step 1 of 3`).
  * **Step 1 (Teach Skills):** Autocomplete search input, proficiency selector (`Beginner`, `Intermediate`, `Expert`), and removable skill badges.
  * **Step 2 (Learn Skills):** Autocomplete search input, desired target proficiency selector, and removable target skill badges.
  * **Step 3 (Availability & Reward):** Interactive 7-day calendar block grid (Mon–Sun) with selectable time slots, a live "Swap Card" preview, and a bonus reward banner (`🎁 Complete onboarding to claim 1 Free Credit`).
* **Interactions & Behavior:**
  * **Validation:** Step 1 and Step 2 require at least 1 skill selection before `Next` activates. Step 2 blocks adding skills already selected in Step 1.
  * **Completion:** Submitting Step 3 posts profile setup data, awards **1 free credit**, sets `is_onboarded = true`, and redirects to `/dashboard`.

---

### 🏠 2. Dashboard / Feed (`/dashboard`)
* **Purpose:** Operational home base displaying match recommendations, live credit balance, and upcoming appointments.
* **Layout & Key UI Elements:**
  * **Top Navigation (phones and tablets):** one 64px row: the logo mark, the wallet chip `2 credits | 2 held` (the only balance on phones; it opens a short credits panel) and the avatar menu (Public profile, Settings, Sign out; Wallet is not repeated there). Phones move the four places to fixed bottom tabs with the same counts; the tabs hide while a chat thread is open.
  * **App frame (all pages):** From 1024px a fixed left sidebar holds the logo mark, the places with icons and counts (Dashboard, Explore, Messages 2, Sessions 2), Wallet with its balance ("2 · 2 held", the balance's one place on desktop) and the account menu at the foot. A button beside the logo hides it to a 64px icon rail (counts become dots; remembered per browser).
  * **Header:** `Good evening, {first name}` in the display face with the date and a count ("3 things need you"), and `Find a swap` (to Explore) on the right.
  * **Grid:** From 1280px the work (8 columns) beside Your time and Coming up (4); phones stack now card, Needs you, Your time, Coming up, People to swap with.
    * **Now card:** the session that is joinable or starts within the hour, as a dark card with both faces (SwapPair), "Starts in 8 min", the swap's name ("Python for Spanish, with Bea"), the time range and `Join meeting`.
    * **Needs you:** toggles `Needs you N` / `Waiting on others N`; each row is a face, the name and one plain sentence ("Your Python session ended Thu 21:00", "Wants to learn Python from you") with one action (`Did it happen?`, `Confirm`, `Reply`, `View request`). No credit tags. The first 3 show, the rest behind `View all requests · N more`; `Confirm all` appears when two or more confirmations wait.
    * **Coming up:** the next 3 booked sessions: date, face, partner, "Teaching React · 18:00"; `Join` once a session opens; `All` goes to Sessions.
    * **Your time:** credits to spend and held (coral above 0) as large figures, then the taught/learned hours bar; `Wallet` link.
    * **People to swap with:** `Free swaps N` / `With a credit N` toggle and a grid of person cards (large face, name, headline, "You learn Public Speaking · 1 credit an hour" or "· they want your Python" on a soft panel, rating, `Request swap` / `Book`). An empty kind is one centred card-sized note with `Explore members`.
  * **Welcome tour:** after onboarding, a 4-step centred tour (free swaps, teach to earn, spend to learn and held credits, answering "Did it happen?") with `Skip tour`; shown once, never to existing members, replayable from Wallet. It replaces the per-row credit tags.
* **Interactions & Behavior:**
  * **Clicking "Request Swap":** Opens a time-slot proposal modal displaying the peer's availability window. Submitting creates a pending session and redirects to `/messages` with an embedded request card.
  * **Clicking "Join Meeting":** Opens the video room link in a new tab 10 minutes prior to start time and logs an attendance timestamp.

---

### 🔍 3. Explore / Search Directory (`/explore`)
* **Purpose:** Global searchable directory allowing users to discover mentors outside algorithmic feed recommendations.
* **Layout & Key UI Elements:**
  * **Search:** One large search box ("Search what you want to learn, like Python") with a themed clear button.
  * **Toolbar:** under the search, the deal switch (`All` / `Free swap` / `With a credit`) on the left and a `Filters` button (with a count of filters on) on the right. Filters opens a popover on desktop and a drawer on phones (with `Show N members`), holding Available on (`Any`, Mon–Sun), Rating (`Any` / `4.0+` / `4.5+`; members with under 3 reviews read as New member and don't pass) and `Reliable Swappers only`. The toolbar sticks under the top bar on phones. Active filters also show as removable chips in the board header. Sort (`Recommended`, `Highest rated`, `Most active`) sits in the board header beside the member count (whose tooltip explains the underline): Recommended groups by deal, the others rank everyone in one list.
  * **Exchange board:** One list grouped by the deal each member offers the current user, fixed per member so a search never changes it: **Free swaps** and **With a credit**, each heading with a count and a tooltip for its rule (the credit one adds the member's balance). Each row: name with its deal tag (`Free swap` / `1 credit`), headline, Teaches / Wants with shared or searched skills underlined, rating with the `Reliable Swapper` badge (tapping it lists the criteria), the name, photo and headline open the profile, and one button: `Book a session` (opens the request form over Explore), `Book another` with a "Booked Fri 20 Nov, 15:00 · See it" line above it when a session is already booked, or `View request` (to the thread) when a request is open. Availability and booked sessions live on the profile. Columns are fixed so rows line up. Empty states name the cause: a skill nobody teaches, or, when filters rule everyone out, a button per filter saying how many members removing it would bring back.
* **Interactions & Behavior:**
  * **Real-time Filter & Debounce:** Updates URL query state (`/explore?skill=python&type=2way`) for shareable search links and triggers debounced data fetching.
  * **Row selection:** Each row has one link: `View →` routes to the public profile (`/user/[id]`); `View request →` opens the chat.

* **Reliable Swapper criteria:** A member qualifies only when all three hold across their completed sessions: (1) at least 5 completed sessions with a ≥95% attendance rate (no unexcused teacher or learner no-shows); (2) an average review rating of 4.8★ or higher; (3) zero attendance (telemetry) disputes ruled against them in the last 30 days.

---

### 👤 4. Match Detail & Public Profile (`/user/[id]`)
* **Purpose:** Build trust and provide context on a potential mentor before initiating a swap or spending a credit.
* **Layout & Key UI Elements:**
  * **Header (unboxed):** Avatar, name, headline, then one facts line: rating, `🛡️ Reliable Swapper`, sessions completed, last active, social links (GitHub/Google).
  * **Exchange note:** The page's plum note, holding the deal between the viewer and this member: `You learn …` (with their level), the price said once (`1 h ↔ 1 h Free swap` or `1 h ↔ 1 credit You pay`), then `… learns` from you (free swap) or `Your balance 2 → 1 after booking · Held when you send. Returned if the session doesn't happen.` (credit). The action below depends on state: `Request a free swap` / `Request a session · 1 credit` (the same verb as the booking form); `View your request` when one is pending; with a session booked, the note leads with it ("Your session starts in 8 min · …", `Join meeting` once the join window opens, else `View in Sessions`) and `Request another session` (`· 1 credit` on credit members) becomes a quiet link; at 0 credits the action is replaced by links to find a free swap or add skills to earn one. The note also says when both are free ("You're both free Mon & Wed · 10:00, 11:00, 18:00", or "No shared weekly hours yet").
  * **About:** Bio, then two ruled lists, `Teaches` and `Wants to learn`, with levels; skills that match the viewer are underlined ("on your list", "you teach this").
  * **Reviews:** Verified past feedback, newest first ("Latest 3 of 31, all verified"), with star ratings and comments; the viewer's own reviews are marked "(you)".
  * **When you can meet:** Read-only weekly grid of their hours overlaid with the viewer's, both converted to the viewer's timezone (both free in plum with a white dot, only them in teal, only you dashed), trimmed to the hours either uses, with runs of empty hours folded into one "Neither free" row. Each both-free cell is a button: tapping it opens the booking form on that day with that hour already picked. On phones it comes before Reviews. The booking modal opened from the profile marks those same hours `Both free` on its time chips and warns when a session is already booked. On the viewer's own profile it's `Weekly hours` with no overlay.
* **Interactions & Behavior:**
  * **Credit Verification:** For 1-way swaps, verifies `wallet.credits >= 1`. If balance is 0, displays a prompt to earn credits by teaching.
  * **Booking Flow:** Opens the time-slot picker modal. Submitting creates a pending request and opens the chat thread.

---

### 💬 5. Messages & Real-Time Chat (`/messages`)
* **Purpose:** Real-time coordination between members via WebSockets. Before a swap is accepted, members negotiate only through the Swap Request Card, and free chat opens once a request is accepted.
* **Layout & Key UI Elements:**
  * **Conversation list:** `Messages` heading, search, `All` / `Unread N` / `Needs reply N` toggles, then one list of people ordered by who acts next (no group headings, no tags): face, name, last message, time, and a dot when unread. A row matched by a skill says so.
  * **Main Chat Pane (70%):** A header with face, name and headline, which together open the profile. Above the stream, the thing that matters with this person is pinned. When it's your move it's the dark card (with both faces and one short credit line): a request to answer (who teaches what, the credit, times as choices, `Accept`, `Suggest other times`, quiet `Decline`, "Sent 19:30 · expires in 1 d 23 h"), a session happening now or within the hour (`Join meeting` / "Starts in 8 min"), or an ended session whose outcome you owe (`Mark the outcome` / `Confirm the session`, which open the same settle drawer as the dashboard, right in the thread). Otherwise (waiting on them, or a session days away) it's a one-row paper note with `Details`. After any action a status line says what happened ("Booked. Chat is open, and the session is in Sessions.") and offers the next conversation waiting on you. Older requests are one-line history ("You sent a session request · declined · credit returned"). The stream has day dividers (Today, Yesterday, Sun 8 Nov), one time per run of messages, a `New messages` divider at the first unread, and your own sends show `Sending…`, then `Sent`, or `Couldn't send · Retry · Delete`. When chat is locked, a lock card in the composer's place (same shape as the empty-state cards) says why and the rule behind it, and `Send a new request` (offered even after you withdrew) opens the booking form in the thread; sending it closes the form and the thread shows the new request. An owed outcome names the session ("You taught Dina Python"); when a live session needs you first, it waits as an `Earlier session` row under the plum note. A booked row shows `Join opens 10 min before` without opening Details. The composer is one text box and Send on one row; messages are text only (no code sharing, since members swap any skill). One-way requests are "session requests", two-way ones "swap requests".
* **Interactions & Behavior:**
  * **WebSocket Sync:** Incoming messages append instantly.
  * **Accepting a Request:** Updates the card state to `Confirmed`, unlocks the video room link and chat for both users, and adds the event to `/sessions`.
  * **Chat Lock:** The message box is locked while a conversation has no accepted request. A request can carry one optional note of up to 200 characters, and a counter can add its own note and suggest times outside the other member's weekly hours. Chat stays open while the two members have a live or completed session, so cancelling their only session locks it again.

---

### 📅 6. Sessions Manager (`/sessions`)
* **Purpose:** Central hub to join upcoming sessions, settle ended ones, and see what each session did to the member's credits.
* **Layout & Key UI Elements (one page, no tabs, read top to bottom):**
  * **To confirm:** cards for ended sessions. Your own come first with a warm tint and a question ("Did your Python session with Dina happen?", "Bea marked your Spanish session complete"), one line on where the credit stands, and one filled action (`Did it happen?` / `Confirm`). Ones waiting on others follow as plain cards with their status.
  * **Coming up:** one card per session in time order: date block (day, number, time), both faces, the swap's name ("Teaching React to Ivo"), a quiet line (`Reschedule`, `Cancel`, or "Starts in 8 min") and one action (`Join meeting` on the session starting now, else `Chat`). Requested times are the same card, dashed and faded, with `Reply` / `View request`.
  * **Session status words (one vocabulary for To confirm and History):** `Needs your answer`, `Needs your confirmation`, `Waiting on Dina to confirm`, `No-show reported · checking records`, `Disputed · admin reviewing`, then `Completed`, `Cancelled`, `No-show · Hana didn't attend` (or `you didn't attend`). Only a completed session says "You taught …", and a cancelled one "Was to learn …".
  * **Past:** a list card: face, what happened ("You taught Dina Python"), date and status, `Leave a review` where owed, and the credit change on the right; totals beside the heading ("+4 earned · −1 spent"). The latest 5 show, then `Show all · N more`.
  * **Post-Session Drawer:** `Mark as completed` (releases or queues the credit, then the star rating) and `Report no-show`. The meeting record decides which leads: when the partner never joined or was in for under 15 minutes, `Report no-show` is the primary and the drawer states how long they were in.
* **Interactions & Behavior:**
  * **Session Settlement:** Marking a session completed releases the 1 credit escrow to the teacher. Reporting a no-show locks the credit and initiates a 24-hour verification window against attendance logs. After any settle, cancel, reschedule or review, a dismissible notice under the heading says what happened and what moved in credits ("Your 1 credit is back."). Rescheduling is a move, not a cancellation: the chat says "Session moved: new times proposed.", the old request's line reads "moved to new times by you", the reason rides on the new request as its note, and the held credit follows the new request.

---

### ⚡ 7. Wallet & Credits (`/wallet`)
* **Purpose:** Transaction ledger providing transparency over available credits, escrow holds, and lifetime learning/teaching history.
* **Layout & Key UI Elements:**
  * **Header:** `Wallet` (the balance is not repeated under it).
  * **Grid:** from 1024px the activity feed (7–8 columns) beside the balance (4–5); phones show the balance first.
  * **Balance:** a dark card with credits to spend as a large figure, "2 held for booked sessions" and the taught/learned hours bar; under it a small `How credits work` card (one line) with `Replay the tour`.
  * **Activity feed:** filter tabs (`All · Earned · Spent · Held` with counts), then entries grouped by `This week` and month: a face, one sentence ("Taught Dina Python", "Booked Spanish with Bea", "Credit back from Gus", "Welcome credit"), the date (held ones add "held until it happens · See session"), and the amount on the right (green earned, coral held).
* **Interactions & Behavior:**
  * **Ledger Filtering:** the filter is in the URL (`?filter=escrow` shows held).

---

### ⚙️ 8. Profile & Settings (`/settings`)
* **Purpose:** Manage account preferences, update skill offerings, adjust weekly availability schedules, and control privacy settings.
* **Layout & Key UI Elements:**
  * **Section Navigation:** `Profile`, `Skills`, `Availability`, `Account`: a vertical list beside the content from 1024px, a row of tabs on phones. A coral dot marks a section with unsaved edits.
  * **Panels:** each group is a card with a header row (title, one short hint, an optional link): Public profile (avatar, name, headline, bio, `View profile`); You teach / You want to learn side by side; Weekly hours (summary in the hint, timezone and a tooltip in the header); Sign-in accounts (Google/GitHub) and Sign out.
  * **Save bar:** pinned to the bottom beside the sidebar while there are unsaved edits (`Unsaved changes`, Discard, Save changes).
* **Interactions & Behavior:**
  * **State Synchronization:** Updating availability recalculates time blocks for the matching engine. Unsaved changes trigger a browser navigation prompt.

---

## 4. Frontend Component & Folder Structure

```text
skill-swap/
├── PROJECT_PLAN.md                 # Master Blueprint
├── API_INTEGRATION_MAP.md          # Backend API Contract
├── backend/                        # FastAPI Python Backend (uv)
│   ├── app.py                      # Application Entrypoint
│   ├── alembic/                    # DB Migrations
│   ├── app/
│   │   ├── api/v1/endpoints/       # Auth, Users, Skills, Matches, Sessions, Chat
│   │   ├── core/                   # Security, JWT, DB engine
│   │   ├── models/                 # SQLModel Schemas (User, Skill, Session, Wallet)
│   │   ├── services/               # Matching logic, Escrow service
│   │   └── websockets/             # Real-time chat & notification manager
│   └── pyproject.toml
│
├── frontend/                       # React TypeScript Frontend (pnpm, oxlint)
│   ├── public/                     # Static icons, badges, illustrations
│   └── src/
│       ├── components/
│       │   ├── common/             # Navbar, Footer, Modal, Toast, Button, Badge
│       │   ├── cards/              # SwapCard, MentorCard, ReviewCard, StatCard
│       │   ├── chat/               # ChatBox, MessageBubble, SwapRequestCard
│       │   ├── schedule/           # AvailabilityGrid, TimeSlotPicker, CalendarView
│       │   └── wallet/             # CreditSummaryCard, TransactionTable
│       │
│       ├── context/                # AuthContext, WebSocketContext, WalletContext
│       ├── data/                   # mockData.ts (Frontend Mock Data)
│       ├── hooks/                  # useAuth, useWebSocket, useMatchEngine, useDebounce
│       ├── pages/                  # React Route Components / Views
│       │   ├── OnboardingPage.tsx  # Multi-step Onboarding Flow
│       │   ├── DashboardPage.tsx   # Main Operational Feed
│       │   ├── ExplorePage.tsx     # Global Directory & Filters
│       │   ├── UserProfilePage.tsx # Public Mentor Profile
│       │   ├── MessagesPage.tsx    # Real-time Chat
│       │   ├── SessionsPage.tsx    # Sessions Manager & Post-Session Actions
│       │   ├── WalletPage.tsx      # Credit Ledger
│       │   └── SettingsPage.tsx    # User Settings & Schedule Configuration
│       │
│       ├── services/               # Axios/Fetch API wrapper functions
│       ├── styles/                 # Tailwind global styles
│       ├── types/                  # TypeScript interfaces (User, Skill, Session, Transaction)
│       └── utils/                  # Date formatters, time slot logic, availability helpers
│
├── docker-compose.yml              # Local container orchestration
└── README.md
```