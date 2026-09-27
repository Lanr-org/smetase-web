import { api } from './client.js'
import type { ApiSuccess, StudentSummary } from './types.js'

type SignInResult = { accessToken: string; student: StudentSummary; isNewStudent: boolean }

export const authApi = {
  signInWithGoogle: async (credential: string) =>
    (await api.post<ApiSuccess<SignInResult>>('/student/auth/google', { credential })).data.data,

  logout: async () => {
    await api.post('/student/auth/logout')
  },
}
