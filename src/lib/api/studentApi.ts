import { mockChat } from './mockChat.js'
import { portalApi } from './portalApi.js'

// Everything the app reads comes through here. Profile, journey, matches and the study plan
// are real (Stage 3); chat messages are scripted until Stage 4 swaps in the real chat.
export const studentApi = {
  ...portalApi,
  getMessages: mockChat.getMessages,
  sendMessage: mockChat.sendMessage,
}

// Lets the chat label itself as scripted until Stage 4.
export const IS_SCRIPTED_CHAT = true
