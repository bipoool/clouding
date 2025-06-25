import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'

export default function PrivacyPage() {
	return (
		<div className='min-h-screen gradient-bg noise-overlay'>
			{/* Navigation */}
			<nav className='relative z-10 flex items-center justify-between p-6'>
				<Link href='/'>
					<Button variant='ghost' className='text-gray-400 hover:text-cyan-400'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Home
					</Button>
				</Link>
				<div className='text-2xl font-bold text-cyan-400'>{'<Clouding />'}</div>
			</nav>

			<div className='relative z-10 max-w-4xl mx-auto px-6 py-12'>
				{/* Header */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent'>
						Privacy Policy
					</h1>
					<p className='text-lg text-gray-300'>Last updated: January 2024</p>
				</div>

				{/* Content */}
				<div className='glass-card space-y-8'>
					{/* Introduction */}
					<section>
						<div className='flex items-center gap-3 mb-4'>
							<Shield className='h-6 w-6 text-cyan-400' />
							<h2 className='text-2xl font-bold text-white'>Introduction</h2>
						</div>
						<p className='text-gray-300 leading-relaxed'>
							At Clouding, we take your privacy seriously. This Privacy Policy
							explains how we collect, use, disclose, and safeguard your
							information when you use our infrastructure management platform.
							We are committed to protecting your personal information and your
							right to privacy.
						</p>
					</section>

					{/* Information We Collect */}
					<section>
						<div className='flex items-center gap-3 mb-4'>
							<Database className='h-6 w-6 text-purple-400' />
							<h2 className='text-2xl font-bold text-white'>
								Information We Collect
							</h2>
						</div>
						<div className='space-y-4'>
							<div>
								<h3 className='text-lg font-semibold text-cyan-400 mb-2'>
									Personal Information
								</h3>
								<ul className='text-gray-300 space-y-1 ml-4'>
									<li className='font-mono text-sm'>
										• Name and email address
									</li>
									<li className='font-mono text-sm'>• Account credentials</li>
									<li className='font-mono text-sm'>• Profile information</li>
									<li className='font-mono text-sm'>
										• Payment information (processed by third-party providers)
									</li>
								</ul>
							</div>

							<div>
								<h3 className='text-lg font-semibold text-purple-400 mb-2'>
									Usage Information
								</h3>
								<ul className='text-gray-300 space-y-1 ml-4'>
									<li className='font-mono text-sm'>
										• Infrastructure configurations
									</li>
									<li className='font-mono text-sm'>
										• Application logs and metrics
									</li>
									<li className='font-mono text-sm'>
										• Feature usage analytics
									</li>
									<li className='font-mono text-sm'>
										• Device and browser information
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* How We Use Information */}
					<section>
						<div className='flex items-center gap-3 mb-4'>
							<Eye className='h-6 w-6 text-pink-400' />
							<h2 className='text-2xl font-bold text-white'>
								How We Use Your Information
							</h2>
						</div>
						<div className='text-gray-300 space-y-3'>
							<p>We use the information we collect to:</p>
							<ul className='space-y-2 ml-4'>
								<li className='font-mono text-sm'>
									• Provide and maintain our services
								</li>
								<li className='font-mono text-sm'>
									• Process your infrastructure deployments
								</li>
								<li className='font-mono text-sm'>
									• Send you technical notices and support messages
								</li>
								<li className='font-mono text-sm'>
									• Improve our platform and develop new features
								</li>
								<li className='font-mono text-sm'>
									• Ensure security and prevent fraud
								</li>
								<li className='font-mono text-sm'>
									• Comply with legal obligations
								</li>
							</ul>
						</div>
					</section>

					{/* Data Security */}
					<section>
						<div className='flex items-center gap-3 mb-4'>
							<Lock className='h-6 w-6 text-green-400' />
							<h2 className='text-2xl font-bold text-white'>Data Security</h2>
						</div>
						<div className='text-gray-300 space-y-4'>
							<p>
								We implement appropriate technical and organizational security
								measures to protect your personal information against
								unauthorized access, alteration, disclosure, or destruction.
							</p>
							<div className='bg-white/5 border border-white/10 rounded-lg p-4'>
								<h3 className='text-lg font-semibold text-green-400 mb-2'>
									Security Measures
								</h3>
								<ul className='space-y-1'>
									<li className='font-mono text-sm'>
										• End-to-end encryption for data in transit
									</li>
									<li className='font-mono text-sm'>
										• AES-256 encryption for data at rest
									</li>
									<li className='font-mono text-sm'>
										• Regular security audits and penetration testing
									</li>
									<li className='font-mono text-sm'>
										• Multi-factor authentication
									</li>
									<li className='font-mono text-sm'>
										• SOC 2 Type II compliance
									</li>
								</ul>
							</div>
						</div>
					</section>

					{/* Your Rights */}
					<section>
						<h2 className='text-2xl font-bold text-white mb-4'>Your Rights</h2>
						<div className='text-gray-300 space-y-3'>
							<p>You have the right to:</p>
							<div className='grid md:grid-cols-2 gap-4'>
								<div className='bg-white/5 border border-white/10 rounded-lg p-4'>
									<h3 className='font-semibold text-cyan-400 mb-2'>
										Access & Portability
									</h3>
									<p className='text-sm'>
										Request access to your personal data and receive a copy in a
										portable format.
									</p>
								</div>
								<div className='bg-white/5 border border-white/10 rounded-lg p-4'>
									<h3 className='font-semibold text-purple-400 mb-2'>
										Correction
									</h3>
									<p className='text-sm'>
										Request correction of inaccurate or incomplete personal
										data.
									</p>
								</div>
								<div className='bg-white/5 border border-white/10 rounded-lg p-4'>
									<h3 className='font-semibold text-pink-400 mb-2'>Deletion</h3>
									<p className='text-sm'>
										Request deletion of your personal data under certain
										circumstances.
									</p>
								</div>
								<div className='bg-white/5 border border-white/10 rounded-lg p-4'>
									<h3 className='font-semibold text-green-400 mb-2'>
										Objection
									</h3>
									<p className='text-sm'>
										Object to the processing of your personal data for certain
										purposes.
									</p>
								</div>
							</div>
						</div>
					</section>

					{/* Contact */}
					<section className='border-t border-white/10 pt-8'>
						<h2 className='text-2xl font-bold text-white mb-4'>Contact Us</h2>
						<div className='text-gray-300'>
							<p className='mb-4'>
								If you have any questions about this Privacy Policy or our data
								practices, please contact us:
							</p>
							<div className='bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm'>
								<div>Email: privacy@clouding.dev</div>
								<div>Address: 123 Developer Street, Tech City, TC 12345</div>
								<div>Phone: +1 (555) 123-4567</div>
							</div>
						</div>
					</section>
				</div>
			</div>

			{/* Background Effects */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse'></div>
				<div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
			</div>
		</div>
	)
}
