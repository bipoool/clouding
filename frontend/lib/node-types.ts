import type React from 'react'
import type { Component } from '@/hooks/useComponents'

// Shared Types
export interface CustomNodeData extends Record<string, unknown> {
	id: string
	label: string
	nodeType: string
	icon: React.ComponentType<{ className?: string }>
	color: string
	bgColor: string
	borderColor: string
	components?: Component[]
	parameters?: Record<string, any>
}
