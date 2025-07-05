import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateBlueprintRequest, 
  UpdateBlueprintRequest,
  Blueprint, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// Type for PUT request body that includes id field
interface UpdateBlueprintWithIdRequest extends UpdateBlueprintRequest {
  id: string
}

// Type guard function to validate CreateBlueprintRequest
function isValidCreateBlueprintRequest(body: unknown): body is CreateBlueprintRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false
  }

  const obj = body as Record<string, unknown>
  
  return (
    Array.isArray(obj.plan) &&
    obj.plan.length > 0 &&
    obj.plan.every(item => typeof item === 'string') &&
    typeof obj.description === 'string' &&
    obj.description.trim().length > 0 &&
    typeof obj.userId === 'string' &&
    obj.userId.trim().length > 0
  )
}

// Type guard function to validate UpdateBlueprintWithIdRequest
function isValidUpdateBlueprintRequest(body: unknown): body is UpdateBlueprintWithIdRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false
  }

  const obj = body as Record<string, unknown>
  
  return (
    typeof obj.id === 'string' &&
    obj.id.trim().length > 0 &&
    Array.isArray(obj.plan) &&
    obj.plan.length > 0 &&
    obj.plan.every(item => typeof item === 'string') &&
    typeof obj.description === 'string' &&
    obj.description.trim().length > 0
  )
}

// GET /api/blueprint - Get all blueprints
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting blueprints for user: ${request.user.id}`)
    
    const blueprints = await backendClient.get(`/blueprint`, request)
    
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
        { error: 'Invalid request body', message: 'plan (non-empty array), description, and userId are required' },
        { status: 400 }
      )
    }
    
    logger.info(`Creating blueprint for user: ${request.user.id}`)
    
    const newBlueprint = await backendClient.post(`/blueprint`, body, request)
    
    return NextResponse.json(newBlueprint, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating blueprint')
  }
})

// PUT /api/blueprint - Update a blueprint
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: unknown = await request.json()
    
    // Type-safe validation using type guard
    if (!isValidUpdateBlueprintRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body', message: 'id, plan (non-empty array), and description are required' },
        { status: 400 }
      )
    }

    logger.info(`Updating blueprint: ${body.id} via Go backend`)
    
    const response = await backendClient.put(`/blueprint/${body.id}`, body, request)
    
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'updating blueprint')
  }
})    