import {
	Key,
	Shield,
	CheckCircle,
} from 'lucide-react'

export const CREDENTIAL_STATS_CONFIG = [
	{
		key: 'total' as const,
		title: 'Total Credentials',
		icon: Key,
		gradientFrom: 'from-cyan-500/20',
		gradientTo: 'to-blue-500/10',
		iconColor: 'text-cyan-400',
		valueColor: 'text-primary',
	},
	{
		key: 'ssh' as const,
		title: 'SSH Credentials',
		icon: Key,
		gradientFrom: 'from-blue-500/20',
		gradientTo: 'to-cyan-500/10',
		iconColor: 'text-blue-400',
		valueColor: 'text-blue-400',
	},
	{
		key: 'ssl' as const,
		title: 'SSL Certificates',
		icon: Shield,
		gradientFrom: 'from-green-500/20',
		gradientTo: 'to-emerald-500/10',
		iconColor: 'text-green-400',
		valueColor: 'text-green-400',
	},
	{
		key: 'api' as const,
		title: 'API Keys',
		icon: CheckCircle,
		gradientFrom: 'from-orange-500/20',
		gradientTo: 'to-yellow-500/10',
		iconColor: 'text-orange-400',
		valueColor: 'text-orange-400',
	},
] as const

export const EXPIRY_WARNING_DAYS = 30 