import { isAxiosError } from 'axios'

// The backend's error message when there is one, otherwise the given fallback.
export const apiErrorMessage = (err: unknown, fallback: string) =>
  isAxiosError<{ error?: { message?: string } }>(err) ? (err.response?.data?.error?.message ?? fallback) : fallback
