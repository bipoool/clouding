import { memo } from 'react'
import {
	CredentialsTable,
	CredentialsPageHeader,
	SecurityAlert,
	CredentialsStatsSection,
} from '@/components/dashboard'
import type {
	Credential,
	CreateCredentialData,
} from '@/lib/utils/credential-types'
import type { CredentialStats } from '@/hooks/useCredentialsStats'

interface CredentialsPageContentProps {
	credentials: Credential[]
	stats: CredentialStats
	editingCredential: Credential | null
	onCreateCredential: (data: CreateCredentialData) => Promise<Credential>
	onUpdateCredential: (
		id: string,
		updates: Partial<CreateCredentialData>
	) => Promise<void>
	onDeleteCredential: (id: string) => Promise<void>
	onEditCredential: (credential: Credential) => void
	onEditComplete: () => void
}

export const CredentialsPageContent = memo(function CredentialsPageContent({
	credentials,
	stats,
	editingCredential,
	onCreateCredential,
	onUpdateCredential,
	onDeleteCredential,
	onEditCredential,
	onEditComplete,
}: CredentialsPageContentProps) {
	return (
		<div className='space-y-8'>
			<CredentialsPageHeader
				onCreateCredential={onCreateCredential}
				onUpdateCredential={onUpdateCredential}
				editingCredential={editingCredential}
				onEditComplete={onEditComplete}
			/>

			<SecurityAlert expiringCredentials={stats.expiring} />

			<CredentialsStatsSection stats={stats} />

			{/* Credentials Table */}
			<div className='glass-card'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-2xl font-bold text-primary'>All Credentials</h3>
				</div>
				<CredentialsTable
					credentials={credentials}
					onDeleteCredential={onDeleteCredential}
					onEditCredential={onEditCredential}
				/>
			</div>
		</div>
	)
})
