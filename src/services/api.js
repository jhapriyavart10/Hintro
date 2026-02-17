import axios from 'axios'

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. Add Interceptors (Automatically attach Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout if token is invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 3. Attach Helper Methods (The "Hybrid" Part)
// This ensures api.getBoard() works AND api.get() works

// --- Boards ---
api.getBoards = () => api.get('/boards')
api.getBoard = (id) => api.get(`/boards/${id}`)
api.createBoard = (data) => api.post('/boards', data)
api.updateBoard = (id, data) => api.patch(`/boards/${id}`, data)
api.deleteBoard = (id) => api.delete(`/boards/${id}`)

// --- Lists ---
api.createList = (data) => api.post('/lists', data)
api.updateList = (id, data) => api.patch(`/lists/${id}`, data)
api.deleteList = (id) => api.delete(`/lists/${id}`)

// --- Tasks ---
api.createTask = (data) => api.post('/tasks', data)
api.updateTask = (id, data) => api.patch(`/tasks/${id}`, data)
api.moveTask = (id, data) => api.patch(`/tasks/${id}/move`, data)
api.deleteTask = (id) => api.delete(`/tasks/${id}`)

// --- Auth ---
api.login = (data) => api.post('/auth/login', data)
api.register = (data) => api.post('/auth/register', data)

export default api