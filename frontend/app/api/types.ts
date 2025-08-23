// User Types
export interface User {
  id: string
  name: string
  email: string
  fullName: string
  avatarUrl?: string
  picture?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  fullName: string
  avatarUrl?: string
  picture?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  fullName?: string
  avatarUrl?: string
  picture?: string
}

// Credential Types
export interface Credential {
  id: string
  name: string
  type: 'ssh_key'
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCredentialRequest {
  name: string
  type: 'ssh_key'
  secret: {
    username: string
    privateKey: string
  }
}

export interface UpdateCredentialRequest {
  type: 'ssh_key'
  secret: {
    username: string
    privateKey: string
  }
}

// Host Types
export interface Host {
  id: string
  name: string
  ip: string
  os: string
  credentialId: string
  userId: string
  metaData?: {
    tag?: {
      [key: string]: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface CreateHostRequest {
  name: string
  ip: string
  os: string
  credentialId: string
  metaData?: {
    tag?: {
      [key: string]: string
    }
  }
}

export interface UpdateHostRequest {
  name?: string
  ip?: string
  os?: string
  credentialId?: string
  metaData?: {
    tag?: {
      [key: string]: string
    }
  }
}

// Host Group Types
export interface HostGroup {
  id: string
  name: string
  description: string
  hostIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateHostGroupRequest {
  name: string
  description: string
  hostIds: string[]
}

export interface UpdateHostGroupRequest {
  name?: string
  description?: string
  hostIds?: string[]
}

export interface AddHostsToGroupRequest {
  hostIds: string[]
}

// Blueprint Types
export interface Blueprint {
  id: number
  name: string
  description: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface CreateBlueprintRequest {
  name: string
  description: string
  status?: string
}

export interface UpdateBlueprintRequest {
  name?: string
  description?: string
  status?: string
}

// Blueprint Component Types
export interface BlueprintComponentParameter {
  id: string
  value: string
  name: string
}

export interface BlueprintComponent {
  id: number
  blueprintId: number
  componentId: number
  position: number
  parameters: BlueprintComponentParameter[]
  createdAt: string
  updatedAt: string
}

export interface UpdateBlueprintComponentRequest {
  componentId: number
  position: number
  parameters: BlueprintComponentParameter[]
}

// Component Types
export interface Component {
  id: string
  name: string
  description: string
  category: string
  version: string
  requirements: string[]
  installScript: string
  configOptions: Record<string, any>
}

// Deployment Plan Types
export interface DeploymentPlan {
  id: string
  hostId: string
  blueprintId: string
  status: 'pending' | 'planning' | 'ready' | 'error'
  createdAt: string
  updatedAt: string
}

export interface CreateDeploymentPlanRequest {
  id: string
  hostId: string
  blueprintId: string
}

// Deployment Run Types
export interface DeploymentRun {
  id: string
  deploymentPlanId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  logs: string[]
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDeploymentRunRequest {
  id: string
  deploymentPlanId: string
}

// Common Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
} 