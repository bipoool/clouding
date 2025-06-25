'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import {
	ArrowRight,
	Code,
	Layers,
	Zap,
	Cloud,
	Database,
	Settings,
	Shield,
	Users,
	Globe,
	Activity,
	DollarSign,
	GitBranch,
} from 'lucide-react'
import Squares from '@/components/ui/Squares'
import CardSwap, { Card } from '@/components/ui/CardSwap'

export default function HomePage() {
	return (
		<>
			{/* Full Page Squares Background */}
			<div className='fixed top-0 left-0 w-full h-full z-0'>
				<Squares
					speed={0.1}
					squareSize={30}
					direction='diagonal'
					borderColor='#222222'
					hoverFillColor='#111111'
				/>
			</div>

			{/* Hero Section - Full Viewport */}
			<div className='min-h-screen relative overflow-hidden'>
				{/* Navigation */}
				<Navbar />

				{/* Hero Content */}
				<div className='relative z-20 flex flex-col items-center h-full justify-center px-6 mt-40'>
					<div className='max-w-7xl mx-auto w-full h-full flex items-center'>
						{/* Hero Content - Two Column Layout */}
						<div className='flex flex-col lg:flex-row items-center justify-between gap-x-12 w-full'>
							{/* Left Column - Main Content */}
							<div className='flex-1 text-center lg:text-left max-w-2xl'>
								<div className='mb-8'>
									<h1 className='text-6xl md:text-7xl lg:text-8xl font-bold mb-6 gradient-text font-jetbrains'>
										Clouding
									</h1>
									<p className='text-2xl md:text-3xl lg:text-4xl text-gray-200 mb-6 font-semibold'>
										Visualize. Configure. Deploy.
									</p>
								</div>

								<p className='text-xl text-secondary mb-10 leading-relaxed font-medium'>
									The developer-first infrastructure management platform. Build,
									configure, and deploy your infrastructure with visual
									drag-and-drop simplicity.
								</p>

								<Link href='/auth' className='inline-block'>
									<Button
										size='lg'
										className='gradient-border-btn px-10 py-5 text-xl'
									>
										Get Started
										<ArrowRight className='ml-3 h-6 w-6' />
									</Button>
								</Link>
							</div>

							{/* Right Column - CardSwap Component */}
							<div className='flex-1 flex justify-center lg:justify-end relative min-h-[500px] w-full mr-16'>
								<CardSwap
									width={500}
									height={400}
									cardDistance={40}
									verticalDistance={40}
									delay={4000}
									pauseOnHover={true}
									skewAmount={3}
									easing='elastic'
								>
									<Card customClass='bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6'>
										<div className='flex items-center mb-4'>
											<Cloud className='h-8 w-8 text-accent-cyan mr-3' />
											<h3 className='text-xl font-bold text-white'>
												Infrastructure
											</h3>
										</div>
										<p className='text-gray-300 text-sm leading-relaxed'>
											Visualize your cloud infrastructure with our intuitive
											drag-and-drop interface. See connections and dependencies
											in real-time.
										</p>
									</Card>

									<Card customClass='bg-gradient-to-br from-purple-900 to-gray-800 border-purple-700 p-6'>
										<div className='flex items-center mb-4'>
											<Settings className='h-8 w-8 text-accent-purple mr-3' />
											<h3 className='text-xl font-bold text-white'>
												Configuration
											</h3>
										</div>
										<p className='text-gray-300 text-sm leading-relaxed'>
											Configure your services with smart defaults and best
											practices. No more YAML hell or complex configuration
											files.
										</p>
									</Card>

									<Card customClass='bg-gradient-to-br from-orange-900 to-gray-800 border-orange-700 p-6'>
										<div className='flex items-center mb-4'>
											<Database className='h-8 w-8 text-accent-orange mr-3' />
											<h3 className='text-xl font-bold text-white'>
												Deployment
											</h3>
										</div>
										<p className='text-gray-300 text-sm leading-relaxed'>
											Deploy your infrastructure changes instantly with our
											intelligent deployment engine. Track progress and rollback
											when needed.
										</p>
									</Card>

									<Card customClass='bg-gradient-to-br from-green-900 to-gray-800 border-green-700 p-6'>
										<div className='flex items-center mb-4'>
											<Code className='h-8 w-8 text-green-400 mr-3' />
											<h3 className='text-xl font-bold text-white'>
												DevOps Ready
											</h3>
										</div>
										<p className='text-gray-300 text-sm leading-relaxed'>
											Built for modern DevOps workflows. Integrate with your
											CI/CD pipelines and version control systems seamlessly.
										</p>
									</Card>
								</CardSwap>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section - Next Fold */}
			<div className='relative'>
				<div className='max-w-7xl mx-auto px-6 py-20'>
					{/* Features Header */}
					<div className='text-center mb-16'>
						<h2 className='text-4xl md:text-5xl font-bold mb-6 gradient-text font-jetbrains'>
							Everything You Need
						</h2>
						<p className='text-xl text-gray-200 mb-4 font-semibold max-w-3xl mx-auto'>
							Designed for modern development teams.
						</p>
						<p className='text-lg text-secondary max-w-4xl mx-auto leading-relaxed font-medium'>
							From visualization to deployment, monitoring to security - our
							platform provides all the tools you need to manage your
							infrastructure efficiently and securely.
						</p>
					</div>

					{/* Bento Grid Layout */}
					<div className='grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-3 auto-rows-[200px]'>
						{/* Large Feature Card - Spans 2x2 */}
						<div className='md:col-span-3 lg:col-span-4 md:row-span-2 gradient-border-card group p-8 flex flex-col justify-center'>
							<Code className='h-16 w-16 text-accent-cyan mb-6 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-2xl font-bold mb-4 text-primary'>
								Developer First Experience
							</h3>
							<p className='text-secondary font-medium text-lg leading-relaxed'>
								Built by developers, for developers. Monospace fonts, dark
								themes, and clean interfaces that feel like home. Every
								interaction is designed to enhance your workflow.
							</p>
						</div>

						{/* Medium Feature Card */}
						<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
							<Layers className='h-12 w-12 text-accent-purple mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-3 text-primary'>
								Visual Configuration
							</h3>
							<p className='text-secondary font-medium'>
								Drag and drop your infrastructure components. No more YAML hell.
							</p>
						</div>

						{/* Medium Feature Card */}
						<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
							<Zap className='h-12 w-12 text-accent-orange mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-3 text-primary'>
								Instant Deploy
							</h3>
							<p className='text-secondary font-medium'>
								Deploy infrastructure changes instantly with automated
								rollbacks.
							</p>
						</div>

						{/* Wide Feature Card */}
						<div className='md:col-span-6 lg:col-span-4 gradient-border-card group p-6 flex items-center'>
							<Activity className='h-14 w-14 text-green-400 mr-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0' />
							<div>
								<h3 className='text-xl font-bold mb-2 text-primary'>
									Real-time Monitoring & Analytics
								</h3>
								<p className='text-secondary font-medium'>
									Monitor your infrastructure health with real-time metrics,
									intelligent alerts, and comprehensive logging across all your
									services and deployments.
								</p>
							</div>
						</div>

						{/* Medium Feature Card */}
						<div className='md:col-span-3 lg:col-span-4 gradient-border-card group p-6 flex flex-col justify-center'>
							<GitBranch className='h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-3 text-primary'>
								Infrastructure Version Control
							</h3>
							<p className='text-secondary font-medium'>
								Track all infrastructure changes with git-like version control,
								branching, and merge capabilities for safe deployments.
							</p>
						</div>

						{/* Small Feature Card */}
						<div className='md:col-span-2 gradient-border-card group p-4 flex flex-col justify-center text-center'>
							<Users className='h-10 w-10 text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-lg font-bold mb-2 text-primary'>
								Team Collaboration
							</h3>
							<p className='text-secondary font-medium text-sm'>
								Shared workspaces and role-based access control.
							</p>
						</div>

						{/* Medium Feature Card */}
						<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
							<Globe className='h-12 w-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300' />
							<h3 className='text-xl font-bold mb-3 text-primary'>
								Multi-Cloud Support
							</h3>
							<p className='text-secondary font-medium'>
								Deploy across AWS, Azure, GCP with unified management.
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
