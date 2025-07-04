import { useMemo } from 'react'
import type { Credential } from '@/lib/utils/credential-types'
import { EXPIRY_WARNING_DAYS } from '@/lib/constants/credentials'

export interface CredentialStats {
	total: number
	ssh: number
	ssl: number
	api: number
	expiring: Credential[]
}

export function useCredentialsStats(credentials: Credential[]): CredentialStats {
	return useMemo(() => {
		const sshCredentials = credentials.filter(
			cred => cred.type === 'ssh_key' || cred.type === 'password'
		)
		const sslCredentials = credentials.filter(cred => cred.type === 'ssl_cert')
		const apiCredentials = credentials.filter(cred => cred.type === 'api_key')

		// Check for credentials expiring soon (within configured warning period)
		const expiringCredentials = credentials.filter(cred => {
			if (!cred.metadata?.expiresAt) return false
			const expiryDate = new Date(cred.metadata.expiresAt)
			const warningDate = new Date()
			warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS)
			return expiryDate <= warningDate
		})

		return {
			total: credentials.length,
			ssh: sshCredentials.length,
			ssl: sslCredentials.length,
			api: apiCredentials.length,
			expiring: expiringCredentials,
		}
	}, [credentials])
} 