import { Skeleton } from '@/components/ui/skeleton'

interface VmsPageSkeletonProps {
	statsCount?: number
	tableRowsCount?: number
}

export function VmsPageSkeleton({
	statsCount = 4,
	tableRowsCount = 6,
}: VmsPageSkeletonProps) {
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
					<Skeleton className='h-10 w-32' />
				</div>
			</div>

			{/* Stats Overview skeleton */}
			<div className='glass-card'>
				<Skeleton className='h-8 w-32 mb-6' />
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{Array.from({ length: statsCount }, (_, i) => (
						<div
							key={i}
							className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10'
						>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<Skeleton className='h-4 w-16 mb-1' />
									<Skeleton className='h-8 w-12 mb-2' />
								</div>
								<Skeleton className='h-12 w-12 rounded-xl' />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* VM Table skeleton */}
			<div className='glass-card'>
				<div className='p-6'>
					<Skeleton className='h-8 w-48 mb-6' />

					{/* Table header */}
					<div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 bg-white/5 rounded-lg'>
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-20' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-16' />
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-4 w-16' />
					</div>

					{/* Table rows */}
					<div className='space-y-3'>
						{Array.from({ length: tableRowsCount }, (_, i) => (
							<div
								key={i}
								className='grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-white/5 rounded-lg border border-white/10'
							>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-10 w-10 rounded-lg' />
									<div>
										<Skeleton className='h-4 w-24 mb-1' />
										<Skeleton className='h-3 w-32' />
									</div>
								</div>
								<Skeleton className='h-6 w-20 rounded-full' />
								<Skeleton className='h-4 w-12' />
								<Skeleton className='h-4 w-16' />
								<Skeleton className='h-4 w-28' />
								<div className='flex gap-2'>
									<Skeleton className='h-8 w-8 rounded' />
									<Skeleton className='h-8 w-8 rounded' />
									<Skeleton className='h-8 w-8 rounded' />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
