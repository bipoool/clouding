import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  Blueprint, 
  ApiResponse, 
  ApiError 
} from '../../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// POST /api/blueprint/[id]/clone - Clone specific blueprint
export const POST = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    // Validate id format
    if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid blueprint ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields in body if needed
    // Example: if (body.name && typeof body.name !== 'string') { ... }

    logger.info(`Cloning blueprint ${id}`)

    const clonedBlueprint = await backendClient.post(
      `/blueprints/${id}/clone`,
      body,
      request
    )
    
    return NextResponse.json(clonedBlueprint, { status: 201 })
  } catch (error) {
    logger.error('Error cloning blueprint:', error)
    
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