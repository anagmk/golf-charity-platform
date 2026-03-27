import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)

export const getScores = () => API.get('/scores')
export const addScore = (data) => API.post('/scores', data)

export const getSubscription = () => API.get('/subscriptions')
export const createSubscription = (data) => API.post('/subscriptions', data)
export const cancelSubscription = () => API.put('/subscriptions/cancel')

export const getDrawResults = () => API.get('/draws/results')
export const getMyResults = () => API.get('/draws/my-results')
export const runDraw = () => API.post('/draws/run')

export const getAdminStats = () => API.get('/admin/stats')
export const getAdminUsers = () => API.get('/admin/users')
export const getAdminSubscriptions = () => API.get('/admin/subscriptions')
export const getAdminDraws = () => API.get('/admin/draws')