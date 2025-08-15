import './globals.css'

import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains',
})

export const metadata: Metadata = {
	title: 'Clouding - Modern Infrastructure Management',
	description:
		'Simplify your cloud infrastructure with our modern, intuitive platform.',
	icons: {
		icon: [
			{
				url: '/favicon-16x16.png',
				sizes: '16x16',
				type: 'image/png',
			},
			{
				url: '/favicon-32x32.png',
				sizes: '32x32',
				type: 'image/png',
			},
		],
		apple: [
			{
				url: '/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
		other: [
			{
				rel: 'mask-icon',
				url: '/android-chrome-192x192.png',
			},
		],
	},
	manifest: '/site.webmanifest',
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
					{children}
					<Toaster />
					<Analytics />
					<SpeedInsights />
				</ThemeProvider>
			</body>
		</html>
	)
}
