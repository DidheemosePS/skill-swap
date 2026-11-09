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
  * **Top Navigation:** Logo, wallet badge (`⚡ 2 Credits`), notifications bell, avatar menu.
  * **Split View Layout (70/30):**
    * **Left Feed (70%):** Tab switcher (`🔥 Direct 2-Way Matches` vs. `⚡ 1-Way Credit Matches`), recommendation feed containing match cards with peer info, star ratings, skill alignment badges, and match percentage scores.
    * **Right Sidebar (30%):** Upcoming sessions widget with countdown timers, a quick-join meeting button, and wallet stats summary.
* **Interactions & Behavior:**
  * **Tab Switching:** Filters feed recommendations in local state without page reloads.
  * **Clicking "Request Swap":** Opens a time-slot proposal modal displaying the peer's availability window. Submitting creates a pending session and redirects to `/messages` with an embedded request card.
  * **Clicking "Join Meeting":** Opens the video room link in a new tab 10 minutes prior to start time and logs an attendance timestamp.

---

### 🔍 3. Explore / Search Directory (`/explore`)
* **Purpose:** Global searchable directory allowing users to discover mentors outside algorithmic feed recommendations.
* **Layout & Key UI Elements:**
  * **Control Bar:** Search input, filter dropdowns (Swap Type, Minimum Rating `⭐ 4.5+`, Availability Day), and sorting options (`Recommended`, `Highest Rated`, `Most Active`).
  * **Directory Grid:** Responsive card layout showing user avatars, reliability badges (`🛡️ Reliable Swapper`), skill pills, and an action button (`View Profile & Request`).
* **Interactions & Behavior:**
  * **Real-time Filter & Debounce:** Updates URL query state (`/explore?skill=python&type=2way`) for shareable search links and triggers debounced data fetching.
  * **Card Selection:** Routes directly to the mentor's public profile page (`/user/[id]`).

---

### 👤 4. Match Detail & Public Profile (`/user/[id]`)
* **Purpose:** Build trust and provide context on a potential mentor before initiating a swap or spending a credit.
* **Layout & Key UI Elements:**
  * **Header:** Hero card with avatar, social proof links (GitHub/Google), reliability rating, and total completed session count.
  * **Skill Matrix:** Dual boxes outlining *"Skills They Can Teach"* and *"Skills They Want to Learn"*.
  * **Read-Only Availability Grid:** Visual weekly schedule showing their free time blocks.
  * **Reviews Feed:** Verified past feedback from other learners with star ratings and comments.
  * **Sticky Action Bar:** `Request Free 2-Way Swap` or `Book Session with 1 Credit`.
* **Interactions & Behavior:**
  * **Credit Verification:** For 1-way swaps, verifies `wallet.credits >= 1`. If balance is 0, displays a prompt to earn credits by teaching.
  * **Booking Flow:** Opens the time-slot picker modal. Submitting creates a pending request and opens the chat thread.

---

### 💬 5. Messages & Real-Time Chat (`/messages`)
* **Purpose:** Real-time coordination between members via WebSockets. Before a swap is accepted, members negotiate only through the Swap Request Card, and free chat opens once a request is accepted.
* **Layout & Key UI Elements:**
  * **Left Sidebar (30%):** Conversation list sorted by recent activity with unread indicators.
  * **Main Chat Pane (70%):** Message stream with timestamps, text input, code snippet sharing, and **Embedded Swap Request Cards**.
  * **Swap Request Card:** Live state card inside the chat stream displaying proposed time slots, status (`Pending`, `Confirmed`, `Declined`), action buttons (`Accept`, `Counter`, `Decline`), and an auto-generated meeting link upon confirmation.
* **Interactions & Behavior:**
  * **WebSocket Sync:** Incoming messages append instantly.
  * **Accepting a Request:** Updates the card state to `Confirmed`, unlocks the video room link and chat for both users, and adds the event to `/sessions`.
  * **Chat Lock:** The message box is locked while a conversation has no accepted request. A request can carry one optional note of up to 200 characters, and a counter can add its own note and suggest times outside the other member's weekly hours. Chat stays open while the two members have a live or completed session, so cancelling their only session locks it again.

---

### 📅 6. Sessions Manager (`/sessions`)
* **Purpose:** Central calendar hub to manage upcoming swap appointments, enter live video rooms, and resolve post-session status.
* **Layout & Key UI Elements:**
  * **Tab Switcher:** `Upcoming Sessions` vs. `Past & Completed Sessions`.
  * **Session Cards:** Displays partner info, topic, scheduled date/time, countdown timer, `🎥 Join Meeting` button, and `Chat / Reschedule` options.
  * **Post-Session Drawer:** Appears after session end time with `Mark as Completed` (triggers star rating modal and releases credit) and `Report No-Show` options.
* **Interactions & Behavior:**
  * **Session Settlement:** Marking a session completed releases the 1 credit escrow to the teacher. Reporting a no-show locks the credit and initiates a 24-hour verification window against attendance logs.

---

### ⚡ 7. Wallet & Credits (`/wallet`)
* **Purpose:** Transaction ledger providing transparency over available credits, escrow holds, and lifetime learning/teaching history.
* **Layout & Key UI Elements:**
  * **Top Summary Cards:** Available Balance (`⚡ 2 Credits`), Escrow Hold (`🔒 1 Credit`), and Lifetime Stats (Hours Taught vs. Hours Learned).
  * **Ledger Table:** Chronological table displaying Date, Transaction Type (`Teaching Reward`, `Session Booking`, `Escrow Refund`), Partner Name, Amount (`+1` / `-1`), and Status (`Settled`, `In Escrow`).
* **Interactions & Behavior:**
  * **Ledger Filtering:** Filter rows instantly by `Earned`, `Spent`, or `Escrow`. Clicking escrow items reveals linked session booking details.

---

### ⚙️ 8. Profile & Settings (`/settings`)
* **Purpose:** Manage account preferences, update skill offerings, adjust weekly availability schedules, and control privacy settings.
* **Layout & Key UI Elements:**
  * **Tabbed Navigation:** `Public Profile`, `Skills & Expertise`, `Weekly Availability`, `Account & Security`.
  * **Form Controls:** Profile bio inputs, tag-management components for teach/learn skills, interactive weekly availability editor, and connected authentication links (Google/GitHub).
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