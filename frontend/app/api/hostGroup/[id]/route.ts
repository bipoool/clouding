import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'

// GET /api/hostGroup/[id] - Get specific host group
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting host group ${id} for user: ${request.user.id}`)
    
    const hostGroup = await backendClient.get(`/hostGroups/${id}`, request)
    
    return NextResponse.json(hostGroup)
  } catch (error) {
    logger.error('Error getting host group:', error)
    
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

// PUT /api/hostGroup/[id] - Update specific host group
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Updating host group ${id} for user: ${request.user.id}`)
    
    const updatedHostGroup = await backendClient.put(`/hostGroups/${id}`, body, request)
    
    return NextResponse.json(updatedHostGroup)
  } catch (error) {
    logger.error('Error updating host group:', error)
    
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

// DELETE /api/hostGroup/[id] - Delete specific host group
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting host group ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hostGroups/${id}`, request)
    
    return NextResponse.json({ message: 'Host group deleted successfully' })
  } catch (error) {
    logger.error('Error deleting host group:', error)
    
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