---
name: Skill Swap
description: A community noticeboard where jobs are flat index cards and proposed times are tear-off tabs.
colors:
  ultramarine: "#2b3a8c"
  ultramarine-deep: "#22306f"
  ultramarine-wash: "#e6e9f6"
  sun: "#ffd84d"
  coral: "#ff6a3d"
  coral-wash: "#ffe4da"
  held-rust: "#b13a12"
  held-wash: "#fbe9e2"
  success: "#1f7a4a"
  success-wash: "#e6f2e6"
  success-bright: "#5fd08f"
  danger: "#a32a1f"
  danger-wash: "#fbeae7"
  danger-bright: "#ff8a73"
  star-amber: "#8a5a00"
  ink: "#1b1d22"
  muted: "#4e525c"
  faint: "#666a74"
  board: "#f6f6f2"
  canvas: "#ecece6"
  card: "#ffffff"
  line: "#e3e3dc"
  line-strong: "#cfcfc6"
typography:
  display:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Familjen Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter Tight Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter Tight Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  md: "6px"
  lg: "8px"
  card: "10px"
  pill: "9999px"
spacing:
  card-pad: "20px"
  next-pad: "24px"
  board-gap: "20px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ultramarine-deep}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0 20px"
    height: "44px"
  button-on-next:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "44px"
  nav-bar:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.card}"
    height: "64px"
  nav-count:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "20px"
  wallet-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  card-next:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "32px 24px 24px"
  card-request:
    backgroundColor: "{colors.coral-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-need:
    backgroundColor: "{colors.coral-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-plain:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  stamp-hours:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ultramarine}"
    rounded: "{rounded.card}"
    padding: "20px"
  tab-stub:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "64px"
---

# Design System: Skill Swap

## Overview

**Creative North Star: "The Community Noticeboard"**

An off-white board with an ultramarine bar across the top, and on it every job is a flat index card pinned in a tidy 12-column grid. What starts next is sun yellow, what needs the member is coral tint, everything else is white, and the member's hours are a dashed ultramarine stamp read as a sentence. A request's proposed times hang off the card as tear-off tabs: taking one is the system's single authored gesture. Everything else is still.

The board is dense but calm: hairline borders, a 10px card radius, no side bars on cards, no eyebrow labels, no stat tiles. Familjen Grotesk sets headings and the big figures with a slightly tight tracking; Inter Tight carries the reading text. Colour sorts the board by urgency, not by decoration.

Skill Swap is a credit-based peer teaching product, so the board speaks plainly: who, one sentence, one verb.

**Key Characteristics:**
- Ultramarine top bar at every width; the left sidebar is no longer rendered and phones move the main links to bottom tabs.
- Whole flat cards in colour (sun, coral wash, white), never a coloured edge stripe.
- One authored motion: the tear-off. Reduced motion keeps its white fill and ring.
- Figures use tabular numerals so hours and times line up.

## Colors

An off-white board carrying one blue, one yellow and one orange. The two warm colours only ever mean "next" and "needs you".

### Primary
- **Ultramarine** (#2b3a8c): the top bar, links, focus rings, the one primary action, and the hours stamp frame and figure. Deep ultramarine (#22306f) is its hover. Ultramarine wash (#e6e9f6) is text selection, disabled primary fill and the Join button's hover.

### Secondary
- **Noticeboard Sun** (#ffd84d): the fill of the single "next session" card. Ink text only.
- **Pin Coral** (#ff6a3d): the pin on the yellow card, the nav count badge, the dashed perforation and stub borders on request cards (at 70% and 40% opacity). Ink text on it.
- **Coral Wash** (#ffe4da): the fill of every card that needs the member (requests, owed outcomes).

### Tertiary
- **Held Rust** (#b13a12) on Held Wash (#fbe9e2): credits held in escrow.
- **Success** (#1f7a4a) on Success Wash (#e6f2e6), with bright variants (#5fd08f, #ff8a73 for danger) for use on dark grounds.
- **Danger** (#a32a1f) on Danger Wash (#fbeae7); **Star Amber** (#8a5a00) for ratings.

### Neutral
- **Ink** (#1b1d22) body and heading text; **Muted** (#4e525c) and **Faint** (#666a74) for secondary text.
- **Board** (#f6f6f2) the page ground; **Canvas** (#ecece6) hover fills and quiet wells; **Card White** (#ffffff) plain cards and inputs.
- **Line** (#e3e3dc) and **Line Strong** (#cfcfc6): hairlines and stronger dividers.

### Named Rules
**The Colour Means Urgency Rule.** Yellow is for the one thing that is next, coral for what needs the member, white for everything else. A new card takes its fill from what it asks of the member, never from taste.

**The One Blue Rule.** Ultramarine is the bar, the link, the focus ring and the single primary action on a card. A card shows at most one primary button.

## Typography

**Display Font:** Familjen Grotesk (500, 600, 700; system-ui fallback)
**Body Font:** Inter Tight Variable (system-ui fallback)

**Character:** A friendly, slightly quirky grotesk for headings and figures over a compact, neutral text face. h1, h2 and h3 take the display face automatically with -0.015em tracking (h1 -0.02em).

### Hierarchy
- **Display** (700, 2.25rem, 1): the yellow card's countdown, "Starts in 12 min".
- **Headline** (700, 1.875rem, 1.25): the hours stamp sentence, "2 credits to spend".
- **Title** (600, 1.125rem to 1.25rem, snug): card headings, names, section headings such as "Your time" and "Their turn".
- **Body** (400, 0.875rem, 1.43): card sentences and lists, muted for supporting lines.
- **Label** (500, 0.875rem): buttons, nav pills, tab times; tab dates use display 700 at 1.25rem, small tab text is 0.75rem.

### Named Rules
**The Figures Line Up Rule.** Hours, credits, times and counts take the `figures` utility (tabular-nums) so columns of numbers align.

## Layout

A centred page (max-w-page, 80rem; px 16/24/40px at base/sm/lg) under a sticky 64px bar. The dashboard is a 12-column board from xl up with a 20px gap: left column 4 (yellow next card, then Their turn), middle 5 (requests and owed outcomes), right 3 (hours stamp, then Coming up). Below xl the side columns dissolve into one stack in DOM order, with Their turn rendered in both places and only one displayed so reading and tab order match the visual order. People to swap with sits below the board after a 40px gap. Phones show the main links as fixed bottom tabs, with the body padded 4rem plus the safe-area inset. Touch targets are 44px; anchor scroll stops below the bar (5rem, 8.5rem on phones).

## Elevation & Depth

Flat. Cards are separated by colour fill and hairlines, not by shadow. The only lifts are the yellow card's soft cast (`0 10px 24px -12px rgb(27 29 34 / 0.4)`), the pin's small shadow, and the torn tab's drop (`0 6px 14px -6px rgb(27 29 34 / 0.35)` plus a 2px ultramarine inset ring), which say "this is physically pinned" or "this was just moved".

### Named Rules
**The Pinned Means Physical Rule.** A shadow appears only where an object is pinned to or torn from the board. Nothing else lifts.

## Shapes

One flat radius family: 6px for inputs, tabs, nav pills and the wallet chip, 8px for buttons, 10px for cards, full round for count badges, pins and avatars. Borders are hairline (1px Line) on white cards; the hours stamp is the one dashed frame (2px dashed ultramarine). Request cards end in a perforation: a 2px dashed coral rule with two board-coloured half-circle notches (24px) cut into the card at its ends, and the times below it are separate stubs.

## Components

### Buttons
- **Shape:** 8px radius, 44px tall, 20px side padding, 14px medium label; presses to 98% scale.
- **Primary:** ultramarine fill, white text; hover deep ultramarine; disabled wash with muted text.
- **Secondary:** white, 1px Line border, ink text; hover Muted border and Canvas fill.
- **On next card:** white fill, ink text (Join meeting on the yellow card).
- **Focus:** 2px ultramarine ring with offset; rings are white on the ultramarine bar.

### Navigation
- A 64px ultramarine bar at every width: brand mark in white, main links as 44px pills (active is white at 15% fill, never colour alone), then the wallet chip and avatar menu. Counts are coral circles with ink numerals, 9+ capped. Under 768px the links move to fixed bottom tabs.

### Wallet chip
- A white 6px-radius chip on the bar: "2 credits | 2 held", held in Held Rust. Pressing it explains the numbers in place.

### Cards
- **Next card (sun):** sun yellow, 10px radius (rounded-2xl), 24px padding, coral pin straddling the top edge, countdown in display, swap title, avatar and time, Join meeting at the foot.
- **Request card (coral wash):** avatar and a sentence, "Take a tab to accept that time", a quiet "More options" link, then the perforated strip of tear-off stubs.
- **Need card (coral wash):** avatar, name, one sentence, one verb button.
- **Their turn card (white):** hairline border, divided rows of avatar, line and a link action.

### Tear-off tab (signature)
Each proposed time is a white 6px stub (64px minimum) with weekday, date in display, and time. Taking one tears it: the stub tilts 2 degrees and drops 8px to -4 degrees over 420ms (cubic-bezier 0.16, 1, 0.3, 1), gains a drop shadow and an ultramarine ring, the other stubs dim to 40%, and the card asks once, "Book Tuesday 14 March, 10:00 with Sam?" with Book and Put back. Put back returns the tab. With reduced motion only the white fill and ring remain.

### Hours stamp
A white card with a 2px dashed ultramarine frame holding "Your time", a Wallet link and one sentence in the display face, "2 credits to spend", followed by held credits and hours taught and learned in words.

## Do's and Don'ts

### Do:
- **Do** fill a card by what it asks of the member: sun (#ffd84d) for next, coral wash (#ffe4da) for owed, white for the rest.
- **Do** keep text on sun and coral in ink (#1b1d22).
- **Do** keep one primary ultramarine button per card and put the verb on it.
- **Do** use tabular figures for every count, credit, hour and time.
- **Do** give interactive elements a visible 2px focus ring (white on the bar, ultramarine elsewhere) and 44px targets.
- **Do** keep motion to the tear-off, gated by prefers-reduced-motion.

### Don't:
- **Don't** use grey stat tiles or a table inbox for the dashboard.
- **Don't** add coloured side stripes, eyebrow labels, or credit tags in lists.
- **Don't** raise a card with a shadow unless it is pinned or torn.
- **Don't** use red for counts (it reads as an error) or coral text on white.
- **Don't** use the em dash in user-facing copy.
