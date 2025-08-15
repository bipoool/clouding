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
import { Plus, Server, Key, Lock, ExternalLink } from 'lucide-react'
import type { VM } from '@/hooks/useVMs'
import { useCredentials } from '@/hooks/useCredentials'
import Link from 'next/link'

const vmSchema = z.object({
	name: z.string().min(1, 'VM name is required').max(50, 'Name too long'),
	ip: z.string().ip('Invalid IP address'),
	os: z.enum(['ubuntu', 'centos', 'debian', 'alpine', 'windows'], {
		required_error: 'Please select an operating system',
	}),
	credentialId: z.string().min(1, 'Please select a credential'),
})

type VMFormData = z.infer<typeof vmSchema>

interface AddVMModalProps {
	onAddVM: (vm: Partial<VM>) => Promise<VM>
	onUpdateVM?: (id: string, updates: Partial<VM>) => Promise<void>
	editingVM?: VM | null
	onEditComplete?: () => void
	trigger?: React.ReactNode
}

export function AddVMModal({ onAddVM, onUpdateVM, editingVM, onEditComplete, trigger }: AddVMModalProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { getSSHCredentials } = useCredentials()

	const sshCredentials = getSSHCredentials()
	const isEditing = !!editingVM

	// Auto-open modal when editingVM is provided
	useEffect(() => {
		if (editingVM) {
			setOpen(true)
		}
	}, [editingVM])

	const form = useForm<VMFormData>({
		resolver: zodResolver(vmSchema),
		defaultValues: {
			name: '',
			ip: '',
			os: 'ubuntu',
			credentialId: '',
		},
	})

	// Update form when editingVM changes
	useEffect(() => {
		if (editingVM) {
			const osValue = ['ubuntu', 'centos', 'debian', 'alpine', 'windows'].includes(editingVM.os || '')
				? editingVM.os as 'ubuntu' | 'centos' | 'debian' | 'alpine' | 'windows'
				: 'ubuntu'
			
			form.reset({
				name: editingVM.name || '',
				ip: editingVM.ip || '',
				os: osValue,
				credentialId: editingVM.credentialId || '',
			})
		} else {
			form.reset({
				name: '',
				ip: '',
				os: 'ubuntu',
				credentialId: '',
			})
		}
	}, [editingVM, form])

	const handleSubmit = async (data: VMFormData) => {
		setIsSubmitting(true)

		try {
			if (isEditing && editingVM && onUpdateVM) {
				// Update existing VM
				const updates: Partial<VM> = {
					name: data.name.trim(),
					ip: data.ip,
					os: data.os,
					credentialId: data.credentialId,
				}
				await onUpdateVM(editingVM.id, updates)
				setOpen(false)
				onEditComplete?.()
			} else {
				// Add new VM
				const newVM: Partial<VM> = {
					name: data.name.trim(),
					ip: data.ip,
					os: data.os,
					status: 'connected', // Assume connected for demo
					health: Math.floor(Math.random() * 20) + 80, // Random health 80-100
					credentialId: data.credentialId,
				}
				await onAddVM(newVM)
				setOpen(false)
				form.reset()
			}
		} catch (error) {
			logger.error(`Failed to ${isEditing ? 'update' : 'add'} VM:`, error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (!newOpen && isEditing) {
			onEditComplete?.()
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button className='gradient-border-btn'>
						<Plus className='h-4 w-4 mr-2' />
						Add VM
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-md'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<Server className='h-5 w-5 text-cyan-400' />
						{isEditing ? 'Edit Virtual Machine' : 'Add Virtual Machine'}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						{isEditing ? 'Modify the connection details and authentication credentials of an existing VM.' : 'Connect an existing VM by providing its connection details and selecting authentication credentials.'}
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
									<FormLabel className='text-secondary'>VM Name</FormLabel>
									<FormControl>
										<Input
											placeholder='Production Web Server'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										A descriptive name for this virtual machine
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='ip'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>IP Address</FormLabel>
									<FormControl>
										<Input
											placeholder='192.168.1.100'
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
							name='os'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>
										Operating System
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className='glass-input'>
												<SelectValue placeholder='Select OS' />
											</SelectTrigger>
										</FormControl>
										<SelectContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
											<SelectItem value='ubuntu'>Ubuntu</SelectItem>
											<SelectItem value='centos'>CentOS</SelectItem>
											<SelectItem value='debian'>Debian</SelectItem>
											<SelectItem value='alpine'>Alpine Linux</SelectItem>
											<SelectItem value='windows'>Windows Server</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='credentialId'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary flex items-center gap-2'>
										SSH Credential
										<Link
											href='/dashboard/credentials'
											className='text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1'
											onClick={e => e.stopPropagation()}
										>
											<ExternalLink className='h-3 w-3' />
											Manage
										</Link>
									</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className='glass-input'>
												<SelectValue placeholder='Select SSH credential'>
													{field.value && sshCredentials.find(c => c.id.toString() === field.value)?.name}
												</SelectValue>
											</SelectTrigger>
										</FormControl>
										<SelectContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
											{sshCredentials.length === 0 ? (
												<div className='p-4 text-center text-secondary'>
													<Key className='h-8 w-8 mx-auto mb-2 text-gray-400' />
													<p className='text-sm mb-2'>
														No SSH credentials found
													</p>
													<Link href='/dashboard/credentials'>
														<Button
															size='sm'
															className='text-xs'
															onClick={() => setOpen(false)}
														>
															Create Credential
														</Button>
													</Link>
												</div>
											) : (
												sshCredentials.map(credential => (
													<SelectItem key={credential.id} value={credential.id}>
														<div className='flex items-center gap-2'>
															{credential.type === 'ssh_key' && (
																<Key className='h-4 w-4 text-blue-400' />
															)}
															{credential.type === 'password' && (
																<Lock className='h-4 w-4 text-purple-400' />
															)}
															<div>
																<div className='font-medium'>
																	{credential.name}
																</div>
																<div className='text-xs text-gray-400'>
																	{credential.type === 'ssh_key' &&
																		'SSH Private Key'}
																	{credential.type === 'password' &&
																		credential.secret && credential.secret.username &&
																		`User: ${credential.secret.username}`}
																</div>
															</div>
														</div>
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormDescription className='text-xs text-gray-500'>
										Choose an SSH credential to connect to this VM
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex gap-3 pt-4'>
							<Button
								type='button'
								variant='ghost'
								onClick={() => setOpen(false)}
								className='flex-1 glass-btn'
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting || sshCredentials.length === 0}
								className='flex-1 gradient-border-btn'
							>
								{isSubmitting 
									? (isEditing ? 'Updating...' : 'Adding...') 
									: (isEditing ? 'Update VM' : 'Add VM')
								}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
