import React from 'react'

export default function TitleBar() {
  const api = window.electronAPI

  return (
    <div className="drag-region flex items-center justify-between h-9 bg-surface-1 border-b border-border px-3 shrink-0">
      <span className="text-xs font-semibold text-text-secondary tracking-wide">
        ClaudeCompanion
      </span>
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={() => api.window.toggleDevTools()}
          className="w-7 h-6 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 rounded transition-colors text-xs"
          title="Toggle DevTools"
        >
          ⚙
        </button>
        <button
          onClick={() => api.window.minimize()}
          className="w-7 h-6 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 rounded transition-colors text-xs"
        >
          ─
        </button>
        <button
          onClick={() => api.window.maximize()}
          className="w-7 h-6 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 rounded transition-colors text-xs"
        >
          □
        </button>
        <button
          onClick={() => api.window.close()}
          className="w-7 h-6 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
