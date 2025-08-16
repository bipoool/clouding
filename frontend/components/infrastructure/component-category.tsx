import React from 'react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { ExtendedComponentCategory } from '@/lib/infrastructure-components'
import { ComponentItemComponent } from './component-item'

interface ComponentCategoryProps {
	category: ExtendedComponentCategory
	isExpanded: boolean
	isCollapsed?: boolean
	searchTerm?: string
	onToggle: () => void
	onDragStart: (event: React.DragEvent, nodeType: string) => void
	onMobileDrag?: () => void
}

export function ComponentCategoryComponent({
	category,
	isExpanded,
	isCollapsed = false,
	searchTerm = '',
	onToggle,
	onDragStart,
	onMobileDrag,
}: ComponentCategoryProps) {
	return (
		<Collapsible open={searchTerm ? true : isExpanded} onOpenChange={onToggle}>
			{/* Category Header */}
			<CollapsibleTrigger className='w-full' disabled={!!searchTerm}>
				<div
					className={`flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${
						isCollapsed ? 'px-2 justify-center' : ''
					}`}
				>
					{isCollapsed ? (
						<category.icon className={`h-4 w-4 ${category.color}`} />
					) : (
						<>
							<div className='flex items-center gap-2'>
								<category.icon className={`h-4 w-4 ${category.color}`} />
								<span className='text-sm font-semibold text-white'>
									{category.name}
								</span>
							</div>
							<ChevronDown
								className={`h-4 w-4 text-gray-400 transition-transform ${
									isExpanded ? 'rotate-180' : ''
								}`}
							/>
						</>
					)}
				</div>
			</CollapsibleTrigger>

			{/* Category Components */}
			<CollapsibleContent className='space-y-2 mt-2'>
				{category.components.map(component => (
					<ComponentItemComponent
						key={component.id}
						component={component}
						isCollapsed={isCollapsed}
						onDragStart={onDragStart}
						onMobileDrag={onMobileDrag}
					/>
				))}
			</CollapsibleContent>
		</Collapsible>
	)
}
