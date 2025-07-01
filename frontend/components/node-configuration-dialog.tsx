'use client'

import type React from 'react'
import { memo, useMemo } from 'react'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogPortal,
	DialogOverlay,
	DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
	type CustomNodeData,
	isNodeType,
	VERSION_PLACEHOLDERS,
	FORM_FIELD_CLASSES,
} from '@/lib/node-types'
import { logger } from '@/lib/utils/logger'

interface NodeConfigurationDialogProps {
	nodeData: CustomNodeData
	children: React.ReactNode
}

interface FormFieldConfig {
	id: string
	label: string
	type: 'input' | 'password' | 'email' | 'textarea'
	placeholder?: string
	rows?: number
	className?: string
}

// Constants
const NODE_TYPE_CONFIGS: Record<string, FormFieldConfig[]> = {
	port: [
		{
			id: 'port-number',
			label: 'Port Number',
			type: 'input',
			placeholder: '8080',
			className: FORM_FIELD_CLASSES.focus.pink,
		},
	],
	script: [
		{
			id: 'script-content',
			label: 'Script Content',
			type: 'textarea',
			placeholder: "#!/bin/bash\necho 'Hello World'",
			rows: 4,
			className: `${FORM_FIELD_CLASSES.focus.blue} font-mono`,
		},
	],
	nginx: [
		{
			id: 'webserver-config',
			label: 'Configuration',
			type: 'textarea',
			placeholder: 'server_name example.com;\nlisten 80;',
			rows: 3,
			className: `${FORM_FIELD_CLASSES.focus.green} font-mono`,
		},
	],
	apache: [
		{
			id: 'webserver-config',
			label: 'Configuration',
			type: 'textarea',
			placeholder: 'ServerName example.com\nListen 80',
			rows: 3,
			className: `${FORM_FIELD_CLASSES.focus.green} font-mono`,
		},
	],
	ssl: [
		{
			id: 'domain',
			label: 'Domain Name',
			type: 'input',
			placeholder: 'example.com',
		},
		{
			id: 'email',
			label: 'Contact Email',
			type: 'email',
			placeholder: 'admin@example.com',
		},
	],
	docker: [
		{
			id: 'container-config',
			label: 'Configuration',
			type: 'textarea',
			placeholder: 'version: "3.8"\nservices:\n  app:\n    image: nginx',
			rows: 4,
			className: `${FORM_FIELD_CLASSES.focus.blue} font-mono`,
		},
	],
	kubernetes: [
		{
			id: 'container-config',
			label: 'Configuration',
			type: 'textarea',
			placeholder: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: my-pod',
			rows: 4,
			className: `${FORM_FIELD_CLASSES.focus.blue} font-mono`,
		},
	],
	firewall: [
		{
			id: 'firewall-rules',
			label: 'Firewall Rules',
			type: 'textarea',
			placeholder: 'allow 22/tcp\nallow 80/tcp\nallow 443/tcp',
			rows: 3,
			className: `${FORM_FIELD_CLASSES.focus.red} font-mono`,
		},
	],
	loadbalancer: [
		{
			id: 'backend-servers',
			label: 'Backend Servers',
			type: 'input',
			placeholder: '192.168.1.10,192.168.1.11',
		},
		{
			id: 'algorithm',
			label: 'Load Balancing Algorithm',
			type: 'input',
			placeholder: 'round-robin',
		},
	],
}

// Components
const FormField: React.FC<{
	config: FormFieldConfig
	isTextarea?: boolean
}> = memo(({ config, isTextarea = false }) => {
	const baseClassName =
		'glass border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:ring-cyan-400/20'
	const combinedClassName = `${baseClassName} ${config.className || ''}`

	return (
		<div className='space-y-3'>
			<Label htmlFor={config.id} className='text-gray-300 font-semibold'>
				{config.label}
			</Label>
			{isTextarea ? (
				<textarea
					id={config.id}
					rows={config.rows || 3}
					placeholder={config.placeholder}
					className={`w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-500 text-sm resize-none focus:outline-none focus:bg-white/15 ${config.className || ''}`}
				/>
			) : (
				<Input
					id={config.id}
					type={config.type === 'input' ? 'text' : config.type}
					placeholder={config.placeholder}
					className={combinedClassName}
				/>
			)}
		</div>
	)
})

FormField.displayName = 'FormField'

const DatabaseFields: React.FC = memo(() => (
	<div className='space-y-3'>
		<div className='grid grid-cols-2 gap-3'>
			<FormField
				config={{
					id: 'db-username',
					label: 'Username',
					type: 'input',
					placeholder: 'admin',
				}}
			/>
			<FormField
				config={{
					id: 'db-password',
					label: 'Password',
					type: 'password',
					placeholder: '••••••••',
				}}
			/>
		</div>
		<FormField
			config={{
				id: 'db-name',
				label: 'Database Name',
				type: 'input',
				placeholder: 'myapp_db',
			}}
		/>
	</div>
))

DatabaseFields.displayName = 'DatabaseFields'

const ConfigurationForm: React.FC<{
	nodeData: CustomNodeData
}> = memo(({ nodeData }) => {
	const formFields = useMemo(() => {
		const { nodeType } = nodeData

		// Handle programming languages
		if (isNodeType.programmingLanguage(nodeType)) {
			return [
				{
					id: 'version',
					label: 'Version',
					type: 'input' as const,
					placeholder: VERSION_PLACEHOLDERS[nodeType] || 'latest',
				},
			]
		}

		// Handle databases
		if (isNodeType.database(nodeType)) {
			return null // Special case handled by DatabaseFields component
		}

		// Handle other node types
		return NODE_TYPE_CONFIGS[nodeType] || []
	}, [nodeData.nodeType])

	const handleSaveConfiguration = () => {
		// TODO: Implement configuration save logic
		logger.log('Saving configuration for node:', nodeData.label)
	}

	return (
		<div className='space-y-6 pt-4'>
			{/* Common name field for all nodes */}
			<FormField
				config={{
					id: 'node-name',
					label: 'Name',
					type: 'input',
					placeholder: nodeData.label,
				}}
			/>

			{/* Database-specific fields */}
			{isNodeType.database(nodeData.nodeType) && <DatabaseFields />}

			{/* Other node type-specific fields */}
			{formFields &&
				formFields.map(field => (
					<FormField
						key={field.id}
						config={field}
						isTextarea={field.type === 'textarea'}
					/>
				))}

			<Button
				onClick={handleSaveConfiguration}
				className='w-full btn-gradient text-white font-semibold py-3 rounded-lg'
			>
				Save Configuration
			</Button>
		</div>
	)
})

ConfigurationForm.displayName = 'ConfigurationForm'

export const NodeConfigurationDialog: React.FC<NodeConfigurationDialogProps> =
	memo(({ nodeData, children }) => {
		const IconComponent = nodeData.icon

		return (
			<Dialog modal={true}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogPortal>
					<DialogOverlay className='fixed inset-0 z-[9998] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0' />
					<DialogContent className='fixed left-[50%] top-[50%] z-[9999] translate-x-[-50%] translate-y-[-50%] bg-black/90 backdrop-blur-xl border-white/20 max-w-md rounded-lg shadow-2xl p-6'>
						<DialogClose className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'>
							<X className='h-4 w-4 text-white' />
							<span className='sr-only'>Close</span>
						</DialogClose>
						<DialogHeader>
							<DialogTitle className='text-white flex items-center gap-3 text-xl'>
								<div className='p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'>
									<IconComponent className={`h-5 w-5 ${nodeData.color}`} />
								</div>
								Configure {nodeData.label}
							</DialogTitle>
						</DialogHeader>
						<ConfigurationForm nodeData={nodeData} />
					</DialogContent>
				</DialogPortal>
			</Dialog>
		)
	})

NodeConfigurationDialog.displayName = 'NodeConfigurationDialog'
