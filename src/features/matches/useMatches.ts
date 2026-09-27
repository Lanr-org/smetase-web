import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'
import type { ProgrammeMatch } from '../../lib/api/types.js'

export const useMatches = () => useQuery({ queryKey: queryKeys.matches, queryFn: studentApi.getMatches })

export const useSetShortlisted = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ programmeId, shortlisted }: { programmeId: string; shortlisted: boolean }) =>
      studentApi.setShortlisted(programmeId, shortlisted),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProgrammeMatch[]>(queryKeys.matches, (old) =>
        old?.map((p) => (p.programmeId === updated.programmeId ? updated : p)),
      )
      // Removing the chosen programme clears the choice, so the journey and study plan change too.
      for (const queryKey of [queryKeys.journey, queryKeys.matches, queryKeys.studyPlan]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}

export const useChooseProgramme = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.chooseProgramme,
    onSuccess: (journey) => {
      queryClient.setQueryData(queryKeys.journey, journey)
      for (const queryKey of [queryKeys.matches, queryKeys.studyPlan]) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
