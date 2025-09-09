'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { Edit, FileCode } from 'lucide-react'
import { buildComponentCategories, getNodeTypes } from '@/lib/infrastructure-components'
import { useBlueprints, type BlueprintWithComponents, type BlueprintComponent } from '@/hooks/useBlueprint'
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
	isSaving: boolean
}


// Component that uses useSearchParams - needs to be wrapped in Suspense
function InfrastructureBuilderWithParams() {
	const searchParams = useSearchParams()
	return <InfrastructureBuilder searchParams={searchParams} />
}

// Loading component for Suspense fallback
function InfrastructureBuilderLoading() {
	return (
		<div className='h-screen gradient-bg noise-overlay flex items-center justify-center'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4'></div>
				<p className='text-white'>Loading...</p>
			</div>
		</div>
	)
}

function InfrastructureBuilder({ searchParams }: { searchParams: URLSearchParams }) {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	
	// Fetch components from API
	const { components, isLoading, error } = useComponents()
	
	// Use blueprints hook for all blueprint operations
	const { createBlueprint, updateBlueprint, updateBlueprintComponents, generatePlan } = useBlueprints()
	
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
	
	// Decode blueprint data from URL parameters
	const getBlueprintDataFromUrl = useCallback((): BlueprintWithComponents | null => {
		const encodedData = searchParams.get('data')
		if (encodedData) {
			try {
				const decodedData = JSON.parse(atob(encodedData)) as BlueprintWithComponents
				console.log('Decoded Blueprint Data:', decodedData)
				return decodedData
			} catch (error) {
				console.error('Failed to decode blueprint data:', error)
				return null
			}
		}
		return null
	}, [searchParams])

	// Store decoded blueprint data
	const [blueprintData, setBlueprintData] = useState<BlueprintWithComponents | null>(() => {
		return getBlueprintDataFromUrl()
	})

	// Store component loading errors
	const [componentErrors, setComponentErrors] = useState<string[]>([])

	// Initialize expanded categories when components are loaded
	const [state, setState] = useState<InfrastructureBuilderState>(() => {
		const decodedBlueprintData = getBlueprintDataFromUrl()
		return {
			agentConnected: true,
			sidebarCollapsed: false,
			mobileMenuOpen: false,
			searchTerm: '',
			expandedCategories: {},
			draggedNodeType: null,
			isViewPlanOpen: false,
			generatedPlan: '',
			configName: decodedBlueprintData?.name || searchParams.get('name') || '',
			configDescription: decodedBlueprintData?.description || searchParams.get('description') || '',
			blueprintId: decodedBlueprintData?.id?.toString() || searchParams.get('blueprintId') || undefined,
			isSaving: false,
		}
	})

	// Track which components have been used on the canvas - derived from current nodes
	const usedComponentIds = useMemo(() => 
		new Set(nodes.map(n => n.data?.id).filter(Boolean) as number[]), 
		[nodes]
	)
	
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

	// Convert BlueprintComponent to React Flow Node
	const convertBlueprintComponentToNode = useCallback((blueprintComponent: BlueprintComponent, index: number): Node | null => {
		// Get the extended component with visual properties
		const extendedComponents = getNodeTypes(components)
		const componentDef = extendedComponents.find(comp => comp.id === blueprintComponent.componentId)
		
		if (!componentDef) {
			const errorMessage = `Component with ID ${blueprintComponent.componentId} not found`
			console.warn(errorMessage)
			setComponentErrors(prev => [...prev, errorMessage])
			return null
		}

		// Convert parameters array to object
		const parameters = blueprintComponent.parameters.reduce((acc, param) => {
			acc[param.name] = param.value
			return acc
		}, {} as Record<string, any>)

		return {
			id: `component-${blueprintComponent.id}`,
			type: 'customNode',
			position: { x: 100 + (index * 400), y: 100 }, // Increased distance between nodes
			data: {
				id: componentDef.id,
				label: componentDef.displayName,
				nodeType: componentDef.name,
				icon: componentDef.icon,
				color: componentDef.color,
				bgColor: componentDef.bgColor,
				borderColor: componentDef.borderColor,
				components: components,
				parameters: parameters
			},
		}
	}, [components])

	// Log blueprint components when available
	useEffect(() => {
		if (blueprintData?.components) {
			console.log('Blueprint Components from URL:', blueprintData.components)
		}
	}, [blueprintData])

	// Load blueprint components as nodes when both blueprint data and components are available
	useEffect(() => {
		if (blueprintData?.components && components.length > 0 && !isLoading) {
			console.log('Loading blueprint components as nodes...')
			
			// Clear previous errors
			setComponentErrors([])
			
			// Convert blueprint components to React Flow nodes
			const nodesFromBlueprint = blueprintData.components
				.map((blueprintComponent, index) => 
					convertBlueprintComponentToNode(blueprintComponent, index)
				)
				.filter((node): node is Node => node !== null) // Filter out null nodes
			
			// Create edges based on position (connect nodes in sequence)
			const edgesFromBlueprint: Edge[] = []
			for (let i = 0; i < nodesFromBlueprint.length - 1; i++) {
				edgesFromBlueprint.push({
					id: `edge-${nodesFromBlueprint[i].id}-${nodesFromBlueprint[i + 1].id}`,
					source: nodesFromBlueprint[i].id,
					target: nodesFromBlueprint[i + 1].id,
					type: 'smoothstep',
					style: {
						stroke: '#06b6d4',
						strokeWidth: 2,
					},
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: '#06b6d4',
					},
				})
			}
			
			// Set the nodes and edges
			setNodes(nodesFromBlueprint)
			setEdges(edgesFromBlueprint)
			
			console.log('Loaded nodes:', nodesFromBlueprint)
			console.log('Loaded edges:', edgesFromBlueprint)
		}
	}, [blueprintData, components, isLoading, convertBlueprintComponentToNode, setNodes, setEdges])

	const reactFlowWrapper = useRef<HTMLDivElement>(null)
	const { screenToFlowPosition } = useReactFlow()

	// Handle node configuration save
	const handleNodeConfigurationSave = useCallback((nodeId: string, parameters: Record<string, any>) => {
		setNodes(nds =>
			nds.map(node =>
				node.data.id === nodeId
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
			// Find the node to get its component ID
			const nodeToDelete = nodes.find(node => node.id === nodeId)
			const componentId = nodeToDelete?.data.id as number
			
			setNodes(nds => nds.filter(node => node.id !== nodeId))
			
			// Also remove all edges connected to this node
			setEdges(eds =>
				eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
			)
		},
		[setNodes, setEdges, nodes]
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
					id: nodeTypeData.id,
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
	const handleSaveConfiguration = useCallback(async () => {
		if (nodes.length === 0) {
			alert('Please add some components to your configuration before saving.')
			return
		}

		// Prevent multiple simultaneous saves
		if (state.isSaving) {
			return
		}

		setState(prev => ({ ...prev, isSaving: true }))

		try {
			const configName = state.configName || `Config-${Date.now()}`
			const configDescription = state.configDescription || state.configName || `Config-${Date.now()}`

			// Step 1: Create or update the blueprint
			let blueprintId: number
			if (state.blueprintId) {
				// Update existing blueprint
				await updateBlueprint(parseInt(state.blueprintId), {
					name: configName,
					description: configDescription
				})
				blueprintId = parseInt(state.blueprintId)
			} else {
				// Create new blueprint
				const newBlueprint = await createBlueprint(configName, configDescription, 'draft')
				blueprintId = newBlueprint.id
			}

			// Step 2: Build the components payload for the Update Blueprint Component API
			const componentsPayload = nodes.map((node, index) => {
				// Extract componentId from node data
				const componentId = parseInt(String(node.data.id))
				
				// Find the component to get its parameter definitions
				const component = components.find(comp => comp.id === componentId)
				if (!component) {
					console.warn(`Component with ID ${componentId} not found`)
					return {
						componentId: componentId,
						position: index + 1,
						parameters: []
					}
				}
				
				// Build parameters array from node parameters using actual parameter IDs
				const parameters: Array<{ id: string; value: string; name: string }> = []
				if (node.data.parameters) {
					Object.entries(node.data.parameters).forEach(([name, value]: [string, any]) => {
						// Find the parameter definition to get its actual ID
						const paramDefinition = component.parameters.find(param => param.name === name)
						if (paramDefinition) {
							parameters.push({
								id: paramDefinition.id, // Use the actual parameter ID from the component definition
								value: String(value ?? ''),
								name: name
							})
						} else {
							console.warn(`Parameter '${name}' not found in component ${component.name}`)
						}
					})
				}

				return {
					componentId: componentId,
					position: index + 1, // Position is 1-based index
					parameters: parameters
				}
			})

			// Step 3: Update blueprint components
			await updateBlueprintComponents(blueprintId, componentsPayload)

			// Update local state with the blueprint ID
			setState(prev => ({
				...prev,
				configName: configName,
				configDescription: configDescription,
				blueprintId: blueprintId.toString()
			}))

			alert(`Configuration "${configName}" saved successfully!`)
		} catch (error) {
			console.error('Failed to save configuration:', error)
			alert('Failed to save configuration. Please try again.')
		} finally {
			setState(prev => ({ ...prev, isSaving: false }))
		}
	}, [nodes, edges, state.configName, state.configDescription, state.blueprintId, createBlueprint, updateBlueprint, updateBlueprintComponents, components])

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
		setState(prev => ({
			...prev,
			generatedPlan: "Plan generated",
			isViewPlanOpen: true,
		}))
	}, [nodes, edges, state.configName])

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
				// Update state with the response data (server-side mutations preserved)
				setState(prev => ({ 
					...prev, 
					configName: response.name,
					configDescription: response.description,
					blueprintId: response.id?.toString() ?? prev.blueprintId
				}))
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
					blueprintId: response.id?.toString() ?? prev.blueprintId
				}))
			}
		} catch (error) {
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
				isSaving={state.isSaving}
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
								aria-label={
									state.blueprintId
										? 'Edit configuration metadata'
										: 'Create configuration metadata'
								}
								title={
									state.blueprintId
										? 'Edit configuration metadata'
										: 'Create configuration metadata'
								}
							>
								<Edit className='h-3 w-3' />
							</Button>
						}
					/>
				}
			/>

			{/* Component Errors */}
			{componentErrors.length > 0 && (
				<div className='glass-card border-red-500/20 bg-red-500/5 mx-4 mb-4'>
					<div className='flex items-start gap-3'>
						<div className='p-2 rounded-full bg-red-500/20'>
							<FileCode className='h-5 w-5 text-red-400' />
						</div>
						<div className='flex-1'>
							<h3 className='text-lg font-semibold text-red-400 mb-2'>
								Component Loading Errors
							</h3>
							<div className='space-y-1'>
								{componentErrors.map((error, index) => (
									<p key={index} className='text-red-300 text-sm'>
										• {error}
									</p>
								))}
							</div>
						</div>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setComponentErrors([])}
							className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
						>
							×
						</Button>
					</div>
				</div>
			)}

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
					usedComponentIds={usedComponentIds}
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
							usedComponentIds={usedComponentIds}
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
					description: state.configDescription || 'Draft',
					status: 'draft',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				}}
				plan={ state.generatedPlan || 'No plan available' }
				isOpen={state.isViewPlanOpen}
				onClose={handleClosePlanModal}
			/>
		</div>
	)
}

export default function CreateInfraPage() {
	return (
		<ReactFlowProvider>
			<Suspense fallback={<InfrastructureBuilderLoading />}>
				<InfrastructureBuilderWithParams />
			</Suspense>
		</ReactFlowProvider>
	)
}
