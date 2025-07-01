'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/utils/logger'

export function FontLoader() {
	useEffect(() => {
		// Load Space Mono font from Google Fonts
		const link = document.createElement('link')
		link.href =
			'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap'
		link.rel = 'stylesheet'
		link.type = 'text/css'
		document.head.appendChild(link)

		// Wait for font to load
		if ('fonts' in document) {
			document.fonts.ready
				.then(() => {
					document.body.classList.add('fonts-loaded')
				})
				.catch(err => {
					logger.warn('Font loading failed:', err)
					// Fallback to system fonts
					document.body.classList.add('fonts-loaded')
				})
		} else {
			// Fallback for browsers without font loading API
			setTimeout(() => {
				document.body.classList.add('fonts-loaded')
			}, 100)
		}

		return () => {
			// Cleanup
			const existingLink = document.querySelector('link[href*="Space+Mono"]')
			if (existingLink) {
				existingLink.remove()
			}
		}
	}, [])

	return null
}
