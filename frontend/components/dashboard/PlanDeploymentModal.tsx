'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Server } from 'lucide-react'
import { useVMs } from '@/hooks/useVMs'
import { useDeploymentById, useDeploymentsByType } from '@/hooks/useDeployments'
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
  const { createDeployment } = useDeploymentsByType('plan')
  const [pollDeploymentId, setPollDeploymentId] = useState<string | null>(null)
  const { deployment, refresh } = useDeploymentById(pollDeploymentId || undefined)
  const [isWaiting, setIsWaiting] = useState(false)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const allOptions = useMemo(() => vms ?? [], [vms])
  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])

  const toggle = (id: string, value: boolean) => {
    setSelected(prev => ({ ...prev, [id]: value }))
  }

  const close = () => onOpenChange(false)

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
      // Call Create Deployment API via hook and print result
      const result = await createDeployment(payload)
      // eslint-disable-next-line no-console
      console.log('Create Plan result:', result)
      logger.info('Create Plan result', result)
      // Start polling for deployment status
      setPollDeploymentId(id)
      setIsWaiting(true)
    } catch (e) {
      logger.error('Failed to create deployment plan', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start/cleanup polling when deployment id OR modal visibility changes
  useEffect(() => {
    // If modal is closed, ensure polling is stopped
    if (!open) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
        setIsWaiting(false)
        setPollDeploymentId(null)
      }
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
    // Keep button disabled until completed or failed
    if (status === 'failed' || status === 'completed') {
      setIsWaiting(false)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [deployment?.status])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {!(deployment?.status === 'started' || deployment?.status === 'failed' || deployment?.status === 'completed') && (
          <div className='rounded-md border border-white/10'>
            <div className='px-3 py-2 border-b border-white/10 text-sm text-secondary flex items-center gap-2'>
              <Server className='h-4 w-4 text-cyan-400' />
              Available Hosts
            </div>
            <ScrollArea className='max-h-64'>
              <div className='p-3 space-y-2'>
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
            </ScrollArea>
          </div>
          )}

          {/* Deployment Logs Placeholder (shown once status transitions) */}
          {(deployment?.status === 'started' || deployment?.status === 'failed' || deployment?.status === 'completed') && (
            <div className='rounded-md border border-white/10'>
              <div className='px-3 py-2 border-b border-white/10 text-sm text-secondary flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-cyan-400'>Deployment Logs</span>
                </div>
                <div className='text-xs text-gray-400'>
                  ID: {pollDeploymentId}
                  <span className='mx-2'>•</span>
                  Status: <span className='capitalize'>{deployment?.status}</span>
                </div>
              </div>
              <ScrollArea className='h-72'>
                <div className='p-3 font-mono text-sm text-gray-200 whitespace-pre-wrap'>
                  Printing logs...
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
            <Button
              type='button'
              onClick={handleCreatePlan}
              disabled={selectedIds.length === 0 || isSubmitting || isWaiting}
              className='flex-1 gradient-border-btn'
            >
              {isSubmitting ? 'Creating...' : isWaiting ? 'Waiting...' : 'Create Plan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
