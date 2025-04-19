import { supabase } from '@zeno/core';
import { MdArrowBackIosNew, MdArrowForwardIos, MdOutlineRefresh, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import categoryStyles from '../utils/categorizer/rules.json';
import { useRef, useState } from 'react';
import DropdownMenu from './DropdownMenu';

export default function Table({ columns, rows = [], currentPage, totalPages, onPageChange, onRefresh, hideFooter = false }) {
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const scrollRef = useRef(null);
  const [categoryFilters, setCategoryFilters] = useState({});
  const dropdownRef = useRef(null);

  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[columns.length] || 'grid-cols-1';

  const formatDate = (dateString) => {
    // Avoid timezone shifts by extracting the YYYY-MM-DD part directly
    const [year, month, day] = dateString.split('T')[0].split('-')
    const date = new Date(`${year}-${month}-${day}T00:00:00`)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getAlignmentClass = (align) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const renderCell = (col, content) => {
    const alignment = getAlignmentClass(col.align);
    return (
      <div className={`truncate ${alignment} overflow-hidden text-ellipsis whitespace-nowrap`} title={typeof content === 'string' ? content : undefined}>
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[10px] shadow bg-[var(--color-card)]">
      <div className={`grid ${columnClass} px-[16px] py-[12px] border-b border-[var(--color-muted)] bg-[var(--color-inner-card)] text-[12px] font-bold capitalize text-[var(--color-text-hover)]`}>
        {columns.map((col) => (
          <div key={col.key} className={`${col.width || ''}`}>
            {renderCell(col, col.label, true)}
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="text-center text-[13px] text-[var(--color-text-hover)] mt-[40px]">No transactions found.</div>
        ) : (
          rows.map((row, idx) => (
            <div key={idx} className={`grid ${columnClass} h-[48px] px-[16px] py-[12px] text-[11px] font-semibold text-[var(--color-text)] border-b border-[var(--color-muted)] hover:bg-[var(--color-muted-hover)] transition`}>
              {columns.map((col) => {
                const cellClass = col.width || '';
                if (col.key === 'date') {
                  return <div key={col.key} className={cellClass}>{renderCell(col, formatDate(row[col.key]))}</div>;
                }
                if (col.key === 'amount') {
                  const amount = parseFloat(row[col.key]);
                  const isPositive = amount >= 0;
                  return (
                    <div key={col.key} className={`${cellClass} text-right`}>
                      {renderCell(col,
                        <span className={isPositive ? 'text-[var(--color-positive-text)]' : 'text-[var(--color-negative-text)]'}>
                          {formatCurrency(amount)}
                        </span>
                      )}
                    </div>
                  );
                }
                if (col.key === 'category') {
                  const category = row.category_override || row.category || 'Uncategorized';
                  const rule = categoryStyles[category] || {};
                  const bg = rule.color || 'var(--color-muted)';
                  const fg = rule.textColor || 'var(--color-text)';
                  const isEditing = editingCategoryId === row.id;

                  const dropdownOptions = Object.entries(categoryStyles).map(([key]) => ({ label: key, value: key }));

                  return (
                    <div key={col.key} className={`${col.width || ''} flex items-center justify-center`}>
                      <DropdownMenu
                        ref={dropdownRef}
                        options={dropdownOptions}
                        scrollContainerRef={scrollRef}
                        width="w-[140px]"
                        position="center"
                        itemFontSize="text-[10px]"
                        textFilter={categoryFilters[row.id] || ''}
                        trigger={
                          <span
                            className={`w-[120px] px-[10px] py-[4px] rounded-[9px] text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all duration-150 relative flex items-center justify-center group ${isEditing ? 'brightness-[1.35]' : 'hover:brightness-[1.35]'}`}
                            style={{ backgroundColor: bg, color: fg }}
                            onClick={() => {
                              setEditingCategoryId(prev => (prev === row.id ? null : row.id))
                            }}
                            title="Click to change category"
                          >
                            {category}
                            <span className={`absolute right-[6px] top-[12px] -translate-y-1/2 text-[var(--color-text)] transition-opacity duration-150 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              {isEditing ? <MdKeyboardArrowUp size={14} /> : <MdKeyboardArrowDown size={14} />}
                            </span>
                          </span>
                        }
                        onSelect={async (selected) => {
                          const overrideValue = selected === row.category ? null : selected
                          const { error } = await supabase
                            .from('transactions')
                            .update({ category_override: overrideValue })
                            .eq('id', row.id)
                          if (!error) {
                            await onRefresh() 
                            setEditingCategoryId(null)
                          } else {
                            console.error('Failed to update category:', error)
                          }
                        }}
                        onClose={() => setEditingCategoryId(null)}
                      />
                    </div>
                  )
                }
                return <div key={col.key} className={cellClass}>{renderCell(col, row[col.key])}</div>;
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {!hideFooter && (
        <div className="flex select-none justify-between items-center gap-[12px] px-[16px] py-[12px] border-t border-[var(--color-muted)] text-[12px] text-[var(--color-text-hover)]">
          <div className="flex items-center gap-[8px] text-[11px] font-medium">
            <MdOutlineRefresh size={16} title="Refresh table" className="cursor-pointer hover:text-[var(--color-text)] transition" onClick={onRefresh} />
            <span>
              Viewing {(currentPage - 1) * 20 + 1} – {Math.min(currentPage * 20, totalPages * 20)} of {totalPages * 20}
            </span>
          </div>
          <div className="flex items-center gap-[12px]">
            <div onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} className={`cursor-pointer transition mt-[2px] ${currentPage === 1 ? 'opacity-30 pointer-events-none' : 'hover:text-[var(--color-text)]'}`}>
              <MdArrowBackIosNew size={16} />
            </div>
            <span className="leading-none mt-[1px]">Page {currentPage} of {totalPages}</span>
            <div onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} className={`cursor-pointer transition mt-[2px] ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : 'hover:text-[var(--color-text)]'}`}>
              <MdArrowForwardIos size={16} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}