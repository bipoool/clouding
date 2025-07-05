import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateHostRequest, 
  Host, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/hosts - Get all hosts for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting hosts for user: ${request.user.id}`)
    
    const hosts = await backendClient.get(`/hosts`, request)
    
    return NextResponse.json(hosts)
  } catch (error) {
    logger.error('Error getting hosts:', error)
    
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

// POST /api/hosts - Create new host
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info(`Creating host for user: ${request.user.id}`)
    
    const newHost = await backendClient.post(`/hosts`, body, request)
    
    return NextResponse.json(newHost, { status: 201 })
  } catch (error) {
    logger.error('Error creating host:', error)
    
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