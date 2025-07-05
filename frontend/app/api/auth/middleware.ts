import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/utils/logger'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name?: string
    avatar_url?: string
    provider?: string
    provider_id?: string
  }
}

/**
 * Extract user data from Supabase user object, handling provider-specific metadata
 * @param user Supabase user object
 * @returns Normalized user data
 */
function extractUserData(user: any) {
  const metadata = user.user_metadata || {}
  const identities = user.identities || []
  
  // Get the primary identity/provider
  const primaryIdentity = identities[0]
  const provider = primaryIdentity?.provider || 'email'
  
  // Provider-specific data extraction
  let name = ''
  let avatar_url = ''
  
  switch (provider) {
    case 'google':
      name = metadata.full_name || metadata.name || ''
      avatar_url = metadata.avatar_url || metadata.picture || ''
      break
    
    case 'github':
      name = metadata.full_name || metadata.name || metadata.user_name || ''
      avatar_url = metadata.avatar_url || ''
      break
    
    case 'discord':
      name = metadata.full_name || metadata.name || metadata.username || ''
      avatar_url = metadata.avatar_url || ''
      break
    
    default:
      // Fallback for other providers or email auth
      name = metadata.full_name || metadata.name || metadata.username || ''
      avatar_url = metadata.avatar_url || metadata.picture || ''
  }
  
  return {
    id: user.id,
    email: user.email || '',
    name,
    avatar_url,
    provider,
    provider_id: primaryIdentity?.id || user.id
  }
}

export async function validateSupabaseJWT(request: NextRequest): Promise<{ response: NextResponse | null; user: any }> {
  try {
    // Create a Supabase client for server-side validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // This is called from an API route, so we can't set cookies
            // but we need to provide this method for the client initialization
          }
        }
      }
    )

    // Get the user from the JWT token stored in cookies
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    if (error) {
      logger.error('Supabase auth error:', error)
      return {
        response: NextResponse.json(
          { error: 'Authentication error', details: error.message },
          { status: 401 }
        ),
        user: null
      }
    }

    if (!user) {
      return {
        response: NextResponse.json(
          { error: 'No authenticated user found' },
          { status: 401 }
        ),
        user: null
      }
    }

    // Extract and normalize user data for all providers
    const userData = extractUserData(user)
    
    logger.info(`User authenticated via ${userData.provider}: ${userData.email}`)

    return {
      response: null,
      user: userData
    }
  } catch (error) {
    logger.error('Error validating Supabase JWT:', error)
    return {
      response: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
      user: null
    }
  }
}

export function withAuth(handler: (request: AuthenticatedRequest, context?: any) => Promise<NextResponse | Response>) {
  return async (request: NextRequest, context?: any) => {
    const { response: authError, user } = await validateSupabaseJWT(request)
    
    if (authError) {
      return authError
    }
    
    // Add user information to the request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user
    
    return handler(authenticatedRequest, context)
  }
} 