export function interpolate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== '' ? variables[key] : match
  })
}

export function extractVariables(template) {
  const matches = template.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.slice(2, -2)))]
}

export function buildCopyText(templateBody, variables, activeContextBlocks) {
  const interpolated = interpolate(templateBody, variables)
  if (activeContextBlocks.length === 0) return interpolated

  const contextPrefix = activeContextBlocks.map(b => b.text).join('\n')
  return contextPrefix + '\n\n' + interpolated
}
