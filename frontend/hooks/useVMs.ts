import { useState, useCallback, useEffect } from 'react'
import type { Host, HostGroup } from '@/app/api/types'
import { getErrorMessage } from '@/lib/utils'

// Type alias for backward compatibility
export type VM = Host & {
  status?: 'connected' | 'disconnected' | 'error'
  health?: number
  lastSeen?: string
  group?: string
  configId?: string
}

export interface VMGroup {
  id: string
  name: string
  description?: string
  vmIds: string[]
  configId?: string
  createdAt: string
  updatedAt: string
}

export function useVMs() {
  const [vms, setVMs] = useState<VM[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to enhance Host data with VM-specific fields
  const enhanceHostData = (host: Host): VM => ({
    ...host,
    status: 'connected', // Default status, could be determined by connectivity check
    lastSeen: new Date().toISOString(),
    group: undefined // Will be set based on host group membership
  })

  // Initial fetch
  useEffect(() => {
    const fetchVMs = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/hosts', { credentials: 'include' })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to fetch VMs')
        }
        const response = await res.json()
        const hosts: Host[] = response.data || []
        const enhancedVMs = (hosts || []).map(enhanceHostData)
        setVMs(enhancedVMs)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchVMs()
  }, [])

  const addVM = useCallback(async (vm: Partial<VM>) => {
    try {
      setError(null)
      const res = await fetch('/api/hosts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vm)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create VM')
      }
      const { data: createdPartial } = (await res.json()) as { data: Partial<Host> };
      // Merge API response with what we already know from the form
      const mergedHost = { ...vm, ...createdPartial } as Host;
      const newVM = enhanceHostData(mergedHost);
      setVMs(prev => [...prev, newVM]);
      return mergedHost;
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const updateVM = useCallback(async (id: string, updates: Partial<VM>) => {
    try {
      setError(null)
      const res = await fetch(`/api/hosts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update VM')
      }
      const { data: updatedPartial } = (await res.json()) as { data: Partial<Host> };
      setVMs(prev =>
        prev.map(item =>
          item.id.toString() === id
            ? enhanceHostData({ ...item, ...updates, ...updatedPartial })
            : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const deleteVM = useCallback(async (id: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/hosts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete VM')
      }
      setVMs(prev => prev.filter(vm => vm.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const assignVMToGroup = useCallback(async (vmId: string, groupId: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/hostGroup/${groupId}/hosts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostIds: [vmId] })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to assign VM to group')
      }
      // Update the VM's group property
      setVMs(prev => prev.map(vm => 
        vm.id === vmId ? { ...vm, group: groupId } : vm
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const assignConfigToVM = useCallback(async (id: string, configId: string) => {
    try {
      setError(null)
      // TODO: Implement via /api/blueprint or configs when available
      // For now, just update the VM in state
      setVMs(prev => prev.map(vm => 
        vm.id === id ? { ...vm, configId } : vm
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { 
    vms, 
    isLoading, 
    error, 
    clearError,
    addVM, 
    updateVM, 
    deleteVM, 
    assignVMToGroup, 
    assignConfigToVM 
  }
}

export function useVMGroups() {
  const [groups, setGroups] = useState<VMGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to convert HostGroup to VMGroup
  const convertHostGroupToVMGroup = (hostGroup: HostGroup): VMGroup => ({
    id: hostGroup.id,
    name: hostGroup.name,
    description: undefined, // HostGroup doesn't have description
    vmIds: hostGroup.hostIds,
    configId: undefined, // Will be added later when blueprint integration is available
    createdAt: hostGroup.createdAt,
    updatedAt: hostGroup.updatedAt
  })

  // Initial fetch
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/hostGroup', { credentials: 'include' })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to fetch groups')
        }
        const response = await res.json()
        const hostGroups: HostGroup[] = response.data || []
        const vmGroups = (hostGroups || []).map(convertHostGroupToVMGroup)
        setGroups(vmGroups)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const createGroup = useCallback(async (group: Omit<VMGroup, 'id' | 'createdAt' | 'updatedAt' | 'vmIds'>) => {
    try {
      setError(null)
      const res = await fetch('/api/hostGroup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: group.name,
          hostIds: []
        })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create group')
      }
      const response = await res.json()
      const newHostGroup: HostGroup = response.data
      const newVMGroup = convertHostGroupToVMGroup(newHostGroup)
      setGroups(prev => [...prev, newVMGroup])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const updateGroup = useCallback(async (id: string, updates: Partial<VMGroup>) => {
    try {
      setError(null)
      const res = await fetch(`/api/hostGroup/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.name,
          hostIds: updates.vmIds
        })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update group')
      }
      const response = await res.json()
      const updatedHostGroup: HostGroup = response.data
      const updatedVMGroup = convertHostGroupToVMGroup(updatedHostGroup)
      setGroups(prev => prev.map(g => (g.id === id ? updatedVMGroup : g)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const deleteGroup = useCallback(async (id: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/hostGroup/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete group')
      }
      setGroups(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const addVMToGroup = useCallback(async (groupId: string, vmId: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/hostGroup/${groupId}/hosts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostIds: [vmId] })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to add VM to group')
      }
      // Update the group's vmIds
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, vmIds: [...g.vmIds, vmId] } : g
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const removeVMFromGroup = useCallback(async (groupId: string, vmId: string) => {
    try {
      setError(null)
      const res = await fetch(`/api/hostGroup/${groupId}/hosts/${vmId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to remove VM from group')
      }
      // Update the group's vmIds
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, vmIds: g.vmIds.filter(id => id !== vmId) } : g
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const assignConfigToGroup = useCallback(async (groupId: string, configId: string) => {
    try {
      setError(null)
      // TODO: Implement via /api/blueprint or configs when available
      // For now, just update the group in state
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, configId } : g
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    groups,
    isLoading,
    error,
    clearError,
    createGroup,
    updateGroup,
    deleteGroup,
    addVMToGroup,
    removeVMFromGroup,
    assignConfigToGroup
  }
} 