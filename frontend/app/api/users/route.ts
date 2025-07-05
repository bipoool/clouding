import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateUserRequest, 
  User, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/users - Get all users
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info('Getting users')
    
    const users = await backendClient.get(`/users`, request)
    
    return NextResponse.json(users)
  } catch (error) {
    logger.error('Error getting users:', error)
    
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

// POST /api/users - Create new user
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info('Creating user')
    
    const newUser = await backendClient.post(`/users`, body, request)
    
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    logger.error('Error creating user:', error)
    
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