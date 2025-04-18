import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts'
import { useState } from 'react'
import rules from '../utils/categorizer/rules.json'

const categoryColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.color
  return acc
}, {})

const categoryTextColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.textColor
  return acc
}, {})

function CustomTooltip({ active, payload }) {
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

// Optional: adds a subtle bump to active slice
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180
  const {
    cx, cy, midAngle, outerRadius, startAngle, endAngle, fill, payload, value,
  } = props

  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 8) * cos
  const sy = cy + (outerRadius + 8) * sin

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={50}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
}

export default function SpendingByCategoryChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null)

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
            paddingAngle={0}
            isAnimationActive={false}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
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
