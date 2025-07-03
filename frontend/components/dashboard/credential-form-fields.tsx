import { Upload } from 'lucide-react'
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
				<FormLabel className='text-secondary'>SSH Private Key</FormLabel>
				<FormControl>
					<Textarea
						placeholder='-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----'
						className='glass-input resize-none font-mono text-sm'
						rows={8}
						{...field}
					/>
				</FormControl>
				<FormDescription className='text-xs text-gray-500'>
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
					<FormLabel className='text-secondary'>Username</FormLabel>
					<FormControl>
						<Input placeholder='username' className='glass-input' {...field} />
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
					<FormLabel className='text-secondary'>Password</FormLabel>
					<FormControl>
						<Input
							type='password'
							placeholder='••••••••'
							className='glass-input'
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
}) => (
	<FormField
		control={form.control}
		name='certificateFile'
		render={({ field }) => (
			<FormItem>
				<FormLabel className='text-secondary'>Certificate File</FormLabel>
				<FormControl>
					<div className='space-y-2'>
						<div className='flex items-center gap-2'>
							<Button
								type='button'
								variant='outline'
								className='glass-btn'
								onClick={() => document.getElementById('cert-upload')?.click()}
							>
								<Upload className='h-4 w-4 mr-2' />
								Upload Certificate
							</Button>
							{form.watch('certificateFileName') && (
								<span className='text-sm text-secondary'>
									{form.watch('certificateFileName')}
								</span>
							)}
						</div>
						<input
							id='cert-upload'
							type='file'
							accept='.crt,.cer,.pem'
							className='hidden'
							onChange={onFileUpload}
						/>
					</div>
				</FormControl>
				<FormDescription className='text-xs text-gray-500'>
					Upload your SSL certificate file (.crt, .cer, .pem)
				</FormDescription>
				<FormMessage />
			</FormItem>
		)}
	/>
)

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
				<FormLabel className='text-secondary'>API Key</FormLabel>
				<FormControl>
					<Textarea
						placeholder='sk-1234567890abcdef...'
						className='glass-input resize-none font-mono text-sm'
						rows={3}
						{...field}
					/>
				</FormControl>
				<FormDescription className='text-xs text-gray-500'>
					Enter your API key or token
				</FormDescription>
				<FormMessage />
			</FormItem>
		)}
	/>
)
