import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Menu, Eye, Save, Trash2 } from 'lucide-react'

interface NavigationHeaderProps {
	agentConnected: boolean
	mobileMenuOpen: boolean
	configName: string
	onMobileMenuToggle: () => void
	onSave: () => void
	onClear: () => void
	onViewPlan: () => void
	onConfigNameChange: (name: string) => void
}

export function NavigationHeader({
	agentConnected,
	mobileMenuOpen,
	configName,
	onMobileMenuToggle,
	onSave,
	onClear,
	onViewPlan,
	onConfigNameChange,
}: NavigationHeaderProps) {
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
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Back</span>
						</Button>
					</Link>
					<div className='h-4 w-px bg-white/20 hidden sm:block' />
					<div className='flex items-center gap-3'>
						<h1 className='text-lg font-bold text-white'>
							Infrastructure Builder
						</h1>
						<Input
							type='text'
							placeholder='Configuration name...'
							value={configName}
							onChange={e => onConfigNameChange(e.target.value)}
							className='w-48 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-cyan-400/50 hidden md:block'
						/>
					</div>
					<Badge
						variant={agentConnected ? 'default' : 'destructive'}
						className={
							agentConnected
								? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs hover:bg-green-500/30'
								: 'bg-red-500/20 text-red-400 border-red-500/30 text-xs hover:bg-red-500/30'
						}
					>
						<span className='hidden sm:inline'>Agent&nbsp;</span>
						{agentConnected ? ' Connected' : ' Disconnected'}
					</Badge>
				</div>
				<div className='flex items-center gap-2 sm:gap-3'>
					<Button
						size='sm'
						onClick={onClear}
						variant='ghost'
						className='text-red-400 hover:text-red-300 hover:bg-red-500/10 interactive-element'
					>
						<Trash2 className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Clear</span>
					</Button>
					<Button
						size='sm'
						onClick={onViewPlan}
						variant='ghost'
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element'
					>
						<Eye className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>View Plan</span>
					</Button>
					<Button
						size='sm'
						onClick={onSave}
						variant='ghost'
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element'
					>
						<Save className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Save</span>
					</Button>
				</div>
			</div>
		</header>
	)
}
