# API Reference

The Clouding API is a RESTful API built with Go and Gin framework. It provides endpoints for managing users, hosts, and infrastructure configurations.

## 🔗 Base Information

- **Base URL**: `http://localhost:8080/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer tokens (Supabase)

## 📝 API Standards

### Response Format

All API responses follow a consistent format:

#### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### HTTP Status Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | OK - Request successful                  |
| 201         | Created - Resource created successfully  |
| 400         | Bad Request - Invalid request parameters |
| 401         | Unauthorized - Authentication required   |
| 403         | Forbidden - Insufficient permissions     |
| 404         | Not Found - Resource not found           |
| 409         | Conflict - Resource already exists       |
| 422         | Unprocessable Entity - Validation error  |
| 500         | Internal Server Error - Server error     |

## 🔐 Authentication

### JWT Authentication

The API uses JWT tokens provided by Supabase for authentication.

#### Authorization Header

```
Authorization: Bearer <jwt_token>
```

### Protected Endpoints

Most endpoints require authentication. Public endpoints include:

- `GET /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

## 👥 User Management

### User Model

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

### Create User

Creates a new user account.

**Endpoint:** `POST /users`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

### Get User by ID

Retrieves a specific user by their ID.

**Endpoint:** `GET /users/{id}`

**Path Parameters:**

- `id` (integer, required) - User ID

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer <jwt_token>"
```

### Delete User

Deletes a user account.

**Endpoint:** `DELETE /users/{id}`

**Path Parameters:**

- `id` (integer, required) - User ID

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "isDeleted": true
  }
}
```

**cURL Example:**

```bash
curl -X DELETE http://localhost:8080/api/v1/users/1 \
  -H "Authorization: Bearer <jwt_token>"
```

## 🖥️ Host Management

### Host Model

```typescript
interface Host {
  id: number;
  userId: number;
  name: string;
  ip: string;
  os: string;
  metaData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Create Host

Creates a new host/server entry.

**Endpoint:** `POST /hosts`

**Request Body:**

```json
{
  "userId": 1,
  "name": "Production Server",
  "ip": "192.168.1.100",
  "os": "Ubuntu 22.04",
  "metaData": {
    "region": "us-west-1",
    "provider": "aws",
    "instanceType": "t3.medium"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Host created successfully",
  "data": {
    "id": 1
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "userId": 1,
    "name": "Production Server",
    "ip": "192.168.1.100",
    "os": "Ubuntu 22.04"
  }'
```

### Get Host by ID

Retrieves a specific host by its ID.

**Endpoint:** `GET /hosts/{id}`

**Path Parameters:**

- `id` (integer, required) - Host ID

**Response:**

```json
{
  "success": true,
  "message": "Host retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Production Server",
    "ip": "192.168.1.100",
    "os": "Ubuntu 22.04",
    "metaData": {
      "region": "us-west-1",
      "provider": "aws",
      "instanceType": "t3.medium"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Hosts by User ID

Retrieves all hosts belonging to a specific user.

**Endpoint:** `GET /hosts/user/{userId}`

**Path Parameters:**

- `userId` (integer, required) - User ID

**Query Parameters:**

- `os` (string, optional) - Filter by operating system
- `limit` (integer, optional) - Limit number of results (default: 50)
- `offset` (integer, optional) - Offset for pagination (default: 0)

**Response:**

```json
{
  "success": true,
  "message": "Hosts retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Production Server",
      "ip": "192.168.1.100",
      "os": "Ubuntu 22.04",
      "metaData": {},
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "userId": 1,
      "name": "Development Server",
      "ip": "192.168.1.101",
      "os": "Ubuntu 22.04",
      "metaData": {},
      "createdAt": "2024-01-15T11:30:00Z",
      "updatedAt": "2024-01-15T11:30:00Z"
    }
  ]
}
```

**cURL Example:**

```bash
curl -X GET "http://localhost:8080/api/v1/hosts/user/1?os=Ubuntu&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### Delete Host

Deletes a host entry.

**Endpoint:** `DELETE /hosts/{id}`

**Path Parameters:**

- `id` (integer, required) - Host ID

**Response:**

```json
{
  "success": true,
  "message": "Host deleted successfully",
  "data": {
    "id": 1,
    "isDeleted": true
  }
}
```

## 🔧 System Endpoints

### Health Check

Checks the health status of the API server.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:8080/health
```

### API Version

Gets API version information.

**Endpoint:** `GET /version`

**Authentication:** Not required

**Response:**

```json
{
  "version": "1.0.0",
  "build": "abc123",
  "environment": "development"
}
```

## 📊 Error Handling

### Common Error Codes

| Error Code                 | Description                     |
| -------------------------- | ------------------------------- |
| `VALIDATION_ERROR`         | Request validation failed       |
| `RESOURCE_NOT_FOUND`       | Requested resource not found    |
| `DUPLICATE_RESOURCE`       | Resource already exists         |
| `AUTHENTICATION_REQUIRED`  | Authentication token required   |
| `INVALID_TOKEN`            | Invalid or expired token        |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `DATABASE_ERROR`           | Database operation failed       |
| `INTERNAL_ERROR`           | Internal server error           |

### Validation Errors

Validation errors provide detailed field-level error information:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "name": "Name is required"
      }
    }
  }
}
```

## 🔄 Rate Limiting

The API implements rate limiting to prevent abuse:

- **Rate Limit**: 100 requests per minute per IP
- **Burst Limit**: 20 requests per second

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641915600
```

## 📚 SDK and Client Libraries

### JavaScript/TypeScript Client

```typescript
import { CloudingAPI } from "@clouding/api-client";

const client = new CloudingAPI({
  baseURL: "http://localhost:8080/api/v1",
  token: "your-jwt-token",
});

// Create a user
const user = await client.users.create({
  name: "John Doe",
  email: "john@example.com",
});

// Get hosts for a user
const hosts = await client.hosts.getByUserId(user.id);
```

### Python Client

```python
from clouding_api import CloudingClient

client = CloudingClient(
    base_url='http://localhost:8080/api/v1',
    token='your-jwt-token'
)

# Create a user
user = client.users.create(
    name='John Doe',
    email='john@example.com'
)

# Get hosts for a user
hosts = client.hosts.get_by_user_id(user['id'])
```

## 🧪 Testing

### Test Environment

Use the test environment for development and testing:

- **Base URL**: `http://localhost:8080/api/v1`
- **Test Database**: Separate test database
- **Rate Limiting**: Disabled for testing

### Postman Collection

A Postman collection is available in `backend/postman-docs/docs.json` with pre-configured requests for all endpoints.

### API Testing Examples

#### Integration Test Example

```bash
# 1. Create a user
USER_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}')

USER_ID=$(echo $USER_RESPONSE | jq -r '.data.id')

# 2. Create a host for the user
HOST_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID, \"name\": \"Test Server\", \"ip\": \"192.168.1.100\", \"os\": \"Ubuntu 22.04\"}")

HOST_ID=$(echo $HOST_RESPONSE | jq -r '.data.id')

# 3. Retrieve the host
curl -X GET http://localhost:8080/api/v1/hosts/$HOST_ID

# 4. Clean up
curl -X DELETE http://localhost:8080/api/v1/hosts/$HOST_ID
curl -X DELETE http://localhost:8080/api/v1/users/$USER_ID
```

## 📈 Performance

### Response Times

Expected response times for various endpoints:

| Endpoint                   | Expected Response Time |
| -------------------------- | ---------------------- |
| `GET /health`              | < 10ms                 |
| `POST /users`              | < 100ms                |
| `GET /users/{id}`          | < 50ms                 |
| `GET /hosts/user/{userId}` | < 200ms                |

### Optimization Recommendations

1. **Database Indexing**: Ensure proper indexes on frequently queried fields
2. **Connection Pooling**: Configure appropriate database connection pool size
3. **Caching**: Implement Redis caching for frequently accessed data
4. **Pagination**: Use pagination for endpoints returning large datasets

## 🔮 Future Enhancements

### Planned Features

1. **Webhooks**: Real-time notifications for resource changes
2. **Bulk Operations**: Batch create/update/delete operations
3. **Advanced Filtering**: Complex query support with filtering operators
4. **File Upload**: Support for configuration file uploads
5. **API Versioning**: Support for multiple API versions

### GraphQL API

A GraphQL endpoint is planned for future releases to provide more flexible data querying capabilities.

---

For more information, see:

- [Backend Documentation](../backend/README.md) for implementation details
- [Database Documentation](../database/README.md) for data models
- [Getting Started](../getting-started.md) for setup instructions
