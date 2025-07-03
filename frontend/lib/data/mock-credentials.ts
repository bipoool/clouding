import type { Credential } from '@/lib/utils/credential-types'

export const MOCK_CREDENTIALS: Credential[] = [
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

export const DEFAULT_USER_ID = 'user-1' // In real app, get from auth context 