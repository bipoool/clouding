'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EditBlueprintModal } from '@/components/dashboard/EditBlueprintModal'
import { useBlueprints, getEmojiForBlueprint, formatDate } from '@/hooks/useBlueprint'
import { logger } from '@/lib/utils/logger'
import {
	ArrowLeft,
	Plus,
	Settings,
	Layers,
	Activity,
	FileCode,
	Play,
	Calendar,
	Clock,
	Trash2,
} from 'lucide-react'
import type { Blueprint } from '@/hooks/useBlueprint'

export default function InfrastructurePage() {
	const {
		blueprints,
		loading,
		error,
		createBlueprint,
		updateBlueprint,
		deleteBlueprint,
		generatePlan,
		refreshBlueprints,
	} = useBlueprints()
	const [viewPlanConfig, setViewPlanConfig] = useState<Blueprint | null>(null)
	const [generatedPlan, setGeneratedPlan] = useState('')
	const [isViewPlanOpen, setIsViewPlanOpen] = useState(false)
	const [editBlueprint, setEditBlueprint] = useState<Blueprint | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)

	const deployedConfigs = blueprints.filter(
		config => config.status === 'deployed'
	)
	const draftConfigs = blueprints.filter(
		config => config.status === 'draft'
	)
	const archivedConfigs = blueprints.filter(
		config => config.status === 'archived'
	)

	const handleViewPlan = (config: Blueprint) => {
		const plan = generatePlan(config)
		setViewPlanConfig(config)
		setGeneratedPlan(plan)
		setIsViewPlanOpen(true)
	}

	const handleDelete = async (configId: number) => {
		if (confirm('Are you sure you want to delete this blueprint?')) {
			try {
				await deleteBlueprint(configId)
			} catch (error) {
				logger.error('Failed to delete blueprint:', error)
			}
		}
	}

	const handleEdit = (configId: number) => {
		const blueprint = blueprints.find(b => b.id === configId)
		if (blueprint) {
			setEditBlueprint(blueprint)
			setIsEditModalOpen(true)
		}
	}

	const handleSaveEdit = async (id: number, updates: { name: string; description: string }) => {
		try {
			await updateBlueprint(id, updates)
			setIsEditModalOpen(false)
			setEditBlueprint(null)
		} catch (error) {
			logger.error('Failed to update blueprint:', error)
			throw error
		}
	}

	// Loading state
	if (loading) {
		return (
			<DashboardLayout>
				<div className='space-y-8'>
					<Link href='/dashboard' className='interactive-element'>
						<Button variant='ghost' size='sm' className='glass-btn'>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Dashboard
						</Button>
					</Link>
					<div className='glass-card'>
						<div className='text-center py-12'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
							<h3 className='text-xl font-semibold text-primary mb-2'>
								Loading Blueprints...
							</h3>
							<p className='text-secondary'>
								Fetching your infrastructure configurations
							</p>
						</div>
					</div>
				</div>
			</DashboardLayout>
		)
	}

	// Error state
	if (error) {
		return (
			<DashboardLayout>
				<div className='space-y-8'>
					<Link href='/dashboard' className='interactive-element'>
						<Button variant='ghost' size='sm' className='glass-btn'>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Dashboard
						</Button>
					</Link>
					<div className='glass-card'>
						<div className='text-center py-12'>
							<FileCode className='h-16 w-16 text-red-400 mx-auto mb-4' />
							<h3 className='text-xl font-semibold text-primary mb-2'>
								Error Loading Blueprints
							</h3>
							<p className='text-secondary mb-6 max-w-md mx-auto'>
								{error}
							</p>
							<Button onClick={refreshBlueprints} className='gradient-border-btn'>
								<Plus className='h-4 w-4 mr-2' />
								Retry
							</Button>
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
									Infrastructure Blueprints
								</h1>
								<p className='text-lg text-gray-200'>
									Create, manage, and plan infrastructure configurations.
								</p>
							</div>
						</div>
						<Link
							href='/dashboard/infrastructure/create'
							className='interactive-element'
						>
							<Button className='gradient-border-btn'>
								<Plus className='h-4 w-4 mr-2' />
								Create Blueprint
							</Button>
						</Link>
					</div>
				</div>

				{/* Stats Overview */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Blueprint Overview
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{/* Total Blueprints */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Total Blueprints
									</p>
									<p className='text-3xl font-bold text-primary mb-2'>
										{blueprints.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-sm'>
									<Layers className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>

						{/* Deployed Blueprints */}
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

						{/* Draft Blueprints */}
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

						{/* Archived Blueprints */}
						<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='text-sm font-medium text-secondary mb-1'>
										Archived
									</p>
									<p className='text-3xl font-bold text-gray-400 mb-2'>
										{archivedConfigs.length}
									</p>
								</div>
								<div className='p-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-slate-500/10 backdrop-blur-sm'>
									<Settings className='h-6 w-6 text-gray-400 group-hover:scale-110 transition-transform duration-300' />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Blueprints */}
				<div className='glass-card'>
					<Tabs defaultValue='all' className='w-full'>
						<div className='flex items-center justify-between mb-6'>
							<TabsList className='bg-white/5 border border-white/10'>
								<TabsTrigger
									value='all'
									className='data-[state=active]:bg-white/10'
								>
									All Blueprints ({blueprints.length})
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
								<TabsTrigger
									value='archived'
									className='data-[state=active]:bg-white/10'
								>
									Archived ({archivedConfigs.length})
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value='all' className='space-y-6'>
							{blueprints.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{blueprints.map(blueprint => (
										<BlueprintCard
											key={blueprint.id}
											blueprint={blueprint}
											onViewPlan={handleViewPlan}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Layers className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Blueprints Found
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										Create your first infrastructure blueprint to get started.
									</p>
									<Link href='/dashboard/infrastructure/create'>
										<Button className='gradient-border-btn'>
											<Plus className='h-4 w-4 mr-2' />
											Create Blueprint
										</Button>
									</Link>
								</div>
							)}
						</TabsContent>

						<TabsContent value='deployed' className='space-y-6'>
							{deployedConfigs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{deployedConfigs.map(blueprint => (
										<BlueprintCard
											key={blueprint.id}
											blueprint={blueprint}
											onViewPlan={handleViewPlan}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Activity className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Deployed Blueprints
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										Deploy your blueprints to start managing your infrastructure.
									</p>
								</div>
							)}
						</TabsContent>

						<TabsContent value='drafts' className='space-y-6'>
							{draftConfigs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{draftConfigs.map(blueprint => (
										<BlueprintCard
											key={blueprint.id}
											blueprint={blueprint}
											onViewPlan={handleViewPlan}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<FileCode className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Draft Blueprints
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										All your blueprints are deployed. Create new ones to see drafts here.
									</p>
								</div>
							)}
						</TabsContent>

						<TabsContent value='archived' className='space-y-6'>
							{archivedConfigs.length > 0 ? (
								<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
									{archivedConfigs.map(blueprint => (
										<BlueprintCard
											key={blueprint.id}
											blueprint={blueprint}
											onViewPlan={handleViewPlan}
											onDelete={handleDelete}
											onEdit={handleEdit}
										/>
									))}
								</div>
							) : (
								<div className='text-center py-12'>
									<Settings className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-xl font-semibold text-primary mb-2'>
										No Archived Blueprints
									</h3>
									<p className='text-secondary mb-6 max-w-md mx-auto'>
										Archived blueprints will appear here when you archive them.
									</p>
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* View Plan Modal */}
				{/* TODO: Update ViewPlanModal to work with new Blueprint interface */}

				{/* Edit Blueprint Modal */}
				<EditBlueprintModal
					blueprint={editBlueprint}
					isOpen={isEditModalOpen}
					onClose={() => {
						setIsEditModalOpen(false)
						setEditBlueprint(null)
					}}
					onSave={handleSaveEdit}
				/>
			</div>
		</DashboardLayout>
	)
}

// Blueprint Card Component
interface BlueprintCardProps {
	blueprint: Blueprint
	onViewPlan: (blueprint: Blueprint) => void
	onDelete: (id: number) => void
	onEdit: (id: number) => void
}

function BlueprintCard({ blueprint, onViewPlan, onDelete, onEdit }: BlueprintCardProps) {
	const emoji = getEmojiForBlueprint(blueprint.name)
	
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'deployed':
				return 'text-green-400 bg-green-500/10 border-green-500/20'
			case 'draft':
				return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
			case 'archived':
				return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
			default:
				return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
		}
	}

	return (
		<div className='bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group'>
			<div className='flex items-start justify-between mb-4'>
				<div className='flex items-center gap-3'>
					<div className='text-3xl'>{emoji}</div>
					<div className='flex-1 min-w-0'>
						<h3 
							className='font-semibold text-primary text-lg mb-1 group-hover:text-primary/80 transition-colors truncate'
							title={blueprint.name}
						>
							{blueprint.name}
						</h3>
						<p className='text-secondary text-sm line-clamp-2'>
							{blueprint.description}
						</p>
					</div>
				</div>
			</div>

			<div className='space-y-3'>
				{/* Status */}
				<div className='flex items-center gap-2'>
					<span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(blueprint.status)}`}>
						{blueprint.status}
					</span>
				</div>

				{/* Last Updated */}
				<div className='flex items-center gap-2 text-xs text-secondary'>
					<Clock className='h-3 w-3' />
					<span>Updated {formatDate(blueprint.updatedAt)}</span>
				</div>

				{/* Actions */}
				<div className='flex items-center gap-2 pt-3 border-t border-white/10'>
					<Button
						size='sm'
						variant='ghost'
						onClick={() => onViewPlan(blueprint)}
						className='flex-1 bg-white/5 hover:bg-white/10 text-primary'
					>
						<Play className='h-3 w-3 mr-1' />
						Plan
					</Button>
					<Button
						size='sm'
						variant='ghost'
						onClick={() => onEdit(blueprint.id)}
						className='bg-white/5 hover:bg-white/10 text-primary'
					>
						<Settings className='h-3 w-3' />
					</Button>
					<Button
						size='sm'
						variant='ghost'
						onClick={() => onDelete(blueprint.id)}
						className='bg-red-500/10 hover:bg-red-500/20 text-red-400'
					>
						<Trash2 className='h-3 w-3' />
					</Button>
				</div>
			</div>
		</div>
	)
}
