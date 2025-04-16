import { useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@zeno/core'
import { FinanceContext } from '../utils/FinanceContext'
import TableFilters from '../components/TableFilters'
import FilterDrawer from '../components/FilterDrawer.jsx'
import Table from '../components/Table'
import { IoFilter } from "react-icons/io5"

export default function Transactions({ isMobile, setIsMobile }) {
  const { transactions, loading, refreshTransactions } = useContext(FinanceContext)

  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [filterHeight, setFilterHeight] = useState(0)
  const filterRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const [isExtraSmall, setIsExtraSmall] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsExtraSmall(window.innerWidth <= 480)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!filterRef.current || isMobile) return
    const observer = new ResizeObserver(() => {
      setFilterHeight(filterRef.current.offsetHeight)
    })
    observer.observe(filterRef.current)
    setFilterHeight(filterRef.current.offsetHeight)
    return () => observer.disconnect()
  }, [isMobile])

  useEffect(() => {
    if (!isMobile && showFilterDrawer) {
      setShowFilterDrawer(false)
    }
  }, [isMobile])

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

  const totalPages = Math.ceil((transactions?.length || 0) / pageSize)
  const paginatedRows = transactions?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || []

  const columns = [
    { label: 'Date', key: 'date' },
    !isMobile && { label: 'Account', key: 'account' },
    { label: 'Description', key: 'description' },
    { label: 'Amount', key: 'amount', align: 'center' },
    !isExtraSmall && { label: 'Category', key: 'category', align: 'center' },
  ].filter(Boolean)

  const sharedFilters = [
    { type: 'search', placeholder: 'Search transactions' },
    { type: 'dateRange', label: 'Date Range' },
    { type: 'dropdown', label: 'Account', options: ['All'] },
    { type: 'amountRange', label: 'Amount Range' },
  ]

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-[24px] font-bold leading-tight">Transactions</h1>

        {isMobile && (
          <div
            onClick={() => setShowFilterDrawer(true)}
            className="cursor-pointer p-[6px] rounded-[6px] hover:bg-[var(--color-hover-muted)] transition"
          >
            <IoFilter size={20} className="text-[var(--color-text)]" />
          </div>
        )}
      </div>

      {!isMobile && (
        <div ref={filterRef}>
          <TableFilters filters={sharedFilters} />
        </div>
      )}

      <div className="overflow-y-auto" style={{ height: `calc(100vh - ${isMobile ? 140 : filterHeight + 150}px)` }}>
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
        isMobile={isMobile}
        filters={sharedFilters}
      />
    </>
  )
}
