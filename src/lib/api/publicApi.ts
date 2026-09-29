import axios from 'axios'
import type { ApiSuccess, PublicStudyPlan } from './types.js'

// No session: pages anyone with a link can open (a parent reading a shared study plan).
// Its own client, so it never sends the student's token or tries to refresh a session.
const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL })

export const publicApi = {
  getStudyPlan: async (token: string) =>
    (await publicClient.get<ApiSuccess<PublicStudyPlan>>(`/public/study-plans/${encodeURIComponent(token)}`)).data
      .data,
}
