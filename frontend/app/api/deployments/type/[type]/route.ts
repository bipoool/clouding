import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// Validate deployment type helper
function isValidDeploymentType(type: string) {
  return type === 'plan' || type === 'deploy'
}

// Basic validation for create deployment request
function validateCreateDeploymentBody(body: any): { valid: boolean; message?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, message: 'Request body must be a JSON object' }
  }

  // blueprintId required (number)
  if (typeof body.blueprintId !== 'number') {
    return { valid: false, message: '"blueprintId" is required and must be a number' }
  }

  // Either hostIds (array of numbers) or hostGroupId (number) can be present
  if (body.hostIds !== undefined) {
    if (!Array.isArray(body.hostIds) || !body.hostIds.every((v: any) => Number.isInteger(v))) {
      return { valid: false, message: '"hostIds" must be an array of integers' }
    }
  } else {
    return { valid: false, message: '"hostIds" is required' }
  }

  return { valid: true }
}

// GET /api/deployments/type/[type] - Get deployments for user by type
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { type: string } }) => {
  try {
    const { type } = await params
    if (!isValidDeploymentType(type)) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Invalid deployment type. Must be "plan" or "deploy".' },
        { status: 400 }
      )
    }

    logger.info(`Getting deployments of type ${type} for user: ${request.user.id}`)
    const deployments = await backendClient.get(`/deployments/type/${type}`, request)
    return NextResponse.json(deployments)
  } catch (error) {
    return handleApiError(error, 'getting deployments by type')
  }
})

// POST /api/deployments/type/[type] - Create a new deployment
export const POST = withAuth(async (request: AuthenticatedRequest, { params }: { params: { type: string } }) => {
  try {
    const { type } = await params
    if (!isValidDeploymentType(type)) {
      return NextResponse.json(
        { error: 'Validation failed', message: 'Invalid deployment type. Must be "plan" or "deploy".' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = validateCreateDeploymentBody(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', message: validation.message },
        { status: 400 }
      )
    }

    logger.info(`Creating ${type} deployment for user: ${request.user.id}`)
    const created = await backendClient.post(`/deployments/type/${type}`, body, request)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating deployment')
  }
})

