'use client'

import type React from 'react'
import { memo, useMemo, useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	type CustomNodeData,
} from '@/lib/node-types'
import { logger } from '@/lib/utils/logger'
import { getFormFieldsByNodeType, type ExtendedComponentParameter } from '@/lib/infrastructure-components'
import type { Component } from '@/hooks/useComponents'

interface NodeConfigurationDialogProps {
	nodeData: CustomNodeData
	components: Component[]
	children: React.ReactNode
}

// Components
const FormField: React.FC<{
	config: ExtendedComponentParameter
	onChange?: (fieldId: string, value: any) => void
	isRequired?: boolean
}> = memo(({ config, onChange, isRequired = false }) => {
	const renderField = () => {
		switch (config.uiType) {
			case 'textarea':
				return (
					<textarea
						id={config.name}
						rows={config.rows || 3}
						placeholder={config.placeholder || config.default || ''}
						className='w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-500 text-sm resize-none focus:outline-none focus:bg-white/15 focus:border-cyan-400/50 focus:ring-cyan-400/20'
						onChange={(e) => onChange?.(config.name, e.target.value)}
					/>
				)
			
			case 'select':
				return (
					<Select 
						defaultValue={config.default}
						onValueChange={(value) => onChange?.(config.name, value)}
					>
						<SelectTrigger className='glass-input'>
							<SelectValue placeholder={config.placeholder || 'Select an option'} />
						</SelectTrigger>
						<SelectContent className='bg-black/90 backdrop-blur-sm border border-white/10'>
							{config.options?.map((option) => (
								<SelectItem key={option} value={option}>
									{option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)
			
			case 'checkbox':
				return (
					<div className='flex items-center space-x-2'>
						<Checkbox 
							id={config.name} 
							onCheckedChange={(checked) => onChange?.(config.name, checked)}
						/>
						<label htmlFor={config.name} className='text-sm text-secondary'>
							{config.description || config.name}
						</label>
					</div>
				)
			
			case 'password':
				return (
					<Input
						id={config.name}
						type='password'
						placeholder={config.placeholder || config.default || ''}
						className='glass-input'
						onChange={(e) => onChange?.(config.name, e.target.value)}
					/>
				)
			
			default: // text, file, etc.
				return (
					<Input
						id={config.name}
						type={config.uiType === 'text' ? 'text' : 'text'}
						placeholder={config.placeholder || config.default || ''}
						className='glass-input'
						onChange={(e) => onChange?.(config.name, e.target.value)}
					/>
				)
		}
	}

	return (
		<div className='space-y-2'>
			{config.uiType !== 'checkbox' && (
				<label htmlFor={config.name} className='text-sm font-medium text-secondary'>
					{config.name}
					{isRequired && <span className='text-red-400 ml-1'>*</span>}
				</label>
			)}
			{renderField()}
			{config.description && config.uiType !== 'checkbox' && (
				<p className='text-xs text-gray-500'>{config.description}</p>
			)}
		</div>
	)
})

FormField.displayName = 'FormField'



export const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> =
	memo(({ nodeData, components, children }) => {
		const IconComponent = nodeData.icon
		const [isSubmitting, setIsSubmitting] = useState(false)
		const [formValues, setFormValues] = useState<Record<string, any>>({})

		const formFields = useMemo(() => {
			const { nodeType } = nodeData
			return getFormFieldsByNodeType(nodeType, components)
		}, [nodeData.nodeType, components])

		// Check if a field should be shown based on required_if rules
		const shouldShowField = (field: ExtendedComponentParameter): boolean => {
			if (!field.rules?.required_if) {
				return true
			}

			const requiredIf = field.rules.required_if
			for (const [dependentField, requiredValue] of Object.entries(requiredIf)) {
				const currentValue = formValues[dependentField]
				if (currentValue !== requiredValue) {
					return false
				}
			}
			return true
		}

		// Check if a field is required (either directly required or conditionally required)
		const isFieldRequired = (field: ExtendedComponentParameter): boolean => {
			// Directly required
			if (field.rules?.required) {
				return true
			}

			// Conditionally required - check if the field should be shown AND has required_if
			if (field.rules?.required_if && shouldShowField(field)) {
				return true
			}

			return false
		}

		// Handle field value changes
		const handleFieldChange = (fieldId: string, value: any) => {
			setFormValues(prev => ({
				...prev,
				[fieldId]: value
			}))
		}

		const handleSaveConfiguration = async () => {
			setIsSubmitting(true)
			try {
				// TODO: Implement configuration save logic
				logger.log('Saving configuration for node:', nodeData.label)
				// Simulate API call
				await new Promise(resolve => setTimeout(resolve, 1000))
			} catch (error) {
				logger.error('Failed to save configuration:', error)
			} finally {
				setIsSubmitting(false)
			}
		}

		return (
			<Dialog>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-lg max-h-[90vh] flex flex-col'>
					<DialogHeader className='flex-shrink-0'>
						<DialogTitle className='text-primary flex items-center gap-2'>
							<div className='p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
								<IconComponent className={`h-5 w-5 ${nodeData.color}`} />
							</div>
							Configure {nodeData.label}
						</DialogTitle>
						<DialogDescription className='text-secondary'>
							Configure the parameters and settings for this infrastructure component.
						</DialogDescription>
					</DialogHeader>

					<div className='flex-1 overflow-y-auto px-2'>
						<form className='space-y-4'>

							{formFields &&
								formFields
									.filter(shouldShowField)
									.map((field: ExtendedComponentParameter) => (
										<FormField
											key={field.name}
											config={field}
											onChange={handleFieldChange}
											isRequired={isFieldRequired(field)}
										/>
									))}
						</form>
					</div>

					<div className='flex gap-3 pt-4 flex-shrink-0'>
						<Button
							type='button'
							variant='ghost'
							className='flex-1 glass-btn'
						>
							Cancel
						</Button>
						<Button
							type='button'
							onClick={handleSaveConfiguration}
							disabled={isSubmitting}
							className='flex-1 gradient-border-btn'
						>
							{isSubmitting ? 'Saving...' : 'Save Configuration'}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		)
	})

NodeConfigurationDialog.displayName = 'NodeConfigurationDialog'
