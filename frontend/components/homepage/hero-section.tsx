'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import CardSwap, { Card } from '@/components/ui/CardSwap'
import { heroCards, ANIMATION_CONFIG } from '@/lib/homepage-data'
import { useResponsive } from '@/hooks/use-responsive'

export function HeroSection() {
	const screenSize = useResponsive()
	const cardConfig = ANIMATION_CONFIG.cardSwap[screenSize]

	return (
		<div className='relative z-20 flex flex-col items-center h-full justify-center px-4 sm:px-6 mt-10 lg:mt-20'>
			<div className='max-w-7xl mx-auto w-full h-full flex items-center'>
				<div className='flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-x-12 w-full'>
					{/* Hero Content */}
					<div className='flex-1 text-center lg:text-left max-w-2xl lg:max-w-none'>
						<div className='mb-6 lg:mb-8'>
							<h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 lg:mb-6 gradient-text font-jetbrains'>
								Clouding
							</h1>
							<p className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-200 mb-4 lg:mb-6 font-semibold'>
								Visualize. Configure. Deploy.
							</p>
						</div>

						<p className='text-base sm:text-lg lg:text-xl text-secondary mb-8 lg:mb-10 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0'>
							The developer-first infrastructure management platform. Build,
							configure, and deploy your infrastructure with visual
							drag-and-drop simplicity.
						</p>

						<Link href='/auth' className='inline-block'>
							<Button
								size='lg'
								className='gradient-border-btn px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-lg lg:text-xl'
							>
								Get Started
								<ArrowRight className='ml-2 lg:ml-3 h-5 w-5 lg:h-6 lg:w-6' />
							</Button>
						</Link>
					</div>

					{/* Hero Cards Animation */}
					<div
						className='flex-1 flex justify-center lg:justify-end relative w-full 
							min-h-[280px] mt-8
							sm:min-h-[350px] sm:mt-6 sm:mr-8
							lg:min-h-[500px] lg:mr-16 lg:mt-16'
					>
						<div className='w-full max-w-sm sm:max-w-md lg:max-w-none'>
							<CardSwap {...cardConfig}>
								{heroCards.map(card => {
									const IconComponent = card.icon
									return (
										<Card
											key={card.id}
											customClass={`${card.backgroundGradient} p-4 sm:p-5 lg:p-6`}
										>
											<div className='flex items-center mb-3 lg:mb-4'>
												<IconComponent
													className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 ${card.iconColor} mr-2 lg:mr-3`}
												/>
												<h3 className='text-lg sm:text-xl font-bold text-white'>
													{card.title}
												</h3>
											</div>
											<p className='text-gray-300 text-xs sm:text-sm leading-relaxed'>
												{card.description}
											</p>
										</Card>
									)
								})}
							</CardSwap>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
