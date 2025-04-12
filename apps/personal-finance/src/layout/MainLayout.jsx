import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '@zeno/ui'
import PageWrapper from './PageWrapper'
import { TbLayoutDashboardFilled } from 'react-icons/tb'
import { MdPayments, MdAttachMoney, MdSettings } from 'react-icons/md'
import { BiSolidBank } from "react-icons/bi";


export default function MainLayout({ user, supabase }) {
    const navigate = useNavigate()
  
    const navItems = [
      { icon: <TbLayoutDashboardFilled size={20} />, label: 'Dashboard', path: '/dashboard' },
      { icon: <BiSolidBank size={20} />, label: 'Accounts', path: '/accounts' },
      { icon: <MdPayments size={20} />, label: 'Transactions', path: '/transactions' },
      { icon: <MdAttachMoney size={20} />, label: 'Budgets', path: '/budgets' },
      { icon: <MdSettings size={20} />, label: 'Settings', path: '/settings' },
    ]
  
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar component */}
        <Sidebar
          navItems={navItems}
          supabase={supabase}
          onLogout={() => navigate('/')}
        />
  
        {/* Main content area fills the rest */}
        <main className="w-full ml-[60px] h-full">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    )
  }