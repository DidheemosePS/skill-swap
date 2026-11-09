# API Integration Map

Every endpoint the frontend calls. Requests and responses use snake_case; `src/services/` maps them to the camelCase types in `src/types/`. Dates are ISO 8601 UTC. Base path: `/api/v1`.

The services currently return mock data through `src/services/mockClient.ts`. Set `VITE_MOCK_FAIL` to a comma-separated list of feature names to simulate a failure.

## Auth

The session is an HTTP-only cookie set by the OAuth callback; no token is handled in JavaScript. Every endpoint below and in the rest of this map identifies the member from that session, never from a user ID in the request. Any request without a valid session responds `401`. The frontend handles `401` from `GET /users/me` by showing the sign-in panel (`AuthGate`) at the current URL; there is no separate sign-in route.

### `GET /users/me` (`fetchCurrentUser`, mock feature `me`)

Loaded once by `AuthProvider` on start-up, and again after saving settings. Response `200`:

```json
{ "id": "user-alex", "name": "Alex Sample", "avatar_url": null, "is_onboarded": true }
```

`AuthGate` sends members with `is_onboarded: false` to `/onboarding` from every route, and sends onboarded members away from `/onboarding` to `/dashboard`. In the mock, `VITE_MOCK_EMPTY=me` starts Alex as not onboarded so the onboarding flow can be tried.

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
  "next_session_at": null,
  "peer": { "id": "user-bea", "name": "Bea Example", "avatar_url": null, "headline": "...", "rating": 4.9, "review_count": 31, "is_reliable": true, "teach_skills": [], "learn_skills": [], "availability": { "timezone": "UTC", "slots": [{ "day": "mon", "start_hour": 10 }] } }
}]
```

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
  "meeting_url": "https://example.com/meet/bea-soon",
  "attendance": [],
  "partner": { "id": "user-bea", "name": "Bea Example", "avatar_url": null },
  "skill_name": "Python",
  "is_teaching": true
}]
```

### `GET /sessions` (`fetchMySessions`, mock feature `my-sessions`)

All of the current user's sessions except `pending` ones. Each has the fields shown above, plus the following. Sessions and the page's tabs are ordered on the client.

```json
{
  "return_skill_name": "Spanish",
  "conversation_exists": true,
  "has_my_review": false,
  "attendance": [
    { "user_id": "user-alex", "joined_at": "2026-11-07T09:59:00Z", "left_at": "2026-11-07T11:00:00Z", "duration_minutes": 60 }
  ],
  "teacher_marked_at": "2026-11-07T10:00:00Z",
  "no_show": { "absent_id": "user-dina", "reported_by": "user-alex" },
  "dispute": { "raised_by": "user-alex", "cause": "no_show", "reason": null, "raised_at": "2026-11-07T10:00:00Z" },
  "cancellation": { "cancelled_by": "user-alex", "reason": "...", "cancelled_at": "2026-11-07T10:00:00Z" }
}
```

`status` also includes `awaiting_settlement`, `pending_learner_review`, `completed`, `disputed`, `no_show_confirmed` and `cancelled`. The backend moves `confirmed` to `awaiting_settlement` when the end time passes.

- `attendance` has one record per member. `left_at` is `null` while they're in the meeting, and `duration_minutes` is their total time in it.
- `no_show` is set with `no_show_confirmed`, by the 24-hour no-show job or by an admin. `reported_by` is `null` when nobody reported it.
- `dispute.cause` is `no_show`, `completion` (the learner disputed a teacher's marking) or `no_outcome` (the 72-hour job). `raised_by` is `null` for `no_outcome`. `reason` is set only for `completion`.

#### Outcome rules

A one-way credit moves automatically only when:

- **the learner confirms:** through `/complete`, either on its own or after the teacher's marking, or
- **the review window lapses:** the teacher marked completed and 48 hours pass without a dispute, or
- **a no-show report is verified:** 24 hours after the report, the reported member has no attendance record at all.

Everything else becomes `disputed`, the credit stays in escrow, and an admin decides. This covers a learner's dispute, a session nobody marked within 72 hours, and a no-show report where the reported member joined the meeting at all. Attendance records decide an outcome by themselves only in that one clear case, a missing record; any time in the meeting is left for an admin to judge.

#### Scheduled backend jobs

- `pending_learner_review`, 48 hours after `teacher_marked_at`, with no dispute: set `completed` and release the credit to the teacher.
- `awaiting_settlement`, 72 hours after the end time, with no outcome marked: set `disputed` with `cause: "no_outcome"`.
- `disputed` with `cause: "no_show"`, 24 hours after `dispute.raised_at`: if the reported member has no attendance record, set `no_show_confirmed` with `no_show: { absent_id, reported_by }`. An absent teacher means the learner's credit is refunded (`escrow_refund`); an absent learner means it is released to the teacher. If they have a record, leave it `disputed` for an admin. The client shows a countdown to this time from `raised_at`, so no extra field is needed.

### `POST /sessions/{id}/complete` (`completeSession`, mock feature `session-action`)

The caller decides the result, so the backend must take it from the auth token. No body. Response `200`: the updated session.

- **One-way learner, or either member of a two-way swap:** allowed while `awaiting_settlement`. The learner can also use it while `pending_learner_review`, to confirm. Status `completed`, and a one-way credit is released to the teacher. Updates both members' hours and completed session counts.
- **One-way teacher:** allowed only while `awaiting_settlement` (`409` otherwise). Status `pending_learner_review` and sets `teacher_marked_at`. No credit moves. Sends the learner a notification and a `session_updated` socket event.

### `POST /sessions/{id}/report-absent` (`reportNoShow`, mock feature `session-action`)

Either member, while `awaiting_settlement` (`409` otherwise). Names the other member as absent. Status `disputed` with `cause: "no_show"`, and the credit stays in escrow while the 24-hour check runs against the attendance records (see Scheduled backend jobs). No body. Response `200`: the updated session.

### `POST /sessions/{id}/dispute` (`disputeCompletion`, mock feature `session-action`)

Learner only (`403` otherwise), while `pending_learner_review` and within 48 hours of `teacher_marked_at` (`409` otherwise). Status `disputed` with `cause: "completion"`, and the credit stays in escrow until an admin decides. Request: `{ "reason": "Required, up to 200 characters" }`. Response `200`: the updated session. The admin endpoint that settles a dispute isn't defined yet.

### `POST /sessions/{id}/cancel` (`cancelSession`, mock feature `session-action`)

Only while `confirmed` and before the start time, otherwise `409`.

```json
{ "reason": "Required, up to 200 characters", "alternative_slots": ["2026-11-12T14:00:00Z"] }
```

`alternative_slots` holds up to 3 times, following the same rules as a counter, and returns `403` if the caller is the learner in a one-way swap. Session and request become `cancelled`, and holds are released. Without alternatives, a one-way credit is refunded. With them, a new pending request and session are created in the same thread, the credit moves to them in escrow, and the refund happens only if that request closes without being accepted. Response `200`: the updated session.

### `POST /sessions/{id}/review` (`submitReview`, mock feature `review`)

Only for a `completed` session the caller attended, once per member, otherwise `409`. Request: `{ "rating": 5, "comment": "Optional, up to 500 characters" }`, with `rating` a whole number from 1 to 5. Response `201`: the created review.

### `POST /sessions/{id}/attendance` (`logAttendance`, mock feature `attendance`)

Records the current user clicking Join Meeting. It creates their attendance record with `left_at: null` if they don't have one yet. Only the first call per user sets `joined_at`. No request body. Response `200`: `{ "joined_at": "2026-11-07T17:52:00Z" }`

### `POST /webhooks/meeting` (backend only, no frontend call)

Called by the video provider, and verified by its signature, not by a user token.

```json
{ "session_id": "session-bea-soon", "user_id": "user-bea", "event": "joined", "at": "2026-11-07T17:59:00Z" }
```

`event` is `joined` or `left`. The backend keeps one record per member: the first `joined` sets `joined_at`, each `left` sets `left_at`, and `duration_minutes` adds up every joined-to-left stretch, so a rejoin counts. Anyone still in the meeting at the end time is given `left_at` equal to the end time. These records are shown to members and to the admin reviewing a dispute.

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

**Hold rules:** sending a request holds all its proposed times, and each hold expires after 48 hours, or 1 hour before the session if that comes first. On accept, the chosen time becomes `booked` and the rest are released. A counter releases the old times and holds the new ones. Decline, cancel and expiry release all times, and refund a one-way credit.

`next_session_at` on matches and members is the soonest confirmed session with that person, or `null`.

### `POST /swap-requests` (`createSwapRequest`, mock feature `swap-request`)

Creates a pending request and session, and opens or reuses the chat with the peer. A one-way request moves 1 credit into escrow.

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

Validation: 1 to 3 future slots; a one-way request needs `wallet.credits >= 1`. Respond `409` if any slot is no longer `open`, which also settles two members sending at the same moment. Lock the times in the same transaction as this check.

Response `201`: `{ "conversation_id": "conv-faye", "swap_request": { "id": "...", "status": "pending", "session_id": "..." } }`

## Explore

### `GET /users` (`searchMembers`, mock feature `members`)

Searches the public directory and excludes the current user. Every query parameter is optional, and the frontend's `/explore` URL uses the same names.

| Parameter | Values | Meaning |
|---|---|---|
| `skill` | text | Teach skill name contains this, case-insensitive |
| `type` | `2way`, `1way` | `2way`: the member and current user can teach each other. `1way`: any other member, booked with a credit |
| `rating` | `4`, `4.5` | Minimum average rating |
| `day` | `mon` to `sun` | Has at least one slot on this day |
| `sort` | `rated`, `active` | Default is recommended: match score, then rating. `rated`: rating, then review count. `active`: most recent `last_active_at` |

Response `200`:

```json
[{
  "swap_type": "two_way",
  "has_pending_request": false,
  "next_session_at": "2026-11-09T14:00:00Z",
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

## Public Profile

### `GET /users/{id}` (`fetchMemberProfile`, mock feature `profile`)

`swap_type`, `teaches_you`, `learns_from_you` and `credit_cost` are relative to the current user. For a one-way offer, `teaches_you` lists every skill the member teaches, starting with those the current user wants to learn. `reviews` holds the most recent reviews, newest first. The mock treats a missing member as `null`; the real service should map `404` to `null`.

Response `200` (or `404` if the member doesn't exist):

```json
{
  "is_self": false,
  "has_pending_request": false,
  "next_session_at": null,
  "swap_type": "one_way",
  "teaches_you": ["skill-guitar", "skill-sql"],
  "learns_from_you": [],
  "credit_cost": 1,
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
  "peer": { "id": "user-cole", "name": "Cole Demo", "avatar_url": null }
}]
```

### `GET /conversations/{id}/messages` (`fetchMessages`, mock feature `messages`)

Oldest first. `kind` is `text` (with `body`), `code` (with `language` and `code`) or `swap_request` (with `swap_request`).

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
    "meeting_url": null,
    "session_id": "session-1"
  }
}]
```

`status` is `pending`, `confirmed`, `declined`, `cancelled` or `expired`.

### `POST /conversations/{id}/messages` (`sendMessage`, mock feature `send-message`)

Request: `{ "kind": "text", "body": "Hello" }` or `{ "kind": "code", "language": "python", "code": "print(1)" }`. Text and code are limited to 4000 characters. Response `201`: the created message.

**Chat access:** return `403` unless the two members have a session with status `confirmed`, `awaiting_settlement`, `pending_learner_review`, `disputed` or `completed`. A cancelled session doesn't count, so cancelling a pair's only session locks their chat, and past messages stay readable. The frontend hides the message box using the same rule (`getChatAccess`), but only the server can enforce it.

### `POST /conversations/{id}/read` (`markConversationRead`, mock feature `read`)

No body. Sets `unread_count` to 0. Response `204`.

### Swap request actions (mock feature `swap-action`)

Each returns `200` with the updated message. Return `409` if the request is no longer pending, or if a time is no longer available.

| Endpoint | Function | Body | Who | Effect |
|---|---|---|---|---|
| `POST /swap-requests/{id}/accept` | `acceptSwapRequest` | `{ "starts_at": "..." }` | Member who didn't propose last | Status `confirmed`; generates `meeting_url`; session confirmed; chosen time `booked`; other holds released; credit stays in escrow |
| `POST /swap-requests/{id}/counter` | `counterSwapRequest` | `{ "proposed_slots": ["..."], "counter_note": "Optional, up to 200 characters, or null" }` | Member who didn't propose last | 1 to 3 times, inside or outside the other member's weekly hours. Each must be 1 hour to 30 days away and clash with neither member's sessions or holds. Old holds released and new holds placed; expiry restarts; replaces any earlier `counter_note` |
| `POST /swap-requests/{id}/decline` | `declineSwapRequest` | None | Member who didn't propose last | Status `declined`; session cancelled; holds released; one-way credit refunded |
| `POST /swap-requests/{id}/cancel` | `cancelSwapRequest` | None | Member who proposed last | Status `cancelled`; session cancelled; holds released; one-way credit refunded |

The backend closes lapsed requests itself: status `expired`, session cancelled, holds released, credit refunded, and a `message` event sent to both members.

### `WS /ws/chat` (`WebSocketProvider`, mock feature `socket`)

Server-to-client events, sent after authenticating the connection. On reconnect, the client should refetch conversations and the open thread.

```json
{ "type": "message", "message": { "id": "msg-1", "conversation_id": "conv-cole", "kind": "text", "body": "Hi" } }
{ "type": "read", "conversation_id": "conv-cole" }
{ "type": "session_updated", "session_id": "session-bea-review", "status": "pending_learner_review" }
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
