import {
	Code,
	Layers,
	Zap,
	Cloud,
	Database,
	Settings,
	Shield,
	Users,
	Globe,
	Activity,
	DollarSign,
	GitBranch,
} from 'lucide-react'

export interface FeatureCard {
	id: string
	icon: any
	title: string
	description: string
	iconColor: string
}

export interface HeroCard {
	id: string
	icon: any
	title: string
	description: string
	iconColor: string
	backgroundGradient: string
}

export const heroCards: HeroCard[] = [
	{
		id: 'infrastructure',
		icon: Cloud,
		title: 'Infrastructure',
		description:
			'Visualize your cloud infrastructure with our intuitive drag-and-drop interface. See connections and dependencies in real-time.',
		iconColor: 'text-accent-cyan',
		backgroundGradient: 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700',
	},
	{
		id: 'configuration',
		icon: Settings,
		title: 'Configuration',
		description:
			'Configure your services with smart defaults and best practices. No more YAML hell or complex configuration files.',
		iconColor: 'text-accent-purple',
		backgroundGradient: 'bg-gradient-to-br from-purple-900 to-gray-800 border-purple-700',
	},
	{
		id: 'deployment',
		icon: Database,
		title: 'Deployment',
		description:
			'Deploy your infrastructure changes instantly with our intelligent deployment engine. Track progress and rollback when needed.',
		iconColor: 'text-accent-orange',
		backgroundGradient: 'bg-gradient-to-br from-orange-900 to-gray-800 border-orange-700',
	},
	{
		id: 'devops',
		icon: Code,
		title: 'DevOps Ready',
		description:
			'Built for modern DevOps workflows. Integrate with your CI/CD pipelines and version control systems seamlessly.',
		iconColor: 'text-green-400',
		backgroundGradient: 'bg-gradient-to-br from-green-900 to-gray-800 border-green-700',
	},
]

export const featureCards: FeatureCard[] = [
	{
		id: 'developer-first',
		icon: Code,
		title: 'Developer First Experience',
		description:
			'Built by developers, for developers. Monospace fonts, dark themes, and clean interfaces that feel like home. Every interaction is designed to enhance your workflow.',
		iconColor: 'text-accent-cyan',
	},
	{
		id: 'visual-config',
		icon: Layers,
		title: 'Visual Configuration',
		description: 'Drag and drop your infrastructure components. No more YAML hell.',
		iconColor: 'text-accent-purple',
	},
	{
		id: 'instant-deploy',
		icon: Zap,
		title: 'Instant Deploy',
		description: 'Deploy infrastructure changes instantly with automated rollbacks.',
		iconColor: 'text-accent-orange',
	},
	{
		id: 'monitoring',
		icon: Activity,
		title: 'Real-time Monitoring & Analytics',
		description:
			'Monitor your infrastructure health with real-time metrics, intelligent alerts, and comprehensive logging across all your services and deployments.',
		iconColor: 'text-green-400',
	},
	{
		id: 'version-control',
		icon: GitBranch,
		title: 'Infrastructure Version Control',
		description:
			'Track all infrastructure changes with git-like version control, branching, and merge capabilities for safe deployments.',
		iconColor: 'text-purple-400',
	},
	{
		id: 'team-collaboration',
		icon: Users,
		title: 'Team Collaboration',
		description: 'Shared workspaces and role-based access control.',
		iconColor: 'text-pink-400',
	},
	{
		id: 'multi-cloud',
		icon: Globe,
		title: 'Multi-Cloud Support',
		description: 'Deploy across AWS, Azure, GCP with unified management.',
		iconColor: 'text-indigo-400',
	},
]

export const ANIMATION_CONFIG = {
	cardSwap: {
		desktop: {
			width: 500,
			height: 400,
			cardDistance: 40,
			verticalDistance: 40,
			delay: 4000,
			pauseOnHover: true,
			skewAmount: 3,
			easing: 'elastic' as const,
		},
		mobile: {
			width: 300,
			height: 250,
			cardDistance: 20,
			verticalDistance: 20,
			delay: 4000,
			pauseOnHover: true,
			skewAmount: 2,
			easing: 'elastic' as const,
		},
		tablet: {
			width: 400,
			height: 320,
			cardDistance: 30,
			verticalDistance: 30,
			delay: 4000,
			pauseOnHover: true,
			skewAmount: 2.5,
			easing: 'elastic' as const,
		},
	},
	squares: {
		speed: 0.1,
		squareSize: 30,
		direction: 'diagonal' as const,
		borderColor: '#222222',
		hoverFillColor: '#111111',
	},
} as const 