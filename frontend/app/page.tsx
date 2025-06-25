'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { ArrowRight, Code, Layers, Zap } from 'lucide-react'
import Squares from '@/components/ui/Squares'

export default function HomePage() {
	return (
		<>
			<div className='absolute top-0 left-0 h-screen w-screen'>
				<div className='relative h-full w-full'>
					<Squares
						speed={0.1}
						squareSize={30}
						direction='diagonal' // up, down, left, right, diagonal
						borderColor='#222222'
						hoverFillColor='#111111'
					/>
				</div>
			</div>
			<div className='min-h-screen relative overflow-hidden'>
				{/* Navigation */}
				<Navbar />

				{/* Hero Section */}
				<div className='relative z-20 flex flex-col items-center justify-center min-h-[80vh] px-6'>
					<div className='max-w-4xl mx-auto text-center p-12'>
						<div className='mb-8'>
							<h1 className='text-6xl md:text-8xl font-bold mb-6 gradient-text font-jetbrains'>
								Clouding
							</h1>
							<p className='text-2xl md:text-3xl text-gray-200 mb-4 font-semibold'>
								Visualize. Configure. Deploy.
							</p>
						</div>

						<p className='text-lg text-secondary mb-8 max-w-2xl mx-auto leading-relaxed font-medium'>
							The developer-first infrastructure management platform. Build,
							configure, and deploy your infrastructure with visual
							drag-and-drop simplicity.
						</p>

						<Link href='/auth' className='inline-block'>
							<Button
								size='lg'
								className='gradient-border-btn px-8 py-4 text-lg'
							>
								Get Started
								<ArrowRight className='ml-2 h-5 w-5' />
							</Button>
						</Link>
					</div>

					{/* Features */}
					<div className='grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto'>
						<div className='glass-card-hover text-center group p-8'>
							<Code className='h-12 w-12 text-accent-cyan mx-auto mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-2 text-primary'>
								Developer First
							</h3>
							<p className='text-secondary font-medium'>
								Built by developers, for developers. Monospace fonts, dark
								themes, and clean interfaces.
							</p>
						</div>

						<div className='glass-card-hover text-center group p-8'>
							<Layers className='h-12 w-12 text-accent-purple mx-auto mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-2 text-primary'>
								Visual Configuration
							</h3>
							<p className='text-secondary font-medium'>
								Drag and drop your infrastructure components. No more YAML hell
								or complex configurations.
							</p>
						</div>

						<div className='glass-card-hover text-center group p-8'>
							<Zap className='h-12 w-12 text-accent-orange mx-auto mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-2 text-primary'>
								Instant Deploy
							</h3>
							<p className='text-secondary font-medium'>
								Deploy your infrastructure changes instantly with our
								intelligent deployment engine.
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className='relative z-20'>
					<Footer />
				</div>
			</div>
		</>
	)
}
