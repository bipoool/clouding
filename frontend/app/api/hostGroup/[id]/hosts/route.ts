import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// POST /api/hostGroup/[id]/hosts - Add host to host group
export const POST = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string, hostIds: string[] } }) => {
  try {
    const { id } = params
    const body = await request.json()
    
    const result = await backendClient.post(`/hostGroups/${id}/hosts`, body, request)
    logger.info(`Added host to host group ${id} with host IDs: ${body.hostIds} for user: ${request.user.id}`)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'adding host to host group')
  }
}) 