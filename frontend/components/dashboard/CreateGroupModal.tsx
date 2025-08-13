'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Users } from 'lucide-react'
import type { VMGroup } from '@/hooks/useVMs'

const groupSchema = z.object({
	name: z.string().min(1, 'Group name is required').max(50, 'Name too long'),
	description: z.string().max(200, 'Description too long').optional(),
})

type GroupFormData = z.infer<typeof groupSchema>

interface CreateGroupModalProps {
	onCreateGroup: (group: Omit<VMGroup, 'id' | 'createdAt' | 'vmIds' | 'updatedAt'>) => void
	trigger?: React.ReactNode
}

export function CreateGroupModal({
	onCreateGroup,
	trigger,
}: CreateGroupModalProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<GroupFormData>({
		resolver: zodResolver(groupSchema),
		defaultValues: {
			name: '',
			description: '',
		},
	})

	const handleSubmit = async (data: GroupFormData) => {
		setIsSubmitting(true)

		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500))

			const newGroup: Omit<VMGroup, 'id' | 'createdAt' | 'vmIds' | 'updatedAt'> = {
				name: data.name,
				description: data.description || undefined,
			}

			onCreateGroup(newGroup)
			setOpen(false)
			form.reset()
		} catch (error) {
			logger.error('Failed to create group:', error)
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
						Create Group
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-md'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<Users className='h-5 w-5 text-cyan-400' />
						Create VM Group
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						Create a new group to organize and manage multiple VMs together.
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
									<FormLabel className='text-secondary'>Group Name</FormLabel>
									<FormControl>
										<Input
											placeholder='Production Web Servers'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										A descriptive name for this VM group
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='text-secondary'>
										Description (Optional)
									</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Add a description to help identify this group...'
											className='glass-input resize-none'
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										Optional description of the group's purpose
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
								disabled={isSubmitting}
								className='flex-1 gradient-border-btn'
							>
								{isSubmitting ? 'Creating...' : 'Create Group'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
