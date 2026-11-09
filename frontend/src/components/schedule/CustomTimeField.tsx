import { useState } from 'react'
import { fetchSlotStatus } from '../../services/slotService'
import { getCustomSlotError, getCustomSlotRange } from '../../utils/timeSlots'
import Button from '../common/Button'

interface CustomTimeFieldProps {
  peerId: string
  requestId: string
  isFull: boolean
  selected: string[]
  onAdd: (startsAt: string) => void
}

export default function CustomTimeField({ peerId, requestId, isFull, selected, onAdd }: CustomTimeFieldProps) {
  const [range] = useState(() => getCustomSlotRange(Date.now()))
  const [value, setValue] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function add() {
    // The input holds local time with no timezone, and Date reads it that way.
    const parsed = new Date(value)
    const startsAt = Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
    const invalid = getCustomSlotError(startsAt, Date.now())
    if (invalid || selected.includes(startsAt)) {
      setError(invalid ?? 'You have already added this time.')
      return
    }
    setIsChecking(true)
    setError(null)
    try {
      const status = await fetchSlotStatus(peerId, startsAt, requestId)
      if (status === 'open') {
        onAdd(startsAt)
        setValue('')
      } else {
        setError('That time clashes with a session or a time on hold.')
      }
    } catch {
      setError("We couldn't check that time. Please try again.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="mt-4">
      <label htmlFor={`custom-time-${requestId}`} className="text-sm font-medium">Suggest a different time</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id={`custom-time-${requestId}`}
          type="datetime-local"
          value={value}
          min={range.min}
          max={range.max}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm"
        />
        <Button variant="secondary" onClick={add} disabled={isFull || value === ''} isLoading={isChecking}>Add time</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}
