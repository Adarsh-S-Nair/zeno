import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@zeno/ui'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import MainLayout from './layout/MainLayout'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import ProtectedRouteWithBusiness from './components/ProtectedRouteWithBusiness'

function App() {
  const [theme, setTheme] = useState('dark')
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchBusiness = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
  
    if (error || !user) return
  
    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()
  
    if (fetchError) {
      console.error('Error fetching business:', fetchError)
      return
    }
  
    setBusiness(data)
    setLoading(false)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    fetchBusiness()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage supabase={supabase}/>} />
        <Route element={<MainLayout business={business} />}>
          <Route path="/dashboard"
            element={
              <Dashboard
                business={business}
                fetchBusiness={fetchBusiness}
                loading={loading}
              />
            }
          />
          <Route path="/inventory"
            element={
              <ProtectedRouteWithBusiness business={business}>
                <Inventory business={business} />
              </ProtectedRouteWithBusiness>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App