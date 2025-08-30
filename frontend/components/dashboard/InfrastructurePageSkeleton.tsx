import { Skeleton } from '@/components/ui/skeleton'

interface InfrastructurePageSkeletonProps {
	statsCount?: number
	blueprintCardsCount?: number
}

export function InfrastructurePageSkeleton({
	statsCount = 4,
	blueprintCardsCount = 6,
}: InfrastructurePageSkeletonProps) {
	return (
		<div className='space-y-8'>
			{/* Back button skeleton */}
			<Skeleton className='h-10 w-32' />

			{/* Header skeleton */}
			<div className='glass-card'>
				<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
					<div className='flex items-center gap-4'>
						<div>
							<Skeleton className='h-10 w-64 mb-2' />
							<Skeleton className='h-6 w-96' />
						</div>
					</div>
					<Skeleton className='h-10 w-36' />
				</div>
			</div>

			{/* Stats Overview skeleton */}
			<div className='glass-card'>
				<Skeleton className='h-8 w-40 mb-6' />
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{Array.from({ length: statsCount }, (_, i) => (
						<div
							key={i}
							className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10'
						>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<Skeleton className='h-4 w-20 mb-1' />
									<Skeleton className='h-8 w-12 mb-2' />
								</div>
								<Skeleton className='h-12 w-12 rounded-xl' />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Blueprints Section skeleton */}
			<div className='glass-card'>
				{/* Tabs skeleton */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex gap-2'>
						<Skeleton className='h-10 w-32 rounded-lg' />
						<Skeleton className='h-10 w-28 rounded-lg' />
						<Skeleton className='h-10 w-24 rounded-lg' />
						<Skeleton className='h-10 w-28 rounded-lg' />
					</div>
				</div>

				{/* Blueprint cards grid skeleton */}
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{Array.from({ length: blueprintCardsCount }, (_, i) => (
						<div key={i} className='bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10'>
							{/* Card header */}
							<div className='flex items-start justify-between mb-4'>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-12 w-12 rounded-lg' />
									<div className='flex-1 min-w-0'>
										<Skeleton className='h-6 w-32 mb-1' />
										<Skeleton className='h-4 w-48' />
									</div>
								</div>
							</div>

							<div className='space-y-3'>
								{/* Status skeleton */}
								<Skeleton className='h-6 w-20 rounded-full' />

								{/* Last Updated skeleton */}
								<div className='flex items-center gap-2'>
									<Skeleton className='h-3 w-3' />
									<Skeleton className='h-3 w-24' />
								</div>

								{/* Actions skeleton */}
								<div className='flex items-center gap-2 pt-3 border-t border-white/10'>
									<Skeleton className='h-8 flex-1 rounded' />
									<Skeleton className='h-8 w-8 rounded' />
									<Skeleton className='h-8 w-8 rounded' />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
