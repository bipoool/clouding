# Backend Documentation

The Clouding backend is a robust Go-based REST API built with modern architectural patterns and best practices.

## 🏗️ Architecture Overview

### Clean Architecture Pattern

The backend follows Clean Architecture principles with clear separation of concerns:

```
backend/
├── cmd/server/           # Application entry point
├── internal/
│   ├── config/          # Configuration management
│   ├── controller/      # HTTP handlers (Presentation layer)
│   ├── database/        # Database connection
│   ├── middleware/      # HTTP middleware
│   ├── model/           # Domain models (Entities)
│   ├── repository/      # Data access layer
│   ├── router/          # Route definitions
│   ├── service/         # Business logic (Use cases)
│   └── utils/           # Shared utilities
└── main.go              # Legacy entry point
```

### Technology Stack

#### Core Framework

- **Gin**: High-performance HTTP web framework
- **SQLX**: Extended SQL package with struct scanning
- **Squirrel**: SQL query builder for Go
- **Viper**: Configuration management

#### Database & Storage

- **PostgreSQL**: Primary database with JSONB support
- **AWS Secrets Manager**: Secure credential storage

#### Authentication & Security

- **JWT**: Token-based authentication
- **Supabase Auth**: Integrated authentication service
- **Zerolog**: Structured logging

#### Development Tools

- **Air**: Hot reload for development
- **Golangci-lint**: Code linting
- **Godotenv**: Environment variable loading

## 📁 Project Structure

### Entry Points

#### `cmd/server/main.go`

Main application entry point that:

- Initializes configuration
- Sets up database connections
- Configures logging
- Starts HTTP server

```go
func main() {
    // Load configuration
    cfg := config.Load()

    // Initialize database
    db := database.Connect(cfg)

    // Setup router with middleware
    router := router.Setup(db, cfg)

    // Start server
    router.Run(fmt.Sprintf(":%d", cfg.Server.Port))
}
```

### Configuration Layer

#### `internal/config/config.go`

Centralized configuration management using Viper:

```go
type Config struct {
    Database DatabaseConfig `mapstructure:"sql"`
    Supabase SupabaseConfig `mapstructure:"supabase"`
    Server   ServerConfig   `mapstructure:"server"`
}

type DatabaseConfig struct {
    Username string `mapstructure:"username"`
    Password string `mapstructure:"password"`
    Host     string `mapstructure:"host"`
    Port     int    `mapstructure:"port"`
    Database string `mapstructure:"db"`
}
```

### Data Models

#### User Model (`internal/model/user/user.go`)

```go
type User struct {
    ID        *int       `db:"id" json:"id"`
    Name      *string    `db:"name" json:"name"`
    Email     *string    `db:"email" json:"email"`
    CreatedAt *time.Time `db:"created_at" json:"createdAt"`
    UpdatedAt *time.Time `db:"updated_at" json:"updatedAt"`
}

// Response structs for API endpoints
type CreateUserResponse struct {
    ID *int `json:"id"`
}

type UpdateUserResponse struct {
    ID        *int       `json:"id"`
    UpdatedAt *time.Time `json:"updatedAt"`
}
```

#### Host Model (`internal/model/host/host.go`)

```go
type Host struct {
    ID        *int             `db:"id" json:"id"`
    UserID    *int             `db:"user_id" json:"userId"`
    Name      *string          `db:"name" json:"name"`
    IP        *string          `db:"ip" json:"ip"`
    Os        *string          `db:"os" json:"os"`
    MetaData  *json.RawMessage `db:"meta_data" json:"metaData"`
    CreatedAt *time.Time       `db:"created_at" json:"createdAt"`
    UpdatedAt *time.Time       `db:"updated_at" json:"updatedAt"`
}
```

### Repository Layer

The repository layer handles all database operations using SQLX and Squirrel for query building.

#### User Repository (`internal/repository/user.go`)

```go
type UserRepository interface {
    CreateUser(user *user.User) (*user.CreateUserResponse, error)
    GetUserByID(id int) (*user.User, error)
    DeleteUserByID(id int) (*user.DeleteUserResponse, error)
}

type userRepository struct {
    db *sqlx.DB
}

func (r *userRepository) CreateUser(user *user.User) (*user.CreateUserResponse, error) {
    query := squirrel.Insert("users").
        Columns("name", "email").
        Values(user.Name, user.Email).
        Suffix("RETURNING id").
        PlaceholderFormat(squirrel.Dollar)

    sql, args, err := query.ToSql()
    if err != nil {
        return nil, err
    }

    var id int
    err = r.db.QueryRow(sql, args...).Scan(&id)
    if err != nil {
        return nil, err
    }

    return &user.CreateUserResponse{ID: &id}, nil
}
```

#### SQL Files Organization

SQL queries are stored in separate files for maintainability:

```
repository/sql/
├── user/
│   ├── createUser.sql
│   ├── getUserById.sql
│   └── deleteUserById.sql
└── host/
    ├── createHost.sql
    ├── getHostById.sql
    ├── getHostsByUserId.sql
    └── deleteHostById.sql
```

### Service Layer

The service layer contains business logic and coordinates between repositories.

#### User Service (`internal/service/user.go`)

```go
type UserService interface {
    CreateUser(user *user.User) (*user.CreateUserResponse, error)
    GetUserByID(id int) (*user.User, error)
    DeleteUserByID(id int) (*user.DeleteUserResponse, error)
}

type userService struct {
    userRepo repository.UserRepository
    logger   *logger.Logger
}

func (s *userService) CreateUser(user *user.User) (*user.CreateUserResponse, error) {
    // Validate input
    if user.Name == nil || user.Email == nil {
        return nil, errors.New("name and email are required")
    }

    // Business logic (e.g., email validation, duplicate check)

    // Call repository
    return s.userRepo.CreateUser(user)
}
```

### Controller Layer

Controllers handle HTTP requests and responses.

#### User Controller (`internal/controller/v1/user.go`)

```go
type UserController struct {
    userService service.UserService
    logger      *logger.Logger
}

func (c *UserController) CreateUser(ctx *gin.Context) {
    var user user.User

    if err := ctx.ShouldBindJSON(&user); err != nil {
        utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body")
        return
    }

    result, err := c.userService.CreateUser(&user)
    if err != nil {
        c.logger.Error("Failed to create user", "error", err)
        utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create user")
        return
    }

    utils.SuccessResponse(ctx, http.StatusCreated, "User created successfully", result)
}
```

### Middleware

#### Authentication Middleware (`internal/middleware/authMiddleware.go`)

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := extractToken(c)
        if token == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
            c.Abort()
            return
        }

        claims, err := validateJWT(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

#### Logger Middleware (`internal/middleware/logger.go`)

```go
func LoggerMiddleware(logger *logger.Logger) gin.HandlerFunc {
    return gin.LoggerWithConfig(gin.LoggerConfig{
        Formatter: func(param gin.LogFormatterParams) string {
            logger.Info("HTTP Request",
                "method", param.Method,
                "path", param.Path,
                "status", param.StatusCode,
                "latency", param.Latency,
                "client_ip", param.ClientIP,
            )
            return ""
        },
    })
}
```

### Router Configuration

#### Main Router (`internal/router/router.go`)

```go
func Setup(db *sqlx.DB, cfg *config.Config) *gin.Engine {
    router := gin.New()

    // Global middleware
    router.Use(gin.Recovery())
    router.Use(middleware.LoggerMiddleware(logger))
    router.Use(middleware.CORS())

    // Health check endpoint
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "healthy"})
    })

    // API v1 routes
    v1 := router.Group("/api/v1")
    setupV1Routes(v1, db, cfg)

    return router
}
```

#### V1 Routes (`internal/router/v1/user.go`, `internal/router/v1/host.go`)

```go
func SetupUserRoutes(rg *gin.RouterGroup, userController *controller.UserController) {
    users := rg.Group("/users")
    {
        users.POST("/", userController.CreateUser)
        users.GET("/:id", userController.GetUserByID)
        users.DELETE("/:id", userController.DeleteUserByID)
    }
}

func SetupHostRoutes(rg *gin.RouterGroup, hostController *controller.HostController) {
    hosts := rg.Group("/hosts")
    {
        hosts.POST("/", hostController.CreateHost)
        hosts.GET("/:id", hostController.GetHostByID)
        hosts.GET("/user/:userId", hostController.GetHostsByUserID)
        hosts.DELETE("/:id", hostController.DeleteHostByID)
    }
}
```

## 🔐 Authentication & Security

### JWT Authentication

- Uses Supabase JWT tokens for authentication
- Middleware validates tokens on protected routes
- User context available in request handlers

### AWS Secrets Manager Integration

```go
func GetSecret(secretName string) (string, error) {
    cfg, err := config.LoadDefaultConfig(context.TODO())
    if err != nil {
        return "", err
    }

    client := secretsmanager.NewFromConfig(cfg)

    result, err := client.GetSecretValue(context.TODO(), &secretsmanager.GetSecretValueInput{
        SecretId: aws.String(secretName),
    })

    if err != nil {
        return "", err
    }

    return *result.SecretString, nil
}
```

## 🗄️ Database Integration

### Connection Management

```go
func Connect(cfg *config.Config) *sqlx.DB {
    dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
        cfg.Database.Host,
        cfg.Database.Port,
        cfg.Database.Username,
        cfg.Database.Password,
        cfg.Database.Database,
    )

    db, err := sqlx.Connect("postgres", dsn)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    return db
}
```

### Query Building with Squirrel

```go
// Dynamic query building
query := squirrel.Select("*").
    From("hosts").
    Where(squirrel.Eq{"user_id": userID}).
    OrderBy("created_at DESC").
    PlaceholderFormat(squirrel.Dollar)

if osFilter != "" {
    query = query.Where(squirrel.Eq{"os": osFilter})
}

sql, args, err := query.ToSql()
```

## 📊 Logging

### Structured Logging with Zerolog

```go
func (l *Logger) Info(msg string, keysAndValues ...interface{}) {
    event := l.logger.Info()

    for i := 0; i < len(keysAndValues); i += 2 {
        if i+1 < len(keysAndValues) {
            key := fmt.Sprintf("%v", keysAndValues[i])
            value := keysAndValues[i+1]
            event = event.Interface(key, value)
        }
    }

    event.Msg(msg)
}
```

## 🧪 Testing

### Unit Testing Structure

```go
func TestUserService_CreateUser(t *testing.T) {
    // Setup
    mockRepo := &MockUserRepository{}
    service := NewUserService(mockRepo, logger)

    user := &user.User{
        Name:  stringPtr("Test User"),
        Email: stringPtr("test@example.com"),
    }

    expectedID := 1
    mockRepo.On("CreateUser", user).Return(&user.CreateUserResponse{ID: &expectedID}, nil)

    // Execute
    result, err := service.CreateUser(user)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, expectedID, *result.ID)
    mockRepo.AssertExpectations(t)
}
```

## 🚀 Performance Considerations

### Database Optimization

- Connection pooling with configurable limits
- Prepared statements for repeated queries
- Indexing on frequently queried columns
- JSONB for flexible metadata storage

### Caching Strategy

- Redis integration for session storage
- Query result caching for expensive operations
- CDN integration for static assets

### Error Handling

```go
type APIError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Details string `json:"details,omitempty"`
}

func (e *APIError) Error() string {
    return e.Message
}

func HandleError(ctx *gin.Context, err error) {
    switch e := err.(type) {
    case *APIError:
        ctx.JSON(http.StatusBadRequest, e)
    case *sql.ErrNoRows:
        ctx.JSON(http.StatusNotFound, APIError{
            Code:    "NOT_FOUND",
            Message: "Resource not found",
        })
    default:
        ctx.JSON(http.StatusInternalServerError, APIError{
            Code:    "INTERNAL_ERROR",
            Message: "Internal server error",
        })
    }
}
```

## 📈 Monitoring & Observability

### Health Checks

- Database connectivity check
- External service availability
- Resource usage monitoring

### Metrics Collection

- Request/response metrics
- Database query performance
- Error rate tracking

### Deployment

- Docker containerization
- CI/CD pipeline integration
- Environment-specific configurations

---

For more specific information, see:

- [API Reference](../api/README.md) for endpoint details
- [Database Documentation](../database/README.md) for schema information
- [Development Guide](../development/README.md) for contribution guidelines
