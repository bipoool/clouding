'use client'

import { useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
	CredentialsTable,
	CredentialsPageHeader,
	SecurityAlert,
	CredentialsStatsSection,
} from '@/components/dashboard'
import { useCredentials } from '@/hooks/useCredentials'
import { useCredentialsStats } from '@/hooks/useCredentialsStats'
import type { Credential } from '@/hooks/useCredentials'

export default function CredentialsPage() {
	const { credentials, createCredential, updateCredential, deleteCredential } =
		useCredentials()
	const stats = useCredentialsStats(credentials)

	const [editingCredential, setEditingCredential] = useState<Credential | null>(
		null
	)

	const handleEditCredential = useCallback((credential: Credential) => {
		setEditingCredential(credential)
	}, [])

	const handleEditComplete = useCallback(() => {
		setEditingCredential(null)
	}, [])

	return (
		<DashboardLayout>
			<div className='space-y-8'>
				<CredentialsPageHeader
					onCreateCredential={createCredential}
					onUpdateCredential={updateCredential}
					editingCredential={editingCredential}
					onEditComplete={handleEditComplete}
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
						onDeleteCredential={deleteCredential}
						onEditCredential={handleEditCredential}
					/>
				</div>
			</div>
		</DashboardLayout>
	)
}
