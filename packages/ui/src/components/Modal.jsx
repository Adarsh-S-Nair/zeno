import { useState, useEffect } from 'react'
import CustomDropdown from './CustomDropdown';

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

  const [formData, setFormData] = useState(() =>
    Object.fromEntries(
      fields.map((f) => {
        let val = f.defaultValue !== undefined ? f.defaultValue : ''
        if (f.currency && typeof val === 'number' && !isNaN(val)) {
          val = val.toFixed(2)
        }
        return [f.name, val]
      })
    )
  )

  const [formError, setFormError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
      <div className="relative bg-[var(--color-card)] text-[var(--color-text)] w-full max-w-[420px] p-[28px] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
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
                      id={field.name}
                      value={formData[field.name]}
                      onChange={(val) => handleChange(field.name, val)}
                      options={field.options}
                      placeholder="Select..."
                    />
                  ) : (
                    <input
                      id={field.name}
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      onBlur={() => {
                        if (field.currency) {
                          const raw = parseFloat(formData[field.name]);
                          if (!isNaN(raw)) {
                            setFormData((prev) => ({
                              ...prev,
                              [field.name]: raw.toFixed(2),
                            }));
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
            <p className="text-[0.85rem] text-[var(--color-error)] ml-[4px] text-left">
              {displayError}
            </p>
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
                actionType === 'danger' ? 'btn-danger' : 'btn-primary'
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
