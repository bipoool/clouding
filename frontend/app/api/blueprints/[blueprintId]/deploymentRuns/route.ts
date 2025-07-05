import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  DeploymentRun, 
  ApiResponse, 
  ApiError 
} from '../../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/blueprints/[blueprintId]/deploymentRuns - Get deployment runs for blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { blueprintId: string } }) => {
  try {
    const { blueprintId } = params

    // Validate blueprintId format (assuming UUID or safe slug)
    if (!blueprintId || !/^[a-zA-Z0-9-_]+$/.test(blueprintId)) {
      return NextResponse.json(
        { error: 'Invalid blueprint ID format' },
        { status: 400 }
      )
    }

    logger.info(`Getting deployment runs for blueprint ${blueprintId}`)

    const deploymentRuns = await backendClient.get(
      `/blueprints/${blueprintId}/deploymentRuns`,
      request
    )
    return NextResponse.json(deploymentRuns)
  } catch (error) {
    logger.error('Error getting deployment runs:', error)
    
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