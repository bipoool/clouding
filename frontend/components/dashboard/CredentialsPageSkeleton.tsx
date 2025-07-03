import { Skeleton } from '@/components/ui/skeleton'

interface CredentialsPageSkeletonProps {
	statsCount?: number
	tableRowsCount?: number
}

export function CredentialsPageSkeleton({
	statsCount = 4,
	tableRowsCount = 5,
}: CredentialsPageSkeletonProps) {
	return (
		<div className='space-y-8'>
			{/* Header skeleton */}
			<div className='glass-card p-6'>
				<Skeleton className='h-8 w-48 mb-4' />
				<div className='flex gap-4'>
					<Skeleton className='h-10 w-32' />
					<Skeleton className='h-10 w-32' />
				</div>
			</div>

			{/* Stats skeleton */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{Array.from({ length: statsCount }, (_, i) => (
					<div key={i} className='glass-card p-6'>
						<Skeleton className='h-12 w-12 rounded-lg mb-4' />
						<Skeleton className='h-8 w-24 mb-2' />
						<Skeleton className='h-4 w-16' />
					</div>
				))}
			</div>

			{/* Table skeleton */}
			<div className='glass-card p-6'>
				<Skeleton className='h-8 w-48 mb-6' />
				<div className='space-y-4'>
					{Array.from({ length: tableRowsCount }, (_, i) => (
						<div key={i} className='flex items-center gap-4'>
							<Skeleton className='h-12 w-12 rounded-lg' />
							<Skeleton className='h-6 w-48' />
							<Skeleton className='h-6 w-24' />
							<Skeleton className='h-6 w-32 ml-auto' />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
