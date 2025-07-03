import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Credential } from '@/hooks/useCredentials'

interface SecurityAlertProps {
	expiringCredentials: Credential[]
}

export function SecurityAlert({ expiringCredentials }: SecurityAlertProps) {
	if (expiringCredentials.length === 0) return null

	return (
		<div className='glass-card border-l-4 border-l-yellow-500'>
			<div className='flex items-start gap-3'>
				<AlertTriangle className='h-5 w-5 text-yellow-400 mt-0.5' />
				<div className='flex-1'>
					<h3 className='text-lg font-semibold text-yellow-400 mb-2'>
						Credentials Expiring Soon
					</h3>
					<p className='text-secondary mb-3'>
						{expiringCredentials.length} credential(s) will expire within 30
						days.
					</p>
					<div className='flex flex-wrap gap-2'>
						{expiringCredentials.map(cred => (
							<Badge
								key={cred.id}
								className='bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
							>
								{cred.name}
							</Badge>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
