import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { convertExpiryToUTC, convertExpiryToClient } from '../../utils/date-helpers'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/credentials/[id] - Get specific credential
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting credential ${id} for user: ${request.user.id}`)
    
    const credential = await backendClient.get(`/credentials/${id}`, request)
    const convertedCredential = convertExpiryToClient(credential as any)
    
    return NextResponse.json(convertedCredential)
  } catch (error) {
    return handleApiError(error, 'getting credential')
  }
})

// PUT /api/credentials/[id] - Update specific credential
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    convertExpiryToUTC(body)
    logger.info(`Updating credential ${id} for user: ${request.user.id}`)
    
    const updatedCredential = await backendClient.put(`/credentials/${id}`, body, request)
    const convertedCredential = convertExpiryToClient(updatedCredential as any)
    
    return NextResponse.json(convertedCredential)
  } catch (error) {
    return handleApiError(error, 'updating credential')
  }
})

// DELETE /api/credentials/[id] - Delete specific credential
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting credential ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/credentials/${id}`, request)
    
    return NextResponse.json({ message: 'Credential deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'deleting credential')
  }
}) 