import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function VariableBar() {
  const variables = useStore(s => s.variables)
  const customVariables = useStore(s => s.customVariables)
  const setVariable = useStore(s => s.setVariable)
  const setCustomVariable = useStore(s => s.setCustomVariable)
  const addCustomVariable = useStore(s => s.addCustomVariable)
  const removeCustomVariable = useStore(s => s.removeCustomVariable)
  const clearAllVariables = useStore(s => s.clearAllVariables)
  const [newVarName, setNewVarName] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)

  const handleAddVar = () => {
    const name = newVarName.trim().replace(/\s+/g, '')
    if (name) {
      addCustomVariable(name)
      setNewVarName('')
      setShowAddInput(false)
    }
  }

  return (
    <div className="bg-surface-1 border-b border-border px-4 py-2 shrink-0">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold shrink-0">
          Variables
        </span>

        {/* Built-in variables */}
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <label className="text-xs text-text-secondary whitespace-nowrap">{key}:</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setVariable(key, e.target.value)}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-primary w-36 focus:border-accent"
              placeholder={`{{${key}}}`}
            />
          </div>
        ))}

        {/* Custom variables */}
        {Object.entries(customVariables).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1.5">
            <label className="text-xs text-text-secondary whitespace-nowrap">{key}:</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setCustomVariable(key, e.target.value)}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-primary w-36 focus:border-accent"
              placeholder={`{{${key}}}`}
            />
            <button
              onClick={() => removeCustomVariable(key)}
              className="text-text-muted hover:text-red-400 text-xs transition-colors"
              title="Remove variable"
            >
              x
            </button>
          </div>
        ))}

        {/* Add variable */}
        {showAddInput ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddVar()}
              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs text-text-primary w-24 focus:border-accent"
              placeholder="varName"
              autoFocus
            />
            <button onClick={handleAddVar} className="text-success text-xs hover:opacity-80">+</button>
            <button onClick={() => { setShowAddInput(false); setNewVarName('') }} className="text-text-muted text-xs hover:opacity-80">x</button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddInput(true)}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            + Add
          </button>
        )}

        <div className="ml-auto">
          <button
            onClick={clearAllVariables}
            className="text-[10px] text-text-muted hover:text-warning transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
