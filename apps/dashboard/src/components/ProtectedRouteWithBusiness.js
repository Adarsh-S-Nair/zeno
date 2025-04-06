import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRouteWithBusiness({ business, children }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!business) {
      navigate('/dashboard', { replace: true })
    }
  }, [business, navigate])

  return business ? children : null
}
