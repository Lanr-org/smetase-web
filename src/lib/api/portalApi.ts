import { api } from './client.js'
import type {
  ApiSuccess,
  IntakeMonth,
  Journey,
  JourneyCheckKey,
  ProgrammeMatch,
  StudentMe,
  StudyPlan,
  StudyPlanShareLink,
} from './types.js'

// The student's own data from /api/v1/student (real since Stage 3).

const get = async <T>(url: string) => (await api.get<ApiSuccess<T>>(url)).data.data

// Codes match what the Telegram bot writes (e.g. MASTERS, UK), so both channels match the same way.
export type ProfileUpdate = {
  studyLevel?: string
  destinations?: string[]
  intake?: { month: IntakeMonth; year: number }
  budgetRange?: string
  academicBackground?: string
  englishTest?: string
}

export const portalApi = {
  getMe: () => get<StudentMe>('/student/me'),

  updateProfile: async (update: ProfileUpdate) =>
    (await api.patch<ApiSuccess<StudentMe>>('/student/me/profile', update)).data.data,

  getJourney: () => get<Journey>('/student/journey'),

  getMatches: () => get<ProgrammeMatch[]>('/student/matches'),

  setShortlisted: async (programmeId: string, shortlisted: boolean) => {
    const url = `/student/shortlist/${encodeURIComponent(programmeId)}`
    const res = shortlisted
      ? await api.post<ApiSuccess<ProgrammeMatch>>(url)
      : await api.delete<ApiSuccess<ProgrammeMatch>>(url)
    return res.data.data
  },

  chooseProgramme: async (programmeId: string) =>
    (await api.post<ApiSuccess<Journey>>('/student/choice', { programId: programmeId })).data.data,

  // null until a programme is chosen.
  getStudyPlan: () => get<StudyPlan | null>('/student/study-plan'),

  // A one-time t.me link; opening it and tapping Start links that Telegram account to this one.
  createTelegramLink: async () =>
    (await api.post<ApiSuccess<{ url: string; expiresAt: string }>>('/student/telegram-link')).data.data,

  // Ticks (done = true) or unticks a step the system can't detect; returns the updated journey.
  setJourneyCheck: async (key: JourneyCheckKey, done: boolean) => {
    const url = `/student/journey/checks/${key}`
    const res = done ? await api.put<ApiSuccess<Journey>>(url) : await api.delete<ApiSuccess<Journey>>(url)
    return res.data.data
  },

  // A new read-only link parents can open without signing in (also records the share).
  createStudyPlanLink: async () =>
    (await api.post<ApiSuccess<StudyPlanShareLink>>('/student/study-plan/link')).data.data,

  // Stops every link shared so far from working.
  revokeStudyPlanLinks: async () => {
    await api.delete('/student/study-plan/link')
  },
}
