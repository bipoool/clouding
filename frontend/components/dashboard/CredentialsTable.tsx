'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	MoreVertical,
	Trash2,
	Edit,
	Search,
	Filter,
	Key,
	Shield,
	Lock,
	Code,
} from 'lucide-react'
import type { Credential, CredentialType } from '@/lib/utils/credential-types'
import { formatDistanceToNow } from 'date-fns'

// Configuration object mapping credential types to their badge properties
const CREDENTIAL_BADGE_CONFIG = {
	ssh_key: {
		icon: Key,
		label: 'SSH Key',
		badgeClasses: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
		iconClasses: 'h-4 w-4 text-blue-400',
		badgeIconClasses: 'h-3 w-3 mr-1',
	},
	password: {
		icon: Lock,
		label: 'Password',
		badgeClasses: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
		iconClasses: 'h-4 w-4 text-purple-400',
		badgeIconClasses: 'h-3 w-3 mr-1',
	},
	ssl_cert: {
		icon: Shield,
		label: 'SSL Cert',
		badgeClasses: 'bg-green-500/20 text-green-400 border-green-500/30',
		iconClasses: 'h-4 w-4 text-green-400',
		badgeIconClasses: 'h-3 w-3 mr-1',
	},
	api_key: {
		icon: Code,
		label: 'API Key',
		badgeClasses: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
		iconClasses: 'h-4 w-4 text-orange-400',
		badgeIconClasses: 'h-3 w-3 mr-1',
	},
} as const

interface CredentialsTableProps {
	credentials: Credential[]
	onDeleteCredential: (id: string) => void
	onEditCredential: (credential: Credential) => void
}

export function CredentialsTable({
	credentials,
	onDeleteCredential,
	onEditCredential,
}: CredentialsTableProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [typeFilter, setTypeFilter] = useState<CredentialType | 'all'>('all')

	const filteredCredentials = credentials.filter(credential => {
		const matchesSearch =
			credential.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			credential.type.includes(searchTerm.toLowerCase())
		const matchesType = typeFilter === 'all' || credential.type === typeFilter
		return matchesSearch && matchesType
	})

	const getTypeBadge = (type: CredentialType) => {
		const config = CREDENTIAL_BADGE_CONFIG[type]

		if (!config) {
			return <Badge variant='secondary'>{type}</Badge>
		}

		const {
			icon: IconComponent,
			label,
			badgeClasses,
			badgeIconClasses,
		} = config

		return (
			<Badge className={badgeClasses}>
				<IconComponent className={badgeIconClasses} />
				{label}
			</Badge>
		)
	}

	const getTypeIcon = (type: CredentialType) => {
		const config = CREDENTIAL_BADGE_CONFIG[type]

		if (!config) {
			return <Key className='h-4 w-4 text-gray-400' />
		}

		const { icon: IconComponent, iconClasses } = config
		return <IconComponent className={iconClasses} />
	}

	const formatDate = (dateString: string) => {
		return formatDistanceToNow(new Date(dateString), { addSuffix: true })
	}

	return (
		<div className='space-y-6'>
			{/* Header with Search and Filters */}
			<div className='flex flex-col md:flex-row gap-4 items-start md:items-center justify-between'>
				<div className='flex flex-1 gap-4 items-center'>
					<div className='relative flex-1 max-w-md'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search credentials by name or type...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='pl-10 glass-input'
						/>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' className='glass-btn'>
								<Filter className='h-4 w-4 mr-2' />
								{typeFilter === 'all'
									? 'All Types'
									: typeFilter.replace('_', ' ')}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
							<DropdownMenuItem onClick={() => setTypeFilter('all')}>
								All Types
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTypeFilter('ssh_key')}>
								SSH Keys
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTypeFilter('password')}>
								Passwords
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTypeFilter('ssl_cert')}>
								SSL Certificates
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTypeFilter('api_key')}>
								API Keys
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div className='text-sm text-secondary'>
					Showing {filteredCredentials.length} of {credentials.length}{' '}
					credentials
				</div>
			</div>

			{/* Credentials Table */}
			<div className='glass-card p-0 overflow-hidden'>
				<Table>
					<TableHeader>
						<TableRow className='border-b border-white/10 hover:bg-white/5'>
							<TableHead className='text-secondary font-medium'>
								Credential
							</TableHead>
							<TableHead className='text-secondary font-medium'>Type</TableHead>
							<TableHead className='text-secondary font-medium'>
								Details
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Description
							</TableHead>
							<TableHead className='text-secondary font-medium'>
								Created
							</TableHead>
							<TableHead className='w-12'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCredentials.map(credential => (
							<TableRow
								key={credential.id}
								className='border-b border-white/5 hover:bg-white/5 transition-colors'
							>
								<TableCell>
									<div className='flex items-center gap-3'>
										<div className='p-2 rounded-lg bg-white/5'>
											{getTypeIcon(credential.type)}
										</div>
										<div>
											<div className='font-medium text-primary'>
												{credential.name}
											</div>
											<div className='text-xs text-gray-500'>
												ID: {credential.id}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>{getTypeBadge(credential.type)}</TableCell>
								<TableCell>
									{credential.type === 'ssh_key' && credential.sshKey && (
										<div className='text-sm'>
											<div className='text-primary font-mono text-xs bg-black/30 px-2 py-1 rounded'>
												{credential.sshKey.substring(0, 40)}...
											</div>
											<div className='text-xs text-secondary mt-1'>
												SSH Private Key
											</div>
										</div>
									)}
									{credential.type === 'password' && (
										<div className='text-sm'>
											{credential.username && (
												<div className='text-primary'>
													User: {credential.username}
												</div>
											)}
											<div className='text-xs text-secondary'>
												Password: ••••••••
											</div>
										</div>
									)}
									{credential.type === 'ssl_cert' && (
										<div className='text-sm'>
											{credential.certificateFileName && (
												<div className='text-primary'>
													File: {credential.certificateFileName}
												</div>
											)}
											{credential.metadata?.expiresAt && (
												<div className='text-secondary'>
													Expires: {formatDate(credential.metadata.expiresAt)}
												</div>
											)}
										</div>
									)}
									{credential.type === 'api_key' && credential.apiKey && (
										<div className='text-sm'>
											<div className='text-primary font-mono text-xs bg-black/30 px-2 py-1 rounded'>
												{credential.apiKey.substring(0, 20)}...
											</div>
											{credential.metadata?.expiresAt && (
												<div className='text-xs text-secondary mt-1'>
													Expires: {formatDate(credential.metadata.expiresAt)}
												</div>
											)}
										</div>
									)}
								</TableCell>
								<TableCell>
									<div className='text-sm text-secondary max-w-xs truncate'>
										{credential.metadata?.description || '-'}
									</div>
								</TableCell>
								<TableCell>
									<div className='text-sm text-secondary'>
										{formatDate(credential.createdAt)}
									</div>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
												<MoreVertical className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align='end'
											className='bg-black/90 backdrop-blur-sm border border-white/10'
										>
											<DropdownMenuItem
												onClick={() => onEditCredential(credential)}
												className='cursor-pointer'
											>
												<Edit className='h-4 w-4 mr-2' />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onDeleteCredential(credential.id)}
												className='cursor-pointer text-red-400 focus:text-red-300'
											>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>

				{filteredCredentials.length === 0 && (
					<div className='p-8 text-center'>
						<Key className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<h3 className='text-lg font-medium text-primary mb-2'>
							No credentials found
						</h3>
						<p className='text-secondary'>
							{searchTerm || typeFilter !== 'all'
								? 'Try adjusting your search or filter criteria.'
								: 'Get started by creating your first credential.'}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
