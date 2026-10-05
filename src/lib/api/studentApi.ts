import { chatApi } from './chatApi.js'
import { interviewApi } from './interviewApi.js'
import { portalApi } from './portalApi.js'

// Everything the app reads comes through here: profile, journey, matches and the study plan
// (Stage 3), the chat (Stage 4) and mock interviews.
export const studentApi = {
  ...portalApi,
  ...chatApi,
  ...interviewApi,
}
