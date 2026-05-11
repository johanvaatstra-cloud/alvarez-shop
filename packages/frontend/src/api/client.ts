import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let failedQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  failedQueue = []
}

// URLs that should never trigger a token refresh attempt
const NO_RETRY_URLS = ['/auth/refresh', '/auth/login', '/auth/me']

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const url: string = original?.url ?? ''

    // Skip retry for auth endpoints and already-retried requests
    if (err.response?.status !== 401 || original._retry || NO_RETRY_URLS.some((u) => url.includes(u))) {
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: () => resolve(apiClient(original)), reject })
      })
    }

    original._retry = true
    isRefreshing = true
    try {
      await apiClient.post('/auth/refresh')
      processQueue(null)
      return apiClient(original)
    } catch (refreshErr) {
      processQueue(refreshErr)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient
