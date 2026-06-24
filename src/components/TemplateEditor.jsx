import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { categories } from '../lib/defaults'
import { extractVariables, interpolate } from '../lib/templateEngine'

export default function TemplateEditor({ template, onClose }) {
  const addTemplate = useStore(s => s.addTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)
  const variables = useStore(s => s.getAllVariables())

  const [title, setTitle] = useState(template?.title || '')
  const [body, setBody] = useState(template?.body || '')
  const [category, setCategory] = useState(template?.category || 'custom')

  const usedVars = extractVariables(body)
  const preview = interpolate(body, variables)
  const isEditing = template?.id != null

  const handleSave = () => {
    if (!title.trim() || !body.trim()) return
    if (isEditing) {
      updateTemplate(template.id, { title: title.trim(), body: body.trim(), category })
    } else {
      addTemplate({ title: title.trim(), body: body.trim(), category, isPinned: false })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-surface-1 border border-border rounded-xl w-[560px] max-h-[80vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">
            {isEditing ? 'Edit template' : 'New template'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-sm">✕</button>
        </div>

        {/* Form */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs text-text-secondary block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text-primary"
              placeholder="e.g. Deploy check"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-text-secondary block mb-1">Category</label>
            <div className="flex gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    category === cat.key
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                  style={category === cat.key ? { backgroundColor: cat.color + '20', color: cat.color } : undefined}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="text-xs text-text-secondary block mb-1">
              Template body
              <span className="text-text-muted ml-2">Use {'{{varName}}'} for variables</span>
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text-primary h-32 resize-y font-mono"
              placeholder={'Let\'s work on {{featureName}}...'}
            />
          </div>

          {/* Variable usage */}
          {usedVars.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Uses:</span>
              {usedVars.map(v => (
                <span key={v} className="text-[10px] bg-accent/10 text-accent rounded px-1.5 py-0.5">
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Preview */}
          {body.trim() && (
            <div>
              <label className="text-xs text-text-secondary block mb-1">Preview</label>
              <div className="bg-surface-0 border border-border rounded-md px-3 py-2 text-xs text-text-secondary whitespace-pre-wrap">
                {preview}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !body.trim()}
            className="px-4 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Save changes' : 'Create template'}
          </button>
        </div>
      </div>
    </div>
  )
}
