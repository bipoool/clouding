import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  BlueprintComponent,
  UpdateBlueprintComponentRequest,
  ApiResponse,
  ApiError 
} from '../../../types'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'
import { z } from 'zod'

// Zod schema for BlueprintComponentParameter validation
const BlueprintComponentParameterSchema = z.object({
  id: z.string().min(1, 'Parameter ID cannot be empty'),
  value: z.string(),
  name: z.string().min(1, 'Parameter name cannot be empty')
})

// Zod schema for UpdateBlueprintComponentRequest validation
const UpdateBlueprintComponentRequestSchema = z.object({
  componentId: z.number().positive('Component ID must be a positive number'),
  position: z.number().positive('Position must be a positive number'),
  parameters: z.array(BlueprintComponentParameterSchema)
})

// Zod schema for the entire request body (array of components)
const UpdateBlueprintComponentsSchema = z.array(UpdateBlueprintComponentRequestSchema)

// GET /api/blueprint/[id]/components - Get blueprint components
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting components for blueprint ${id} for user: ${request.user.id}`)
    
    const components = await backendClient.get(`/blueprints/${id}/components`, request)
    
    return NextResponse.json(components)
  } catch (error) {
    return handleApiError(error, 'getting blueprint components')
  }
})

// PUT /api/blueprint/[id]/components - Update blueprint components
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body: unknown = await request.json()
    
    // Validate request body using Zod schema
    const validationResult = UpdateBlueprintComponentsSchema.safeParse(body)
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
    logger.info(`Updating components for blueprint ${id} for user: ${request.user.id}`)
    
    const updatedComponents = await backendClient.put(`/blueprints/${id}/components`, validatedBody, request)
    
    return NextResponse.json(updatedComponents)
  } catch (error) {
    return handleApiError(error, 'updating blueprint components')
  }
})
