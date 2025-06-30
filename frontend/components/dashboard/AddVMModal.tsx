'use client'

import { useState } from 'react'
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
import { Plus, Server } from 'lucide-react'
import type { VM } from '@/hooks/useVMs'

const vmSchema = z.object({
	name: z.string().min(1, 'VM name is required').max(50, 'Name too long'),
	ip: z.string().ip('Invalid IP address'),
	os: z.enum(['ubuntu', 'centos', 'debian', 'alpine', 'windows'], {
		required_error: 'Please select an operating system',
	}),
	sshUsername: z.string().min(1, 'SSH username is required'),
	sshPort: z.coerce
		.number()
		.min(1)
		.max(65535, 'Invalid port number')
		.default(22),
})

type VMFormData = z.infer<typeof vmSchema>

interface AddVMModalProps {
	onAddVM: (vm: Omit<VM, 'id' | 'createdAt' | 'lastSeen'>) => void
	trigger?: React.ReactNode
}

export function AddVMModal({ onAddVM, trigger }: AddVMModalProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<VMFormData>({
		resolver: zodResolver(vmSchema),
		defaultValues: {
			name: '',
			ip: '',
			os: 'ubuntu',
			sshUsername: 'ubuntu',
			sshPort: 22,
		},
	})

	const handleSubmit = async (data: VMFormData) => {
		setIsSubmitting(true)

		try {
			// Simulate connection test
			await new Promise(resolve => setTimeout(resolve, 1000))

			const newVM: Omit<VM, 'id' | 'createdAt' | 'lastSeen'> = {
				name: data.name,
				ip: data.ip,
				os: data.os,
				status: 'connected', // Assume connected for demo
				health: Math.floor(Math.random() * 20) + 80, // Random health 80-100
				sshCredentials: {
					username: data.sshUsername,
					port: data.sshPort,
				},
			}

			onAddVM(newVM)
			setOpen(false)
			form.reset()
		} catch (error) {
			console.error('Failed to add VM:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
						Add Virtual Machine
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						Connect an existing VM by providing its connection details.
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

						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='sshUsername'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-secondary'>
											SSH Username
										</FormLabel>
										<FormControl>
											<Input
												placeholder='ubuntu'
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
								name='sshPort'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='text-secondary'>SSH Port</FormLabel>
										<FormControl>
											<Input
												type='number'
												placeholder='22'
												className='glass-input'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

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
								disabled={isSubmitting}
								className='flex-1 gradient-border-btn'
							>
								{isSubmitting ? 'Connecting...' : 'Add VM'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
