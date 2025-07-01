'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, X, User, Settings, LogOut } from 'lucide-react'
import { useUser, useAuthStore } from '@/lib/auth/store'
import { logger } from '@/lib/utils/logger'
import { toast } from 'sonner'

export function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const user = useUser()
	const { signOut } = useAuthStore()

	const handleSignOut = async () => {
		try {
			toast.promise(signOut(), {
				loading: 'Signing out...',
				success: 'Successfully signed out!',
				error: 'Failed to sign out. Please try again.',
			})
		} catch (error) {
			logger.error('Error signing out:', error)
		}
	}

	return (
		<nav className='border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-40'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* Logo */}
					<Link href='/' className='flex items-center space-x-2'>
						<div className='text-2xl font-bold text-accent-cyan font-jetbrains'>
							{'<Clouding />'}
						</div>
					</Link>

					{/* Desktop Menu */}
					<div className='hidden md:flex items-center space-x-8'>
						<Link
							href='/about'
							className='text-gray-300 hover:text-accent-cyan transition-colors'
						>
							About
						</Link>
						<Link
							href='/docs'
							className='text-gray-300 hover:text-accent-cyan transition-colors'
						>
							Docs
						</Link>
						<Link
							href='/pricing'
							className='text-gray-300 hover:text-accent-cyan transition-colors'
						>
							Pricing
						</Link>

						{user ? (
							<div className='flex items-center space-x-4'>
								<Link href='/dashboard'>
									<Button className='gradient-border-btn'>Dashboard</Button>
								</Link>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant='ghost'
											className='relative h-8 w-8 rounded-full'
										>
											<Avatar className='h-8 w-8'>
												<AvatarImage
													src={user.user_metadata?.avatar_url}
													alt={user.email || 'User'}
												/>
												<AvatarFallback className='bg-accent-cyan/10 text-accent-cyan'>
													{user.email?.charAt(0).toUpperCase() || 'U'}
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className='w-56 bg-black/90 backdrop-blur-md border-white/10'
										align='end'
									>
										<div className='flex items-center justify-start gap-2 p-2'>
											<div className='flex flex-col space-y-1 leading-none'>
												<p className='text-sm font-medium text-white'>
													{user.user_metadata?.full_name || 'User'}
												</p>
												<p className='text-xs text-gray-400'>{user.email}</p>
											</div>
										</div>
										<DropdownMenuSeparator className='bg-white/10' />
										<DropdownMenuItem asChild>
											<Link
												href='/dashboard'
												className='flex items-center text-gray-300 hover:text-white'
											>
												<User className='mr-2 h-4 w-4' />
												Dashboard
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href='/dashboard/profile'
												className='flex items-center text-gray-300 hover:text-white'
											>
												<User className='mr-2 h-4 w-4' />
												Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link
												href='/dashboard/settings'
												className='flex items-center text-gray-300 hover:text-white'
											>
												<Settings className='mr-2 h-4 w-4' />
												Settings
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator className='bg-white/10' />
										<DropdownMenuItem
											onClick={handleSignOut}
											className='flex items-center text-gray-300 hover:text-white cursor-pointer'
										>
											<LogOut className='mr-2 h-4 w-4' />
											Sign out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<div className='flex items-center space-x-4'>
								<Link href='/auth'>
									<Button
										variant='ghost'
										className='text-gray-300 hover:text-white hover:bg-white/10'
									>
										Sign In
									</Button>
								</Link>
								<Link href='/auth'>
									<Button className='gradient-border-btn'>Get Started</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className='md:hidden'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className='text-gray-300 hover:text-white'
						>
							{isMenuOpen ? (
								<X className='h-6 w-6' />
							) : (
								<Menu className='h-6 w-6' />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className='md:hidden border-t border-white/10'>
						<div className='px-2 pt-2 pb-3 space-y-1'>
							<Link
								href='/about'
								className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
							>
								About
							</Link>
							<Link
								href='/docs'
								className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
							>
								Docs
							</Link>
							<Link
								href='/pricing'
								className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
							>
								Pricing
							</Link>

							{user ? (
								<div className='space-y-2 pt-2 border-t border-white/10'>
									<div className='px-3 py-2'>
										<p className='text-sm font-medium text-white'>
											{user.user_metadata?.full_name || 'User'}
										</p>
										<p className='text-xs text-gray-400'>{user.email}</p>
									</div>
									<Link
										href='/dashboard'
										className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
									>
										Dashboard
									</Link>
									<Link
										href='/dashboard/profile'
										className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
									>
										Profile
									</Link>
									<Link
										href='/dashboard/settings'
										className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
									>
										Settings
									</Link>
									<button
										onClick={handleSignOut}
										className='block w-full text-left px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
									>
										Sign out
									</button>
								</div>
							) : (
								<div className='space-y-2 pt-2 border-t border-white/10'>
									<Link
										href='/auth'
										className='block px-3 py-2 text-gray-300 hover:text-accent-cyan transition-colors'
									>
										Sign In
									</Link>
									<Link
										href='/auth'
										className='block px-3 py-2 text-accent-cyan font-medium'
									>
										Get Started
									</Link>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	)
}
