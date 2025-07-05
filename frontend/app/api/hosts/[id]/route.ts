import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/app/api/auth/middleware'
import { 
  UpdateHostRequest, 
  Host, 
  ApiResponse, 
  ApiError 
} from '../../types'
import { logger } from '@/lib/utils/logger'
import { backendClient, BackendClientError } from '@/lib/backend-client'
import { handleApiError } from '@/app/api/utils/error-handler'

// GET /api/hosts/:id - Get host by ID
export const GET = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Getting host ${id} for user: ${request.user.id}`)
    
    const host = await backendClient.get(`/hosts/${id}`, request)
    
    return NextResponse.json(host)
  } catch (error) {
    return handleApiError(error, 'getting host')
  }
})

// Validation function for UpdateHostRequest
function validateUpdateHostRequest(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isValid: false, error: 'Request body must be a valid object' }
  }

  // Check if at least one field is provided
  const validFields = ['name', 'ip', 'os', 'credentialId', 'metaData']
  const providedFields = Object.keys(body).filter(key => validFields.includes(key))
  
  if (providedFields.length === 0) {
    return { isValid: false, error: 'At least one field (name, ip, os, credentialId, metaData) must be provided' }
  }

  // Validate individual fields if present
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
    return { isValid: false, error: 'name must be a non-empty string' }
  }

  if (body.ip !== undefined) {
    if (typeof body.ip !== 'string' || body.ip.trim() === '') {
      return { isValid: false, error: 'ip must be a non-empty string' }
    }
    // Basic IP validation (IPv4 pattern)
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(body.ip)) {
      return { isValid: false, error: 'ip must be a valid IPv4 address' }
    }
  }

  if (body.os !== undefined && (typeof body.os !== 'string' || body.os.trim() === '')) {
    return { isValid: false, error: 'os must be a non-empty string' }
  }

  if (body.credentialId !== undefined && (typeof body.credentialId !== 'string' || body.credentialId.trim() === '')) {
    return { isValid: false, error: 'credentialId must be a non-empty string' }
  }

  if (body.metaData !== undefined) {
    if (typeof body.metaData !== 'object' || Array.isArray(body.metaData)) {
      return { isValid: false, error: 'metaData must be an object' }
    }
    if (body.metaData.tag !== undefined) {
      if (typeof body.metaData.tag !== 'object' || Array.isArray(body.metaData.tag)) {
        return { isValid: false, error: 'metaData.tag must be an object' }
      }
      // Validate that tag values are strings
      for (const [key, value] of Object.entries(body.metaData.tag)) {
        if (typeof value !== 'string') {
          return { isValid: false, error: `metaData.tag.${key} must be a string` }
        }
      }
    }
  }

  return { isValid: true }
}

// PUT /api/hosts/:id - Update host
export const PUT = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validate request body
    const validation = validateUpdateHostRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', message: validation.error },
        { status: 400 }
      )
    }
    
    logger.info(`Updating host ${id} for user: ${request.user.id}`)
    
    const updatedHost = await backendClient.put(`/hosts/${id}`, body, request)
    
    return NextResponse.json(updatedHost)
  } catch (error) {
    return handleApiError(error, 'updating host')
  }
})

// DELETE /api/hosts/:id - Delete host
export const DELETE = withAuth(async (request: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    logger.info(`Deleting host ${id} for user: ${request.user.id}`)
    
    await backendClient.delete(`/hosts/${id}`, request)
    
    return NextResponse.json({ message: 'Host deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'deleting host')
  }
}) 