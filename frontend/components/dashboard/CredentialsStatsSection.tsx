import { StatsCard } from './StatsCard'
import { CREDENTIAL_STATS_CONFIG } from '@/lib/constants/credentials'
import type { CredentialStats } from '@/hooks/useCredentialsStats'

interface CredentialsStatsSectionProps {
	stats: CredentialStats
}

export function CredentialsStatsSection({
	stats,
}: CredentialsStatsSectionProps) {
	return (
		<div className='glass-card'>
			<h3 className='text-2xl font-bold text-primary mb-6'>
				Credentials Overview
			</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{CREDENTIAL_STATS_CONFIG.map(config => (
					<StatsCard
						key={config.key}
						title={config.title}
						value={stats[config.key]}
						icon={config.icon}
						gradientFrom={config.gradientFrom}
						gradientTo={config.gradientTo}
						iconColor={config.iconColor}
						valueColor={config.valueColor}
					/>
				))}
			</div>
		</div>
	)
}
