import { useState, useCallback, useEffect, useRef } from 'react'
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
  getCredentialById: (id: string) => Credential | undefined
  getSSHCredentials: () => Credential[]
}

export function useCredentials(): CredentialsHookReturn {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  // Initial fetch
  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchCredentials = async () => {
      setIsLoading(true)
      try {
        const { data } = await httpClient.get<Credential[]>('/credentials', {
          signal: abortController.signal
        })
        
        // Check if component is still mounted before updating state
        if (!abortController.signal.aborted) {
          setCredentials(data || [])
        }
      } catch (err) {
        // Only update error state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setError(getErrorMessage(err))
        }
      } finally {
        // Only update loading state if component is still mounted
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchCredentials()

    // Cleanup: abort the fetch request and mark component as unmounted
    return () => {
      abortController.abort()
      isMountedRef.current = false
    }
  }, [])

  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null)
    }
  }, [])

  const createCredential = useCallback(async (data: Partial<Credential>) => {
    if (!isMountedRef.current) return
    
    setIsLoading(true)
    try {
      const { data: newCredential } = await httpClient.post<Credential>('/credentials', data)
      
      if (isMountedRef.current) {
        setCredentials(prev => [...prev, newCredential])
      }
      return newCredential
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const updateCredential = useCallback(async (id: string, updates: Partial<Credential>) => {
    if (!isMountedRef.current) return
    
    setIsLoading(true)
    try {
      const { data: updated } = await httpClient.put<Credential>(`/credentials/${id}`, updates)
      
      if (isMountedRef.current) {
        setCredentials(prev => prev.map(c => (c.id === id ? updated : c)))
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  const deleteCredential = useCallback(async (id: string) => {
    if (!isMountedRef.current) return
    
    setIsLoading(true)
    try {
      await httpClient.delete<void>(`/credentials/${id}`)
      
      if (isMountedRef.current) {
        setCredentials(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Helper method to get credential by ID
  const getCredentialById = useCallback((id: string) => {
    return credentials.find(credential => credential.id === id)
  }, [credentials])

  // Helper method to get SSH credentials (both ssh_key and password types)
  const getSSHCredentials = useCallback(() => {
    return credentials.filter(credential => 
      credential.type === 'ssh_key' || credential.type === 'password'
    )
  }, [credentials])

  return { 
    credentials, 
    isLoading, 
    error, 
    clearError, 
    createCredential, 
    updateCredential, 
    deleteCredential,
    getCredentialById,
    getSSHCredentials
  }
} 