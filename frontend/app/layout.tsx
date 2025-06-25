import type React from 'react'
import type { Metadata } from 'next'
import { FontLoader } from '@/components/font-loader'
import './globals.css'

export const metadata: Metadata = {
	title: 'Clouding - Infrastructure Management',
	description: 'Visualize. Configure. Deploy.',
	generator: 'v0.dev',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en'>
			<body className='font-mono antialiased animated-bg min-h-screen'>
				<FontLoader />
				{children}
			</body>
		</html>
	)
}
