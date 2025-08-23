import { NextRequest, NextResponse } from 'next/server'
import { validateSupabaseJWT } from '../auth/middleware'
import { logger } from '@/lib/utils/logger'

interface DeploymentPlan {
  id: string
  hostId: string
  blueprintId: string
  status: 'pending' | 'planning' | 'ready' | 'error'
  createdAt: string
  updatedAt: string
}

// Mock data store - in production, this would be replaced with a database
const deploymentPlans: DeploymentPlan[] = []

// POST /api/deploymentPlan - Create deployment plan (SSE)
export async function POST(request: NextRequest) {
  try {
    // Validate authentication first
    const { response: authError, user } = await validateSupabaseJWT(request)
    if (authError) {
      return authError
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication failed - no user data' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.id || !body.hostId || !body.blueprintId) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'id, hostId, and blueprintId are required' },
        { status: 400 }
      )
    }

    logger.info(`Creating deployment plan: ${body.id} for user: ${user.id}`)

    // Check if deployment plan with same ID already exists
    const existingPlan = deploymentPlans.find(dp => dp.id === body.id)
    if (existingPlan) {
      return NextResponse.json(
        { error: 'Deployment plan already exists', message: `A deployment plan with ID ${body.id} already exists` },
        { status: 409 }
      )
    }

    // Create new deployment plan
    const newDeploymentPlan: DeploymentPlan = {
      id: body.id,
      hostId: body.hostId,
      blueprintId: body.blueprintId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    deploymentPlans.push(newDeploymentPlan)
    
    logger.info(`Created deployment plan: ${newDeploymentPlan.id}`)

    // Set up SSE response
    const responseStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        
        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          id: newDeploymentPlan.id,
          status: 'pending',
          message: 'Deployment plan created',
          timestamp: new Date().toISOString()
        })}\n\n`))

        // Simulate planning process
        setTimeout(() => {
          newDeploymentPlan.status = 'planning'
          newDeploymentPlan.updatedAt = new Date().toISOString()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            id: newDeploymentPlan.id,
            status: 'planning',
            message: 'Analyzing blueprint and host configuration',
            timestamp: new Date().toISOString()
          })}\n\n`))
        }, 1000)

        // Simulate completion
        setTimeout(() => {
          newDeploymentPlan.status = 'ready'
          newDeploymentPlan.updatedAt = new Date().toISOString()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            id: newDeploymentPlan.id,
            status: 'ready',
            message: 'Deployment plan ready for execution',
            timestamp: new Date().toISOString()
          })}\n\n`))
          
          controller.close()
        }, 3000)
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
    logger.error('Error creating deployment plan:', error)
    
    return NextResponse.json(
      { error: 'Failed to create deployment plan', message: 'An error occurred while creating the deployment plan' },
      { status: 500 }
    )
  }
} 