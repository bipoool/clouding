'use client'

import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DashboardFooter } from '@/components/dashboard-footer'
import { Home, Settings, LogOut, Search, User } from 'lucide-react'

interface DashboardLayoutProps {
	children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className='min-h-screen animated-bg'>
			{/* Top Navigation */}
			<header className='glass border-b border-white/10 px-4 lg:px-10 py-4 rounded-none z-30 relative flex-shrink-0'>
				<div className='flex items-center justify-between mx-auto lg:h-4 lg:py-4'>
					<div className='flex items-center gap-6'>
						{/* Logo/Brand - Links to Dashboard */}
						<Link href='/dashboard' className='interactive-element'>
							<div className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
								<Home className='h-6 w-6 text-cyan-400' />
								<span className='text-xl font-bold text-cyan-400'>
									{'<Clouding />'}
								</span>
							</div>
						</Link>
					</div>

					<div className='flex items-center gap-4'>
						{/* Settings Link */}
						<Link href='/dashboard/settings' className='interactive-element'>
							<Button
								variant='ghost'
								size='sm'
								className='text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl'
							>
								<Settings className='h-5 w-5' />
								<span className='hidden sm:inline ml-2'>Settings</span>
							</Button>
						</Link>

						{/* Profile Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='relative h-12 w-12 rounded-full interactive-element hover:bg-gray-800/50'
								>
									<Avatar className='h-12 w-12 border-2 border-gray-600/50 hover:border-gray-500/70 transition-colors'>
										{/* <AvatarImage src='/placeholder-user.jpg' alt='Profile' /> */}
										<AvatarFallback className='bg-gradient-to-br from-gray-900 to-black text-gray-300 border border-gray-800/30'>
											<User className='h-6 w-6 text-gray-400' />
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-64 bg-popover border-2 border-gray-700 rounded-xl shadow-2xl shadow-black/30 z-50 p-2 backdrop-blur-lg'
								align='end'
								sideOffset={8}
							>
								<DropdownMenuItem className='text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-2.5 cursor-pointer transition-colors'>
									<User className='mr-3 h-5 w-5' />
									<span className='font-medium'>Profile</span>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										href='/dashboard/settings'
										className='flex items-center text-popover-foreground hover:bg-accent hover:text-accent-foreground rounded-lg px-3 py-2.5 cursor-pointer transition-colors'
									>
										<Settings className='mr-3 h-5 w-5' />
										<span className='font-medium'>Settings</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator className='bg-gray-700/50 my-2' />
								<DropdownMenuItem asChild>
									<Link
										href='/'
										className='flex items-center text-red-300 hover:text-red-200 hover:bg-red-900/30 rounded-lg px-3 py-2.5 cursor-pointer transition-colors'
									>
										<LogOut className='mr-3 h-5 w-5' />
										<span className='font-medium'>Logout</span>
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</header>

			{/* Page content */}
			<main className='py-6 mx-auto lg:mx-10 relative z-20'>{children}</main>

			{/* Footer */}
			<DashboardFooter />
		</div>
	)
}
