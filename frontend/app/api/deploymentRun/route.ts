import { NextRequest, NextResponse } from 'next/server'
import { validateSupabaseJWT } from '../auth/middleware'
import { logger } from '@/lib/utils/logger'

// POST /api/deploymentRun - Create deployment run (SSE)
export async function POST(request: NextRequest) {
  try {
    // Validate authentication first
    const { response: authError, user } = await validateSupabaseJWT(request)
    if (authError) {
      return authError
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.id || !body.deploymentPlanId) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'id and deploymentPlanId are required' },
        { status: 400 }
      )
    }

    logger.info(`Creating deployment run: ${String(body.id)} for authenticated user`)

    // Set up SSE response
    const responseStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          id: body.id,
          status: 'pending',
          progress: 0,
          message: 'Deployment run initialized',
          timestamp: new Date().toISOString()
        })}\n\n`))

        // TODO: MOCK IMPLEMENTATION - Replace with actual deployment run logic
        // This is a placeholder simulation using hardcoded logs and fixed progress increments.
        // In the future, this should integrate with the actual deployment orchestration system
        // to execute real deployment plans and provide genuine progress updates and logs.
        
        // Simulate deployment process
        let progress = 0
        const logs = [
          'Connecting to host...',
          'Downloading required components...',
          'Installing NGINX...',
          'Configuring services...',
          'Starting services...',
          'Deployment completed successfully!'
        ]

        const interval = setInterval(() => {
          progress += 20
          const status = progress === 100 ? 'completed' : 'running'
          
          const logIndex = Math.floor(progress / 20) - 1
          const currentLog = logIndex >= 0 && logIndex < logs.length ? logs[logIndex] : 'Deployment completed'

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            id: body.id,
            status: status,
            progress: progress,
            message: currentLog,
            logs: logs.slice(0, logIndex + 1),
            timestamp: new Date().toISOString()
          })}\n\n`))

          if (progress >= 100) {
            clearInterval(interval)
            request.signal.removeEventListener('abort', abortHandler)
            controller.close()
          }
        }, 2000)

        // Clean up if the client disconnects
        const abortHandler = () => {
          clearInterval(interval)
          controller.close()
        }

        // Listen for the abort event to trigger cleanup
        request.signal.addEventListener('abort', abortHandler)
      }
    })

    return new Response(responseStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } catch (error) {
    logger.error('Error creating deployment run:', error)
    
    return NextResponse.json(
      { error: 'Failed to create deployment run', message: 'An error occurred while creating the deployment run' },
      { status: 500 }
    )
  }
} 