import { useState, useCallback, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import type { 
  Credential, 
  CreateCredentialData, 
  CredentialsHookReturn 
} from '@/lib/utils/credential-types'
import { credentialSchema } from '@/lib/utils/credential-validation'
import { MOCK_CREDENTIALS, DEFAULT_USER_ID } from '@/lib/data/mock-credentials'
import { getErrorMessage } from '@/lib/utils'

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
    } catch (validationError: unknown) {
      const errorMessage = getErrorMessage(validationError, 'Invalid credential data')
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
        userId: DEFAULT_USER_ID, // TODO: Replace with authenticated user ID from auth store (user.id)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setCredentials(prev => [...prev, newCredential])
      return newCredential

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create credential')
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

      // For updates, we create a new credential data object that represents the full updated credential
      // We can't just merge updates because discriminated unions require complete type-specific data
      let updatedCredentialData: CreateCredentialData

      if (updates.type && updates.type !== existingCredential.type) {
        // If the type is changing, we need the complete new credential data
        if (!validateCredentialData(updates as CreateCredentialData)) {
          throw new Error('Validation failed')
        }
        updatedCredentialData = updates as CreateCredentialData
      } else {
        // Type is staying the same, so we can merge appropriately based on the existing type
        switch (existingCredential.type) {
          case 'ssh_key': {
            const sshUpdates = updates as Partial<Extract<CreateCredentialData, { type: 'ssh_key' }>>
            updatedCredentialData = {
              type: 'ssh_key',
              name: updates.name ?? existingCredential.name,
              sshKey: sshUpdates.sshKey ?? existingCredential.sshKey,
              metadata: updates.metadata ?? existingCredential.metadata
            }
            break
          }
          case 'password': {
            const passwordUpdates = updates as Partial<Extract<CreateCredentialData, { type: 'password' }>>
            updatedCredentialData = {
              type: 'password',
              name: updates.name ?? existingCredential.name,
              username: passwordUpdates.username ?? existingCredential.username,
              password: passwordUpdates.password ?? existingCredential.password,
              metadata: updates.metadata ?? existingCredential.metadata
            }
            break
          }
          case 'ssl_cert': {
            const sslUpdates = updates as Partial<Extract<CreateCredentialData, { type: 'ssl_cert' }>>
            updatedCredentialData = {
              type: 'ssl_cert',
              name: updates.name ?? existingCredential.name,
              certificateFile: sslUpdates.certificateFile ?? existingCredential.certificateFile,
              certificateFileName: sslUpdates.certificateFileName ?? existingCredential.certificateFileName,
              metadata: updates.metadata ?? existingCredential.metadata
            }
            break
          }
          case 'api_key': {
            const apiUpdates = updates as Partial<Extract<CreateCredentialData, { type: 'api_key' }>>
            updatedCredentialData = {
              type: 'api_key',
              name: updates.name ?? existingCredential.name,
              apiKey: apiUpdates.apiKey ?? existingCredential.apiKey,
              metadata: updates.metadata ?? existingCredential.metadata
            }
            break
          }
          default: {
            const _exhaustive: never = existingCredential
            throw new Error(`Unknown credential type: ${(_exhaustive as { type: string }).type}`)
          }
        }

        // Validate the merged data
        if (!validateCredentialData(updatedCredentialData)) {
          throw new Error('Validation failed')
        }
      }

      // Check for duplicate names (excluding current credential)
      if (updatedCredentialData.name) {
        const nameExists = credentials.some(cred => 
          cred.id !== id && cred.name.toLowerCase() === updatedCredentialData.name.toLowerCase()
        )
        
        if (nameExists) {
          throw new Error('A credential with this name already exists')
        }
      }

      // Simulate API call
      await simulateDelay()

      setCredentials(prev => prev.map(cred => 
        cred.id === id 
          ? { 
              ...updatedCredentialData, 
              id: cred.id, 
              userId: cred.userId, 
              createdAt: cred.createdAt, 
              updatedAt: new Date().toISOString() 
            } as Credential
          : cred
      ))

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update credential')
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

    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to delete credential')
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