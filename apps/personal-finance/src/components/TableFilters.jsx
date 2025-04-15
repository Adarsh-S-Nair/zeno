import { useState } from 'react'
import CustomDropdown from './CustomDropdown'
import { MdSearch } from 'react-icons/md'
import { MdOutlineRefresh } from "react-icons/md"

export default function TableFilters({ filters = [] }) {
  const [values, setValues] = useState({})

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const sharedInputStyles =
    'px-[12px] py-[8px] text-[0.7rem] font-[600] rounded-[6px] bg-[var(--color-inner-card)] text-[var(--color-text)] outline-none border-[1px] border-transparent focus:ring-[2px] focus:ring-[var(--color-primary-light)] transition placeholder:text-[0.7rem] placeholder:font-[600] placeholder:text-[var(--color-text-hover)]'

  return (
    <div
      className="p-[20px] rounded-[10px] mb-[28px] flex flex-col gap-[16px]"
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex flex-wrap gap-[16px] items-end">
        {filters.map((filter, idx) => {
          switch (filter.type) {
            case 'dateRange':
              return (
                <div key={idx} className="flex flex-col flex-1 min-w-[300px]">
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <div className="flex gap-[6px]">
                    <input
                      type="date"
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className={`${sharedInputStyles} flex-1 [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:opacity-50`}
                      style={{ 
                        colorScheme: 'dark',
                        fontFamily: 'inherit',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        '--webkit-calendar-picker-indicator-color': 'var(--color-text-hover)',
                      }}
                    />
                    <input
                      type="date"
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className={`${sharedInputStyles} flex-1 [&::-webkit-calendar-picker-indicator]:filter-none [&::-webkit-calendar-picker-indicator]:opacity-50`}
                      style={{ 
                        colorScheme: 'dark',
                        fontFamily: 'inherit',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        '--webkit-calendar-picker-indicator-color': 'var(--color-text-hover)',
                      }}
                    />
                  </div>
                </div>
              )
            case 'dropdown':
              return (
                <div key={idx} className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <CustomDropdown
                    value={values.account}
                    onChange={(val) => handleChange('account', val)}
                    options={[
                      { label: 'All Accounts', value: '' },
                      ...filter.options.map(opt => ({
                        label: opt,
                        value: opt
                      }))
                    ]}
                    defaultLabel="All Accounts"
                  />
                </div>
              )
            case 'amountRange':
              return (
                <div key={idx} className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-[13px] font-medium mb-[4px]">{filter.label}</label>
                  <div className="flex gap-[6px]">
                    <input
                      type="number"
                      placeholder="Min"
                      onChange={(e) => handleChange('minAmount', e.target.value)}
                      className={`${sharedInputStyles} flex-1`}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      onChange={(e) => handleChange('maxAmount', e.target.value)}
                      className={`${sharedInputStyles} flex-1`}
                    />
                  </div>
                </div>
              )
            case 'search':
              return (
                <div key={idx} className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-[13px] font-medium mb-[4px]">Search</label>
                  <div className="relative w-full">
                    <MdSearch className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--color-text-hover)]" size={16} />
                    <input
                      type="text"
                      placeholder={filter.placeholder || 'Search transactions'}
                      onChange={(e) => handleChange('search', e.target.value)}
                      className={`${sharedInputStyles} w-full pl-[32px] pr-[12px]`}
                    />
                  </div>
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
