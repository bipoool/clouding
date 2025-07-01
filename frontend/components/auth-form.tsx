'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Github } from 'lucide-react'
import { useAuthStore, useUser } from '@/lib/auth/store'

export function AuthForm() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const router = useRouter()
	const searchParams = useSearchParams()
	const user = useUser()

	// Get auth actions from Zustand store
	const { signInWithGoogle, signInWithGitHub, signInWithDiscord } =
		useAuthStore()

	// Check for auth errors from URL params
	useEffect(() => {
		const errorParam = searchParams.get('error')
		if (errorParam) {
			switch (errorParam) {
				case 'auth_error':
					setError('Authentication failed. Please try again.')
					break
				case 'server_error':
					setError('Server error occurred. Please try again.')
					break
				case 'no_code':
					setError('Authentication was cancelled or failed.')
					break
				default:
					setError('An error occurred during authentication.')
			}
		}
	}, [searchParams])

	// Redirect if already authenticated
	useEffect(() => {
		if (user) {
			router.push('/dashboard')
		}
	}, [user, router])

	const handleSocialAuth = async (
		provider: 'google' | 'github' | 'discord'
	) => {
		setLoading(true)
		setError('')

		try {
			switch (provider) {
				case 'google':
					await signInWithGoogle()
					break
				case 'github':
					await signInWithGitHub()
					break
				case 'discord':
					await signInWithDiscord()
					break
			}
		} catch (error: unknown) {
			setError('Failed to authenticate with social provider')
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen animated-bg flex items-center justify-center p-6 relative overflow-hidden'>
			{/* Back to Home */}
			<Link href='/' className='absolute top-6 left-6 z-10'>
				<Button
					variant='ghost'
					className='text-secondary hover:text-accent-cyan'
				>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Home
				</Button>
			</Link>

			{/* Auth Card */}
			<div className='glass-card w-full max-w-md relative z-10'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-accent-cyan mb-2 font-jetbrains'>
						{'<Clouding />'}
					</h1>
					<p className='text-secondary'>Access your infrastructure dashboard</p>
				</div>

				{/* Error Messages */}
				{error && (
					<Alert className='mb-6 border-red-500/20 bg-red-500/10'>
						<AlertDescription className='text-red-200'>
							{error}
						</AlertDescription>
					</Alert>
				)}

				{/* Social Auth Buttons */}
				<div className='space-y-4'>
					<Button
						onClick={() => handleSocialAuth('google')}
						disabled={loading}
						variant='outline'
						className='w-full glass-input hover:bg-white/10 h-12'
					>
						<svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
							<path
								fill='currentColor'
								d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
							/>
							<path
								fill='currentColor'
								d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
							/>
							<path
								fill='currentColor'
								d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
							/>
							<path
								fill='currentColor'
								d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
							/>
						</svg>
						Continue with Google
					</Button>

					<Button
						onClick={() => handleSocialAuth('github')}
						disabled={loading}
						variant='outline'
						className='w-full glass-input hover:bg-white/10 h-12'
					>
						<Github className='w-5 h-5 mr-3' />
						Continue with GitHub
					</Button>

					<Button
						onClick={() => handleSocialAuth('discord')}
						disabled={loading}
						variant='outline'
						className='w-full glass-input hover:bg-white/10 h-12'
					>
						<svg
							className='w-5 h-5 mr-3'
							viewBox='0 0 24 24'
							fill='currentColor'
						>
							<path d='M20.317 4.37c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.375-.444.864-.608 1.25a18.64 18.64 0 0 0-5.487 0 12.664 12.664 0 0 0-.617-1.25a.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z' />
						</svg>
						Continue with Discord
					</Button>
				</div>

				<div className='mt-8 text-center'>
					<p className='text-sm text-secondary'>
						By continuing, you agree to our{' '}
						<Link
							href='/privacy'
							className='text-accent-cyan hover:text-cyan-300'
						>
							Privacy Policy
						</Link>
					</p>
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
