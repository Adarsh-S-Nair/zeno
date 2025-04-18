import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function IncomeVsSpendingChart({ data }) {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={8}
          onMouseMove={() => {}}
          onMouseLeave={() => {}}
        >
          <CartesianGrid
            stroke="var(--color-muted-hover)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="var(--color-text-hover)"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <YAxis
            stroke="var(--color-text-hover)"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              fontWeight: 600,
            }}
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
            formatter={(value) =>
              `$${value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`
            }
          />
          <Bar
            dataKey="income"
            fill="var(--color-positive)"
            radius={[4, 4, 4, 4]}
            barSize={20}
            activeBar={false}
          />
          <Bar
            dataKey="spending"
            fill="var(--color-negative)"
            radius={[4, 4, 4, 4]}
            barSize={20}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
