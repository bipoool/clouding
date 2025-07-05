import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  UpdateHostRequest, 
  Host, 
  ApiResponse, 
  ApiError 
} from '../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/hosts/:id - Get host by ID
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting host ${id} for user: ${request.user.id}`)
    
    const host = await backendClient.get(`/hosts/${id}`, request)
    
    return NextResponse.json(host)
  } catch (error) {
    logger.error('Error getting host:', error)
    
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

// PUT /api/hosts/:id - Update host
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Updating host ${id} for user: ${request.user.id}`)
    
    const updatedHost = await backendClient.put(`/hosts/${id}`, body, request)
    
    return NextResponse.json(updatedHost)
  } catch (error) {
    logger.error('Error updating host:', error)
    
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

// DELETE /api/hosts/:id - Delete host
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting host ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hosts/${id}`, request)
    
    return NextResponse.json({ message: 'Host deleted successfully' })
  } catch (error) {
    logger.error('Error deleting host:', error)
    
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