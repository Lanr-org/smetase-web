import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../lib/api/authApi.js'
import { refreshSession } from '../../lib/api/client.js'
import { useSessionStore } from '../../store/sessionStore.js'

export const useSession = () => {
  const status = useSessionStore((s) => s.status)
  const student = useSessionStore((s) => s.student)
  return { status, student, signedIn: status === 'signedIn' }
}

// Runs once at app start: a valid refresh cookie signs the student straight back in.
export const useBootstrapSession = () => {
  useEffect(() => {
    if (useSessionStore.getState().status !== 'checking') return
    refreshSession().catch(() => useSessionStore.getState().clear())
  }, [])
}

export const useSignOut = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return async () => {
    try {
      await authApi.logout()
    } finally {
      useSessionStore.getState().clear()
      queryClient.clear() // no cached data (chat included) carries over to the next person on this device
      navigate('/')
    }
  }
}
