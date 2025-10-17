'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import {
	useDeploymentsByType,
	type Deployment,
} from '@/hooks/useDeployments'
import { Layers, Loader2, TrendingUp } from 'lucide-react'

function DeploymentsList({
	items,
	emptyMessage,
}: {
	items: Deployment[]
	emptyMessage: string
}) {
	const statusMeta: Record<
		Deployment['status'],
		{ label: string; className: string }
	> = {
		pending: {
			label: 'Pending',
			className: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
		},
		started: {
			label: 'In Progress',
			className: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
		},
		completed: {
			label: 'Completed',
			className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
		},
		failed: {
			label: 'Failed',
			className: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
		},
	}

	if (!(items != null && items.length > 0)) {
		return (
			<p className='text-sm text-secondary border border-dashed border-white/10 rounded-lg p-4'>
				{emptyMessage}
			</p>
		)
	}

	return (
		<ul className='space-y-3'>
			{items.map(item => (
				<li
					key={item.id}
					className='border border-white/10 rounded-lg p-4 bg-white/5'
				>
					<div className='font-semibold text-primary'>
						{item.type === 'plan' ? 'Plan' : 'Deployment'} - {item.id}
					</div>
					<div className='text-xs text-secondary py-2'>
						<Badge
							className={`align-middle text-[10px] px-2 py-0.5 ${statusMeta[item.status].className}`}
						>
							{statusMeta[item.status].label}
						</Badge>{' '}
						• Updated{' '}
						{new Date(item.updatedAt).toLocaleString()}
					</div>
				</li>
			))}
		</ul>
	)
}

export default function DeploymentsPage() {
	const {
		deployments: planDeployments,
		loading: plansLoading,
		error: plansError,
	} = useDeploymentsByType('plan')

	const {
		deployments: deployExecutions,
		loading: deployLoading,
		error: deployError,
	} = useDeploymentsByType('deploy')

	return (
		<DashboardLayout>
			<div className='space-y-8'>
				<div className='glass-card'>
					<h1 className='text-3xl md:text-4xl font-bold text-primary mb-3 font-jetbrains'>
						Deployments
					</h1>
					<p className='text-gray-200 text-lg'>
						Track plans and deployment executions across all of your blueprints
						and hosts. Data updates automatically as new runs complete.
					</p>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					<section className='glass-card space-y-4'>
						<header className='flex items-center gap-3'>
							<span className='p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10'>
								<Layers className='h-6 w-6 text-emerald-400' />
							</span>
							<div>
								<h2 className='text-2xl font-bold text-primary'>Plans</h2>
								<p className='text-sm text-secondary'>
									Preview runs generated from blueprint definitions.
								</p>
							</div>
						</header>
						{plansLoading ? (
							<div className='flex items-center gap-3 text-sm text-secondary border border-white/10 rounded-lg p-4 bg-white/5'>
								<Loader2 className='h-4 w-4 animate-spin text-emerald-300' />
								Fetching plan deployments…
							</div>
						) : plansError ? (
							<p className='text-sm text-red-300 border border-red-500/40 rounded-lg p-4 bg-red-500/10'>
								Failed to load plans: {plansError}
							</p>
						) : (
							<DeploymentsList
								items={planDeployments}
								emptyMessage='No plan runs yet. Plans will appear here once created from a blueprint.'
							/>
						)}
					</section>

					<section className='glass-card space-y-4'>
						<header className='flex items-center gap-3'>
							<span className='p-3 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/10'>
								<TrendingUp className='h-6 w-6 text-sky-400' />
							</span>
							<div>
								<h2 className='text-2xl font-bold text-primary'>Deployments</h2>
								<p className='text-sm text-secondary'>
									Executed runs applied to your infrastructure targets.
								</p>
							</div>
						</header>
						{deployLoading ? (
							<div className='flex items-center gap-3 text-sm text-secondary border border-white/10 rounded-lg p-4 bg-white/5'>
								<Loader2 className='h-4 w-4 animate-spin text-sky-300' />
								Fetching deployment runs…
							</div>
						) : deployError ? (
							<p className='text-sm text-red-300 border border-red-500/40 rounded-lg p-4 bg-red-500/10'>
								Failed to load deployments: {deployError}
							</p>
						) : (
							<DeploymentsList
								items={deployExecutions}
								emptyMessage='No deployments have been run yet. Completed executions will appear here once available.'
							/>
						)}
					</section>
				</div>
			</div>
		</DashboardLayout>
	)
}
