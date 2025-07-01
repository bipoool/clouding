'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { InfraConfigCard } from '@/components/dashboard/InfraConfigCard'
import { ViewPlanModal } from '@/components/dashboard/ViewPlanModal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInfraConfigs } from '@/hooks/useInfraConfigs'
import { logger } from '@/lib/utils/logger'
import {
	ArrowLeft,
	Plus,
	Settings,
	Layers,
	Activity,
	FileCode,
	Play,
} from 'lucide-react'
import type { InfraConfig } from '@/hooks/useInfraConfigs'

export default function InfrastructurePage() {
	const {
		configs,
		saveConfig,
		updateConfig,
		deleteConfig,
		deployConfig,
		generatePlan,
	} = useInfraConfigs()
	const [viewPlanConfig, setViewPlanConfig] = useState<InfraConfig | null>(null)
	const [generatedPlan, setGeneratedPlan] = useState('')
	const [isViewPlanOpen, setIsViewPlanOpen] = useState(false)

	const deployedConfigs = configs.filter(
		config => config.deploymentStatus === 'deployed'
	)
	const draftConfigs = configs.filter(
		config => config.deploymentStatus === 'draft'
	)
	const totalAssignments = configs.reduce(
		(sum, config) =>
			sum + config.assignedVMs.length + config.assignedGroups.length,
		0
	)

	const handleViewPlan = (config: InfraConfig) => {
		const plan = generatePlan(config)
		setViewPlanConfig(config)
		setGeneratedPlan(plan)
		setIsViewPlanOpen(true)
	}

	const handleDeploy = async (configId: string) => {
		// In a real app, this would open a dialog to select VMs/groups and confirm deployment
		logger.log('Deploy config:', configId)
		// Placeholder deployment
		await deployConfig(configId, 'vm', 'vm-1')
	}

	const handleAssign = (configId: string) => {
		// In a real app, this would open a dialog to assign to VMs/groups
		logger.log('Assign config:', configId)
	}

	const handleDelete = (configId: string) => {
		if (confirm('Are you sure you want to delete this configuration?')) {
			deleteConfig(configId)
		}
	}

	const handleEdit = (configId: string) => {
		// In a real app, this would navigate to the config editor
		logger.log('Edit config:', configId)
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
									Infrastructure Configuration
								</h1>
								<p className='text-lg text-gray-200'>
									Create, manage, and deploy infrastructure configurations using
									visual canvas.
								</p>
							</div>
						</div>
						<Link
							href='/dashboard/infrastructure/create'
							className='interactive-element'
						>
							<Button className='gradient-border-btn'>
								<Plus className='h-4 w-4 mr-2' />
								Create Configuration
							</Button>
						</Link>
					</div>
				</div>

				{/* Stats Overview */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Configuration Overview
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{/* Total Configs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Total Configs
									</p>
									<p className='text-3xl font-bold text-primary mb-2'>
										{configs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm'>
									<Layers className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Deployed Configs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Deployed
									</p>
									<p className='text-3xl font-bold text-green-400 mb-2'>
										{deployedConfigs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-sm'>
									<Activity className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Draft Configs */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Drafts
									</p>
									<p className='text-3xl font-bold text-yellow-400 mb-2'>
										{draftConfigs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/10 backdrop-blur-sm'>
									<FileCode className='h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Total Assignments */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Assignments
									</p>
									<p className='text-3xl font-bold text-purple-400 mb-2'>
										{totalAssignments}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 backdrop-blur-sm'>
									<Settings className='h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform duration-300' />
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
						<Link
							href='/dashboard/infrastructure/create'
							className='interactive-element'
						>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 mr-4'>
									<Plus className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Create Configuration
									</div>
									<div className='text-sm text-secondary'>
										Build infrastructure using visual canvas
									</div>
								</div>
							</Button>
						</Link>

						<Link href='/dashboard/vms' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 mr-4'>
									<Settings className='h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Manage VMs
									</div>
									<div className='text-sm text-secondary'>
										View and configure virtual machines
									</div>
								</div>
							</Button>
						</Link>

						<Link href='/dashboard/vm-groups' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 mr-4'>
									<Layers className='h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										VM Groups
									</div>
									<div className='text-sm text-secondary'>
										Assign configs to VM groups
									</div>
								</div>
							</Button>
						</Link>
					</div>
				</div> */}

				{/* Configurations */}
				<div className='glass-card'>
					<Tabs defaultValue='all' className='w-full'>
						<div className='flex items-center justify-between mb-6'>
							<TabsList className='bg-white/5 border border-white/10'>
								<TabsTrigger
									value='all'
									className='data-[state=active]:bg-white/10'
								>
									All Configurations ({configs.length})
								</TabsTrigger>
								<TabsTrigger
									value='deployed'
									className='data-[state=active]:bg-white/10'
								>
									Deployed ({deployedConfigs.length})
								</TabsTrigger>
								<TabsTrigger
									value='drafts'
									className='data-[state=active]:bg-white/10'
								>
									Drafts ({draftConfigs.length})
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value='all' className='space-y-6'>
							{configs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{configs.map(config => (
										<InfraConfigCard
											key={config.id}
											config={config}
											onViewPlan={handleViewPlan}
											onDeploy={handleDeploy}
											onAssign={handleAssign}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Layers className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Configurations Found
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										Create your first infrastructure configuration using the
										visual canvas editor.
									</p>
									<Link href='/dashboard/infrastructure/create'>
										<Button className='gradient-border-btn'>
											<Plus className='h-4 w-4 mr-2' />
											Create Configuration
										</Button>
									</Link>
								</div>
							)}
						</TabsContent>

						<TabsContent value='deployed' className='space-y-6'>
							{deployedConfigs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{deployedConfigs.map(config => (
										<InfraConfigCard
											key={config.id}
											config={config}
											onViewPlan={handleViewPlan}
											onDeploy={handleDeploy}
											onAssign={handleAssign}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Activity className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Deployed Configurations
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										Deploy your configurations to start managing your
										infrastructure.
									</p>
								</div>
							)}
						</TabsContent>

						<TabsContent value='drafts' className='space-y-6'>
							{draftConfigs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{draftConfigs.map(config => (
										<InfraConfigCard
											key={config.id}
											config={config}
											onViewPlan={handleViewPlan}
											onDeploy={handleDeploy}
											onAssign={handleAssign}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<FileCode className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Draft Configurations
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										All your configurations are deployed. Create new ones to see
										drafts here.
									</p>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* View Plan Modal */}
				<ViewPlanModal
					config={viewPlanConfig}
					plan={generatedPlan}
					isOpen={isViewPlanOpen}
					onClose={() => setIsViewPlanOpen(false)}
				/>
			</div>
		</DashboardLayout>
	)
}
