import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@zeno/ui'
import './MainLayout.css'
import { TbLayoutDashboardFilled } from "react-icons/tb"
import { MdBusinessCenter, MdInventory, MdSettings, MdLogout } from "react-icons/md"

function MainLayout({ business, supabase }) {
  const navItems = [
    { icon: <TbLayoutDashboardFilled size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <MdBusinessCenter size={20} />, label: 'Business', path: '/business' },
    business && { icon: <MdInventory size={20} />, label: 'Inventory', path: '/inventory' },
    { icon: <MdSettings size={20} />, label: 'Settings', path: '/settings' },
  ].filter(Boolean)

  return (
    <div className="main-layout">
      <Sidebar
        navItems={navItems}
        supabase={supabase}
        onLogout={() => navigate('/')}
      />
      <div className="main-content">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
