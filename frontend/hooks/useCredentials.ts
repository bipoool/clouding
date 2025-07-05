import { useState, useCallback, useEffect } from 'react'
import type { Credential } from '@/app/api/types'
import { getErrorMessage } from '@/lib/utils'
import { httpClient } from '@/lib/http-client'

export interface CredentialsHookReturn {
  credentials: Credential[]
  isLoading: boolean
  error: string | null
  clearError: () => void
  createCredential: (data: Partial<Credential>) => Promise<Credential | undefined>
  updateCredential: (id: string, updates: Partial<Credential>) => Promise<void>
  deleteCredential: (id: string) => Promise<void>
}

export function useCredentials(): CredentialsHookReturn {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const fetchCredentials = async () => {
      setIsLoading(true)
      try {
        const { data } = await httpClient.get<Credential[]>('/credentials')
        setCredentials(data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const createCredential = useCallback(async (data: Partial<Credential>) => {
    setIsLoading(true)
    try {
      const { data: newCredential } = await httpClient.post<Credential>('/credentials', data)
      setCredentials(prev => [...prev, newCredential])
      return newCredential
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    setIsLoading(true)
    try {
      const { data: updated } = await httpClient.put<Credential>(`/credentials/${id}`, updates)
      setCredentials(prev => prev.map(c => (c.id === id ? updated : c)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteCredential = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      await httpClient.delete<void>(`/credentials/${id}`)
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { credentials, isLoading, error, clearError, createCredential, updateCredential, deleteCredential }
} 