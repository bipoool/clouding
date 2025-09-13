import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/deployments/[id]/hosts - Get deployment host mapping(s)
// Note: backend supports comma-separated IDs in :id path param
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = await params
    logger.info(`Getting deployment host mapping for deploymentId(s): ${id}`)
    const mappings = await backendClient.get(`/deployments/${id}/hosts`, request)
    return NextResponse.json(mappings)
  } catch (error) {
    return handleApiError(error, 'getting deployment host mapping')
  }
})

