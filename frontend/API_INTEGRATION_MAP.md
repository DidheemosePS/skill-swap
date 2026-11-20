# API Integration Map

Every endpoint the frontend calls. Requests and responses use snake_case; `src/services/` maps them to the camelCase types in `src/types/`. Dates are ISO 8601 UTC. Base path: `/api/v1`.

The services currently return mock data through `src/services/mockClient.ts`. Set `VITE_MOCK_FAIL` to a comma-separated list of feature names to simulate a failure.

The public landing page (`/`) calls no endpoints: its "Try a swap" demo runs entirely on fixtures in `src/data/landingDemo.ts`, and it only reads the already-loaded `AuthProvider` state to redirect signed-in members.

## Auth

The session is an HTTP-only cookie set by the OAuth callback; no token is handled in JavaScript. Every endpoint below and in the rest of this map identifies the member from that session, never from a user ID in the request. Any request without a valid session responds `401`. The frontend handles `401` from `GET /users/me` by redirecting to `/login` (`AuthGate`), carrying the wanted URL in router state so `LoginPage` returns the member there after sign-in; a signed-in visit to `/login` is forwarded without showing the form.

### `GET /users/me` (`fetchCurrentUser`, mock feature `me`)

Loaded once by `AuthProvider` on start-up, and again after saving settings. Response `200`:

```json
{ "id": "user-alex", "name": "Alex Sample", "avatar_url": null, "is_onboarded": true }
```

`AuthGate` sends members with `is_onboarded: false` to `/onboarding` from every route, and sends onboarded members away from `/onboarding` to `/dashboard`. In the mock, `VITE_MOCK_EMPTY=me` starts Alex as not onboarded so the onboarding flow can be tried. The mock session persists in `localStorage` (`mock-session`) and a first visit starts signed out, so `/` shows the landing page the way a real visitor sees it; sign in once from any CTA and it sticks until Sign out.

### `GET /auth/{provider}/login?return_to=...` (`signIn`, mock feature `sign-in`)

`provider` is `google` or `github`. A browser redirect to the provider's OAuth page. The callback creates the member on first sign-in (`is_onboarded: false`), sets the session cookie and redirects to `return_to`, a same-site path only. The mock resolves in place.

### `POST /auth/sign-out` (`signOut`, mock feature `sign-out`)

Ends the session on this device. Response `204`. The frontend then clears the member, and `AuthGate` shows the sign-in panel in place. Mock sign-in state lives in memory, so a browser refresh signs the mock back in.

## Skills

### `GET /skills` (`fetchSkills`, mock feature `skills`)

Response `200`:

```json
[{ "id": "skill-python", "name": "Python", "category": "Programming" }]
```

## Dashboard

### `GET /matches` (`fetchMatches`, mock feature `matches`)

Returns the current user's recommendations, highest score first. `peer` is the full public user object.

```json
[{
  "id": "match-bea",
  "peer_id": "user-bea",
  "swap_type": "two_way",
  "score": 96,
  "teaches_you": ["skill-spanish"],
  "learns_from_you": ["skill-python"],
  "credit_cost": 0,
  "has_pending_request": false,
  "pending_request_from": null,
  "pending_request": null,
  "next_session_at": null,
  "peer": { "id": "user-bea", "name": "Bea Example", "avatar_url": null, "headline": "...", "rating": 4.9, "review_count": 31, "is_reliable": true, "teach_skills": [], "learn_skills": [], "availability": { "timezone": "UTC", "slots": [{ "day": "mon", "start_hour": 10 }] } }
}]
```

`pending_request_from` is `"me"` when the signed-in member sent the live pending request (a one-way request then holds 1 credit), `"them"` when the peer sent it, and `null` when there is none. `has_pending_request` stays for compatibility and equals `pending_request_from != null`. `pending_request` is `null` or `{ "id": "req-evan", "proposed_slots": ["2026-11-14T10:00:00Z"], "skill_name": "Python", "awaiting_me": true }`; `awaiting_me` is true when the peer proposed the current times. The dashboard uses it to call the existing accept (`POST /swap-requests/{id}/accept`), decline and cancel endpoints straight from the row.

### `GET /sessions?status=upcoming` (`fetchUpcomingSessions`, mock feature `sessions`)

Returns confirmed sessions that haven't ended, soonest first.

```json
[{
  "id": "session-bea-soon",
  "swap_type": "two_way",
  "teacher_id": "user-alex",
  "learner_id": "user-bea",
  "skill_id": "skill-python",
  "return_skill_id": "skill-spanish",
  "starts_at": "2026-11-07T18:00:00Z",
  "duration_minutes": 60,
  "status": "confirmed",
  "attendance": [],
  "partner": { "id": "user-bea", "name": "Bea Example", "avatar_url": null },
  "skill_name": "Python",
  "is_teaching": true
}]
```

### `GET /swap-requests?status=pending` (`fetchRequestedSessions`, mock feature `requested-sessions`)

Open requests in either direction, for the Sessions agenda, which shows each one faded at its first proposed time. If it fails, the page still shows booked sessions and says requests couldn't load.

```json
[{
  "request_id": "request-evan",
  "partner": { "id": "user-evan", "name": "Evan Fixture", "avatar_url": null },
  "skill_name": "Python",
  "swap_type": "one_way",
  "is_teaching": true,
  "proposed_slots": ["2026-11-17T09:00:00Z", "2026-11-17T10:00:00Z"],
  "awaiting_me": true,
  "return_skill_name": null,
  "expires_at": "2026-11-14T09:00:00Z"
}]
```

### `GET /sessions` (`fetchMySessions`, mock feature `my-sessions`)

All of the current user's sessions except `pending` ones. Each has the fields shown above, plus the following. The client sorts them into the page's sections (Settling, Under review, Coming up, Past) and works out each history row's credit change (`+1` taught, `−1` learned, `0` for a free swap, a cancellation or a refund after the teacher was absent).

```json
{
  "return_skill_name": "Spanish",
  "conversation_exists": true,
  "has_my_review": false,
  "attendance": [
    { "user_id": "user-alex", "joined_at": "2026-11-07T09:59:00Z", "left_at": "2026-11-07T11:00:00Z", "duration_minutes": 60 }
  ],
  "expected_outcome": "completed",
  "settles_at": "2026-11-08T11:00:00Z",
  "confirmed_by": ["user-dina"],
  "no_show": { "absent_id": "user-dina" },
  "dispute": { "raised_by": "user-alex", "reason": "Dina joined but left after ten minutes.", "raised_at": "2026-11-07T11:30:00Z" },
  "cancellation": { "cancelled_by": "user-alex", "reason": "...", "cancelled_at": "2026-11-07T10:00:00Z", "late": false }
}
```

`status` also includes `awaiting_settlement`, `completed`, `disputed`, `no_show_confirmed`, `mutual_no_show` and `cancelled`. `teacher_id` and `learner_id` aren't stored: the backend fills them from the request (the recipient teaches, the requester learns).

- `attendance` has one record per member, built from the video provider's webhooks. `left_at` is `null` while they're in the call, and `duration_minutes` is their total time in it.
- `expected_outcome` is set while `awaiting_settlement`: `completed`, `no_show_teacher`, `no_show_learner` or `mutual_no_show`, worked out from `attendance` by the rules below, with `settles_at` (the end time plus 24 hours). The Settling cards show it.
- `confirmed_by` lists the members who pressed `Confirm now` while `awaiting_settlement`; the card shows "You confirmed · waiting on Dina" once the current user is in it.
- `no_show` is set with `no_show_confirmed`: `{ "absent_id": ... }`.
- `dispute` is set when a member raised a concern: `{ "raised_by", "reason", "raised_at" }`.
- `cancellation` is `{ "cancelled_by", "reason", "cancelled_at", "late": true }`; `late` is true after the 2-hour cutoff.

#### Outcome rules (automatic, from attendance only)

At the scheduled end, a session moves from `confirmed` to `awaiting_settlement`. A member counts as present if the provider recorded them in the call at any time before the scheduled end, so joining late still counts.

| Present | Outcome | One-way credit | Reliability |
|---|---|---|---|
| both | `completed` | released to the teacher | none |
| learner only | `no_show_confirmed`, teacher absent | refunded to the learner (`escrow_refund`) | teacher marked absent |
| teacher only | `no_show_confirmed`, learner absent | released to the teacher | learner marked absent |
| neither | `mutual_no_show` | refunded to the learner | both marked absent |

A two-way swap moves no credit, but the same outcomes and absence marks apply. Members never report each other. The credit moves when the 24-hour concern window closes, or at once if both members confirm.

#### Scheduled backend jobs

- `pending` request whose `expires_at` has passed: status `expired`, holds released, one-way credit refunded, and a `message` event to both members.
- `confirmed` session past its scheduled end: status `awaiting_settlement`.
- `awaiting_settlement`, 24 hours after the scheduled end, with no concern raised: apply the outcome table above.

Each job is a conditional `UPDATE ... WHERE status = ...`, so running it twice does nothing extra.

### `GET /sessions/{id}/room` (`fetchSessionRoom`, mock feature `room`)

Not wired yet: the Session Room page (`/sessions/:id/room`, Daily embed) is a follow-up, and `fetchSessionRoom` doesn't exist in the frontend. Until then, Join opens `meeting_url` in a new tab and the browser reports no attendance.

Members of the session only (`403` otherwise). Available from 10 minutes before the start until the scheduled end (`409` otherwise, with `opens_at`). Response `200`: `{ "room_url": "https://<domain>.daily.co/<room>", "token": "...", "ends_at": "2026-11-07T19:00:00Z" }`. The token is a Daily meeting token for this member and this room, expiring at the scheduled end. The backend creates the room when the request is accepted.

### `POST /sessions/{id}/complete` (`completeSession`, mock feature `session-action`)

Either member, while `awaiting_settlement` (`409` otherwise). Records that this member confirms the outcome the attendance shows. Once both have confirmed, the session settles at once instead of waiting for the 24-hour window. No body. Response `200`: the updated session.

### `POST /sessions/{id}/concern` (`raiseConcern`, mock feature `session-action`)

Either member, while `awaiting_settlement` (`409` otherwise). Request: `{ "reason": "Required, up to 200 characters" }`. Status `disputed`; the credit stays in escrow until an admin decides. Response `200`: the updated session. The admin endpoint that settles a concern isn't defined yet.

### `POST /sessions/{id}/cancel` (`cancelSession`, mock feature `session-action`)

Only while `confirmed` and before the start time, otherwise `409`. Up to 2 hours before the start, a cancel is free: a one-way credit is refunded. After that cutoff it's a late cancel: if the learner cancels, the credit is released to the teacher; if the teacher cancels, the learner is refunded and the teacher gets a late-cancel mark. A two-way late cancel moves no credit and marks the canceller. A late cancel counts as one absence for `is_reliable`. The frontend states the outcome in the confirm dialog before the member cancels.

```json
{ "reason": "Required, up to 200 characters", "alternative_slots": ["2026-11-12T14:00:00Z"] }
```

`alternative_slots` holds up to 3 times, following the same rules as a counter, and returns `403` if the caller is the learner in a one-way swap. Session and request become `cancelled`, and holds are released. Without alternatives, a one-way credit follows the cutoff rule above. With them, the cancel is never late, a new pending request and session are created in the same thread, the credit moves to them in escrow, and the refund happens only if that request closes without being accepted. Response `200`: the updated session.

### `POST /sessions/{id}/review` (`submitReview`, mock feature `review`)

Only for a `completed` session the caller attended, once per member, otherwise `409`. Request: `{ "rating": 5, "comment": "Optional, up to 500 characters" }`, with `rating` a whole number from 1 to 5. Response `201`: the created review.

### `POST /webhooks/daily` (backend only, no frontend call)

Called by Daily for `participant.joined` and `participant.left`, and verified by Daily's webhook signature, not by a user token. The room name identifies the session, and the meeting token's user ID identifies the member. Each joined-to-left stretch is one attendance row, so a rejoin adds a row; anyone still in the call at the scheduled end is given `left_at` equal to the end time. These records decide the outcome and are shown to members and to the admin reviewing a concern.

### `GET /wallet` (`fetchWallet`, mock feature `wallet`)

Response `200`: `{ "credits": 2, "escrow_credits": 2, "hours_taught": 5, "hours_learned": 2 }`

## Wallet

### `GET /wallet/transactions` (`fetchTransactions`, mock feature `transactions`)

The current user's ledger, newest first. Each row carries its partner and booked session, so the Wallet page needs only this and `GET /wallet`. The amounts of all rows add up to `wallet.credits`. Rows with `status: "in_escrow"` add up to `wallet.escrow_credits`, counted as positive.

```json
[{
  "id": "tx-7",
  "created_at": "2026-11-06T17:53:00Z",
  "type": "session_booking",
  "partner_id": "user-faye",
  "amount": -1,
  "status": "in_escrow",
  "session_id": "session-faye-escrow",
  "partner": { "id": "user-faye", "name": "Faye Stub" },
  "session": { "skill_name": "UI Design", "starts_at": "2026-11-09T17:53:00Z", "status": "confirmed", "is_teaching": false }
}]
```

- `type` is `teaching_reward`, `onboarding_bonus`, `session_booking` or `escrow_refund`.
- `status` is `settled` or `in_escrow`.
- `partner` and `session` are `null` for platform grants such as the onboarding bonus.
- A booking stays `in_escrow` until its session is completed (then `settled`, and paid to the teacher) or it's refunded (then `settled`, plus a new `escrow_refund` row).

Filtering by Earned, Spent or Escrow happens on the client. A large ledger would need `?cursor=` paging. The mock doesn't page.

### `GET /conversations/unread-count` (`fetchUnreadCount`, mock feature `unread`)

Response `200`: `{ "unread_count": 3 }`

### `GET /users/{id}/slots` (`fetchPeerSlots`, mock feature `peer-slots`)

Returns the member's bookable times for the next 14 days, soonest first, with a status relative to the current user. Never reveal who holds a time.

| `status` | Meaning |
|---|---|
| `open` | Can be requested |
| `on_hold` | On another member's pending request |
| `booked` | The mentor confirmed another member at this time |
| `your_session` | Overlaps the current user's own confirmed session or active hold. This takes priority over the other statuses |

Response `200`: `[{ "starts_at": "2026-11-09T14:00:00Z", "status": "on_hold" }]`

### `GET /users/{id}/slots/check?starts_at=...&ignore_request_id=...` (`fetchSlotStatus`, mock feature `custom-slot`)

Returns the status of one time, including one outside the member's weekly hours. `ignore_request_id` is optional, and leaves that request's own holds out of the check. Response `200`: `{ "status": "open" }`

**Hold rules:** sending a request holds all its proposed times, and each hold expires after 48 hours, or 2 hours before the session (the cancellation cutoff) if that comes first, so a request can never be accepted inside the cutoff. On accept, the chosen time becomes `booked` and the rest are released. A counter releases the old times and holds the new ones. Decline, cancel and expiry release all times, and refund a one-way credit.

`next_session_at` on matches and members is the soonest confirmed session with that person, or `null`.

### `POST /swap-requests` (`createSwapRequest`, mock feature `swap-request`)

Creates a pending request and opens or reuses the chat with the peer. A one-way request moves 1 credit into escrow. The session is created only when the request is accepted, so `session_id` is `null` until then.

```json
{
  "peer_id": "user-faye",
  "swap_type": "one_way",
  "skill_id": "skill-ui-design",
  "return_skill_id": null,
  "note": "Optional, up to 200 characters, or null",
  "proposed_slots": ["2026-11-09T14:00:00Z", "2026-11-09T15:00:00Z"]
}
```

Validation: 1 to 3 slots, each at least 2 hours away (the cancellation cutoff, so every session has a free-cancel window); a one-way request needs `wallet.credits >= 1`. Respond `409` if any slot is no longer `open`, which also settles two members sending at the same moment. Lock the times in the same transaction as this check.

Response `201`: `{ "conversation_id": "conv-faye", "swap_request": { "id": "...", "status": "pending", "session_id": null } }`

## Explore

### `GET /users` (`searchMembers`, mock feature `members`)

Searches the public directory and excludes the current user. Every query parameter is optional, and the frontend's `/explore` URL uses the same names.

| Parameter | Values | Meaning |
|---|---|---|
| `skill` | text | Teach skill name contains this, case-insensitive |
| `type` | `2way`, `1way` | Filters on `deal`: `2way` = `free`, `1way` = `credit` |
| `rating` | `4`, `4.5` | Minimum average rating; members with fewer than 3 reviews don't pass |
| `day` | `mon` to `sun` | Has at least one slot on this day |
| `reliable` | `1` | Reliable Swappers only |
| `sort` | `rated`, `active` | Default is recommended: match score, then rating. `rated`: rating, then review count. `active`: most recent `last_active_at` |

Response `200`:

```json
[{
  "swap_type": "two_way",
  "deal": "free",
  "has_pending_request": false,
  "next_session_at": "2026-11-09T14:00:00Z",
  "teaches_you": ["skill-spanish"],
  "learns_from_you": ["skill-python"],
  "user": {
    "id": "user-bea",
    "name": "Bea Example",
    "avatar_url": null,
    "headline": "...",
    "rating": 4.9,
    "review_count": 31,
    "is_reliable": true,
    "last_active_at": "2026-11-07T09:00:00Z",
    "teach_skills": [{ "skill": { "id": "skill-spanish", "name": "Spanish", "category": "Languages" }, "proficiency": "expert" }],
    "learn_skills": []
  }
}]
```

`teaches_you` lists the member's teach skills that are on the current user's learn list, and `learns_from_you` their learn skills the current user teaches. `deal` is the Explore section and never depends on the search: `free` for a two-way swap, otherwise `credit`. On a credit row, a non-empty `learns_from_you` shows as "Wants your Python".

## Public Profile

### `GET /users/{id}` (`fetchMemberProfile`, mock feature `profile`)

`swap_type`, `teaches_you`, `learns_from_you` and `credit_cost` are relative to the current user. For a one-way offer, `teaches_you` lists every skill the member teaches, starting with those the current user wants to learn. `reviews` holds the most recent reviews, newest first. `next_session` is the soonest confirmed session with this member that hasn't ended (`{ "id", "starts_at", "duration_minutes" }`, or `null`), so the profile can count down to it and offer Join, which opens the session room. `viewer_availability` is the current user's own weekly hours (same shape as `peer.availability`, `null` on their own profile), so the page can show when both are free. The mock treats a missing member as `null`; the real service should map `404` to `null`.

Response `200` (or `404` if the member doesn't exist):

```json
{
  "is_self": false,
  "has_pending_request": false,
  "next_session_at": null,
  "next_session": null,
  "swap_type": "one_way",
  "teaches_you": ["skill-guitar", "skill-sql"],
  "learns_from_you": [],
  "credit_cost": 1,
  "viewer_availability": { "timezone": "UTC", "slots": [{ "day": "thu", "start_hour": 18 }] },
  "peer": {
    "id": "user-ivo",
    "name": "Ivo Dummy",
    "avatar_url": null,
    "headline": "...",
    "bio": "...",
    "rating": 4.4,
    "review_count": 8,
    "completed_sessions": 10,
    "is_reliable": true,
    "last_active_at": "2026-11-03T09:00:00Z",
    "social_links": [{ "provider": "github", "url": "https://example.com/github/ivo-dummy" }],
    "teach_skills": [{ "skill": { "id": "skill-guitar", "name": "Guitar", "category": "Music" }, "proficiency": "expert" }],
    "learn_skills": [],
    "availability": { "timezone": "UTC", "slots": [{ "day": "thu", "start_hour": 18 }] }
  },
  "reviews": [{
    "id": "review-1",
    "session_id": "session-1",
    "rating": 5,
    "comment": "...",
    "created_at": "2026-11-01T10:00:00Z",
    "author": { "id": "user-hana", "name": "Hana Placeholder", "avatar_url": null }
  }]
}
```

Booking from this page uses `POST /swap-requests`.

## Messages

### `GET /conversations` (`fetchConversations`, mock feature `conversations`)

Most recent activity first. Response `200`:

```json
[{
  "id": "conv-cole",
  "peer_id": "user-cole",
  "unread_count": 2,
  "last_message_preview": "Saturday works too if that is easier.",
  "last_message_at": "2026-11-07T10:00:00Z",
  "has_session_history": false,
  "latest_request": { "status": "pending", "swap_type": "two_way", "awaiting_me": false, "i_am_learner": true, "confirmed_starts_at": null, "closed_by_me": false },
  "owed_session": null,
  "settling_session": null,
  "peer": { "id": "user-cole", "name": "Cole Demo", "avatar_url": null }
}]
```

`latest_request` summarises the newest request in the thread (or `null`): `awaiting_me` is true when the peer proposed the current times, `i_am_learner` when the current user learns in it. `closed_by_me` is true when the current user declined or withdrew it. `owed_session` is a past session with this member whose outcome the current user still owes (`{ "id", "starts_at", "mode": "resolve" | "confirm", "skill_id", "i_taught" }`, or `null`; `skill_id` and `i_taught` let the note name the session); it puts the conversation under Needs your reply. `settling_session` is `"under_review"` while a session with this member is disputed (a no-show report or dispute being checked), `"awaiting_confirm"` while a session the current user taught waits on the learner's confirmation, else `null`; the row is tagged `Under review` or `<Name> to confirm` and, with nothing live, sits under Waiting on them. The list groups rows by it (Needs your reply, Booked, Waiting on them, Other) and prints its deal stub. Previews say "session request" for one-way and "swap request" for two-way.

### `GET /conversations/{id}/messages` (`fetchMessages`, mock feature `messages`)

Oldest first. `kind` is `text` (with `body`) or `swap_request` (with `swap_request`).

```json
[{
  "id": "msg-1",
  "conversation_id": "conv-cole",
  "sender_id": "user-alex",
  "sent_at": "2026-11-07T09:00:00Z",
  "kind": "swap_request",
  "swap_request": {
    "id": "request-cole",
    "swap_type": "two_way",
    "requester_id": "user-alex",
    "recipient_id": "user-cole",
    "teacher_id": "user-cole",
    "learner_id": "user-alex",
    "skill_id": "skill-ui-design",
    "return_skill_id": "skill-react",
    "note": null,
    "counter_note": null,
    "proposed_slots": ["2026-11-10T14:00:00Z"],
    "last_proposed_by": "user-alex",
    "status": "pending",
    "confirmed_starts_at": null,
    "cancelled_by": null,
    "cancel_reason": null,
    "has_alternatives": false,
    "expires_at": "2026-11-09T09:00:00Z",
    "session_id": "session-1"
  }
}]
```

`status` is `pending`, `confirmed`, `declined`, `cancelled` or `expired`.

### `POST /conversations/{id}/messages` (`sendMessage`, mock feature `send-message`)

Request: `{ "kind": "text", "body": "Hello" }`. Text is limited to 4000 characters. Response `201`: the created message.

**Chat access:** return `403` unless the two members have a session with status `confirmed`, `awaiting_settlement`, `disputed` or `completed`. A cancelled session doesn't count, so cancelling a pair's only session locks their chat, and past messages stay readable. The frontend hides the message box using the same rule (`getChatAccess`), but only the server can enforce it.

### `POST /conversations/{id}/read` (`markConversationRead`, mock feature `read`)

No body. Sets `unread_count` to 0. Response `204`.

### Swap request actions (mock feature `swap-action`)

Each returns `200` with the updated message. Return `409` if the request is no longer pending, or if a time is no longer available.

| Endpoint | Function | Body | Who | Effect |
|---|---|---|---|---|
| `POST /swap-requests/{id}/accept` | `acceptSwapRequest` | `{ "starts_at": "..." }` | Member who didn't propose last | Status `confirmed`; creates the session and its Daily room; chosen time `booked`; other holds released; credit stays in escrow |
| `POST /swap-requests/{id}/counter` | `counterSwapRequest` | `{ "proposed_slots": ["..."], "counter_note": "Optional, up to 200 characters, or null" }` | Member who didn't propose last | 1 to 3 times, inside or outside the other member's weekly hours. Each must be 2 hours to 30 days away and clash with neither member's sessions or holds. Old holds released and new holds placed; expiry restarts; replaces any earlier `counter_note` |
| `POST /swap-requests/{id}/decline` | `declineSwapRequest` | None | Member who didn't propose last | Status `declined`; session cancelled; holds released; one-way credit refunded |
| `POST /swap-requests/{id}/cancel` | `cancelSwapRequest` | None | Member who proposed last | Status `cancelled`; session cancelled; holds released; one-way credit refunded |

The backend closes lapsed requests itself: status `expired`, session cancelled, holds released, credit refunded, and a `message` event sent to both members.

### `WS /ws/chat` (`WebSocketProvider`, mock feature `socket`)

Server-to-client events, sent after authenticating the connection. On reconnect, the client should refetch conversations and the open thread.

```json
{ "type": "message", "message": { "id": "msg-1", "conversation_id": "conv-cole", "kind": "text", "body": "Hi" } }
{ "type": "read", "conversation_id": "conv-cole" }
{ "type": "session_updated", "session_id": "session-bea-review", "status": "awaiting_settlement" }
```

On `session_updated`, the Sessions page should refetch `GET /sessions` and `GET /wallet`. The mock doesn't send this event yet.

A `message` event with an existing `id` replaces that message, which is how a request card updates live.

## Onboarding

### `POST /users/me/onboarding` (`completeOnboarding`, mock feature `onboarding`)

Saves the profile, awards 1 free credit and sets `is_onboarded = true`.

Request:

```json
{
  "teach_skills": [
    { "skill_id": "skill-python", "proficiency": "expert" },
    { "custom_name": "Knitting", "proficiency": "beginner" }
  ],
  "learn_skills": [{ "skill_id": "skill-spanish", "proficiency": "intermediate" }],
  "availability": {
    "timezone": "Africa/Lagos",
    "slots": [{ "day": "mon", "start_hour": 18 }]
  }
}
```

Each skill sends either `skill_id` (catalog) or `custom_name` (typed by the member, 50 characters at most, with at least one letter or digit). The frontend's `custom-*` IDs are temporary and are never sent. The backend matches `custom_name` to an existing skill case-insensitively, or creates a new one.

Validation: at least 1 teach skill, 1 learn skill and 1 slot; no skill in both lists; `proficiency` is `beginner`, `intermediate` or `expert`; `day` is `mon` to `sun`; `start_hour` is 0-23.

Response `200`:

```json
{
  "is_onboarded": true,
  "wallet": { "credits": 1, "escrow_credits": 0, "hours_taught": 0, "hours_learned": 0 }
}
```

## Settings

### `GET /users/me/settings` (`fetchSettings`, mock feature `settings`)

```json
{
  "name": "Alex Sample",
  "headline": "Backend developer learning design and languages",
  "bio": "...",
  "teach_skills": [{ "skill": { "id": "skill-python", "name": "Python", "category": "Programming" }, "proficiency": "expert" }],
  "learn_skills": [{ "skill": { "id": "skill-spanish", "name": "Spanish", "category": "Languages" }, "proficiency": "intermediate" }],
  "availability": { "timezone": "Europe/London", "slots": [{ "day": "mon", "start_hour": 10 }] },
  "connected_accounts": [
    { "provider": "github", "username": "alex-sample", "url": "https://github.com/alex-sample", "show_on_profile": true }
  ]
}
```

### `PUT /users/me/settings` (`saveSettings`, mock feature `save-settings`)

One request for all four tabs, so a save is all or nothing. The body has the same shape as the `GET`, and the response `200` is the saved settings.

| Field | Rule |
|---|---|
| `name` | 1 to 60 characters, after trimming |
| `headline` | Up to 80 characters |
| `bio` | Up to 500 characters |
| `teach_skills`, `learn_skills` | At least 1 each, and no skill in both. A skill with `is_custom: true` is created and given a real ID. |
| `availability.slots` | At least 1 |
| `connected_accounts` | Only `show_on_profile` can change here. Connecting and disconnecting have their own endpoints below. |

Respond `422` with the failing field if a rule is broken. After saving, the backend recalculates the member's matches and open time blocks, and sets the public profile's `social_links` to the accounts with `show_on_profile: true`. Existing sessions, requests and holds keep their times.

### `GET /auth/{provider}/connect` (`connectAccount`, mock feature `connect-account`)

`provider` is `google` or `github`. This is a browser redirect to the provider's OAuth page, which returns to `/settings?tab=account`. The new account starts with `show_on_profile: false`. Respond with an error on return if that provider account already belongs to another member. The page only allows connecting when there are no unsaved changes, because the redirect leaves the page. The mock resolves in place and returns the updated `connected_accounts`.

### `DELETE /users/me/accounts/{provider}` (`disconnectAccount`, mock feature `connect-account`)

Response `200`: the remaining `connected_accounts`. Respond `409` if it's the member's only account, because Google and GitHub are the only ways to sign in.

Signing out is under [Auth](#auth).

## Computed field: `is_reliable`

Returned on every user/peer object. The server computes it; the client never derives it. It is true only when all three hold across the member's completed sessions:

1. At least 5 completed sessions with an attendance rate of 95% or more (no-shows and late cancellations each count as an absence, per attendance logs).
2. Average review rating of 4.8 or higher.
3. Zero attendance (telemetry) disputes ruled against the member in the last 30 days.
