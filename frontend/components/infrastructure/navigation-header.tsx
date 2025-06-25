import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Menu, Eye, Zap } from 'lucide-react'

interface NavigationHeaderProps {
	agentConnected: boolean
	mobileMenuOpen: boolean
	onMobileMenuToggle: () => void
}

export function NavigationHeader({
	agentConnected,
	mobileMenuOpen,
	onMobileMenuToggle,
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

					<Link href='/dashboard' className='interactive-element'>
						<Button
							variant='ghost'
							size='sm'
							className='text-gray-400 hover:text-cyan-400'
						>
							<ArrowLeft className='h-4 w-4 mr-2' />
							<span className='hidden sm:inline'>Dashboard</span>
						</Button>
					</Link>
					<div className='h-4 w-px bg-white/20 hidden sm:block' />
					<div>
						<h1 className='text-lg font-bold text-white'>
							Infrastructure Builder
						</h1>
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
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element'
					>
						<Eye className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Plan</span>
					</Button>
					<Button
						size='sm'
						className='glow-border bg-transparent text-cyan-400 hover:bg-cyan-400/10 interactive-element'
					>
						<Zap className='h-4 w-4 sm:mr-2' />
						<span className='hidden sm:inline'>Apply</span>
					</Button>
				</div>
			</div>
		</header>
	)
}
