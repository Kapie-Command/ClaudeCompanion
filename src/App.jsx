import React, { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import TitleBar from './components/TitleBar'
import VariableBar from './components/VariableBar'
import TemplateLibrary from './components/TemplateLibrary'
import ContextBlocks from './components/ContextBlocks'
import ChainRunner from './components/ChainRunner'
import ClipboardHistory from './components/ClipboardHistory'
import TemplateEditor from './components/TemplateEditor'
import QuickAccess from './components/QuickAccess'

export default function App() {
  const hydrate = useStore(s => s.hydrate)
  const activeChainId = useStore(s => s.activeChainId)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quickAccessOpen, setQuickAccessOpen] = useState(false)

  useEffect(() => { hydrate() }, [hydrate])

  useEffect(() => {
    const api = window.electronAPI
    if (!api?.quickAccess?.onToggle) return
    return api.quickAccess.onToggle(() => setQuickAccessOpen(v => !v))
  }, [])

  const addToClipboardHistory = useStore(s => s.addToClipboardHistory)
  useEffect(() => {
    const api = window.electronAPI
    if (!api?.clipboard?.onPopupCopy) return
    return api.clipboard.onPopupCopy((text) => addToClipboardHistory(text))
  }, [addToClipboardHistory])

  const openEditor = (template = null) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0">
      <TitleBar />
      <VariableBar />

      <div className="flex flex-1 min-h-0">
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChainId ? (
            <ChainRunner />
          ) : (
            <TemplateLibrary onEdit={openEditor} onNew={() => openEditor(null)} />
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 border-l border-border flex flex-col">
            <ContextBlocks />
          </div>
        )}

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface-2 border border-border rounded-l-md px-1 py-3 text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors z-10"
          style={sidebarOpen ? { right: '18rem' } : { right: 0 }}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '▶' : '◀'}
        </button>
      </div>

      {/* Clipboard history drawer */}
      <ClipboardHistory />

      {/* Quick access overlay */}
      <QuickAccess visible={quickAccessOpen} onClose={() => setQuickAccessOpen(false)} />

      {/* Template editor modal */}
      {editorOpen && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
