import { memo } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorAlertProps {
	error: string
	onDismiss?: () => void
	className?: string
}

export const ErrorAlert = memo(function ErrorAlert({
	error,
	onDismiss,
	className = '',
}: ErrorAlertProps) {
	return (
		<Alert
			variant='destructive'
			className={`border-red-500/20 bg-red-500/10 ${className}`}
		>
			<AlertCircle className='h-4 w-4' />
			<AlertDescription className='flex items-center justify-between'>
				<span>{error}</span>
				{onDismiss && (
					<Button
						variant='ghost'
						size='sm'
						onClick={onDismiss}
						className='h-auto p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20'
						aria-label='Dismiss error'
					>
						<X className='h-4 w-4' />
					</Button>
				)}
			</AlertDescription>
		</Alert>
	)
})
