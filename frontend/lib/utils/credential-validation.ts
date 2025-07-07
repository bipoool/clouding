import * as z from 'zod'
import type { CredentialType } from './credential-types'

// SSH Key validation regex patterns
export const SSH_KEY_PATTERNS = {
	openssh: /^-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*-----END OPENSSH PRIVATE KEY-----$/,
	rsa: /^-----BEGIN RSA PRIVATE KEY-----[\s\S]*-----END RSA PRIVATE KEY-----$/,
	dsa: /^-----BEGIN DSA PRIVATE KEY-----[\s\S]*-----END DSA PRIVATE KEY-----$/,
	ecdsa: /^-----BEGIN EC PRIVATE KEY-----[\s\S]*-----END EC PRIVATE KEY-----$/,
	ed25519: /^-----BEGIN PRIVATE KEY-----[\s\S]*-----END PRIVATE KEY-----$/,
	pkcs8: /^-----BEGIN ENCRYPTED PRIVATE KEY-----[\s\S]*-----END ENCRYPTED PRIVATE KEY-----$/,
} as const

// API Key validation patterns
export const API_KEY_PATTERNS = {
	generic: /^[A-Za-z0-9_\-\.]{16,}$/, // At least 16 chars, alphanumeric with common symbols
	bearer: /^[A-Za-z0-9_\-\.]{20,}$/, // Bearer tokens typically longer
	jwt: /^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/, // JWT format
	base64: /^[A-Za-z0-9+\/]+=*$/, // Base64 encoded keys
} as const

// Validation functions
export const validateSSHKey = (value?: string): boolean => {
	if (!value?.trim()) return true // Optional field
	
	const normalizedKey = value.trim()
	return Object.values(SSH_KEY_PATTERNS).some(pattern => 
		pattern.test(normalizedKey)
	)
}

export const validateAPIKey = (value?: string): boolean => {
	if (!value?.trim()) return true // Optional field
	
	const trimmedKey = value.trim()
	
	// Check minimum length
	if (trimmedKey.length < 16) return false
	
	// Check against known API key patterns
	return Object.values(API_KEY_PATTERNS).some(pattern => 
		pattern.test(trimmedKey)
	)
}

// Helper function to convert ArrayBuffer to base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer)
	let binary = ''
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return btoa(binary)
}

// Zod schema for credential validation with conditional requirements
export const credentialSchema = z.object({
	name: z
		.string()
		.min(1, 'Credential name is required')
		.max(100, 'Name too long'),
	type: z.enum(['ssh_key', 'password', 'ssl_cert', 'api_key'] as const, {
		required_error: 'Please select a credential type',
	}),
	// SSH Key fields with format validation
	sshKey: z.string().optional(),
	// Password fields
	username: z.string().optional(),
	password: z.string().optional(),
	// SSL Certificate fields
	certificateFile: z.string().optional(),
	certificateFileName: z.string().optional(),
	// API Key fields with format validation
	apiKey: z.string().optional(),
	// Common fields
	description: z.string().optional(),
	expiresAt: z.string().optional(),
}).superRefine((data, ctx) => {
	// Conditional validation based on credential type
	switch (data.type) {
		case 'ssh_key':
			if (!data.sshKey?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'SSH key is required',
					path: ['sshKey'],
				})
			} else if (!validateSSHKey(data.sshKey.trim())) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid SSH key format. Please provide a valid private key (OpenSSH, RSA, DSA, ECDSA, or Ed25519 format)',
					path: ['sshKey'],
				})
			}
			break
		case 'password':
			if (!data.username?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Username is required',
					path: ['username'],
				})
			}
			if (!data.password?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Password is required',
					path: ['password'],
				})
			}
			break
		case 'ssl_cert':
			if (!data.certificateFile) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Certificate file is required',
					path: ['certificateFile'],
				})
			}
			if (!data.certificateFileName?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Certificate filename is required',
					path: ['certificateFileName'],
				})
			}
			break
		case 'api_key':
			if (!data.apiKey?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'API key is required',
					path: ['apiKey'],
				})
			} else if (!validateAPIKey(data.apiKey.trim())) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Invalid API key format. Must be at least 16 characters and contain only alphanumeric characters, hyphens, underscores, and dots',
					path: ['apiKey'],
				})
			}
			break
	}
})

export type CredentialFormData = z.infer<typeof credentialSchema> 