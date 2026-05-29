import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { catalogApi } from './utils/api'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'

export const AppContext = React.createContext({})

export default function App() {
  const [categories, setCategories] = useState([])
  const [districts, setDistricts]   = useState([])

  useEffect(() => {
    catalogApi.getCategories().then(r => setCategories(r.data)).catch(() => {})
    catalogApi.getDistricts().then(r => setDistricts(r.data)).catch(() => {})
  }, [])

  return (
    <AppContext.Provider value={{ categories, districts }}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/catalog"   element={<CatalogPage />} />
          <Route path="/register"  element={<RegisterPage />} />
        </Route>
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </AppContext.Provider>
  )
}
