import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
	ArrowLeft,
	Code,
	Users,
	Rocket,
	Github,
	Twitter,
	Linkedin,
} from 'lucide-react'

export default function AboutPage() {
	return (
		<div className='min-h-screen animated-bg'>
			{/* Navigation */}
			<nav className='relative z-10 flex items-center justify-between p-6'>
				<Link href='/'>
					<Button
						variant='ghost'
						className='text-secondary hover:text-accent-cyan'
					>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Home
					</Button>
				</Link>
				<div className='text-2xl font-bold text-accent-cyan font-jetbrains'>
					{'<Clouding />'}
				</div>
			</nav>

			<div className='relative z-10 max-w-6xl mx-auto px-6 py-12'>
				{/* Hero */}
				<div className='text-center mb-16'>
					<h1 className='text-5xl md:text-6xl font-bold mb-6 gradient-text font-jetbrains'>
						About Clouding
					</h1>
					<p className='text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed'>
						We're building the future of infrastructure management. Visual,
						intuitive, and powerful tools for developers who want to focus on
						building, not configuring.
					</p>
				</div>

				{/* Mission */}
				<div className='glass-card p-8 mb-12 hero-gradient'>
					<div className='flex items-center gap-3 mb-6'>
						<Rocket className='h-6 w-6 text-accent-cyan' />
						<h2 className='text-2xl font-bold text-primary'>Our Mission</h2>
					</div>
					<p className='text-lg text-gray-200 leading-relaxed'>
						Infrastructure management shouldn't require a PhD in DevOps. We
						believe developers should spend their time building amazing
						products, not wrestling with complex deployment configurations.
						Clouding transforms infrastructure management into a visual,
						intuitive experience that scales from prototype to production.
					</p>
				</div>

				{/* Tech Stack */}
				<div className='glass-card p-8 mb-12'>
					<div className='flex items-center gap-3 mb-6'>
						<Code className='h-6 w-6 text-accent-purple' />
						<h2 className='text-2xl font-bold text-primary'>Tech Stack</h2>
					</div>
					<div className='grid md:grid-cols-2 gap-8'>
						<div>
							<h3 className='text-lg font-semibold text-accent-cyan mb-4'>
								Frontend
							</h3>
							<div className='space-y-2 font-mono text-sm'>
								<div className='text-gray-200'>• Next.js 14 (App Router)</div>
								<div className='text-gray-200'>• TypeScript</div>
								<div className='text-gray-200'>• Tailwind CSS</div>
								<div className='text-gray-200'>• React Flow (Canvas)</div>
								<div className='text-gray-200'>• Framer Motion</div>
							</div>
						</div>
						<div>
							<h3 className='text-lg font-semibold text-accent-purple mb-4'>
								Backend
							</h3>
							<div className='space-y-2 font-mono text-sm'>
								<div className='text-gray-200'>• Node.js</div>
								<div className='text-gray-200'>• PostgreSQL</div>
								<div className='text-gray-200'>• Redis</div>
								<div className='text-gray-200'>• Docker</div>
								<div className='text-gray-200'>• Kubernetes</div>
							</div>
						</div>
					</div>
				</div>

				{/* Contact */}
				<div className='glass-card p-8 text-center'>
					<h2 className='text-2xl font-bold text-primary mb-6'>Get in Touch</h2>
					<p className='text-gray-200 mb-8'>
						Have questions or want to contribute? We'd love to hear from you.
					</p>
					<div className='flex justify-center gap-6'>
						<Button
							variant='ghost'
							className='text-secondary hover:text-accent-cyan glow-hover'
						>
							<Github className='h-5 w-5 mr-2' />
							GitHub
						</Button>
					</div>
				</div>
			</div>

			{/* Background Effects */}
			<div className='background-element inset-0 overflow-hidden'>
				<div className='absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-soft'></div>
				<div
					className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-soft'
					style={{ animationDelay: '1s' }}
				></div>
			</div>
		</div>
	)
}
