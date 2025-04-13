import { useState } from 'react'
import DropdownMenu from './DropdownMenu'

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  defaultLabel,
}) {
  const selected = options.find((opt) => opt.value === value)

  return (
    <DropdownMenu
      width="w-full"
      onSelect={onChange}
      options={options}
      trigger={
        <div
          className="w-full px-[12px] py-[8px] text-[0.7rem] font-[600] rounded-[8px] bg-[var(--color-inner-card)] text-[var(--color-text)] shadow-sm hover:bg-[var(--color-muted-hover)] transition-all flex items-center justify-between"
        >
          <span>
            {selected ? selected.label : <span className="text-[var(--color-text-hover)]">{defaultLabel || placeholder}</span>}
          </span>
          <svg
            className="w-[12px] h-[12px] ml-[8px] text-[var(--color-text-hover)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      }
    />
  )
}
