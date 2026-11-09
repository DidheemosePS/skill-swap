export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

// One bookable 1-hour block; startHour is 0-23 in the owner's timezone.
export interface TimeSlot {
  day: Weekday
  startHour: number
}

// The timezone travels with the slots so a grid can be converted for the viewer.
export interface WeeklyAvailability {
  timezone: string
  slots: TimeSlot[]
}
