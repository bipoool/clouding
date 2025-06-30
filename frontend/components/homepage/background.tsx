'use client'
import Squares from '@/components/ui/Squares'
import { ANIMATION_CONFIG } from '@/lib/homepage-data'

export function Background() {
	return (
		<div className='fixed top-0 left-0 w-full h-full z-0' aria-hidden='true'>
			<Squares {...ANIMATION_CONFIG.squares} />
		</div>
	)
}
