import React, { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { componentCategories } from '@/lib/infrastructure-components'
import { ComponentCategoryComponent } from './component-category'
import { SearchBar } from './search-bar'

interface ComponentsSidebarProps {
	isCollapsed: boolean
	isMobile?: boolean
	searchTerm: string
	expandedCategories: Record<string, boolean>
	onToggleCollapsed?: () => void
	onSearchChange: (value: string) => void
	onCategoryToggle: (categoryName: string) => void
	onDragStart: (event: React.DragEvent, nodeType: string) => void
	onMobileDrag?: () => void
}

export function ComponentsSidebar({
	isCollapsed,
	isMobile = false,
	searchTerm,
	expandedCategories,
	onToggleCollapsed,
	onSearchChange,
	onCategoryToggle,
	onDragStart,
	onMobileDrag,
}: ComponentsSidebarProps) {
	// Filter components based on search term
	const filteredCategories = useMemo(
		() =>
			componentCategories
				.map(category => ({
					...category,
					components: category.components.filter(
						component =>
							component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							component.description
								.toLowerCase()
								.includes(searchTerm.toLowerCase())
					),
				}))
				.filter(
					category => category.components.length > 0 || searchTerm === ''
				),
		[searchTerm]
	)

	const sidebarContent = (
		<div className='glass-card h-full rounded-none border-0 flex flex-col max-h-full lg:p-2'>
			{/* Sidebar Header */}
			<div
				className={`flex items-center ${
					isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
				} p-3 border-b border-white/10`}
			>
				{(!isCollapsed || isMobile) && (
					<h3 className='text-sm font-semibold text-white'>Components</h3>
				)}
				{!isMobile && onToggleCollapsed && (
					<Button
						variant='ghost'
						size='sm'
						onClick={onToggleCollapsed}
						className='text-gray-400 hover:text-cyan-400 h-8 w-8 p-0'
					>
						{isCollapsed ? (
							<ChevronRight className='h-4 w-4' />
						) : (
							<ChevronLeft className='h-4 w-4' />
						)}
					</Button>
				)}
			</div>

			{/* Search Bar */}
			{(!isCollapsed || isMobile) && (
				<div className='px-3 py-2 border-b border-white/10'>
					<SearchBar value={searchTerm} onChange={onSearchChange} />
				</div>
			)}

			{/* Component List */}
			<div className='flex-1 overflow-y-auto p-3 min-h-0'>
				<div className='space-y-3'>
					{filteredCategories.map(category => (
						<ComponentCategoryComponent
							key={category.name}
							category={category}
							isExpanded={expandedCategories[category.name]}
							isCollapsed={isCollapsed && !isMobile}
							searchTerm={searchTerm}
							onToggle={() => onCategoryToggle(category.name)}
							onDragStart={onDragStart}
							onMobileDrag={onMobileDrag}
						/>
					))}
				</div>
			</div>

			{/* Instructions */}
			{(!isCollapsed || isMobile) && (
				<div className='p-3 border-t border-white/10'>
					<div className='text-xs text-gray-400 space-y-1'>
						<div>• Drag components to canvas</div>
						<div>• Connect nodes by dragging handles</div>
						<div>• Click nodes to configure</div>
					</div>
				</div>
			)}
		</div>
	)

	if (isMobile) {
		return (
			<div className='fixed left-0 top-16 bottom-0 w-72 z-50 lg:hidden'>
				{sidebarContent}
			</div>
		)
	}

	return (
		<div
			className={`${
				isCollapsed ? 'w-28' : 'w-72'
			} transition-all duration-300 flex-shrink-0 relative hidden lg:block mr-2 mt-2 h-full`}
		>
			{sidebarContent}
		</div>
	)
}
