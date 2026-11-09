import { formatSlotDateTime } from '../../utils/timeSlots'

interface BookedSessionNoteProps {
  startsAt: string | null
}

export default function BookedSessionNote({ startsAt }: BookedSessionNoteProps) {
  if (!startsAt) return null
  return <p className="text-sm font-medium text-accent-strong">Session booked: {formatSlotDateTime(startsAt)}</p>
}
