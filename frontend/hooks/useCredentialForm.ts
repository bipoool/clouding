import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { logger } from '@/lib/utils/logger'
import { getErrorMessage } from '@/lib/utils'
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
} from '@/lib/utils/credential-types'

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
			const formData = {
				name: editCredential.name,
				type: editCredential.type,
				sshKey: '',
				username: '',
				password: '',
				certificateFile: '',
				certificateFileName: '',
				apiKey: '',
				description: editCredential.metadata?.description || '',
				expiresAt: editCredential.metadata?.expiresAt?.split('T')[0] || '',
			}

			// Set type-specific fields based on credential type
			switch (editCredential.type) {
				case 'ssh_key':
					formData.sshKey = editCredential.sshKey
					break
				case 'password':
					formData.username = editCredential.username
					formData.password = editCredential.password
					break
				case 'ssl_cert':
					formData.certificateFile = editCredential.certificateFile
					formData.certificateFileName = editCredential.certificateFileName
					break
				case 'api_key':
					formData.apiKey = editCredential.apiKey
					break
			}

			form.reset(formData)
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
			} catch (error: unknown) {
				const errorMessage = getErrorMessage(error, 'Failed to process certificate file')
				logger.error('Failed to process certificate file:', errorMessage)
			}
		}
		reader.readAsArrayBuffer(file)
	}, [form])

	const processCredentialData = useCallback((data: CredentialFormData): CreateCredentialData => {
		const baseMetadata = {
			...(data.description && { description: data.description }),
			...(data.expiresAt && {
				expiresAt: new Date(data.expiresAt).toISOString(),
			}),
		}

		// Create type-specific credential data with validation
		switch (data.type) {
			case 'ssh_key': {
				if (!data.sshKey?.trim()) {
					throw new Error('SSH key is required')
				}
				const normalizedKey = data.sshKey.trim()
				if (!validateSSHKey(normalizedKey)) {
					throw new Error('Invalid SSH key format detected')
				}
				return {
					type: 'ssh_key',
					name: data.name,
					sshKey: normalizedKey,
					metadata: baseMetadata,
				}
			}
			case 'password': {
				if (!data.username?.trim() || !data.password?.trim()) {
					throw new Error('Username and password are required')
				}
				return {
					type: 'password',
					name: data.name,
					username: data.username.trim(),
					password: data.password.trim(),
					metadata: baseMetadata,
				}
			}
			case 'ssl_cert': {
				if (!data.certificateFile || !data.certificateFileName?.trim()) {
					throw new Error('Certificate file and filename are required')
				}
				return {
					type: 'ssl_cert',
					name: data.name,
					certificateFile: data.certificateFile,
					certificateFileName: data.certificateFileName.trim(),
					metadata: baseMetadata,
				}
			}
			case 'api_key': {
				if (!data.apiKey?.trim()) {
					throw new Error('API key is required')
				}
				const trimmedKey = data.apiKey.trim()
				if (!validateAPIKey(trimmedKey)) {
					throw new Error('Invalid API key format detected')
				}
				return {
					type: 'api_key',
					name: data.name,
					apiKey: trimmedKey,
					metadata: baseMetadata,
				}
			}
			default: {
				const _exhaustive: never = data.type
				throw new Error(`Unknown credential type: ${_exhaustive}`)
			}
		}
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
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error, 'Failed to save credential')
			logger.error('Failed to save credential:', errorMessage)
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