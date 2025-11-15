'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Server } from 'lucide-react'
import { useVMs } from '@/hooks/useVMs'
import { useComponents } from '@/hooks/useComponents'
import { useDeploymentById, useDeploymentsByType, useBlueprintDeployments } from '@/hooks/useDeployments'
import { logger } from '@/lib/utils/logger'

interface PlanDeploymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blueprintId: number
}

export function PlanDeploymentModal({ open, onOpenChange, blueprintId }: PlanDeploymentModalProps) {
  const { vms, isLoading } = useVMs()
  const { components } = useComponents()
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
  const [selectedHost, setSelectedHost] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const allOptions = useMemo(() => vms ?? [], [vms])
  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])

  // Parse logs into structured format
  const parsedLogs = useMemo(() => {
    const hostMap: Record<string, Record<string, Array<{
      task: string
      msg: string
      error: string
      duration: number
      changed: boolean
      event: string
    }>>> = {}

    logs.forEach(log => {
      try {
        const entry = JSON.parse(log)
        const { host, role, task, res, error, duration, event } = entry.data || {}

        if (!host) return

        // Use 'Others' if role is null/undefined/empty
        const roleKey = (role && role.trim() !== '') ? role : 'Other Logs'

        if (!hostMap[host]) {
          hostMap[host] = {}
        }

        if (!hostMap[host][roleKey]) {
          hostMap[host][roleKey] = []
        }

        hostMap[host][roleKey].push({
          task: task || '',
          msg: res?.msg || '',
          error: error || '',
          duration: duration || 0,
          changed: res?.changed || false,
          event: event || ''
        })
      } catch (e) {
        // Invalid JSON, skip
      }
    })

    return hostMap
  }, [logs])

  // Track failures per host and role
  const hostRoleStatus = useMemo(() => {
    const status: Record<string, {
      hasError: boolean
      hasSuccess: boolean
      roles: Record<string, { hasError: boolean; hasSuccess: boolean }>
    }> = {}

    logs.forEach(log => {
      try {
        const entry = JSON.parse(log)
        const { host, role, error, event, failures } = entry.data || {}

        if (!host) return

        if (!status[host]) {
          status[host] = { hasError: false, hasSuccess: false, roles: {} }
        }

        // Check for errors in this log entry
        const hasError = (error && error.trim() !== '') ||
                        event?.includes('failed') ||
                        event?.includes('unreachable')
        const isSuccess = event?.includes('ok') && !hasError

        if (hasError) {
          status[host].hasError = true
        }
        if (isSuccess) {
          status[host].hasSuccess = true
        }

        // Use 'Others' if role is null/undefined/empty
        const roleKey = (role && role.trim() !== '') ? role : 'Others'

        if (!status[host].roles[roleKey]) {
          status[host].roles[roleKey] = { hasError: false, hasSuccess: false }
        }

        if (hasError) {
          status[host].roles[roleKey].hasError = true
        }
        if (isSuccess) {
          status[host].roles[roleKey].hasSuccess = true
        }

        // Check failures object from stats event
        if (failures && typeof failures === 'object') {
          Object.keys(failures).forEach(hostId => {
            if (failures[hostId] > 0) {
              if (!status[hostId]) {
                status[hostId] = { hasError: true, hasSuccess: false, roles: {} }
              } else {
                status[hostId].hasError = true
              }
            }
          })
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    })

    return status
  }, [logs])

  // Create mappings for host IDs to names and roles to component display names
  const hostIdToName = useMemo(() => {
    const map: Record<string, string> = {}
    vms?.forEach(vm => {
      map[vm.id] = vm.name
    })
    return map
  }, [vms])

  const roleToDisplayName = useMemo(() => {
    const map: Record<string, string> = {}
    components?.forEach(comp => {
      map[comp.ansibleRole] = comp.displayName
    })
    return map
  }, [components])

  // Get unique hosts and roles
  const hosts = useMemo(() => Object.keys(parsedLogs), [parsedLogs])
  const roles = useMemo(() => {
    if (!selectedHost) return []
    return Object.keys(parsedLogs[selectedHost] || {})
  }, [parsedLogs, selectedHost])

  const messages = useMemo(() => {
    if (!selectedHost || !selectedRole) return []
    return parsedLogs[selectedHost]?.[selectedRole] || []
  }, [parsedLogs, selectedHost, selectedRole])

  // Helper functions to get display names
  const getHostName = (hostId: string) => hostIdToName[hostId] || `Host ${hostId}`
  const getRoleDisplayName = (role: string) => {
    if (role === 'Others') return 'Others'
    return roleToDisplayName[role] || role
  }

  // Helper functions to get status colors
  const getHostStatusColor = (hostId: string) => {
    const status = hostRoleStatus[hostId]
    if (!status) return 'text-gray-300'

    // Only show colors if deployment is completed or failed
    if (deployment?.status !== 'completed' && deployment?.status !== 'failed') {
      return 'text-gray-300'
    }

    if (status.hasError) return 'text-red-400'
    if (status.hasSuccess) return 'text-green-400'
    return 'text-gray-300'
  }

  const getRoleStatusColor = (hostId: string, role: string) => {
    const status = hostRoleStatus[hostId]
    if (!status || !status.roles[role]) return 'text-gray-300'

    // Only show colors if deployment is completed or failed
    if (deployment?.status !== 'completed' && deployment?.status !== 'failed') {
      return 'text-gray-300'
    }

    const roleStatus = status.roles[role]
    if (roleStatus.hasError) return 'text-red-400'
    if (roleStatus.hasSuccess) return 'text-green-400'
    return 'text-gray-300'
  }

  const getHostBorderColor = (hostId: string) => {
    const status = hostRoleStatus[hostId]
    if (!status) return ''

    // Only show colors if deployment is completed or failed
    if (deployment?.status !== 'completed' && deployment?.status !== 'failed') {
      return ''
    }

    if (status.hasError) return 'border-red-400/50'
    if (status.hasSuccess) return 'border-green-400/50'
    return ''
  }

  const getRoleBorderColor = (hostId: string, role: string) => {
    const status = hostRoleStatus[hostId]
    if (!status || !status.roles[role]) return ''

    // Only show colors if deployment is completed or failed
    if (deployment?.status !== 'completed' && deployment?.status !== 'failed') {
      return ''
    }

    const roleStatus = status.roles[role]
    if (roleStatus.hasError) return 'border-red-400/50'
    if (roleStatus.hasSuccess) return 'border-green-400/50'
    return ''
  }

  const getRoleBgColor = (hostId: string, role: string, isSelected: boolean) => {
    const status = hostRoleStatus[hostId]
    if (!status || !status.roles[role]) return isSelected ? 'bg-cyan-400/20' : 'bg-white/5'

    // Only show colors if deployment is completed or failed
    if (deployment?.status !== 'completed' && deployment?.status !== 'failed') {
      return isSelected ? 'bg-cyan-400/20' : 'bg-white/5'
    }

    const roleStatus = status.roles[role]
    if (isSelected) {
      if (roleStatus.hasError) return 'bg-red-400/20'
      if (roleStatus.hasSuccess) return 'bg-green-400/20'
      return 'bg-cyan-400/20'
    }

    if (roleStatus.hasError) return 'bg-red-400/10'
    if (roleStatus.hasSuccess) return 'bg-green-400/10'
    return 'bg-white/5'
  }

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
      setSelectedHost(null)
      setSelectedRole(null)
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
      setSelectedHost(null)
      setSelectedRole(null)
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
    setSelectedHost(null)
    setSelectedRole(null)
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
      setSelectedHost(null)
      setSelectedRole(null)
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

          {/* Deployment Logs with structured layout */}
          {view === 'logs' && (
            <div className='rounded-md border border-white/10 flex h-[60vh]'>
              {/* Left Panel - Hosts */}
              <div className='w-64 border-r border-white/10 flex flex-col bg-black/20'>
                <div className='px-4 py-3 border-b border-white/10'>
                  <div className='flex items-center gap-2'>
                    <Server className='h-4 w-4 text-cyan-400' />
                    <span className='text-sm font-semibold text-cyan-400'>Hosts</span>
                  </div>
                </div>
                <ScrollArea className='flex-1'>
                  <div className='p-3 space-y-2'>
                    {hosts.length > 0 ? (
                      hosts.map(host => {
                        const isSelected = selectedHost === host
                        const textColor = getHostStatusColor(host)
                        const borderColor = getHostBorderColor(host)
                        const baseBorder = 'border'
                        const finalBorder = borderColor || (isSelected ? 'border-cyan-400/50' : 'border-white/10')

                        // Determine background based on status
                        let bgClass = 'bg-white/5'
                        if (deployment?.status === 'completed' || deployment?.status === 'failed') {
                          const status = hostRoleStatus[host]
                          if (status?.hasError) {
                            bgClass = isSelected ? 'bg-red-400/20' : 'bg-red-400/10'
                          } else if (status?.hasSuccess) {
                            bgClass = isSelected ? 'bg-green-400/20' : 'bg-green-400/10'
                          } else {
                            bgClass = isSelected ? 'bg-cyan-400/20' : 'bg-white/5'
                          }
                        } else {
                          bgClass = isSelected ? 'bg-cyan-400/20' : 'bg-white/5'
                        }

                        return (
                          <button
                            key={host}
                            onClick={() => {
                              setSelectedHost(host)
                              setSelectedRole(null)
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${bgClass} ${textColor} ${baseBorder} ${finalBorder} backdrop-blur-sm hover:scale-[1.02] ${isSelected ? 'shadow-lg shadow-cyan-400/20' : 'hover:bg-white/10'}`}
                          >
                            <div className='flex items-center gap-2'>
                              <Server className={`h-3.5 w-3.5 ${textColor}`} />
                              <span className='font-medium truncate'>{getHostName(host)}</span>
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className='text-xs text-gray-500 p-3 text-center bg-white/5 rounded-lg border border-white/10'>
                        No hosts yet...
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel - Components and Messages */}
              <div className='flex-1 flex flex-col'>
                {/* Top Panel - Components */}
                {selectedHost && roles.length > 0 && (
                  <div className='border-b border-white/10'>
                    <div className='px-3 py-2 text-sm font-medium text-secondary'>
                      Components
                    </div>
                    <ScrollArea className='max-h-32'>
                      <div className='p-2 flex flex-wrap gap-2'>
                        {roles.map(role => {
                          const isSelected = selectedRole === role
                          const textColor = getRoleStatusColor(selectedHost!, role)
                          const bgColor = getRoleBgColor(selectedHost!, role, isSelected)
                          const borderColor = getRoleBorderColor(selectedHost!, role)
                          const baseBorder = 'border'
                          const finalBorder = borderColor || (isSelected ? 'border-cyan-400/50' : '')

                          return (
                            <button
                              key={role}
                              onClick={() => setSelectedRole(role)}
                              className={`px-3 py-1.5 rounded text-sm transition-colors ${bgColor} ${textColor} ${baseBorder} ${finalBorder} ${!isSelected ? 'hover:bg-white/10' : ''}`}
                            >
                              {getRoleDisplayName(role)}
                            </button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Main Content - Messages */}
                <div className='flex-1 flex flex-col min-h-0'>
                  <div className='px-3 py-2 border-b border-white/10 text-sm text-secondary flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-cyan-400'>
                        {selectedRole ? `${getRoleDisplayName(selectedRole)} Tasks` : 'Deployment Logs'}
                      </span>
                    </div>
                    <div className='text-xs text-gray-400'>
                      ID: {activeDeploymentId ?? 'N/A'}
                      <span className='mx-2'>•</span>
                      Status: <span className='capitalize'>{deployment?.status}</span>
                    </div>
                  </div>
                  <ScrollArea className='flex-1'>
                    <div className='p-3'>
                      {selectedHost && selectedRole && messages.length > 0 ? (
                        <div className='space-y-2'>
                          {messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className='p-3 rounded bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors'
                            >
                              {msg.task && (
                                <div className='flex items-start justify-between mb-2'>
                                  <div className='font-medium text-sm text-white flex-1'>
                                    {msg.task}
                                  </div>
                                  {msg.duration > 0 && (
                                    <div className='text-xs text-gray-400 ml-2'>
                                      {msg.duration.toFixed(2)}s
                                    </div>
                                  )}
                                </div>
                              )}
                              {msg.msg && (
                                <div className='text-sm text-gray-300 mb-1 whitespace-pre-wrap'>
                                  {msg.msg}
                                </div>
                              )}
                              {msg.error && (
                                <div className='text-sm text-red-400 whitespace-pre-wrap'>
                                  Error: {msg.error}
                                </div>
                              )}
                              <div className='flex items-center gap-3 mt-2'>
                                {msg.changed && (
                                  <div className='text-xs px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-400 border border-yellow-400/50'>
                                    Changed
                                  </div>
                                )}
                                {msg.event && (
                                  <div className='text-xs text-gray-500'>
                                    {msg.event}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-sm text-gray-400 text-center py-8'>
                          {!selectedHost
                            ? 'Select a host from the left panel to view logs'
                            : !selectedRole
                            ? 'Select a component to view task details'
                            : 'No tasks available for this component'}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
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
                    {isDeploying ? 'Deploying...' : (deployment?.type === 'deploy' && deployment?.status === 'completed' ? 'Re-Deploy' : 'Deploy')}
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
