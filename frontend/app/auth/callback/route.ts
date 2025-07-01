import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth?error=auth_error`)
      }

      // Successful authentication, redirect to dashboard or specified redirect
      return NextResponse.redirect(`${origin}${redirectTo}`)
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/auth?error=server_error`)
    }
  }

  // No code found, redirect back to auth with error
  return NextResponse.redirect(`${origin}/auth?error=no_code`)
} 