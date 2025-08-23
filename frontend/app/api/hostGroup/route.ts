import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { logger } from '@/lib/utils/logger'
import { backendClient } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// Type for PUT request body that includes id field
interface UpdateHostGroupWithIdRequest  {
  name?: string
  description?: string
  hostIds?: string[]
  id: string
}

// Type guard function to validate the request body structure
function isValidUpdateHostGroupRequest(body: unknown): body is UpdateHostGroupWithIdRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false
  }

  const obj = body as Record<string, unknown>
  
  return (
    typeof obj.id === 'string' &&
    obj.id.trim().length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    typeof obj.description === 'string' &&
    obj.description.trim().length > 0 &&
    Array.isArray(obj.hostIds) &&
    obj.hostIds.every(hostId => typeof hostId === 'string')
  )
}

// GET /api/hostGroup - Get all host groups
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting host groups for user: ${request.user.id}`)
    
    const hostGroups = await backendClient.get(`/hostGroups`, request)
    
    return NextResponse.json(hostGroups)
  } catch (error) {
    return handleApiError(error, 'getting host groups')
  }
})

// POST /api/hostGroup - Create new host group
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info(`Creating host group for user: ${request.user.id}`)
    
    const newHostGroup = await backendClient.post(`/hostGroups`, body, request)
    
    return NextResponse.json(newHostGroup, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating host group')
  }
})

// PUT /api/hostGroup - Update a host group
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: unknown = await request.json()
    
    // Type-safe validation using type guard
    if (!isValidUpdateHostGroupRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body', message: 'id, name, description, and hostIds (array) are required' },
        { status: 400 }
      )
    }

    logger.info(`Updating host group: ${body.id} via Go backend`)
    
    const response = await backendClient.put('/hostGroups', body, request)
    
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'updating host group')
  }
}) 