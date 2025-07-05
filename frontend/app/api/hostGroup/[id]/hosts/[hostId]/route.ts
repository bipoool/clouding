import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'

// DELETE /api/hostGroup/[id]/hosts/[hostId] - Remove host from host group
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string; hostId: string } }) => {
  try {
    const { id, hostId } = params
    logger.info(`Removing host ${hostId} from host group ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hostGroups/${id}/hosts/${hostId}`, request)
    
    return NextResponse.json({ message: 'Host removed from group successfully' })
  } catch (error) {
    logger.error('Error removing host from host group:', error)
    
    if (error instanceof BackendClientError) {
      return NextResponse.json(
        { error: error.message, details: error.response },
        { status: error.status }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}) 