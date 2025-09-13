import { useCallback, useEffect, useMemo, useState } from 'react'
import { httpClient } from '@/lib/http-client'
import { logger } from '@/lib/utils/logger'

export type DeploymentType = 'plan' | 'deploy'
export type DeploymentStatus = 'pending' | 'started' | 'completed' | 'failed'

export interface Deployment {
  id: string
  userId: string
  hostIds: number[] | null
  blueprintId: number
  type: DeploymentType
  status: DeploymentStatus
  createdAt: string
  updatedAt: string
}

export interface DeploymentHostMapping {
  deploymentId: string
  hostId: number
  status: DeploymentStatus
}

export interface CreateDeploymentInput {
  id?: string
  blueprintId: number
  hostIds: number[]
}

// Helper to normalize backend payload which is usually { success, error, data }
function unwrap<T>(response: any): T {
  if (!response) throw new Error('Empty response')
  if (Array.isArray(response)) return response as T
  if (response.data !== undefined) return response.data as T
  return response as T
}

export function useDeploymentsByType(type: DeploymentType) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeployments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await httpClient.get(`/deployments/type/${type}`)
      const list = unwrap<Deployment[]>(res)
      setDeployments(list)
      logger.info(`Fetched ${list.length} ${type} deployments`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployments'
      setError(message)
      logger.error('Error fetching deployments:', err)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  const createDeployment = useCallback(
    async (payload: CreateDeploymentInput) => {
      try {
        setError(null)
        const res = await httpClient.post(`/deployments/type/${type}`, payload)
        // Backend returns success wrapper; creation may return minimal fields
        const createdPartial = unwrap<Partial<Deployment> | null>(res)
        return createdPartial
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create deployment'
        setError(message)
        logger.error('Error creating deployment:', err)
        throw new Error(message)
      }
    },
    [type, fetchDeployments]
  )

  return {
    type,
    deployments,
    loading,
    error,
    refresh: fetchDeployments,
    createDeployment,
  }
}

export function useDeploymentById(id?: string) {
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  const fetchDeployment = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const res = await httpClient.get(`/deployments/${id}`)
      const value = unwrap<Deployment>(res)
      setDeployment(value)
      logger.info(`Fetched deployment ${id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployment'
      setError(message)
      logger.error('Error fetching deployment by id:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDeployment()
  }, [fetchDeployment])

  return { deployment, loading, error, refresh: fetchDeployment }
}

export function useDeploymentHostMappings(ids?: string[] | string) {
  const idParam = useMemo(() => {
    if (!ids) return ''
    return Array.isArray(ids) ? ids.join(',') : ids
  }, [ids])

  const [mappings, setMappings] = useState<DeploymentHostMapping[]>([])
  const [loading, setLoading] = useState<boolean>(Boolean(idParam))
  const [error, setError] = useState<string | null>(null)

  const fetchMappings = useCallback(async () => {
    if (!idParam) return
    try {
      setLoading(true)
      setError(null)
      const res = await httpClient.get(`/deployments/${idParam}/hosts`)
      const list = unwrap<DeploymentHostMapping[]>(res)
      setMappings(list)
      logger.info(`Fetched ${list.length} deployment host mappings for: ${idParam}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployment host mappings'
      setError(message)
      logger.error('Error fetching deployment host mappings:', err)
    } finally {
      setLoading(false)
    }
  }, [idParam])

  useEffect(() => {
    fetchMappings()
  }, [fetchMappings])

  return { mappings, loading, error, refresh: fetchMappings }
}
