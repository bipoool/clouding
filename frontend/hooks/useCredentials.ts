import { useState, useCallback } from 'react'

export type CredentialType = 'ssh_key' | 'ssl_cert' | 'password' | 'api_key'

export interface Credential {
  id: string
  name: string
  type: CredentialType
  userId: string
  
  // SSH Key specific field
  sshKey?: string
  
  // Password specific fields
  username?: string
  password?: string
  
  // SSH Certificate specific field
  certificateFile?: string // Base64 encoded file content or file path
  certificateFileName?: string
  
  // API Key specific field
  apiKey?: string
  
  // Additional metadata
  metadata?: {
    description?: string
    expiresAt?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateCredentialData {
  name: string
  type: CredentialType
  
  // SSH Key specific field
  sshKey?: string
  
  // Password specific fields
  username?: string
  password?: string
  
  // SSH Certificate specific fields
  certificateFile?: string
  certificateFileName?: string
  
  // API Key specific field
  apiKey?: string
  
  metadata?: {
    description?: string
    expiresAt?: string
  }
}

// Mock data for development
const mockCredentials: Credential[] = [
  {
    id: 'cred-1',
    name: 'Production SSH Key',
    type: 'ssh_key',
    userId: 'user-1',
    sshKey: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn...\n-----END OPENSSH PRIVATE KEY-----',
    metadata: {
      description: 'Main SSH key for production servers'
    },
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 'cred-2',
    name: 'Dev Environment Access',
    type: 'password',
    userId: 'user-1',
    username: 'developer',
    password: '••••••••',
    metadata: {
      description: 'Username/password for development servers'
    },
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z'
  },
  {
    id: 'cred-3',
    name: 'SSL Certificate',
    type: 'ssl_cert',
    userId: 'user-1',
    certificateFile: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t...',
    certificateFileName: 'server.crt',
    metadata: {
      description: 'SSL certificate for web server',
      expiresAt: '2024-12-31T23:59:59Z'
    },
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-08T14:00:00Z'
  },
  {
    id: 'cred-4',
    name: 'API Access Token',
    type: 'api_key',
    userId: 'user-1',
    apiKey: 'sk-1234567890abcdef1234567890abcdef1234567890abcdef',
    metadata: {
      expiresAt: '2024-12-31T23:59:59Z',
      description: 'API token for external service integration'
    },
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z'
  }
]

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>(mockCredentials)

  const createCredential = useCallback((data: CreateCredentialData) => {
    const newCredential: Credential = {
      ...data,
      id: `cred-${Date.now()}`,
      userId: 'user-1', // In real app, get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setCredentials(prev => [...prev, newCredential])
    return newCredential
  }, [])

  const updateCredential = useCallback((id: string, updates: Partial<CreateCredentialData>) => {
    setCredentials(prev => prev.map(cred => 
      cred.id === id 
        ? { ...cred, ...updates, updatedAt: new Date().toISOString() }
        : cred
    ))
  }, [])

  const deleteCredential = useCallback((id: string) => {
    setCredentials(prev => prev.filter(cred => cred.id !== id))
  }, [])

  const getCredentialById = useCallback((id: string) => {
    return credentials.find(cred => cred.id === id)
  }, [credentials])

  const getSSHCredentials = useCallback(() => {
    return credentials.filter(cred => 
      cred.type === 'ssh_key' || cred.type === 'password'
    )
  }, [credentials])

  return {
    credentials,
    createCredential,
    updateCredential,
    deleteCredential,
    getCredentialById,
    getSSHCredentials
  }
} 