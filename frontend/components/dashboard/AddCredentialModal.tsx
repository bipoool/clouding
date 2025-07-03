'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Key, Lock, Shield, Code, Upload } from 'lucide-react'
import type {
	Credential,
	CreateCredentialData,
	CredentialType,
} from '@/hooks/useCredentials'

const credentialSchema = z.object({
	name: z
		.string()
		.min(1, 'Credential name is required')
		.max(100, 'Name too long'),
	type: z.enum(['ssh_key', 'password', 'ssl_cert', 'api_key'], {
		required_error: 'Please select a credential type',
	}),
	// SSH Key fields
	sshKey: z.string().optional(),
	// Password fields
	username: z.string().optional(),
	password: z.string().optional(),
	// SSL Certificate fields
	certificateFile: z.string().optional(),
	certificateFileName: z.string().optional(),
	// API Key fields
	apiKey: z.string().optional(),
	// Common fields
	description: z.string().optional(),
	expiresAt: z.string().optional(),
})

type CredentialFormData = z.infer<typeof credentialSchema>

interface AddCredentialModalProps {
	onAddCredential: (credential: CreateCredentialData) => void
	onUpdateCredential?: (
		id: string,
		credential: Partial<CreateCredentialData>
	) => void
	editCredential?: Credential | null
	trigger?: React.ReactNode
}

export function AddCredentialModal({
	onAddCredential,
	onUpdateCredential,
	editCredential,
	trigger,
}: AddCredentialModalProps) {
	const [open, setOpen] = useState(false)
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

	// Auto-open modal when editCredential is provided
	useEffect(() => {
		if (editCredential) {
			setOpen(true)
		}
	}, [editCredential])

	// Populate form when editing
	useEffect(() => {
		if (editCredential && open) {
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
		} else if (!editCredential && open) {
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
	}, [editCredential, open, form])

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = event => {
				const content = event.target?.result as string
				// Store as base64 for simplicity
				const base64Content = btoa(content)
				form.setValue('certificateFile', base64Content)
				form.setValue('certificateFileName', file.name)
			}
			reader.readAsText(file)
		}
	}

	const handleSubmit = async (data: CredentialFormData) => {
		setIsSubmitting(true)

		try {
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

			// Add type-specific fields
			switch (data.type) {
				case 'ssh_key':
					if (data.sshKey) credentialData.sshKey = data.sshKey
					break
				case 'password':
					if (data.username) credentialData.username = data.username
					if (data.password) credentialData.password = data.password
					break
				case 'ssl_cert':
					if (data.certificateFile)
						credentialData.certificateFile = data.certificateFile
					if (data.certificateFileName)
						credentialData.certificateFileName = data.certificateFileName
					break
				case 'api_key':
					if (data.apiKey) credentialData.apiKey = data.apiKey
					break
			}

			if (editCredential && onUpdateCredential) {
				onUpdateCredential(editCredential.id, credentialData)
			} else {
				onAddCredential(credentialData)
			}

			setOpen(false)
			form.reset()
		} catch (error) {
			logger.error('Failed to save credential:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const getTypeIcon = (type: CredentialType) => {
		switch (type) {
			case 'ssh_key':
				return <Key className='h-5 w-5 text-blue-400' />
			case 'password':
				return <Lock className='h-5 w-5 text-purple-400' />
			case 'ssl_cert':
				return <Shield className='h-5 w-5 text-green-400' />
			case 'api_key':
				return <Code className='h-5 w-5 text-orange-400' />
		}
	}

	const renderTypeSpecificFields = () => {
		switch (selectedType) {
			case 'ssh_key':
				return (
					<FormField
						control={form.control}
						name='sshKey'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-secondary'>
									SSH Private Key
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder='-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----'
										className='glass-input resize-none font-mono text-sm'
										rows={8}
										{...field}
									/>
								</FormControl>
								<FormDescription className='text-xs text-gray-500'>
									Paste your SSH private key here
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'password':
				return (
					<div className='space-y-4'>
						<FormField
							control={form.control}
							name='username'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>Username</FormLabel>
									<FormControl>
										<Input
											placeholder='username'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>Password</FormLabel>
									<FormControl>
										<Input
											type='password'
											placeholder='••••••••'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				)

			case 'ssl_cert':
				return (
					<FormField
						control={form.control}
						name='certificateFile'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-secondary'>
									Certificate File
								</FormLabel>
								<FormControl>
									<div className='space-y-2'>
										<div className='flex items-center gap-2'>
											<Button
												type='button'
												variant='outline'
												className='glass-btn'
												onClick={() =>
													document.getElementById('cert-upload')?.click()
												}
											>
												<Upload className='h-4 w-4 mr-2' />
												Upload Certificate
											</Button>
											{form.watch('certificateFileName') && (
												<span className='text-sm text-secondary'>
													{form.watch('certificateFileName')}
												</span>
											)}
										</div>
										<input
											id='cert-upload'
											type='file'
											accept='.crt,.cer,.pem'
											className='hidden'
											onChange={handleFileUpload}
										/>
									</div>
								</FormControl>
								<FormDescription className='text-xs text-gray-500'>
									Upload your SSL certificate file (.crt, .cer, .pem)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			case 'api_key':
				return (
					<FormField
						control={form.control}
						name='apiKey'
						render={({ field }) => (
							<FormItem>
								<FormLabel className='text-secondary'>API Key</FormLabel>
								<FormControl>
									<Textarea
										placeholder='sk-1234567890abcdef...'
										className='glass-input resize-none font-mono text-sm'
										rows={3}
										{...field}
									/>
								</FormControl>
								<FormDescription className='text-xs text-gray-500'>
									Enter your API key or token
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)

			default:
				return null
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button className='gradient-border-btn'>
						<Plus className='h-4 w-4 mr-2' />
						Add Credential
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-md max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						{getTypeIcon(selectedType)}
						{editCredential ? 'Edit Credential' : 'Add Credential'}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						{editCredential
							? 'Update the credential details below.'
							: 'Create a new credential for connecting to your infrastructure.'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className='space-y-4'
					>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>
										Credential Name
									</FormLabel>
									<FormControl>
										<Input
											placeholder='Production SSH Key'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										A descriptive name for this credential
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='type'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>
										Credential Type
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className='glass-input'>
												<SelectValue placeholder='Select credential type' />
											</SelectTrigger>
										</FormControl>
										<SelectContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
											<SelectItem value='ssh_key'>
												<div className='flex items-center gap-2'>
													<Key className='h-4 w-4 text-blue-400' />
													SSH Key
												</div>
											</SelectItem>
											<SelectItem value='password'>
												<div className='flex items-center gap-2'>
													<Lock className='h-4 w-4 text-purple-400' />
													Password
												</div>
											</SelectItem>
											<SelectItem value='ssl_cert'>
												<div className='flex items-center gap-2'>
													<Shield className='h-4 w-4 text-green-400' />
													SSL Certificate
												</div>
											</SelectItem>
											<SelectItem value='api_key'>
												<div className='flex items-center gap-2'>
													<Code className='h-4 w-4 text-orange-400' />
													API Key
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{renderTypeSpecificFields()}

						{(selectedType === 'ssl_cert' || selectedType === 'api_key') && (
							<FormField
								control={form.control}
								name='expiresAt'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-secondary'>
											Expiration Date
										</FormLabel>
										<FormControl>
											<Input type='date' className='glass-input' {...field} />
										</FormControl>
										<FormDescription className='text-xs text-gray-500'>
											Leave empty if credential doesn't expire
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Additional details about this credential...'
											className='glass-input resize-none'
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex gap-3 pt-4'>
							<Button
								type='submit'
								disabled={isSubmitting}
								className='gradient-border-btn flex-1'
							>
								{isSubmitting
									? 'Saving...'
									: editCredential
										? 'Update Credential'
										: 'Create Credential'}
							</Button>
							<Button
								type='button'
								variant='ghost'
								onClick={() => setOpen(false)}
								className='glass-btn'
							>
								Cancel
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
