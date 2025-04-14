import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import categoryStyles from '../utils/categorizer/rules.json';

export default function Table({ columns, rows = [], currentPage, totalPages, onPageChange }) {
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  const renderCell = (col, content, isHeader = false) => {
    const alignment = getAlignmentClass(col.align)
    const isMonetary = ['amount', 'balance'].includes(col.key)

    if (isMonetary) {
      return (
        <div className="flex justify-center">
          <div className={`truncate ${alignment}`}>
            {content}
          </div>
        </div>
      )
    }

    return (
      <div className={`truncate ${alignment}`}>
        {content}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[10px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-[var(--color-card)]">
      {/* Header */}
      <div className="grid grid-cols-7 text-[12px] font-bold capitalize text-[var(--color-text-hover)] bg-[var(--color-inner-card)] px-[16px] py-[12px] border-b border-[var(--color-muted)] pr-[26px]">
        {columns.map((col) => (
          <div key={col.key}>
            {renderCell(col, col.label, true)}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="text-center text-[13px] text-[var(--color-text-hover)] mt-[40px]">No transactions found.</div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-7 px-[16px] py-[12px] text-[11px] font-semibold text-[var(--color-text)] border-b border-[var(--color-muted)] hover:bg-[var(--color-muted-hover)] transition"
            >
              {columns.map((col) => {
                if (col.key === 'amount') {
                  const amount = parseFloat(row[col.key])
                  const isPositive = amount >= 0
                  return (
                    <div key={col.key}>
                      {renderCell(col,
                        <span className={isPositive ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'}>
                          {formatCurrency(amount)}
                        </span>
                      )}
                    </div>
                  )
                }
                if (col.key === 'type') {
                  const isCredit = row[col.key] === 'credit'
                  return (
                    <div key={col.key} className="flex items-center justify-center">
                      <span className={`w-[100px] text-center px-[10px] py-[4px] rounded-[9px] text-[10px] font-bold inline-block ${
                        isCredit
                          ? 'bg-[var(--color-positive-bg)] text-[var(--color-positive-text)]'
                          : 'bg-[var(--color-negative-bg)] text-[var(--color-negative-text)]'
                      }`}>
                        {formatType(row[col.key])}
                      </span>
                    </div>
                  )
                }
                if (col.key === 'balance') {
                  return (
                    <div key={col.key}>
                      {renderCell(col, formatCurrency(parseFloat(row[col.key])))}
                    </div>
                  )
                }
                if (col.key === 'category') {
                  const category = row[col.key] || 'Uncategorized'
                  const rule = categoryStyles[category] || {}
                  const bg = rule.color || 'var(--color-muted)'
                  const fg = rule.textColor || 'var(--color-text)'
                
                  return (
                    <div key={col.key} className="flex items-center justify-center">
                      <span
                        className="w-[100px] text-center px-[10px] py-[4px] rounded-[9px] text-[10px] font-bold inline-block whitespace-nowrap"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {category}
                      </span>
                    </div>
                  )
                }
                
                return (
                  <div key={col.key}>
                    {renderCell(col, row[col.key])}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer pagination */}
      <div className="flex justify-between items-center gap-[12px] px-[16px] py-[12px] border-t border-[var(--color-muted)] text-[12px] text-[var(--color-text-hover)]">
        <div className="text-[11px] font-medium">
          Viewing {(currentPage - 1) * 20 + 1} – {Math.min(currentPage * 20, totalPages * 20)} of {totalPages * 20}
        </div>
        <div className="flex items-center gap-[12px]">
          <div
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={`cursor-pointer transition mt-[2px] ${
              currentPage === 1
                ? 'opacity-30 pointer-events-none'
                : 'hover:text-[var(--color-text)]'
            }`}
          >
            <MdArrowBackIosNew size={16} />
          </div>
          <span className="leading-none mt-[1px]">
            Page {currentPage} of {totalPages}
          </span>
          <div
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={`cursor-pointer transition mt-[2px] ${
              currentPage === totalPages
                ? 'opacity-30 pointer-events-none'
                : 'hover:text-[var(--color-text)]'
            }`}
          >
            <MdArrowForwardIos size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
