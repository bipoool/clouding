import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'

// GET /api/blueprint/[id] - Get specific blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting blueprint ${id} for user: ${request.user.id}`)
    
    const blueprint = await backendClient.get(`/blueprints/${id}`, request)
    
    return NextResponse.json(blueprint)
  } catch (error) {
    logger.error('Error getting blueprint:', error)
    
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

// PUT /api/blueprint/[id] - Update specific blueprint
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Updating blueprint ${id} for user: ${request.user.id}`)
    
    const updatedBlueprint = await backendClient.put(`/blueprints/${id}`, body, request)
    
    return NextResponse.json(updatedBlueprint)
  } catch (error) {
    logger.error('Error updating blueprint:', error)
    
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

// DELETE /api/blueprint/[id] - Delete specific blueprint
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting blueprint ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/blueprints/${id}`, request)
    
    return NextResponse.json({ message: 'Blueprint deleted successfully' })
  } catch (error) {
    logger.error('Error deleting blueprint:', error)
    
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