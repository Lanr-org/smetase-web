import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'

export const useParentPack = () =>
  useQuery({ queryKey: queryKeys.parentPack, queryFn: studentApi.getParentPack })

export const useMarkParentPackShared = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: studentApi.markParentPackShared,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.journey }),
  })
}
