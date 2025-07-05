import { useState, useCallback, useEffect } from 'react'
import type { HostGroup, CreateHostGroupRequest, UpdateHostGroupRequest } from '@/app/api/types'
import { getErrorMessage } from '@/lib/utils'

export interface HostGroupsHookReturn {
  hostGroups: HostGroup[]
  isLoading: boolean
  error: string | null
  clearError: () => void
  createHostGroup: (data: Omit<CreateHostGroupRequest, 'userId'>) => Promise<HostGroup | undefined>
  updateHostGroup: (id: string, updates: Partial<HostGroup>) => Promise<void>
  deleteHostGroup: (id: string) => Promise<void>
  addHostToGroup: (groupId: string, hostId: string) => Promise<void>
  removeHostFromGroup: (groupId: string, hostId: string) => Promise<void>
  getHostGroupById: (id: string) => Promise<HostGroup | undefined>
}

export function useHostGroups(): HostGroupsHookReturn {
  const [hostGroups, setHostGroups] = useState<HostGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const fetchHostGroups = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/hostGroup', { credentials: 'include' })
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || 'Failed to fetch host groups')
        }
        const data: HostGroup[] = await res.json()
        setHostGroups(data || [])
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHostGroups()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const createHostGroup = useCallback(async (data: Omit<CreateHostGroupRequest, 'userId'>) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/hostGroup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create host group')
      }
      const newHostGroup: HostGroup = await res.json()
      setHostGroups(prev => [...prev, newHostGroup])
      return newHostGroup
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateHostGroup = useCallback(async (id: string, updates: Partial<HostGroup>) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hostGroup/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update host group')
      }
      const updatedHostGroup: HostGroup = await res.json()
      setHostGroups(prev => prev.map(g => (g.id === id ? updatedHostGroup : g)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteHostGroup = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hostGroup/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete host group')
      }
      setHostGroups(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addHostToGroup = useCallback(async (groupId: string, hostId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hostGroup/${groupId}/hosts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostIds: [hostId] })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to add host to group')
      }
      // Update the group's hostIds
      setHostGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, hostIds: [...g.hostIds, hostId] } : g
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeHostFromGroup = useCallback(async (groupId: string, hostId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hostGroup/${groupId}/hosts/${hostId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to remove host from group')
      }
      // Update the group's hostIds
      setHostGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, hostIds: g.hostIds.filter(id => id !== hostId) } : g
      ))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getHostGroupById = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/hostGroup/${id}`, { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to fetch host group')
      }
      const hostGroup: HostGroup = await res.json()
      return hostGroup
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    hostGroups,
    isLoading,
    error,
    clearError,
    createHostGroup,
    updateHostGroup,
    deleteHostGroup,
    addHostToGroup,
    removeHostFromGroup,
    getHostGroupById
  }
} 