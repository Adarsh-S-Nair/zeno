import cleanDescription from './helpers/cleanDescription'

export default function parseRobinhood(text) {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const transactions = []
  let endingBalance = null

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

  const dateIndex = headers.indexOf('date')
  const amountIndex = headers.indexOf('amount')
  const balanceIndex = headers.indexOf('balance')
  const descIndex = headers.indexOf('description')
  const merchantIndex = headers.indexOf('merchant')
  const statusIndex = headers.indexOf('status')

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    if (!parts || parts.length < 4) continue

    const status = parts[statusIndex]?.replace(/^"|"$/g, '').trim().toLowerCase()

    if (status !== 'posted') continue

    const dateRaw = parts[dateIndex]?.replace(/^"|"$/g, '').trim()
    const descRaw = parts[descIndex]?.replace(/^"|"$/g, '').trim()
    const merchantRaw = parts[merchantIndex]?.replace(/^"|"$/g, '').trim()
    const amountRaw = parts[amountIndex]?.replace(/^"|"$/g, '').trim()
    const balanceRaw = parts[balanceIndex]?.replace(/^"|"$/g, '').trim()

    const rawDesc = descRaw || merchantRaw || 'Unknown'
    const description = cleanDescription(rawDesc)

    let amount = parseFloat(amountRaw.replace(/,/g, ''))
    if (isNaN(amount)) continue

    if (description.toLowerCase() !== 'payment - thank you') {
      amount = -Math.abs(amount)
    } else {
      amount = Math.abs(amount)
    }

    const balance = balanceRaw ? -parseFloat(balanceRaw.replace(/,/g, '')) : null

    if (!isNaN(balance) && endingBalance === null) {
      endingBalance = balance
    }

    transactions.push({
      date: dateRaw,
      description,
      amount,
      balance,
    })
  }

  return { transactions, endingBalance }
}
