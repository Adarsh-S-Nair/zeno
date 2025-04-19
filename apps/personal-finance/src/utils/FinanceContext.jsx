import { createContext, useState, useEffect } from 'react'
import { supabase } from '@zeno/core'

export const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshAccounts = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
    if (!error) setAccounts(data || [])
  }

  const refreshTransactions = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id, date, description, amount, balance, category, category_override,
        account_id, accounts (name, type)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!error) {
      const formatted = data.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        accountId: tx.account_id,
        accountName: tx.accounts?.name || 'Unknown',
        accountType: tx.accounts?.type || 'unknown',
        category: tx.category || 'Uncategorized',
        category_override: tx.category_override || null,
      }))
      setTransactions(formatted)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return console.error('Auth error:', authError)
      setUser(user)

      const [{ data: accData }, { data: txData }] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id),
        supabase
          .from('transactions')
          .select(`
            id, date, description, amount, balance, category, category_override,
            account_id, accounts (name, type)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
      ])

      setAccounts(accData || [])

      const formatted = (txData || []).map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        accountId: tx.account_id,
        accountName: tx.accounts?.name || 'Unknown',
        accountType: tx.accounts?.type || 'unknown',
        category: tx.category || 'Uncategorized',
        category_override: tx.category_override || null,
      }))

      setTransactions(formatted)
      setLoading(false)
    }

    init()
  }, [])

  const accountTypeMap = accounts.reduce((map, acc) => {
    map[acc.id] = acc.type
    return map
  }, {})

  const netWorth = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)

  const currentDate = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const last30DaysTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date)
    return txDate >= thirtyDaysAgo && txDate <= currentDate
  })

  const getEffectiveCategory = (tx) =>
    tx.category_override || tx.category || 'Uncategorized'

  const income = last30DaysTransactions
    .filter((tx) => {
      const type = accountTypeMap[tx.accountId] || tx.accountType
      const category = getEffectiveCategory(tx)
      return (
        tx.amount > 0 &&
        category !== 'Transfers' &&
        !(category === 'Debt Payment' && type === 'credit_card')
      )
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  const spending = last30DaysTransactions
    .filter((tx) => {
      const type = accountTypeMap[tx.accountId] || tx.accountType
      const category = getEffectiveCategory(tx)
      return (
        tx.amount < 0 &&
        category !== 'Transfers' &&
        !(category === 'Debt Payment' && type !== 'credit_card')
      )
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  const monthlyTotalsMap = new Map()

  transactions.forEach((tx) => {
    const date = new Date(tx.date)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    const type = accountTypeMap[tx.accountId] || tx.accountType
    const category = getEffectiveCategory(tx)

    if (category === 'Transfers') return

    if (!monthlyTotalsMap.has(monthKey)) {
      monthlyTotalsMap.set(monthKey, {
        income: 0,
        spending: 0,
        rawDate: new Date(date.getFullYear(), date.getMonth(), 1),
      })
    }

    const entry = monthlyTotalsMap.get(monthKey)

    if (tx.amount > 0 && !(category === 'Debt Payment' && type === 'credit_card')) {
      entry.income += tx.amount
    }

    if (tx.amount < 0 && !(category === 'Debt Payment' && type !== 'credit_card')) {
      entry.spending += Math.abs(tx.amount)
    }
  })

  const incomeVsSpendingByMonth = Array.from(monthlyTotalsMap.entries())
    .sort((a, b) => a[1].rawDate - b[1].rawDate)
    .map(([_, { income, spending, rawDate }]) => {
      const label = `${rawDate.toLocaleString('default', {
        month: 'short',
      })} ${rawDate.getFullYear()}`
      return { month: label, income, spending }
    })

  const spendingByCategoryMap = new Map()

  last30DaysTransactions.forEach((tx) => {
    const type = accountTypeMap[tx.accountId] || tx.accountType
    const category = getEffectiveCategory(tx)

    if (
      tx.amount < 0 &&
      category !== 'Transfers' &&
      !(category === 'Debt Payment' && type !== 'credit_card')
    ) {
      const name = category
      const prev = spendingByCategoryMap.get(name) || 0
      spendingByCategoryMap.set(name, prev + Math.abs(tx.amount))
    }
  })

  const spendingByCategory = Array.from(spendingByCategoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // 🆕 Estimate upcoming bills
  const upcomingBills = []
  const billCandidates = {}

  transactions.forEach((tx) => {
    const category = getEffectiveCategory(tx)
    if (
      tx.amount < 0 &&
      ['Utilities', 'Mortgage', 'Health/Fitness', 'Subscriptions'].includes(category)
    ) {
      const desc = tx.description.trim()
      if (!billCandidates[desc]) billCandidates[desc] = []
      billCandidates[desc].push(new Date(tx.date))
    }
  })

  for (const [description, dates] of Object.entries(billCandidates)) {
    if (dates.length < 2) continue

    const sorted = dates.sort((a, b) => a - b)
    let totalInterval = 0
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24)
      totalInterval += diff
    }
    const avgInterval = totalInterval / (sorted.length - 1)

    const lastDate = sorted[sorted.length - 1]
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + Math.round(avgInterval))

    const today = new Date()
    const maxFuture = new Date(today)
    maxFuture.setDate(maxFuture.getDate() + 60)

    if (nextDate > today && nextDate < maxFuture) {
      upcomingBills.push({
        description: description,
        date: nextDate.toISOString().split('T')[0],
      })
    }
  }

  const sortedUpcomingBills = upcomingBills.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  return (
    <FinanceContext.Provider value={{
      user,
      accounts,
      transactions,
      loading,
      refreshAccounts,
      refreshTransactions,
      netWorth,
      income,
      spending,
      incomeVsSpendingByMonth,
      spendingByCategory,
      upcomingBills: sortedUpcomingBills,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}
