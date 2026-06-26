import { create } from 'zustand'
import { defaultTemplates, defaultChains, defaultContextBlocks } from '../lib/defaults'
import { buildCopyText } from '../lib/templateEngine'

const api = window.electronAPI

async function persist(key, value) {
  await api.store.set(key, value)
}

export const useStore = create((set, get) => ({
  // Variables
  variables: { branchName: '', featureName: '', ticketRef: '' },
  customVariables: {},

  setVariable: (key, value) => {
    const vars = { ...get().variables, [key]: value }
    set({ variables: vars })
    persist('variables', { ...vars, custom: get().customVariables })
  },

  setCustomVariable: (key, value) => {
    const custom = { ...get().customVariables, [key]: value }
    set({ customVariables: custom })
    persist('variables', { ...get().variables, custom })
  },

  addCustomVariable: (key) => {
    if (!key || get().customVariables[key] !== undefined) return
    const custom = { ...get().customVariables, [key]: '' }
    set({ customVariables: custom })
    persist('variables', { ...get().variables, custom })
  },

  removeCustomVariable: (key) => {
    const custom = { ...get().customVariables }
    delete custom[key]
    set({ customVariables: custom })
    persist('variables', { ...get().variables, custom })
  },

  clearAllVariables: () => {
    const vars = { branchName: '', featureName: '', ticketRef: '' }
    const custom = Object.fromEntries(Object.keys(get().customVariables).map(k => [k, '']))
    set({ variables: vars, customVariables: custom })
    persist('variables', { ...vars, custom })
  },

  getAllVariables: () => ({ ...get().variables, ...get().customVariables }),

  // Templates
  templates: defaultTemplates,
  activeCategory: 'session',

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  addTemplate: (template) => {
    const t = { ...template, id: `custom-${Date.now()}`, isBuiltIn: false }
    const templates = [...get().templates, t]
    set({ templates })
    persist('templates', templates)
  },

  updateTemplate: (id, updates) => {
    const templates = get().templates.map(t => t.id === id ? { ...t, ...updates } : t)
    set({ templates })
    persist('templates', templates)
  },

  deleteTemplate: (id) => {
    const templates = get().templates.filter(t => t.id !== id)
    set({ templates })
    persist('templates', templates)
  },

  togglePin: (id) => {
    const templates = get().templates.map(t =>
      t.id === id ? { ...t, isPinned: !t.isPinned } : t
    )
    set({ templates })
    persist('templates', templates)
  },

  // Context blocks
  contextBlocks: defaultContextBlocks,

  toggleContextBlock: (id) => {
    const blocks = get().contextBlocks.map(b =>
      b.id === id ? { ...b, active: !b.active } : b
    )
    set({ contextBlocks: blocks })
    persist('contextBlocks', blocks)
  },

  addContextBlock: (block) => {
    const b = { ...block, id: `ctx-${Date.now()}`, active: false }
    const blocks = [...get().contextBlocks, b]
    set({ contextBlocks: blocks })
    persist('contextBlocks', blocks)
  },

  updateContextBlock: (id, updates) => {
    const blocks = get().contextBlocks.map(b => b.id === id ? { ...b, ...updates } : b)
    set({ contextBlocks: blocks })
    persist('contextBlocks', blocks)
  },

  deleteContextBlock: (id) => {
    const blocks = get().contextBlocks.filter(b => b.id !== id)
    set({ contextBlocks: blocks })
    persist('contextBlocks', blocks)
  },

  getActiveContextBlocks: () => get().contextBlocks.filter(b => b.active),

  // Chains
  chains: defaultChains,
  activeChainId: null,
  chainStepIndex: 0,

  startChain: (chainId) => set({ activeChainId: chainId, chainStepIndex: 0 }),
  advanceChain: () => {
    const { chains, activeChainId, chainStepIndex } = get()
    const chain = chains.find(c => c.id === activeChainId)
    if (chain && chainStepIndex < chain.steps.length - 1) {
      set({ chainStepIndex: chainStepIndex + 1 })
    } else {
      set({ activeChainId: null, chainStepIndex: 0 })
    }
  },
  resetChain: () => set({ activeChainId: null, chainStepIndex: 0 }),

  // Clipboard history
  clipboardHistory: [],

  addToClipboardHistory: (text) => {
    const history = [
      { text, timestamp: Date.now() },
      ...get().clipboardHistory
    ].slice(0, 20)
    set({ clipboardHistory: history })
    persist('clipboardHistory', history)
  },

  clearClipboardHistory: () => {
    set({ clipboardHistory: [] })
    persist('clipboardHistory', [])
  },

  // Copy action (combines template + context blocks + variables + history)
  copyTemplate: async (templateBody, { autoName = false } = {}) => {
    const vars = get().getAllVariables()
    const activeBlocks = get().getActiveContextBlocks()
    const text = buildCopyText(templateBody, vars, activeBlocks, { autoName })
    await api.clipboard.write(text)
    get().addToClipboardHistory(text)
    return text
  },

  // Hydrate from disk on startup
  hydrate: async () => {
    const data = await api.store.getAll()
    const updates = {}

    if (data.variables) {
      const { custom, ...builtIn } = data.variables
      updates.variables = { branchName: '', featureName: '', ticketRef: '', ...builtIn }
      if (custom) updates.customVariables = custom
    }
    if (data.templates) updates.templates = data.templates
    if (data.contextBlocks) updates.contextBlocks = data.contextBlocks
    if (data.chains) updates.chains = data.chains
    if (data.clipboardHistory) updates.clipboardHistory = data.clipboardHistory

    if (Object.keys(updates).length > 0) set(updates)
  },
}))
