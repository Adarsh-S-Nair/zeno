import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import './MainLayout.css'

export default function MainLayout({ business }) {
  return (
    <div className="main-layout">
      <Sidebar business={business} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}
