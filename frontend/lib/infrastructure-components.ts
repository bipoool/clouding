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

export interface ComponentItem {
	id: string
	name: string
	icon: LucideIcon
	color: string
	bgColor: string
	borderColor: string
	description: string
}

export interface ComponentCategory {
	name: string
	icon: LucideIcon
	color: string
	components: ComponentItem[]
}

export const componentCategories: ComponentCategory[] = [
	{
		name: 'Web Servers & Proxies',
		icon: Globe,
		color: 'text-green-400',
		components: [
			{
				id: 'nginx',
				name: 'Install Nginx',
				icon: Globe,
				color: 'text-green-400',
				bgColor: 'bg-green-500/20',
				borderColor: 'border-green-500/30',
				description: 'Web server and reverse proxy',
			},
			{
				id: 'apache',
				name: 'Install Apache',
				icon: Server,
				color: 'text-red-400',
				bgColor: 'bg-red-500/20',
				borderColor: 'border-red-500/30',
				description: 'HTTP web server',
			},
		],
	},
	{
		name: 'Languages & Runtimes',
		icon: Code,
		color: 'text-orange-400',
		components: [
			{
				id: 'java',
				name: 'Install Java',
				icon: Code,
				color: 'text-orange-400',
				bgColor: 'bg-orange-500/20',
				borderColor: 'border-orange-500/30',
				description: 'Java runtime environment',
			},
			{
				id: 'golang',
				name: 'Install Go',
				icon: Cpu,
				color: 'text-cyan-400',
				bgColor: 'bg-cyan-500/20',
				borderColor: 'border-cyan-500/30',
				description: 'Go programming language',
			},
			{
				id: 'python',
				name: 'Install Python',
				icon: FileCode,
				color: 'text-yellow-400',
				bgColor: 'bg-yellow-500/20',
				borderColor: 'border-yellow-500/30',
				description: 'Python programming language',
			},
			{
				id: 'nodejs',
				name: 'Install Node.js',
				icon: Layers,
				color: 'text-green-400',
				bgColor: 'bg-green-500/20',
				borderColor: 'border-green-500/30',
				description: 'JavaScript runtime',
			},
			{
				id: 'php',
				name: 'Install PHP',
				icon: Code,
				color: 'text-indigo-400',
				bgColor: 'bg-indigo-500/20',
				borderColor: 'border-indigo-500/30',
				description: 'PHP scripting language',
			},
		],
	},
	{
		name: 'Databases & Storage',
		icon: Database,
		color: 'text-purple-400',
		components: [
			{
				id: 'postgresql',
				name: 'Install PostgreSQL',
				icon: Database,
				color: 'text-blue-400',
				bgColor: 'bg-blue-500/20',
				borderColor: 'border-blue-500/30',
				description: 'Relational database',
			},
			{
				id: 'mysql',
				name: 'Install MySQL',
				icon: HardDrive,
				color: 'text-orange-400',
				bgColor: 'bg-orange-500/20',
				borderColor: 'border-orange-500/30',
				description: 'MySQL database server',
			},
			{
				id: 'mongodb',
				name: 'Install MongoDB',
				icon: Database,
				color: 'text-green-400',
				bgColor: 'bg-green-500/20',
				borderColor: 'border-green-500/30',
				description: 'NoSQL document database',
			},
			{
				id: 'redis',
				name: 'Install Redis',
				icon: Database,
				color: 'text-red-400',
				bgColor: 'bg-red-500/20',
				borderColor: 'border-red-500/30',
				description: 'In-memory data store',
			},
			{
				id: 'kafka',
				name: 'Install Kafka',
				icon: Database,
				color: 'text-purple-400',
				bgColor: 'bg-purple-500/20',
				borderColor: 'border-purple-500/30',
				description: 'Distributed streaming platform',
			},
		],
	},
	{
		name: 'Containers & Orchestration',
		icon: Container,
		color: 'text-blue-400',
		components: [
			{
				id: 'docker',
				name: 'Install Docker',
				icon: Container,
				color: 'text-blue-400',
				bgColor: 'bg-blue-500/20',
				borderColor: 'border-blue-500/30',
				description: 'Container platform',
			},
			{
				id: 'kubernetes',
				name: 'Install Kubernetes',
				icon: Cloud,
				color: 'text-purple-400',
				bgColor: 'bg-purple-500/20',
				borderColor: 'border-purple-500/30',
				description: 'Container orchestration',
			},
		],
	},
	{
		name: 'Security & Network',
		icon: Shield,
		color: 'text-pink-400',
		components: [
			{
				id: 'ssl',
				name: 'Install SSL Certificate',
				icon: Lock,
				color: 'text-green-400',
				bgColor: 'bg-green-500/20',
				borderColor: 'border-green-500/30',
				description: 'SSL/TLS certificate',
			},
			{
				id: 'port',
				name: 'Open Port',
				icon: Shield,
				color: 'text-pink-400',
				bgColor: 'bg-pink-500/20',
				borderColor: 'border-pink-500/30',
				description: 'Configure network access',
			},
			{
				id: 'firewall',
				name: 'Configure Firewall',
				icon: Shield,
				color: 'text-red-400',
				bgColor: 'bg-red-500/20',
				borderColor: 'border-red-500/30',
				description: 'Network security rules',
			},
			{
				id: 'loadbalancer',
				name: 'Setup Load Balancer',
				icon: Network,
				color: 'text-cyan-400',
				bgColor: 'bg-cyan-500/20',
				borderColor: 'border-cyan-500/30',
				description: 'Distribute network traffic',
			},
		],
	},
	{
		name: 'System & Monitoring',
		icon: Activity,
		color: 'text-cyan-400',
		components: [
			{
				id: 'script',
				name: 'Run Script',
				icon: Play,
				color: 'text-blue-400',
				bgColor: 'bg-blue-500/20',
				borderColor: 'border-blue-500/30',
				description: 'Execute custom scripts',
			},
			{
				id: 'monitor',
				name: 'Monitor',
				icon: Activity,
				color: 'text-cyan-400',
				bgColor: 'bg-cyan-500/20',
				borderColor: 'border-cyan-500/30',
				description: 'System monitoring',
			},
		],
	},
]

// Flatten for compatibility with existing drag and MiniMap code
export const nodeTypes = componentCategories.flatMap(category => category.components) 