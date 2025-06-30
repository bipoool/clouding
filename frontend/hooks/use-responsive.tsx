'use client'
import { useState, useEffect } from 'react'

type ScreenSize = 'mobile' | 'tablet' | 'desktop'

export function useResponsive(): ScreenSize {
	const [screenSize, setScreenSize] = useState<ScreenSize>('desktop')

	useEffect(() => {
		const checkScreenSize = () => {
			const width = window.innerWidth
			if (width < 768) {
				setScreenSize('mobile')
			} else if (width < 1024) {
				setScreenSize('tablet')
			} else {
				setScreenSize('desktop')
			}
		}

		// Check on mount
		checkScreenSize()

		// Listen for resize events
		window.addEventListener('resize', checkScreenSize)

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize)
	}, [])

	return screenSize
}
