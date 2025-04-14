import rules from './rules.json'

export default function categorizeWithRules(description) {
  if (!description || typeof description !== 'string') return 'Uncategorized'

  const lower = description.toLowerCase()

  for (const [category, rule] of Object.entries(rules)) {
    const keywords = rule.keywords || []
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category
      }
    }
  }

  return 'Uncategorized'
}
