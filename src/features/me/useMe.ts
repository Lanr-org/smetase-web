import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'

export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: studentApi.getMe })
