import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useNavigate } from 'react-router-dom'

export default function IncomeVsSpendingChart({ data, viewMode }) {
  const navigate = useNavigate()

  const handleBarClick = (dataPoint) => {
    if (!dataPoint?.month) return

    const [monthName, year] = dataPoint.month.split(' ')
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1

    const startDate = `${year}-${monthIndex.toString().padStart(2, '0')}-01`
    const endDate = new Date(year, monthIndex, 0).toISOString().split('T')[0]

    navigate(`/transactions?startDate=${startDate}&endDate=${endDate}`)
  }

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        {viewMode === 'bar' ? (
          <BarChart
            style={{ cursor: 'pointer' }}
            data={data}
            barGap={8}
            onClick={(e) =>
              e?.activePayload?.[0] && handleBarClick(e.activePayload[0].payload)
            }
          >
            <CartesianGrid stroke="var(--color-muted-hover)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--color-text-hover)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              stroke="var(--color-text-hover)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value) =>
                `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              }
            />
            <Tooltip
              cursor={{ fill: 'var(--color-muted-hover)' }}
              contentStyle={{
                backgroundColor: 'var(--color-inner-card)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                const formattedName = name === 'income' ? 'Income:' : name === 'spending' ? 'Spending:' : name
                const formattedValue = `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
                return [formattedValue, formattedName]
              }}
            />
            <Bar
              dataKey="income"
              fill="var(--color-positive)"
              radius={[4, 4, 4, 4]}
              barSize={20}
              isAnimationActive={false}
            />
            <Bar
              dataKey="spending"
              fill="var(--color-negative)"
              radius={[4, 4, 4, 4]}
              barSize={20}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid stroke="var(--color-muted-hover)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="var(--color-text-hover)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              stroke="var(--color-text-hover)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fontWeight: 600 }}
              tickFormatter={(value) =>
                `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              }
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-muted-hover)', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'var(--color-inner-card)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value, name) => {
                const formattedName = name === 'income' ? 'Income:' : name === 'spending' ? 'Spending:' : name
                const formattedValue = `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
                return [formattedValue, formattedName]
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="var(--color-positive)"
              strokeWidth={5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="var(--color-negative)"
              strokeWidth={5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

IncomeVsSpendingChart.Toggle = function Toggle({ viewMode, setViewMode }) {
  return (
    <div
      className="text-[var(--color-text)] cursor-pointer font-[700] text-[12px] px-[12px] py-[6px] rounded-[6px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
      onClick={() =>
        setViewMode((prev) => (prev === 'line' ? 'bar' : 'line'))
      }
    >
      {viewMode === 'line' ? 'Show Bar' : 'Show Line'}
    </div>
  )
}
