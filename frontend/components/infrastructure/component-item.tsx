import React from 'react'
import type { ComponentItem } from '@/lib/infrastructure-components'

interface ComponentItemProps {
	component: ComponentItem
	isCollapsed?: boolean
	onDragStart: (event: React.DragEvent, nodeType: string) => void
	onMobileDrag?: () => void
}

export function ComponentItemComponent({
	component,
	isCollapsed = false,
	onDragStart,
	onMobileDrag,
}: ComponentItemProps) {
	const handleDragStart = (event: React.DragEvent) => {
		onDragStart(event, component.id)
		onMobileDrag?.()
	}

	return (
		<div
			key={component.id}
			draggable
			onDragStart={handleDragStart}
			className={`p-3 rounded-lg border ${component.borderColor} ${component.bgColor} hover:scale-105 cursor-grab active:cursor-grabbing transition-all group ${
				isCollapsed ? 'flex justify-center ml-0' : 'ml-2'
			} interactive-element`}
			title={isCollapsed ? component.name : undefined}
		>
			{isCollapsed ? (
				<component.icon
					className={`h-4 w-4 ${component.color} group-hover:scale-110 transition-transform`}
				/>
			) : (
				<div className='flex items-center gap-3'>
					<component.icon
						className={`h-4 w-4 ${component.color} group-hover:scale-110 transition-transform`}
					/>
					<div className='min-w-0 flex-1'>
						<div className='font-medium text-white text-sm truncate'>
							{component.name}
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
