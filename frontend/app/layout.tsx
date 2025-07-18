import './globals.css'

import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { CredentialsProvider } from '@/lib/contexts/credentials-context'

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains',
})

export const metadata: Metadata = {
	title: 'Clouding - Modern Infrastructure Management',
	description:
		'Simplify your cloud infrastructure with our modern, intuitive platform.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${jetbrainsMono.variable} font-sans antialiased`}>
				<ThemeProvider
					attribute='class'
					defaultTheme='dark'
					enableSystem
					disableTransitionOnChange
				>
					<CredentialsProvider>
						{children}
						<Toaster />
						<Analytics />
						<SpeedInsights />
					</CredentialsProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
