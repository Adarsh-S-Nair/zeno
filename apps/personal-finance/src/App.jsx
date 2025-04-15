import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@zeno/core';
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import { LoginPage } from '@zeno/ui'

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage supabase={supabase} />} />
        <Route element={
          <ProtectedRoute>
            <MainLayout user={user} supabase={supabase} isMobile={isMobile} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard isMobile={isMobile} />} />
          <Route path="/accounts" element={<Accounts isMobile={isMobile} />} />
          <Route path="/transactions" element={<Transactions isMobile={isMobile} setIsMobile={setIsMobile}/>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
