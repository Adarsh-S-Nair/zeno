import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import rules from '../utils/categorizer/rules.json'

const categoryColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.color
  return acc
}, {})

const categoryTextColorMap = Object.entries(rules).reduce((acc, [category, rule]) => {
  acc[category] = rule.textColor
  return acc
}, {})

// helper to lighten color
function lightenColor(hex, amount = 0.3) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  const r = Math.min(255, Math.floor((num >> 16) * (1 - amount) + 255 * amount))
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00ff) * (1 - amount) + 255 * amount))
  const b = Math.min(255, Math.floor((num & 0x0000ff) * (1 - amount) + 255 * amount))
  return `rgba(${r}, ${g}, ${b}, 0.6)`
}

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

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props

  const category = payload.name
  const glowColor = lightenColor(categoryColorMap[category] || fill, 0.4)

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke={glowColor}
      strokeWidth={3}
      style={{
        filter: `drop-shadow(0 0 8px ${glowColor})`,
        transition: 'all 0.25s ease-in-out',
      }}
    />
  )
}

export default function SpendingByCategoryChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const navigate = useNavigate()

  const handleClick = (_, index) => {
    if (data[index]) {
      const category = data[index].name
      navigate(`/transactions?category=${encodeURIComponent(category)}`)
    }
  }

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
            paddingAngle={4}
            className="cursor-pointer"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={handleClick}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColorMap[entry.name] || '#8884d8'}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth={1}
                style={{
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
