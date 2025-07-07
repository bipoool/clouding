import { Key, Lock, Shield, Code } from 'lucide-react'

export type CredentialType = 'ssh_key' | 'ssl_cert' | 'password' | 'api_key'

// Base interface with common fields
interface BaseCredential {
	id: string
	name: string
	userId: string
	createdAt: string
	updatedAt: string
	description?: string
	expiresAt?: string
}

// Specific credential type interfaces
interface SSHKeyCredential extends BaseCredential {
	type: 'ssh_key'
	secret: {
		sshKey: string
	}
}

interface PasswordCredential extends BaseCredential {
	type: 'password'
	secret: {
		username: string
		password: string
	}
}

interface SSLCertificateCredential extends BaseCredential {
	type: 'ssl_cert'	
	secret: {
		certificateFile: string // Base64 encoded file content or file path
		certificateFileName: string
	}
}

interface APIKeyCredential extends BaseCredential {
	type: 'api_key'
	secret: {
		apiKey: string
	}
}

// Discriminated union type for Credential
export type Credential = 
	| SSHKeyCredential 
	| PasswordCredential 
	| SSLCertificateCredential 
	| APIKeyCredential

// Base interface for creating credentials
// Note: userId is intentionally excluded as it's automatically assigned from the authenticated user's session
// This prevents users from creating credentials for other users (security best practice)
interface BaseCreateCredentialData {
	name: string
	description?: string
	expiresAt?: string
}

// Specific create credential data interfaces
interface CreateSSHKeyCredentialData extends BaseCreateCredentialData {
	type: 'ssh_key'
	secret: {
		sshKey: string
	}
}

interface CreatePasswordCredentialData extends BaseCreateCredentialData {
	type: 'password'
	secret: {
		username: string
		password: string
	}
}

interface CreateSSLCertificateCredentialData extends BaseCreateCredentialData {
	type: 'ssl_cert'
	secret: {
		certificateFile: string
		certificateFileName: string
	}
}

interface CreateAPIKeyCredentialData extends BaseCreateCredentialData {
	type: 'api_key'
	secret: {
		apiKey: string
	}
}

// Discriminated union type for CreateCredentialData
export type CreateCredentialData = 
	| CreateSSHKeyCredentialData 
	| CreatePasswordCredentialData 
	| CreateSSLCertificateCredentialData 
	| CreateAPIKeyCredentialData

// Type guard functions for discriminated union
export const isSSHKeyCredential = (credential: Credential): credential is SSHKeyCredential => {
	return credential.type === 'ssh_key'
}

export const isPasswordCredential = (credential: Credential): credential is PasswordCredential => {
	return credential.type === 'password'
}

export const isSSLCertificateCredential = (credential: Credential): credential is SSLCertificateCredential => {
	return credential.type === 'ssl_cert'
}

export const isAPIKeyCredential = (credential: Credential): credential is APIKeyCredential => {
	return credential.type === 'api_key'
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