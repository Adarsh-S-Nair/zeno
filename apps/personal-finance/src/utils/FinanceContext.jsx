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
        account_id, accounts (name)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!error) {
      const formatted = data.map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        account: tx.accounts?.name || 'Unknown',
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
            account_id, accounts (name)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })
      ])

      setAccounts(accData || [])
      setTransactions((txData || []).map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        account: tx.accounts?.name || 'Unknown',
        category: tx.category || 'Uncategorized',
        category_override: tx.category_override || null,
      })))
      setLoading(false)
    }
    init()
  }, [])

  return (
    <FinanceContext.Provider value={{
      user,
      accounts,
      transactions,
      loading,
      refreshAccounts,
      refreshTransactions
    }}>
      {children}
    </FinanceContext.Provider>
  )
}
