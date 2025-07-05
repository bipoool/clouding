'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Server,
	MoreVertical,
	Trash2,
	Settings,
	Users,
	Search,
	Filter,
	Key,
	Lock,
	Shield,
	Code,
} from 'lucide-react'
import type { VM } from '@/hooks/useVMs'
import { useCredentials } from '@/hooks/useCredentials'

interface VMTableProps {
	vms: VM[]
	onDeleteVM: (id: string) => void
	onAssignToGroup: (vmId: string) => void
	onAssignConfig: (vmId: string) => void
}

export function VMTable({
	vms,
	onDeleteVM,
	onAssignToGroup,
	onAssignConfig,
}: VMTableProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'connected' | 'disconnected' | 'error'
	>('all')

	const { credentials } = useCredentials()

	// Helper function to get credential by ID
	const getCredentialById = (credentialId: string) => {
		return credentials.find(c => c.id === credentialId)
	}

	const filteredVMs = vms.filter(vm => {
		const matchesSearch =
			vm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			vm.ip.includes(searchTerm)
		const matchesStatus = statusFilter === 'all' || vm.status === statusFilter
		return matchesSearch && matchesStatus
	})

	const getStatusBadge = (status: VM['status']) => {
		switch (status) {
			case 'connected':
				return (
					<Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
						Connected
					</Badge>
				)
			case 'disconnected':
				return (
					<Badge className='bg-yellow-500/20 text-yellow-400 border-yellow-500/30'>
						Disconnected
					</Badge>
				)
			case 'error':
				return (
					<Badge className='bg-red-500/20 text-red-400 border-red-500/30'>
						Error
					</Badge>
				)
			default:
				return <Badge variant='secondary'>Unknown</Badge>
		}
	}

	const getOSIcon = (os: VM['os']) => {
		// In a real app, you'd have proper OS icons
		return (
			<div className='w-6 h-6 rounded bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center'>
				<Server className='h-3 w-3 text-blue-400' />
			</div>
		)
	}

	const formatLastSeen = (lastSeen: string) => {
		const date = new Date(lastSeen)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)

		if (diffMins < 1) return 'Just now'
		if (diffMins < 60) return `${diffMins}m ago`
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
		return `${Math.floor(diffMins / 1440)}d ago`
	}

	return (
		<div className='space-y-6'>
			{/* Header with Search and Filters */}
			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
				<div className='flex flex-1 gap-4 items-center'>
					<div className='relative flex-1 max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search VMs by name or IP...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10 glass-input'
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='glass-btn'>
								<Filter className='h-4 w-4 mr-2' />
								{statusFilter === 'all' ? 'All Status' : statusFilter}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
							<DropdownMenuItem onClick={() => setStatusFilter('all')}>
								All Status
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter('connected')}>
								Connected
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter('disconnected')}>
								Disconnected
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setStatusFilter('error')}>
								Error
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className='text-sm text-secondary'>
					Showing {filteredVMs.length} of {vms.length} VMs
				</div>
			</div>

			{/* VM Table */}
			<div className='glass-card p-0 overflow-hidden'>
				<Table>
					<TableHeader>
						<TableRow className='border-b border-white/10 hover:bg-white/5'>
							<TableHead className='text-secondary font-medium'>VM</TableHead>
							<TableHead className='text-secondary font-medium'>
								Status
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Health
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Credential
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Group
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Config
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Last Seen
							</TableHead>
							<TableHead className='w-12'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredVMs.map(vm => (
							<TableRow
								key={vm.id}
								className='border-b border-white/5 hover:bg-white/5 transition-colors'
							>
								<TableCell>
									<div className='flex items-center gap-3'>
										{getOSIcon(vm.os)}
										<div>
											<div className='font-medium text-primary'>{vm.name}</div>
											<div className='text-sm text-secondary'>{vm.ip}</div>
											<div className='text-xs text-gray-500 capitalize'>
												{vm.os}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>{getStatusBadge(vm.status)}</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<div className='w-20 bg-white/10 rounded-full h-2'>
											<div
												className={`h-2 rounded-full transition-all duration-500 ${
													(vm.health || 0) > 80
														? 'bg-green-500'
														: (vm.health || 0) > 50
															? 'bg-yellow-500'
															: 'bg-red-500'
												}`}
												style={{ width: `${vm.health || 0}%` }}
											/>
										</div>
										<span className='text-sm text-secondary'>
											{vm.health || 0}%
										</span>
									</div>
								</TableCell>
								<TableCell>
									{vm.credentialId ? (
										(() => {
											const credential = getCredentialById(vm.credentialId)
											return credential ? (
												<div className='flex items-center gap-2'>
													<Key className='h-4 w-4 text-blue-400' />
													<div>
														<div className='text-sm font-medium text-primary'>
															{credential.name}
														</div>
														<div className='text-xs text-secondary'>
															{credential.type === 'ssh_key'
																? 'SSH Private Key'
																: credential.type}
														</div>
													</div>
												</div>
											) : (
												<Badge className='bg-red-500/20 text-red-400 border-red-500/30'>
													Invalid Credential
												</Badge>
											)
										})()
									) : (
										<div className='text-xs text-gray-400'>
											No credential assigned
										</div>
									)}
								</TableCell>
								<TableCell>
									{vm.group ? (
										<Badge
											variant='outline'
											className='bg-blue-500/10 text-blue-400 border-blue-500/30'
										>
											{vm.group}
										</Badge>
									) : (
										<Button
											variant='ghost'
											size='sm'
											onClick={() => onAssignToGroup(vm.id)}
											className='text-xs text-gray-400 hover:text-cyan-400'
										>
											<Users className='h-3 w-3 mr-1' />
											Assign
										</Button>
									)}
								</TableCell>
								<TableCell>
									{vm.configId ? (
										<div className='flex items-center gap-2'>
											<Badge
												variant='outline'
												className='bg-green-500/10 text-green-400 border-green-500/30'
											>
												<Settings className='h-3 w-3 mr-1' />
												Configured
											</Badge>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => onAssignConfig(vm.id)}
												className='text-xs text-gray-400 hover:text-cyan-400'
												title='Change configuration'
											>
												<Settings className='h-3 w-3' />
											</Button>
										</div>
									) : (
										<Button
											variant='ghost'
											size='sm'
											onClick={() => onAssignConfig(vm.id)}
											className='text-xs text-gray-400 hover:text-cyan-400'
										>
											<Settings className='h-3 w-3 mr-1' />
											Assign
										</Button>
									)}
								</TableCell>
								<TableCell className='text-secondary text-sm'>
									{vm.lastSeen ? formatLastSeen(vm.lastSeen) : 'Never'}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
												<MoreVertical className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align='end'
											className='bg-black/90 backdrop-blur-sm border border-white/10'
										>
											<DropdownMenuItem onClick={() => onAssignToGroup(vm.id)}>
												<Users className='h-4 w-4 mr-2' />
												Assign to Group
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onAssignConfig(vm.id)}>
												<Settings className='h-4 w-4 mr-2' />
												Assign Config
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDeleteVM(vm.id)}
												className='text-red-400 hover:text-red-300 hover:bg-red-900/30'
											>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete VM
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{filteredVMs.length === 0 && (
					<div className='text-center py-12'>
						<Server className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-secondary mb-2'>No VMs found</p>
						<p className='text-sm text-gray-500'>
							{searchTerm || statusFilter !== 'all'
								? 'Try adjusting your search or filters'
								: 'Add your first VM to get started'}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
