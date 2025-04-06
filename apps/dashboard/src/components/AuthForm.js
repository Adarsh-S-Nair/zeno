import './AuthForm.css'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AuthForm({ isLogin, setIsLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const navigate = useNavigate()

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  useEffect(() => {
    if (!email || !password || !isValidEmail(email)) {
      setIsFormValid(false)
    } else {
      setIsFormValid(true)
    }
  }, [email, password])

  const handleAuth = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setErrorMessage(error.message)
      } else if (data.session) {
        navigate('/dashboard')
      } else {
        setErrorMessage('Login successful, but no session found.')
      }

    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:3000/dashboard'
        }
      })

      if (error) {
        setErrorMessage(error.message)
      } else if (!data.user) {
        setErrorMessage('Check your email to confirm your account before logging in.')
      } else {
        alert('Account created! Please confirm your email.')
      }
    }
  }

  return (
    <div className="auth-form">
      <form className="form-box" onSubmit={handleAuth}>
        <h2>{isLogin ? 'Login' : 'Create an Account'}</h2>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <button type="submit" disabled={!isFormValid} className={!isFormValid ? 'disabled' : ''}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <p onClick={() => {
          setIsLogin(!isLogin)
          setErrorMessage('')
        }}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </p>
      </form>
    </div>
  )
}
