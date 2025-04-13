export default async function generateTransactionHash(transaction) {
  const { date, description, amount, balance, account_id } = transaction

  const raw = `${date}|${description}|${amount}|${balance ?? ''}|${account_id}`

  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
