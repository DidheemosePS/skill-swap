import { useState } from 'react'
import type { PeerSlot, SlotStatus, TimeSlot } from '../../types'
import { localSlotKey, slotKey } from '../../utils/availability'
import { formatSlotDateTime, formatSlotDay, formatSlotTime } from '../../utils/timeSlots'
import Badge from '../common/Badge'

interface TimeSlotPickerProps {
  slots: PeerSlot[]
  selected: string[]
  max: number
  onToggle: (slot: string) => void
  // Weekly hours both members keep free, in the viewer's timezone; matching chips say "Both free".
  sharedSlots?: TimeSlot[]
}


const STATUS_LABELS: Partial<Record<SlotStatus, string>> = {
  on_hold: 'On hold',
  booked: 'Booked',
  // Covers any overlap, so a session starting mid-hour doesn't read as two bookings.
  your_session: 'Clashes with yours',
}

function groupByDay(slots: PeerSlot[]) {
  const groups = new Map<string, PeerSlot[]>()
  for (const slot of slots) {
    const day = formatSlotDay(slot.startsAt)
    groups.set(day, [...(groups.get(day) ?? []), slot])
  }
  return [...groups.entries()]
}

const BASE_CLASSES =
  'min-h-11 rounded-md border px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1'

function getChipClasses(isUnavailable: boolean, isSelected: boolean, isBlocked: boolean) {
  // Taken times stay readable (no fading), because they tell members to try another day.
  if (isUnavailable) return `${BASE_CLASSES} cursor-not-allowed border-dashed border-line bg-canvas text-muted`
  if (isSelected) return `${BASE_CLASSES} border-next bg-next text-white`
  if (isBlocked) return `${BASE_CLASSES} cursor-not-allowed border-line bg-surface text-muted`
  return `${BASE_CLASSES} border-line bg-surface hover:bg-canvas`
}

const VISIBLE_DAYS = 3

// Day first, then time: two weeks of chips at once was too many choices for one glance.
export default function TimeSlotPicker({ slots, selected, max, onToggle, sharedSlots = [] }: TimeSlotPickerProps) {
  const sharedKeys = new Set(sharedSlots.map(slotKey))
  const days = groupByDay(slots)
  const hasOpen = (list: PeerSlot[]) => list.some((slot) => slot.status === 'open')
  // Opens on a time already picked (from the profile grid), else the first day with an open both-free hour,
  // else a day without one of your sessions, so booking someone again doesn't default to the same day.
  const hasSharedOpen = (list: PeerSlot[]) => list.some((slot) => slot.status === 'open' && sharedKeys.has(localSlotKey(slot.startsAt)))
  const firstOpenDay =
    (selected[0] ? formatSlotDay(selected[0]) : undefined) ??
    days.find(([, list]) => hasSharedOpen(list))?.[0] ??
    days.find(([, list]) => hasOpen(list) && !list.some((slot) => slot.status === 'your_session'))?.[0] ??
    days.find(([, list]) => hasOpen(list))?.[0]
  const [chosenDay, setActiveDay] = useState(firstOpenDay ?? days[0]?.[0])
  // After a reload a chosen day can drop out of the list, so fall back rather than show nothing.
  const activeDay = days.some(([day]) => day === chosenDay) ? chosenDay : (firstOpenDay ?? days[0]?.[0])
  const daySlots = days.find(([day]) => day === activeDay)?.[1] ?? []
  const isFull = selected.length >= max
  const [showAllDays, setShowAllDays] = useState(false)
  // Three days plus "More days" keeps the first choice to four options; the active day always stays visible.
  const visibleDays = showAllDays ? days : days.filter(([day], index) => index < VISIBLE_DAYS || day === activeDay)

  return (
    <div>
      <div role="group" aria-label="Day" className="flex flex-wrap gap-2">
        {visibleDays.map(([day, list]) => {
          const picked = list.filter((slot) => selected.includes(slot.startsAt)).length
          // Counts down as times are picked, so the number always means what's still free to choose.
          const open = list.filter((slot) => slot.status === 'open').length - picked
          return (
            <button
              key={day}
              type="button"
              aria-pressed={day === activeDay}
              onClick={() => setActiveDay(day)}
              className={`${BASE_CLASSES} py-1 text-left ${day === activeDay ? 'border-next bg-next-soft text-ink' : 'border-line bg-surface hover:bg-canvas'}`}
            >
              {/* Day over count, so three days and "More days" fit one row in the modal. */}
              <span className="block">{day}</span>
              {/* Picked days say so, rather than "0 open", which read as a day that had filled up. */}
              <span className={`block text-xs font-normal ${day === activeDay ? 'text-accent-strong' : 'text-muted'}`}>
                {picked > 0 ? (
                  <><span className="figures">{picked}</span> picked</>
                ) : (
                  <><span className="figures">{open}</span> open</>
                )}
              </span>
            </button>
          )
        })}
        {days.length > visibleDays.length && (
          <button type="button" onClick={() => setShowAllDays(true)} className={`${BASE_CLASSES} border-transparent text-accent-strong hover:underline`}>
            More days ({days.length - visibleDays.length})
          </button>
        )}
      </div>

      <div role="group" aria-label={`Times on ${activeDay}`} className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {daySlots.map((slot) => {
          const isSelected = selected.includes(slot.startsAt)
          const unavailableLabel = STATUS_LABELS[slot.status]
          const isBlocked = isFull && !isSelected
          // aria-disabled rather than disabled keeps taken times in the tab order, so keyboard users hear why.
          return (
            <button
              key={slot.startsAt}
              type="button"
              aria-pressed={isSelected}
              aria-disabled={Boolean(unavailableLabel) || isBlocked}
              onClick={() => !unavailableLabel && !isBlocked && onToggle(slot.startsAt)}
              className={getChipClasses(Boolean(unavailableLabel), isSelected, isBlocked)}
            >
              {/* The full hour, so every chip restates that a session is one hour long. */}
              <span className="figures">
                {formatSlotTime(slot.startsAt)}–{formatSlotTime(new Date(Date.parse(slot.startsAt) + 3_600_000).toISOString())}
              </span>
              {unavailableLabel && ` · ${unavailableLabel}`}
              {!unavailableLabel && sharedKeys.has(localSlotKey(slot.startsAt)) && (
                // White on the teal of a picked chip, plum otherwise: plum on teal fails contrast.
                <span className={`ml-1.5 text-xs font-semibold ${isSelected ? 'text-white' : 'text-next'}`}>· Both free</span>
              )}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted tabular-nums">Picked {selected.length} of {max}</span>
            {[...selected].sort().map((slot) => (
              <Badge key={slot} label={formatSlotDateTime(slot)} onRemove={() => onToggle(slot)} />
            ))}
          </div>
        )}
        {isFull && max > 0 && <p className="text-xs text-muted">That's the most you can propose. Remove one to pick another.</p>}
      </div>
    </div>
  )
}
