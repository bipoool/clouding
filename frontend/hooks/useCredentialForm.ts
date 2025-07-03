import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { logger } from '@/lib/utils/logger'
import { 
	credentialSchema, 
	validateSSHKey, 
	validateAPIKey, 
	arrayBufferToBase64,
	type CredentialFormData 
} from '@/lib/utils/credential-validation'
import type { 
	Credential, 
	CreateCredentialData 
} from '@/hooks/useCredentials'

interface UseCredentialFormProps {
	onAddCredential: (credential: CreateCredentialData) => void
	onUpdateCredential?: (id: string, credential: Partial<CreateCredentialData>) => void
	editCredential?: Credential | null
	onClose: () => void
}

export const useCredentialForm = ({
	onAddCredential,
	onUpdateCredential,
	editCredential,
	onClose,
}: UseCredentialFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<CredentialFormData>({
		resolver: zodResolver(credentialSchema),
		defaultValues: {
			name: '',
			type: 'ssh_key',
			sshKey: '',
			username: '',
			password: '',
			certificateFile: '',
			certificateFileName: '',
			apiKey: '',
			description: '',
			expiresAt: '',
		},
	})

	const selectedType = form.watch('type')

	// Reset form when edit credential changes
	useEffect(() => {
		if (editCredential) {
			form.reset({
				name: editCredential.name,
				type: editCredential.type,
				sshKey: editCredential.sshKey || '',
				username: editCredential.username || '',
				password: editCredential.password || '',
				certificateFile: editCredential.certificateFile || '',
				certificateFileName: editCredential.certificateFileName || '',
				apiKey: editCredential.apiKey || '',
				description: editCredential.metadata?.description || '',
				expiresAt: editCredential.metadata?.expiresAt?.split('T')[0] || '',
			})
		} else {
			form.reset({
				name: '',
				type: 'ssh_key',
				sshKey: '',
				username: '',
				password: '',
				certificateFile: '',
				certificateFileName: '',
				apiKey: '',
				description: '',
				expiresAt: '',
			})
		}
	}, [editCredential, form])

	const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = (event) => {
			try {
				const content = event.target?.result as ArrayBuffer
				const base64Content = arrayBufferToBase64(content)
				form.setValue('certificateFile', base64Content)
				form.setValue('certificateFileName', file.name)
			} catch (error) {
				logger.error('Failed to process certificate file:', error)
			}
		}
		reader.readAsArrayBuffer(file)
	}, [form])

	const processCredentialData = useCallback((data: CredentialFormData): CreateCredentialData => {
		const credentialData: CreateCredentialData = {
			name: data.name,
			type: data.type,
			metadata: {
				...(data.description && { description: data.description }),
				...(data.expiresAt && {
					expiresAt: new Date(data.expiresAt).toISOString(),
				}),
			},
		}

		// Add type-specific fields with validation
		switch (data.type) {
			case 'ssh_key':
				if (data.sshKey?.trim()) {
					const normalizedKey = data.sshKey.trim()
					if (!validateSSHKey(normalizedKey)) {
						throw new Error('Invalid SSH key format detected')
					}
					credentialData.sshKey = normalizedKey
				}
				break
			case 'password':
				if (data.username?.trim()) credentialData.username = data.username.trim()
				if (data.password?.trim()) credentialData.password = data.password.trim()
				break
			case 'ssl_cert':
				if (data.certificateFile) credentialData.certificateFile = data.certificateFile
				if (data.certificateFileName?.trim()) {
					credentialData.certificateFileName = data.certificateFileName.trim()
				}
				break
			case 'api_key':
				if (data.apiKey?.trim()) {
					const trimmedKey = data.apiKey.trim()
					if (!validateAPIKey(trimmedKey)) {
						throw new Error('Invalid API key format detected')
					}
					credentialData.apiKey = trimmedKey
				}
				break
		}

		return credentialData
	}, [])

	const handleSubmit = useCallback(async (data: CredentialFormData) => {
		setIsSubmitting(true)

		try {
			const credentialData = processCredentialData(data)

			if (editCredential && onUpdateCredential) {
				await onUpdateCredential(editCredential.id, credentialData)
			} else {
				await onAddCredential(credentialData)
			}

			onClose()
			form.reset()
		} catch (error) {
			logger.error('Failed to save credential:', error)
		} finally {
			setIsSubmitting(false)
		}
	}, [editCredential, onUpdateCredential, onAddCredential, onClose, form, processCredentialData])

	return {
		form,
		selectedType,
		isSubmitting,
		handleFileUpload,
		handleSubmit,
	}
} 