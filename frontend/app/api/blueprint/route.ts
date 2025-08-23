import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { logger } from '@/lib/utils/logger'
import { backendClient } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

interface CreateBlueprintRequest {
  name: string
  description: string
  status?: string
}

// Type guard function to validate CreateBlueprintRequest
function isValidCreateBlueprintRequest(body: unknown): body is CreateBlueprintRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false
  }

  const obj = body as Record<string, unknown>
  
  return (
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    typeof obj.description === 'string' &&
    obj.description.trim().length > 0 &&
    (obj.status === undefined || (typeof obj.status === 'string' && ['draft', 'deployed', 'archived'].includes(obj.status as string)))
  )
}

// GET /api/blueprint - Get all blueprints
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting blueprints for user: ${request.user.id}`)
    
    const blueprints = await backendClient.get(`/blueprints`, request)
    
    return NextResponse.json(blueprints)
  } catch (error) {
    return handleApiError(error, 'getting blueprints')
  }
})

// POST /api/blueprint - Create new blueprint
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: unknown = await request.json()
    
    // Type-safe validation using type guard
    if (!isValidCreateBlueprintRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body', message: 'Parameters are missing or invalid' },
        { status: 400 }
      )
    }
    
    logger.info(`Creating blueprint for user: ${request.user.id}`)
    
    const newBlueprint = await backendClient.post(`/blueprints`, body, request)
    
    return NextResponse.json(newBlueprint, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating blueprint')
  }
})    