import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateBlueprintRequest, 
  Blueprint, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'

// GET /api/blueprint - Get all blueprints
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting blueprints for user: ${request.user.id}`)
    
    const blueprints = await backendClient.get(`/blueprints`, request)
    
    return NextResponse.json(blueprints)
  } catch (error) {
    logger.error('Error getting blueprints:', error)
    
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

// POST /api/blueprint - Create new blueprint
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info(`Creating blueprint for user: ${request.user.id}`)
    
    const newBlueprint = await backendClient.post(`/blueprints`, body, request)
    
    return NextResponse.json(newBlueprint, { status: 201 })
  } catch (error) {
    logger.error('Error creating blueprint:', error)
    
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

// PUT /api/blueprint - Update a blueprint
export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: any = await request.json()
    
    // Basic validation before forwarding to Go backend
    if (!body.id || !body.plan || !Array.isArray(body.plan) || body.plan.length === 0 || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'id, plan (non-empty array), and description are required' },
        { status: 400 }
      )
    }

    logger.info(`Updating blueprint: ${body.id} via Go backend`)
    
    const response = await backendClient.put('/blueprints', body, request)
    
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error updating blueprint:', error)
    
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