import { api } from './client.js'
import type { ApiSuccess, LinkOutcome, StudentSummary } from './types.js'

type SignInResult = {
  accessToken: string
  student: StudentSummary
  isNewStudent: boolean
  // Only when a link token (from the bot's /plan link) was sent.
  linkOutcome?: LinkOutcome
}

export const authApi = {
  signInWithGoogle: async (credential: string, linkToken?: string) =>
    (
      await api.post<ApiSuccess<SignInResult>>('/student/auth/google', {
        credential,
        ...(linkToken && { linkToken }),
      })
    ).data.data,

  logout: async () => {
    await api.post('/student/auth/logout')
  },
}
