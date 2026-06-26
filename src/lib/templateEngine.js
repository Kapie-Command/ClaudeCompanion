export function interpolate(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== '' ? variables[key] : match
  })
}

export function extractVariables(template) {
  const matches = template.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.slice(2, -2)))]
}

export function getUnfilledVariables(templateBody, variables) {
  const allVars = extractVariables(templateBody)
  return allVars.filter(v => !variables[v] || variables[v] === '')
}

export function buildCopyText(templateBody, variables, activeContextBlocks, { autoName = false } = {}) {
  const interpolated = interpolate(templateBody, variables)
  const parts = []

  if (activeContextBlocks.length > 0) {
    parts.push(activeContextBlocks.map(b => b.text).join('\n'))
  }

  if (autoName) {
    const unfilled = getUnfilledVariables(templateBody, variables)
    if (unfilled.length > 0) {
      const varList = unfilled.map(v => `"${v}"`).join(', ')
      parts.push(`Note: The following values are left to your discretion — choose appropriate names/values given the context of this request: ${varList}`)
    }
  }

  parts.push(interpolated)
  return parts.join('\n\n')
}
