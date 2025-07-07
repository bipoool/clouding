import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/hostGroup/[id] - Get specific host group
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting host group ${id} for user: ${request.user.id}`)
    
    const hostGroup = await backendClient.get(`/hostGroups/${id}`, request)
    
    return NextResponse.json(hostGroup)
  } catch (error) {
    return handleApiError(error, 'getting host group')
  }
})

// PUT /api/hostGroup/[id] - Update specific host group
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Updating host group ${id} for user: ${request.user.id}`)
    
    const updatedHostGroup = await backendClient.put(`/hostGroups/${id}`, body, request)
    
    return NextResponse.json(updatedHostGroup)
  } catch (error) {
    return handleApiError(error, 'updating host group')
  }
})

// DELETE /api/hostGroup/[id] - Delete specific host group
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting host group ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hostGroups/${id}`, request)
    
    return NextResponse.json({ message: 'Host group deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'deleting host group')
  }
}) 