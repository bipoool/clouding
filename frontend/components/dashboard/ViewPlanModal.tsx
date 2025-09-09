'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/utils/logger'
import { Badge } from '@/components/ui/badge'
import { Copy, FileCode, CheckCircle } from 'lucide-react'
import type { Blueprint } from '@/hooks/useBlueprint'

interface ViewPlanModalProps {
	config: Blueprint | null
	plan: string
	isOpen: boolean
	onClose: () => void
}

export function ViewPlanModal({
	config,
	plan,
	isOpen,
	onClose,
}: ViewPlanModalProps) {
	const [copied, setCopied] = useState(false)

	if (!config) return null

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(plan)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			logger.error('Failed to copy to clipboard:', error)
		}
	}


	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='bg-black/95 backdrop-blur-md border border-white/10 max-w-4xl max-h-[90vh] overflow-hidden'>
				<DialogHeader className='pb-4'>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<FileCode className='h-5 w-5 text-cyan-400' />
						Infrastructure Plan: {config.name}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						{config.description}
					</DialogDescription>

					<div className='flex items-center gap-2 pt-2'>
						<Badge variant='outline' className='bg-white/5 border-white/20'>
							{config.status}
						</Badge>
					</div>
				</DialogHeader>

				<div className='flex-1 flex flex-col overflow-hidden'>
					<div className='flex items-center justify-between mb-4 flex-shrink-0'>
						<div className='flex gap-2'>
							<Button
								variant='ghost'
								size='sm'
								onClick={handleCopy}
								className='glass-btn'
							>
								{copied ? (
									<>
										<CheckCircle className='h-4 w-4 mr-2 text-green-400' />
										Copied!
									</>
								) : (
									<>
										<Copy className='h-4 w-4 mr-2' />
										Copy
									</>
								)}
							</Button>
						</div>
					</div>

					<div className='flex-1 bg-gray-900/50 rounded-lg border border-white/10 overflow-hidden min-h-0 max-h-96'>
						<div className='h-full overflow-y-auto p-4'>
							<pre className='text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap'>
								<code>
									{plan || 'No plan available'}
								</code>
							</pre>
						</div>
					</div>
				</div>

				<div className='flex items-center justify-between pt-4 border-t border-white/10 flex-shrink-0'>
					{/* <div className='text-xs text-secondary'>
						{config.nodes.length} components • {config.edges.length} connections
					</div> */}

					<div className='flex gap-3'>
						<Button variant='ghost' onClick={onClose} className='glass-btn'>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
