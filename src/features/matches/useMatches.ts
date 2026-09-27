import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { ProgrammeMatch } from '../../lib/api/types.js'

export const useMatches = () => useQuery({ queryKey: queryKeys.matches, queryFn: studentApi.getMatches })

export const useToggleShortlist = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.toggleShortlist,
    onSuccess: (updated) => {
      queryClient.setQueryData<ProgrammeMatch[]>(queryKeys.matches, (old) =>
        old?.map((p) => (p.programmeId === updated.programmeId ? updated : p)),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.journey })
    },
  })
}

export const useChooseProgramme = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.chooseProgramme,
    onSuccess: (journey) => {
      queryClient.setQueryData(queryKeys.journey, journey)
      for (const queryKey of [queryKeys.matches, queryKeys.messages, queryKeys.parentPack]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
