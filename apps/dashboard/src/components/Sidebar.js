import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FaUser } from "react-icons/fa"
import { TiThMenu } from "react-icons/ti"
import { TbLayoutDashboardFilled } from "react-icons/tb"
import { MdBusinessCenter, MdInventory, MdSettings, MdLogout } from "react-icons/md"
import './Sidebar.css'

export default function Sidebar({ business }) {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: <TbLayoutDashboardFilled size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <MdBusinessCenter size={20} />, label: 'Business', path: '/business' },
    business && {
      icon: <MdInventory size={20} />,
      label: 'Inventory',
      path: '/inventory',
    },
    { icon: <MdSettings size={20} />, label: 'Settings', path: '/settings' },
  ].filter(Boolean)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
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
