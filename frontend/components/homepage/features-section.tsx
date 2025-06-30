import { featureCards } from '@/lib/homepage-data'

export function FeaturesSection() {
	// Get specific feature by ID for precise layout control
	const getFeatureById = (id: string) => featureCards.find(f => f.id === id)!

	return (
		<section className='relative'>
			<div className='max-w-7xl mx-auto px-6 py-20'>
				{/* Features Header */}
				<header className='text-center mb-16'>
					<h2 className='text-4xl md:text-5xl font-bold mb-6 gradient-text font-jetbrains'>
						Everything You Need
					</h2>
					<p className='text-xl text-gray-200 mb-4 font-semibold max-w-3xl mx-auto'>
						Designed for modern development teams.
					</p>
					<p className='text-lg text-secondary max-w-4xl mx-auto leading-relaxed font-medium'>
						From visualization to deployment, monitoring to security - our
						platform provides all the tools you need to manage your
						infrastructure efficiently and securely.
					</p>
				</header>

				{/* Bento Grid Layout */}
				<div className='grid grid-cols-1 md:grid-cols-6 lg:grid-cols-8 gap-3 auto-rows-[200px]'>
					{/* Large Feature Card - Developer First */}
					{(() => {
						const feature = getFeatureById('developer-first')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-3 lg:col-span-4 md:row-span-2 gradient-border-card group p-8 flex flex-col justify-center'>
								<IconComponent className='h-16 w-16 text-accent-cyan mb-6 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-2xl font-bold mb-4 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium text-lg leading-relaxed'>
									{feature.description}
								</p>
							</div>
						)
					})()}

					{/* Visual Configuration */}
					{(() => {
						const feature = getFeatureById('visual-config')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
								<IconComponent className='h-12 w-12 text-accent-purple mb-4 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-xl font-bold mb-3 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium'>
									{feature.description}
								</p>
							</div>
						)
					})()}

					{/* Instant Deploy */}
					{(() => {
						const feature = getFeatureById('instant-deploy')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
								<IconComponent className='h-12 w-12 text-accent-orange mb-4 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-xl font-bold mb-3 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium'>
									{feature.description}
								</p>
							</div>
						)
					})()}

					{/* Wide Feature Card - Monitoring */}
					{(() => {
						const feature = getFeatureById('monitoring')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-6 lg:col-span-4 gradient-border-card group p-6 flex items-center'>
								<IconComponent className='h-14 w-14 text-green-400 mr-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0' />
								<div>
									<h3 className='text-xl font-bold mb-2 text-primary'>
										{feature.title}
									</h3>
									<p className='text-secondary font-medium'>
										{feature.description}
									</p>
								</div>
							</div>
						)
					})()}

					{/* Version Control */}
					{(() => {
						const feature = getFeatureById('version-control')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-3 lg:col-span-4 gradient-border-card group p-6 flex flex-col justify-center'>
								<IconComponent className='h-12 w-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-xl font-bold mb-3 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium'>
									{feature.description}
								</p>
							</div>
						)
					})()}

					{/* Small Feature Card - Team Collaboration */}
					{(() => {
						const feature = getFeatureById('team-collaboration')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-2 gradient-border-card group p-4 flex flex-col justify-center text-center'>
								<IconComponent className='h-10 w-10 text-pink-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-lg font-bold mb-2 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium text-sm'>
									{feature.description}
								</p>
							</div>
						)
					})()}

					{/* Multi-Cloud Support */}
					{(() => {
						const feature = getFeatureById('multi-cloud')
						const IconComponent = feature.icon
						return (
							<div className='md:col-span-3 lg:col-span-2 gradient-border-card group p-6 flex flex-col justify-center'>
								<IconComponent className='h-12 w-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300' />
								<h3 className='text-xl font-bold mb-3 text-primary'>
									{feature.title}
								</h3>
								<p className='text-secondary font-medium'>
									{feature.description}
								</p>
							</div>
						)
					})()}
				</div>
			</div>
		</section>
	)
}
