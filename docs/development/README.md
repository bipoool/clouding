# Development Guide

This guide covers development standards, testing practices, and contribution guidelines for the Clouding project.

## 🎯 Development Philosophy

### Core Principles

- **Developer-First**: Prioritize developer experience and productivity
- **Code Quality**: Maintain high standards with proper testing and documentation
- **Performance**: Build for scalability and optimal performance
- **Security**: Implement security best practices from the ground up
- **Maintainability**: Write clean, readable, and well-documented code

## 📋 Code Standards

### General Standards

#### Code Quality

- **Early Returns**: Always use early returns to improve readability and reduce nesting
- **DRY Principle**: Don't Repeat Yourself - extract reusable logic into functions/components
- **Readability First**: Prioritize clear, readable code over premature optimization
- **Complete Implementation**: No TODOs, placeholders, or missing pieces in final code

#### Naming Conventions

- **Descriptive Names**: Use clear, descriptive variable and function names
- **Event Handlers**: Prefix event functions with "handle" (e.g., `handleClick`, `handleKeyDown`)
- **Components**: Use PascalCase for React components
- **Files**: Use kebab-case for file names

### Backend Standards (Go)

#### File Organization

```go
// Package structure
package service

// Imports organization
import (
    // 1. Standard library
    "context"
    "fmt"
    "time"

    // 2. Third-party packages
    "github.com/gin-gonic/gin"
    "github.com/jmoiron/sqlx"

    // 3. Internal packages
    "clouding/backend/internal/model/user"
    "clouding/backend/internal/repository"
)
```

#### Interface Design

```go
// Use interfaces for dependency injection
type UserService interface {
    CreateUser(ctx context.Context, user *user.User) (*user.CreateUserResponse, error)
    GetUserByID(ctx context.Context, id int) (*user.User, error)
    DeleteUserByID(ctx context.Context, id int) (*user.DeleteUserResponse, error)
}

// Implementation
type userService struct {
    userRepo repository.UserRepository
    logger   logger.Logger
}
```

#### Error Handling

```go
// Use wrapped errors for context
func (s *userService) CreateUser(ctx context.Context, user *user.User) (*user.CreateUserResponse, error) {
    if err := s.validateUser(user); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }

    result, err := s.userRepo.CreateUser(ctx, user)
    if err != nil {
        s.logger.Error("failed to create user", "error", err, "email", user.Email)
        return nil, fmt.Errorf("failed to create user: %w", err)
    }

    return result, nil
}
```

#### Testing Standards

```go
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name        string
        user        *user.User
        setupMocks  func(*MockUserRepository)
        expected    *user.CreateUserResponse
        expectError bool
    }{
        {
            name: "successful_creation",
            user: &user.User{
                Name:  stringPtr("John Doe"),
                Email: stringPtr("john@example.com"),
            },
            setupMocks: func(repo *MockUserRepository) {
                repo.On("CreateUser", mock.Anything, mock.Anything).
                    Return(&user.CreateUserResponse{ID: intPtr(1)}, nil)
            },
            expected: &user.CreateUserResponse{ID: intPtr(1)},
            expectError: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

### Frontend Standards (TypeScript/React)

#### Component Structure

```tsx
// 1. Imports organization
import React from "react";
import { NextPage } from "next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 2. Type definitions
interface ComponentProps {
  title: string;
  description?: string;
  variant?: "default" | "primary";
  children?: React.ReactNode;
}

// 3. Component implementation
export function Component({
  title,
  description,
  variant = "default",
  children,
}: ComponentProps) {
  // 4. Early returns for error states
  if (!title) {
    return null;
  }

  // 5. Event handlers with 'handle' prefix
  const handleClick = () => {
    // Handler logic
  };

  // 6. Render
  return (
    <div
      className={cn("base-styles", variant === "primary" && "primary-styles")}
    >
      {/* Component content */}
    </div>
  );
}
```

#### Form Handling

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Submit logic
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

#### Styling Guidelines

```tsx
// Use Tailwind classes consistently
<div className="
    grid grid-cols-1 gap-4
    md:grid-cols-2 md:gap-6
    lg:grid-cols-3 lg:gap-8
    transform transition-all duration-300
    hover:scale-105 hover:shadow-lg
">

// Component variants with CVA
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                outline: "border border-input bg-background hover:bg-accent",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)
```

## 🧪 Testing Strategy

### Backend Testing

#### Unit Tests

```go
// Service layer tests
func TestUserService_CreateUser(t *testing.T) {
    // Setup
    mockRepo := &MockUserRepository{}
    mockLogger := &MockLogger{}
    service := NewUserService(mockRepo, mockLogger)

    // Test data
    user := &user.User{
        Name:  stringPtr("Test User"),
        Email: stringPtr("test@example.com"),
    }

    // Mock expectations
    expectedID := 1
    mockRepo.On("CreateUser", mock.Anything, user).
        Return(&user.CreateUserResponse{ID: &expectedID}, nil)

    // Execute
    result, err := service.CreateUser(context.Background(), user)

    // Assert
    assert.NoError(t, err)
    assert.Equal(t, expectedID, *result.ID)
    mockRepo.AssertExpectations(t)
}
```

#### Integration Tests

```go
func TestUserAPI_Integration(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer cleanupTestDB(t, db)

    // Create test server
    router := setupTestRouter(db)

    // Test user creation
    w := httptest.NewRecorder()
    req := httptest.NewRequest("POST", "/api/v1/users",
        strings.NewReader(`{"name":"Test User","email":"test@example.com"}`))
    req.Header.Set("Content-Type", "application/json")

    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)

    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    assert.True(t, response["success"].(bool))
}
```

### Frontend Testing

#### Component Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies correct variant classes", () => {
    render(<Button variant="outline">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("border", "border-input");
  });
});
```

#### E2E Tests

```typescript
// Using Playwright
import { test, expect } from "@playwright/test";

test("user can create and view hosts", async ({ page }) => {
  await page.goto("/dashboard");

  // Navigate to create page
  await page.click("text=Create Host");

  // Fill form
  await page.fill('[name="name"]', "Test Server");
  await page.fill('[name="ip"]', "192.168.1.100");
  await page.selectOption('[name="os"]', "Ubuntu 22.04");

  // Submit form
  await page.click('button[type="submit"]');

  // Verify creation
  await expect(page.locator("text=Host created successfully")).toBeVisible();

  // Navigate to hosts list
  await page.goto("/dashboard");
  await expect(page.locator("text=Test Server")).toBeVisible();
});
```

## 🚀 Development Workflow

### Git Workflow

#### Branch Naming

```bash
# Feature branches
feature/user-authentication
feature/host-management
feature/dashboard-redesign

# Bug fixes
bugfix/login-error-handling
bugfix/host-creation-validation

# Hotfixes
hotfix/security-patch
hotfix/production-bug
```

#### Commit Messages

```bash
# Format: type(scope): description

feat(auth): add JWT token refresh mechanism
fix(api): resolve user creation validation error
docs(readme): update installation instructions
style(frontend): improve button component styling
refactor(backend): simplify user service implementation
test(api): add integration tests for host endpoints
chore(deps): update Go dependencies
```

#### Pull Request Process

1. **Create Feature Branch**: Branch from `main` for new features
2. **Implement Changes**: Follow coding standards and write tests
3. **Run Tests**: Ensure all tests pass locally
4. **Create PR**: Use descriptive title and detailed description
5. **Code Review**: Address reviewer feedback
6. **Merge**: Squash and merge after approval

### Development Environment

#### Required Tools

```bash
# Backend development
go version # 1.23+
golangci-lint --version
air --version # Hot reload

# Frontend development
node --version # 18+
pnpm --version
npx next --version

# Database
psql --version # PostgreSQL 15+

# Optional but recommended
docker --version
docker-compose --version
```

#### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd clouding

# Backend setup
cd backend
cp sample.env .env
# Edit .env with your configuration
go mod download
go run cmd/server/main.go

# Frontend setup (new terminal)
cd frontend
pnpm install
pnpm dev
```

### Code Quality Tools

#### Backend Linting

```bash
# Install golangci-lint
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run linter
golangci-lint run

# Configuration in .golangci.yml
linters:
  enable:
    - gofmt
    - golint
    - govet
    - ineffassign
    - misspell
    - staticcheck
```

#### Frontend Linting

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error"
  }
}
```

## 📚 Documentation Standards

### Code Documentation

#### Go Documentation

```go
// Package user provides user management functionality.
//
// This package includes user creation, retrieval, and deletion
// operations with proper validation and error handling.
package user

// User represents a user in the system.
//
// All fields use pointers to distinguish between zero values
// and null values in the database.
type User struct {
    ID        *int       `db:"id" json:"id"`
    Name      *string    `db:"name" json:"name"`
    Email     *string    `db:"email" json:"email"`
    CreatedAt *time.Time `db:"created_at" json:"createdAt"`
    UpdatedAt *time.Time `db:"updated_at" json:"updatedAt"`
}

// CreateUser creates a new user in the system.
//
// The function validates the user data before creation and
// returns the created user's ID or an error if validation fails.
//
// Example:
//   user := &User{Name: stringPtr("John"), Email: stringPtr("john@example.com")}
//   response, err := service.CreateUser(ctx, user)
//   if err != nil {
//       // handle error
//   }
//   fmt.Printf("Created user with ID: %d", *response.ID)
func (s *userService) CreateUser(ctx context.Context, user *User) (*CreateUserResponse, error) {
    // Implementation
}
```

#### TypeScript Documentation

````tsx
/**
 * Button component with multiple variants and sizes.
 *
 * @example
 * ```tsx
 * <Button variant="outline" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different component while keeping button styling */
  asChild?: boolean;
}

/**
 * Infrastructure component sidebar for the builder interface.
 *
 * Displays categorized components that can be dragged onto the canvas
 * to build infrastructure diagrams.
 */
export interface ComponentsSidebarProps {
  /** Available component categories to display */
  categories: ComponentCategory[];
  /** Callback when a component is selected */
  onComponentSelect: (component: InfrastructureComponent) => void;
  /** Current search query for filtering components */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
}
````

### API Documentation

#### Endpoint Documentation

```go
// CreateUser creates a new user account
//
// @Summary Create user
// @Description Create a new user with name and email
// @Tags users
// @Accept json
// @Produce json
// @Param user body user.User true "User data"
// @Success 201 {object} utils.SuccessResponse{data=user.CreateUserResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /users [post]
func (c *UserController) CreateUser(ctx *gin.Context) {
    // Implementation
}
```

## 🔧 Performance Guidelines

### Backend Performance

#### Database Optimization

```go
// Use connection pooling
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(5 * time.Minute)

// Use prepared statements for repeated queries
stmt, err := db.Prepare("SELECT * FROM users WHERE id = $1")
if err != nil {
    return err
}
defer stmt.Close()

// Use indexes for query optimization
CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_hosts_user_os ON hosts(user_id, os);
```

#### Memory Management

```go
// Use context for cancellation
func (s *userService) GetUsers(ctx context.Context) ([]*User, error) {
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
        // Continue processing
    }

    // Use streaming for large datasets
    rows, err := s.db.QueryContext(ctx, "SELECT * FROM users")
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*User
    for rows.Next() {
        var user User
        if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
            return nil, err
        }
        users = append(users, &user)
    }

    return users, nil
}
```

### Frontend Performance

#### Component Optimization

```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(
  function ExpensiveComponent({ data, onUpdate }: ExpensiveComponentProps) {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return prevProps.data.id === nextProps.data.id;
  }
);

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.map((item) => ({
    ...item,
    computed: expensiveCalculation(item),
  }));
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick]
);
```

#### Bundle Optimization

```tsx
// Use dynamic imports for code splitting
const InfrastructureBuilder = lazy(() =>
    import('@/components/infrastructure/infrastructure-builder')
)

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
    <InfrastructureBuilder />
</Suspense>
```

## 🤝 Contributing Guidelines

### Before Contributing

1. **Fork the Repository**: Create your own fork
2. **Read Documentation**: Familiarize yourself with the codebase
3. **Check Issues**: Look for existing issues or create new ones
4. **Discuss Changes**: For major changes, discuss in issues first

### Development Process

1. **Create Branch**: Use descriptive branch names
2. **Follow Standards**: Adhere to coding standards
3. **Write Tests**: Add tests for new functionality
4. **Update Documentation**: Update relevant documentation
5. **Test Locally**: Ensure all tests pass
6. **Create PR**: Submit a detailed pull request

### Code Review Guidelines

#### For Authors

- Write clear commit messages
- Keep PRs focused and small
- Add tests for new functionality
- Update documentation
- Respond to feedback promptly

#### For Reviewers

- Be constructive and specific
- Focus on code quality and standards
- Check for security issues
- Verify test coverage
- Approve when ready

## 🚨 Security Guidelines

### Backend Security

```go
// Input validation
func validateUser(user *User) error {
    if user.Email == nil || !isValidEmail(*user.Email) {
        return errors.New("invalid email format")
    }
    if user.Name == nil || len(*user.Name) < 2 {
        return errors.New("name must be at least 2 characters")
    }
    return nil
}

// SQL injection prevention (using Squirrel)
query := squirrel.Select("*").
    From("users").
    Where(squirrel.Eq{"id": userID}).
    PlaceholderFormat(squirrel.Dollar)

sql, args, err := query.ToSql()
```

### Frontend Security

```tsx
// XSS prevention
import { sanitize } from "dompurify";

function DisplayContent({ content }: { content: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitize(content),
      }}
    />
  );
}

// Input validation with Zod
const schema = z.object({
  email: z.string().email("Invalid email").max(254),
  name: z.string().min(2).max(100),
});
```

---

For more information, see:

- [Getting Started](../getting-started.md) for setup instructions
- [API Documentation](../api/README.md) for endpoint details
- [Backend Documentation](../backend/README.md) for architecture details
- [Frontend Documentation](../frontend/README.md) for component details
