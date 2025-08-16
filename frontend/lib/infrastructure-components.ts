import {
	Database,
	Globe,
	Shield,
	Play,
	Activity,
	Code,
	Server,
	Container,
	Lock,
	Layers,
	Cloud,
	Cpu,
	HardDrive,
	Network,
	FileCode,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { type ComponentParameter, type Component, useComponents } from '@/hooks/useComponents'
// Common CSS classes
const FORM_FIELD_CLASSES = {
	base: 'glass border-white/20 text-white placeholder:text-gray-500',
	focus: {
		cyan: 'focus:border-cyan-400/50 focus:ring-cyan-400/20',
		pink: 'focus:border-pink-400/50 focus:ring-pink-400/20',
		blue: 'focus:border-blue-400/50 focus:ring-blue-400/20',
		green: 'focus:border-green-400/50 focus:ring-green-400/20',
		red: 'focus:border-red-400/50 focus:ring-red-400/20',
	},
	textarea: 'w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-500 text-sm resize-none focus:outline-none focus:bg-white/15',
} 

// Available icons for random assignment
const ICONS: LucideIcon[] = [
	Database, Globe, Shield, Play, Activity, Code, Server, Container, 
	Lock, Layers, Cloud, Cpu, HardDrive, Network, FileCode
]

// Available color schemes for random assignment
const COLOR_SCHEMES = [
	{ color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
	{ color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
	{ color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
	{ color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
	{ color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
	{ color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30' },
	{ color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
	{ color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/30' },
	{ color: 'text-pink-400', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
]



// Extended ComponentParameter interface with UI-specific fields
export interface ExtendedComponentParameter extends ComponentParameter {
	rows?: number
	placeholder?: string
	className?: string
}

// Extended Component interface with visual properties
export interface ExtendedComponent extends Component {
	icon: LucideIcon
	color: string
	bgColor: string
	borderColor: string
	formFields?: ExtendedComponentParameter[]
}

// Helper function to get random visual properties for a component
export const getComponentVisualProps = (componentId: string | number) => {
	// Use component ID to generate consistent but seemingly random properties
	const idStr = String(componentId)
	const iconIndex = idStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % ICONS.length
	const colorIndex = idStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLOR_SCHEMES.length
	
	return {
		icon: ICONS[iconIndex],
		...COLOR_SCHEMES[colorIndex]
	}
}

// Helper function to get random visual properties for a category
export const getCategoryVisualProps = (categoryName: string) => {
	// Use category name to generate consistent but seemingly random properties
	const nameStr = String(categoryName)
	const iconIndex = nameStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % ICONS.length
	const colorIndex = nameStr.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLOR_SCHEMES.length
	
	return {
		icon: ICONS[iconIndex],
		...COLOR_SCHEMES[colorIndex]
	}
}

// Helper function to map ComponentParameter to ExtendedComponentParameter
export const mapParameterToExtended = (parameter: ComponentParameter): ExtendedComponentParameter => {
	return {
		...parameter,
		rows: 3, // default as requested
		placeholder: '', // empty for now as requested
		className: `${FORM_FIELD_CLASSES.base} ${FORM_FIELD_CLASSES.focus.cyan}`, // using FORM_FIELD_CLASSES
	}
}

// Helper function to map Component to ExtendedComponent
export const mapComponentToExtended = (component: Component): ExtendedComponent => {
	const visualProps = getComponentVisualProps(component.id)
	
	return {
		...component,
		icon: visualProps.icon,
		color: visualProps.color,
		bgColor: visualProps.bgColor,
		borderColor: visualProps.borderColor,
		formFields: component.parameters.map(mapParameterToExtended),
	}
}

export interface ComponentCategory {
	name: string
	icon: LucideIcon
	color: string
	components: Component[]
}

export interface ExtendedComponentCategory {
	name: string
	icon: LucideIcon
	color: string
	components: ExtendedComponent[]
}

// Function to build initialComponentCategories from array of Components
export const buildInitialComponentCategories = (components: Component[]): ComponentCategory[] => {
	// Group components by label
	const groupedComponents: Record<string, Component[]> = {}
	
	components.forEach(component => {
		const categoryName = component.label || 'Other'
		if (!groupedComponents[categoryName]) {
			groupedComponents[categoryName] = []
		}
		groupedComponents[categoryName].push(component)
	})
	
	// Convert to ComponentCategory format
	return Object.entries(groupedComponents).map(([categoryName, categoryComponents]) => {
		const visualProps = getCategoryVisualProps(categoryName)
		return {
			name: categoryName,
			icon: visualProps.icon,
			color: visualProps.color,
			components: categoryComponents
		}
	})
}

// Function to build the final componentCategories with all visual properties
export const buildComponentCategories = (components: Component[]): ExtendedComponentCategory[] => {
	const initialCategories = buildInitialComponentCategories(components)
	return initialCategories.map(category => ({
		...category,
		components: category.components.map(component => mapComponentToExtended(component))
	}))
}

// Helper function to get node types from components
export const getNodeTypes = (components: Component[]) => {
	const categories = buildComponentCategories(components)
	return categories.flatMap(category => category.components)
}

// Helper function to get form fields by node type
export const getFormFieldsByNodeType = (nodeType: string, components: Component[]): ExtendedComponentParameter[] => {
	const nodeTypes = getNodeTypes(components)
	const component = nodeTypes.find((comp: ExtendedComponent) => comp.name === nodeType)
	return component?.formFields || []
}