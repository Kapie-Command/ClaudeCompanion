import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function ContextBlocks() {
  const contextBlocks = useStore(s => s.contextBlocks)
  const toggleContextBlock = useStore(s => s.toggleContextBlock)
  const addContextBlock = useStore(s => s.addContextBlock)
  const deleteContextBlock = useStore(s => s.deleteContextBlock)
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newText, setNewText] = useState('')

  const handleAdd = () => {
    if (!newLabel.trim() || !newText.trim()) return
    addContextBlock({ label: newLabel.trim(), text: newText.trim() })
    setNewLabel('')
    setNewText('')
    setAdding(false)
  }

  const activeCount = contextBlocks.filter(b => b.active).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Context Blocks</h3>
          {activeCount > 0 && (
            <span className="text-[10px] bg-accent/20 text-accent rounded-full px-1.5 py-0.5">
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {contextBlocks.map(block => (
          <div
            key={block.id}
            className={`group rounded-md border transition-colors cursor-pointer ${
              block.active
                ? 'border-accent/40 bg-accent/5'
                : 'border-border bg-surface-2 hover:border-border-hover'
            }`}
          >
            <div
              className="flex items-start gap-2 px-2.5 py-2"
              onClick={() => toggleContextBlock(block.id)}
            >
              <div className={`w-3.5 h-3.5 rounded border mt-0.5 shrink-0 flex items-center justify-center text-[9px] ${
                block.active
                  ? 'bg-accent border-accent text-white'
                  : 'border-border'
              }`}>
                {block.active && '✓'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-text-primary truncate">{block.label}</p>
                <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{block.text}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteContextBlock(block.id) }}
                className="text-text-muted hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {/* Add new block */}
        {adding ? (
          <div className="border border-border rounded-md p-2.5 bg-surface-2 space-y-2">
            <input
              type="text"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="w-full bg-surface-0 border border-border rounded px-2 py-1 text-xs text-text-primary"
              placeholder="Label"
              autoFocus
            />
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              className="w-full bg-surface-0 border border-border rounded px-2 py-1 text-xs text-text-primary h-16 resize-none"
              placeholder="Context text to prepend..."
            />
            <div className="flex gap-1.5">
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim() || !newText.trim()}
                className="text-[10px] bg-accent hover:bg-accent-hover text-white rounded px-2 py-1 disabled:opacity-40"
              >
                Add
              </button>
              <button
                onClick={() => { setAdding(false); setNewLabel(''); setNewText('') }}
                className="text-[10px] text-text-muted hover:text-text-primary px-2 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-xs text-accent hover:text-accent-hover py-2 transition-colors"
          >
            + Add block
          </button>
        )}
      </div>

      {activeCount > 0 && (
        <div className="px-3 py-2 border-t border-border">
          <p className="text-[10px] text-text-muted">
            Active blocks will be prepended to every copied template.
          </p>
        </div>
      )}
    </div>
  )
}
