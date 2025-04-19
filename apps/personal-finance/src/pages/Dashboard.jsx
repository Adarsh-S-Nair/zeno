import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FinanceContext } from '../utils/FinanceContext'
import StatCard from '../components/StatCard'
import IncomeVsSpendingChart from '../charts/IncomeVsSpendingChart'
import SpendingByCategoryChart from '../charts/SpendingByCategoryChart'
import Table from '../components/Table'

export default function Dashboard() {
  const {
    transactions,
    netWorth,
    income,
    spending,
    incomeVsSpendingByMonth,
    spendingByCategory,
  } = useContext(FinanceContext)

  const navigate = useNavigate()
  const [layout, setLayout] = useState('desktop')
  const [chartView, setChartView] = useState('line')

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w < 640) setLayout('mobile')
      else if (w < 1024) setLayout('tablet')
      else setLayout('desktop')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const statCards = [
    {
      label: 'Net Worth',
      amount: netWorth,
      percentage: 4.3,
      positive: true,
      color: 'var(--color-primary)',
    },
    {
      label: 'Income',
      amount: income,
      percentage: 8.1,
      positive: true,
      color: 'var(--color-positive-bg)',
    },
    {
      label: 'Spending',
      amount: spending,
      percentage: 12.7,
      positive: false,
      color: 'var(--color-negative-bg)',
    },
  ]

  const ChartCard = (
    <div className="flex flex-col justify-between px-[20px] rounded-[10px] bg-[var(--color-card)] w-full h-full">
      <div className="flex items-center justify-between mb-[12px]">
        <h2 className="text-[16px] font-semibold">Income vs Spending</h2>
        <IncomeVsSpendingChart.Toggle
          viewMode={chartView}
          setViewMode={setChartView}
        />
      </div>
      <div className="flex-1">
        <IncomeVsSpendingChart
          data={incomeVsSpendingByMonth}
          viewMode={chartView}
        />
      </div>
    </div>
  )

  const CategoryCard = (
    <div className="flex flex-col justify-between px-[20px] rounded-[10px] bg-[var(--color-card)] w-full h-full">
      <h2 className="text-[16px] font-semibold mb-[12px]">Spending by Category</h2>
      <div className="flex-1">
        <SpendingByCategoryChart data={spendingByCategory} />
      </div>
    </div>
  )

  const PlaceholderCard = (title, height = '180px') => (
    <div className={`px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[${height}]`}>
      <h2 className="text-[16px] font-semibold mb-[8px]">{title}</h2>
    </div>
  )

  const RecentTransactionsCard = () => (
    <div className="rounded-[10px] bg-[var(--color-card)] w-full max-h-[280px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-[20px]">
        <h2 className="text-[16px] font-semibold">Recent Transactions</h2>
        <div
          className="text-[var(--color-text)] cursor-pointer font-[700] text-[12px] px-[12px] py-[6px] rounded-[6px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
          onClick={() => navigate('/transactions')}
        >
          {`View all`}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Table
          columns={[
            { label: 'Date', key: 'date' },
            { label: 'Description', key: 'description' },
            { label: 'Amount', key: 'amount', align: 'center' },
          ]}
          rows={transactions.slice(0, 5)}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          onRefresh={() => {}}
          hideFooter
        />
      </div>
    </div>
  )

  return (
    <div className="px-[20px] flex flex-col w-full max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
      <h1 className="text-[24px] font-bold">Dashboard</h1>

      <div className="flex-1 flex flex-col justify-center gap-[20px] mb-[30px]">
        {layout === 'desktop' ? (
          <div className="flex flex-col gap-[20px]">
            <div className="grid gap-[20px] grid-cols-3">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-[1fr_300px] gap-[20px] min-h-[320px]">
              {ChartCard}
              {CategoryCard}
            </div>

            <div className="grid grid-cols-[1fr_240px_240px] gap-[20px]">
              {RecentTransactionsCard()}
              {PlaceholderCard('Alerts')}
              {PlaceholderCard('Upcoming Bills')}
            </div>
          </div>
        ) : layout === 'tablet' ? (
          <>
            <div className="grid grid-cols-2 gap-[20px] items-start">
              <div className="flex flex-col gap-[12px]">
                {statCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>
              <div className="h-full">{CategoryCard}</div>
            </div>

            {ChartCard}
            {RecentTransactionsCard()}

            <div className="grid grid-cols-2 gap-[20px]">
              {PlaceholderCard('Alerts')}
              {PlaceholderCard('Upcoming Bills')}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-[12px]">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>

            {CategoryCard}
            {ChartCard}
            {RecentTransactionsCard()}
            {PlaceholderCard('Alerts')}
            {PlaceholderCard('Upcoming Bills')}
          </>
        )}
      </div>
    </div>
  )
}
