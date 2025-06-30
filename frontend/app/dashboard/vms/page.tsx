'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { VMTable } from '@/components/dashboard/VMTable'
import { AddVMModal } from '@/components/dashboard/AddVMModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVMs } from '@/hooks/useVMs'
import {
	Server,
	Plus,
	ArrowLeft,
	Users,
	Settings,
	Activity,
	AlertCircle,
} from 'lucide-react'

export default function VMsPage() {
	const { vms, addVM, deleteVM, assignVMToGroup, assignConfigToVM } = useVMs()
	const [selectedVMForGroup, setSelectedVMForGroup] = useState<string | null>(
		null
	)
	const [selectedVMForConfig, setSelectedVMForConfig] = useState<string | null>(
		null
	)

	const connectedVMs = vms.filter(vm => vm.status === 'connected')
	const disconnectedVMs = vms.filter(vm => vm.status === 'disconnected')
	const errorVMs = vms.filter(vm => vm.status === 'error')
	const avgHealth =
		vms.length > 0
			? Math.round(vms.reduce((sum, vm) => sum + vm.health, 0) / vms.length)
			: 0

	const handleAssignToGroup = (vmId: string) => {
		setSelectedVMForGroup(vmId)
		// In a real app, this would open a dialog to select a group
		console.log('Assign VM to group:', vmId)
	}

	const handleAssignConfig = (vmId: string) => {
		setSelectedVMForConfig(vmId)
		// In a real app, this would open a dialog to select a config
		console.log('Assign config to VM:', vmId)
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
									Virtual Machines
								</h1>
								<p className='text-lg text-gray-200'>
									Manage and monitor your connected virtual machines and their
									health status.
								</p>
							</div>
						</div>
						<AddVMModal onAddVM={addVM} />
					</div>
				</div>

				{/* Quick Actions */}
				{/* <div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Quick Actions
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<Link href='/dashboard/vm-groups' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 mr-4'>
									<Users className='h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Manage Groups
									</div>
									<div className='text-sm text-secondary'>
										Organize VMs into logical groups
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
										Assign Configs
									</div>
									<div className='text-sm text-secondary'>
										Apply infrastructure configurations
									</div>
								</div>
							</Button>
						</Link>

						<AddVMModal
							onAddVM={addVM}
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
											Add New VM
										</div>
										<div className='text-sm text-secondary'>
											Connect a new virtual machine
										</div>
									</div>
								</Button>
							}
						/>
					</div>
				</div> */}

				{/* Stats Overview */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>VM Overview</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{/* Total VMs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Total VMs
									</p>
									<p className='text-3xl font-bold text-primary mb-2'>
										{vms.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm'>
									<Server className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Connected VMs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Connected
									</p>
									<p className='text-3xl font-bold text-green-400 mb-2'>
										{connectedVMs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm'>
									<Activity className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Disconnected VMs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Disconnected
									</p>
									<p className='text-3xl font-bold text-yellow-400 mb-2'>
										{disconnectedVMs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 backdrop-blur-sm'>
									<AlertCircle className='h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Average Health */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Avg Health
									</p>
									<p
										className={`text-3xl font-bold mb-2 ${
											avgHealth >= 90
												? 'text-green-400'
												: avgHealth >= 70
													? 'text-yellow-400'
													: 'text-red-400'
										}`}
									>
										{avgHealth}%
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 backdrop-blur-sm'>
									<Settings className='h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* VM Table */}
				<VMTable
					vms={vms}
					onDeleteVM={deleteVM}
					onAssignToGroup={handleAssignToGroup}
					onAssignConfig={handleAssignConfig}
				/>
			</div>
		</DashboardLayout>
	)
}
