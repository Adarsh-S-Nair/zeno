import { FaWallet, FaMoneyBillWave, FaDollarSign } from 'react-icons/fa'

const iconMap = {
  'Net Worth': FaWallet,
  'Income': FaMoneyBillWave,
  'Spending': FaDollarSign,
}

export default function StatCard({ label, amount, percentage, positive, color }) {
  const Icon = iconMap[label]

  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  const formattedPercentage = `${positive ? '+' : '-'}${percentage.toFixed(1)}%`

  return (
    <div
      className="p-[20px] rounded-[10px] flex items-center gap-[16px] transition-[box-shadow] duration-200 ease-in-out"
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Icon */}
      <div
        className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center text-white text-[20px] shrink-0"
        style={{ backgroundColor: color }}
      >
        <Icon size={22} />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center w-full">
        <div className="flex justify-between items-center mb-[4px]">
          <div className="text-[14px] font-[600] text-[var(--color-text-hover)]">
            {label}
          </div>
          <div
            className="text-[11px] font-[600] px-[8px] py-[2px] rounded-full"
            style={{
              backgroundColor: positive
                ? 'rgba(0, 200, 120, 0.1)'
                : 'rgba(255, 80, 80, 0.1)',
              color: positive
                ? 'var(--color-positive-text)'
                : 'var(--color-negative-text)',
            }}
          >
            {formattedPercentage}
          </div>
        </div>

        <div className="text-[20px] font-[700] leading-tight">
          {formattedAmount}
        </div>
      </div>
    </div>
  )
}
