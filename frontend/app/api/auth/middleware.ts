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

// Interface for user metadata from different providers
interface SupabaseUserMetadata {
  full_name?: string
  name?: string
  user_name?: string
  username?: string
  avatar_url?: string
  picture?: string
  [key: string]: any // Allow additional provider-specific fields
}

// Interface for user identity/provider information
interface SupabaseUserIdentity {
  id: string
  provider: string
  user_id: string
  identity_data?: Record<string, any>
  last_sign_in_at?: string
  created_at?: string
  updated_at?: string
}

// Interface for Supabase user object
interface SupabaseUser {
  id: string
  email?: string
  phone?: string
  created_at?: string
  updated_at?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
  role?: string
  user_metadata?: SupabaseUserMetadata
  identities?: SupabaseUserIdentity[]
  app_metadata?: Record<string, any>
}

/**
 * Extract user data from Supabase user object, handling provider-specific metadata
 * @param user Supabase user object
 * @returns Normalized user data
 */
function extractUserData(user: SupabaseUser) {
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

export async function validateSupabaseJWT(request: NextRequest): Promise<{ response: NextResponse | null; user: AuthenticatedRequest['user'] | null }> {
  try {
    // Validate required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing required Supabase environment variables', {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey
      })
      return {
        response: NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        ),
        user: null
      }
    }

    // Create a Supabase client for server-side validation
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
    
    // This should never happen if validateSupabaseJWT works correctly,
    // but we check for type safety
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication failed - no user data' },
        { status: 401 }
      )
    }
    
    // Add user information to the request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user
    
    return handler(authenticatedRequest, context)
  }
} 