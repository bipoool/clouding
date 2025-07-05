import axios, { AxiosError } from 'axios'
import { getErrorMessage } from '@/lib/utils'

/**
 * Pre-configured Axios instance used across the client-side codebase.
 * – Adds a `/api` baseURL so hooks can use concise endpoints like `/credentials`.
 * – Sets `withCredentials` to true so Supabase (or any auth cookies) are sent automatically.
 * – Intercepts every response to
 *   • unwrap `response.data` so callers receive payload directly
 *   • normalise errors into `Error` instances with a friendly message
 */
export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

httpClient.interceptors.response.use(
  (response: any) => response.data,
  (error: AxiosError) => {
    // Convert AxiosError → Error with readable message
    return Promise.reject(
      new Error(
        getErrorMessage(
          (error.response?.data as any)?.message ?? error.message ?? 'Unexpected error'
        )
      )
    )
  }
) 