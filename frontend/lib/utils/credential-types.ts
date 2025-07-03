import { Key, Lock, Shield, Code } from 'lucide-react'

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

export interface CredentialsHookReturn {
	credentials: Credential[]
	isLoading: boolean
	error: string | null
	createCredential: (data: CreateCredentialData) => Promise<Credential>
	updateCredential: (id: string, updates: Partial<CreateCredentialData>) => Promise<void>
	deleteCredential: (id: string) => Promise<void>
	getCredentialById: (id: string) => Credential | undefined
	getSSHCredentials: () => Credential[]
	clearError: () => void
}

export const CREDENTIAL_TYPE_CONFIG = {
	ssh_key: {
		icon: Key,
		label: 'SSH Key',
		color: 'text-blue-400',
		description: 'SSH private key for server authentication',
	},
	password: {
		icon: Lock,
		label: 'Password',
		color: 'text-purple-400',
		description: 'Username and password credentials',
	},
	ssl_cert: {
		icon: Shield,
		label: 'SSL Certificate',
		color: 'text-green-400',
		description: 'SSL/TLS certificate for secure connections',
	},
	api_key: {
		icon: Code,
		label: 'API Key',
		color: 'text-orange-400',
		description: 'API key or token for service authentication',
	},
} as const

export const getCredentialTypeIconConfig = (type: CredentialType) => {
	return CREDENTIAL_TYPE_CONFIG[type]
}

export const getCredentialTypeLabel = (type: CredentialType): string => {
	return CREDENTIAL_TYPE_CONFIG[type].label
}

export const getCredentialTypeDescription = (type: CredentialType): string => {
	return CREDENTIAL_TYPE_CONFIG[type].description
}

export const shouldShowExpirationField = (type: CredentialType): boolean => {
	return type === 'ssl_cert' || type === 'api_key'
} 