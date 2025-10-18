'use client'

import type React from 'react'
import { memo, useMemo, useState, useEffect } from 'react'
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
	onConfigurationSave: (nodeId: string, parameters: Record<string, any>) => void
}

// Components
const FormField: React.FC<{
	config: ExtendedComponentParameter
	value?: any
	onChange?: (fieldId: string, value: any) => void
	isRequired?: boolean
	error?: string
}> = memo(({ config, value, onChange, isRequired = false, error }) => {
	const renderField = () => {
		switch (config.uiType) {
			case 'textarea':
				return (
					<textarea
						id={config.name}
						value={value ?? ''}
						rows={config.rows || 3}
						placeholder={config.placeholder || config.default || ''}
						className='w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-500 text-sm resize-none focus:outline-none focus:bg-white/15 focus:border-cyan-400/50 focus:ring-cyan-400/20'
						onChange={(e) => onChange?.(config.name, e.target.value)}
					/>
				)

			case 'select':
				return (
					<Select
						value={value ?? config.default ?? ''}
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
							checked={Boolean(value)}
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
						value={value ?? ''}
						placeholder={config.placeholder || config.default || ''}
						className='glass-input'
						onChange={(e) => onChange?.(config.name, e.target.value)}
					/>
				)

			case 'number':
				return (
					<Input
						id={config.name}
						type='number'
						value={value ?? ''}
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
						value={value ?? ''}
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
			{error && (
				<p className='text-xs text-red-400'>{error}</p>
			)}
			{config.description && config.uiType !== 'checkbox' && !error && (
				<p className='text-xs text-gray-500'>{config.description}</p>
			)}
		</div>
	)
})

FormField.displayName = 'FormField'



export const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> =
	memo(({ nodeData, components, children, onConfigurationSave }) => {
		const IconComponent = nodeData.icon
		const [isSubmitting, setIsSubmitting] = useState(false)
		const [formValues, setFormValues] = useState<Record<string, any>>(nodeData.parameters || {})
		const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

		// Reset form values when nodeData changes (when dialog opens with different node)
		useEffect(() => {
			setFormValues(nodeData.parameters || {})
			setValidationErrors({})
		}, [nodeData.id, nodeData.parameters])

		const formFields = useMemo(() => {
			const { nodeType } = nodeData
			return getFormFieldsByNodeType(nodeType, components)
		}, [nodeData.nodeType, components])

		// Update form values when formFields change (when components are loaded)
		useEffect(() => {
			if (formFields.length > 0) {
				setFormValues(currentValues => {
					const updatedValues = { ...currentValues }
					let hasChanges = false

					// Add default values for fields that don't have values yet
					// But only if they don't already have a value (saved or user-set)
					formFields.forEach((field) => {
						if (updatedValues[field.name] === undefined && field.default !== undefined) {
							updatedValues[field.name] = field.default
							hasChanges = true
						}
					})

					// Also persist the updated values immediately if there are changes
					if (hasChanges && onConfigurationSave) {
						// Use setTimeout to avoid calling onConfigurationSave during render
						setTimeout(() => {
							onConfigurationSave(nodeData.id, updatedValues)
						}, 0)
					}

					return updatedValues
				})
			}
		}, [formFields, nodeData.id, onConfigurationSave])

		// Helper function to check if a value is empty (but allow 0 and false as valid values)
		const isEmptyValue = (value: any): boolean => {
			return value === undefined || value === null || value === ''
		}

		// Check if a field should be shown based on required_if rules
		const shouldShowField = (field: ExtendedComponentParameter): boolean => {
			if (!field.rules?.required_if) {
				return true
			}

			const requiredIf = field.rules.required_if
			// ALL conditions must be met (AND logic)
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

		// Handle field value changes with persistence and validation
		const handleFieldChange = (fieldId: string, value: any) => {
			// Use functional state updates to ensure we work with the latest state
			setFormValues(prev => {
				const nextValues = { ...prev, [fieldId]: value }

				// Persist changes immediately by calling the save callback with the computed nextValues
				if (onConfigurationSave) {
					onConfigurationSave(nodeData.id, nextValues)
				}

				return nextValues
			})

			// Clear validation error for this field when user starts typing
			setValidationErrors(prev => {
				const next = { ...prev }
				delete next[fieldId]
				return next
			})
		}

		// Validate form values against component parameters
		const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
			const errors: Record<string, string> = {}

			formFields.forEach((field) => {
				const fieldValue = formValues[field.name]

				// Check if field is directly required
				if (field.rules?.required && isEmptyValue(fieldValue)) {
					errors[field.name] = `${field.name} is required`
					return
				}

				// Check conditional requirements (required_if)
				if (field.rules?.required_if && shouldShowField(field)) {
					// Since shouldShowField already checks that ALL conditions are met (AND logic),
					// we know the field is conditionally required
					if (isEmptyValue(fieldValue)) {
						const requiredIf = field.rules.required_if
						const dependentFields = Object.keys(requiredIf).join(' and ')
						errors[field.name] = `${field.name} is required based on ${dependentFields}`
					}
				}
			})

			return {
				isValid: Object.keys(errors).length === 0,
				errors
			}
		}

		const handleSaveConfiguration = async () => {
			// Validate form before saving
			const validation = validateForm()

			if (!validation.isValid) {
				// Update validation errors state for visual feedback
				setValidationErrors(validation.errors)

				// Show validation errors
				const errorMessages = Object.values(validation.errors).join('\n')
				return
			}

			// Clear any existing validation errors
			setValidationErrors({})

			setIsSubmitting(true)
			try {
				// Ensure all form fields (including defaults) are included in the saved parameters
				const completeFormValues = { ...formValues }

				// Add any missing default values
				formFields.forEach((field) => {
					if (completeFormValues[field.name] === undefined && field.default !== undefined) {
						completeFormValues[field.name] = field.default
					}
				})

				// Save configuration parameters
				logger.log('Saving configuration for node:', nodeData.label, 'with parameters:', completeFormValues)

				// Call the callback to update the node with parameters
				if (onConfigurationSave) {
					onConfigurationSave(nodeData.id, completeFormValues)
				}

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
											value={formValues[field.name]}
											onChange={handleFieldChange}
											isRequired={isFieldRequired(field)}
											error={validationErrors[field.name]}
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
