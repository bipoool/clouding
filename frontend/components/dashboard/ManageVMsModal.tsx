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
import { Server, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import type { VM, VMGroup } from '@/hooks/useVMs'

interface ManageVMsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	group: VMGroup
	groupVMs: VM[]
	onRemoveVM: (groupId: string, vmId: string) => Promise<void>
}

export function ManageVMsModal({
	open,
	onOpenChange,
	group,
	groupVMs,
	onRemoveVM,
}: ManageVMsModalProps) {
	const [removingVMId, setRemovingVMId] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	// Reset state when modal opens/closes
	useEffect(() => {
		if (open) {
			setRemovingVMId(null)
			setError(null)
		}
	}, [open])

	const handleRemoveVM = async (vmId: string) => {
		setRemovingVMId(vmId)
		setError(null)

		try {
			await onRemoveVM(group.id, vmId)
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to remove VM from group'
			setError(errorMessage)
			logger.error('Failed to remove VM from group:', error)
		} finally {
			setRemovingVMId(null)
		}
	}

	const getVMHealthColor = (health?: number) => {
		if (!health) return 'text-gray-400'
		if (health >= 90) return 'text-green-400'
		if (health >= 70) return 'text-yellow-400'
		return 'text-red-400'
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col'>
				<DialogHeader>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<Server className='h-5 w-5 text-cyan-400' />
						Manage VMs in {group.name}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						View and manage VMs in this group. Click the trash icon to remove a VM.
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 overflow-hidden flex flex-col'>
					{/* Header with count */}
					<div className='flex items-center justify-between p-4 border-b border-white/10'>
						<div className='text-sm text-secondary'>
							{groupVMs.length} VM{groupVMs.length !== 1 ? 's' : ''} in group
						</div>
					</div>

					{/* VM List */}
					<div className='flex-1 overflow-y-auto p-4 space-y-2'>
						{groupVMs.length === 0 ? (
							<div className='text-center py-8 text-secondary'>
								<Server className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p>No VMs in this group</p>
								<p className='text-xs text-gray-500 mt-1'>
									Add VMs to get started
								</p>
							</div>
						) : (
							groupVMs.map(vm => (
								<div
									key={vm.id}
									className='flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors'
								>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between mb-1'>
											<h4 className='text-sm font-medium text-primary truncate'>
												{vm.name || `VM ${vm.id}`}
											</h4>
											<div className='flex items-center gap-2 ml-2'>
												{vm.health !== undefined && (
													<span className={`text-xs ${getVMHealthColor(vm.health)}`}>
														{vm.health}%
													</span>
												)}
											</div>
										</div>
										<div className='text-xs text-secondary truncate'>
											{vm.ip || 'No IP address'}
										</div>
									</div>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => handleRemoveVM(vm.id)}
										disabled={removingVMId === vm.id}
										className='ml-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-auto'
									>
										{removingVMId === vm.id ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											<Trash2 className='h-4 w-4' />
										)}
									</Button>
								</div>
							))
						)}
					</div>

					{/* Error Display */}
					{error && (
						<div className='p-4 bg-red-500/10 border-t border-red-500/30'>
							<div className='flex items-center gap-2'>
								<AlertTriangle className='h-4 w-4 text-red-400' />
								<p className='text-sm text-red-400'>{error}</p>
							</div>
						</div>
					)}

					{/* Footer */}
					<div className='flex gap-3 p-4 border-t border-white/10'>
						<Button
							type='button'
							variant='ghost'
							onClick={() => onOpenChange(false)}
							className='flex-1 glass-btn'
							disabled={removingVMId !== null}
						>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
