import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

/**
 * Validates if a redirect path is safe and internal
 * @param path - The path to validate
 * @returns true if the path is safe for internal redirect
 */
function isValidInternalPath(path: string): boolean {
  // Check if path is a string and starts with '/'
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return false
  }
  
  // Check if path starts with '//' which could be a protocol-relative URL
  if (path.startsWith('//')) {
    return false
  }
  
  // Check if path contains protocols (http://, https://, etc.)
  if (path.includes('://')) {
    return false
  }
  
  return true
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const nextParam = requestUrl.searchParams.get('next')
  
  // Validate the redirect path and use it only if it's safe
  const redirectTo = nextParam && isValidInternalPath(nextParam) ? nextParam : '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        logger.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth?error=auth_error`)
      }

      // Successful authentication, redirect to dashboard or specified redirect
      return NextResponse.redirect(`${origin}${redirectTo}`)
    } catch (error) {
      logger.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/auth?error=server_error`)
    }
  }

  // No code found, redirect back to auth with error
  return NextResponse.redirect(`${origin}/auth?error=no_code`)
} 