import './DashboardCard.css'
import { Sparklines, SparklinesLine } from 'react-sparklines'

export default function DashboardCard({
    width = 3,
    height = 1,
    title,
    subtitle,
    icon,
    value,
    change,
    trend = [],
    children,
  }) {
    const isKpi = title && value !== undefined
    const isPositive = typeof change === 'number' && change >= 0
    const isNegative = typeof change === 'number' && change < 0
    const trendUp = trend.length >= 2 && trend[trend.length - 1] >= trend[0]
    const trendColor = trendUp ? 'var(--color-positive-text)' : 'var(--color-negative-text)'

    return (
      <div
        className="dashboard-card"
        style={{
          gridColumn: `span ${width}`,
          gridRow: `span ${height}`,
        }}
      >
        <div className="card-inner">
          {isKpi ? (
            <>
              <div className="kpi-header">
                <div className="kpi-icon-title">
                  {icon && <span className="kpi-icon">{icon}</span>}
                  <div>
                    <h3>{title}</h3>
                    {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
                  </div>
                </div>
  
                {change !== undefined && (
                  <span
                    className={`kpi-change ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}
                  >
                    {isPositive ? '+' : ''}
                    {change}%
                  </span>
                )}
              </div>
  
              <div className="kpi-value-wrapper">
                <p className="kpi-value">{value}</p>
              </div>

              {trend.length > 0 && (
              <div className="kpi-trend-behind">
                  <Sparklines data={trend} width={180} height={60}>
                  <SparklinesLine
                      color={trendColor}
                      style={{ fill: 'none', strokeWidth: 2 }}
                      curve="monotone"
                  />
                  <SparklinesLine
                      color={trendColor}
                      style={{
                      fill: trendColor,
                      fillOpacity: 0.2,
                      stroke: 'none',
                      }}
                      curve="monotone"
                  />
                  </Sparklines>
              </div>
              )}
            </>
          ) : (
            children
          )}
        </div>
      </div>
    )
  }