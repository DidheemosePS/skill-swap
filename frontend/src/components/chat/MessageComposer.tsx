import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { MessageDraft } from '../../types'
import { MAX_MESSAGE_LENGTH } from '../../utils/chat'
import Button from '../common/Button'

interface MessageComposerProps {
  // Takes the draft at once: delivery state then shows on the message in the thread, not here.
  onSend: (draft: MessageDraft) => void
}

const FIELD_CLASSES =
  'min-h-11 w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base outline-none transition [field-sizing:content] placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm'

// One box and Send, so the composer stays short and the conversation keeps the space on a phone.
export default function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const canSend = text.trim() !== ''

  function send() {
    if (!canSend) return
    onSend({ kind: 'text', body: text.trim() })
    setText('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing guards input methods, where Enter confirms a character rather than sending; keyCode 229
    // covers Safari, which can clear isComposing before this runs. Shift+Enter is a new line.
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229 || event.shiftKey) return
    event.preventDefault()
    send()
  }

  return (
    <div className="flex items-end gap-2 border-t border-line bg-surface p-3">
      <label className="block min-w-0 flex-1">
        <span className="sr-only">Message</span>
        <textarea
          value={text}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="Write a message"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          className={`${FIELD_CLASSES} max-h-40`}
        />
      </label>
      <Button onClick={send} disabled={!canSend} className="shrink-0">Send</Button>
    </div>
  )
}
