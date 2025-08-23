import { useState, useCallback, useEffect } from 'react'
import { logger } from '@/lib/utils/logger'

// Simplified Blueprint interface matching the API
export interface Blueprint {
  id: number
  name: string
  description: string
  status: 'draft' | 'deployed' | 'archived'
  createdAt: string
  updatedAt: string
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
      
      const response = await fetch('/api/blueprint')
      if (!response.ok) {
        throw new Error(`Failed to fetch blueprints: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Handle the API response structure
      let fetchedBlueprints: Blueprint[]
      if (data.success && data.data) {
        fetchedBlueprints = data.data
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        fetchedBlueprints = data
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

  // Create new blueprint
  const createBlueprint = useCallback(async (name: string, description: string, status: 'draft' | 'deployed' | 'archived' = 'draft') => {
    try {
      const response = await fetch('/api/blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          status
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create blueprint: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Refresh the blueprints list
      await fetchBlueprints()
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create blueprint'
      logger.error('Error creating blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [fetchBlueprints])

  // Update blueprint with optimistic update
  const updateBlueprint = useCallback(async (id: number, updates: Partial<Pick<Blueprint, 'name' | 'description' | 'status'>>) => {
    try {
      // Optimistically update local state
      setBlueprints(prev => prev.map(blueprint => 
        blueprint.id === id 
          ? { ...blueprint, ...updates, updatedAt: new Date().toISOString() }
          : blueprint
      ))
      
      const response = await fetch(`/api/blueprint/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        await fetchBlueprints()
        throw new Error(`Failed to update blueprint: ${response.statusText}`)
      }

      const data = await response.json()
      logger.info(`Successfully updated blueprint: ${id}`)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update blueprint'
      logger.error('Error updating blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [fetchBlueprints])

  // Delete blueprint with optimistic update
  const deleteBlueprint = useCallback(async (id: number) => {
    try {
      // Optimistically remove from local state
      setBlueprints(prev => prev.filter(blueprint => blueprint.id !== id))
      
      const response = await fetch(`/api/blueprint/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        await fetchBlueprints()
        throw new Error(`Failed to delete blueprint: ${response.statusText}`)
      }

      logger.info(`Successfully deleted blueprint: ${id}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blueprint'
      logger.error('Error deleting blueprint:', err)
      throw new Error(errorMessage)
    }
  }, [fetchBlueprints])

  // Generate plan for blueprint (placeholder for now)
  const generatePlan = useCallback((blueprint: Blueprint) => {
    logger.info(`Generating plan for blueprint: ${blueprint.name}`)
    return "Plan generated"
  }, [])

  return {
    blueprints,
    loading,
    error,
    createBlueprint,
    updateBlueprint,
    deleteBlueprint,
    generatePlan,
    getEmojiForBlueprint,
    refreshBlueprints: fetchBlueprints
  }
} 