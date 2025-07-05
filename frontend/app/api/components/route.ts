import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  Component, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/components - Get all components
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting components for user: ${request.user.id}`)
    
    const components = await backendClient.get(`/components`, request)
    
    return NextResponse.json(components)
  } catch (error) {
    logger.error('Error getting components:', error)
    
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