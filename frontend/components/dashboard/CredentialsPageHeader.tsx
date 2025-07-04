import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddCredentialModal } from './AddCredentialModal'
import type {
	Credential,
	CreateCredentialData,
} from '@/lib/utils/credential-types'

interface CredentialsPageHeaderProps {
	onCreateCredential: (data: CreateCredentialData) => void
	onUpdateCredential: (
		id: string,
		updates: Partial<CreateCredentialData>
	) => void
	editingCredential: Credential | null
	onEditComplete: () => void
}

export function CredentialsPageHeader({
	onCreateCredential,
	onUpdateCredential,
	editingCredential,
	onEditComplete,
}: CredentialsPageHeaderProps) {
	const handleUpdateCredential = (
		id: string,
		updates: Partial<CreateCredentialData>
	) => {
		onUpdateCredential(id, updates)
		onEditComplete()
	}

	return (
		<>
			<Link href='/dashboard' className='interactive-element'>
				<Button variant='ghost' size='sm' className='glass-btn'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Dashboard
				</Button>
			</Link>

			<div className='glass-card'>
				<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
					<div className='flex items-center gap-4'>
						<div>
							<h1 className='text-3xl md:text-4xl font-bold text-primary mb-2 font-jetbrains'>
								Credentials
							</h1>
							<p className='text-lg text-gray-200'>
								Manage authentication credentials for your infrastructure
								components and virtual machines.
							</p>
						</div>
					</div>
					<AddCredentialModal
						onAddCredential={onCreateCredential}
						onUpdateCredential={handleUpdateCredential}
						editCredential={editingCredential}
					/>
				</div>
			</div>
		</>
	)
}
