import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  Plus,
  Server,
  Activity,
  Clock,
  Settings,
  TrendingUp,
  Database,
  Globe,
  Zap,
} from 'lucide-react'

const infraGroups = [
  {
    id: 1,
    name: 'Production API',
    vmCount: 5,
    status: 'Live',
    lastUpdated: '2 hours ago',
    type: 'Web Services',
    health: 98,
    gradient: 'from-green-500/20 via-emerald-500/10 to-green-600/5',
    borderGradient: 'from-green-400/50 to-emerald-500/30',
  },
  {
    id: 2,
    name: 'Analytics Pipeline',
    vmCount: 3,
    status: 'Pending',
    lastUpdated: '1 day ago',
    type: 'Data Processing',
    health: 85,
    gradient: 'from-yellow-500/20 via-orange-500/10 to-yellow-600/5',
    borderGradient: 'from-yellow-400/50 to-orange-500/30',
  },
  {
    id: 3,
    name: 'Development Environment',
    vmCount: 2,
    status: 'Live',
    lastUpdated: '5 minutes ago',
    type: 'Development',
    health: 92,
    gradient: 'from-blue-500/20 via-cyan-500/10 to-blue-600/5',
    borderGradient: 'from-blue-400/50 to-cyan-500/30',
  },
  {
    id: 4,
    name: 'Database Cluster',
    vmCount: 4,
    status: 'Live',
    lastUpdated: '30 minutes ago',
    type: 'Database',
    health: 99,
    gradient: 'from-purple-500/20 via-violet-500/10 to-purple-600/5',
    borderGradient: 'from-purple-400/50 to-violet-500/30',
  },
]

const stats = [
  {
    name: 'Total VMs',
    value: '14',
    change: '+2',
    icon: Server,
    gradient: 'from-cyan-500/20 to-blue-500/10',
    iconColor: 'text-cyan-400',
    changeColor: 'text-green-400',
  },
  {
    name: 'Active Groups',
    value: '4',
    change: '+1',
    icon: Activity,
    gradient: 'from-green-500/20 to-emerald-500/10',
    iconColor: 'text-green-400',
    changeColor: 'text-green-400',
  },
  {
    name: 'Avg Health',
    value: '93.5%',
    change: '+1.2%',
    icon: TrendingUp,
    gradient: 'from-purple-500/20 to-violet-500/10',
    iconColor: 'text-purple-400',
    changeColor: 'text-green-400',
  },
  {
    name: 'Uptime',
    value: '99.9%',
    change: '0%',
    icon: Globe,
    gradient: 'from-pink-500/20 to-rose-500/10',
    iconColor: 'text-pink-400',
    changeColor: 'text-gray-400',
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* Welcome Header */}
        <div className='glass-card'>
          <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold text-primary mb-2 font-jetbrains'>
                Infrastructure Overview
              </h1>
              <p className='text-lg text-gray-200'>
                Monitor and manage your cloud infrastructure deployments across
                all environments.
              </p>
            </div>
            <Link href='/dashboard/create' className='interactive-element'>
              <Button className='gradient-border-btn px-6 py-3'>
                <Plus className='h-5 w-5 mr-2' />
                Deploy Infrastructure
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats & Actions Combined Card */}
        <div className='glass-card'>
          {/* Stats Grid */}
          <div className='mb-8'>
            <h3 className='text-2xl font-bold text-primary mb-6'>
              Infrastructure Metrics
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {stats.map(stat => (
                <div
                  key={stat.name}
                  className='bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 group hover:bg-white/10 transition-all duration-300'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-secondary mb-1'>
                        {stat.name}
                      </p>
                      <p className='text-3xl font-bold text-primary mb-2'>
                        {stat.value}
                      </p>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-sm font-semibold ${stat.changeColor}`}
                        >
                          {stat.change}
                        </span>
                        <span className='text-xs text-secondary'>
                          vs last month
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}
                    >
                      <stat.icon
                        className={`h-6 w-6 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className='border-t border-white/10 mb-8'></div>

          {/* Quick Actions */}
          <div>
            <h3 className='text-2xl font-bold text-primary mb-6'>
              Deployment Actions
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Link href='/dashboard/create' className='interactive-element'>
                <Button
                  variant='ghost'
                  className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
                >
                  <div className='p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 mr-4'>
                    <Plus className='h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform' />
                  </div>
                  <div>
                    <div className='font-semibold text-primary text-lg mb-1'>
                      New Deployment
                    </div>
                    <div className='text-sm text-secondary'>
                      Deploy infrastructure from templates
                    </div>
                  </div>
                </Button>
              </Link>

              <Button
                variant='ghost'
                className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element transition-all duration-300'
              >
                <div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 mr-4'>
                  <Activity className='h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform' />
                </div>
                <div>
                  <div className='font-semibold text-primary text-lg mb-1'>
                    Monitor Resources
                  </div>
                  <div className='text-sm text-secondary'>
                    View logs, metrics, and health status
                  </div>
                </div>
              </Button>

              <Link href='/dashboard/settings' className='interactive-element'>
                <Button
                  variant='ghost'
                  className='h-auto p-6 text-left justify-start bg-white/5 hover:bg-white/10 border border-white/10 group interactive-element w-full transition-all duration-300'
                >
                  <div className='p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 mr-4'>
                    <Settings className='h-6 w-6 text-pink-400 group-hover:scale-110 transition-transform' />
                  </div>
                  <div>
                    <div className='font-semibold text-primary text-lg mb-1'>
                      Infrastructure Settings
                    </div>
                    <div className='text-sm text-secondary'>
                      Configure environments and resources
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Infrastructure Groups */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-primary mb-2'>
                Active Deployments
              </h2>
              <p className='text-secondary'>
                Monitor resource groups and service health across environments
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {infraGroups.map(group => (
              <div
                key={group.id}
                className='glass-card glass-card-hover group relative overflow-hidden interactive-element'
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${group.gradient} opacity-50`}
                />

                <div className='relative z-10'>
                  <div className='flex items-start justify-between mb-6'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-primary mb-2'>
                        {group.name}
                      </h3>
                      <p className='text-sm font-medium text-gray-200'>
                        {group.type}
                      </p>
                    </div>
                    <Badge
                      variant={
                        group.status === 'Live' ? 'default' : 'secondary'
                      }
                      className={
                        group.status === 'Live'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-sm'
                      }
                    >
                      {group.status}
                    </Badge>
                  </div>

                  <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
                        <div className='text-sm text-secondary mb-1'>
                          Virtual Machines
                        </div>
                        <div className='text-2xl font-bold text-primary'>
                          {group.vmCount}
                        </div>
                      </div>
                      <div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10'>
                        <div className='text-sm text-secondary mb-1'>
                          Health Score
                        </div>
                        <div className='text-2xl font-bold text-primary'>
                          {group.health}%
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-secondary'>Performance</span>
                        <span className='text-primary font-semibold'>
                          {group.health}%
                        </span>
                      </div>
                      <div className='w-full bg-white/10 rounded-full h-2 backdrop-blur-sm'>
                        <div
                          className={`bg-gradient-to-r ${group.borderGradient} h-2 rounded-full transition-all duration-500 shadow-lg`}
                          style={{ width: `${group.health}%` }}
                        />
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2 border-t border-white/10'>
                      <div className='flex items-center text-sm text-secondary'>
                        <Clock className='h-4 w-4 mr-2' />
                        {group.lastUpdated}
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-accent-cyan hover:text-primary hover:bg-cyan-500/10 backdrop-blur-sm interactive-element'
                      >
                        <Settings className='h-4 w-4 mr-2' />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
