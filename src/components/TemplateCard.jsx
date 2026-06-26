import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { interpolate } from '../lib/templateEngine'

export default function TemplateCard({ template, onEdit }) {
  const builtInVars = useStore(s => s.variables)
  const customVars = useStore(s => s.customVariables)
  const variables = { ...builtInVars, ...customVars }
  const copyTemplate = useStore(s => s.copyTemplate)
  const togglePin = useStore(s => s.togglePin)
  const deleteTemplate = useStore(s => s.deleteTemplate)
  const [flash, setFlash] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const preview = interpolate(template.body, variables)
  const hasUnfilled = preview.includes('{{')

  const handleCopy = async () => {
    await copyTemplate(template.body)
    setFlash(true)
    setTimeout(() => setFlash(false), 400)
  }

  return (
    <div
      className={`relative bg-surface-2 border border-border rounded-lg p-3 hover:border-border-hover transition-all group ${flash ? 'copy-flash' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-medium text-text-primary truncate">{template.title}</h3>
          {template.isPinned && <span className="text-warning text-xs shrink-0">★</span>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent-hover rounded px-2.5 py-1 text-xs font-medium transition-colors"
            title="Copy to clipboard"
          >
            {flash ? '✓' : 'Copy'}
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-text-muted hover:text-text-secondary px-1 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-xs"
            >
              ⋮
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-surface-3 border border-border rounded-md shadow-lg py-1 z-20 w-32">
                  <button
                    onClick={() => { togglePin(template.id); setShowMenu(false) }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  >
                    {template.isPinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    onClick={() => { onEdit(template); setShowMenu(false) }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  >
                    Edit
                  </button>
                  {!template.isBuiltIn && (
                    <button
                      onClick={() => { deleteTemplate(template.id); setShowMenu(false) }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-surface-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
        {preview}
      </p>
      {hasUnfilled && (
        <p className="text-[10px] text-warning/60 mt-1">Has unfilled variables</p>
      )}
    </div>
  )
}
