import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Подхватываем токен из URL после Google redirect
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const authError = params.get('auth')

    if (token) {
      localStorage.setItem('kabarman_token', token)
      // Убираем токен из URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (authError) {
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Загружаем пользователя
    const stored = localStorage.getItem('kabarman_token')
    if (stored) {
      fetchMe(stored)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchMe = async (token) => {
    try {
      const res = await fetch('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        localStorage.removeItem('kabarman_token')
      }
    } catch {
      localStorage.removeItem('kabarman_token')
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    window.location.href = '/auth/google'
  }

  const logout = () => {
    localStorage.removeItem('kabarman_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
