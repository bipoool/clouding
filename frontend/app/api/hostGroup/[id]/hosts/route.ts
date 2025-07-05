import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// POST /api/hostGroup/[id]/hosts - Add host to host group
export const POST = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Adding host to host group ${id} for user: ${request.user.id}`)
    
    const result = await backendClient.post(`/hostGroups/${id}/hosts`, body, request)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'adding host to host group')
  }
}) 