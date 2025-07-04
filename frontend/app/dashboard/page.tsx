import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
	Server,
	Activity,
	TrendingUp,
	Globe,
	Users,
	Layers,
	Settings,
	Key,
} from 'lucide-react'

const stats = [
	{
		name: 'Total VMs',
		value: '14',
		change: '+2',
		icon: Server,
		gradient: 'from-cyan-500/20 to-blue-500/10',
		iconColor: 'text-cyan-400',
		changeColor: 'text-green-400',
	},
	{
		name: 'VM Groups',
		value: '4',
		change: '+1',
		icon: Users,
		gradient: 'from-purple-500/20 to-violet-500/10',
		iconColor: 'text-purple-400',
		changeColor: 'text-green-400',
	},
	{
		name: 'Credentials',
		value: '3',
		change: '+1',
		icon: Key,
		gradient: 'from-orange-500/20 to-yellow-500/10',
		iconColor: 'text-orange-400',
		changeColor: 'text-green-400',
	},
	{
		name: 'Configurations',
		value: '8',
		change: '+3',
		icon: Layers,
		gradient: 'from-green-500/20 to-emerald-500/10',
		iconColor: 'text-green-400',
		changeColor: 'text-green-400',
	},
]

export default function DashboardPage() {
	return (
		<DashboardLayout>
			<div className='space-y-8'>
				{/* Welcome Header */}
				<div className='glass-card'>
					<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold text-primary mb-2 font-jetbrains'>
								Infrastructure Dashboard
							</h1>
							<p className='text-lg text-gray-200'>
								Manage your virtual machines, VM groups, credentials, and
								infrastructure configurations from one central location.
							</p>
						</div>
					</div>
				</div>

				{/* Stats Overview */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Overview Statistics
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						{stats.map(stat => (
							<div
								key={stat.name}
								className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'
							>
								<div className='flex items-center justify-between'>
									<div className='flex-1'>
										<p className='text-sm font-medium text-secondary mb-1'>
											{stat.name}
										</p>
										<p className='text-3xl font-bold text-primary mb-2'>
											{stat.value}
										</p>
										<div className='flex items-center gap-2'>
											<span
												className={`text-sm font-semibold ${stat.changeColor}`}
											>
												{stat.change}
											</span>
											<span className='text-xs text-secondary'>
												vs last month
											</span>
										</div>
									</div>
									<div
										className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}
									>
										<stat.icon
											className={`h-6 w-6 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Main Navigation Sections */}
				<div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Management Sections
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<Link href='/dashboard/vms' className='interactive-element'>
							<div className='glass-card glass-card-hover group relative overflow-hidden h-full'>
								<div className='absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-cyan-600/5 opacity-50' />
								<div className='relative z-10 p-6'>
									<div className='flex items-center mb-4'>
										<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 mr-4'>
											<Server className='h-8 w-8 text-cyan-400 group-hover:scale-110 transition-transform' />
										</div>
										<div>
											<h4 className='text-xl font-bold text-primary mb-1'>
												Virtual Machines
											</h4>
											<p className='text-sm text-secondary'>14 VMs</p>
										</div>
									</div>
									<p className='text-gray-200 mb-4'>
										Manage and monitor your virtual machines, view health
										status, and configure SSH connections.
									</p>
									<div className='flex items-center text-sm text-cyan-400'>
										<Activity className='h-4 w-4 mr-2' />
										View VM Management →
									</div>
								</div>
							</div>
						</Link>

						<Link href='/dashboard/vm-groups' className='interactive-element'>
							<div className='glass-card glass-card-hover group relative overflow-hidden h-full'>
								<div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 via-violet-500/10 to-purple-600/5 opacity-50' />
								<div className='relative z-10 p-6'>
									<div className='flex items-center mb-4'>
										<div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 mr-4'>
											<Users className='h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform' />
										</div>
										<div>
											<h4 className='text-xl font-bold text-primary mb-1'>
												VM Groups
											</h4>
											<p className='text-sm text-secondary'>4 Groups</p>
										</div>
									</div>
									<p className='text-gray-200 mb-4'>
										Organize your VMs into logical groups for easier management
										and bulk configuration deployment.
									</p>
									<div className='flex items-center text-sm text-purple-400'>
										<Users className='h-4 w-4 mr-2' />
										Manage Groups →
									</div>
								</div>
							</div>
						</Link>

						<Link
							href='/dashboard/infrastructure'
							className='interactive-element'
						>
							<div className='glass-card glass-card-hover group relative overflow-hidden h-full'>
								<div className='absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-600/5 opacity-50' />
								<div className='relative z-10 p-6'>
									<div className='flex items-center mb-4'>
										<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 mr-4'>
											<Layers className='h-8 w-8 text-green-400 group-hover:scale-110 transition-transform' />
										</div>
										<div>
											<h4 className='text-xl font-bold text-primary mb-1'>
												Infrastructure Configs
											</h4>
											<p className='text-sm text-secondary'>8 Configurations</p>
										</div>
									</div>
									<p className='text-gray-200 mb-4'>
										Create, manage, and deploy infrastructure configurations
										using visual canvas editor and automation tools.
									</p>
									<div className='flex items-center text-sm text-green-400'>
										<Layers className='h-4 w-4 mr-2' />
										View Configurations →
									</div>
								</div>
							</div>
						</Link>

						<Link href='/dashboard/credentials' className='interactive-element'>
							<div className='glass-card glass-card-hover group relative overflow-hidden h-full'>
								<div className='absolute inset-0 bg-gradient-to-br from-orange-500/20 via-yellow-500/10 to-orange-600/5 opacity-50' />
								<div className='relative z-10 p-6'>
									<div className='flex items-center mb-4'>
										<div className='p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 mr-4'>
											<Key className='h-8 w-8 text-orange-400 group-hover:scale-110 transition-transform' />
										</div>
										<div>
											<h4 className='text-xl font-bold text-primary mb-1'>
												Credentials
											</h4>
											<p className='text-sm text-secondary'>3 Credentials</p>
										</div>
									</div>
									<p className='text-gray-200 mb-4'>
										Manage SSH keys, SSL certificates, API tokens, and other
										authentication credentials for your infrastructure.
									</p>
									<div className='flex items-center text-sm text-orange-400'>
										<Key className='h-4 w-4 mr-2' />
										Manage Credentials →
									</div>
								</div>
							</div>
						</Link>
					</div>
				</div>

				{/* Quick Actions */}
				{/* <div className='glass-card'>
					<h3 className='text-2xl font-bold text-primary mb-6'>
						Quick Actions
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
						<Link
							href='/dashboard/infrastructure/create'
							className='interactive-element'
						>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 mr-4'>
									<Layers className='h-6 w-6 text-green-400 group-hover:scale-110 transition-transform' />
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

						<Link href='/dashboard/credentials' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 mr-4'>
									<Key className='h-6 w-6 text-orange-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Manage Credentials
									</div>
									<div className='text-sm text-secondary'>
										Add SSH keys, certificates, and API tokens
									</div>
								</div>
							</Button>
						</Link>

						<Button
							variant='ghost'
							className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element transition-all duration-300'
						>
							<div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 mr-4'>
								<Activity className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform' />
							</div>
							<div>
								<div className='font-semibold text-primary text-lg mb-1'>
									Monitor Health
								</div>
								<div className='text-sm text-secondary'>
									View real-time VM status and metrics
								</div>
							</div>
						</Button>

						<Link href='/dashboard/settings' className='interactive-element'>
							<Button
								variant='ghost'
								className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
							>
								<div className='p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 mr-4'>
									<Settings className='h-6 w-6 text-pink-400 group-hover:scale-110 transition-transform' />
								</div>
								<div>
									<div className='font-semibold text-primary text-lg mb-1'>
										Settings
									</div>
									<div className='text-sm text-secondary'>
										Configure environments and preferences
									</div>
								</div>
							</Button>
						</Link>
					</div>
				</div> */}
			</div>
		</DashboardLayout>
	)
}
