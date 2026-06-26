import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { interpolate } from '../lib/templateEngine'

export default function QuickAccess({ visible, onClose }) {
  const templates = useStore(s => s.templates)
  const favorites = templates.filter(t => t.isFavorited).slice(0, 6)
  const copyTemplate = useStore(s => s.copyTemplate)
  const builtInVars = useStore(s => s.variables)
  const customVars = useStore(s => s.customVariables)
  const variables = { ...builtInVars, ...customVars }
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    if (!visible) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onClose])

  if (!visible) return null

  const handleCopy = async (template) => {
    await copyTemplate(template.body)
    setCopiedId(template.id)
    setTimeout(() => {
      setCopiedId(null)
      onClose()
    }, 400)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-w-[90vw]">
        <div className="bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-xs font-medium text-text-secondary">Quick Access — Favorites</span>
            <span className="text-[10px] text-text-muted">Esc to close</span>
          </div>

          {favorites.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-muted">No favorites yet</p>
              <p className="text-xs text-text-muted mt-1">Right-click a template and select "Favorite" to add it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-3">
              {favorites.map(t => {
                const preview = interpolate(t.body, variables)
                const isCopied = copiedId === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleCopy(t)}
                    className={`text-left rounded-lg p-2.5 border transition-all ${
                      isCopied
                        ? 'bg-accent/15 border-accent/40'
                        : 'bg-surface-2 border-border hover:border-border-hover hover:bg-surface-3'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-accent text-[10px]">♥</span>
                      <span className="text-xs font-medium text-text-primary truncate">
                        {isCopied ? '✓ Copied' : t.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-snug line-clamp-2">
                      {preview}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
