import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  DeploymentPlan, 
  ApiResponse, 
  ApiError 
} from '../../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/blueprints/:blueprintId/deploymentPlans - Get deployment plans by blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { blueprintId: string } }) => {
  try {
    const { blueprintId } = params
    logger.info(`Getting deployment plans for blueprint ${blueprintId} for user: ${request.user.id}`)
    
    const deploymentPlans = await backendClient.get(`/blueprints/${blueprintId}/deploymentPlans`, request)
    
    return NextResponse.json(deploymentPlans)
  } catch (error) {
    return handleApiError(error, 'getting deployment plans')
  }
}) 