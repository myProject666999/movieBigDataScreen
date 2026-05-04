import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/user'),
}

export const statsApi = {
  getHomeStats: () => api.get('/stats/home'),
  getYearlyProduction: () => api.get('/stats/yearly-production'),
  getDurationDistribution: () => api.get('/stats/duration-distribution'),
  getRatingDistribution: () => api.get('/stats/rating-distribution'),
  getStarDistribution: () => api.get('/stats/star-distribution'),
  getYearlyRating: () => api.get('/stats/yearly-rating'),
  getCountryRating: () => api.get('/stats/country-rating'),
  getLocations: () => api.get('/stats/locations'),
  getLanguages: () => api.get('/stats/languages'),
  getTopDirectors: () => api.get('/stats/top-directors'),
  getTopActors: () => api.get('/stats/top-actors'),
}

export default api
