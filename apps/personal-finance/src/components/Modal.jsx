import { useState, useEffect, useRef } from 'react'
import CustomDropdown from './CustomDropdown'
import Toast from './Toast'
import DropdownMenu from './DropdownMenu'
import { activeDropdownRef } from './DropdownMenu'

export default function Modal({
  title,
  isOpen,
  onClose,
  children,
  fields = [],
  actionLabel = 'Submit',
  actionType,
  loadingLabel = '',
  onSubmit = null,
  error = null,
}) {
  const isFormMode = fields.length > 0
  const modalRef = useRef(null)

  const initialFormState = () =>
    Object.fromEntries(
      fields.map((f) => {
        let val = f.defaultValue !== undefined ? f.defaultValue : ''
        if (f.currency && typeof val === 'number' && !isNaN(val)) {
          val = val.toFixed(2)
        }
        return [f.name, val]
      })
    )

  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  // 💡 reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState())
      setFormError(null)
      setLoading(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    const handleClickOutside = (e) => {
      const clickedInsideDropdown = activeDropdownRef.current?.contains(e.target)
    
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !clickedInsideDropdown
      ) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (isFormMode) {
      const missingRequired = fields.filter(
        (f) => f.required && !formData[f.name]?.toString().trim()
      )
      if (missingRequired.length > 0) {
        setFormError('Please fill in all required fields.')
        return
      }
    }

    if (onSubmit) {
      try {
        setFormError(null)
        setLoading(true)
        await onSubmit(formData)

        // ✅ if successful: close modal
        onClose()
      } catch (err) {
        console.error('Submit failed:', err)
        setFormError('Something went wrong.')
      } finally {
        setLoading(false)
      }
    }
  }

  const displayError = error || formError

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={modalRef}
        className="relative bg-[var(--color-card)] text-[var(--color-text)] w-full max-w-[420px] p-[28px] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
      >
        <h2 className="text-[1.15rem] font-semibold mb-[16px] text-left">{title}</h2>

        <div className="flex flex-col gap-[16px]">
          {isFormMode ? (
            <form
              className="flex flex-wrap gap-[16px]"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`flex flex-col ${
                    field.fullWidth ? 'w-full' : 'w-[calc(50%-8px)]'
                  }`}
                >
                  <label
                    htmlFor={field.name}
                    className="text-[0.75rem] font-medium text-[var(--color-text-hover)] mb-[8px] text-left"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-[var(--color-error)] ml-[4px]">*</span>
                    )}
                  </label>

                  {field.type === 'select' ? (
                    <CustomDropdown
                      value={formData[field.name]}
                      onChange={(val) => handleChange(field.name, val)}
                      options={field.options}
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      onBlur={() => {
                        if (field.currency) {
                          const raw = parseFloat(formData[field.name])
                          if (!isNaN(raw)) {
                            setFormData((prev) => ({
                              ...prev,
                              [field.name]: raw.toFixed(2),
                            }))
                          }
                        }
                      }}
                      min={field.min}
                      step={field.step}
                      autoComplete="off"
                      className={`w-full px-[12px] py-[8px] text-[0.9rem] rounded-[6px] bg-[var(--color-inner-card)] text-[var(--color-text)] outline-none ${
                        field.currency ? 'pl-[22px]' : ''
                      }`}
                    />
                  )}
                </div>
              ))}
            </form>
          ) : (
            children
          )}

          {displayError && (
            <Toast message={displayError} onClose={() => setFormError(null)} />
          )}
        </div>

        <div className="flex justify-end gap-[10px] mt-[25px]">
          <button className="btn btn-muted" onClick={onClose}>
            Cancel
          </button>
          {onSubmit && (
            <button
              type="submit"
              className={`btn ${
                actionType === 'danger'
                  ? 'bg-[var(--color-error-darker)] text-[var(--color-text)] hover:opacity-90'
                  : 'btn-primary'
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? loadingLabel : actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
