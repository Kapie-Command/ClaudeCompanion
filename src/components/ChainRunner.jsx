import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { interpolate } from '../lib/templateEngine'

export default function ChainRunner() {
  const chains = useStore(s => s.chains)
  const activeChainId = useStore(s => s.activeChainId)
  const chainStepIndex = useStore(s => s.chainStepIndex)
  const templates = useStore(s => s.templates)
  const builtInVars = useStore(s => s.variables)
  const customVars = useStore(s => s.customVariables)
  const variables = { ...builtInVars, ...customVars }
  const copyTemplate = useStore(s => s.copyTemplate)
  const advanceChain = useStore(s => s.advanceChain)
  const resetChain = useStore(s => s.resetChain)
  const startChain = useStore(s => s.startChain)
  const [flash, setFlash] = useState(false)

  // If no chain is active, show chain selection
  if (!activeChainId) {
    return (
      <div className="flex-1 p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Prompt Chains</h2>
        <div className="space-y-2">
          {chains.map(chain => (
            <button
              key={chain.id}
              onClick={() => startChain(chain.id)}
              className="w-full text-left bg-surface-2 border border-border rounded-lg p-3 hover:border-border-hover transition-colors group"
            >
              <h3 className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                {chain.title}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                {chain.steps.length} steps: {chain.steps.map(s => s.label).join(' → ')}
              </p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const chain = chains.find(c => c.id === activeChainId)
  if (!chain) return null

  const currentStep = chain.steps[chainStepIndex]
  const template = templates.find(t => t.id === currentStep.templateId)
  const preview = template ? interpolate(template.body, variables) : ''
  const isLastStep = chainStepIndex === chain.steps.length - 1

  const handleCopyAndAdvance = async () => {
    if (template) {
      await copyTemplate(template.body)
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
      setTimeout(() => advanceChain(), 600)
    }
  }

  return (
    <div className="flex-1 p-4 flex flex-col">
      {/* Chain header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{chain.title}</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Step {chainStepIndex + 1} of {chain.steps.length}
          </p>
        </div>
        <button
          onClick={resetChain}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Exit chain
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-6">
        {chain.steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs ${
              i === chainStepIndex
                ? 'bg-accent/20 text-accent font-medium'
                : i < chainStepIndex
                  ? 'bg-success/10 text-success'
                  : 'bg-surface-2 text-text-muted'
            }`}>
              {i < chainStepIndex && <span>✓</span>}
              {step.label}
            </div>
            {i < chain.steps.length - 1 && (
              <span className="text-text-muted text-xs">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current step content */}
      <div className={`bg-surface-2 border border-border rounded-lg p-4 flex-1 ${flash ? 'copy-flash' : ''}`}>
        <h3 className="text-sm font-medium text-text-primary mb-2">{currentStep.label}</h3>
        {template ? (
          <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
            {preview}
          </p>
        ) : (
          <p className="text-xs text-text-muted italic">Template not found</p>
        )}
      </div>

      {/* Action button */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={handleCopyAndAdvance}
          className="bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          {flash ? '✓ Copied!' : isLastStep ? 'Copy & Finish' : 'Copy & Next →'}
        </button>
      </div>
    </div>
  )
}
