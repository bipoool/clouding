import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { logger } from '@/lib/utils/logger'
import { backendClient } from '@/lib/backend-client'
import { convertExpiryToUTC, convertExpiryToClient } from '../utils/date-helpers'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/credentials - Get all credentials for authenticated user
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    logger.info(`Getting credentials for user: ${request.user.id}`)
    
    const credentials = await backendClient.get(`/credentials`, request)
    
    // map expiry on each credential back to local time
    if (Array.isArray(credentials)) {
      const convertedCredentials = (credentials as any[]).map(convertExpiryToClient)
      return NextResponse.json(convertedCredentials)
    } else {
      const convertedCredentials = convertExpiryToClient(credentials as any)
      return NextResponse.json(convertedCredentials)
    }
  } catch (error) {
    return handleApiError(error, 'getting credentials')
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
    const convertedCredential = convertExpiryToClient(newCredential as any)
    
    return NextResponse.json(convertedCredential, { status: 201 })
  } catch (error) {
    return handleApiError(error, 'creating credential')
  }
}) 