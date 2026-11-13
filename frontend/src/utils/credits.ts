// One refund rule, worded once, so the booking modal and "How credits work" can never disagree about money.
// A teacher no-show refunds too: sessionActions returns the credit when the absent member is the teacher.
export function creditReturnRule(teacher: string) {
  return `Paid to ${teacher} after the session; returned if it doesn't happen.`
}
