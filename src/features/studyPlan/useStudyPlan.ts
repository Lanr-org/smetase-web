import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { publicApi } from '../../lib/api/publicApi.js'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'

export const useStudyPlan = () => useQuery({ queryKey: queryKeys.studyPlan, queryFn: studentApi.getStudyPlan })

// Creating a link counts as sharing, which can move the journey on.
export const useCreateStudyPlanLink = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.createStudyPlanLink,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.journey }),
  })
}

export const useRevokeStudyPlanLinks = () => useMutation({ mutationFn: studentApi.revokeStudyPlanLinks })

// The public page: no retries on a dead link, it won't come back.
export const usePublicStudyPlan = (token: string) =>
  useQuery({
    queryKey: ['public-study-plan', token],
    queryFn: () => publicApi.getStudyPlan(token),
    retry: false,
  })
