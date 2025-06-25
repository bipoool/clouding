'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function AuthPage() {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

				<Tabs defaultValue='login' className='w-full'>
					<TabsList className='grid w-full grid-cols-2 bg-white/5 border border-white/10'>
						<TabsTrigger
							value='login'
							className='data-[state=active]:bg-cyan-500/20 data-[state=active]:text-accent-cyan'
						>
							Login
						</TabsTrigger>
						<TabsTrigger
							value='signup'
							className='data-[state=active]:bg-cyan-500/20 data-[state=active]:text-accent-cyan'
						>
							Sign Up
						</TabsTrigger>
					</TabsList>

					<TabsContent value='login' className='space-y-4 mt-6'>
						<div className='space-y-2'>
							<Label htmlFor='email' className='text-gray-200'>
								Email
							</Label>
							<Input
								id='email'
								type='email'
								placeholder='dev@clouding.com'
								className='glass-input'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password' className='text-gray-200'>
								Password
							</Label>
							<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									placeholder='••••••••'
									className='glass-input pr-10'
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3 text-secondary hover:text-accent-cyan'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</Button>
							</div>
						</div>

						<div className='flex items-center justify-between'>
							<Link
								href='/forgot-password'
								className='text-sm text-accent-cyan hover:text-cyan-300'
							>
								Forgot password?
							</Link>
						</div>

						<Link href='/dashboard'>
							<Button className='w-full my-4 gradient-border-btn'>Login</Button>
						</Link>
					</TabsContent>

					<TabsContent value='signup' className='space-y-4 mt-6'>
						<div className='space-y-2'>
							<Label htmlFor='signup-email' className='text-gray-200'>
								Email
							</Label>
							<Input
								id='signup-email'
								type='email'
								placeholder='dev@clouding.com'
								className='glass-input'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='signup-password' className='text-gray-200'>
								Password
							</Label>
							<div className='relative'>
								<Input
									id='signup-password'
									type={showPassword ? 'text' : 'password'}
									placeholder='••••••••'
									className='glass-input pr-10'
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3 text-secondary hover:text-accent-cyan'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</Button>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='confirm-password' className='text-gray-200'>
								Confirm Password
							</Label>
							<div className='relative'>
								<Input
									id='confirm-password'
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder='••••••••'
									className='glass-input pr-10'
								/>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='absolute right-0 top-0 h-full px-3 text-secondary hover:text-accent-cyan'
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<EyeOff className='h-4 w-4' />
									) : (
										<Eye className='h-4 w-4' />
									)}
								</Button>
							</div>
						</div>

						<Button className='w-full gradient-border-btn'>
							Create Account
						</Button>
					</TabsContent>
				</Tabs>
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
