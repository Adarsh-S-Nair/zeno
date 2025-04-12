import { useState, useRef, useEffect } from 'react'

export default function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
}) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const selected = options.find((opt) => opt.value === value)

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(!open)}
        className="w-full px-[12px] py-[10px] text-[0.8rem] font-semibold rounded-[8px] bg-[var(--color-inner-card)] text-[var(--color-text)] shadow-sm hover:bg-[var(--color-muted-hover)] transition-all cursor-pointer flex items-center justify-between"
      >
        <span>
          {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
        </span>

        <svg
          className={`w-[14px] h-[14px] ml-[8px] transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          } text-[var(--color-text-hover)]`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-50 mt-[12px] w-full rounded-[10px] bg-[var(--color-inner-card)] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
          <ul className="list-none m-0 p-[0px] text-[11px] text-[var(--color-text)]">
            {options.map((opt) => (
              <li
                key={opt.value}
                className="px-[16px] py-[12px] hover:bg-[var(--color-muted-hover)] transition rounded-[6px] cursor-pointer"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
