import { useEffect } from 'react'
import { MdClose } from 'react-icons/md'

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 8000) // toast lasts longer now
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      key={message} // 👈 triggers animation on new message
      className="fixed top-[20px] left-1/2 transform -translate-x-1/2 z-[9999] px-[48px] py-[12px] bg-[var(--color-error-darker)] text-[var(--color-text)] text-[0.85rem] font-medium rounded-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] min-w-[300px] max-w-[500px] animate-shake"
    >
      <div className="relative w-full pr-[0px] flex items-center">
        <span className="leading-tight block pr-[0px]">{message}</span>

        <div
          onClick={onClose}
          className="absolute top-1/2 -translate-y-1/2 right-[-44px] text-[var(--color-text)] cursor-pointer transition p-[4px] rounded-[4px]"
          aria-label="Close"
        >
          <MdClose size={18} />
        </div>
      </div>
    </div>
  )
}
