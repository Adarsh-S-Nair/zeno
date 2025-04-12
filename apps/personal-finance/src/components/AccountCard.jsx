import { LuUpload } from 'react-icons/lu'
import { HiDotsVertical } from 'react-icons/hi'
import {
  MdAccountBalance,
  MdSavings,
  MdCreditCard,
  MdTrendingUp
} from 'react-icons/md'

const typeStyles = {
  checking: {
    icon: MdAccountBalance,
    bg: 'var(--color-positive-bg)',
    text: 'var(--color-positive-text)',
  },
  savings: {
    icon: MdSavings,
    bg: 'var(--color-warning-bg)',
    text: 'var(--color-warning-text)',
  },
  'credit card': {
    icon: MdCreditCard,
    bg: 'var(--color-negative-bg)',
    text: 'var(--color-negative-text)',
  },
  investment: {
    icon: MdTrendingUp,
    bg: 'var(--color-primary)',
    text: '#ffffff',
  },
  default: {
    icon: MdAccountBalance,
    bg: 'var(--color-muted)',
    text: 'var(--color-text)',
  },
}

export default function AccountCard({ name, type, balance, lastUpdated }) {
  const styles = typeStyles[type] || typeStyles.default
  const Icon = styles.icon

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never'

  const formattedBalance = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance)
    

  return (
    <div
      className="p-[20px] rounded-[10px] flex flex-col gap-[12px] transition-[box-shadow] duration-200 ease-in-out"
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.06)', // blurred base
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.12)' // blurred hover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0px 2px 10px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Header row */}
      <div className="relative">
        <div className="flex items-center gap-[12px]">
          <div
            className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center text-[20px]"
            style={{
              backgroundColor: styles.bg,
              color: styles.text,
            }}
          >
            <Icon size={24} />
          </div>
          <div>
            <div className="text-[16px] font-[600]">{name}</div>
            <div className="text-[13px] font-[600] text-[var(--color-text-hover)] capitalize">
              {type}
            </div>
          </div>
        </div>

        <button
          className="absolute top-[2px] right-[-10px] p-0 m-0 appearance-none border-none bg-transparent cursor-pointer"
          style={{
            color: 'var(--color-text-hover)',
          }}
        >
          <HiDotsVertical size={18} />
        </button>
      </div>

      {/* Balance */}
      <div
        className="text-[20px] font-[600]"
        style={{
          color: balance >= 0
            ? 'var(--color-positive-text)'
            : 'var(--color-negative-text)',
        }}
      >
        {formattedBalance}
      </div>

      {/* Bottom row */}
      <div className="flex justify-between items-center text-[11px] font-[500]">
        <div className="text-[var(--color-text-hover)]">
          Last updated: {formattedDate}
        </div>

        <button
          className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer flex items-center gap-[6px] text-[11px] font-[550] text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
        >
          <LuUpload size={16} />
          Upload CSV
        </button>
      </div>
    </div>
  )
}
