'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
	CredentialsPageContent,
	CredentialsPageSkeleton,
	ErrorAlert,
} from '@/components/dashboard'
import { useCredentials } from '@/hooks/useCredentials'
import { useCredentialsStats } from '@/hooks/useCredentialsStats'
import type {
	Credential,
	CreateCredentialData,
} from '@/lib/utils/credential-types'

export default function CredentialsPage() {
	const {
		credentials,
		isLoading,
		error,
		createCredential,
		updateCredential,
		deleteCredential,
		clearError,
	} = useCredentials()
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

	// Wrapper function to convert createCredential to void return type
	const handleCreateCredential = useCallback(
		async (data: CreateCredentialData) => {
			await createCredential(data)
		},
		[createCredential]
	)

	// Memoize content props to prevent unnecessary re-renders
	const contentProps = useMemo(
		() => ({
			credentials,
			stats,
			editingCredential,
			onCreateCredential: handleCreateCredential,
			onUpdateCredential: updateCredential,
			onDeleteCredential: deleteCredential,
			onEditCredential: handleEditCredential,
			onEditComplete: handleEditComplete,
		}),
		[
			credentials,
			stats,
			editingCredential,
			handleCreateCredential,
			updateCredential,
			deleteCredential,
			handleEditCredential,
			handleEditComplete,
		]
	)

	// Loading state
	if (isLoading) {
		return (
			<DashboardLayout>
				<CredentialsPageSkeleton />
			</DashboardLayout>
		)
	}

	return (
		<DashboardLayout>
			<div className='space-y-8'>
				{/* Error Alert */}
				{error && <ErrorAlert error={error} onDismiss={clearError} />}

				<CredentialsPageContent {...contentProps} />
			</div>
		</DashboardLayout>
	)
}
