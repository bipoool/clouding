'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { VMGroupCard } from '@/components/dashboard/VMGroupCard'
import { CreateGroupModal } from '@/components/dashboard/CreateGroupModal'
import { VmGroupsPageSkeleton } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { useVMs, useVMGroups } from '@/hooks/useVMs'
import { logger } from '@/lib/utils/logger'
import {
	Users,
	Plus,
	ArrowLeft,
	Server,
	Activity,
	Settings,
} from 'lucide-react'

export default function VMGroupsPage() {
	const { vms, isLoading: vmsLoading, error: vmsError } = useVMs()
	const {
		groups,
		isLoading: groupsLoading,
		error: groupsError,
		createGroup,
		deleteGroup,
	} = useVMGroups()
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

	const totalVMsInGroups = groups.reduce(
		(sum, group) => sum + group.vmIds.length,
		0
	)
	const ungroupedVMs = vms.filter(vm => !vm.group)
	const activeGroups = groups.filter(group => group.vmIds.length > 0)

	const handleAddVMsToGroup = (groupId: string) => {
		setSelectedGroup(groupId)
		// In a real app, this would open a dialog to select VMs
		logger.log('Add VMs to group:', groupId)
	}

	const handleAssignConfig = (groupId: string) => {
		// In a real app, this would open a dialog to select a config
		logger.log('Assign config to group:', groupId)
	}

	const handleManageVMs = (groupId: string) => {
		// In a real app, this would open a management dialog
		logger.log('Manage VMs in group:', groupId)
	}

	if (vmsLoading || groupsLoading) {
		return (
			<DashboardLayout>
				<VmGroupsPageSkeleton />
			</DashboardLayout>
		)
	}

	if (vmsError || groupsError) {
		return (
			<DashboardLayout>
				<div className='space-y-8'>
					<div className='glass-card'>
						<div className='flex items-center justify-center py-12'>
							<div className='text-lg text-red-400'>
								Error loading data: {vmsError || groupsError}
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		)
	}

	return (
		<DashboardLayout>
			<div className='space-y-8'>
				{/* Header */}
				<Link href='/dashboard' className='interactive-element'>
					<Button variant='ghost' size='sm' className='glass-btn'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Dashboard
					</Button>
				</Link>
				<div className='glass-card'>
					<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
						<div className='flex items-center gap-4'>
							<div>
								<h1 className='text-3xl md:text-4xl font-bold text-primary mb-2 font-jetbrains'>
									VM Groups
								</h1>
								<p className='text-lg text-gray-200'>
									Organize and manage virtual machines in logical groups for
									easier administration.
								</p>
							</div>
						</div>
						<CreateGroupModal onCreateGroup={createGroup} />
					</div>
				</div>

				{/* Stats Overview */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Groups Overview
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{/* Total Groups */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Total Groups
									</p>
									<p className='text-3xl font-bold text-primary mb-2'>
										{groups.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm'>
									<Users className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Active Groups */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Active Groups
									</p>
									<p className='text-3xl font-bold text-green-400 mb-2'>
										{activeGroups.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm'>
									<Activity className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Grouped VMs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Grouped VMs
									</p>
									<p className='text-3xl font-bold text-blue-400 mb-2'>
										{totalVMsInGroups}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-sm'>
									<Server className='h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Ungrouped VMs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Ungrouped VMs
									</p>
									<p className='text-3xl font-bold text-yellow-400 mb-2'>
										{ungroupedVMs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 backdrop-blur-sm'>
									<Settings className='h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				{/* <div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Quick Actions
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<Link href='/dashboard/vms' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 mr-4'>
									<Server className='h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Manage VMs
									</div>
									<div className='text-sm text-secondary'>
										View and manage individual VMs
									</div>
								</div>
							</Button>
						</Link>

						<Link
							href='/dashboard/infrastructure'
							className='interactive-element'
						>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 mr-4'>
									<Settings className='h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Infrastructure Configs
									</div>
									<div className='text-sm text-secondary'>
										Assign configurations to groups
									</div>
								</div>
							</Button>
						</Link>

						<CreateGroupModal
							onCreateGroup={createGroup}
							trigger={
								<Button
									variant='ghost'
									className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
								>
									<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 mr-4'>
										<Plus className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform' />
									</div>
									<div>
										<div className='font-semibold text-primary text-lg mb-1'>
											Create New Group
										</div>
										<div className='text-sm text-secondary'>
											Organize VMs into a new group
										</div>
									</div>
								</Button>
							}
						/>
					</div>
				</div> */}

				{/* Groups Grid */}
				<div className='space-y-6'>
					<div className='flex items-center justify-between'>
						<div>
							<h2 className='text-2xl font-bold text-primary mb-2'>
								VM Groups
							</h2>
							<p className='text-secondary'>
								Manage your VM groups and their configurations
							</p>
						</div>
					</div>

					{groups.length > 0 ? (
						<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
							{groups.map(group => (
								<VMGroupCard
									key={group.id}
									group={group}
									vms={vms}
									onDeleteGroup={deleteGroup}
									onAddVMsToGroup={handleAddVMsToGroup}
									onAssignConfig={handleAssignConfig}
									onManageVMs={handleManageVMs}
								/>
							))}
						</div>
					) : (
						<div className='glass-card text-center py-12'>
							<Users className='h-16 w-16 text-gray-400 mx-auto mb-4' />
							<h3 className='text-xl font-semibold text-primary mb-2'>
								No VM Groups Created
							</h3>
							<p className='text-secondary mb-6 max-w-md mx-auto'>
								Create your first VM group to organize and manage multiple
								virtual machines together.
							</p>
							<CreateGroupModal onCreateGroup={createGroup} />
						</div>
					)}
				</div>

				{/* Ungrouped VMs Warning */}
				{ungroupedVMs.length > 0 && (
					<div className='glass-card border-yellow-500/20 bg-yellow-500/5'>
						<div className='flex items-start gap-4'>
							<div className='p-2 rounded-lg bg-yellow-500/20'>
								<Settings className='h-5 w-5 text-yellow-400' />
							</div>
							<div className='flex-1'>
								<h3 className='font-semibold text-primary mb-2'>
									Ungrouped VMs Detected
								</h3>
								<p className='text-secondary mb-4'>
									You have {ungroupedVMs.length} VM
									{ungroupedVMs.length !== 1 ? 's' : ''} that{' '}
									{ungroupedVMs.length !== 1 ? 'are' : 'is'} not assigned to any
									group. Consider organizing them into groups for better
									management.
								</p>
								<div className='flex gap-3'>
									<Link href='/dashboard/vms'>
										<Button variant='ghost' size='sm' className='glass-btn'>
											View Ungrouped VMs
										</Button>
									</Link>
									<CreateGroupModal
										onCreateGroup={createGroup}
										trigger={
											<Button size='sm' className='gradient-border-btn'>
												Create Group
											</Button>
										}
									/>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	)
}
