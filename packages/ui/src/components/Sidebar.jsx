import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUser } from "react-icons/fa"
import { TiThMenu } from "react-icons/ti"
import { MdLogout } from "react-icons/md"
import '../styles/Sidebar.css'

export default function Sidebar({ navItems = [], supabase, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    if (onLogout) onLogout()
    else navigate('/')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
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
            className={`sidebar-link ${
              location.pathname === item.path ? 'active' : ''
            }`}
            onClick={() => navigate(item.path)}
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
    </div>
  )
}

