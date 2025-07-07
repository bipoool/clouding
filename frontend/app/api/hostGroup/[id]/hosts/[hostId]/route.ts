import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// DELETE /api/hostGroup/[id]/hosts/[hostId] - Remove host from host group
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string; hostId: string } }) => {
  try {
    const { id, hostId } = params
    logger.info(`Removing host ${hostId} from host group ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hostGroups/${id}/hosts/${hostId}`, request)
    
    return NextResponse.json({ message: 'Host removed from group successfully' })
  } catch (error) {
    return handleApiError(error, 'removing host from host group')
  }
}) 