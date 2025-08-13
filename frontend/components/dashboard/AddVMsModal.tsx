'use client'

import { useState, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Server, Plus, Loader2 } from 'lucide-react'
import type { VM, VMGroup } from '@/hooks/useVMs'

interface AddVMsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	group: VMGroup
	allVMs: VM[]
	onAddVMs: (groupId: string, vmIds: string[]) => Promise<void>
}

export function AddVMsModal({
	open,
	onOpenChange,
	group,
	allVMs,
	onAddVMs,
}: AddVMsModalProps) {
	const [selectedVMIds, setSelectedVMIds] = useState<string[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Filter out VMs that are already in the group
	const availableVMs = allVMs.filter(vm => !group.vmIds.includes(vm.id))

	// Reset state when modal opens/closes
	useEffect(() => {
		if (open) {
			setSelectedVMIds([])
			setError(null)
		}
	}, [open])

	const handleVMSelection = (vmId: string, checked: boolean) => {
		if (checked) {
			setSelectedVMIds(prev => [...prev, vmId])
		} else {
			setSelectedVMIds(prev => prev.filter(id => id !== vmId))
		}
	}

	const handleSelectAll = () => {
		if (selectedVMIds.length === availableVMs.length) {
			setSelectedVMIds([])
		} else {
			setSelectedVMIds(availableVMs.map(vm => vm.id))
		}
	}

	const handleSubmit = async () => {
		if (selectedVMIds.length === 0) {
			setError('Please select at least one VM to add')
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			await onAddVMs(group.id, selectedVMIds)
			onOpenChange(false)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to add VMs to group'
			setError(errorMessage)
			logger.error('Failed to add VMs to group:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<Plus className='h-5 w-5 text-cyan-400' />
						Add VMs to {group.name}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						Select VMs to add to this group. VMs already in the group are not shown.
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 overflow-hidden flex flex-col'>
					{/* Header with select all */}
					<div className='flex items-center justify-between p-4 border-b border-white/10'>
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='select-all'
								checked={selectedVMIds.length === availableVMs.length && availableVMs.length > 0}
								onCheckedChange={handleSelectAll}
							/>
							<Label htmlFor='select-all' className='text-sm text-secondary'>
								Select All ({selectedVMIds.length}/{availableVMs.length})
							</Label>
						</div>
					</div>

					{/* VM List */}
					<div className='flex-1 overflow-y-auto p-4 space-y-2'>
						{availableVMs.length === 0 ? (
							<div className='text-center py-8 text-secondary'>
								<Server className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No available VMs to add</p>
								<p className='text-xs text-gray-500 mt-1'>
									All VMs are already in this group
								</p>
							</div>
						) : (
							availableVMs.map(vm => (
								<div
									key={vm.id}
									className='flex items-center space-x-3 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors'
								>
									<Checkbox
										id={`vm-${vm.id}`}
										checked={selectedVMIds.includes(vm.id)}
										onCheckedChange={(checked) => handleVMSelection(vm.id, checked as boolean)}
									/>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between'>
											<Label
												htmlFor={`vm-${vm.id}`}
												className='text-sm font-medium text-primary cursor-pointer truncate'
											>
												{vm.name || `VM ${vm.id}`}
											</Label>
										</div>
										<div className='text-xs text-secondary truncate'>
											{vm.ip || 'No IP address'}
										</div>
									</div>
								</div>
							))
						)}
					</div>

					{/* Error Display */}
					{error && (
						<div className='p-4 bg-red-500/10 border-t border-red-500/30'>
							<p className='text-sm text-red-400'>{error}</p>
						</div>
					)}

					{/* Footer */}
					<div className='flex gap-3 p-4 border-t border-white/10'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => onOpenChange(false)}
							className='flex-1 glass-btn'
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type='button'
							onClick={handleSubmit}
							disabled={isSubmitting || selectedVMIds.length === 0}
							className='flex-1 gradient-border-btn'
						>
							{isSubmitting ? (
								<>
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
									Adding...
								</>
							) : (
								<>
									<Plus className='h-4 w-4 mr-2' />
									Add {selectedVMIds.length} VM{selectedVMIds.length !== 1 ? 's' : ''}
								</>
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
