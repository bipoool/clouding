import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateHostGroupRequest, 
  UpdateHostGroupRequest,
  HostGroup, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/hostGroup - Get all host groups
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting host groups for user: ${request.user.id}`)
    
    const hostGroups = await backendClient.get(`/hostGroups`, request)
    
    return NextResponse.json(hostGroups)
  } catch (error) {
    logger.error('Error getting host groups:', error)
    
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

// POST /api/hostGroup - Create new host group
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info(`Creating host group for user: ${request.user.id}`)
    
    const newHostGroup = await backendClient.post(`/hostGroups`, body, request)
    
    return NextResponse.json(newHostGroup, { status: 201 })
  } catch (error) {
    logger.error('Error creating host group:', error)
    
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

// PUT /api/hostGroup - Update a host group
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: any = await request.json()
    
    // Basic validation before forwarding to Go backend
    if (!body.id || !body.name || !body.userId || !body.hosts || !Array.isArray(body.hosts)) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'id, name, userId, and hosts (array) are required' },
        { status: 400 }
      )
    }

    logger.info(`Updating host group: ${body.id} via Go backend`)
    
    const response = await backendClient.put('/hostGroups', body, request)
    
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error updating host group:', error)
    
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