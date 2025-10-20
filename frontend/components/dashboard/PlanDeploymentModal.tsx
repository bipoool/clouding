'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Server } from 'lucide-react'
import { useVMs } from '@/hooks/useVMs'
import { useDeploymentById, useDeploymentsByType, useBlueprintDeployments } from '@/hooks/useDeployments'
import { logger } from '@/lib/utils/logger'

interface PlanDeploymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blueprintId: number
}

export function PlanDeploymentModal({ open, onOpenChange, blueprintId }: PlanDeploymentModalProps) {
  const { vms, isLoading } = useVMs()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createDeployment: createPlanDeployment } = useDeploymentsByType('plan')
  const { createDeployment: createDeployDeployment } = useDeploymentsByType('deploy')
  const [pollDeploymentId, setPollDeploymentId] = useState<string | null>(null)
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(null)
  const { deployment, refresh } = useDeploymentById(pollDeploymentId || undefined)
  const [isWaiting, setIsWaiting] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const { fetchBlueprintDeployments, loading: isCheckingExisting } = useBlueprintDeployments()
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sseRef = useRef<EventSource | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [view, setView] = useState<'selection' | 'logs'>('selection')

  const allOptions = useMemo(() => vms ?? [], [vms])
  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])

  const toggle = (id: string, value: boolean) => {
    setSelected(prev => ({ ...prev, [id]: value }))
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      setPollDeploymentId(null)
      setActiveDeploymentId(null)
      setLogs([])
      setSelected({})
      setIsWaiting(false)
      setIsDeploying(false)
      setView('selection')
    }
    onOpenChange(v)
  }

  const close = () => handleOpenChange(false)

  const handleCreatePlan = async () => {
    // Validate blueprintId before any async work or state toggles
    if (!Number.isFinite(blueprintId) || blueprintId <= 0) {
      logger.warn('Cannot create plan: invalid or missing blueprintId', { blueprintId })
      // Light user feedback via existing flow
      if (typeof window !== 'undefined') {
        alert('Please save your configuration to create a blueprint before planning.')
      }
      return
    }
    try {
      setIsSubmitting(true)
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const hostIds = selectedIds
        .map(id => (Number.isFinite(Number(id)) ? Number(id) : id))
        .filter(v => typeof v === 'number') as number[]

      const payload = { id, hostIds, blueprintId }
      setActiveDeploymentId(id)
      // Call Create Deployment API via hook and print result
      const result = await createPlanDeployment(payload)
      // eslint-disable-next-line no-console
      console.log('Create Plan result:', result)
      logger.info('Create Plan result', result)
      // Start polling for deployment status
      setPollDeploymentId(id)
      setIsWaiting(true)
    } catch (e) {
      logger.error('Failed to create deployment plan', e)
      setActiveDeploymentId(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) return
    if (!Number.isFinite(blueprintId) || blueprintId <= 0) return

    let cancelled = false

    const fetchExistingDeployment = async () => {
      try {
        const list = await fetchBlueprintDeployments(blueprintId)
        if (cancelled) return

        const existing = list.find(
          item => (item.status === 'pending' || item.status === 'started')
        )

        if (!existing) return

        logger.info('Found active plan deployment for blueprint', { blueprintId, deploymentId: existing.id })
        setSelected({})
        setActiveDeploymentId(existing.id)
        setPollDeploymentId(existing.id)
        setIsWaiting(true)
      } catch (err) {
        if (cancelled) return
        logger.error('Failed to fetch blueprint deployments', err)
      }
    }

    fetchExistingDeployment()

    return () => {
      cancelled = true
    }
  }, [blueprintId, open, fetchBlueprintDeployments])

  // Start/cleanup polling when deployment id OR modal visibility changes
  useEffect(() => {
    // If modal is closed, ensure polling is stopped
    if (!open) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
      setIsWaiting(false)
      setPollDeploymentId(null)
      setActiveDeploymentId(null)
      setLogs([])
      setSelected({})
      setView('selection')
      return
    }

    if (!pollDeploymentId) return

    // Immediate fetch
    refresh()
    // Clear any previous interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    // Start polling every 3s
    pollIntervalRef.current = setInterval(() => {
      refresh()
    }, 3000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [open, pollDeploymentId, refresh])

  // Stop polling when status becomes started or failed
  useEffect(() => {
    const status = deployment?.status
    if (!status) return
    // Always stop polling once status leaves pending
    if (status !== 'pending') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      // Start SSE stream once we move out of pending and no stream is active yet
      if (pollDeploymentId) {
        try {
          const sse = new EventSource(`/api/deployments/progress/${encodeURIComponent(pollDeploymentId)}`)
          console.log("ENDPOINT", `/api/deployments/progress/${encodeURIComponent(pollDeploymentId)}`)
          sseRef.current = sse
          setLogs([])
          sse.addEventListener('logs', (ev: MessageEvent) => {
            const data = (ev && typeof ev.data === 'string') ? ev.data : ''
            setLogs(prev => [...prev, data + "\n"])
          })
          sse.addEventListener('error', (ev: MessageEvent) => {
            const data = (ev && typeof ev.data === 'string') ? ev.data : ''
            setLogs(prev => [...prev, data + "\n"])
          })
          const closeAndRefresh = async () => {
            try { await refresh() } catch { }
            if (sseRef.current) {
              sseRef.current.close()
              sseRef.current = null
            }
            // Reset deployment UUID to be ready for next deployment
            setPollDeploymentId(null)
          }
          sse.addEventListener('end', closeAndRefresh)
          sse.addEventListener('error', closeAndRefresh)
        } catch (e) {
          logger.error('Failed to open SSE for deployment logs', e)
        }
      }
      if (activeDeploymentId) {
        setView('logs')
      }
    }
    // Keep the button disabled until completed or failed
    if ((status === 'failed' || status === 'completed')) {
      setIsWaiting(false)
    }
  }, [activeDeploymentId, deployment?.status])

  const handleBackToSelection = () => {
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    setPollDeploymentId(null)
    setActiveDeploymentId(null)
    setLogs([])
    setSelected({})
    setIsWaiting(false)
    setIsDeploying(false)
    setView('selection')
  }

  const canGoBack = view === 'logs' && (deployment?.status === 'completed' || deployment?.status === 'failed')
  const isPlanSuccessful = deployment?.status === 'completed'

  const handleDeploy = async () => {
    logger.info('Deploy button clicked after successful plan', {
      deploymentId: activeDeploymentId,
      status: deployment?.status,
    })
    if (!Number.isFinite(blueprintId) || blueprintId <= 0) {
      logger.warn('Cannot deploy: invalid or missing blueprintId', { blueprintId })
      if (typeof window !== 'undefined') {
        alert('Please save your configuration to create a blueprint before deploying.')
      }
      return
    }

    const selectedHostIds = selectedIds
      .map(id => (Number.isFinite(Number(id)) ? Number(id) : id))
      .filter(v => typeof v === 'number') as number[]
    const deploymentHostIds = Array.isArray(deployment?.hostIds) ? deployment.hostIds.filter(id => typeof id === 'number') : []
    const hostIds = selectedHostIds.length > 0 ? selectedHostIds : deploymentHostIds

    if (hostIds.length === 0) {
      logger.warn('Cannot deploy: no hostIds available from selection or plan deployment')
      if (typeof window !== 'undefined') {
        alert('Cannot deploy: no hosts selected.')
      }
      return
    }

    try {
      setIsDeploying(true)
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const payload = { id, hostIds, blueprintId }
      setActiveDeploymentId(id)
      const result = await createDeployDeployment(payload)
      // eslint-disable-next-line no-console
      console.log('Deploy result:', result)
      logger.info('Deploy result', result)
      setPollDeploymentId(id)
      setIsWaiting(true)
      setLogs([])
      setView('logs')
    } catch (e) {
      logger.error('Failed to create deployment', e)
      setActiveDeploymentId(null)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='bg-black/90 backdrop-blur-md border border-white/10 max-w-4xl w-[90vw]'>
        <DialogHeader>
          <DialogTitle className='text-primary flex items-center gap-2'>
            <Play className='h-5 w-5 text-cyan-400' />
            Plan Deployment
          </DialogTitle>
          <DialogDescription className='text-secondary'>
            Select one or more hosts to include in the plan.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Hide host list once logs are visible */}
          {view === 'selection' && (
            <div className='rounded-md border border-white/10'>
              <div className='px-3 py-2 border-b border-white/10 text-sm text-secondary flex items-center gap-2'>
                <Server className='h-4 w-4 text-cyan-400' />
                Available Hosts
              </div>
              <div className='max-h-[60vh] overflow-y-auto p-2'>
                {isLoading && (
                  <div className='text-sm text-secondary'>Loading hosts...</div>
                )}
                {!isLoading && allOptions.length === 0 && (
                  <div className='text-sm text-secondary'>No hosts found.</div>
                )}
                {!isLoading && allOptions.map(vm => (
                  <label key={vm.id} className='flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer'>
                    <Checkbox
                      checked={!!selected[vm.id]}
                      onCheckedChange={v => toggle(vm.id, Boolean(v))}
                    />
                    <div className='flex-1'>
                      <div className='text-sm text-white'>{vm.name}</div>
                      <div className='text-xs text-secondary'>{vm.ip} • {vm.os}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Deployment Logs Placeholder (shown once status transitions) */}
          {view === 'logs' && (
            <div className='rounded-md border border-white/10'>
              <div className='px-3 py-2 border-b border-white/10 text-sm text-secondary flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-cyan-400'>Deployment Logs</span>
                </div>
                <div className='text-xs text-gray-400'>
                  ID: {activeDeploymentId ?? 'N/A'}
                  <span className='mx-2'>•</span>
                  Status: <span className='capitalize'>{deployment?.status}</span>
                </div>
              </div>
              <ScrollArea className='h-72'>
                <div className='p-3 font-mono text-sm text-gray-200 whitespace-pre-wrap break-all overflow-x-hidden'>
                  {logs.length > 0 ? logs.join('\n') : '....'}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={close}
              className='flex-1 glass-btn'
            >
              Cancel
            </Button>
            {view === 'selection' ? (
              <Button
                type='button'
                onClick={handleCreatePlan}
                disabled={selectedIds.length === 0 || isSubmitting || isWaiting || isCheckingExisting}
                className='flex-1 gradient-border-btn'
              >
                {isSubmitting
                  ? 'Creating...'
                  : isCheckingExisting
                    ? 'Checking...'
                    : isWaiting
                      ? 'Waiting...'
                      : 'Create Plan'}
              </Button>
            ) : canGoBack ? (
              <>
                <Button
                  type='button'
                  onClick={handleBackToSelection}
                  className='flex-1 gradient-border-btn'
                >
                  Back to Hosts
                </Button>
                {(
                  <Button
                    type='button'
                    onClick={handleDeploy}
                    className='flex-1 gradient-border-btn'
                    disabled={!isPlanSuccessful || isDeploying || isWaiting}
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy'}
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
