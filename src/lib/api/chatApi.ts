import { api } from './client.js'
import type { ApiSuccess, Chat, ChatMessage } from './types.js'

// The real AI + advisor chat (Stage 4), shared with Telegram on the backend.

type ServerMessage = Omit<ChatMessage, 'quickReplies'>

const withNoReplies = (message: ServerMessage): ChatMessage => ({ ...message, quickReplies: [] })

export const chatApi = {
  getMessages: async (): Promise<Chat> => {
    const chat = (
      await api.get<ApiSuccess<{ messages: ServerMessage[]; advisorHandling: boolean; awaitingReply: boolean }>>(
        '/student/messages',
      )
    ).data.data
    return { ...chat, messages: chat.messages.map(withNoReplies) }
  },

  // The student's saved message. The AI reply is queued and arrives on a later getMessages.
  sendMessage: async (content: string): Promise<ChatMessage[]> =>
    (await api.post<ApiSuccess<{ messages: ServerMessage[] }>>('/student/messages', { content })).data.data.messages.map(
      withNoReplies,
    ),
}
