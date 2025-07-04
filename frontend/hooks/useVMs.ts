import { useState, useCallback } from 'react'

export interface VM {
  id: string
  name: string
  ip: string
  os: 'ubuntu' | 'centos' | 'debian' | 'alpine' | 'windows'
  status: 'connected' | 'disconnected' | 'error'
  health: number
  group?: string
  configId?: string
  credentialId?: string
  createdAt: string
  lastSeen: string
}

export interface VMGroup {
  id: string
  name: string
  description?: string
  vmIds: string[]
  configId?: string
  createdAt: string
}

const mockVMs: VM[] = [
  {
    id: 'vm-1',
    name: 'Production Web Server',
    ip: '192.168.1.10',
    os: 'ubuntu',
    status: 'connected',
    health: 98,
    group: 'prod-web',
    configId: 'config-1',
    credentialId: 'cred-1',
    createdAt: '2024-01-15T10:00:00Z',
    lastSeen: '2024-01-15T14:30:00Z'
  },
  {
    id: 'vm-2',
    name: 'Database Primary',
    ip: '192.168.1.20',
    os: 'ubuntu',
    status: 'connected',
    health: 99,
    group: 'db-cluster',
    credentialId: 'cred-1',
    createdAt: '2024-01-10T09:00:00Z',
    lastSeen: '2024-01-15T14:35:00Z'
  },
  {
    id: 'vm-3',
    name: 'Dev Environment',
    ip: '192.168.1.30',
    os: 'debian',
    status: 'disconnected',
    health: 0,
    credentialId: 'cred-2',
    createdAt: '2024-01-12T11:00:00Z',
    lastSeen: '2024-01-14T16:00:00Z'
  }
]

const mockGroups: VMGroup[] = [
  {
    id: 'prod-web',
    name: 'Production Web Servers',
    description: 'Frontend and API servers for production',
    vmIds: ['vm-1'],
    configId: 'config-1',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'db-cluster',
    name: 'Database Cluster',
    description: 'Primary and replica database servers',
    vmIds: ['vm-2'],
    createdAt: '2024-01-10T09:00:00Z'
  }
]

export function useVMs() {
  const [vms, setVMs] = useState<VM[]>(mockVMs)
  const [groups, setGroups] = useState<VMGroup[]>(mockGroups)

  const addVM = useCallback((vm: Omit<VM, 'id' | 'createdAt' | 'lastSeen'>) => {
    const newVM: VM = {
      ...vm,
      id: `vm-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    }
    setVMs(prev => [...prev, newVM])
    return newVM
  }, [])

  const updateVM = useCallback((id: string, updates: Partial<VM>) => {
    setVMs(prev => prev.map(vm => vm.id === id ? { ...vm, ...updates } : vm))
  }, [])

  const deleteVM = useCallback((id: string) => {
    setVMs(prev => prev.filter(vm => vm.id !== id))
    // Remove from groups
    setGroups(prev => prev.map(group => ({
      ...group,
      vmIds: group.vmIds.filter(vmId => vmId !== id)
    })))
  }, [])

  const assignVMToGroup = useCallback((vmId: string, groupId: string) => {
    setVMs(prev => prev.map(vm => 
      vm.id === vmId ? { ...vm, group: groupId } : vm
    ))
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, vmIds: [...new Set([...group.vmIds, vmId])] }
        : { ...group, vmIds: group.vmIds.filter(id => id !== vmId) }
    ))
  }, [])

  const assignConfigToVM = useCallback((vmId: string, configId: string) => {
    setVMs(prev => prev.map(vm => 
      vm.id === vmId ? { ...vm, configId } : vm
    ))
  }, [])

  return {
    vms,
    addVM,
    updateVM,
    deleteVM,
    assignVMToGroup,
    assignConfigToVM
  }
}

export function useVMGroups() {
  const [groups, setGroups] = useState<VMGroup[]>(mockGroups)

  const createGroup = useCallback((group: Omit<VMGroup, 'id' | 'createdAt' | 'vmIds'>) => {
    const newGroup: VMGroup = {
      ...group,
      id: `group-${Date.now()}`,
      vmIds: [],
      createdAt: new Date().toISOString()
    }
    setGroups(prev => [...prev, newGroup])
    return newGroup
  }, [])

  const updateGroup = useCallback((id: string, updates: Partial<VMGroup>) => {
    setGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ))
  }, [])

  const deleteGroup = useCallback((id: string) => {
    setGroups(prev => prev.filter(group => group.id !== id))
  }, [])

  const addVMToGroup = useCallback((groupId: string, vmId: string) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId 
        ? { ...group, vmIds: [...new Set([...group.vmIds, vmId])] }
        : group
    ))
  }, [])

  const removeVMFromGroup = useCallback((groupId: string, vmId: string) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId 
        ? { ...group, vmIds: group.vmIds.filter(id => id !== vmId) }
        : group
    ))
  }, [])

  const assignConfigToGroup = useCallback((groupId: string, configId: string) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, configId } : group
    ))
  }, [])

  return {
    groups,
    createGroup,
    updateGroup,
    deleteGroup,
    addVMToGroup,
    removeVMFromGroup,
    assignConfigToGroup
  }
} 