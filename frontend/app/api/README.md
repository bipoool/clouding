# Clouding.co API Documentation

This document describes all the API endpoints implemented in the Next.js backend. The Next.js APIs act as a proxy layer that forwards requests to the Go backend service deployed at `clouding.vipulgupta.me/api/v1`.

## Architecture

- **Frontend**: Next.js application with API routes
- **Proxy Layer**: Next.js API routes validate authentication and forward requests
- **Backend**: Go service at `https://clouding.vipulgupta.me/api/v1`
- **Authentication**: Supabase JWT authentication with multiple OAuth providers

## Authentication

The API uses **Supabase JWT authentication** with multiple OAuth providers: **Google**, **GitHub**, and **Discord**. Users authenticate through Supabase's OAuth flow, and the resulting JWT tokens are automatically managed through HTTP-only cookies.

### Supported OAuth Providers

1. **Google OAuth** - Full name and profile picture
2. **GitHub OAuth** - Username and avatar
3. **Discord OAuth** - Username and avatar

### How Authentication Works

1. **OAuth Flow**: Users sign in using OAuth providers (Google, GitHub, Discord) through Supabase
2. **JWT Token**: Supabase issues a JWT token stored in HTTP-only cookies
3. **Request Validation**: Next.js API middleware validates the JWT token using Supabase's `auth.getUser()`
4. **Provider Detection**: Middleware detects the OAuth provider and extracts provider-specific user data
5. **Backend Forwarding**: The JWT access token is forwarded to the Go backend for further validation
6. **User Context**: Authenticated user information is available in all API routes

### Provider-Specific User Data

Each OAuth provider provides different user metadata:

```typescript
interface AuthenticatedUser {
	id: string // Supabase user ID
	email: string // User email
	name?: string // Display name (provider-specific)
	avatar_url?: string // Profile picture URL
	provider: string // OAuth provider: 'google', 'github', 'discord'
	provider_id: string // Provider-specific user ID
}
```

**Google OAuth:**

- `name`: from `full_name` or `name`
- `avatar_url`: from `picture` or `avatar_url`

**GitHub OAuth:**

- `name`: from `name`, `user_name`, or `full_name`
- `avatar_url`: from `avatar_url`

**Discord OAuth:**

- `name`: from `username`, `name`, or `full_name`
- `avatar_url`: from `avatar_url`

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Provider Configuration (for Supabase)
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# GitHub OAuth (if needed for custom implementations)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Discord OAuth (if needed for custom implementations)
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id

# Backend Configuration
BACKEND_URL=https://clouding.vipulgupta.me/api/v1

# Optional: Custom redirect URLs for development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Authentication Middleware

All API routes are protected by the `withAuth` middleware which:

- Validates the Supabase JWT token from cookies
- Detects the OAuth provider used for authentication
- Extracts provider-specific user information (id, email, name, avatar_url, provider)
- Forwards the JWT token to the Go backend
- Returns 401 if authentication fails

### Testing Authentication

Use the test endpoint to verify authentication works with all providers:

```bash
GET /api/auth/test
```

Returns:

```json
{
	"success": true,
	"message": "Authentication successful",
	"user": {
		"id": "user-uuid",
		"email": "user@example.com",
		"name": "User Name",
		"avatar_url": "https://...",
		"provider": "google",
		"provider_id": "provider-specific-id"
	},
	"provider_info": {
		"detected_provider": "google",
		"supported_providers": ["google", "github", "discord"]
	}
}
```

## Architecture

```
Frontend → Next.js API (Auth + Validation) → Go Backend → Next.js API → Frontend
```

### Request Flow

1. **Frontend Request**: Client makes request to Next.js API endpoint
2. **Authentication**: Middleware validates Supabase JWT from cookies
3. **Provider Detection**: Identifies OAuth provider and extracts user data
4. **Backend Request**: JWT token forwarded to Go backend API
5. **Response**: Go backend response returned to frontend

## Base URL

All endpoints are available at: `http://localhost:3000/api`

## Endpoints

### Authentication

- `GET /api/auth/test` - Test authentication with all OAuth providers

### 1. Credentials

#### List All Credentials

- **GET** `/api/credentials`
- **Description**: Get all SSH credentials for the authenticated user
- **Response**: Array of credential objects

#### Create Credential

- **POST** `/api/credentials`
- **Description**: Create a new SSH credential
- **Body**:

```json
{
	"name": "My SSH Key",
	"type": "ssh_key",
	"secret": {
		"username": "ubuntu",
		"privateKey": "<PRIVATE_KEY_CONTENT>"
	}
}
```

#### Get Credential by ID

- **GET** `/api/credentials/:id`
- **Description**: Fetch a specific credential by ID

#### Update Credential

- **PUT** `/api/credentials/:id`
- **Description**: Update an existing credential
- **Body**:

```json
{
	"type": "ssh_key",
	"secret": {
		"username": "ubuntu",
		"privateKey": "<PRIVATE_KEY_CONTENT>"
	}
}
```

#### Delete Credential

- **DELETE** `/api/credentials/:id`
- **Description**: Delete a credential by ID

### 2. Hosts

#### List All Hosts

- **GET** `/api/hosts`
- **Description**: Get all hosts for the authenticated user
- **Response**: Array of host objects

#### Create Host

- **POST** `/api/hosts`
- **Description**: Register a new host
- **Body**:

```json
{
	"name": "My Server",
	"ip": "192.168.1.100",
	"os": "Ubuntu",
	"credentialId": "cred_123",
	"metaData": {
		"tag": {
			"environment": "production"
		}
	}
}
```

#### Get Host by ID

- **GET** `/api/hosts/:id`
- **Description**: Retrieve host details by ID

#### Update Host

- **PUT** `/api/hosts/:id`
- **Description**: Update an existing host
- **Body**:

```json
{
	"name": "Updated Server",
	"ip": "192.168.1.101",
	"os": "Ubuntu 22.04",
	"credentialId": "cred_456",
	"metaData": {
		"tag": {
			"environment": "staging"
		}
	}
}
```

#### Delete Host

- **DELETE** `/api/hosts/:id`
- **Description**: Delete a host by ID

### 3. Users

#### List All Users

- **GET** `/api/users`
- **Description**: Get all users
- **Response**: Array of user objects

#### Create User

- **POST** `/api/users`
- **Description**: Create a new user
- **Body**:

```json
{
	"name": "John Doe",
	"email": "john.doe@example.com",
	"fullName": "Johnathan Doe",
	"avatarUrl": "https://example.com/avatar.png",
	"picture": "https://example.com/picture.png"
}
```

#### Get User by ID

- **GET** `/api/users/:id`
- **Description**: Retrieve user details by ID

#### Update User

- **PUT** `/api/users/:id`
- **Description**: Update an existing user
- **Body**:

```json
{
	"name": "John Updated",
	"email": "john.updated@example.com",
	"fullName": "Johnathan Updated",
	"avatarUrl": "https://example.com/new-avatar.png"
}
```

### 4. Blueprints

#### List All Blueprints

- **GET** `/api/blueprint`
- **Description**: Get all blueprints for the current user
- **Response**: Array of blueprint objects

#### Create Blueprint

- **POST** `/api/blueprint`
- **Description**: Create a new blueprint
- **Body**:

```json
{
	"plan": ["nginx", "java", "docker"],
	"description": "Web server with Java runtime",
	"userId": "user-123"
}
```

#### Get Blueprint by ID

- **GET** `/api/blueprint/:id`
- **Description**: Get blueprint details by ID

#### Update Blueprint

- **PUT** `/api/blueprint`
- **Description**: Update an existing blueprint
- **Body**:

```json
{
	"id": "bp_123",
	"plan": ["nginx", "golang"],
	"description": "Updated web server with Go runtime"
}
```

#### Delete Blueprint

- **DELETE** `/api/blueprint/:id`
- **Description**: Delete a blueprint by ID

#### Clone Blueprint

- **POST** `/api/blueprint/:id/clone`
- **Description**: Create a copy of an existing blueprint

#### Get Deployment Plans by Blueprint

- **GET** `/api/blueprints/:blueprintId/deploymentPlans`
- **Description**: List deployment plans for a specific blueprint

#### Get Deployment Runs by Blueprint

- **GET** `/api/blueprints/:blueprintId/deploymentRuns`
- **Description**: List deployment runs for a specific blueprint

### 5. Components

#### List All Components

- **GET** `/api/components`
- **Description**: Get all available components
- **Response**: Array of component objects with installation details

#### Get Component by ID

- **GET** `/api/components/:id`
- **Description**: Get component details by ID

Available components:

- `nginx` - NGINX web server
- `java` - Java JDK 11
- `golang` - Go programming language
- `docker` - Docker container platform

### 6. Host Groups

#### List All Host Groups

- **GET** `/api/hostGroup`
- **Description**: Get all host groups for the user
- **Response**: Array of host group objects

#### Create Host Group

- **POST** `/api/hostGroup`
- **Description**: Create a new host group
- **Body**:

```json
{
	"userId": "user-123",
	"name": "Production Servers",
	"hostIds": ["host-1", "host-2"]
}
```

#### Get Host Group by ID

- **GET** `/api/hostGroup/:id`
- **Description**: Get host group details by ID

#### Update Host Group

- **PUT** `/api/hostGroup`
- **Description**: Update an existing host group
- **Body**:

```json
{
	"id": "hg_123",
	"userId": "user-123",
	"name": "Updated Group Name",
	"hosts": ["host-1", "host-2", "host-3"]
}
```

#### Add Hosts to Group

- **POST** `/api/hostGroup/:id/hosts`
- **Description**: Add hosts to a host group
- **Body**:

```json
{
	"hostIds": ["host-3", "host-4"]
}
```

#### Remove Host from Group

- **DELETE** `/api/hostGroup/:id/hosts/:hostId`
- **Description**: Remove a specific host from a group

### 7. Deployment Plans

#### Create Deployment Plan (SSE)

- **POST** `/api/deploymentPlan`
- **Description**: Create a deployment plan and return progress via Server-Sent Events
- **Body**:

```json
{
	"id": "uuid-from-client",
	"hostid": "host-123",
	"blueprintId": "bp-456"
}
```

- **Response**: SSE stream with deployment plan progress

### 8. Deployment Runs

#### Create Deployment Run (SSE)

- **POST** `/api/deploymentRun`
- **Description**: Trigger execution of a deployment plan and return progress via Server-Sent Events
- **Body**:

```json
{
	"id": "uuid-from-client",
	"deploymentPlanId": "plan-123"
}
```

- **Response**: SSE stream with deployment execution progress

## Response Format

### Success Response

```json
{
	"data": {
		/* response data */
	},
	"message": "Operation completed successfully"
}
```

### Error Response

```json
{
	"error": "Error type",
	"message": "Detailed error message"
}
```

## Server-Sent Events (SSE)

The deployment APIs use Server-Sent Events to provide real-time progress updates:

```javascript
const eventSource = new EventSource('/api/deploymentRun', {
	method: 'POST',
	body: JSON.stringify({
		id: 'run-123',
		deploymentPlanId: 'plan-456',
	}),
})

eventSource.onmessage = function (event) {
	const data = JSON.parse(event.data)
	console.log('Progress:', data)
}
```

## Error Codes

- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (invalid or missing bearer token)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

## Development Notes

- All data is currently stored in memory (mock data)
- In production, replace with proper database integration
- Secrets should be stored in a secure secrets manager
- Add proper user authentication and authorization
- Implement rate limiting and request validation
- Add comprehensive logging and monitoring
