import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { MessageDraft } from '../../types'
import { MAX_MESSAGE_LENGTH } from '../../utils/chat'
import AlertBanner from '../common/AlertBanner'
import Button from '../common/Button'
import SelectField from '../common/SelectField'

interface MessageComposerProps {
  onSend: (draft: MessageDraft) => Promise<void>
}

const LANGUAGES = ['python', 'javascript', 'typescript', 'sql', 'other'].map((value) => ({ value, label: value }))

const FIELD_CLASSES =
  'min-h-11 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-base outline-none transition [field-sizing:content] placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25 sm:text-sm'

export default function MessageComposer({ onSend }: MessageComposerProps) {
  const [mode, setMode] = useState<'text' | 'code'>('text')
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('python')
  const [isSending, setIsSending] = useState(false)
  const [hasError, setHasError] = useState(false)

  const canSend = text.trim() !== '' && !isSending

  async function send() {
    if (!canSend) return
    setIsSending(true)
    setHasError(false)
    try {
      await onSend(mode === 'text' ? { kind: 'text', body: text.trim() } : { kind: 'code', language, code: text })
      setText('')
      setMode('text')
    } catch {
      // The draft stays in the box, so nothing typed is lost.
      setHasError(true)
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing guards input methods, where Enter confirms a character rather than sending.
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    // In code mode Enter is a new line, so sending takes Cmd or Ctrl as well.
    const shouldSend = mode === 'text' ? !event.shiftKey : event.metaKey || event.ctrlKey
    if (!shouldSend) return
    event.preventDefault()
    void send()
  }

  return (
    <div className="space-y-2 border-t border-line bg-surface p-3">
      {hasError && <AlertBanner message="We couldn't send your message. Please try again." />}
      {mode === 'code' && (
        <div className="max-w-48">
          <SelectField label="Language" value={language} options={LANGUAGES} onChange={setLanguage} />
        </div>
      )}
      <label className="block">
        <span className="sr-only">{mode === 'text' ? 'Message' : 'Code snippet'}</span>
        <textarea
          value={text}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          spellCheck={mode === 'text'}
          placeholder={mode === 'text' ? 'Write a message' : 'Paste your code. Press Cmd or Ctrl + Enter to send.'}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          className={`${FIELD_CLASSES} max-h-40 ${mode === 'code' ? 'font-mono' : ''}`}
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <Button variant="secondary" aria-pressed={mode === 'code'} onClick={() => setMode(mode === 'text' ? 'code' : 'text')}>
          {mode === 'text' ? 'Share code' : 'Back to text'}
        </Button>
        <Button onClick={send} disabled={!canSend} isLoading={isSending}>Send</Button>
      </div>
    </div>
  )
}
