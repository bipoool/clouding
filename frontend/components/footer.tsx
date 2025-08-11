import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Heart, Code } from 'lucide-react'

export function Footer() {
	return (
		<footer className='relative mt-20 z-20'>
			{/* Background gradient */}
			<div className='background-element inset-0 bg-gradient-to-t from-black/50 to-transparent' />

			<div className='relative z-30 glass-card mx-6 mb-6 p-8'>
				<div className='max-w-6xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
						{/* Brand */}
						<div className='space-y-4'>
							<div className='text-2xl font-bold text-accent-cyan interactive-element font-jetbrains'>
								{'<Clouding />'}
							</div>
							<p className='text-secondary text-sm leading-relaxed'>
								The developer-first infrastructure management platform.
								Visualize, configure, and deploy with ease.
							</p>
							<div className='flex items-center gap-4'>
								<Link
									href='#'
									className='text-secondary hover:text-accent-cyan transition-colors interactive-element glow-hover'
								>
									<Github className='h-5 w-5' />
								</Link>
								<Link
									href='#'
									className='text-secondary hover:text-accent-cyan transition-colors interactive-element glow-hover'
								>
									<Twitter className='h-5 w-5' />
								</Link>
								<Link
									href='#'
									className='text-secondary hover:text-accent-cyan transition-colors interactive-element glow-hover'
								>
									<Linkedin className='h-5 w-5' />
								</Link>
								<Link
									href='#'
									className='text-secondary hover:text-accent-cyan transition-colors interactive-element glow-hover'
								>
									<Mail className='h-5 w-5' />
								</Link>
							</div>
						</div>

						{/* Product */}
						<div className='space-y-4'>
							<h3 className='text-primary font-semibold'>Product</h3>
							<div className='space-y-2'>
								<Link
									href='/dashboard'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Dashboard
								</Link>
								<Link
									href='/dashboard/infrastructure/create'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Infrastructure Builder
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Templates
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Integrations
								</Link>
							</div>
						</div>

						{/* Company */}
						<div className='space-y-4'>
							<h3 className='text-primary font-semibold'>Company</h3>
							<div className='space-y-2'>
								<Link
									href='/about'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									About Us
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Careers
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Blog
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Contact
								</Link>
							</div>
						</div>

						{/* Legal */}
						<div className='space-y-4'>
							<h3 className='text-primary font-semibold'>Legal</h3>
							<div className='space-y-2'>
								<Link
									href='/privacy'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Privacy Policy
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Terms of Service
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Cookie Policy
								</Link>
								<Link
									href='#'
									className='block text-secondary hover:text-accent-cyan transition-colors text-sm interactive-element'
								>
									Security
								</Link>
							</div>
						</div>
					</div>

					{/* Bottom section */}
					<div className='pt-8 border-t border-white/10'>
						<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
							<div className='flex items-center gap-2 text-secondary text-sm'>
								<span>© 2025 Clouding. Made with</span>
								<Heart className='h-4 w-4 text-accent-orange' />
								<span>by developers, for developers</span>
								<Code className='h-4 w-4 text-accent-cyan' />
							</div>
							<div className='flex items-center gap-6 text-sm'>
								<span className='text-secondary'>Status:</span>
								<div className='flex items-center gap-2'>
									<div className='w-2 h-2 bg-status-success rounded-full animate-pulse-soft' />
									<span className='text-status-success font-medium'>
										All systems operational
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
