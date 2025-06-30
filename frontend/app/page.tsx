'use client'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Background, HeroSection, FeaturesSection } from '@/components/homepage'

export default function HomePage() {
	return (
		<div className='overflow-x-hidden'>
			{/* Animated Background */}
			<Background />

			{/* Hero Section - Full Viewport */}
			<div className='min-h-screen relative overflow-hidden'>
				<Navbar />
				<HeroSection />
			</div>

			{/* Features Section */}
			<FeaturesSection />

			{/* Footer */}
			<div className='relative z-20'>
				<Footer />
			</div>
		</div>
	)
}
