'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
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
import { useCredentialForm } from '@/hooks/useCredentialForm'
import { CredentialFormFields } from './credential-form-fields'
import {
	CREDENTIAL_TYPE_CONFIG,
	getCredentialTypeIconConfig,
	shouldShowExpirationField,
} from '@/lib/utils/credential-types'
import type {
	Credential,
	CreateCredentialData,
} from '@/lib/utils/credential-types'

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

	const { form, selectedType, isSubmitting, handleFileUpload, handleSubmit } =
		useCredentialForm({
			onAddCredential,
			onUpdateCredential,
			editCredential,
			onClose: () => setOpen(false),
		})

	// Auto-open modal when editCredential is provided
	useEffect(() => {
		if (editCredential) {
			setOpen(true)
		}
	}, [editCredential])

	const selectedTypeConfig = getCredentialTypeIconConfig(selectedType)
	const IconComponent = selectedTypeConfig.icon

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
						<IconComponent className={`h-5 w-5 ${selectedTypeConfig.color}`} />
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
						{/* Credential Name Field */}
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

						{/* Credential Type Field */}
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
											{Object.entries(CREDENTIAL_TYPE_CONFIG).map(
												([type, config]) => {
													const TypeIcon = config.icon
													return (
														<SelectItem key={type} value={type}>
															<div className='flex items-center gap-2'>
																<TypeIcon
																	className={`h-4 w-4 ${config.color}`}
																/>
																{config.label}
															</div>
														</SelectItem>
													)
												}
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Type-specific Fields */}
						<CredentialFormFields
							form={form}
							type={selectedType}
							onFileUpload={handleFileUpload}
						/>

						{/* Expiration Date Field (for SSL certs and API keys) */}
						{shouldShowExpirationField(selectedType) && (
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

						{/* Description Field */}
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

						{/* Action Buttons */}
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
