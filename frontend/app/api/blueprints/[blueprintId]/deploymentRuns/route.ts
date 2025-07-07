import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  DeploymentRun, 
  ApiResponse, 
  ApiError 
} from '../../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/blueprints/[blueprintId]/deploymentRuns - Get deployment runs for blueprint
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { blueprintId: string } }) => {
  try {
    const { blueprintId } = params

    // Validate blueprintId format (UUID or safe slug)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const safeSlugRegex = /^[a-zA-Z0-9-_]+$/
    
    if (!blueprintId || !(uuidRegex.test(blueprintId) || safeSlugRegex.test(blueprintId))) {
      return NextResponse.json(
        { error: 'Invalid blueprint ID format. Must be a valid UUID or safe slug (alphanumeric, dashes, underscores)' },
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
    return handleApiError(error, 'getting deployment runs')
  }
}) 