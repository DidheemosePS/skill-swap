// Fills the thread pane when no conversation is open (wide screens only). The list beside it is the to-do,
// so this side only says what to do; what the tags mean sits in the Messages heading's tip.
export default function MessagesGuide() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
      </svg>
      <h2 className="mt-3 text-base font-medium text-ink">Pick a conversation</h2>
      <p className="mt-1 text-sm text-muted">Chat opens once a request is accepted.</p>
    </div>
  )
}
