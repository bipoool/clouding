'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Menu } from 'lucide-react'

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false)

	const handleToggleMenu = () => {
		setIsOpen(!isOpen)
	}

	const handleCloseMenu = () => {
		setIsOpen(false)
	}

	return (
		<nav className='relative z-30 w-full'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16 md:h-20'>
					{/* Logo */}
					<div className='flex-shrink-0'>
						<Link
							href='/'
							className='text-2xl md:text-3xl font-bold text-accent-cyan font-jetbrains interactive-element glow-hover transition-colors duration-300'
							onClick={handleCloseMenu}
						>
							{'<Clouding />'}
						</Link>
					</div>

					{/* CTA Button */}
					<div className='flex items-center space-x-4'>
						<Link href='/auth'>
							<Button className='glass-btn text-accent-cyan hover:text-primary font-semibold px-6 py-2 text-sm'>
								Get Started
							</Button>
						</Link>

						{/* Mobile menu button */}
						<div className='md:hidden'>
							<button
								type='button'
								onClick={handleToggleMenu}
								className='glass-btn text-accent-cyan hover:text-primary p-2'
								aria-controls='mobile-menu'
								aria-expanded={isOpen}
							>
								<span className='sr-only'>
									{isOpen ? 'Close main menu' : 'Open main menu'}
								</span>
								{isOpen ? (
									<X className='h-6 w-6' />
								) : (
									<Menu className='h-6 w-6' />
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div
				className={`md:hidden transition-all duration-300 ease-in-out ${
					isOpen
						? 'opacity-100 transform translate-y-0'
						: 'opacity-0 transform -translate-y-2 pointer-events-none'
				}`}
				id='mobile-menu'
			>
				<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card mx-4 mt-2 p-4'>
					<Link
						href='/about'
						onClick={handleCloseMenu}
						className='text-secondary hover:text-primary block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-white/5 rounded-xl'
					>
						About
					</Link>
					<Link
						href='/privacy'
						onClick={handleCloseMenu}
						className='text-secondary hover:text-primary block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-white/5 rounded-xl'
					>
						Privacy Policy
					</Link>
					<Link
						href='/dashboard'
						onClick={handleCloseMenu}
						className='text-secondary hover:text-primary block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-white/5 rounded-xl'
					>
						Dashboard
					</Link>
				</div>
			</div>
		</nav>
	)
}
