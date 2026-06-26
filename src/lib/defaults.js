let _id = 0
const id = () => `builtin-${++_id}`

export const defaultTemplates = [
  // Session
  { id: id(), category: 'session', title: 'New branch', body: 'Let\'s make a new branch "{{branchName}}" and set it as our workspace for now.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'session', title: 'Resume work', body: 'Resuming work on branch {{branchName}}. We\'re building {{featureName}}.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'session', title: 'Context primer', body: 'Here\'s the context for this session: {{context}}', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'session', title: 'Handoff summary', body: 'Summarize the current state of work on {{branchName}} so a fresh session can pick it up seamlessly. Include: what\'s done, what\'s in progress, any blockers, and the next step.', isBuiltIn: true, isPinned: false },

  // Workflow
  { id: id(), category: 'workflow', title: 'Commit', body: 'Let\'s commit what we have so far.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'workflow', title: 'Create PR', body: 'Let\'s create a PR for this branch targeting main. Feature: {{featureName}}', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'workflow', title: 'Review diff', body: 'Review the current diff for correctness bugs and cleanup opportunities.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'workflow', title: 'Run tests', body: 'Run the test suite and fix any failures before we continue.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'workflow', title: 'Build check', body: 'Run the build and make sure there are no errors or warnings.', isBuiltIn: true, isPinned: false },

  // Guardrails
  { id: id(), category: 'guardrails', title: 'Scope lock', body: 'Stay within the scope of {{featureName}}. Don\'t refactor unrelated code.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'guardrails', title: 'File protection', body: 'Don\'t modify these files: {{protectedFiles}}', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'guardrails', title: 'Pre-done checklist', body: 'Before declaring this done, verify:\n1. Tests pass\n2. Build succeeds\n3. No unintended changes in the diff\n4. {{customCheck}}', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'guardrails', title: 'No overengineering', body: 'Keep the implementation minimal. No abstractions we don\'t need yet, no speculative features, no unnecessary error handling.', isBuiltIn: true, isPinned: false },

  // Analysis
  { id: id(), category: 'analysis', title: 'Explain', body: 'Explain how {{target}} works — architecture, data flow, key decisions.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'analysis', title: 'Find bugs', body: 'Look for bugs or edge cases in the code we just wrote.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'analysis', title: 'Suggest improvements', body: 'What improvements would you suggest for {{target}}? Focus on readability, performance, and maintainability.', isBuiltIn: true, isPinned: false },
  { id: id(), category: 'analysis', title: 'Security check', body: 'Review {{target}} for security issues — injection, auth bypass, data leaks, OWASP top 10.', isBuiltIn: true, isPinned: false },
]

export const defaultChains = [
  {
    id: 'chain-feature',
    title: 'Feature flow',
    isBuiltIn: true,
    steps: [
      { label: 'Create branch', templateId: 'builtin-1' },
      { label: 'Set scope', templateId: 'builtin-10' },
      { label: 'Build check', templateId: 'builtin-9' },
      { label: 'Commit', templateId: 'builtin-5' },
      { label: 'Create PR', templateId: 'builtin-6' },
    ]
  },
  {
    id: 'chain-bugfix',
    title: 'Bug fix flow',
    isBuiltIn: true,
    steps: [
      { label: 'Create branch', templateId: 'builtin-1' },
      { label: 'Find bugs', templateId: 'builtin-16' },
      { label: 'Run tests', templateId: 'builtin-8' },
      { label: 'Commit', templateId: 'builtin-5' },
      { label: 'Create PR', templateId: 'builtin-6' },
    ]
  },
  {
    id: 'chain-review',
    title: 'Review flow',
    isBuiltIn: true,
    steps: [
      { label: 'Review diff', templateId: 'builtin-7' },
      { label: 'Run tests', templateId: 'builtin-8' },
      { label: 'Commit fixes', templateId: 'builtin-5' },
    ]
  },
]

export const defaultContextBlocks = [
  { id: 'ctx-1', label: 'Minimal implementation', text: 'Keep the implementation minimal — no abstractions we don\'t need yet.', active: false },
  { id: 'ctx-2', label: 'Always test', text: 'Run tests after every change.', active: false },
]

export const categories = [
  { key: 'session', label: 'Session', color: '#7c6bf5' },
  { key: 'workflow', label: 'Workflow', color: '#4ade80' },
  { key: 'guardrails', label: 'Guardrails', color: '#fbbf24' },
  { key: 'analysis', label: 'Analysis', color: '#38bdf8' },
  { key: 'custom', label: 'Custom', color: '#f472b6' },
]
