import type React from 'react'

// Shared Types
export interface CustomNodeData extends Record<string, unknown> {
	label: string
	nodeType: string
	icon: React.ComponentType<{ className?: string }>
	color: string
	bgColor: string
	borderColor: string
}

// Node type categories
export const NODE_CATEGORIES = {
	PROGRAMMING_LANGUAGES: ['java', 'python', 'nodejs', 'golang', 'php'],
	DATABASES: ['postgresql', 'mysql', 'mongodb', 'redis'],
	WEB_SERVERS: ['nginx', 'apache'],
	CONTAINERS: ['docker', 'kubernetes'],
	INFRASTRUCTURE: ['firewall', 'loadbalancer', 'ssl'],
	UTILITIES: ['port', 'script'],
} as const

// Node type checking utilities
export const isNodeType = {
	programmingLanguage: (nodeType: string): boolean =>
		NODE_CATEGORIES.PROGRAMMING_LANGUAGES.includes(nodeType as any),
	database: (nodeType: string): boolean =>
		NODE_CATEGORIES.DATABASES.includes(nodeType as any),
	webServer: (nodeType: string): boolean =>
		NODE_CATEGORIES.WEB_SERVERS.includes(nodeType as any),
	container: (nodeType: string): boolean =>
		NODE_CATEGORIES.CONTAINERS.includes(nodeType as any),
	infrastructure: (nodeType: string): boolean =>
		NODE_CATEGORIES.INFRASTRUCTURE.includes(nodeType as any),
	utility: (nodeType: string): boolean =>
		NODE_CATEGORIES.UTILITIES.includes(nodeType as any),
}

// Version placeholders for programming languages
export const VERSION_PLACEHOLDERS: Record<string, string> = {
	java: '17',
	python: '3.11',
	nodejs: '18.17.0',
	golang: '1.21',
	php: '8.2',
}

// Common CSS classes
export const FORM_FIELD_CLASSES = {
	base: 'glass border-white/20 text-white placeholder:text-gray-500',
	focus: {
		cyan: 'focus:border-cyan-400/50 focus:ring-cyan-400/20',
		pink: 'focus:border-pink-400/50 focus:ring-pink-400/20',
		blue: 'focus:border-blue-400/50 focus:ring-blue-400/20',
		green: 'focus:border-green-400/50 focus:ring-green-400/20',
		red: 'focus:border-red-400/50 focus:ring-red-400/20',
	},
	textarea: 'w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-500 text-sm resize-none focus:outline-none focus:bg-white/15',
} as const 