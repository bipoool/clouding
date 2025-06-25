import React from 'react'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
	isSidebarCollapsed: boolean
}

export function EmptyState({ isSidebarCollapsed }: EmptyStateProps) {
	return (
		<div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
			<div className='text-center px-4'>
				<Plus className='h-12 sm:h-16 w-12 sm:w-16 text-gray-600 mx-auto mb-4' />
				<p className='text-gray-500 font-medium text-base sm:text-lg mb-2'>
					Start Building Your Infrastructure
				</p>
				<p className='text-gray-600 text-sm mb-3'>
					<span className='lg:hidden'>
						Tap the menu button to access components
					</span>
					<span className='hidden lg:inline'>
						Drag components from the{' '}
						{isSidebarCollapsed ? 'sidebar icons' : 'component palette'} to get
						started
					</span>
				</p>
				<div className='text-gray-500 text-xs space-y-1'>
					<p>• Click and drag to connect components</p>
					<p>• Select components/connections and press Delete to remove</p>
					<p>• Hold Shift to select multiple items</p>
				</div>
			</div>
		</div>
	)
}
