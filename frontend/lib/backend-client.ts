import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { logger } from '@/lib/utils/logger'


export interface BackendClientOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  body?: any
  headers?: Record<string, string>
}

export interface BackendResponse<T = any> {
  data: T
  status: number
  statusText: string
}

export class BackendClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'BackendClientError'
  }
}

export class BackendClient {
  private static instance: BackendClient
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.BACKEND_URL as string
  }

  public static getInstance(): BackendClient {
    if (!BackendClient.instance) {
      BackendClient.instance = new BackendClient()
    }
    return BackendClient.instance
  }

  private async getSupabaseAccessToken(request: NextRequest): Promise<string | null> {
    try {
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

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        logger.error('Error getting Supabase session:', error)
        return null
      }

      return session?.access_token || null
    } catch (error) {
      logger.error('Error extracting Supabase access token:', error)
      return null
    }
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: string
      body?: any
      headers?: Record<string, string>
      request?: NextRequest
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, request } = options
    
    const url = `${this.baseUrl}${endpoint}`
    logger.info(`Making ${method} request to: ${url}`)

    // Get the JWT token from Supabase session if request is provided
    let authToken = null
    if (request) {
      authToken = await this.getSupabaseAccessToken(request)
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        let errorDetails = null
        
        try {
          const errorData = await response.json()
          errorDetails = errorData
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // If we can't parse the error response, use the default message
        }
        
        logger.error(`Backend request failed: ${errorMessage}`, {
          url,
          status: response.status,
          details: errorDetails
        })
        
        throw new BackendClientError(errorMessage, response.status, errorDetails)
      }

      const data = await response.json()
      logger.info(`Backend request successful: ${method} ${endpoint}`)
      return data
    } catch (error) {
      if (error instanceof BackendClientError) {
        throw error
      }
      
      logger.error('Backend request error:', error)
      throw new BackendClientError(
        'Failed to communicate with backend service',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
  }

  async get<T>(endpoint: string, request?: NextRequest): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', request })
  }

  async post<T>(endpoint: string, body?: any, request?: NextRequest): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, request })
  }

  async put<T>(endpoint: string, body?: any, request?: NextRequest): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, request })
  }

  async delete<T>(endpoint: string, request?: NextRequest): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', request })
  }
}

// Export singleton instance
export const backendClient = BackendClient.getInstance() 