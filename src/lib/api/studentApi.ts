import { mockBackend } from './mock.js'
import type { ChatMessage, Journey, ParentPack, ProgrammeMatch, StudentMe } from './types.js'

export type StudentApi = {
  getMe: () => Promise<StudentMe>
  getJourney: () => Promise<Journey>
  getMatches: () => Promise<ProgrammeMatch[]>
  toggleShortlist: (programmeId: string) => Promise<ProgrammeMatch>
  chooseProgramme: (programmeId: string) => Promise<Journey>
  getMessages: () => Promise<ChatMessage[]>
  // Returns the new messages: yours plus the reply.
  sendMessage: (content: string) => Promise<ChatMessage[]>
  // null until a programme is chosen.
  getParentPack: () => Promise<ParentPack | null>
  // Called when the student copies or shares the Parent Pack link ("Parent Packs shared" metric).
  markParentPackShared: () => Promise<void>
}

// Stage 1: everything is mocked. Stages 3–4 swap these bodies for HTTP calls.
export const studentApi: StudentApi = mockBackend

// Lets the UI label demo data so screenshots are never mistaken for real schools.
export const IS_MOCK = true
