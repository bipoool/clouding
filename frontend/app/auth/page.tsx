'use client'

import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'

export default function AuthPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen animated-bg flex items-center justify-center p-6'>
					<div className='glass-card w-full max-w-md'>
						<div className='text-center p-8'>
							<div className='animate-pulse'>
								<div className='h-8 bg-gray-600 rounded mb-4'></div>
								<div className='h-4 bg-gray-600 rounded mb-8'></div>
								<div className='space-y-4'>
									<div className='h-12 bg-gray-600 rounded'></div>
									<div className='h-12 bg-gray-600 rounded'></div>
									<div className='h-12 bg-gray-600 rounded'></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			}
		>
			<AuthForm />
		</Suspense>
	)
}
