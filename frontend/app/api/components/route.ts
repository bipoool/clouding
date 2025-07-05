import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  Component, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/components - Get all components
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting components for user: ${request.user.id}`)
    
    const components = await backendClient.get(`/components`, request)
    
    return NextResponse.json(components)
  } catch (error) {
    return handleApiError(error, 'getting components')
  }
}) 