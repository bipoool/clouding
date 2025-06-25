import Link from 'next/link'
import { Heart, Code } from 'lucide-react'

export function DashboardFooter() {
	return (
		<footer className='relative z-20 border-t border-white/10 bg-black/20 backdrop-blur-sm'>
			<div className='px-6 py-4'>
				<div className='flex flex-col sm:flex-row items-center justify-between gap-4 text-sm'>
					{/* Left side - Copyright and branding */}
					<div className='flex items-center gap-2 text-gray-400'>
						<span>© 2024 Clouding. Made with</span>
						<Heart className='h-4 w-4 text-orange-400' />
						<span>by developers, for developers</span>
						<Code className='h-4 w-4 text-cyan-400' />
					</div>

					{/* Right side - Quick links */}
					<div className='flex items-center gap-6 text-gray-400'>
						<Link
							href='/privacy'
							className='hover:text-cyan-400 transition-colors interactive-element'
						>
							Privacy
						</Link>
						<Link
							href='/about'
							className='hover:text-cyan-400 transition-colors interactive-element'
						>
							About
						</Link>
						<div className='flex items-center gap-2'>
							<div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
							<span className='text-green-400 text-xs'>Online</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
