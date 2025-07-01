import { useState, useCallback } from 'react'
import type { Node, Edge } from '@xyflow/react'
import { logger } from '@/lib/utils/logger'

export interface InfraConfig {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  type: 'web-service' | 'database' | 'monitoring' | 'load-balancer' | 'custom'
  assignedVMs: string[]
  assignedGroups: string[]
  createdAt: string
  updatedAt: string
  deploymentStatus: 'draft' | 'deployed' | 'failed'
}

const mockConfigs: InfraConfig[] = [
  {
    id: 'config-1',
    name: 'Web Application Stack',
    description: 'Full web application with load balancer, web servers, and database',
    nodes: [
      {
        id: 'lb-1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Load Balancer',
          nodeType: 'load-balancer',
          icon: 'Network',
          color: 'text-blue-400',
          bgColor: 'from-blue-500/20 to-cyan-500/10',
          borderColor: 'border-blue-500/30'
        }
      },
      {
        id: 'web-1',
        type: 'customNode',
        position: { x: 300, y: 200 },
        data: {
          label: 'Web Server',
          nodeType: 'web-server',
          icon: 'Server',
          color: 'text-green-400',
          bgColor: 'from-green-500/20 to-emerald-500/10',
          borderColor: 'border-green-500/30'
        }
      }
    ],
    edges: [
      {
        id: 'lb-1-web-1',
        source: 'lb-1',
        target: 'web-1',
        type: 'smoothstep',
        style: { stroke: '#06b6d4', strokeWidth: 2 }
      }
    ],
    type: 'web-service',
    assignedVMs: ['vm-1'],
    assignedGroups: ['prod-web'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    deploymentStatus: 'deployed'
  },
  {
    id: 'config-2',
    name: 'Database High Availability',
    description: 'PostgreSQL cluster with primary and replica',
    nodes: [
      {
        id: 'db-primary',
        type: 'customNode',
        position: { x: 200, y: 100 },
        data: {
          label: 'Primary DB',
          nodeType: 'database',
          icon: 'Database',
          color: 'text-purple-400',
          bgColor: 'from-purple-500/20 to-violet-500/10',
          borderColor: 'border-purple-500/30'
        }
      }
    ],
    edges: [],
    type: 'database',
    assignedVMs: ['vm-2'],
    assignedGroups: [],
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
    deploymentStatus: 'draft'
  }
]

export function useInfraConfigs() {
  const [configs, setConfigs] = useState<InfraConfig[]>(mockConfigs)

  const saveConfig = useCallback((config: Omit<InfraConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConfig: InfraConfig = {
      ...config,
      id: `config-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setConfigs(prev => [...prev, newConfig])
    return newConfig
  }, [])

  const updateConfig = useCallback((id: string, updates: Partial<InfraConfig>) => {
    setConfigs(prev => prev.map(config => 
      config.id === id 
        ? { ...config, ...updates, updatedAt: new Date().toISOString() }
        : config
    ))
  }, [])

  const deleteConfig = useCallback((id: string) => {
    setConfigs(prev => prev.filter(config => config.id !== id))
  }, [])

  const assignConfigToVM = useCallback((configId: string, vmId: string) => {
    setConfigs(prev => prev.map(config =>
      config.id === configId
        ? { ...config, assignedVMs: [...new Set([...config.assignedVMs, vmId])] }
        : config
    ))
  }, [])

  const assignConfigToGroup = useCallback((configId: string, groupId: string) => {
    setConfigs(prev => prev.map(config =>
      config.id === configId
        ? { ...config, assignedGroups: [...new Set([...config.assignedGroups, groupId])] }
        : config
    ))
  }, [])

  const deployConfig = useCallback(async (configId: string, targetType: 'vm' | 'group', targetId: string) => {
    // Simulate deployment process
    setConfigs(prev => prev.map(config =>
      config.id === configId
        ? { ...config, deploymentStatus: 'deployed' as const }
        : config
    ))
    
    // Placeholder for future SSE integration
    logger.log(`Deploying config ${configId} to ${targetType} ${targetId}`)
    return { success: true, deploymentId: `deploy-${Date.now()}` }
  }, [])

  const generatePlan = useCallback((config: InfraConfig) => {
    // Generate Ansible/Terraform-like code preview
    const plan = `
# Infrastructure Configuration: ${config.name}
# Generated plan for deployment

---
- name: Configure ${config.name}
  hosts: all
  become: yes
  
  tasks:
${config.nodes.map(node => {
  const nodeData = node.data as any
  return `    - name: Setup ${nodeData.label}
      ${nodeData.nodeType === 'web-server' ? 'nginx' : nodeData.nodeType}:
        state: present
        config:
          type: ${nodeData.nodeType}
          ports: [80, 443]`
}).join('\n')}

# Terraform equivalent:
${config.nodes.map(node => {
  const nodeData = node.data as any
  return `resource "${nodeData.nodeType.replace('-', '_')}" "${node.id}" {
  name = "${nodeData.label}"
  # Configuration based on node type
}`
}).join('\n\n')}
    `.trim()
    
    return plan
  }, [])

  return {
    configs,
    saveConfig,
    updateConfig,
    deleteConfig,
    assignConfigToVM,
    assignConfigToGroup,
    deployConfig,
    generatePlan
  }
} 