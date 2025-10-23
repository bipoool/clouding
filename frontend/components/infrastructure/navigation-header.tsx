import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Menu, Save, Play, Trash2, Edit } from 'lucide-react'
import { PlanDeploymentModal } from '@/components/dashboard/PlanDeploymentModal'
import { type DeploymentStatus } from '@/hooks/useDeployments'

interface NavigationHeaderProps {
	agentConnected: boolean
	mobileMenuOpen: boolean
	configName: string
	configDescription?: string
	onMobileMenuToggle: () => void
	onSave: () => void
	onClear: () => void
	onViewPlan: () => void
	configModalTrigger?: React.ReactNode
	isSaving?: boolean
	blueprintId: number
	planDeploymentStatus?: DeploymentStatus | null
	planDeploymentId?: string | null
	isCheckingPlanStatus?: boolean
	onRefreshPlanStatus?: () => void
	onShowNotification?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function NavigationHeader({
	agentConnected,
	mobileMenuOpen,
	configName,
	configDescription,
	onMobileMenuToggle,
	onSave,
	onClear,
	onViewPlan,
	configModalTrigger,
	isSaving = false,
	blueprintId,
	planDeploymentStatus = null,
	planDeploymentId = null,
	isCheckingPlanStatus = false,
	onRefreshPlanStatus,
	onShowNotification,
}: NavigationHeaderProps) {
	const [planOpen, setPlanOpen] = useState(false)
	const planStatusPresentation = useMemo(() => {
		if (isCheckingPlanStatus) {
			return {
				text: 'Checking...',
				className: 'border-cyan-300/50 text-cyan-200 bg-cyan-400/10'
			}
		}
		const defaultStatus = {
			text: 'Unknown',
			className: 'border-white/20 text-white/70 bg-white/5'
		}
		if (!planDeploymentStatus) {
			return {
				text: 'Not Deployed',
				className: 'border-white/20 text-white/70 bg-white/5'
			}
		}
		const statusMap: Record<string, { text: string; className: string }> = {
			pending: { text: 'Pending', className: 'border-amber-400/60 text-amber-200 bg-amber-500/10' },
			started: { text: 'Started', className: 'border-blue-400/60 text-blue-200 bg-blue-500/10' },
			completed: { text: 'Success', className: 'border-emerald-400/60 text-emerald-200 bg-emerald-500/10' },
			failed: { text: 'Failed', className: 'border-red-400/60 text-red-200 bg-red-500/10' }
		}
		return statusMap[planDeploymentStatus] ?? defaultStatus
	}, [isCheckingPlanStatus, planDeploymentStatus])

	const handlePlanModalOpenChange = useCallback((open: boolean) => {
		setPlanOpen(open)
		if (!open && onRefreshPlanStatus) {
			void onRefreshPlanStatus()
		}
	}, [onRefreshPlanStatus])

	const handlePlanButtonClick = useCallback(() => {
		if (!Number.isFinite(blueprintId) || blueprintId <= 0) {
			if (onShowNotification) {
				onShowNotification('Please save your configuration before planning a deployment.', 'error')
			} else if (typeof window !== 'undefined') {
				window.alert('Please save your configuration before planning a deployment.')
			}
			return
		}
		setPlanOpen(true)
	}, [blueprintId, onShowNotification])

	return (
		<header className='glass border-b border-white/10 px-4 py-3 rounded-none z-30 relative flex-shrink-0'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					{/* Mobile Menu Button */}
					<Button
						variant='ghost'
						size='sm'
						className='lg:hidden text-gray-400 hover:text-cyan-400'
						onClick={onMobileMenuToggle}
						aria-label="Toggle mobile menu"
						title="Toggle mobile menu"
					>
						<Menu className='h-4 w-4' />
					</Button>

					<Link
						href='/dashboard/infrastructure'
						className='interactive-element'
					>
						<Button
							variant='ghost'
							size='sm'
							className='text-gray-400 hover:text-cyan-400'
							aria-label="Back to infrastructure dashboard"
							title="Back to infrastructure dashboard"
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Back</span>
						</Button>
					</Link>
					<div className='h-4 w-px bg-white/20 hidden sm:block' />
					<div className='flex items-center gap-3'>
						<div className='flex items-center gap-2'>
							<span className='text-white/80 text-sm hidden md:block'>
								{configName || 'Untitled Configuration'}
							</span>
							{configModalTrigger}
						</div>
					</div>
				</div>
				<div className='flex items-center gap-2 sm:gap-3'>
					{/* @TODO - add clear button functionality */}
					{/* <Button
						size='sm'
						onClick={onClear}
						variant='ghost'
						className='text-red-400 hover:text-red-300 hover:bg-red-500/10 interactive-element'
						aria-label="Clear canvas"
						title="Clear canvas"
					>
						<Trash2 className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Clear</span>
					</Button> */}
					<span
						className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${planStatusPresentation.className}`}
						title={
							planDeploymentStatus
								? `Latest plan deployment status${planDeploymentId ? ` • ${planDeploymentId}` : ''}`
								: 'No plan deployments found'
						}
					>
						{planStatusPresentation.text}
					</span>
					<Button
						size='sm'
						onClick={onSave}
						variant='ghost'
						disabled={isSaving}
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element disabled:opacity-50 disabled:cursor-not-allowed'
						aria-label="Save configuration"
						title="Save configuration"
					>
						{isSaving ? (
							<>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 sm:mr-2' />
								<span className='hidden sm:inline'>Saving...</span>
							</>
						) : (
							<>
								<Save className='h-4 w-4 sm:mr-2' />
								<span className='hidden sm:inline'>Save</span>
							</>
						)}
					</Button>
					<Button
						size='sm'
						onClick={handlePlanButtonClick}
						variant='ghost'
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element'
						aria-label="View deployment plan"
						title="View deployment plan"
					>
						<Play className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Plan</span>
					</Button>
				</div>
			</div>
			<PlanDeploymentModal
				open={planOpen}
				onOpenChange={handlePlanModalOpenChange}
				blueprintId={blueprintId}
			/>
		</header>
	)
}
