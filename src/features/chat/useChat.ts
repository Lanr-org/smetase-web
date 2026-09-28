import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '../../lib/api/portalApi.js'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { Chat, ChatMessage } from '../../lib/api/types.js'

// Advisor replies arrive by polling (no realtime push to students yet).
const POLL_MS = 5000
const SEND_KEY = ['sendMessage']

// Paused while sending, so a poll can't wipe the optimistic message before the reply lands.
export const useMessages = () => {
  const sending = useIsMutating({ mutationKey: SEND_KEY }) > 0
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: studentApi.getMessages,
    refetchInterval: sending ? false : POLL_MS,
  })
}

// A poll may already have brought some of these in.
const mergeById = (old: ChatMessage[], incoming: ChatMessage[]) => {
  const seen = new Set(old.map((m) => m.id))
  return [...old, ...incoming.filter((m) => !seen.has(m.id))]
}

const updateMessages = (chat: Chat | undefined, change: (messages: ChatMessage[]) => ChatMessage[]): Chat => ({
  messages: change(chat?.messages ?? []),
  advisorHandling: chat?.advisorHandling ?? false,
})

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: SEND_KEY,
    mutationFn: studentApi.sendMessage,
    // Show the student's message straight away; the server's copy replaces it.
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.messages })
      const pending: ChatMessage = {
        id: `pending-${Date.now()}`,
        senderType: 'STUDENT',
        senderName: null,
        content,
        channel: 'WEB',
        createdAt: new Date().toISOString(),
        quickReplies: [],
      }
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) => updateMessages(old, (m) => [...m, pending]))
      return { pendingId: pending.id }
    },
    onSuccess: (newMessages, _content, result) => {
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) =>
        updateMessages(old, (m) => mergeById(m.filter((x) => x.id !== result?.pendingId), newMessages)),
      )
    },
    onError: (_error, _content, result) => {
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) =>
        updateMessages(old, (m) => m.filter((x) => x.id !== result?.pendingId)),
      )
    },
  })
}

// Onboarding answers fill the profile and can move the journey and matches on.
export const useSaveAnswer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: portalApi.updateProfile,
    onSuccess: (me) => {
      queryClient.setQueryData(queryKeys.me, me)
      for (const queryKey of [queryKeys.journey, queryKeys.matches]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
