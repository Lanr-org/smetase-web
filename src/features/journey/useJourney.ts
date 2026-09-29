import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { Journey, JourneyCheckKey } from '../../lib/api/types.js'

export const useJourney = () => useQuery({ queryKey: queryKeys.journey, queryFn: studentApi.getJourney })

// Ticks show at once; the server's journey (which may move the current stage) replaces them.
export const useSetJourneyCheck = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, done }: { key: JourneyCheckKey; done: boolean }) => studentApi.setJourneyCheck(key, done),
    onMutate: async ({ key, done }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.journey })
      const previous = queryClient.getQueryData<Journey>(queryKeys.journey)
      if (previous) {
        queryClient.setQueryData<Journey>(queryKeys.journey, {
          ...previous,
          stages: previous.stages.map((stage) => ({
            ...stage,
            checklist: stage.checklist.map((item) => (item.checkKey === key ? { ...item, done } : item)),
          })),
        })
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.journey, context.previous)
    },
    onSuccess: (journey) => queryClient.setQueryData(queryKeys.journey, journey),
  })
}
