import { chatApi } from './chatApi.js'
import { portalApi } from './portalApi.js'

// Everything the app reads comes through here: profile, journey, matches and the study plan
// (Stage 3), and the chat (Stage 4).
export const studentApi = {
  ...portalApi,
  ...chatApi,
}
