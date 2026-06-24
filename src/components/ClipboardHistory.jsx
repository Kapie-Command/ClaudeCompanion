import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function ClipboardHistory() {
  const clipboardHistory = useStore(s => s.clipboardHistory)
  const clearClipboardHistory = useStore(s => s.clearClipboardHistory)
  const [expanded, setExpanded] = useState(false)
  const [flashId, setFlashId] = useState(null)

  const handleRecopy = async (text, idx) => {
    await window.electronAPI.clipboard.write(text)
    setFlashId(idx)
    setTimeout(() => setFlashId(null), 400)
  }

  if (clipboardHistory.length === 0) return null

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`border-t border-border bg-surface-1 transition-all ${expanded ? 'h-48' : 'h-9'}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 h-9 text-xs hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-text-muted">{expanded ? '▼' : '▲'}</span>
          <span className="text-text-secondary font-medium">Clipboard History</span>
          <span className="text-text-muted">({clipboardHistory.length})</span>
        </div>
        {expanded && (
          <span
            onClick={(e) => { e.stopPropagation(); clearClipboardHistory() }}
            className="text-text-muted hover:text-warning transition-colors"
          >
            Clear
          </span>
        )}
      </button>

      {/* History list */}
      {expanded && (
        <div className="overflow-y-auto h-[calc(100%-2.25rem)] px-2 pb-2 space-y-1">
          {clipboardHistory.map((entry, i) => (
            <div
              key={entry.timestamp}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-surface-2 group cursor-pointer ${flashId === i ? 'copy-flash' : ''}`}
              onClick={() => handleRecopy(entry.text, i)}
            >
              <span className="text-[10px] text-text-muted shrink-0 w-12">
                {formatTime(entry.timestamp)}
              </span>
              <span className="text-xs text-text-secondary truncate flex-1">
                {entry.text}
              </span>
              <span className="text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {flashId === i ? '✓' : 'Copy'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
