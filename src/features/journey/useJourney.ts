import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/api/queryKeys.js'
import { studentApi } from '../../lib/api/studentApi.js'

export const useJourney = () => useQuery({ queryKey: queryKeys.journey, queryFn: studentApi.getJourney })
