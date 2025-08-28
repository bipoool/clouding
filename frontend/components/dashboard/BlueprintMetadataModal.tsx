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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Edit } from 'lucide-react'

const blueprintMetadataSchema = z.object({
	name: z.string().min(1, 'Blueprint name is required').max(100, 'Name too long'),
	description: z.string().max(500, 'Description too long').optional(),
})

type BlueprintMetadataFormData = z.infer<typeof blueprintMetadataSchema>

interface BlueprintMetadataModalProps {
	onSave: (data: BlueprintMetadataFormData) => Promise<void>
	initialData?: {
		name: string
		description?: string
	}
	trigger?: React.ReactNode
}

export function BlueprintMetadataModal({ onSave, initialData, trigger }: BlueprintMetadataModalProps) {
	const [open, setOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const isEditing = !!initialData

	const form = useForm<BlueprintMetadataFormData>({
		resolver: zodResolver(blueprintMetadataSchema),
		defaultValues: {
			name: '',
			description: '',
		},
	})

	// Update form when initialData changes
	useEffect(() => {
		if (initialData) {
			form.reset({
				name: initialData.name || '',
				description: initialData.description || '',
			})
		} else {
			form.reset({
				name: '',
				description: '',
			})
		}
	}, [initialData, form])

	// Also update form when modal opens to ensure latest data
	useEffect(() => {
		if (open && initialData) {
			form.reset({
				name: initialData.name || '',
				description: initialData.description || '',
			})
		}
	}, [open, initialData, form])

	const handleSubmit = async (data: BlueprintMetadataFormData) => {
		setIsSubmitting(true)

		try {
			await onSave(data)
			setOpen(false)
			if (!isEditing) {
				form.reset()
			}
		} catch (error) {
			logger.error(`Failed to ${isEditing ? 'update' : 'create'} blueprint:`, error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		// When opening the modal, ensure form is populated with current data
		if (newOpen && initialData) {
			form.reset({
				name: initialData.name || '',
				description: initialData.description || '',
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="ghost" size="sm" className="p-2 h-auto">
						<Edit className="h-4 w-4" />
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-md'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<FileText className='h-5 w-5 text-cyan-400' />
						{isEditing ? 'Edit Blueprint' : 'Create Blueprint'}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						{isEditing ? 'Modify the name and description of your blueprint.' : 'Give your blueprint a name and description to help you identify it later.'}
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
									<FormLabel className='text-secondary'>Blueprint Name</FormLabel>
									<FormControl>
										<Input
											placeholder='Production Web Stack'
											className='glass-input'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										A descriptive name for this blueprint
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
									<FormLabel className='text-secondary'>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder='Web server configuration with load balancer and database...'
											className='glass-input min-h-[80px]'
											{...field}
										/>
									</FormControl>
									<FormDescription className='text-xs text-gray-500'>
										Optional description to help you remember what this blueprint does
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
								{isSubmitting 
									? (isEditing ? 'Updating...' : 'Creating...') 
									: (isEditing ? 'Update Blueprint' : 'Create Blueprint')
								}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
