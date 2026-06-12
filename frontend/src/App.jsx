import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { catalogApi } from './utils/api'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import ListingsPage from './pages/ListingsPage'
import NewListingPage from './pages/NewListingPage'
import SearchPage from './pages/SearchPage'
import ListingDetailPage from './pages/ListingDetailPage'
import PostChoicePage from './pages/PostChoicePage'
import MyListingsPage from './pages/MyListingsPage'

export const AppContext = React.createContext({})

export default function App() {
  const [categories, setCategories] = useState([])
  const [oblasts, setOblasts]       = useState([])
  const [districts, setDistricts]   = useState([])

  useEffect(() => {
    catalogApi.getCategories().then(r => setCategories(r.data)).catch(() => {})
    catalogApi.getOblasts().then(r => setOblasts(r.data)).catch(() => {})
    catalogApi.getDistricts().then(r => setDistricts(r.data)).catch(() => {})
  }, [])

  return (
    <AuthProvider>
    <AppContext.Provider value={{ categories, oblasts, districts }}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/catalog"       element={<CatalogPage />} />
          <Route path="/search"        element={<SearchPage />} />
          <Route path="/listings"        element={<ListingsPage />} />
          <Route path="/post"           element={<PostChoicePage />} />
          <Route path="/listings/new"  element={<NewListingPage />} />
          <Route path="/listings/:id"  element={<ListingDetailPage />} />
          <Route path="/register"      element={<RegisterPage />} />
          <Route path="/my-listings"   element={<MyListingsPage />} />
        </Route>
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </AppContext.Provider>
    </AuthProvider>
  )
}
