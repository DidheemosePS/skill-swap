import type { BusyTime, PeerSlot, SlotHold, TimeSlot, Weekday, WeeklyAvailability } from '../types'
import { getViewerTimezone } from './availability'
import { CANCEL_CUTOFF_HOURS, CANCEL_CUTOFF_MS } from './sessions'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const HOLD_HOURS = 48
// Indexed by Date.getUTCDay(), which counts from Sunday.
const WEEKDAY_BY_INDEX: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function getZoneParts(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: read('year'), month: read('month'), day: read('day'), hour: read('hour'), minute: read('minute'), second: read('second') }
}

function getZoneOffsetMs(timeZone: string, date: Date): number {
  const { year, month, day, hour, minute, second } = getZoneParts(timeZone, date)
  return Date.UTC(year, month - 1, day, hour, minute, second) - Math.floor(date.getTime() / 1000) * 1000
}

// The offset is checked twice because the first guess can land on the wrong side of a DST change.
function zonedTimeToMs(wallClockMs: number, timeZone: string): number {
  const firstGuess = wallClockMs - getZoneOffsetMs(timeZone, new Date(wallClockMs))
  return wallClockMs - getZoneOffsetMs(timeZone, new Date(firstGuess))
}

// Turns a member's recurring weekly hours into real start times, as ISO strings, soonest first.
export function getUpcomingSlots({ timezone, slots }: WeeklyAvailability, now: number, days = 14): string[] {
  const { year, month, day } = getZoneParts(timezone, new Date(now))
  const todayMs = Date.UTC(year, month - 1, day)
  // Nothing inside the cancellation cutoff can be booked, so every session keeps a free-cancel window.
  const earliest = now + CANCEL_CUTOFF_MS
  const starts: number[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const dateMs = todayMs + offset * DAY_MS
    const weekday = WEEKDAY_BY_INDEX[new Date(dateMs).getUTCDay()]
    for (const slot of slots) {
      if (slot.day !== weekday) continue
      const startMs = zonedTimeToMs(dateMs + slot.startHour * HOUR_MS, timezone)
      if (startMs >= earliest) starts.push(startMs)
    }
  }
  return starts.sort((a, b) => a - b).map((ms) => new Date(ms).toISOString())
}

export const formatSlotDay = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso))

export const formatSlotTime = (iso: string) =>
  // 24-hour, zero-padded, so every time lines up in the narrow figure column.
  new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso))

export const formatSlotDateTime = (iso: string) => `${formatSlotDay(iso)}, ${formatSlotTime(iso)}`

// Slots are one hour long. Overlap rather than exact match, so a session starting at 9:30 also
// rules out the 9:00 and 10:00 slots.
function overlapsSlot(slotStart: string, range: BusyTime): boolean {
  const start = Date.parse(slotStart)
  return start < Date.parse(range.endsAt) && start + HOUR_MS > Date.parse(range.startsAt)
}

export const getSlotEnd = (startsAt: string) => new Date(Date.parse(startsAt) + HOUR_MS).toISOString()

// A hold lasts 48 hours, or until the cancellation cutoff before the session if that comes first, so a silent
// mentor can't block a time forever and a late answer can't book a session with no free-cancel window.
export function getHoldExpiry(startsAt: string, now: number): string {
  return new Date(Math.min(now + HOLD_HOURS * HOUR_MS, Date.parse(startsAt) - CANCEL_CUTOFF_MS)).toISOString()
}

export const isHoldActive = ({ expiresAt }: SlotHold, now: number) =>
  expiresAt === null || Date.parse(expiresAt) > now

// The member's own clashes win, because that's the reason that matters most to them.
export function classifySlots(starts: string[], mentorHolds: SlotHold[], myBusyTimes: BusyTime[], now: number): PeerSlot[] {
  const active = mentorHolds.filter((hold) => isHoldActive(hold, now))
  const matchingHold = (startsAt: string) =>
    active.find((hold) => overlapsSlot(startsAt, { startsAt: hold.startsAt, endsAt: getSlotEnd(hold.startsAt) }))

  return starts.map((startsAt) => {
    if (myBusyTimes.some((busy) => overlapsSlot(startsAt, busy))) return { startsAt, status: 'your_session' }
    return { startsAt, status: matchingHold(startsAt)?.status ?? 'open' }
  })
}

const CUSTOM_SLOT_MAX_DAYS = 30

export function getCustomSlotError(startsAt: string, now: number): string | null {
  const start = Date.parse(startsAt)
  if (Number.isNaN(start)) return 'Please enter a date and time.'
  if (start < now + CANCEL_CUTOFF_MS) return `Please pick a time at least ${CANCEL_CUTOFF_HOURS} hours from now.`
  if (start > now + CUSTOM_SLOT_MAX_DAYS * DAY_MS) return `Please pick a time within the next ${CUSTOM_SLOT_MAX_DAYS} days.`
  return null
}

// A datetime-local input takes local time with no timezone, so the offset is removed first.
const toDateTimeInputValue = (ms: number) =>
  new Date(ms - new Date(ms).getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

export const getCustomSlotRange = (now: number) => ({
  min: toDateTimeInputValue(now + CANCEL_CUTOFF_MS),
  max: toDateTimeInputValue(now + CUSTOM_SLOT_MAX_DAYS * DAY_MS),
})

// A member's weekly hours restated in the viewer's timezone, so a profile grid, its overlay and the
// booking picker all speak one clock. Built from the real upcoming starts, so offsets and day changes are exact.
export function toViewerWeek(availability: WeeklyAvailability, now: number): WeeklyAvailability {
  const timezone = getViewerTimezone()
  const format = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, weekday: 'short', hour: '2-digit', hourCycle: 'h23' })
  const seen = new Map<string, TimeSlot>()
  for (const iso of getUpcomingSlots(availability, now, 8)) {
    const parts = format.formatToParts(new Date(iso))
    const day = parts.find((part) => part.type === 'weekday')?.value.toLowerCase().slice(0, 3) as Weekday
    const startHour = Number(parts.find((part) => part.type === 'hour')?.value)
    seen.set(`${day}-${startHour}`, { day, startHour })
  }
  return { timezone, slots: [...seen.values()] }
}
