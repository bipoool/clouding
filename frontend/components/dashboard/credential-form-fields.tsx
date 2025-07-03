import { Upload } from 'lucide-react'
import { useRef, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { CredentialFormData } from '@/lib/utils/credential-validation'
import type { CredentialType } from '@/lib/utils/credential-types'

interface CredentialFormFieldsProps {
	form: UseFormReturn<CredentialFormData>
	type: CredentialType
	onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// Common styling constants
const GLASS_INPUT_CLASSES = 'glass-input'
const GLASS_BUTTON_CLASSES = 'glass-btn'
const LABEL_CLASSES = 'text-secondary'
const DESCRIPTION_CLASSES = 'text-xs text-gray-500'

// Credential type specific field components
const SSHKeyFields = ({
	form,
}: {
	form: UseFormReturn<CredentialFormData>
}) => (
	<FormField
		control={form.control}
		name='sshKey'
		render={({ field }) => (
			<FormItem>
				<FormLabel className={LABEL_CLASSES}>SSH Private Key</FormLabel>
				<FormControl>
					<Textarea
						placeholder='-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----'
						className={`${GLASS_INPUT_CLASSES} resize-none font-mono text-sm`}
						rows={8}
						{...field}
					/>
				</FormControl>
				<FormDescription className={DESCRIPTION_CLASSES}>
					Paste your SSH private key here
				</FormDescription>
				<FormMessage />
			</FormItem>
		)}
	/>
)

const PasswordFields = ({
	form,
}: {
	form: UseFormReturn<CredentialFormData>
}) => (
	<div className='space-y-4'>
		<FormField
			control={form.control}
			name='username'
			render={({ field }) => (
				<FormItem>
					<FormLabel className={LABEL_CLASSES}>Username</FormLabel>
					<FormControl>
						<Input
							placeholder='username'
							className={GLASS_INPUT_CLASSES}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
		<FormField
			control={form.control}
			name='password'
			render={({ field }) => (
				<FormItem>
					<FormLabel className={LABEL_CLASSES}>Password</FormLabel>
					<FormControl>
						<Input
							type='password'
							placeholder='••••••••'
							className={GLASS_INPUT_CLASSES}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	</div>
)

const SSLCertificateFields = ({
	form,
	onFileUpload,
}: {
	form: UseFormReturn<CredentialFormData>
	onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleButtonClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	return (
		<FormField
			control={form.control}
			name='certificateFile'
			render={({ field }) => (
				<FormItem>
					<FormLabel className={LABEL_CLASSES}>Certificate File</FormLabel>
					<FormControl>
						<div className='space-y-2'>
							<div className='flex items-center gap-2'>
								<Button
									type='button'
									variant='outline'
									className={GLASS_BUTTON_CLASSES}
									onClick={handleButtonClick}
								>
									<Upload className='h-4 w-4 mr-2' />
									Upload Certificate
								</Button>
								{form.watch('certificateFileName') && (
									<span className='text-sm text-secondary truncate max-w-xs'>
										{form.watch('certificateFileName')}
									</span>
								)}
							</div>
							<input
								ref={fileInputRef}
								type='file'
								accept='.crt,.cer,.pem'
								className='hidden'
								onChange={onFileUpload}
								aria-label='Upload certificate file'
							/>
						</div>
					</FormControl>
					<FormDescription className={DESCRIPTION_CLASSES}>
						Upload your SSL certificate file (.crt, .cer, .pem)
					</FormDescription>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}

const APIKeyFields = ({
	form,
}: {
	form: UseFormReturn<CredentialFormData>
}) => (
	<FormField
		control={form.control}
		name='apiKey'
		render={({ field }) => (
			<FormItem>
				<FormLabel className={LABEL_CLASSES}>API Key</FormLabel>
				<FormControl>
					<Textarea
						placeholder='sk-1234567890abcdef...'
						className={`${GLASS_INPUT_CLASSES} resize-none font-mono text-sm`}
						rows={3}
						{...field}
					/>
				</FormControl>
				<FormDescription className={DESCRIPTION_CLASSES}>
					Enter your API key or token
				</FormDescription>
				<FormMessage />
			</FormItem>
		)}
	/>
)

// Main component
export const CredentialFormFields = ({
	form,
	type,
	onFileUpload,
}: CredentialFormFieldsProps) => {
	switch (type) {
		case 'ssh_key':
			return <SSHKeyFields form={form} />
		case 'password':
			return <PasswordFields form={form} />
		case 'ssl_cert':
			return <SSLCertificateFields form={form} onFileUpload={onFileUpload} />
		case 'api_key':
			return <APIKeyFields form={form} />
		default:
			return null
	}
}
