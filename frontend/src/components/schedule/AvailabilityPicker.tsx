import { useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import type { TimeSlot } from '../../types'
import { formatHour, GRID_HOURS, slotKey, WEEKDAYS } from '../../utils/availability'

interface AvailabilityPickerProps {
  selected: TimeSlot[]
  onSlotChange: (slot: TimeSlot, isSelected: boolean) => void
}

const ARROW_MOVES: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

export default function AvailabilityPicker({ selected, onSlotChange }: AvailabilityPickerProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  // Roving tabindex: the grid is one Tab stop rather than 98, and arrows move inside it.
  const [focusCell, setFocusCell] = useState<[number, number]>([0, 0])
  // Whether the current mouse drag is adding or removing, fixed by the first block touched.
  const paintValue = useRef<boolean | null>(null)
  const lastPointerType = useRef('')
  const selectedKeys = new Set(selected.map(slotKey))

  function handlePointerDown(event: PointerEvent, slot: TimeSlot) {
    lastPointerType.current = event.pointerType
    // Touch stays tap-only, so swiping across the grid still scrolls the page.
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    paintValue.current = !selectedKeys.has(slotKey(slot))
    onSlotChange(slot, paintValue.current)
    // Listen on window because the button can be released outside the grid.
    window.addEventListener('pointerup', () => { paintValue.current = null }, { once: true })
  }

  function handleClick(event: MouseEvent, slot: TimeSlot) {
    // Mouse presses already toggled on pointer down; detail 0 means Enter or Space.
    if (event.detail > 0 && lastPointerType.current === 'mouse') return
    onSlotChange(slot, !selectedKeys.has(slotKey(slot)))
  }

  function handleKeyDown(event: KeyboardEvent, row: number, column: number) {
    const move = ARROW_MOVES[event.key]
    if (!move) return
    event.preventDefault()
    const nextRow = Math.min(Math.max(row + move[0], 0), GRID_HOURS.length - 1)
    const nextColumn = Math.min(Math.max(column + move[1], 0), WEEKDAYS.length - 1)
    setFocusCell([nextRow, nextColumn])
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${nextRow}-${nextColumn}"]`)?.focus()
  }

  return (
    <div ref={gridRef} role="grid" aria-label="Weekly availability" className="select-none">
      <div role="row" className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1">
        <span role="columnheader" aria-label="Time" />
        {WEEKDAYS.map((day) => (
          <span key={day.id} role="columnheader" aria-label={day.long} className="pb-1 text-center text-xs font-semibold">
            {day.short}
          </span>
        ))}
      </div>
      {GRID_HOURS.map((startHour, row) => (
        <div key={startHour} role="row" className="mt-1 grid grid-cols-[3rem_repeat(7,1fr)] gap-1">
          <span role="rowheader" className="flex items-center text-xs whitespace-nowrap text-muted">
            {formatHour(startHour)}
          </span>
          {WEEKDAYS.map((day, column) => {
            const slot = { day: day.id, startHour }
            const isSelected = selectedKeys.has(slotKey(slot))
            return (
              <span key={day.id} role="gridcell">
                <button
                  type="button"
                  data-cell={`${row}-${column}`}
                  tabIndex={focusCell[0] === row && focusCell[1] === column ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={`${day.long}, ${formatHour(startHour)}`}
                  onFocus={() => setFocusCell([row, column])}
                  onPointerDown={(event) => handlePointerDown(event, slot)}
                  onPointerEnter={() => {
                    if (paintValue.current !== null) onSlotChange(slot, paintValue.current)
                  }}
                  onClick={(event) => handleClick(event, slot)}
                  onKeyDown={(event) => handleKeyDown(event, row, column)}
                  className={`block h-8 w-full rounded outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 sm:h-7 ${isSelected ? 'bg-accent hover:bg-accent-strong' : 'bg-line/60 hover:bg-line'}`}
                />
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
