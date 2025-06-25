'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
	ReactFlow,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	useReactFlow,
	ReactFlowProvider,
	MarkerType,
	BackgroundVariant,
	type Connection,
	type Edge,
	type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { CustomNode } from '@/components/custom-node'
import { NavigationHeader } from '@/components/infrastructure/navigation-header'
import { ComponentsSidebar } from '@/components/infrastructure/components-sidebar'
import { EmptyState } from '@/components/infrastructure/empty-state'
import { componentCategories, nodeTypes } from '@/lib/infrastructure-components'
import { DashboardFooter } from '@/components/dashboard-footer'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

// Initialize expanded categories state
const initialExpandedCategories = componentCategories.reduce(
	(acc, category) => ({
		...acc,
		[category.name]: true,
	}),
	{} as Record<string, boolean>
)

interface InfrastructureBuilderState {
	agentConnected: boolean
	sidebarCollapsed: boolean
	mobileMenuOpen: boolean
	searchTerm: string
	expandedCategories: Record<string, boolean>
	draggedNodeType: string | null
}

function InfrastructureBuilder() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const [state, setState] = useState<InfrastructureBuilderState>({
		agentConnected: true,
		sidebarCollapsed: false,
		mobileMenuOpen: false,
		searchTerm: '',
		expandedCategories: initialExpandedCategories,
		draggedNodeType: null,
	})

	const reactFlowWrapper = useRef<HTMLDivElement>(null)
	const { screenToFlowPosition } = useReactFlow()

	// Memoized node types for React Flow
	const nodeTypesMap = useMemo(() => ({ customNode: CustomNode as any }), [])

	// Keyboard event handler for deleting selected nodes and edges
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle deletion if not typing in an input field
			const target = event.target as HTMLElement
			if (
				target &&
				(target.tagName === 'INPUT' ||
					target.tagName === 'TEXTAREA' ||
					target.contentEditable === 'true')
			) {
				return
			}

			if (event.key === 'Delete' || event.key === 'Backspace') {
				event.preventDefault()
				// Delete selected nodes and their connected edges
				setNodes(nds => {
					const selectedNodeIds = nds
						.filter(node => node.selected)
						.map(node => node.id)
					if (selectedNodeIds.length > 0) {
						// Also remove edges connected to deleted nodes
						setEdges(eds =>
							eds.filter(
								edge =>
									!selectedNodeIds.includes(edge.source) &&
									!selectedNodeIds.includes(edge.target) &&
									!edge.selected
							)
						)
					} else {
						// If no nodes selected, just delete selected edges
						setEdges(eds => eds.filter(edge => !edge.selected))
					}
					return nds.filter(node => !node.selected)
				})
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [setNodes, setEdges])

	// Optimized event handlers
	const handleConnect = useCallback(
		(params: Connection) => {
			const edge: Edge = {
				...params,
				id: `${params.source}-${params.target}`,
				type: 'smoothstep',
				style: {
					stroke: '#06b6d4',
					strokeWidth: 2,
				},
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: '#06b6d4',
				},
			}
			setEdges(eds => addEdge(edge, eds))
		},
		[setEdges]
	)

	// Handle individual node deletion
	const handleDeleteNode = useCallback(
		(nodeId: string) => {
			setNodes(nds => nds.filter(node => node.id !== nodeId))
			// Also remove all edges connected to this node
			setEdges(eds =>
				eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
			)
		},
		[setNodes, setEdges]
	)

	// Handle individual edge deletion
	const handleDeleteEdge = useCallback(
		(edgeId: string) => {
			setEdges(eds => eds.filter(edge => edge.id !== edgeId))
		},
		[setEdges]
	)

	const handleDragStart = useCallback(
		(event: React.DragEvent, nodeType: string) => {
			setState(prev => ({ ...prev, draggedNodeType: nodeType }))
			event.dataTransfer.effectAllowed = 'move'
		},
		[]
	)

	const handleDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault()

			if (!state.draggedNodeType || !reactFlowWrapper.current) return

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			})

			const nodeTypeData = nodeTypes.find(n => n.id === state.draggedNodeType)
			if (!nodeTypeData) return

			const newNode: Node = {
				id: `${state.draggedNodeType}-${Date.now()}`,
				type: 'customNode',
				position,
				data: {
					label: nodeTypeData.name,
					nodeType: state.draggedNodeType,
					icon: nodeTypeData.icon,
					color: nodeTypeData.color,
					bgColor: nodeTypeData.bgColor,
					borderColor: nodeTypeData.borderColor,
				},
			}

			setNodes(nds => nds.concat(newNode))
			setState(prev => ({ ...prev, draggedNodeType: null }))
		},
		[state.draggedNodeType, setNodes, screenToFlowPosition]
	)

	const handleDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'move'
	}, [])

	const handleCanvasClick = useCallback(() => {
		if (state.mobileMenuOpen) {
			setState(prev => ({ ...prev, mobileMenuOpen: false }))
		}
	}, [state.mobileMenuOpen])

	// State update handlers
	const handleMobileMenuToggle = useCallback(() => {
		setState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
	}, [])

	const handleSidebarToggle = useCallback(() => {
		setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
	}, [])

	const handleSearchChange = useCallback((searchTerm: string) => {
		setState(prev => ({ ...prev, searchTerm }))
	}, [])

	const handleCategoryToggle = useCallback((categoryName: string) => {
		setState(prev => ({
			...prev,
			expandedCategories: {
				...prev.expandedCategories,
				[categoryName]: !prev.expandedCategories[categoryName],
			},
		}))
	}, [])

	const handleMobileDrag = useCallback(() => {
		setState(prev => ({ ...prev, mobileMenuOpen: false }))
	}, [])

	// Handle selection changes to provide user feedback
	const handleSelectionChange = useCallback(
		({
			nodes: selectedNodes,
			edges: selectedEdges,
		}: {
			nodes: Node[]
			edges: Edge[]
		}) => {
			// Update the selection state in nodes and edges
			setNodes(nds =>
				nds.map(node => ({
					...node,
					selected: selectedNodes.some(n => n.id === node.id),
				}))
			)
			setEdges(eds =>
				eds.map(edge => ({
					...edge,
					selected: selectedEdges.some(e => e.id === edge.id),
					style: {
						...edge.style,
						stroke: selectedEdges.some(e => e.id === edge.id)
							? '#ef4444'
							: '#06b6d4',
						strokeWidth: selectedEdges.some(e => e.id === edge.id) ? 3 : 2,
					},
				}))
			)
		},
		[setNodes, setEdges]
	)

	return (
		<div className='h-screen gradient-bg noise-overlay flex flex-col overflow-hidden'>
			{/* Top Navigation Bar */}
			<NavigationHeader
				agentConnected={state.agentConnected}
				mobileMenuOpen={state.mobileMenuOpen}
				onMobileMenuToggle={handleMobileMenuToggle}
			/>

			{/* Main Content Area */}
			<div className='flex flex-1 overflow-hidden relative h-full'>
				{/* Desktop Sidebar */}
				<ComponentsSidebar
					isCollapsed={state.sidebarCollapsed}
					searchTerm={state.searchTerm}
					expandedCategories={state.expandedCategories}
					onToggleCollapsed={handleSidebarToggle}
					onSearchChange={handleSearchChange}
					onCategoryToggle={handleCategoryToggle}
					onDragStart={handleDragStart}
				/>

				{/* Mobile Sidebar Overlay */}
				{state.mobileMenuOpen && (
					<>
						{/* Backdrop */}
						<div
							className='fixed inset-0 bg-black/50 z-40 lg:hidden'
							onClick={handleMobileMenuToggle}
						/>
						{/* Mobile Sidebar */}
						<ComponentsSidebar
							isCollapsed={false}
							isMobile
							searchTerm={state.searchTerm}
							expandedCategories={state.expandedCategories}
							onSearchChange={handleSearchChange}
							onCategoryToggle={handleCategoryToggle}
							onDragStart={handleDragStart}
							onMobileDrag={handleMobileDrag}
						/>
					</>
				)}

				{/* React Flow Canvas */}
				<div className='flex-1 relative' ref={reactFlowWrapper}>
					<div
						className='absolute inset-0'
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onClick={handleCanvasClick}
					>
						<ReactFlow
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							onConnect={handleConnect}
							onSelectionChange={handleSelectionChange}
							nodeTypes={nodeTypesMap}
							className='bg-transparent'
							style={{ background: 'transparent' }}
							attributionPosition='bottom-right'
							selectNodesOnDrag={false}
							selectionOnDrag={true}
							multiSelectionKeyCode='Shift'
							deleteKeyCode='Delete'
							edgesReconnectable={true}
							defaultEdgeOptions={{
								type: 'smoothstep',
								style: {
									stroke: '#06b6d4',
									strokeWidth: 2,
								},
								markerEnd: {
									type: MarkerType.ArrowClosed,
									color: '#06b6d4',
								},
							}}
						>
							<Controls className='space-y-2' position='top-left' />
							<MiniMap
								className='!bg-white/10 !border-white/20'
								nodeColor={node => {
									const nodeTypeData = nodeTypes.find(
										n => n.id === node.data.nodeType
									)
									return nodeTypeData ? '#06b6d4' : '#6b7280'
								}}
								maskColor='rgba(0, 0, 0, 0.2)'
							/>
							<Background
								variant={BackgroundVariant.Dots}
								gap={15}
								size={1}
								color='rgba(255, 255, 255, 0.1)'
							/>
						</ReactFlow>
					</div>

					{/* Empty State */}
					{nodes.length === 0 && (
						<EmptyState isSidebarCollapsed={state.sidebarCollapsed} />
					)}
				</div>
			</div>
			<DashboardFooter />
		</div>
	)
}

export default function CreateInfraPage() {
	return (
		<ReactFlowProvider>
			<InfrastructureBuilder />
		</ReactFlowProvider>
	)
}
