import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '@zeno/ui'
import PageWrapper from './PageWrapper'
import { TbLayoutDashboardFilled } from 'react-icons/tb'
import { MdPayments, MdAttachMoney, MdSettings } from 'react-icons/md'
import { BiSolidBank } from "react-icons/bi";


export default function MainLayout({ user, supabase, isMobile }) {
  const navigate = useNavigate()

  const navItems = [
    { icon: <TbLayoutDashboardFilled size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <BiSolidBank size={20} />, label: 'Accounts', path: '/accounts' },
    { icon: <MdPayments size={20} />, label: 'Transactions', path: '/transactions' },
    { icon: <MdAttachMoney size={20} />, label: 'Budgets', path: '/budgets' },
    { icon: <MdSettings size={20} />, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="flex h-screen overflow-auto">
      <Sidebar
        navItems={navItems}
        supabase={supabase}
        onLogout={() => navigate('/')}
        isMobile={isMobile}
      />

      <main className={`w-full ${!isMobile ? 'ml-[60px]' : 'mt-[30px]'} h-full`}>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </main>
    </div>
  )
}
