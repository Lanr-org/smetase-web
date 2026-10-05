import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { InterviewType } from '../../lib/api/interviewTypes.js'

export const useActiveInterview = () =>
  useQuery({ queryKey: queryKeys.activeInterview, queryFn: studentApi.getActiveInterview })

export const useInterviewList = () => useQuery({ queryKey: queryKeys.interviews, queryFn: studentApi.listInterviews })

export const useInterview = (sessionId: string | null) =>
  useQuery({
    queryKey: queryKeys.interview(sessionId ?? 'none'),
    queryFn: () => studentApi.getInterview(sessionId as string),
    enabled: sessionId !== null,
  })

export const useStartInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (type: InterviewType) => studentApi.startInterview(type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeInterview })
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviews })
    },
    // A 409 means one is already running (e.g. started on Telegram): refetch so the page picks it up.
    onError: () => void queryClient.invalidateQueries({ queryKey: queryKeys.activeInterview }),
  })
}

export const useSubmitAnswer = (sessionId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (answer: string) => studentApi.submitInterviewAnswer(sessionId, answer),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.interview(sessionId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.activeInterview })
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviews })
    },
  })
}

export const useAbandonInterview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => studentApi.abandonInterview(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.setQueryData(queryKeys.activeInterview, null)
      void queryClient.invalidateQueries({ queryKey: queryKeys.interview(sessionId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.interviews })
    },
  })
}
