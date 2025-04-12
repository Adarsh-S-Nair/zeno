import { useEffect, useState } from 'react'
import { supabase } from '@zeno/core';
import { LoginPage } from '@zeno/ui'

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return <div className="p-6">loading...</div>
  if (!user) return <LoginPage supabase={supabase} />

  return children
}
