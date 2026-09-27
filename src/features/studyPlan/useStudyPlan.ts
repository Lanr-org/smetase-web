import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'

export const useStudyPlan = () => useQuery({ queryKey: queryKeys.studyPlan, queryFn: studentApi.getStudyPlan })

export const useMarkStudyPlanShared = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.markStudyPlanShared,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.journey }),
  })
}
