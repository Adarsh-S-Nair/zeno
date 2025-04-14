import { useEffect, useRef, useState } from 'react'
import { supabase } from '@zeno/core'
import TableFilters from '../components/TableFilters'
import Table from '../components/Table'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const [filterHeight, setFilterHeight] = useState(0)
  const filterRef = useRef(null)

  useEffect(() => {
    if (!filterRef.current) return;
  
    const observer = new ResizeObserver(() => {
      if (filterRef.current) {
        setFilterHeight(filterRef.current.offsetHeight);
      }
    });
  
    observer.observe(filterRef.current);
  
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Not logged in')
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        description,
        amount,
        balance,
        category,
        account_id,
        accounts (name)
      `)
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      const formatted = data.map(tx => ({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        balance: tx.balance,
        account: tx.accounts?.name || 'Unknown',
        type: tx.amount >= 0 ? 'credit' : 'debit',
        category: tx.category || 'Uncategorized',
      }))
      setTransactions(formatted)
    }

    setLoading(false)
  }

  const totalPages = Math.ceil(transactions.length / pageSize)
  const paginatedRows = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const columns = [
    { label: 'Date', key: 'date' },
    { label: 'Account', key: 'account' },
    { label: 'Description', key: 'description' },
    { label: 'Amount', key: 'amount', align: 'right' },
    { label: 'Type', key: 'type', align: 'center' },
    { label: 'Balance', key: 'balance', align: 'right' },
    { label: 'Category', key: 'category', align: 'center' },
  ]

  return (
    <>
      <div className="flex justify-between items-center mb-[32px]">
        <h1 className="text-[24px] font-bold leading-tight">Transactions</h1>
      </div>

      <div ref={filterRef}>
        <TableFilters
          filters={[
            { type: 'dateRange', label: 'Date Range' },
            { type: 'dropdown', label: 'Account', options: ['All'] }, // You can dynamically fetch account names later
            { type: 'amountRange', label: 'Amount Range' },
            { type: 'search', placeholder: 'Search transactions' },
          ]}
        />
      </div>

      <div className="overflow-y-auto" style={{ height: `calc(100vh - ${filterHeight + 200}px)` }}>
        <Table
          columns={columns}
          rows={paginatedRows}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </>
  )
}
