import { useEffect } from 'react'
import { MdOutlineArrowForwardIos } from 'react-icons/md'
import TableFilters from './TableFilters'

export default function FilterDrawer({ open, onClose, filters, isMobile }) {
  if (!isMobile) return null

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* backdrop */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(2px)',
            zIndex: 998,
          }}
          onClick={onClose}
        />
      )}

      {/* sliding drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '320px',
          backgroundColor: 'var(--color-card)',
          boxShadow: '0px 0px 14px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Filters</h2>

          <div
            onClick={onClose}
            className="cursor-pointer hover:opacity-80 p-[4px] transition"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            <MdOutlineArrowForwardIos size={18} />
          </div>
        </div>

        {/* content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <div style={{ height: '100%', padding: '20px' }}>
            <TableFilters filters={filters} fullHeight isDrawer />
          </div>
        </div>
      </div>
    </>
  )
}
