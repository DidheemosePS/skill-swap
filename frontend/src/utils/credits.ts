// One refund rule, worded once, so the booking modal and "How credits work" can never disagree about money.
// The credit follows the attendance record: an absent teacher refunds it, an absent learner or a late cancel doesn't.
export function creditReturnRule(teacher: string) {
  return `Paid to ${teacher} once the session settles; returned if ${teacher} misses it or you cancel 2+ hours ahead.`
}
