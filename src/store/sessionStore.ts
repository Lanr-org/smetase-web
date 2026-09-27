import { create } from 'zustand'
import type { StudentSummary } from '../lib/api/types.js'

// 'checking' = on page load, while we ask the backend whether the refresh cookie is still good.
type SessionStatus = 'checking' | 'signedIn' | 'signedOut'

type SessionState = {
  status: SessionStatus
  // In memory only. On reload the httpOnly refresh cookie gets a new one; never localStorage.
  accessToken: string | null
  student: StudentSummary | null
  setSession: (accessToken: string, student: StudentSummary) => void
  clear: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'checking',
  accessToken: null,
  student: null,
  setSession: (accessToken, student) => set({ status: 'signedIn', accessToken, student }),
  clear: () => set({ status: 'signedOut', accessToken: null, student: null }),
}))
