import { useEffect, useRef } from 'react'
import CustomDropdown from './CustomDropdown'
import { MdSearch } from 'react-icons/md'
import { MdOutlineRefresh } from 'react-icons/md'

export default function TableFilters({ filters = [], values = {}, onMount, onChange, fullHeight = false, isDrawer = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (onMount && containerRef.current) {
      onMount(containerRef.current.offsetHeight)
    }
  }, [onMount])

  const handleChange = (key, val) => {
    const newValues = { ...values, [key]: val }

    // 🧠 smart date logic
    if (key === 'startDate') {
      const start = new Date(val)
      const end = values.endDate ? new Date(values.endDate) : null

      if (!end || start > end) {
        newValues.endDate = new Date().toISOString().split('T')[0] // today
      }
    }

    if (key === 'endDate') {
      const end = new Date(val)
      const start = values.startDate ? new Date(values.startDate) : null

      if (!start) {
        newValues.startDate = val
      } else if (end < start) {
        newValues.startDate = val
      }
    }

    if (onChange) onChange(newValues)
  }

  const sharedInputStyles =
    'px-[12px] py-[8px] text-[0.7rem] font-[600] rounded-[6px] bg-[var(--color-inner-card)] text-[var(--color-text)] outline-none border-[1px] border-transparent focus:ring-[2px] focus:ring-[var(--color-primary-light)] transition placeholder:text-[0.7rem] placeholder:font-[600] placeholder:text-[var(--color-text-hover)]'

  return (
    <div
      ref={containerRef}
      className={`rounded-[10px] mb-[28px] flex flex-col gap-[16px] ${fullHeight ? 'h-full' : ''}`}
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        className={`flex flex-wrap items-end overflow-y-auto ${
          isDrawer ? 'gap-[12px] w-full p-[5px]' : 'p-[15px] gap-[16px]'
        }`}
        style={{ maxHeight: '100%' }}
      >
        {filters.map((filter, idx) => {
          const wrapperClass = isDrawer
            ? 'flex flex-col w-full'
            : `flex flex-col flex-1 min-w-[${filter.type === 'dateRange' ? '300' : '200'}px]`

          switch (filter.type) {
            case 'dateRange':
              return (
                <div key={idx} className={wrapperClass}>
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <div className={`flex gap-[6px] ${isDrawer ? 'w-full' : ''}`}>
                    <input
                      type="date"
                      value={values.startDate || ''}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className={`${sharedInputStyles} flex-1 [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:opacity-50`}
                      style={{
                        colorScheme: 'dark',
                        fontFamily: 'inherit',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}
                    />
                    <input
                      type="date"
                      value={values.endDate || ''}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className={`${sharedInputStyles} flex-1 [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:opacity-50`}
                      style={{
                        colorScheme: 'dark',
                        fontFamily: 'inherit',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                      }}
                    />
                  </div>
                </div>
              )

            case 'dropdown':
              return (
                <div key={idx} className={wrapperClass}>
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <CustomDropdown
                    value={values.account || ''}
                    onChange={(val) => handleChange('account', val)}
                    options={[
                      { label: 'All Accounts', value: '' },
                      ...filter.options.map((opt) => ({
                        label: opt,
                        value: opt,
                      })),
                    ]}
                    defaultLabel="All Accounts"
                  />
                </div>
              )

            case 'amountRange':
              return (
                <div key={idx} className={wrapperClass}>
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <div className={`flex gap-[6px] ${isDrawer ? 'w-full' : ''}`}>
                    <input
                      type="number"
                      value={values.minAmount || ''}
                      placeholder="Min"
                      onChange={(e) => handleChange('minAmount', e.target.value)}
                      className={`${sharedInputStyles} flex-1`}
                    />
                    <input
                      type="number"
                      value={values.maxAmount || ''}
                      placeholder="Max"
                      onChange={(e) => handleChange('maxAmount', e.target.value)}
                      className={`${sharedInputStyles} flex-1`}
                    />
                  </div>
                </div>
              )

            case 'search':
              return (
                <div key={idx} className={wrapperClass}>
                  <label className="text-[13px] font-medium mb-[4px]">Search</label>
                  <div className="relative w-full">
                    <MdSearch
                      className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--color-text-hover)]"
                      size={16}
                    />
                    <input
                      type="text"
                      value={values.search || ''}
                      placeholder={filter.placeholder || 'Search transactions'}
                      onChange={(e) => handleChange('search', e.target.value)}
                      className={`${sharedInputStyles} w-full pl-[32px] pr-[12px]`}
                    />
                  </div>
                </div>
              )

            case 'categoryDropdown':
              return (
                <div key={idx} className={wrapperClass}>
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <CustomDropdown
                    value={values.category || ''}
                    onChange={(val) => handleChange('category', val)}
                    options={[
                      { label: 'All Categories', value: '' },
                      ...filter.options.map((opt) => ({
                        label: opt,
                        value: opt,
                      })),
                    ]}
                    defaultLabel="All Categories"
                  />
                </div>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
