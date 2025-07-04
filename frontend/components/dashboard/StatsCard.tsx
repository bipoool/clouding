import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
	title: string
	value: number
	icon: LucideIcon
	gradientFrom: string
	gradientTo: string
	iconColor: string
	valueColor: string
}

export function StatsCard({
	title,
	value,
	icon: Icon,
	gradientFrom,
	gradientTo,
	iconColor,
	valueColor,
}: StatsCardProps) {
	return (
		<div className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'>
			<div className='flex items-center justify-between'>
				<div className='flex-1'>
					<p className='text-sm font-medium text-secondary mb-1'>{title}</p>
					<p className={`text-3xl font-bold mb-2 ${valueColor}`}>{value}</p>
				</div>
				<div
					className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} backdrop-blur-sm`}
				>
					<Icon
						className={`h-6 w-6 ${iconColor} group-hover:scale-110 transition-transform duration-300`}
					/>
				</div>
			</div>
		</div>
	)
}
