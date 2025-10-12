import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/blueprint/[id]/deployments - Fetch deployments created from a blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting deployments for blueprint ${id} for user: ${request.user.id}`)

    const deployments = await backendClient.get(`/blueprints/${id}/deployments?limit=1`, request)

    return NextResponse.json(deployments)
  } catch (error) {
    return handleApiError(error, 'getting blueprint deployments')
  }
})
