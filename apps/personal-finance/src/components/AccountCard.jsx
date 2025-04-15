import { FaUpload, FaEdit, FaTrashAlt } from "react-icons/fa"
import { HiDotsVertical } from 'react-icons/hi'
import {
  MdAccountBalance,
  MdSavings,
  MdCreditCard,
  MdTrendingUp,
  MdEdit,
  MdDelete
} from 'react-icons/md'
import DropdownMenu from './DropdownMenu' 

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
  'credit_card': {
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

export function formatRelativeTime(dateString) {
  const then = new Date(dateString + 'Z');
  const now = new Date();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return then.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}





export default function AccountCard({ name, type, balance, lastUpdated, onEdit, onDelete, onUpload }) {
  const styles = typeStyles[type] || typeStyles.default
  const Icon = styles.icon

  const formatType = (type) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const formattedDate = lastUpdated ? formatRelativeTime(lastUpdated) : 'Never'

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
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.12)'
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
              {formatType(type)}
            </div>
          </div>
        </div>

        <div className="absolute top-[2px] right-[-10px]">
        <DropdownMenu
          customWidth="100px"
          position="right"
          width="w-[100px]"
          trigger={
            <button className="absolute top-[-10px] right-[-5px] p-0 m-0 appearance-none border-none bg-transparent cursor-pointer text-[var(--color-text-hover)] hover:text-[var(--color-text-hover-darker)] transition-colors">
              <HiDotsVertical size={18} />
            </button>
          }
          options={[
            { value: 'edit', label: 'Edit', icon: MdEdit },
            { value: 'delete', label: 'Delete', icon: MdDelete, danger: true },
          ]}
          onSelect={(val) => {
            if (val === 'edit') onEdit?.()
            if (val === 'delete') onDelete?.()
          }}
        />
        </div>
      </div>

      {/* Balance */}
      <div
        className="text-[20px] font-[600]"
        style={{
          color:
            balance >= 0
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
          onClick={onUpload}
          className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer flex items-center gap-[6px] text-[11px] font-[550] text-[var(--color-primary-light)] hover:text-[var(--color-primary-darker)] transition-colors"
        >
          <FaUpload size={11} />
          Upload CSV
        </button>
      </div>
    </div>
  )
}
