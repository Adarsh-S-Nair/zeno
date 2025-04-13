import cleanDescription from './helpers/cleanDescription'

export default function parseBankOfAmerica(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  let endingBalance = null

  // 🔍 Try to extract the ending balance from the summary block
  for (const line of lines) {
    if (line.toLowerCase().startsWith('ending balance')) {
      const match = line.match(/"?(-?\d{1,3}(,\d{3})*(\.\d{2})?)"?$/)
      if (match) {
        endingBalance = parseFloat(match[0].replace(/,/g, '').replace(/"/g, ''))
        console.log('📦 Parsed endingBalance:', endingBalance)
      }
      break
    }
  }

  const dataStartIndex = lines.findIndex(line => line.startsWith('Date,Description'))
  if (dataStartIndex === -1 || dataStartIndex + 1 >= lines.length) return { transactions: [], endingBalance }

  const transactions = []

  for (let i = dataStartIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    if (!parts || parts.length < 3) continue

    const [dateRaw, descRaw, amountRaw, balanceRaw] = parts.map(p =>
      p.replace(/^"|"$/g, '').trim()
    )

    const descLower = descRaw.toLowerCase()

    const isBogusBalanceRow =
      descLower.includes('beginning balance') ||
      descLower.includes('ending balance') ||
      descLower.includes('total credits') ||
      descLower.includes('total debits') ||
      (descRaw === '' && amountRaw && !balanceRaw)

    if (isBogusBalanceRow) continue

    const description = cleanDescription(descRaw || '') || descRaw
    const amount = parseFloat(amountRaw.replace(/,/g, ''))
    const balance = balanceRaw ? parseFloat(balanceRaw.replace(/,/g, '')) : null

    const dateLike = /^\d{2}\/\d{2}\/\d{4}$/
    if (description.match(dateLike)) continue

    transactions.push({ date: dateRaw, description, amount, balance })
  }

  return { transactions, endingBalance }
}
