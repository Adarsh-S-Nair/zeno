import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import rules from '../utils/categorizer/rules.json'

const categoryColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.color
  return acc
}, {})

const categoryTextColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.textColor
  return acc
}, {})

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const { name, value } = payload[0]
  const textColor = categoryTextColorMap[name] || 'var(--color-text)'

  return (
    <div
      className="rounded-[8px] px-[10px] py-[6px]"
      style={{
        backgroundColor: 'var(--color-inner-card)',
        fontSize: '12px',
        color: textColor,
        fontWeight: 600,
      }}
    >
      <div>{name}</div>
      <div>
        ${value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </div>
    </div>
  )
}

export default function SpendingByCategoryChart({ data = [] }) {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}         
            paddingAngle={1}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColorMap[entry.name] || '#8884d8'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
