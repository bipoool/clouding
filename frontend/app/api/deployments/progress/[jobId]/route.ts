import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const jobId = params.jobId
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Missing jobId' }), { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!backendUrl || !supabaseUrl || !supabaseAnonKey) {
      logger.error('Missing BACKEND_URL or Supabase env vars')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }

    // Retrieve access token from Supabase session
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // not needed for route handlers
        }
      }
    })

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session?.access_token) {
      logger.error('SSE proxy auth error', error)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const url = `${backendUrl}/deployments/progress/${encodeURIComponent(jobId)}`
    const res = await fetch(url, {
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${session.access_token}`,
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => '')
      logger.error('SSE backend error', { status: res.status, text })
      return new Response(JSON.stringify({ error: 'Upstream error', status: res.status }), { status: 502 })
    }

    // Stream back to the client
    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })
  } catch (err) {
    logger.error('SSE proxy route error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

