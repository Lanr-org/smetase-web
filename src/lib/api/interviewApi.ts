import { api } from './client.js'
import type { InterviewSession, InterviewTurn, InterviewType } from './interviewTypes.js'
import type { ApiSuccess } from './types.js'

const BASE = '/student/interview-sessions'

export const interviewApi = {
  // null when no interview is in progress.
  getActiveInterview: async () => (await api.get<ApiSuccess<InterviewSession | null>>(`${BASE}/active`)).data.data,

  getInterview: async (sessionId: string) =>
    (await api.get<ApiSuccess<InterviewSession>>(`${BASE}/${sessionId}`)).data.data,

  listInterviews: async () => (await api.get<ApiSuccess<InterviewSession[]>>(BASE)).data.data,

  startInterview: async (type: InterviewType) =>
    (await api.post<ApiSuccess<InterviewTurn>>(BASE, { type })).data.data,

  // Each answer is graded by the AI, so this can take several seconds.
  submitInterviewAnswer: async (sessionId: string, answer: string) =>
    (await api.post<ApiSuccess<InterviewTurn>>(`${BASE}/${sessionId}/answers`, { answer })).data.data,

  abandonInterview: async (sessionId: string) => {
    await api.post(`${BASE}/${sessionId}/abandon`)
  },
}
