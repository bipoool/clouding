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
	MoreVertical,
	Eye,
	Play,
	Settings,
	Trash2,
	FileCode,
	Layers,
	Clock,
} from 'lucide-react'
import type { InfraConfig } from '@/hooks/useInfraConfigs'

interface InfraConfigCardProps {
	config: InfraConfig
	onViewPlan: (config: InfraConfig) => void
	onDeploy: (configId: string) => void
	onAssign: (configId: string) => void
	onDelete: (configId: string) => void
	onEdit: (configId: string) => void
}

export function InfraConfigCard({
	config,
	onViewPlan,
	onDeploy,
	onAssign,
	onDelete,
	onEdit,
}: InfraConfigCardProps) {
	const getTypeIcon = (type: InfraConfig['type']) => {
		switch (type) {
			case 'web-service':
				return '🌐'
			case 'database':
				return '🗄️'
			case 'monitoring':
				return '📊'
			case 'load-balancer':
				return '⚖️'
			default:
				return '📦'
		}
	}

	const getTypeColor = (type: InfraConfig['type']) => {
		switch (type) {
			case 'web-service':
				return 'from-green-500/20 to-emerald-500/10'
			case 'database':
				return 'from-purple-500/20 to-violet-500/10'
			case 'monitoring':
				return 'from-orange-500/20 to-yellow-500/10'
			case 'load-balancer':
				return 'from-blue-500/20 to-cyan-500/10'
			default:
				return 'from-gray-500/20 to-slate-500/10'
		}
	}

	const getStatusBadge = (status: InfraConfig['deploymentStatus']) => {
		switch (status) {
			case 'deployed':
				return (
					<Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
						Deployed
					</Badge>
				)
			case 'failed':
				return (
					<Badge className='bg-red-500/20 text-red-400 border-red-500/30'>
						Failed
					</Badge>
				)
			default:
				return (
					<Badge className='bg-gray-500/20 text-gray-400 border-gray-500/30'>
						Draft
					</Badge>
				)
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const totalAssignments =
		config.assignedVMs.length + config.assignedGroups.length

	return (
		<div className='glass-card glass-card-hover group relative overflow-hidden'>
			{/* Background gradient based on type */}
			<div
				className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(config.type)} opacity-40`}
			/>

			<div className='relative z-10'>
				{/* Header */}
				<div className='flex items-start justify-between mb-4'>
					<div className='flex-1'>
						<div className='flex items-center gap-3 mb-2'>
							<div className='text-2xl'>{getTypeIcon(config.type)}</div>
							<div>
								<h3 className='text-lg font-bold text-primary'>
									{config.name}
								</h3>
								<div className='flex items-center gap-2 mt-1'>
									<Badge
										variant='outline'
										className='text-xs bg-white/5 border-white/20'
									>
										{config.type.replace('-', ' ')}
									</Badge>
									{getStatusBadge(config.deploymentStatus)}
								</div>
							</div>
						</div>
						{config.description && (
							<p className='text-sm text-secondary line-clamp-2'>
								{config.description}
							</p>
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
							<DropdownMenuItem onClick={() => onViewPlan(config)}>
								<Eye className='h-4 w-4 mr-2' />
								View Plan
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onEdit(config.id)}>
								<Settings className='h-4 w-4 mr-2' />
								Edit Config
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onAssign(config.id)}>
								<Layers className='h-4 w-4 mr-2' />
								Assign to VMs
							</DropdownMenuItem>
							{config.deploymentStatus !== 'deployed' && (
								<DropdownMenuItem onClick={() => onDeploy(config.id)}>
									<Play className='h-4 w-4 mr-2' />
									Deploy
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								onClick={() => onDelete(config.id)}
								className='text-red-400 hover:text-red-300 hover:bg-red-900/30'
							>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Stats */}
				<div className='grid grid-cols-3 gap-3 mb-4'>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Components</div>
						<div className='text-lg font-bold text-primary'>
							{config.nodes.length}
						</div>
					</div>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Connections</div>
						<div className='text-lg font-bold text-primary'>
							{config.edges.length}
						</div>
					</div>
					<div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
						<div className='text-xs text-secondary mb-1'>Assigned</div>
						<div className='text-lg font-bold text-primary'>
							{totalAssignments}
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className='flex gap-2 mb-4'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => onViewPlan(config)}
						className='flex-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10'
					>
						<FileCode className='h-3 w-3 mr-1' />
						View Plan
					</Button>
					{config.deploymentStatus === 'deployed' ? (
						<Button
							variant='ghost'
							size='sm'
							onClick={() => onAssign(config.id)}
							className='flex-1 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30'
						>
							<Layers className='h-3 w-3 mr-1' />
							Assign
						</Button>
					) : (
						<Button
							variant='ghost'
							size='sm'
							onClick={() => onDeploy(config.id)}
							className='flex-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30'
						>
							<Play className='h-3 w-3 mr-1' />
							Deploy
						</Button>
					)}
				</div>

				{/* Assignments */}
				{totalAssignments > 0 && (
					<div className='mb-4'>
						<div className='text-xs text-secondary mb-2'>Assignments</div>
						<div className='flex flex-wrap gap-1'>
							{config.assignedVMs.map(vmId => (
								<Badge
									key={vmId}
									variant='outline'
									className='text-xs bg-blue-500/10 text-blue-400 border-blue-500/30'
								>
									VM: {vmId}
								</Badge>
							))}
							{config.assignedGroups.map(groupId => (
								<Badge
									key={groupId}
									variant='outline'
									className='text-xs bg-purple-500/10 text-purple-400 border-purple-500/30'
								>
									Group: {groupId}
								</Badge>
							))}
						</div>
					</div>
				)}

				{/* Footer */}
				<div className='flex items-center justify-between pt-4 border-t border-white/10'>
					<div className='text-xs text-secondary flex items-center gap-1'>
						<Clock className='h-3 w-3' />
						Updated {formatDate(config.updatedAt)}
					</div>

					<div className='flex items-center gap-1'>
						{config.deploymentStatus === 'deployed' && (
							<div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
						)}
						<span className='text-xs text-secondary'>
							{config.deploymentStatus === 'deployed' ? 'Live' : 'Draft'}
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}
