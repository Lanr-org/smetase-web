import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '../../lib/api/portalApi.js'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { Chat, ChatMessage } from '../../lib/api/types.js'

// AI and advisor replies arrive by polling (no realtime push to students yet).
const POLL_MS = 5000
// Faster while the AI is writing a reply, so it shows up soon after it's ready.
const AWAITING_POLL_MS = 2000
const SEND_KEY = ['sendMessage']

// Paused while sending, so a poll can't wipe the optimistic message before the server's copy lands.
export const useMessages = () => {
  const sending = useIsMutating({ mutationKey: SEND_KEY }) > 0
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: studentApi.getMessages,
    refetchInterval: (query) => (sending ? false : query.state.data?.awaitingReply ? AWAITING_POLL_MS : POLL_MS),
  })
}

// A poll may already have brought some of these in.
const mergeById = (old: ChatMessage[], incoming: ChatMessage[]) => {
  const seen = new Set(old.map((m) => m.id))
  return [...old, ...incoming.filter((m) => !seen.has(m.id))]
}

const updateMessages = (
  chat: Chat | undefined,
  change: (messages: ChatMessage[]) => ChatMessage[],
  awaitingReply = chat?.awaitingReply ?? false,
): Chat => ({
  messages: change(chat?.messages ?? []),
  advisorHandling: chat?.advisorHandling ?? false,
  advisorRequested: chat?.advisorRequested ?? false,
  awaitingReply,
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
      // The AI reply is queued: show "typing" (and poll faster) until it arrives,
      // unless an advisor is handling the chat.
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) =>
        updateMessages(
          old,
          (m) => mergeById(m.filter((x) => x.id !== result?.pendingId), newMessages),
          !(old?.advisorHandling ?? false),
        ),
      )
    },
    onError: (_error, _content, result) => {
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) =>
        updateMessages(old, (m) => m.filter((x) => x.id !== result?.pendingId)),
      )
    },
  })
}

export const useRequestAdvisor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.requestAdvisor,
    onSuccess: () => {
      queryClient.setQueryData<Chat>(queryKeys.messages, (old) =>
        old ? { ...old, advisorRequested: true } : old,
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages })
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
