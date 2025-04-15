import { useState, useRef, useEffect, useImperativeHandle, forwardRef, cloneElement } from 'react'
import { createPortal } from 'react-dom'

export const activeDropdownRef = { current: null }

const DropdownMenu = forwardRef(function DropdownMenu({
  options = [],
  onSelect,
  trigger,
  position = 'left',
  onClose = () => {},
  scrollContainerRef = null,
  itemFontSize = 'text-[11px]',
  textFilter = '',
  customWidth = null,
}, ref) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 200,
    openUpwards: false,
  })

  useImperativeHandle(ref, () => ({
    close: () => {
      setOpen(false)
      onClose()
    },
  }))

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        !triggerRef.current?.contains(e.target) &&
        !dropdownRef.current?.contains(e.target)
      ) {
        setOpen(false)
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      activeDropdownRef.current = dropdownRef.current
    } else {
      activeDropdownRef.current = null
    }
  }, [open])

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownHeight = 200
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      const openUpwards = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight

      setMenuPosition({
        top: openUpwards
          ? rect.top + window.scrollY - dropdownHeight + 12
          : rect.bottom + window.scrollY + 8,
        left:
          position === 'center'
            ? rect.left + rect.width / 2
            : position === 'right'
            ? rect.right - (customWidth ? parseInt(customWidth) : rect.width)
            : rect.left,
        width: rect.width,
        openUpwards,
      })
    }

    setOpen(true)
  }

  const alignmentClass = {
    left: 'translate-x-0',
    right: 'translate-x-0',
    center: '-translate-x-1/2',
  }[position] || 'translate-x-0'

  const filteredOptions = options.filter((opt) =>
    textFilter === '' || opt.label.toLowerCase().includes(textFilter.toLowerCase())
  )

  return (
    <>
      {cloneElement(trigger, {
        ref: triggerRef,
        onClick: (e) => {
          e.stopPropagation()
          trigger.props?.onClick?.(e) // 👈 call user's original onClick
          if (open) {
            setOpen(false)
            onClose()
          } else {
            openDropdown()
          }
        }
      })}

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className={`absolute z-[9999] ${alignmentClass} rounded-[10px] bg-[var(--color-inner-card)] shadow-[0_4px_14px_rgba(0,0,0,0.15)]`}
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              minWidth: customWidth || `${menuPosition.width}px`,
              padding: '4px 0',
            }}
          >
            <ul className={`list-none m-[0px] p-[0px] ${itemFontSize} text-[var(--color-text)] max-h-[180px] overflow-y-auto`}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={`px-[16px] py-[12px] hover:bg-[var(--color-muted-hover)] transition rounded-[6px] cursor-pointer whitespace-nowrap ${
                      opt.danger ? 'text-[var(--color-error)]' : ''
                    } flex items-center gap-[8px]`}
                    onClick={() => {
                      onSelect(opt.value)
                      setOpen(false)
                      onClose()
                    }}
                  >
                    {opt.icon && <opt.icon size={12} />}
                    {opt.label}
                  </li>
                ))
              ) : (
                <li className="px-[16px] py-[12px] text-[var(--color-text-hover)] italic">
                  No options available
                </li>
              )}
            </ul>
          </div>,
          document.body
        )}
    </>
  )
})

export default DropdownMenu
