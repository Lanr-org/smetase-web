import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useSessionStore } from '../../store/sessionStore.js'
import type { ApiSuccess, StudentSummary } from './types.js'

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({ baseURL, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// One refresh in flight at a time: concurrent 401s (and StrictMode's double effects) share it.
let refreshPromise: Promise<string> | null = null

export const refreshSession = (): Promise<string> => {
  refreshPromise ??= axios
    .post<ApiSuccess<{ accessToken: string; student: StudentSummary }>>(
      `${baseURL}/student/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((res) => {
      const { accessToken, student } = res.data.data
      useSessionStore.getState().setSession(accessToken, student)
      return accessToken
    })
    .finally(() => {
      refreshPromise = null
    })
  return refreshPromise
}

// On a 401, refresh once and retry; if refresh fails, the session is over.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const isAuthCall = original?.url?.startsWith('/student/auth/')
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true
      try {
        const token = await refreshSession()
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        useSessionStore.getState().clear()
      }
    }
    return Promise.reject(error)
  },
)
