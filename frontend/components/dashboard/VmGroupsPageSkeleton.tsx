import { Skeleton } from '@/components/ui/skeleton'

interface VmGroupsPageSkeletonProps {
	statsCount?: number
	groupCardsCount?: number
}

export function VmGroupsPageSkeleton({
	statsCount = 4,
	groupCardsCount = 3,
}: VmGroupsPageSkeletonProps) {
	return (
		<div className='space-y-8'>
			{/* Back button skeleton */}
			<Skeleton className='h-10 w-32' />

			{/* Header skeleton */}
			<div className='glass-card'>
				<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
					<div className='flex items-center gap-4'>
						<div>
							<Skeleton className='h-10 w-48 mb-2' />
							<Skeleton className='h-6 w-80' />
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

			{/* Groups Section Header skeleton */}
			<div className='space-y-6'>
				<div className='flex items-center justify-between'>
					<div>
						<Skeleton className='h-8 w-32 mb-2' />
						<Skeleton className='h-5 w-64' />
					</div>
				</div>

				{/* Groups Grid skeleton */}
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{Array.from({ length: groupCardsCount }, (_, i) => (
						<div key={i} className='glass-card p-6'>
							{/* Card header */}
							<div className='flex items-start justify-between mb-4'>
								<div className='flex items-center gap-3'>
									<Skeleton className='h-10 w-10 rounded-lg' />
									<div>
										<Skeleton className='h-6 w-32 mb-1' />
										<Skeleton className='h-4 w-24' />
									</div>
								</div>
								<Skeleton className='h-8 w-8 rounded' />
							</div>

							{/* Card stats */}
							<div className='grid grid-cols-2 gap-4 mb-4'>
								<div className='bg-white/5 rounded-lg p-3'>
									<Skeleton className='h-4 w-12 mb-1' />
									<Skeleton className='h-6 w-8' />
								</div>
								<div className='bg-white/5 rounded-lg p-3'>
									<Skeleton className='h-4 w-16 mb-1' />
									<Skeleton className='h-6 w-12' />
								</div>
							</div>

							{/* Card description */}
							<Skeleton className='h-4 w-full mb-4' />

							{/* Card actions */}
							<div className='flex gap-2'>
								<Skeleton className='h-8 w-20' />
								<Skeleton className='h-8 w-24' />
								<Skeleton className='h-8 w-16' />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Ungrouped VMs Warning skeleton */}
			<div className='glass-card border-yellow-500/20 bg-yellow-500/5'>
				<div className='flex items-start gap-4'>
					<Skeleton className='h-9 w-9 rounded-lg' />
					<div className='flex-1'>
						<Skeleton className='h-6 w-48 mb-2' />
						<Skeleton className='h-4 w-full mb-2' />
						<Skeleton className='h-4 w-3/4 mb-4' />
						<div className='flex gap-3'>
							<Skeleton className='h-8 w-32' />
							<Skeleton className='h-8 w-28' />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
