'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Users,
	MoreVertical,
	Trash2,
	Plus,
	Server,
	Activity,
} from 'lucide-react'
import type { VMGroup, VM } from '@/hooks/useVMs'

interface VMGroupCardProps {
	group: VMGroup
	vms: VM[]
	onDeleteGroup: (id: string) => void
	onAddVMsToGroup: (groupId: string) => void
	onManageVMs: (groupId: string) => void
}

export function VMGroupCard({
	group,
	vms,
	onDeleteGroup,
	onAddVMsToGroup,
	onManageVMs,
}: VMGroupCardProps) {
	const groupVMs = vms.filter(vm => group.vmIds.includes(vm.id))
	const connectedVMs = groupVMs.filter(vm => vm.status === 'connected')
	const avgHealth =
		groupVMs.length > 0
			? Math.round(
					groupVMs.reduce((sum, vm) => sum + (vm.health || 0), 0) /
						groupVMs.length
				)
			: 0

	const getHealthColor = (health: number) => {
		if (health >= 90) return 'text-green-400'
		if (health >= 70) return 'text-yellow-400'
		return 'text-red-400'
	}

	const getHealthGradient = (health: number) => {
		if (health >= 90) return 'from-green-500/30 to-emerald-500/10'
		if (health >= 70) return 'from-yellow-500/30 to-orange-500/10'
		return 'from-red-500/30 to-pink-500/10'
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
	}

	return (
		<div className='glass-card glass-card-hover group relative overflow-hidden'>
			{/* Background gradient based on health */}
			<div
				className={`absolute inset-0 bg-gradient-to-br ${getHealthGradient(avgHealth)} opacity-30`}
			/>

			<div className='relative z-10'>
				{/* Header */}
				<div className='flex items-start justify-between mb-4'>
					<div className='flex-1'>
						<div className='flex items-center gap-2 mb-1'>
							<Users className='h-5 w-5 text-cyan-400' />
							<h3 className='text-xl font-bold text-primary'>{group.name}</h3>
						</div>
						{group.description && (
							<p className='text-sm text-secondary'>{group.description}</p>
						)}
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								className='h-8 w-8 p-0 opacity-70 hover:opacity-100'
							>
								<MoreVertical className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='end'
							className='bg-black/90 backdrop-blur-sm border border-white/10'
						>
							<DropdownMenuItem onClick={() => onManageVMs(group.id)}>
								<Server className='h-4 w-4 mr-2' />
								Manage VMs
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onAddVMsToGroup(group.id)}>
								<Plus className='h-4 w-4 mr-2' />
								Add VMs
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onDeleteGroup(group.id)}
								className='text-red-400 hover:text-red-300 hover:bg-red-900/30'
							>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete Group
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Stats Grid */}
				<div className='grid grid-cols-3 gap-4 mb-6'>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Total VMs</div>
						<div className='text-2xl font-bold text-primary'>
							{group.vmIds.length}
						</div>
					</div>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Connected</div>
						<div className='text-2xl font-bold text-primary'>
							{connectedVMs.length}
						</div>
					</div>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Avg Health</div>
						<div className={`text-2xl font-bold ${getHealthColor(avgHealth)}`}>
							{avgHealth}%
						</div>
					</div>
				</div>

				{/* Health Bar */}
				{group.vmIds.length > 0 && (
					<div className='mb-4'>
						<div className='flex items-center justify-between text-sm mb-2'>
							<span className='text-secondary flex items-center gap-1'>
								<Activity className='h-3 w-3' />
								Group Health
							</span>
							<span className={`font-semibold ${getHealthColor(avgHealth)}`}>
								{avgHealth}%
							</span>
						</div>
						<div className='w-full bg-white/10 rounded-full h-2 backdrop-blur-sm'>
							<div
								className={`bg-gradient-to-r ${
									avgHealth >= 90
										? 'from-green-400/70 to-emerald-500/50'
										: avgHealth >= 70
											? 'from-yellow-400/70 to-orange-500/50'
											: 'from-red-400/70 to-pink-500/50'
								} h-2 rounded-full transition-all duration-500 shadow-lg`}
								style={{ width: `${avgHealth}%` }}
							/>
						</div>
					</div>
				)}
				{/* Footer */}
				<div className='flex items-center justify-between pt-4 border-t border-white/10'>
					<div className='text-xs text-secondary'>
						Created {formatDate(group.createdAt)}
					</div>

					<div className='flex gap-2'>
						{group.vmIds.length === 0 ? (
							<Button
								variant='ghost'
								size='sm'
								onClick={() => onAddVMsToGroup(group.id)}
								className='text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
							>
								<Plus className='h-4 w-4 mr-1' />
								Add VMs
							</Button>
						) : (
							<Button
								variant='ghost'
								size='sm'
								onClick={() => onManageVMs(group.id)}
								className='text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
							>
								<Server className='h-4 w-4 mr-1' />
								Manage
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
