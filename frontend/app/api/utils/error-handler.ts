import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { BackendClientError } from '@/lib/backend-client'

/**
 * Shared error handling utility function for API routes
 * @param error - The caught error object
 * @param context - Description of the operation being performed (e.g., 'getting blueprints')
 * @returns NextResponse with appropriate error status and message
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  logger.error(`Error ${context}:`, error)
  
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