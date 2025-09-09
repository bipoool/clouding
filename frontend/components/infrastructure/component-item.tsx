import React from 'react'
import type { ExtendedComponent } from '@/lib/infrastructure-components'

interface ComponentItemProps {
	component: ExtendedComponent
	isCollapsed?: boolean
	onDragStart: (event: React.DragEvent, nodeType: string) => void
	onMobileDrag?: () => void
	isUsed?: boolean
}

export function ComponentItemComponent({
	component,
	isCollapsed = false,
	onDragStart,
	onMobileDrag,
	isUsed = false,
}: ComponentItemProps) {
	const handleDragStart = (event: React.DragEvent) => {
		if (isUsed) {
			event.preventDefault()
			return
		}
		onDragStart(event, component.name)
		onMobileDrag?.()
	}

	return (
		<div
			key={component.id}
			draggable={!isUsed}
			onDragStart={handleDragStart}
			className={`p-3 rounded-lg border transition-all group ${
				isUsed 
					? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' 
					: `${component.borderColor} ${component.bgColor} hover:scale-105 cursor-grab active:cursor-grabbing interactive-element`
			} ${
				isCollapsed ? 'flex justify-center ml-0' : 'ml-2'
			}`}
			title={isCollapsed ? component.name : isUsed ? `${component.name} (Already used)` : undefined}
		>
			{isCollapsed ? (
				<component.icon
					className={`h-4 w-4 ${isUsed ? 'text-gray-400' : component.color} group-hover:scale-110 transition-transform`}
				/>
			) : (
				<div className='flex items-center gap-3'>
					<component.icon
						className={`h-4 w-4 ${isUsed ? 'text-gray-400' : component.color} group-hover:scale-110 transition-transform`}
					/>
					<div className='min-w-0 flex-1'>
						<div className={`font-medium text-sm truncate ${isUsed ? 'text-gray-500' : 'text-white'}`}>
							{component.displayName}
						</div>
						<div className='text-xs text-gray-400 truncate'>
							{component.description}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
