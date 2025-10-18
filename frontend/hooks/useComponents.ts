import { useState, useCallback, useEffect } from 'react'
import { getErrorMessage } from '@/lib/utils'

export interface ComponentParameter {
  id: string
  name: string
  valueType: 'string'
  uiType: 'text' | 'select' | 'checkbox' | 'textarea' | 'password' | 'number'
  rules: {
    required: boolean
    required_if?: Record<string, string>
  }
  default?: string
  description: string
  options?: string[]
}

export interface Component {
  id: number
  name: string
  displayName: string
  description: string
  label: string
  ansibleRole: string
  parameters: ComponentParameter[]
  createdAt: string
  updatedAt: string
}

export function useComponents() {
  const [components, setComponents] = useState<Component[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial fetch
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch('/api/components', { credentials: 'include' })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch components')
        }
        const response = await res.json()
        const fetchedComponents: Component[] = response.data || []
        setComponents(fetchedComponents)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchComponents()
  }, [])

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/components', { credentials: 'include' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch components')
      }
      const response = await res.json()
      const fetchedComponents: Component[] = response.data || []
      setComponents(fetchedComponents)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    components,
    isLoading,
    error,
    refetch
  }
}
