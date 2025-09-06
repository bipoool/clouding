import { useState, useCallback, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'
import { httpClient } from '@/lib/http-client'

// Simplified Blueprint interface matching the API
export interface Blueprint {
  id: number
  name: string
  description: string
  status: 'draft' | 'deployed' | 'archived'
  createdAt: string
  updatedAt: string
}

// Blueprint Component interface based on API structure
export interface BlueprintComponent {
  id: number
  blueprintId: number
  componentId: number
  position: number
  parameters: Array<{
    id: string
    value: string
    name: string
  }>
  createdAt: string
  updatedAt: string
}

// Blueprint data with components for passing through URL
export interface BlueprintWithComponents extends Blueprint {
  components: BlueprintComponent[]
}

// Interface for updating blueprint components (simplified structure for API calls)
export interface BlueprintComponentUpdate {
  componentId: number
  position: number
  parameters: Array<{
    id: string
    value: string
    name: string
  }>
}

// Function to get a random emoji for blueprints
const getRandomEmoji = (): string => {
  const emojis = [
    '🚀', '⚡', '🔧', '🛠️', '⚙️', '🔨', '📦', '🎯', '🎪', '🎨',
    '🏗️', '🏢', '🏭', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💎',
    '💡', '🔮', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹',
    '🎸', '🎺', '🎻', '🥁', '🎷', '🎺', '🎸', '🎻', '🥁', '🎷'
  ]
  return emojis[Math.floor(Math.random() * emojis.length)]
}

// Function to get emoji based on blueprint name (for consistency)
export const getEmojiForBlueprint = (name: string): string => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const emojis = [
    '🚀', '⚡', '🔧', '🛠️', '⚙️', '🔨', '📦', '🎯', '🎪', '🎨',
    '🏗️', '🏢', '🏭', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💎',
    '💡', '🔮', '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹',
    '🎸', '🎺', '🎻', '🥁', '🎷', '🎺', '🎸', '🎻', '🥁', '🎷'
  ]
  return emojis[hash % emojis.length]
}

// Utility function to format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function useBlueprints() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch blueprints from API
  const fetchBlueprints = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await httpClient.get('/blueprint') as any
      
      // Handle the API response structure
      let fetchedBlueprints: Blueprint[]
      if (response && Array.isArray(response.data)) {
        // API response is wrapped in an object with 'data' key containing array
        fetchedBlueprints = response.data
      } else if (response && response.data && Array.isArray(response.data.data)) {
        // API response has nested data structure (data.data)
        fetchedBlueprints = response.data.data
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        fetchedBlueprints = response
      } else {
        throw new Error('Invalid response format')
      }
      
      setBlueprints(fetchedBlueprints)
      logger.info(`Fetched ${fetchedBlueprints.length} blueprints`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blueprints'
      setError(errorMessage)
      logger.error('Error fetching blueprints:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load blueprints on mount
  useEffect(() => {
    fetchBlueprints()
  }, [fetchBlueprints])

  // Create new blueprint using httpClient
  const createBlueprint = useCallback(async (name: string, description: string, status: 'draft' | 'deployed' | 'archived' = 'draft'): Promise<Blueprint> => {
    try {
      setError(null)
      const response = await httpClient.post('/blueprint', {
        name,
        description,
        status
      })
      
      // API response is wrapped in an object with 'data' key
      const { data: createdPartial } = response as { data: Partial<Blueprint> }
      
      // Merge user-provided data with server response
      const fullBlueprint: Blueprint = { 
        name, 
        description, 
        status, 
        ...createdPartial 
      } as Blueprint
      
      // Update local state directly instead of refetching
      setBlueprints(prev => [...prev, fullBlueprint])
      
      logger.info(`Successfully created blueprint: ${fullBlueprint.id}`)
      return fullBlueprint
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blueprint'
      setError(errorMessage)
      logger.error('Error creating blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Update blueprint using httpClient
  const updateBlueprint = useCallback(async (id: number, updates: Partial<Pick<Blueprint, 'name' | 'description' | 'status'>>): Promise<Blueprint> => {
    try {
      setError(null)
      
      const response = await httpClient.put(`/blueprint/${id}`, updates)
      
      // API response is wrapped in an object with 'data' key
      const { data: updatedPartial } = response as { data: Partial<Blueprint> }
      
      // Update local state with merged data (user updates + server response)
      setBlueprints(prev => prev.map(blueprint => {
        if (blueprint.id === id) {
          return { ...blueprint, ...updates, ...updatedPartial } as Blueprint
        }
        return blueprint
      }))
      
      // Return the merged blueprint with guaranteed id
      const updatedBlueprint = { id, ...updates, ...updatedPartial } as Blueprint
      
      logger.info(`Successfully updated blueprint: ${id}`)
      return updatedBlueprint
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blueprint'
      setError(errorMessage)
      logger.error('Error updating blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Delete blueprint
  const deleteBlueprint = useCallback(async (id: number) => {
    try {
      setError(null)
      
      await httpClient.delete(`/blueprint/${id}`)

      // Remove from local state after successful deletion
      setBlueprints(prev => prev.filter(blueprint => blueprint.id !== id))

      logger.info(`Successfully deleted blueprint: ${id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blueprint'
      setError(errorMessage)
      logger.error('Error deleting blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Update blueprint components
  const updateBlueprintComponents = useCallback(async (blueprintId: number, components: BlueprintComponentUpdate[]) => {
    try {
      setError(null)
      
      const response = await httpClient.put(`/blueprint/${blueprintId}/components`, components)
      logger.info(`Successfully updated blueprint components for blueprint: ${blueprintId}`)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blueprint components'
      setError(errorMessage)
      logger.error('Error updating blueprint components:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Generate plan for blueprint (placeholder for now)
  const generatePlan = useCallback((blueprint: Blueprint) => {
    logger.info(`Generating plan for blueprint: ${blueprint.name}`)
    return "Plan generated"
  }, [])

  // Get blueprint components
  const getBlueprintComponents = useCallback(async (blueprintId: number): Promise<BlueprintComponent[]> => {
    try {
      logger.info(`Fetching components for blueprint: ${blueprintId}`)
      const response = await httpClient.get(`/blueprint/${blueprintId}/components`)
      logger.info(`Successfully fetched blueprint components for blueprint: ${blueprintId}`)
      return response.data as BlueprintComponent[]
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blueprint components'
      logger.error('Error fetching blueprint components:', err)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    blueprints,
    loading,
    error,
    createBlueprint,
    updateBlueprint,
    updateBlueprintComponents,
    deleteBlueprint,
    generatePlan,
    getBlueprintComponents,
    getEmojiForBlueprint,
    refreshBlueprints: fetchBlueprints
  }
} 