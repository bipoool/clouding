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
import { ViewPlanModal } from '@/components/dashboard/ViewPlanModal'
import { BlueprintMetadataModal } from '@/components/dashboard/BlueprintMetadataModal'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import { buildComponentCategories, getNodeTypes } from '@/lib/infrastructure-components'
import { useBlueprints } from '@/hooks/useBlueprint'
import { useComponents } from '@/hooks/useComponents'
import { DashboardFooter } from '@/components/dashboard-footer'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

// Initialize expanded categories state - will be updated when components are loaded
const getInitialExpandedCategories = (categories: any[]) => categories.reduce(
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
	isViewPlanOpen: boolean
	generatedPlan: string
	configName: string
	configDescription: string
	blueprintId?: string
}

function InfrastructureBuilder() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	
	// Fetch components from API
	const { components, isLoading, error } = useComponents()
	
	// Use blueprints hook for create/update operations
	const { createBlueprint, updateBlueprint } = useBlueprints()
	
	// Build component categories from API data
	const componentCategories = useMemo(() => {
		if (isLoading || error || !components.length) {
			return []
		}
		return buildComponentCategories(components)
	}, [components, isLoading, error])
	
	// Build node types from API data
	const nodeTypes = useMemo(() => {
		if (isLoading || error || !components.length) {
			return []
		}
		return getNodeTypes(components)
	}, [components, isLoading, error])
	
	// Initialize expanded categories when components are loaded
	const [state, setState] = useState<InfrastructureBuilderState>({
		agentConnected: true,
		sidebarCollapsed: false,
		mobileMenuOpen: false,
		searchTerm: '',
		expandedCategories: {},
		draggedNodeType: null,
		isViewPlanOpen: false,
		generatedPlan: '',
		configName: '',
		configDescription: '',
		blueprintId: undefined,
	})
	
	// Update expanded categories when componentCategories change
	useEffect(() => {
		if (componentCategories.length > 0) {
			const expandedCategories = getInitialExpandedCategories(componentCategories)
			setState(prev => ({
				...prev,
				expandedCategories
			}))
		}
	}, [componentCategories])

	const reactFlowWrapper = useRef<HTMLDivElement>(null)
	const { screenToFlowPosition } = useReactFlow()
	const { generatePlan } = useBlueprints()

	// Handle node configuration save
	const handleNodeConfigurationSave = useCallback((nodeId: string, parameters: Record<string, any>) => {
		setNodes(nds =>
			nds.map(node =>
				node.id === nodeId
					? {
							...node,
							data: {
								...node.data,
								parameters,
							},
					  }
					: node
			)
		)
	}, [setNodes])

	// Memoized node types for React Flow
	const nodeTypesMap = useMemo(() => {
		const CustomNodeWrapper = (props: any) => (
			<CustomNode {...props} onConfigurationSave={handleNodeConfigurationSave} />
		)
		return { customNode: CustomNodeWrapper }
	}, [handleNodeConfigurationSave])

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

			const nodeTypeData = nodeTypes.find(n => n.name === state.draggedNodeType)
			if (!nodeTypeData) return

			const newNode: Node = {
				id: `${state.draggedNodeType}-${Date.now()}`,
				type: 'customNode',
				position,
				data: {
					id: `${state.draggedNodeType}-${Date.now()}`,
					label: nodeTypeData.displayName,
					nodeType: state.draggedNodeType,
					icon: nodeTypeData.icon,
					color: nodeTypeData.color,
					bgColor: nodeTypeData.bgColor,
					borderColor: nodeTypeData.borderColor,
					components: components,
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

	// Configuration management handlers
	const handleSaveConfiguration = useCallback(() => {
		if (nodes.length === 0) {
			alert('Please add some components to your configuration before saving.')
			return
		}

		const configName = state.configName || `Config-${Date.now()}`
		const newConfig = {
			name: configName,
			type: 'custom' as const,
			nodes,
			edges,
			deploymentStatus: 'draft' as const,
			assignedVMs: [],
			assignedGroups: [],
		}
		
		// Log nodes with their configured parameters
		console.log('Configuration saved with nodes and parameters:')
		nodes.forEach(node => {
			console.log(`Node: ${node.data.label} (${node.data.nodeType})`)
			if (node.data.parameters) {
				console.log('Parameters:', node.data.parameters)
			} else {
				console.log('No parameters configured')
			}
			console.log('---')
		})
		
		console.log('Full configuration:', nodes)
		alert(`Configuration "${configName}" saved successfully!`)
	}, [nodes, edges, state.configName])

	const handleClearCanvas = useCallback(() => {
		if (nodes.length === 0 && edges.length === 0) return

		if (
			confirm(
				'Are you sure you want to clear the canvas? This action cannot be undone.'
			)
		) {
			setNodes([])
			setEdges([])
			setState(prev => ({ ...prev, configName: '' }))
		}
	}, [nodes.length, edges.length, setNodes, setEdges])

	const handleViewPlan = useCallback(() => {
		if (nodes.length === 0) {
			alert('Please add some components to generate a deployment plan.')
			return
		}

		const mockConfig = {
			id: 'temp-config',
			name: state.configName || 'Untitled Configuration',
			type: 'custom' as const,
			nodes,
			edges,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			deploymentStatus: 'draft' as const,
			assignedVMs: [],
			assignedGroups: [],
		}

		// const plan = generatePlan(mockConfig)
		// setState(prev => ({
		// 	...prev,
		// 	generatedPlan: plan,
		// 	isViewPlanOpen: true,
		// }))
	}, [nodes, edges, state.configName, generatePlan])

	const handleClosePlanModal = useCallback(() => {
		setState(prev => ({ ...prev, isViewPlanOpen: false }))
	}, [])

	const handleConfigUpdate = useCallback(async (data: { name: string; description?: string }) => {
		try {
			const isEditing = !!state.blueprintId
			
			if (isEditing && state.blueprintId) {
				// Update existing blueprint
				const response = await updateBlueprint(parseInt(state.blueprintId), {
					name: data.name,
					description: data.description || ''
				})
				console.log('response', response)
				// Update state with the response data (server-side mutations preserved)
				setState(prev => ({ 
					...prev, 
					configName: response.name,
					configDescription: response.description,
					blueprintId: response.id.toString()
				}))
				console.log('state', state)
			} else {
				// Create new blueprint
				const response = await createBlueprint(
					data.name,
					data.description || '',
					'draft'
				)
				
				// Update state with the new blueprint ID
				setState(prev => ({ 
					...prev, 
					configName: response.name,
					configDescription: response.description,
					blueprintId: response.id.toString()
				}))
				console.log('response', response)
				console.log('state', state)
			}
		} catch (error) {
			console.error('Failed to save blueprint:', error)
			// You might want to show a toast notification here
			throw error
		}
	}, [state.blueprintId, createBlueprint, updateBlueprint])

	// Show loading state
	if (isLoading) {
		return (
			<div className='h-screen gradient-bg noise-overlay flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
					<p className='text-white'>Loading components...</p>
				</div>
			</div>
		)
	}

	// Show error state
	if (error) {
		return (
			<div className='h-screen gradient-bg noise-overlay flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-400 mb-4'>Failed to load components</p>
					<p className='text-gray-400 text-sm'>{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className='h-screen gradient-bg noise-overlay flex flex-col overflow-hidden'>
			{/* Top Navigation Bar */}
			<NavigationHeader
				agentConnected={state.agentConnected}
				mobileMenuOpen={state.mobileMenuOpen}
				configName={state.configName}
				configDescription={state.configDescription}
				onMobileMenuToggle={handleMobileMenuToggle}
				onSave={handleSaveConfiguration}
				onClear={handleClearCanvas}
				onViewPlan={handleViewPlan}
				configModalTrigger={
					<BlueprintMetadataModal
						onSave={handleConfigUpdate}
						initialData={
							state.blueprintId
								? { name: state.configName, description: state.configDescription }
								: undefined
						}
						trigger={
							<Button
								variant='ghost'
								size='sm'
								className='p-1 h-auto text-gray-400 hover:text-cyan-400'
								aria-label='Edit configuration metadata'
								title='Edit configuration metadata'
							>
								<Edit className='h-3 w-3' />
							</Button>
						}
					/>
				}
			/>

			{/* Main Content Area */}
			<div className='flex flex-1 overflow-hidden relative h-full'>
				{/* Desktop Sidebar */}
				<ComponentsSidebar
					componentCategories={componentCategories}
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
							componentCategories={componentCategories}
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

			{/* View Plan Modal */}
			<ViewPlanModal
				config={{
					id: 0,
					name: state.configName || 'Untitled Configuration',
					description: 'Draft',
					status: 'draft',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}}
				plan={state.generatedPlan}
				isOpen={state.isViewPlanOpen}
				onClose={handleClosePlanModal}
			/>
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
