import { useState, useCallback, useEffect } from 'react'
import type { Credential, CreateCredentialData } from '@/lib/utils/credential-types'
import { getErrorMessage } from '@/lib/utils'

export interface CredentialsHookReturn {
  credentials: Credential[]
  isLoading: boolean
  error: string | null
  clearError: () => void
  createCredential: (data: CreateCredentialData) => Promise<Credential | undefined>
  updateCredential: (id: string, updates: Partial<CreateCredentialData>) => Promise<void>
  deleteCredential: (id: string) => Promise<void>
  getCredentialById: (id: string) => Credential | undefined
  getSSHCredentials: () => Credential[]
}

export function useCredentials(): CredentialsHookReturn {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/credentials')
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch credentials')
        }
        const response = await res.json()
        const credentials: Credential[] = response.data || []
        setCredentials(credentials)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredentials()
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const createCredential = useCallback(async (data: CreateCredentialData) => {
    try {
      setError(null)
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create credential')
      }
      const { data: newCredential } = await res.json()
      setCredentials(prev => [...prev, newCredential])
      return newCredential
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [])

  const updateCredential = useCallback(async (id: string, updates: Partial<CreateCredentialData>) => {
    try {
      setError(null)
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update credential')
      }
      const { data: updated } = await res.json()
      setCredentials(prev => prev.map(c => (c.id === id ? updated : c)))
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [])

  const deleteCredential = useCallback(async (id: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/credentials/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete credential')
      }
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
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