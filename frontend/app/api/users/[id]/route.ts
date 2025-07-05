import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { 
  UpdateUserRequest, 
  User, 
  ApiResponse, 
  ApiError 
} from '../../types'

// GET /api/users/[id] - Get specific user
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting user ${id} for user: ${request.user.id}`)
    
    const user = await backendClient.get(`/users/${id}`, request)
    
    return NextResponse.json(user)
  } catch (error) {
    logger.error('Error getting user:', error)
    
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

// PUT /api/users/[id] - Update specific user
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    logger.info(`Updating user ${id} for user: ${request.user.id}`)
    
    const updatedUser = await backendClient.put(`/users/${id}`, body, request)
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    logger.error('Error updating user:', error)
    
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