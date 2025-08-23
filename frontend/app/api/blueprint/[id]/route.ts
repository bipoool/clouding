import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  UpdateBlueprintRequest,
  Blueprint,
  ApiResponse,
  ApiError 
} from '../../types'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'
import { z } from 'zod'

// Zod schema for UpdateBlueprintRequest validation
const UpdateBlueprintSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  status: z.string().optional()
})

// Type for validated request body
type ValidatedUpdateBlueprintRequest = z.infer<typeof UpdateBlueprintSchema>

// GET /api/blueprint/[id] - Get specific blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting blueprint ${id} for user: ${request.user.id}`)
    
    const blueprint = await backendClient.get(`/blueprints/${id}`, request)
    
    return NextResponse.json(blueprint)
  } catch (error) {
    return handleApiError(error, 'getting blueprint')
  }
})

// PUT /api/blueprint/[id] - Update specific blueprint
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body: unknown = await request.json()
    
    // Validate request body using Zod schema
    const validationResult = UpdateBlueprintSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: `Invalid request body: ${errors}`,
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const validatedBody = validationResult.data
    logger.info(`Updating blueprint ${id} for user: ${request.user.id}`)
    
    const updatedBlueprint = await backendClient.put(`/blueprints/${id}`, validatedBody, request)
    
    return NextResponse.json(updatedBlueprint)
  } catch (error) {
    return handleApiError(error, 'updating blueprint')
  }
})

// DELETE /api/blueprint/[id] - Delete specific blueprint
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting blueprint ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/blueprints/${id}`, request)
    
    return NextResponse.json({ message: 'Blueprint deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'deleting blueprint')
  }
}) 