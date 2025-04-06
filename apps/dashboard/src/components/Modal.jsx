import { useState, useEffect } from 'react'
import './Modal.css'

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
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
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
      } catch (err) {
        console.error('Submit failed:', err)
      } finally {
        setLoading(false)
      }
    }
  }

  const displayError = error || formError

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
        </div>

        <div className="modal-body">
          {isFormMode ? (
            <div className="form-modal-grid">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`form-field ${field.fullWidth ? 'full' : 'half'}`}
                >
                  <label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="required-asterisk">*</span>}
                  </label>
                
                  <div className={`input-wrapper ${field.currency ? 'currency' : ''}`}>
                    {field.currency && <span className="currency-symbol">$</span>}
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
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {children}
            </>
          )}
          
          {displayError && <p className="modal-error">{displayError}</p>}
        </div>

        <div className={`modal-actions ${isFormMode ? 'form-mode' : 'non-form-mode'}`}>
          <button className="btn btn-muted" onClick={onClose}>
            Cancel
          </button>

          {onSubmit && (
            <button
              className={`btn ${actionType === 'danger' ? 'btn-danger' : 'btn-primary'}`}
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
