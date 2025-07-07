'use client'

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useCallback,
} from 'react'
import type {
	Credential,
	CreateCredentialData,
} from '@/lib/utils/credential-types'
import { getErrorMessage } from '@/lib/utils'
import { httpClient } from '@/lib/http-client'

interface CredentialsContextType {
	credentials: Credential[]
	isLoading: boolean
	error: string | null
	clearError: () => void
	createCredential: (
		data: CreateCredentialData
	) => Promise<Credential | undefined>
	updateCredential: (
		id: string,
		updates: Partial<CreateCredentialData>
	) => Promise<void>
	deleteCredential: (id: string) => Promise<void>
	getCredentialById: (id: string) => Credential | undefined
	getSSHCredentials: () => Credential[]
	refetch: () => Promise<void>
}

const CredentialsContext = createContext<CredentialsContextType | null>(null)

export const useCredentialsContext = () => {
	const context = useContext(CredentialsContext)
	if (!context) {
		throw new Error(
			'useCredentialsContext must be used within a CredentialsProvider'
		)
	}
	return context
}

interface CredentialsProviderProps {
	children: ReactNode
}

export const CredentialsProvider = ({ children }: CredentialsProviderProps) => {
	const [credentials, setCredentials] = useState<Credential[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchCredentials = useCallback(async () => {
		setIsLoading(true)
		try {
			const { data } = await httpClient.get<Credential[]>('/credentials')
			setCredentials(data || [])
			setError(null)
		} catch (err) {
			setError(getErrorMessage(err))
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchCredentials()
	}, [fetchCredentials])

	const clearError = useCallback(() => setError(null), [])

	const createCredential = useCallback(async (data: CreateCredentialData) => {
		setIsLoading(true)
		try {
			const { data: newCredential } = await httpClient.post<Credential>(
				'/credentials',
				data
			)
			setCredentials(prev => [...prev, newCredential])
			return newCredential
		} catch (err) {
			setError(getErrorMessage(err))
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	const updateCredential = useCallback(
		async (id: string, updates: Partial<CreateCredentialData>) => {
			setIsLoading(true)
			try {
				const { data: updated } = await httpClient.put<Credential>(
					`/credentials/${id}`,
					updates
				)
				setCredentials(prev => prev.map(c => (c.id === id ? updated : c)))
			} catch (err) {
				setError(getErrorMessage(err))
				throw err
			} finally {
				setIsLoading(false)
			}
		},
		[]
	)

	const deleteCredential = useCallback(async (id: string) => {
		setIsLoading(true)
		try {
			await httpClient.delete<void>(`/credentials/${id}`)
			setCredentials(prev => prev.filter(c => c.id !== id))
		} catch (err) {
			setError(getErrorMessage(err))
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	const getCredentialById = useCallback(
		(id: string) => {
			return credentials.find(credential => credential.id === id)
		},
		[credentials]
	)

	const getSSHCredentials = useCallback(() => {
		return credentials.filter(
			credential =>
				credential.type === 'ssh_key' || credential.type === 'password'
		)
	}, [credentials])

	const refetch = useCallback(async () => {
		await fetchCredentials()
	}, [fetchCredentials])

	const value: CredentialsContextType = {
		credentials,
		isLoading,
		error,
		clearError,
		createCredential,
		updateCredential,
		deleteCredential,
		getCredentialById,
		getSSHCredentials,
		refetch,
	}

	return (
		<CredentialsContext.Provider value={value}>
			{children}
		</CredentialsContext.Provider>
	)
}
