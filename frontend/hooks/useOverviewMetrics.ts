import { useState, useEffect, useCallback, useRef } from 'react'
import { httpClient } from '@/lib/http-client'
import { getErrorMessage } from '@/lib/utils'

export interface OverviewMetric {
  entity: 'vms' | 'vmGroups' | 'credentials' | 'blueprints'
  currentMonth: number
  lastMonth: number
  total: number
}

export interface OverviewMetricsResponse {
  data: OverviewMetric[]
  error: string | null
  success: boolean
}

export interface OverviewMetricsHookReturn {
  metrics: OverviewMetric[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  clearError: () => void
}

export function useOverviewMetrics(): OverviewMetricsHookReturn {
  const [metrics, setMetrics] = useState<OverviewMetric[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const response: OverviewMetricsResponse = await httpClient.get('/metrics/overview')
      
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        if (response.success && response.data) {
          setMetrics(response.data)
          setError(null)
        } else {
          setError(response.error || 'Failed to fetch metrics')
        }
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchMetrics()

    // Cleanup: mark component as unmounted
    return () => {
      isMountedRef.current = false
    }
  }, [fetchMetrics])

  const clearError = useCallback(() => {
    if (isMountedRef.current) {
      setError(null)
    }
  }, [])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
    clearError
  }
}
