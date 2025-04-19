import { useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@zeno/core'
import { FinanceContext } from '../utils/FinanceContext'
import TableFilters from '../components/TableFilters'
import FilterDrawer from '../components/FilterDrawer.jsx'
import Table from '../components/Table'
import { IoFilter } from 'react-icons/io5'
import rules from '../utils/categorizer/rules.json'
import { useSearchParams } from 'react-router-dom'

export default function Transactions() {
  const { transactions, accounts, loading, refreshTransactions } = useContext(FinanceContext)
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || ''
  const initialStartDate = searchParams.get('startDate') || ''
  const initialEndDate = searchParams.get('endDate') || ''

  const [layout, setLayout] = useState('desktop')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [filterHeight, setFilterHeight] = useState(0)
  const filterRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [isExtraSmall, setIsExtraSmall] = useState(false)
  const [filters, setFilters] = useState({
    category: initialCategory,
    startDate: initialStartDate,
    endDate: initialEndDate,
  })

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 640) setLayout('mobile')
      else if (w < 1024) setLayout('tablet')
      else setLayout('desktop')

      setIsExtraSmall(w <= 480)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!filterRef.current || layout !== 'desktop') return
    const observer = new ResizeObserver(() => {
      setFilterHeight(filterRef.current.offsetHeight)
    })
    observer.observe(filterRef.current)
    setFilterHeight(filterRef.current.offsetHeight)
    return () => observer.disconnect()
  }, [layout])

  useEffect(() => {
    if (layout === 'desktop') {
      setShowFilterDrawer(false)
    }
  }, [layout])

  async function reapplyCategoriesAndRefresh() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Not logged in')
      return
    }

    const { data: txs, error } = await supabase
      .from('transactions')
      .select('id, description, category, category_override')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching transactions for recategorization:', error)
      return
    }

    const { default: categorizeWithRules } = await import('../utils/categorizer/ruleCategorizer.js')

    const updates = txs
      .filter(tx => !tx.category_override)
      .map(tx => {
        const newCategory = categorizeWithRules(tx.description)
        return newCategory !== tx.category ? { id: tx.id, category: newCategory } : null
      })
      .filter(Boolean)

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('transactions')
        .upsert(updates, { onConflict: 'id' })

      if (updateError) {
        console.error('Error updating categories:', updateError)
        return
      }

      console.log(`✅ Updated ${updates.length} transaction categories`)
    } else {
      console.log('✅ All categories are up to date')
    }

    await refreshTransactions()
  }

  const toDateOnly = (input) => {
    return new Date(input).toISOString().split('T')[0]
  }

  const filtered = transactions?.filter(tx => {
    const search = filters.search?.toLowerCase()
    const account = filters.account
    const category = filters.category
    const startDate = filters.startDate
    const endDate = filters.endDate

    const txDateOnly = toDateOnly(tx.date)
    const str = `${tx.description} ${tx.category_override || tx.category || ''}`.toLowerCase()

    return (
      (!search || str.includes(search)) &&
      (!account || tx.account === account) &&
      (!category || (tx.category_override || tx.category) === category) &&
      (!startDate || txDateOnly >= startDate) &&
      (!endDate || txDateOnly <= endDate)
    )
  }) || []

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const columns = [
    { label: 'Date', key: 'date' },
    layout === 'desktop' && { label: 'Account', key: 'accountName' },
    { label: 'Description', key: 'description' },
    { label: 'Amount', key: 'amount', align: 'center' },
    !isExtraSmall && { label: 'Category', key: 'category', align: 'center' },
  ].filter(Boolean)

  const sharedFilters = [
    { type: 'search', placeholder: 'Search transactions' },
    { type: 'dateRange', label: 'Date Range' },
    { type: 'dropdown', label: 'Account', options: accounts?.map(a => a.name) || [] },
    { type: 'amountRange', label: 'Amount Range' },
    { type: 'categoryDropdown', label: 'Category', options: Object.keys(rules) },
  ]

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold leading-tight">Transactions</h1>

        {layout !== 'desktop' && (
          <div
            onClick={() => setShowFilterDrawer(true)}
            className="cursor-pointer p-[6px] rounded-[6px] hover:bg-[var(--color-hover-muted)] transition"
          >
            <IoFilter size={20} className="text-[var(--color-text)]" />
          </div>
        )}
      </div>

      {layout === 'desktop' && (
        <div ref={filterRef}>
          <TableFilters filters={sharedFilters} values={filters} onChange={setFilters} />
        </div>
      )}

      <div className="overflow-y-auto" style={{ height: `calc(100vh - ${layout === 'desktop' ? filterHeight + 150 : 140}px)` }}>
        <Table
          columns={columns}
          rows={paginatedRows}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onRefresh={reapplyCategoriesAndRefresh}
        />
      </div>

      <FilterDrawer
        open={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        isMobile={layout !== 'desktop'}
        filters={sharedFilters}
        values={filters}
        onChange={setFilters}
      />
    </>
  )
}
