import React from 'react'
import { useStore } from '../store/useStore'
import { categories } from '../lib/defaults'
import TemplateCard from './TemplateCard'

export default function TemplateLibrary({ onEdit, onNew }) {
  const templates = useStore(s => s.templates)
  const activeCategory = useStore(s => s.activeCategory)
  const setActiveCategory = useStore(s => s.setActiveCategory)

  const filtered = templates
    .filter(t => activeCategory === 'favorites' ? t.isFavorited : t.category === activeCategory)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Category tabs + New button */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-border shrink-0">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              activeCategory === cat.key
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
            style={activeCategory === cat.key ? { backgroundColor: cat.color + '20', color: cat.color } : undefined}
          >
            {cat.label}
          </button>
        ))}
        <div className="ml-auto">
          <button
            onClick={onNew}
            className="text-xs text-accent hover:text-accent-hover transition-colors px-2 py-1"
          >
            + New template
          </button>
        </div>
      </div>

      {/* Template grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-sm">{activeCategory === 'favorites' ? 'No favorites yet' : 'No templates in this category'}</p>
            <p className="text-xs mt-1">{activeCategory === 'favorites' ? 'Right-click a template and select "Favorite" to add it here' : null}</p>
            {activeCategory !== 'favorites' && (
              <button onClick={onNew} className="text-xs text-accent mt-2 hover:text-accent-hover">
                Create one
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(t => (
              <TemplateCard key={t.id} template={t} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
