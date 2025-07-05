import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { logger } from '@/lib/utils/logger'
import { convertExpiryToUTC, convertExpiryToClient } from '../../utils/date-helpers'

// GET /api/credentials/[id] - Get specific credential
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting credential ${id} for user: ${request.user.id}`)
    
    const credential = await backendClient.get(`/credentials/${id}`, request)
    convertExpiryToClient(credential)
    
    return NextResponse.json(credential)
  } catch (error) {
    logger.error('Error getting credential:', error)
    
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

// PUT /api/credentials/[id] - Update specific credential
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    convertExpiryToUTC(body)
    logger.info(`Updating credential ${id} for user: ${request.user.id}`)
    
    const updatedCredential = await backendClient.put(`/credentials/${id}`, body, request)
    convertExpiryToClient(updatedCredential)
    
    return NextResponse.json(updatedCredential)
  } catch (error) {
    logger.error('Error updating credential:', error)
    
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

// DELETE /api/credentials/[id] - Delete specific credential
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting credential ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/credentials/${id}`, request)
    
    return NextResponse.json({ message: 'Credential deleted successfully' })
  } catch (error) {
    logger.error('Error deleting credential:', error)
    
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