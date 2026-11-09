import type { AttendanceRecord, SessionDetail } from '../../types'
import { formatSlotDateTime } from '../../utils/timeSlots'

function describeJoin(records: AttendanceRecord[], userId: string) {
  const record = records.find((item) => item.userId === userId)
  if (!record) return 'No join recorded'
  const stay = record.leftAt === null ? 'still in the meeting' : `in for ${record.durationMinutes} min`
  return `Joined ${formatSlotDateTime(record.joinedAt)}, ${stay}`
}

// The meeting records an admin reviews, so members decide an outcome from the record rather than from memory.
export default function AttendanceSummary({ session }: { session: SessionDetail }) {
  const { partner, attendance, isTeaching, teacherId, learnerId } = session
  return (
    <dl className="mt-5 space-y-2 rounded-lg bg-canvas p-4 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="font-medium">You</dt>
        <dd className="text-right text-muted">{describeJoin(attendance, isTeaching ? teacherId : learnerId)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="font-medium">{partner.name.split(' ')[0]}</dt>
        <dd className="text-right text-muted">{describeJoin(attendance, partner.id)}</dd>
      </div>
    </dl>
  )
}
