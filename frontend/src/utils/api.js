import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kabarman_admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const catalogApi = {
  getProviders:         (params)   => api.get('/providers', { params }),
  getCategories:        ()         => api.get('/categories'),
  getOblasts:           ()         => api.get('/oblasts'),
  getDistricts:         ()         => api.get('/districts'),
  getDistrictsByOblast: (oblastId) => api.get(`/districts?oblast_id=${oblastId}`),
  register:             (data)     => api.post('/providers', data)
}

export const listingsApi = {
  getAll:       (params)    => api.get('/listings', { params }),
  getOne:       (id)        => api.get(`/listings/${id}`),
  getCategories:()          => api.get('/listings/categories'),
  create:       (data)      => api.post('/listings', data),
  uploadPhotos: (formData)  => api.post('/listings/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const adminApi = {
  login:       (data)  => api.post('/admin/login', data),
  getStats:    ()      => api.get('/admin/stats'),
  getPending:  ()      => api.get('/admin/pending'),
  approve:     (id)    => api.patch(`/providers/${id}/approve`),
  reject:      (id)    => api.patch(`/providers/${id}/reject`),
  delete:      (id)    => api.delete(`/providers/${id}`)
}

export const reportApi = {
  send: (type, id) => api.post('/report', { type, id })
}

export default api
