import { useMemo } from 'react'
import type { Credential } from './useCredentials'

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

		// Check for credentials expiring soon (within 30 days)
		const expiringCredentials = credentials.filter(cred => {
			if (!cred.metadata?.expiresAt) return false
			const expiryDate = new Date(cred.metadata.expiresAt)
			const thirtyDaysFromNow = new Date()
			thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
			return expiryDate <= thirtyDaysFromNow
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