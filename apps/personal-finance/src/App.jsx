import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@zeno/core';
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts';
import { LoginPage } from '@zeno/ui'

function App() {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage supabase={supabase} />} />
        <Route element={
          <ProtectedRoute>
            <MainLayout user={user} supabase={supabase} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
