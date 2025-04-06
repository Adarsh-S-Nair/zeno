import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './MainLayout.css'

function MainLayout({ business }) {
  return (
    <div className="main-layout">
      <Sidebar business={business} />
      <div className="main-content">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
