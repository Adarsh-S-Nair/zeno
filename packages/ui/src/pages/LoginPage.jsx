import '../styles/LoginPage.css'
import AuthForm from '../components/AuthForm'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ supabase }) {
  const [isLogin, setIsLogin] = useState(true)

  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
  const checkSession = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      navigate('/dashboard')
    } else {
      setCheckingSession(false)
    }
  }

checkSession()
}, [])

  return (
    <div className="auth-page">
      <div className="auth-left">
        <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} />
      </div>
      <div className="auth-right">
        <div className="content-wrapper">
            <h1>Welcome</h1>
            <p>Manage your inventory smarter, faster, and more effortlessly.</p>
        </div>
      </div>
    </div>
  )
}
