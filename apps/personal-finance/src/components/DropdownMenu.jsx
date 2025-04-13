import { useState, useRef, useEffect } from 'react'

export default function DropdownMenu({
  options = [],
  onSelect,
  trigger,
  position = 'left', // 'left' | 'right'
  width = 'w-auto',
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
  
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const alignmentClass = {
    left: 'left-[0px]',
    right: 'right-[10px]',
    center: 'left-1/2 -translate-x-1/2',
  }[position] || 'left-[0px]'

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>

      {open && (
        <div
          className={`absolute z-50 mt-[12px] ${alignmentClass} rounded-[10px] bg-[var(--color-inner-card)] shadow-[0_4px_14px_rgba(0,0,0,0.15)] ${width}`}
        >
          <ul className="list-none m-[0px] p-[0px] text-[11px] text-[var(--color-text)]">
            {options.map((opt) => (
              <li
                key={opt.value}
                className={`px-[16px] py-[12px] hover:bg-[var(--color-muted-hover)] transition rounded-[6px] cursor-pointer whitespace-nowrap ${
                  opt.danger ? 'text-[var(--color-error)]' : ''
                } flex items-center gap-[8px]`}
                onClick={() => {
                  onSelect(opt.value)
                  setOpen(false)
                }}
              >
                {opt.icon && <opt.icon size={12} />}
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
