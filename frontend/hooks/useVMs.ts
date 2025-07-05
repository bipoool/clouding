import { useState, useCallback, useEffect } from 'react'
import type { Host as VM } from '@/app/api/types'
import { getErrorMessage } from '@/lib/utils'

export interface VMGroup {
  id: string
  name: string
  description?: string
  vmIds: string[]
  configId?: string
  createdAt: string
}

export function useVMs() {
  const [vms, setVMs] = useState<VM[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const fetchVMs = async () => {
      try {
        const res = await fetch('/api/hosts', { credentials: 'include' })
        if (!res.ok) throw new Error('Failed to fetch VMs')
        const data = await res.json()
        setVMs(data)
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
      const res = await fetch('/api/hosts', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vm)
      })
      if (!res.ok) throw new Error('Failed to create VM')
      const newVM: VM = await res.json()
      setVMs(prev => [...prev, newVM])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const updateVM = useCallback(async (id: string, updates: Partial<VM>) => {
    try {
      const res = await fetch(`/api/hosts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Failed to update VM')
      const updated: VM = await res.json()
      setVMs(prev => prev.map(vm => (vm.id === id ? updated : vm)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  const deleteVM = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/hosts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to delete VM')
      setVMs(prev => prev.filter(vm => vm.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }, [])

  // Placeholder functions for group/ config actions (no API yet)
  const assignVMToGroup = useCallback((id: string, groupId: string) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const assignConfigToVM = useCallback((id: string, configId: string) => {
    /* TODO: implement via /api/blueprint or configs */
  }, [])

  return { vms, isLoading, error, addVM, updateVM, deleteVM, assignVMToGroup, assignConfigToVM }
}

export function useVMGroups() {
  const [groups, setGroups] = useState<VMGroup[]>([])

  const createGroup = useCallback((group: Omit<VMGroup, 'id' | 'createdAt' | 'vmIds'>) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const updateGroup = useCallback((id: string, updates: Partial<VMGroup>) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const deleteGroup = useCallback((id: string) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const addVMToGroup = useCallback((groupId: string, vmId: string) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const removeVMFromGroup = useCallback((groupId: string, vmId: string) => {
    /* TODO: implement via /api/hostGroup */
  }, [])

  const assignConfigToGroup = useCallback((groupId: string, configId: string) => {
    /* TODO: implement via /api/blueprint or configs */
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