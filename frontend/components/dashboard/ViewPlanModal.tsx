'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Download, FileCode, CheckCircle } from 'lucide-react'
import type { InfraConfig } from '@/hooks/useInfraConfigs'

interface ViewPlanModalProps {
	config: InfraConfig | null
	plan: string
	isOpen: boolean
	onClose: () => void
}

export function ViewPlanModal({
	config,
	plan,
	isOpen,
	onClose,
}: ViewPlanModalProps) {
	const [copied, setCopied] = useState(false)
	const [activeTab, setActiveTab] = useState('ansible')

	if (!config) return null

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(plan)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy to clipboard:', error)
		}
	}

	const handleDownload = () => {
		const element = document.createElement('a')
		const file = new Blob([plan], { type: 'text/plain' })
		element.href = URL.createObjectURL(file)
		element.download = `${config.name.toLowerCase().replace(/\s+/g, '-')}-${activeTab}.yml`
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}

	// Split the plan into Ansible and Terraform sections
	const sections = plan.split('# Terraform equivalent:')
	const ansiblePlan = sections[0]?.trim() || ''
	const terraformPlan = sections[1]?.trim() || ''

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='bg-black/95 backdrop-blur-md border border-white/10 max-w-4xl max-h-[90vh] overflow-hidden'>
				<DialogHeader className='pb-4'>
					<DialogTitle className='text-primary flex items-center gap-2'>
						<FileCode className='h-5 w-5 text-cyan-400' />
						Infrastructure Plan: {config.name}
					</DialogTitle>
					<DialogDescription className='text-secondary'>
						Generated deployment configuration for your infrastructure
					</DialogDescription>

					<div className='flex items-center gap-2 pt-2'>
						<Badge variant='outline' className='bg-white/5 border-white/20'>
							{config.type.replace('-', ' ')}
						</Badge>
						<Badge
							className={
								config.deploymentStatus === 'deployed'
									? 'bg-green-500/20 text-green-400 border-green-500/30'
									: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
							}
						>
							{config.deploymentStatus}
						</Badge>
					</div>
				</DialogHeader>

				<div className='flex-1 overflow-hidden'>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className='h-full flex flex-col'
					>
						<div className='flex items-center justify-between mb-4'>
							<TabsList className='bg-white/5 border border-white/10'>
								<TabsTrigger
									value='ansible'
									className='data-[state=active]:bg-white/10'
								>
									Ansible
								</TabsTrigger>
								<TabsTrigger
									value='terraform'
									className='data-[state=active]:bg-white/10'
								>
									Terraform
								</TabsTrigger>
							</TabsList>

							<div className='flex gap-2'>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleCopy}
									className='glass-btn'
								>
									{copied ? (
										<>
											<CheckCircle className='h-4 w-4 mr-2 text-green-400' />
											Copied!
										</>
									) : (
										<>
											<Copy className='h-4 w-4 mr-2' />
											Copy
										</>
									)}
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={handleDownload}
									className='glass-btn'
								>
									<Download className='h-4 w-4 mr-2' />
									Download
								</Button>
							</div>
						</div>

						<div className='flex-1 overflow-hidden'>
							<TabsContent value='ansible' className='h-full mt-0'>
								<div className='h-full bg-gray-900/50 rounded-lg border border-white/10 overflow-hidden'>
									<div className='h-full overflow-auto p-4'>
										<pre className='text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap'>
											<code>
												{ansiblePlan || 'No Ansible configuration available'}
											</code>
										</pre>
									</div>
								</div>
							</TabsContent>

							<TabsContent value='terraform' className='h-full mt-0'>
								<div className='h-full bg-gray-900/50 rounded-lg border border-white/10 overflow-hidden'>
									<div className='h-full overflow-auto p-4'>
										<pre className='text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap'>
											<code>
												{terraformPlan ||
													'No Terraform configuration available'}
											</code>
										</pre>
									</div>
								</div>
							</TabsContent>
						</div>
					</Tabs>
				</div>

				<div className='flex items-center justify-between pt-4 border-t border-white/10'>
					<div className='text-xs text-secondary'>
						{config.nodes.length} components • {config.edges.length} connections
					</div>

					<div className='flex gap-3'>
						<Button variant='ghost' onClick={onClose} className='glass-btn'>
							Close
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
