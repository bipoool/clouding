import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  CreateCredentialRequest, 
  Credential, 
  ApiResponse, 
  ApiError 
} from '../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { convertExpiryToUTC, convertExpiryToClient } from '../utils/date-helpers'

// GET /api/credentials - Get all credentials for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting credentials for user: ${request.user.id}`)
    
    const credentials = await backendClient.get(`/credentials`, request)
    
    // map expiry on each credential back to local time
    if (Array.isArray(credentials)) {
      credentials.forEach(convertExpiryToClient)
    } else {
      convertExpiryToClient(credentials)
    }
    
    return NextResponse.json(credentials)
  } catch (error) {
    logger.error('Error getting credentials:', error)
    
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

// POST /api/credentials - Create new credential
export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json()
    logger.info(`Creating credential for user: ${request.user.id}`)
    
    // normalise expiry to UTC ISO before forwarding
    convertExpiryToUTC(body)
    
    const newCredential = await backendClient.post(`/credentials`, body, request)
    
    // convert expiry back to local for the client
    convertExpiryToClient(newCredential)
    
    return NextResponse.json(newCredential, { status: 201 })
  } catch (error) {
    logger.error('Error creating credential:', error)
    
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