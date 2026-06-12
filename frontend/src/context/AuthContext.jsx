import { createContext, useContext, useEffect, useState } from 'react'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'

const AuthContext = createContext(null)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function AuthProviderInner({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginCallback, setLoginCallback] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('kabarman_token')
    if (stored) {
      fetchMe(stored)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async (token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setUser(await res.json())
      } else {
        localStorage.removeItem('kabarman_token')
      }
    } catch {
      localStorage.removeItem('kabarman_token')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${apiUrl}/auth/google-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token })
      })
      if (!res.ok) throw new Error('Auth failed')
      const data = await res.json()
      localStorage.setItem('kabarman_token', data.token)
      setUser(data.user)
      if (loginCallback) {
        loginCallback()
        setLoginCallback(null)
      }
    } catch (err) {
      console.error('Google auth error:', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('kabarman_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, handleGoogleSuccess, setLoginCallback }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <AuthContext.Provider value={{ user: null, loading: false, logout: () => {}, handleGoogleSuccess: () => {}, setLoginCallback: () => {} }}>
        {children}
      </AuthContext.Provider>
    )
  }
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </GoogleOAuthProvider>
  )
}

export const useAuth = () => useContext(AuthContext)
