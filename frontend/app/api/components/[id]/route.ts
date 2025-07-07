import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  Component, 
  ApiResponse, 
  ApiError 
} from '../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/components/:id - Get component by ID
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting component ${id} for user: ${request.user.id}`)
    
    const component = await backendClient.get(`/components/${id}`, request)
    
    return NextResponse.json(component)
  } catch (error) {
    return handleApiError(error, 'getting component')
  }
}) 