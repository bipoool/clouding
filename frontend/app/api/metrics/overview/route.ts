import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/metrics/overview - Get overview metrics for dashboard
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting overview metrics for user: ${request.user.id}`)
    
    const metrics = await backendClient.get(`/metrics/overview`, request)
    return NextResponse.json(metrics)
  } catch (error) {
    return handleApiError(error, 'getting overview metrics')
  }
})
