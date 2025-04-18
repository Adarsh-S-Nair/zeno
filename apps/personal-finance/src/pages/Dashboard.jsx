import { useContext, useEffect, useState } from 'react'
import { FinanceContext } from '../utils/FinanceContext'
import StatCard from '../components/StatCard'
import IncomeVsSpendingChart from '../charts/IncomeVsSpendingChart'

export default function Dashboard() {
  const { netWorth, income, spending, incomeVsSpendingByMonth } = useContext(FinanceContext)

  const [layout, setLayout] = useState('desktop')

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

  return (
    <div className="px-[20px] flex flex-col gap-[20px] w-full max-w-[1440px] mx-auto">
      <h1 className="text-[24px] font-bold">Dashboard</h1>

      {/* Tablet layout: 2 columns, left column = stacked cards */}
      {layout === 'tablet' ? (
        <div className="grid grid-cols-2 gap-[20px]">
          <div className="flex flex-col gap-[12px]">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
            <h2 className="text-[16px] font-semibold mb-[12px]">
              Spending by Category
            </h2>
            {/* TODO: Pie Chart */}
          </div>
        </div>
      ) : (
        // Mobile or desktop stat cards
        <div
          className={
            layout === 'mobile'
              ? 'flex flex-col gap-[12px]'
              : 'grid gap-[20px] grid-cols-3'
          }
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Charts row */}
      {layout === 'desktop' && (
        <div className="grid grid-cols-[1.6fr_1fr] gap-[20px]">
          <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
            <h2 className="text-[16px] font-semibold mb-[12px]">
              Income vs Spending
            </h2>
            <IncomeVsSpendingChart data={incomeVsSpendingByMonth} />
          </div>

          <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
            <h2 className="text-[16px] font-semibold mb-[12px]">
              Spending by Category
            </h2>
            {/* TODO: Pie Chart */}
          </div>
        </div>
      )}

      {(layout === 'mobile') && (
        <>
          <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
            <h2 className="text-[16px] font-semibold mb-[12px]">
              Spending by Category
            </h2>
            {/* TODO: Pie Chart */}
          </div>

          <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
            <h2 className="text-[16px] font-semibold mb-[12px]">
              Income vs Spending
            </h2>
            <IncomeVsSpendingChart data={incomeVsSpendingByMonth} />
          </div>
        </>
      )}

      {layout === 'tablet' && (
        <div className="px-[20px] rounded-[10px] bg-[var(--color-card)] min-h-[280px]">
          <h2 className="text-[16px] font-semibold mb-[12px]">
            Income vs Spending
          </h2>
          <IncomeVsSpendingChart data={incomeVsSpendingByMonth} />
        </div>
      )}
    </div>
  )
}
