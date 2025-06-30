# Getting Started with Clouding

This guide will help you set up and run the Clouding infrastructure management platform on your local development environment.

## 📋 Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **Node.js**: Version 18+ (LTS recommended)
- **Go**: Version 1.23+
- **PostgreSQL**: Version 15+
- **Git**: Latest version

### Package Managers

- **Frontend**: pnpm (recommended) or npm
- **Backend**: Go modules (built-in)

### Optional Tools

- **Docker**: For containerized development
- **Postman**: For API testing
- **VS Code**: Recommended IDE with Go and TypeScript extensions

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clouding
```

### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backend
```

#### Install Go Dependencies

```bash
go mod download
go mod tidy
```

#### Setup Environment Variables

```bash
# Copy sample environment file
cp sample.env .env

# Edit .env file with your configuration
nano .env
```

#### Configure Environment Variables

Edit the `.env` file with your specific configuration:

```env
# Database Configuration
SQL.USERNAME=your_db_user
SQL.PASSWORD=your_db_password
SQL.HOST=localhost
SQL.PORT=5432
SQL.DB=clouding_db

# Supabase Authentication
SUPABASE.JWT.SECRET=your_supabase_jwt_secret

# Application Configuration
SERVER.LOG.LEVEL=debug
SERVER.PORT=8080
```

#### Setup PostgreSQL Database

**Option 1: Local PostgreSQL Installation**

```bash
# Create database
createdb clouding_db

# Run initialization script
psql -d clouding_db -f init.sql
```

**Option 2: Docker PostgreSQL**

```bash
# Run PostgreSQL in Docker
docker run --name clouding-postgres \
  -e POSTGRES_USER=your_db_user \
  -e POSTGRES_PASSWORD=your_db_password \
  -e POSTGRES_DB=clouding_db \
  -p 5432:5432 \
  -d postgres:15

# Initialize database
docker exec -i clouding-postgres psql -U your_db_user -d clouding_db < init.sql
```

### 3. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

#### Setup Environment Variables (if needed)

```bash
# Create .env.local for frontend-specific variables
touch .env.local
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Run the server
go run cmd/server/main.go

# Or build and run
go build -o bin/server cmd/server/main.go
./bin/server
```

The backend server will start on `http://localhost:8080`

### 2. Start the Frontend Development Server

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Start development server
pnpm dev

# Or with npm
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Verify Installation

#### Check Backend Health

```bash
curl http://localhost:8080/health
```

#### Check Frontend

Open your browser and navigate to `http://localhost:3000`

## 🗄️ Database Schema

The application uses the following database tables:

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Hosts Table

```sql
CREATE TABLE hosts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    os TEXT NOT NULL,
    meta_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### SSH Credentials Table

```sql
CREATE TABLE ssh_credentials (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    key_name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    UNIQUE(user_id, key_name)
);
```

## 🧪 Testing the Setup

### Backend API Testing

#### Test User Creation

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'
```

#### Test Host Creation

```bash
curl -X POST http://localhost:8080/api/v1/hosts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "Test Server",
    "ip": "192.168.1.100",
    "os": "Ubuntu 22.04"
  }'
```

### Frontend Testing

1. Navigate to `http://localhost:3000`
2. Check homepage loads correctly
3. Navigate to `/dashboard` to test dashboard
4. Try `/dashboard/create` for infrastructure builder

## 🔧 Development Commands

### Backend Commands

```bash
# Run with hot reload (install air first: go install github.com/cosmtrek/air@latest)
air

# Run tests
go test ./...

# Build for production
go build -o bin/server cmd/server/main.go

# Format code
go fmt ./...

# Lint code (install golangci-lint first)
golangci-lint run
```

### Frontend Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm type-check
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error

```
Error: failed to connect to database
```

**Solution**:

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists and is accessible

#### Port Already in Use

```
Error: listen tcp :8080: bind: address already in use
```

**Solution**:

- Kill process using port 8080: `lsof -ti:8080 | xargs kill -9`
- Or change port in configuration

#### Frontend Build Errors

```
Error: Module not found
```

**Solution**:

- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Clear Next.js cache: `rm -rf .next`

#### Go Module Issues

```
Error: go.mod file not found
```

**Solution**:

- Ensure you're in the backend directory
- Run `go mod init` if go.mod is missing

### Environment-Specific Issues

#### macOS

- Install Xcode Command Line Tools: `xcode-select --install`
- Use Homebrew for PostgreSQL: `brew install postgresql`

#### Linux

- Install build tools: `sudo apt-get install build-essential`
- Install PostgreSQL: `sudo apt-get install postgresql postgresql-contrib`

#### Windows/WSL2

- Ensure WSL2 is properly configured
- Install Windows Terminal for better experience
- Use Ubuntu distribution in WSL2

## 📦 Production Setup

### Environment Configuration

1. Set `SERVER.LOG.LEVEL=info` in production
2. Configure proper database credentials
3. Set up SSL certificates for HTTPS
4. Configure reverse proxy (Nginx/Apache)

### Security Considerations

1. Change default JWT secrets
2. Use environment-specific database credentials
3. Enable CORS properly for production domains
4. Implement rate limiting

### Deployment Options

- **Docker**: Use provided Dockerfiles
- **Cloud Platforms**: Deploy to AWS, GCP, Azure
- **VPS**: Use systemd services for process management

## 🔄 Next Steps

After successful installation:

1. **Explore the API**: Check [API Documentation](./api/README.md)
2. **Understand Frontend**: Review [Frontend Documentation](./frontend/README.md)
3. **Database Design**: Study [Database Documentation](./database/README.md)
4. **Development**: Read [Development Guide](./development/README.md)

## 📞 Support

If you encounter issues:

1. Check this troubleshooting section
2. Review relevant documentation sections
3. Create an issue in the repository
4. Provide logs and error messages for faster resolution

---

**Happy Coding!** 🎉
