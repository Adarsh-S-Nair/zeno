import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUser } from 'react-icons/fa'
import { TiThMenu } from 'react-icons/ti'
import { MdLogout } from 'react-icons/md'
import '../styles/Sidebar.css'

export default function Sidebar({ navItems = [], supabase, onLogout, isMobile }) {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    onLogout ? onLogout() : navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <>
      {/* mobile top bar */}
      {isMobile && (
        <div className="mobile-topbar">
          <button className="toggle-btn" onClick={() => setIsOpen(true)}>
            <TiThMenu size={20} />
          </button>
        </div>
      )}

      {/* backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* sidebar drawer for both desktop & mobile */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'drawer' : ''}`}
        style={{ zIndex: 999 }}
      >
        <div className="sidebar-header">
          {isOpen && (
            <div className="sidebar-user">
              <div className="user-avatar">
                <FaUser size={20} />
              </div>
            </div>
          )}
          <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            <TiThMenu size={20} />
          </button>
        </div>

        <div className="sidebar-nav">
          {navItems.map((item, i) => (
            <div
              key={i}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path)
                setIsOpen(false) // close on nav
              }}
              data-label={item.label}
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-link logout" onClick={handleLogout}>
            <MdLogout size={20} />
            {isOpen && <span>Log Out</span>}
          </div>
        </div>
      </aside>
    </>
  )
}
