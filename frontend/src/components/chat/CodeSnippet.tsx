import { useState } from 'react'

interface CodeSnippetProps {
  language: string
  code: string
}

export default function CodeSnippet({ language, code }: CodeSnippetProps) {
  const [copyLabel, setCopyLabel] = useState('Copy')

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy failed')
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-ink text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/15 px-3 py-1.5 text-xs">
        <span>{language}</span>
        <button type="button" onClick={copy} className="min-h-6 rounded px-1 font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-white">
          {copyLabel}
        </button>
      </div>
      <pre tabIndex={0} className="overflow-x-auto p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset">
        <code>{code}</code>
      </pre>
    </div>
  )
}
