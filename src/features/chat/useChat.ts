import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { ChatMessage } from '../../lib/api/types.js'

export const useMessages = () => useQuery({ queryKey: queryKeys.messages, queryFn: studentApi.getMessages })

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.sendMessage,
    // Show the student's message straight away; the server's copy replaces it.
    onMutate: (content) => {
      const pending: ChatMessage = {
        id: `pending-${Date.now()}`,
        senderType: 'STUDENT',
        senderName: null,
        content,
        createdAt: new Date().toISOString(),
        quickReplies: [],
      }
      queryClient.setQueryData<ChatMessage[]>(queryKeys.messages, (old = []) => [...old, pending])
      return { pendingId: pending.id }
    },
    onSuccess: (newMessages, _content, result) => {
      queryClient.setQueryData<ChatMessage[]>(queryKeys.messages, (old = []) => [
        ...old.filter((m) => m.id !== result?.pendingId),
        ...newMessages,
      ])
      // Chat answers can fill the profile and move the journey on.
      for (const queryKey of [queryKeys.me, queryKeys.journey, queryKeys.matches]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (_error, _content, result) => {
      queryClient.setQueryData<ChatMessage[]>(queryKeys.messages, (old = []) =>
        old.filter((m) => m.id !== result?.pendingId),
      )
    },
  })
}
