'use client'

import type React from 'react'
import { memo, useMemo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { NodeConfigurationDialog } from './node-configuration-dialog'
import { type CustomNodeData } from '@/lib/node-types'

interface CustomNodeProps extends NodeProps {
	data: CustomNodeData
	onConfigurationSave: (nodeId: string, parameters: Record<string, any>) => void
}

// Constants
const HANDLE_STYLES = {
	input: {
		background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
		boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)',
	},
	output: {
		background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
		boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)',
	},
} as const

const NODE_BASE_CLASSES = `
	relative px-5 py-3 rounded-lg backdrop-blur-xl min-w-[160px] group border-2
	transition-all duration-300 hover:scale-105 cursor-pointer
`.trim()

// Components
const NodeIcon: React.FC<{
	IconComponent: React.ComponentType<{ className?: string }>
	color: string
}> = memo(({ IconComponent, color }) => (
	<div className='p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
		<IconComponent
			className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform duration-300`}
		/>
	</div>
))

NodeIcon.displayName = 'NodeIcon'

const NodeContent: React.FC<{
	label: string
	nodeType: string
}> = memo(({ label, nodeType }) => (
	<div className='flex-1 min-w-0'>
		<div className='font-bold text-white text-sm mb-1 truncate'>{label}</div>
		<div className='text-xs text-gray-300 capitalize font-medium'>
			{nodeType}
		</div>
	</div>
))

NodeContent.displayName = 'NodeContent'

const ConfigurationButton: React.FC<{
	nodeData: CustomNodeData
	onConfigurationSave: (nodeId: string, parameters: Record<string, any>) => void
}> = memo(({ nodeData, onConfigurationSave }) => (
	<NodeConfigurationDialog 
		nodeData={nodeData}
		components={nodeData.components || []}
		onConfigurationSave={onConfigurationSave}
	>
		<Button
			variant='ghost'
			size='sm'
			className='!h-7 !w-7 !p-0 text-gray-300 hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-md border border-white/10 transition-all duration-200'
		>
			<Settings className='h-3 w-3' />
		</Button>
	</NodeConfigurationDialog>
))

ConfigurationButton.displayName = 'ConfigurationButton'

const NodeHandle: React.FC<{
	type: 'source' | 'target'
	position: Position
	style: React.CSSProperties
}> = memo(({ type, position, style }) => (
	<Handle
		type={type}
		position={position}
		className='!w-3 !h-3 !border-2 !border-white/30 hover:!scale-125 transition-transform duration-200'
		style={style}
	/>
))

NodeHandle.displayName = 'NodeHandle'

// Main Component
export const CustomNode = memo(({ data, selected, onConfigurationSave }: CustomNodeProps) => {
	const IconComponent = data.icon

	const nodeClassName = useMemo(() => {
		const baseClasses = NODE_BASE_CLASSES
		const bgClass = data.bgColor || 'bg-gray-500/20'
		const borderClass = data.borderColor || 'border-gray-500/30'
		const selectedClass = selected
			? 'ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-transparent'
			: ''

		return `${baseClasses} ${bgClass} ${borderClass} ${selectedClass}`
	}, [data.bgColor, data.borderColor, selected])

	const glowStyle = useMemo(
		() => ({
			background:
				'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.1))',
			filter: 'blur(8px)',
			transform: 'scale(1.1)',
		}),
		[]
	)

	return (
		<div className={nodeClassName}>
			{/* Input Handle */}
			<NodeHandle
				type='target'
				position={Position.Left}
				style={HANDLE_STYLES.input}
			/>

			{/* Node Content */}
			<div className='flex items-center gap-3'>
				<NodeIcon IconComponent={IconComponent} color={data.color} />
				<NodeContent label={data.label} nodeType={data.nodeType} />
				<ConfigurationButton nodeData={data} onConfigurationSave={onConfigurationSave} />
			</div>

			{/* Output Handle */}
			<NodeHandle
				type='source'
				position={Position.Right}
				style={HANDLE_STYLES.output}
			/>

			{/* Glow effect on hover */}
			<div
				className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'
				style={glowStyle}
			/>
		</div>
	)
})

CustomNode.displayName = 'CustomNode'
