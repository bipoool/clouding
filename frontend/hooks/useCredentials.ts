import { useState, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import type { 
  Credential, 
  CreateCredentialData, 
  CredentialsHookReturn 
} from '@/lib/utils/credential-types'
import { credentialSchema } from '@/lib/utils/credential-validation'
import { MOCK_CREDENTIALS, DEFAULT_USER_ID } from '@/lib/data/mock-credentials'

/**
 * Custom hook for managing credentials with full CRUD operations
 * Includes validation, error handling, and optimized performance
 */
export function useCredentials(): CredentialsHookReturn {
  const [credentials, setCredentials] = useState<Credential[]>(MOCK_CREDENTIALS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Clear any existing errors
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Validate credential data using Zod schema
   */
  const validateCredentialData = useCallback((data: CreateCredentialData): boolean => {
    try {
      credentialSchema.parse(data)
      return true
    } catch (validationError: any) {
      const errorMessage = validationError.errors?.[0]?.message || 'Invalid credential data'
      setError(errorMessage)
      return false
    }
  }, [])

  /**
   * Simulate API delay for realistic UX
   */
  const simulateDelay = useCallback((ms: number = 500): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }, [])

  /**
   * Create a new credential with validation and error handling
   */
  const createCredential = useCallback(async (data: CreateCredentialData): Promise<Credential> => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate input data
      if (!validateCredentialData(data)) {
        throw new Error('Validation failed')
      }

      // Check for duplicate names
      const nameExists = credentials.some(cred => 
        cred.name.toLowerCase() === data.name.toLowerCase()
      )
      
      if (nameExists) {
        throw new Error('A credential with this name already exists')
      }

      // Simulate API call
      await simulateDelay()

      const newCredential: Credential = {
        ...data,
        id: uuid(),
        userId: DEFAULT_USER_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setCredentials(prev => [...prev, newCredential])
      return newCredential

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create credential'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [credentials, validateCredentialData, simulateDelay])

  /**
   * Update an existing credential
   */
  const updateCredential = useCallback(async (
    id: string, 
    updates: Partial<CreateCredentialData>
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const existingCredential = credentials.find(cred => cred.id === id)
      if (!existingCredential) {
        throw new Error('Credential not found')
      }

      // Merge updates with existing data for validation
      const updatedData = { ...existingCredential, ...updates }
      
      // Validate merged data
      if (!validateCredentialData(updatedData)) {
        throw new Error('Validation failed')
      }

      // Check for duplicate names (excluding current credential)
      if (updates.name) {
        const nameExists = credentials.some(cred => 
          cred.id !== id && cred.name.toLowerCase() === updates.name!.toLowerCase()
        )
        
        if (nameExists) {
          throw new Error('A credential with this name already exists')
        }
      }

      // Simulate API call
      await simulateDelay()

      setCredentials(prev => prev.map(cred => 
        cred.id === id 
          ? { ...cred, ...updates, updatedAt: new Date().toISOString() }
          : cred
      ))

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update credential'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [credentials, validateCredentialData, simulateDelay])

  /**
   * Delete a credential by ID
   */
  const deleteCredential = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const credentialExists = credentials.some(cred => cred.id === id)
      if (!credentialExists) {
        throw new Error('Credential not found')
      }

      // Simulate API call
      await simulateDelay()

      setCredentials(prev => prev.filter(cred => cred.id !== id))

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete credential'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [credentials, simulateDelay])

  /**
   * Get a credential by ID (memoized for performance)
   */
  const getCredentialById = useCallback((id: string): Credential | undefined => {
    return credentials.find(cred => cred.id === id)
  }, [credentials])

  /**
   * Get SSH-compatible credentials (memoized for performance)
   */
  const getSSHCredentials = useCallback((): Credential[] => {
    return credentials.filter(cred => 
      cred.type === 'ssh_key' || cred.type === 'password'
    )
  }, [credentials])

  return {
    credentials,
    isLoading,
    error,
    createCredential,
    updateCredential,
    deleteCredential,
    getCredentialById,
    getSSHCredentials,
    clearError
  }
} 