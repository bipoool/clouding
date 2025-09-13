import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/deployments/[id] - Get a deployment by ID
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = await params
    logger.info(`Getting deployment ${id} for user: ${request.user.id}`)
    const deployment = await backendClient.get(`/deployments/${id}`, request)
    return NextResponse.json(deployment)
  } catch (error) {
    return handleApiError(error, 'getting deployment by id')
  }
})

