---
name: Skill Swap
description: Sessions and credits printed like community time-bank notes; an hour of teaching is the currency.
colors:
  canvas: "#e7eee8"
  shell: "#dfe8e1"
  surface: "#f4f8f5"
  ink: "#1d1a22"
  muted: "#4b5450"
  line: "#b9c8bd"
  accent: "#2f6f5e"
  accent-strong: "#24574a"
  accent-soft: "#dcebe4"
  next: "#4a1f4f"
  next-strong: "#3a1640"
  next-soft: "#f4eef5"
  held: "#b0451c"
  star: "#9a5b00"
  danger: "#a32a1f"
  danger-soft: "#fbeae7"
  on-color: "#ffffff"
typography:
  denomination:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 75"
  headline:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.111
    letterSpacing: "-0.025em"
  headline-mobile:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  countdown:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
    fontVariation: "\"wdth\" 75"
  title-note:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
  lede:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.556
  section-label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.429
    letterSpacing: "0.1em"
  body:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.429
  label:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.429
  caption:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "0.025em"
  stub-word:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.025em"
rounded:
  md: "3px"
  lg: "4px"
  sm: "4px"
  xl: "6px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  card: "20px"
  region: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.next}"
    textColor: "{colors.on-color}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.next-strong}"
  button-primary-disabled:
    textColor: "{colors.muted}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.canvas}"
  button-on-next:
    backgroundColor: "{colors.next-soft}"
    textColor: "{colors.next}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-on-next-hover:
    backgroundColor: "{colors.on-color}"
  next-note:
    backgroundColor: "{colors.next}"
    textColor: "{colors.next-soft}"
    rounded: "{rounded.xl}"
    padding: "20px 28px"
  ledger-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  match-plate:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  stub:
    textColor: "{colors.held}"
    typography: "{typography.stub-word}"
    rounded: "{rounded.md}"
    padding: "6px 0"
    width: "96px"
  wallet-note:
    textColor: "{colors.ink}"
    typography: "{typography.denomination}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  balance-chip:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "2px 8px"
  badge:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "4px 12px"
    height: "32px"
  pill-success:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  pill-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  pill-neutral:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  time-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  time-chip-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-color}"
  tab-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-color}"
    rounded: "{rounded.md}"
    height: "44px"
  nav-link-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent-strong}"
    rounded: "{rounded.lg}"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
  alert-banner:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Skill Swap

> **Current direction (2026-11-13): "People & swap".** Built on the Workspace frame (sidebar, light grey cards on a white page, near-black actions) and supersedes the Time Bank Notes palette, type and shapes described further down; component notes below still describe behaviour, not looks.
>
> - **Type:** Bricolage Grotesque Variable (`font-display`) for headings, the greeting, big figures and the logo; Instrument Sans Variable for reading text (both self-hosted via `@fontsource-variable`). h1 30–36px/600, section headings 18–20px/600, card titles 16–18px/600, body 14px.
> - **Palette (black and white, since 2026-11-13):** page `#ffffff`, cards `#f4f4f5` (`bg-card`, no border), hover and inset fill `#ececee` (`canvas`), inputs, menus, dialogs and panels inside a card `#ffffff` (`surface`), hairline `#e4e4e7`, ink `#16181d`, muted `#4f5159`, faint `#6c6e76`, selected fill `#e7e7ea`; near-black `#16181d` for primaries, selected toggles and dark cards; coral `#b13a12` only for held credits, green `#1f7a4a` for earned credits; link blue only for links.
> - **People carry the colour:** every avatar has a fixed hue per person (six mid-tones, white initials). `SwapPair` (two overlapping avatars around an exchange mark) is the signature: the now card, chat cards, session cards, Explore swap cards, Profile and the tour.
> - **No credit tags in lists.** Rows say where things stand in one plain sentence; credit rules are taught once by the welcome tour (4 steps, shown once after onboarding, replayable from Wallet). Credit amounts appear only as figures (Wallet, Past sessions, the balance).
> - **Shape:** cards 16px radius, feature/dark cards 20px, buttons 12px; grey fills instead of card borders (hairlines only for inputs, dividers and secondary buttons), no shadows except dialogs and popovers. An empty Recommended kind is one compact card with the swap pair's partner seat left open (`MatchFeedEmpty`). Lists of people are cards (Explore, Recommended, Sessions); ledgers are feeds with faces (Wallet, Past).
> - **Selection:** chosen chips, levels, times and view toggles are near-black with white text; navigation marks the current place with the soft fill.
> - **Sidebar:** 240px with the logo mark, or a 64px icon rail via the toggle; pages centre in `max-w-page` (80rem), lifted with the rail; Messages is always full width. The balance appears once: the sidebar's Wallet entry (the top-bar chip on phones).


Tokens live in `frontend/src/styles/globals.css` (Tailwind v4 `@theme`, plus the `figures` and `security-hatch` utilities and the `.anchored-popover` rule). This file must match them; change both in the same commit. The dashboard (`frontend/src/pages/DashboardPage.tsx`) is the reference build of this world. Every other page inherits the tokens, but only the dashboard has been restructured around notes and stubs; the other pages still carry the earlier layouts in the new colours.

## Overview

**Creative North Star: "Time Bank Notes"**

An hour of teaching is the currency, so Skill Swap prints sessions and credits like community time-bank notes. Balances, hours and times are denominations; each booked session carries a stub that says what it costs; the session starting soon is a single plum note across the top of the page with its own Join. The member reads what to do next, what is in play, and what it costs, in that order.

The ground is mint-grey security paper with a paler note stock for panels, near-black intaglio ink, and three spot inks with fixed jobs: teal for actions, selection and free swaps; plum for the next step only; burnt orange for credits that are held. One variable face, Archivo, does everything: its standard width for words and its narrow width for every figure, so numbers lead the hierarchy. Corners are square-cut (3 to 6px), sections are ruled in ink, rows are separated by dashed hairlines, and the only ornament is printing ornament: a guilloché rosette on the plum note and fine diagonal hatching on wallet notes. Surfaces stay flat. Emoji appear only where `PROJECT_PLAN.md` names them, always beside a text label.

The world replaced the earlier "Green Thread" system (Figtree, rounded pills, one green accent) on 2026-11-10. It refuses the category default of white cards, avatar rows and a stat column.

**Key Characteristics:**
- Figures lead: hours, credits, times and counts are set narrow (75% width) and tabular.
- Three spot inks with fixed meanings: teal acts, plum is next, orange is held.
- Square-cut corners (3/4/6px) and ink rules; dashed hairlines between ledger rows.
- Printing ornament only on notes: rosette on the plum note, security hatching on wallet notes.
- 44px minimum targets, a visible focus ring on everything interactive, reduced motion honoured.
- Light theme only.

## Colors

Security-paper neutrals carry everything; three spot inks each own one meaning, and semantic colour is reserved for ratings and errors.

### Primary
- **Bank Teal** (accent): links and text actions (as Teal Deep), selected time chips, the active tab, focus rings, the edge of free-swap plates and stubs, `caret-color`.
- **Teal Deep** (accent-strong): link and text-action colour, text on Teal Wash, the free-swap stub and denomination text.
- **Teal Wash** (accent-soft): skill badges, the active nav link, the active day chip, success pills, avatar initials, `::selection`. The Top match pill is ink on paper (`mark` tone) so it never reads as another skill badge.

### Secondary
- **Next Plum** (next): the next step and nothing else. The starting-soon note's ground, and every primary button (the one filled action per view).
- **Plum Deep** (next-strong): primary button hover.
- **Plum Stock** (next-soft): text on the plum note, and the fill of the Join button printed onto it.

### Tertiary
- **Held Orange** (held): credits held for sessions: the HELD wallet note and its stamp, the "held" balance chip, "Credit held" stubs, credit-plate edges (at 60%), the "1 credit" cost beside Book another.
- **Ochre Star** (star): star ratings and warning pills on a 10% star tint. Nothing else: a pending stub is muted ink, so ochre always means a rating or a warning.
- **Brick** (danger) / **Brick Wash** (danger-soft): errors, alert banners, the unread count.

### Neutral
- **Security Paper** (canvas): page ground, quiet inner panels (cost summary), hover fill.
- **Nav Tint** (shell): the navbar band, a step darker than the paper.
- **Note Stock** (surface): cards, plates, modals, popovers, inputs.
- **Intaglio Ink** (ink): text, section rules, the secondary-button border, Available note and "You earn" stub edges.
- **Slate Grey** (muted): secondary text, helper text, inactive nav and tabs.
- **Hairline** (line): borders, dashed row dividers, skeletons, disabled fills. Never behind text.
- **On Color** (on-color): white, only on accent, next and danger fills.

### Contrast (WCAG 2.1)
| Pair | Ratio |
|---|---|
| ink on canvas / surface / shell | 14.55 / 16.02 / 13.71 |
| muted on canvas / surface / shell | 6.63 / 7.3 / 6.25 |
| accent on surface | 5.51 |
| white on accent | 5.91 |
| accent-strong on surface / canvas | 7.72 / 7.01 |
| accent-strong on accent-soft | 6.72 |
| white on next | 13.12 |
| next-soft on next (both directions) | 11.5 |
| held on surface / canvas / shell | 5.28 / 4.79 / 4.51 |
| star on surface | 5.06 |
| star on star/10 tint (warning pill) | 4.75 |
| danger on surface / danger-soft | 6.74 / 6.2 |
| white on danger | 7.22 |
| muted on line | **4.49, too low for text** |

### Named Rules
**The Three Inks Rule.** Teal means act or selected (free swap only, under the Quiet Accent Rule), plum means the next step, orange means held. No ink borrows another's job, and no fourth accent hue is introduced.

**The Plum Is Next Rule.** Plum appears at most twice in a view: the starting-soon note and the one primary action. When the note carries the Join, no other button on the page is filled.

**The Quiet Accent Rule (2026-11-12, dashboard and navigation first).** Plum is also the one accent for text actions and the current-page mark: verbs, View all / View history, the active nav link (Plum Wash `next-soft` with plum text) and the current bottom tab. Teal and orange keep only their status jobs (free swap, held credit). Hierarchy comes from size and space: section headings are 18px semibold sentence case with no ink rule, group labels 14px semibold muted, rows separated by one soft hairline. Stubs and denominations print without frames. Other pages move to this as they're revisited; until then their teal verbs are the older form.

**The No Text on Hairline Rule.** Muted on line is 4.49:1. Neutral pills sit on paper with a line ring instead; the only exemption is a disabled button.

**The Held Margin Rule.** Held on shell is 4.51:1, right at the floor. Held text on the nav tint stays 14px semibold or larger; don't put it on anything darker.

## Typography

**Font:** Archivo Variable (`@fontsource-variable/archivo/standard.css`, imported in `main.tsx`), with ui-sans-serif, system-ui fallbacks.
**Figures:** the same face at 75% width with tabular numerals (the `figures` utility).
**Mono:** Tailwind's default mono stack, only for code in chat and the code composer.

**Character:** A grotesque workhorse for words and its own condensed cut for numbers, so the figures read like banknote denominations without bringing in a second family.

### Hierarchy
- **Denomination** (700, 48px phones / 60px from `sm`, line-height 1, figures): the plum note's countdown ("7m 59s / to start", units at 30px so it never reads as a clock time), wallet note balances (48px). A denomination always shows a figure that changes; never print a constant.
- **Headline** (600, 30px phones / 36px from `sm`, tracking -0.025em, `text-balance`): one `<h1>` per page.
- **Lede** (400, 18px, muted): the next-step line under the greeting.
- **Note title** (600, 20px): the session on the plum note.
- **Title** (600, 18px): match names, modal titles.
- **Section label** (700, 14px, 0.1em, uppercase, over a 1px ink rule): the heading of each dashboard section. It is the section's `<h2>`, not a line above one.
- **Body** (400, 14px): default UI text. Muted text never goes below 12px.
- **Label** (600, 14px): buttons, links, balance chips; field labels at 500.
- **Caption** (600, 12px): pills, "You learn / You teach" sides (uppercase, 0.025em), counters.
- **Stub word** (600, 11px, uppercase): only on stubs and denominations, always in a spot ink or ink, never muted.
- **Field input** (16px on phones, 14px from `sm`) so iOS doesn't zoom on focus.

### Named Rules
**The Figures Lead Rule.** Every hour, credit, time, date-time and count is set with `figures` (narrow, tabular). Words beside them keep the standard width; never condense a word to match a number.

**The One Face Rule.** Archivo carries display, body and figures. Width and weight make the hierarchy (700 only for figures and section labels); no second family is added.

## Layout

Tailwind's 4px scale. Within a component: 8, 12 and 16px. Cards and plates pad 16px on phones and 20px from `sm`. 24px between page regions, 40px between dashboard sections.

- **Containers:** app pages `mx-auto max-w-7xl px-4 py-6 sm:py-8` (1280px). Modals 512px; drawers 448px.
- **Navbar:** 64px, sticky, on the shell tint with a hairline under it. Below `md` the main links (Dashboard, Explore, Messages, Sessions) sit in a second row of 44px links under the bar, so they're never hidden in the avatar menu. `html` carries `scroll-padding-top` (5rem, 8.5rem below `md`) so anything focused or scrolled to lands below the sticky bar.
- **Dashboard grid:** from `lg`, a 12-column grid (24px gap): sessions and match plates take 8 columns; the wallet takes 4, spans both rows and stays sticky (`top-24`). Below `lg` everything stacks with the wallet between the inbox and the matches, so the balance is read before the credit match plates (a booked row's "Book another · 1 credit" still sits above it; the nav chips carry the balance there). No grid lines are drawn.
- **Dashboard order:** greeting and next-step line (it names the one owed task in full, e.g. "Your session with Dina needs an outcome. Mark it below." or "Bea marked your session complete. Confirm it below.", so it never leans on the plum note); the plum note (only when a session is joinable or starts within the hour); then sessions & requests (an inbox in three labelled groups, Needs you, Booked and Waiting on others; only Booked is capped, at 3 rows with "+N more booked in Sessions" below), free swaps, credit matches (a member with a session still to settle is left out of the matches); the wallet beside them. A "How credits work" panel (dashed border, figures in a fixed column) shows only until a member's first booking; after that the wallet carries it as an inline "How credits work" disclosure (a native `details`) under the held line.
- **Ledger rows:** stub, then name and detail, then one action. On phones the action drops under the text (column 2); from `sm` it sits right.
- **Breakpoints:** `sm` 640px (type and padding step up, rows go three-column), `md` 768px (nav links appear), `lg` 1024px (split views).
- **Touch targets:** 44px minimum (`min-h-11`) for buttons, links-as-actions, chips, tabs and inputs; 40px for nav chips and icon links; 28px for the remove control inside a badge.
- Never any horizontal scroll at 375px.

**The Printed Mark Rule.** Inside a card, structure is printed, not stacked: stubs, notes and denominations are bordered marks with no fill of their own (hatching aside) and no shadow. A region inside a card is a paper panel or a rule, never another card.

## Elevation & Depth

Flat. Depth is printing, not lighting: ink rules, hairlines, inner frames and hatching separate things. Shadows exist only for what floats above the page.

### Shadow Vocabulary
- **Float** (Tailwind `shadow-lg`): menus and popovers.
- **Overlay** (`shadow-xl` over an `ink/40` backdrop): modals and drawers.

**The Flat at Rest Rule.** Nothing on the page casts a shadow, at rest or on hover. Buttons change fill on hover and press to 98%; nothing moves or lifts.

## Shapes

Square-cut, like trimmed note stock.

- **Note corner** (3px, `rounded-md`): stubs, wallet notes, denominations, balance chips, time and day chips, tabs.
- **Control corner** (4px, `rounded-lg` and `rounded-sm`): buttons, inputs, alerts, inner panels, nav links, badges, status pills, skeletons.
- **Plate corner** (6px, `rounded-xl`): cards, plates, the plum note, modals, popovers, empty states.
- **Full**: avatars, the unread count, the picked-count dot. Nothing else is a pill.
- **Double rule:** notes carry an inner printed frame inset 4 to 6px (white/15 on plum, current colour at 20% on wallet notes).
- **Stamp:** the HELD note carries a 2px held-orange box stamp rotated -12deg. It is the one rotated element.
- **Rules:** sections sit on a 1px ink rule; ledger rows divide on dashed hairlines; the skill exchange sits between two hairlines.

## Components

The implementations in `frontend/src/components/common/`, `cards/`, `schedule/` and `wallet/` are the reference; reuse them rather than restyling.

### Buttons
Printed, not glossy: a 1px rise on hover, a 98% press, both off under reduced motion.
- **Shape:** control corner (4px), 44px minimum height, 20px side padding, 14px semibold.
- **Primary:** Next Plum fill, white text; Plum Deep on hover. One per view, and it is the next step. Disabled drops to a dashed muted outline on no fill with Slate Grey text, so it reads as unavailable rather than as a faded primary.
- **Secondary:** Note Stock with a 1px ink border, ink text; paper on hover. Every other action, including Request swap and Book with 1 credit when they are not the next step.
- **On plum** (`onNext`): Plum Stock fill with plum text, white on hover, white focus ring offset against plum. Used only for the action printed on the plum note.
- **Focus:** 2px teal ring with a 2px offset.
- **Loading:** `isLoading` disables and shows a spinner beside the label. `getButtonClasses` styles links as buttons (Join meeting, with an SVG video icon).
- **Text actions** (View all, View request, Book another): Teal Deep 14px semibold, underline on hover, 44px tall where they are a row's action.

### Chips
- **Badge** (`Badge`): Teal Wash with Teal Deep text, 4px corners, 32px tall; skills and picked times only.
- **Status pill** (`StatusPill`): 12px semibold, 4px corners, four tones: success (Teal Wash), warning (10% star tint), danger (Brick Wash), neutral (paper with a hairline ring). Always a word, never colour alone.
- **Day and time chips** (`TimeSlotPicker`): 3px corners, 44px tall, hairline border on Note Stock. The active day is Teal Wash with a teal border; a selected time is filled teal with white. Taken times stay legible on paper with a dashed border and say why ("Booked", "On hold").

### Cards / Containers
- **Ledger card** (sessions & requests, wallet): Note Stock, hairline border, 6px corners, section label over an ink rule with its text action at the right.
- **Match plate** (`MatchCard`): Note Stock, 6px corners, edged in its ink: free swaps teal at 70%, credit plates held at 60%. The top match is marked by its pill only. Fixed furniture in fixed slots: name and Top match pill, headline, rating, Reliable Swapper, free days; then the skill exchange; one action.
- **Shadow Strategy:** none (see Elevation).

### Stubs and Denominations
Each ledger row starts with a stub (`YourSessionsList`): an unframed 64px (80px from `sm`) column, an 18px semibold figure over a 12px sentence-case word, coloured only for status (orange held, teal free, muted while unsettled). Under the Quiet Accent Rule the older notes below about borders, dashed edges and bold-ink verbs describe the previous form: every verb is now plum semibold, and the section heading is "Your sessions & requests" at 18px with groups set apart by space. The wallet card shows two plain figures (36px semibold, the held one orange) over muted labels, with no hatching, frames or HELD stamp. Match plates have a hairline edge, plain-text skills ("You learn **Public Speaking**") and the denomination as one coloured line. The plum note's countdown is 36px, with no rosette. Tones: Credit held (orange; also on credit requests the member sent and on past learning sessions awaiting settlement), You earn (ink, "+1"; "If complete" on a past taught session still to settle). A dashed stub edge means the credit isn't settled yet (If complete, If taught, Under review); solid edges are certain. If taught (ink, dashed, "+1", a credit request sent to the member), Free (teal, "1 h"), Free swap (muted ink, "1 h", pending free-swap requests only). Every row has one action: Mark outcome or Confirm to settle, Reply for requests owed (it opens the request dialog: pick a time and Accept, or Decline), Join, Book another or Message for booked sessions, View request for requests sent (its dialog holds Withdraw). "Confirm all N" sits in the Needs you label row when two or more confirmations are waiting. Waiting on others also lists sessions the member settled that someone else must close (a report under review, a taught session awaiting the learner), with a quiet Details link. Request rows name the skill and who teaches it ("Wants to learn Python from you", "You asked to learn Public Speaking", "Free swap: Python"). "Confirm all" asks once ("Release 2 held credits to their teachers? Yes, confirm all / Keep"). After any of these actions an Action notice (teal wash, teal edge, 4px corners, a Dismiss button) appears under the greeting and says what happened, including what moved in credits; it sits in a `role="status"` region and takes focus, since the clicked control is gone. Actions are verbs, not boxes (`InboxAction`): exactly one right-aligned verb per row ending in an arrow, bold ink when the member owes the step (Mark outcome, Confirm, Reply) and teal otherwise (Book another, Message, Details, View request). A row never carries a second control. A pending request's choices live in its dialog (`RequestDialog`): Reply opens "Evan's request" (who teaches what, the credit on hold, the proposed times as radio rows, Accept; "Decline request" as a quiet link at the footer's left), and View request opens "Your request to Cole" (the times proposed, a link to the chat, and "Withdraw request"). Declining or withdrawing asks once in the footer ("Withdraw your request? No credits are involved. Go back / Yes, withdraw"). Join keeps its own button, since it opens the meeting. The skill exchange's centre mark is a denomination in the same grammar: "1 h ↔ 1 h / Free swap" in teal or "1 h ↔ 1 credit / Uses a credit" in orange, with "You learn" on the left and, on free plates only, "You teach" on the right; a credit plate states its cost once.

### Explore Board
Explore (`MemberBoard`, `MemberBoardRow`) reuses the ledger grammar instead of cards: one Note Stock panel; an ink-ruled header with the count, Sort and the active filters as removable Teal Wash chips; then two sections titled in their deal's ink (Free swaps teal, Learn with a credit orange), each with a count tag and one-line rule (the credit rule carries the refund and the member's balance). Any sort other than Recommended drops the sections for one ranked list; the stubs still carry each row's cost. A member's section is fixed (`deal` from the API), so a search never relabels them. Rows open with a deal stub whose word says which way the credit goes (`1 h` Free swap, `1` Credit; every credit row is paid by the member, so the stub names the unit); a row has exactly one price. "Free" only ever means no cost: availability reads "Available Mon Tue" and the filter "Available on", then name (plain text) and headline, a Teaches / Wants list where shared or searched skills are bold ink with a 2px teal underline, then rating, Reliable badge, available days, booking state and a teal "Wants your Python" fact on any row whose member wants what the member teaches (the header legend reads "underlined skills match yours"), then the row's one link: a teal verb (View or View request). Explore never uses the bold-ink verb, since nothing there is owed. From `xl` the five columns are fixed (96px, 192px, fluid, 176px, 152px); from `lg` who and skills share a column; on phones the row stacks beside its stub. Filters are chips (`FilterChips`; active ones repeat above the board as removable chips, 44px on touch; an empty result offers one "Remove … to see N members" button per filter that would bring members back; 3px corners, Teal Wash when pressed, 44px on touch, 36px from `lg`, a focus ring offset from the chip; figures only on labels with digits) in a sticky rail from `lg` with a Skip to results link, and below `lg` a drawer behind a sticky Filters button whose footer sits at the bottom edge. The search box is one 52px ink-bordered field with a drawn magnifier and a themed clear button.

### Public Profile
The profile (`ProfileHeader`, `ExchangeNote`, `ProfileDetails`) opens unboxed, like the dashboard greeting: a 72px avatar, a 36px name, an 18px muted headline and one facts line (rating, or "Not rated yet · 2 of 3 reviews" for someone with sessions but too few reviews; Reliable; sessions; last active; social links). The page's single plum note (`ExchangeNote`) carries the deal: You learn (skill, their level) on the left, the price said once in the middle as an unboxed 30px figure over its word (Free swap / You pay) and a plain gloss ("An hour of yours for an hour of theirs" / "One credit for each hour"), and on the right what they learn from you (free swap) or the balance before → after booking with "Held when you send. Returned if Gus declines or doesn't show up." (credit). A hairline below holds the one on-plum action and the status lines. With a session booked, the note leads with it (Join once open, else View in Sessions; "Your session starts in 8 min") and "Request another session" becomes a white underlined link in running text (`NoteLink` style), carrying "· 1 credit" on credit members. Actions say Request, never Book, matching the form and its Send request button. At 0 credits the action gives way to links to a free swap or to adding skills. Below, About, then When you can meet (right column from `lg`, before Reviews on phones), then Reviews ("Latest 3 of 31, all verified", the viewer's own marked "(you)"). The availability grid shows both weeks in the viewer's timezone ("Your time · Europe/Dublin"), hours as 24h figures, both free plum with a white dot (shape as well as colour), only them teal, only you a dashed teal outline, empty runs (even a single hour) folded into one dashed "Neither free" row, and the range trimmed to the hours in use on every profile. Both-free cells are buttons ("Book Saturday 11:00, both free" for screen readers) that open the booking form with that hour picked; a line above the key says "Tap a both-free hour to request it". The booking modal opened here marks the same hours "· Both free" on its chips (plum, white once the chip is picked), opens on a both-free day, and says "You're in a session with Bea right now" when one is under way. On phones its footer puts Send first. Below the review threshold, a rating reads "Not rated yet · 2 of 3 reviews" for anyone with sessions and "New member" only for those without (`StarRating`, everywhere). There is no sticky action bar.

### Messages
The conversation list (`ConversationList`) is grouped by who acts next (Needs your reply, which includes an owed session outcome; Booked; Waiting on them; Other conversations) under 12px uppercase muted labels, with dashed rules between rows. Rows lead with the person (avatar, name, last message); the deal is a small bordered tag under them in its ink (`+1 credit if taught` ink, `Free swap` teal, `1 credit held` orange, `1 credit returned` / `Mark the outcome` muted), always with its noun. Unread counts are ink pills, never orange. The thread header shows name, headline and a teal "Profile →". The pinned note (`PinnedRequestNote`) follows the Plum Is Next Rule: plum only when it's the member's move (a request to answer, a session open or within the hour, an outcome owed), else a one-row Note Stock bar with an ink border, the status, the headline and a Details toggle. Inside, `SwapRequestActions` prints times as outlined radio chips (white/50 on plum), the fill only on Accept, "Suggest other times" outlined, Decline / Withdraw request as quiet underlined links with a second confirming click whose "Yes" is outlined (closing is never the next step). After an action, `ActionStatus` (teal wash band, `role="status"`, focused) says what happened and links the next conversation waiting. Requests in the stream are one-line history chips (`RequestHistoryLine`). The composer is one row (text box, Send) with Share code as a quiet link below. The list has a search field (ink border, drawn magnifier) and All / Needs reply N / Unread N chips above it (counts in narrow figures on the chip, none in the header), and arrow-key movement. With no thread open, the right pane is `MessagesGuide`: a 20px "How Messages works" heading, then two sections under ink-rule h3s, the tags drawn with the list's own `Tag` styles beside muted meanings, and the numbered chat-opening rules. Below `lg` the legend stays a disclosure under the list. The stream (`MessageStream`) prints day dividers and the "New messages" divider as centred 12px uppercase labels between hairlines (teal for New messages), shows one time per run, and puts the member's delivery state after it (Sending…, Sent, or Couldn't send · Retry · Delete in danger red). The settle drawer and booking form open over the thread (`ThreadDialogs`). Lock notices state the reason in medium weight and the rule in muted text. A row matched by a skill replaces its preview with a teal-soft `mark` ("Learning Spanish"). An owed outcome behind a live session is a paper row (`OwedSessionNote`, row variant) under the plum note with a secondary button. One-way requests are "session requests", two-way ones "swap requests".

### Sessions
One column (max 64rem), no tabs. Sections share `SessionsSection`: an 18px heading on an ink rule with a muted fact right-aligned. The imminent session reuses the dashboard's plum Starting soon note; nothing else on the page is plum. Settle and Waiting on others items are `PaperRow`s (ink border, surface, 12px radius) with at most one secondary button; each leads with a 12px uppercase line of date (muted, narrow figures) and status (ink when it's the member's move, muted when it's someone else's), then the session by subject in semibold. Status words come from `sessionStatus.ts`, shared with History's status column. Coming up is an agenda: a 76px/96px day column (12px uppercase weekday, 30–36px narrow-figure day number), then time in narrow figures, partner, `DealTag`, and teal text verbs at 44px tap height; open requests are muted with a muted tag. History is a table with dashed row rules and a right-aligned narrow-figure credits column: `+1` teal, `−1` ink, `0` muted (never orange: orange means held, not spent). `DealTag` lives in `components/common` and is shared with Messages.

### Wallet Notes
`CreditSummaryCard` prints the balance as two notes side by side: Credits to spend (ink edge) and Held for sessions (orange edge, plus a decorative rotated HELD stamp), each with security hatching, a double rule, an uppercase 12px label and a 48px bold figure. Nothing else on the dashboard is hatched.

**The Credit Words Rule.** The noun always comes first or alongside: the nav reads "2 credits" then "2 held"; the wallet notes read "Credits to spend" and "Held for sessions", with one line under them saying what held means ("A held credit goes to the teacher once the session is complete. It comes back if the session doesn't happen, including when the teacher doesn't show up."); row stubs read "Credit held"; the booking modal reads "Uses 1 credit · leaves you 1 to spend". Never a bare "available" or "held" with no credit beside it. The refund rule is written once (`utils/credits.ts`) and shared by the booking modal and "How credits work": a held credit goes to the teacher only once the session is complete, and comes back if the teacher declines, the request expires, or the teacher doesn't show up.

### The Plum Note
`StartingSoonStrip`: full-width Next Plum note with a 6px corner, a white/15 inner frame and a guilloché rosette (concentric white/9% rules) bleeding off the top right. Left: the countdown as the denomination ("7m 59s" over "to start", the units smaller, `role="timer"`; "Now / in progress" once started). Middle: skill and partner (20px white), then role and date-time. Right: the on-plum Join, or "Join opens 10 min before". It appears only when a session is joinable or starts within the hour, and it holds the page's one primary action.

### Inputs / Fields
- **Style** (`TextField`, `SelectField`, `SkillCombobox`): label above in 14px medium; Note Stock field, hairline border, 4px corners, 44px tall.
- **Focus:** border turns teal plus a 2px teal ring at 25%.
- **Counter:** right-aligned 12px muted count below, tabular.

### Navigation
Sticky 64px band on Nav Tint with a bottom hairline, one row at every width. Links are 44px chips: muted, ink on hover, Plum Wash with plum semibold text when current (a fill as well as colour). Messages and Sessions carry their own count (`NavCount`: a 20px ink pill with narrow figures, never red, which reads as error, nor orange, which means held); there is no separate messages icon. The balance is one printed chip (3px corners, ink border, surface fill): "**2** credits | **2** held", the held part in orange after a hairline divider. It's a button that opens the "Your time credits" explainer (ink-bordered surface panel, 12px radius, soft shadow; full-width under the header on phones), fetched only when opened; it says what "held" means in one sentence before listing each held credit, and phones get a visible Close. Escape returns focus to the chip, and tabbing out closes it (both popovers, via `useDismiss`). While the balance loads, the chip shows a skeleton bar; if it fails, "Wallet unavailable". Then the avatar menu (Public profile, Wallet, Settings, Sign out; 44px rows), whose current page gets Plum Wash, with the avatar ringed in plum while you're on one of its pages. Below `md` the four places are fixed bottom tabs (64px, Nav Tint, top hairline, 24px stroked icons over 12px labels, a 3px plum bar and plum label on the current tab, counts on the icon's corner); `body:has([data-bottom-tabs])` gets matching bottom padding. Tabs use the same labels as desktop (Dashboard, not Home), and hide while a Messages thread is open by URL, like a messaging app; the thread's Back brings them back. A skip link appears on focus.

### Tabs
Segmented control (`Tabs`) with ARIA tabs and arrow keys: Note Stock track, hairline border, 4px inset; the active tab is filled teal with white, inactive tabs are muted and turn paper on hover.

### Feedback
Every fetching view handles all three states. **Loading** is drawn in the shape of what replaces it (`skeletons.tsx`: person card, row, session card, dark balance card, figures; real titles, tab and toggle labels in their words, counts held back until loaded), and each page's loading body lives in `pageSkeletons.tsx`. A browser reload shows `RouteSkeleton`: the real sidebar or top bar (account and balance as placeholders) around that same page body, so a reload and an in-app visit wait on one identical picture. Then one shared card, `StateCard`, for both of the others: a compact centred card (max 32rem; grey `card` on the page, white `inset` inside a grey card) with a small mark, a display-face title, at most one more line and one action. It lays out as a row when its container is 28rem or wider and stacks in narrow columns. `EmptyState` gives it an empty seat (dashed white circle with the subject's glyph from `stateIcons.tsx`); `AlertBanner` gives it a coral error mark and a secondary Try again, for loads that failed. Recommended's empty card puts the empty seat beside the member's own avatar (`MatchFeedEmpty`). **Finished actions** whose result isn't otherwise visible (a settle, cancel or confirm; settings saved; an account connected; a request sent) raise a success toast, `useToast().success(message)`: the same near-black card with a green tick, 4s. There are no inline "done" banners. **New messages** raise a message toast (`MessageToasts`, `useToast().message`) anywhere except the open thread: the sender's face and name, a two-line preview and a white Reply that opens the conversation, 6s. **Failed actions never show inline:** they raise a toast through `useToast().error(message, retry?)` (`ToastProvider`, `Toast`): a near-black card at the top centre (below the top bar on phones), coral mark, one line, Try again when the action can be rerun, a close button, 6s and paused on hover or focus. The stack is a manual popover rendered inside the open modal dialog when there is one (a modal makes everything outside it unclickable), so it sits above the dialog and its close button always works; it moves back to the page when the dialog closes. Field validation (a bad time, a missing name) stays beside the field.

**Explore cards (2026-11-13):** the face, name and headline are one link to the profile; the card's single action is a secondary button that says what it does: Book a session, Book another (a booked session is named above it with a calendar glyph and a See it link), or View request. With All selected, each section (Swap with, Learn from) shows its count and its first 4 people, plus "See all N", which switches the deal toggle to that section; a single-deal or ranked list shows 12 cards at a time with "Show 12 more · N left" (`MemberGrid`).

**Chat (2026-11-13):** messages are text only. The thread header's face, name and headline open the profile. A locked chat shows the lock card (a `StateCard` with a lock seat) where the composer would be.

**Account and sign-in (2026-11-13):** providers always show their own marks (`ProviderIcon`: Google's four colours, GitHub's Invertocat). Settings › Account has three panels: Sign-in methods (mark, name, a green dot and "Connected · username" or "Not connected", Connect or Disconnect; the last method's Disconnect is disabled), On your profile (a `Switch` per linkable account, GitHub only, saying what it adds), and Signed in (you, this device, Sign out). The sign-in page is the brand mark, "Sign in to Skill Swap", and white "Continue with Google/GitHub" buttons with the marks on the left.

**Turn wording (2026-11-13):** who acts next is said as a turn, with names: tabs and filters read "Your turn" / "Their turn", lines read "Bea's turn to reply" or "your turn to confirm", counts read "3 things to do", "2 to confirm", "2 to spend". Never "needs you", "waiting on others" or "you have N". On Sessions, sessions already answered and now being checked sit in their own **Under review** list (one line each, a timer, no button), apart from To confirm. Settling a session (Did it happen?, Confirm) opens a centred dialog, not a side drawer.

### Popovers
Native `popover` (e.g. `ReliableBadge`, the 🛡️ Reliable Swapper trigger with a dotted underline): Note Stock, hairline border, 6px corners, Float shadow. Anchored below its trigger where CSS anchor positioning exists (`.anchored-popover`), spanning the gutters on phones; centred by the browser elsewhere. Light dismiss, Escape and focus return come from the platform.

### Modals
Native `<dialog>` (`Modal`), centred (6px corners, 512px) or a full-height right drawer, Overlay shadow over `ink/40`. Header and footer stick; footer actions stack full-width on phones. Focus is trapped; Escape and backdrop clicks close unless an action is pending. The booking modal puts the trade, rating, cost (spendable balance change, refund rule) and any existing booking in one paper block before the picker. The picker is introduced by "Pick a day, then up to 3 times" with the timezone beside it; three day chips show at once plus "More days", reading "3 open" or "1 picked"; time chips show the full hour ("10:00–11:00"). The note stays behind "+ Add a note".

## Do's and Don'ts

### Do:
- **Do** use the tokens (`bg-next`, `text-held`, `border-line`…), never raw hex or Tailwind's default palette.
- **Do** set every number with `figures`, and give user-written text `[overflow-wrap:anywhere]`.
- **Do** keep exactly one primary (plum) button per view, and make it the member's next step.
- **Do** show the cost on every credit action ("1 credit") and mark held credits in orange wherever they appear.
- **Do** give every interactive element a visible `focus-visible` ring and at least a 44px target.
- **Do** respect `prefers-reduced-motion` on every transition.
- **Do** re-run the contrast table for any colour change; text pairs stay at 4.5:1 or above.
- **Do** handle loading, error and empty explicitly in every view that fetches or submits.
- **Do** build new components from `common/` primitives first.

### Don't:
- **Don't** add colours, fonts, radii or shadows without updating this file and `globals.css` together.
- **Don't** use plum for anything but the next step, or orange for anything but held credits.
- **Don't** put text on Hairline, or muted text below 12px.
- **Don't** use colour alone for state; pair it with a word (pills, stubs) or a count.
- **Don't** add gradients beyond the printing devices this world defines (security hatching on wallet notes, the rosette on the plum note).
- **Don't** nest cards, lift cards on hover, or round corners past 6px on anything but avatars and counts.
- **Don't** use emoji beyond those `PROJECT_PLAN.md` names (⚡ 🎁 🛡️), always `aria-hidden` beside a text label; icons are inline SVG.

## Known Gaps
- No dark theme (`color-scheme: light` only).
- Don't show a failed action inline or in a banner; raise a toast. Don't use a toast for a failed load; use the state card where the content would be.
- Only the dashboard is restructured into this world; other pages inherit the tokens on their earlier layouts.
