import rules from './rules.json'

export default function categorizeWithRules(description) {
  if (!description || typeof description !== 'string') return 'Uncategorized'

  const lower = description.toLowerCase()

  for (const [category, keywords] of Object.entries(rules)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return capitalize(category)
      }
    }
  }

  return 'Uncategorized'
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
