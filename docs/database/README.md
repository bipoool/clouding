# Database Documentation

The Clouding application uses PostgreSQL as its primary database with a well-designed schema supporting users, hosts, and SSH credentials management.

## 🗄️ Database Overview

### Technology Stack

- **Database**: PostgreSQL 15+
- **Query Builder**: Squirrel (Go)
- **ORM**: SQLX for struct scanning
- **Migrations**: SQL-based migration files
- **Connection Pool**: Configurable connection pooling

### Database Configuration

```env
SQL.USERNAME=clouding_user
SQL.PASSWORD=secure_password
SQL.HOST=localhost
SQL.PORT=5432
SQL.DB=clouding_db
```

## 📊 Schema Design

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     hosts       │       │ ssh_credentials │
│─────────────────│       │─────────────────│       │─────────────────│
│ id (PK)         │◄─────┐│ id (PK)         │       │ id (PK)         │
│ name            │      ││ user_id (FK)    │       │ user_name       │
│ email           │      ││ name            │       │ key_name        │
│ created_at      │      ││ ip              │       │ user_id (FK)    │
│ updated_at      │      ││ os              │       └─────────────────┘
└─────────────────┘      ││ meta_data       │               │
                         ││ created_at      │               │
                         ││ updated_at      │               │
                         │└─────────────────┘               │
                         └───────────────────────────────────┘
```

## 📋 Table Schemas

### Users Table

The `users` table stores user account information.

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Columns

| Column       | Type        | Constraints   | Description               |
| ------------ | ----------- | ------------- | ------------------------- |
| `id`         | SERIAL      | PRIMARY KEY   | Auto-incrementing user ID |
| `name`       | TEXT        | NOT NULL      | User's full name          |
| `email`      | TEXT        | NOT NULL      | User's email address      |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp     |

#### Indexes

```sql
-- Unique email constraint
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Index for name-based searches
CREATE INDEX idx_users_name ON users(name);

-- Index for created_at queries
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Example Data

```sql
INSERT INTO users (name, email) VALUES
('John Doe', 'john.doe@example.com'),
('Jane Smith', 'jane.smith@example.com'),
('Bob Johnson', 'bob.johnson@example.com');
```

### Hosts Table

The `hosts` table stores server/infrastructure host information.

```sql
CREATE TABLE IF NOT EXISTS hosts (
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

#### Columns

| Column       | Type        | Constraints             | Description                |
| ------------ | ----------- | ----------------------- | -------------------------- |
| `id`         | SERIAL      | PRIMARY KEY             | Auto-incrementing host ID  |
| `user_id`    | INTEGER     | FOREIGN KEY → users(id) | Owner of the host          |
| `name`       | TEXT        | NOT NULL                | Host display name          |
| `ip`         | TEXT        | NOT NULL                | IP address or hostname     |
| `os`         | TEXT        | NOT NULL                | Operating system           |
| `meta_data`  | JSONB       | NULL                    | Additional metadata (JSON) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()           | Record creation timestamp  |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW()           | Last update timestamp      |

#### Indexes

```sql
-- Foreign key index
CREATE INDEX idx_hosts_user_id ON hosts(user_id);

-- IP address uniqueness per user
CREATE UNIQUE INDEX idx_hosts_user_ip ON hosts(user_id, ip);

-- OS-based filtering
CREATE INDEX idx_hosts_os ON hosts(os);

-- JSONB metadata queries
CREATE INDEX idx_hosts_meta_data ON hosts USING GIN(meta_data);

-- Name-based searches
CREATE INDEX idx_hosts_name ON hosts(name);
```

#### Example Data

```sql
INSERT INTO hosts (user_id, name, ip, os, meta_data) VALUES
(1, 'Production Server', '192.168.1.100', 'Ubuntu 22.04',
 '{"provider": "aws", "region": "us-west-1", "instance_type": "t3.medium"}'),
(1, 'Development Server', '192.168.1.101', 'Ubuntu 22.04',
 '{"provider": "aws", "region": "us-west-1", "instance_type": "t3.small"}'),
(2, 'Database Server', '10.0.1.50', 'CentOS 8',
 '{"provider": "gcp", "zone": "us-central1-a", "machine_type": "n1-standard-2"}');
```

### SSH Credentials Table

The `ssh_credentials` table stores SSH key information for users.

```sql
CREATE TABLE ssh_credentials (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    key_name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    UNIQUE(user_id, key_name)
);
```

#### Columns

| Column      | Type    | Constraints             | Description                     |
| ----------- | ------- | ----------------------- | ------------------------------- |
| `id`        | SERIAL  | PRIMARY KEY             | Auto-incrementing credential ID |
| `user_name` | TEXT    | NOT NULL                | SSH username                    |
| `key_name`  | TEXT    | NOT NULL                | SSH key identifier              |
| `user_id`   | INTEGER | FOREIGN KEY → users(id) | Key owner                       |

#### Constraints

```sql
-- Unique key name per user
ALTER TABLE ssh_credentials
ADD CONSTRAINT uk_ssh_credentials_user_key
UNIQUE(user_id, key_name);

-- Foreign key constraint
ALTER TABLE ssh_credentials
ADD CONSTRAINT fk_ssh_credentials_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### Example Data

```sql
INSERT INTO ssh_credentials (user_name, key_name, user_id) VALUES
('ubuntu', 'production-key', 1),
('root', 'admin-key', 1),
('deploy', 'deployment-key', 2);
```

## 🔄 Data Relationships

### One-to-Many Relationships

#### Users → Hosts

- Each user can have multiple hosts
- Each host belongs to exactly one user
- Foreign key: `hosts.user_id → users.id`

#### Users → SSH Credentials

- Each user can have multiple SSH credentials
- Each credential belongs to exactly one user
- Foreign key: `ssh_credentials.user_id → users.id`

### Constraints and Rules

#### Referential Integrity

```sql
-- Cascade delete hosts when user is deleted
ALTER TABLE hosts
ADD CONSTRAINT fk_hosts_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Cascade delete SSH credentials when user is deleted
ALTER TABLE ssh_credentials
ADD CONSTRAINT fk_ssh_credentials_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### Business Rules

```sql
-- Email must be unique across all users
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE(email);

-- Host IP must be unique per user
ALTER TABLE hosts ADD CONSTRAINT uk_hosts_user_ip UNIQUE(user_id, ip);

-- SSH key name must be unique per user
ALTER TABLE ssh_credentials ADD CONSTRAINT uk_ssh_user_key UNIQUE(user_id, key_name);
```

## 📈 Performance Optimization

### Indexing Strategy

#### Primary Indexes

```sql
-- Users table indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users USING btree(name);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Hosts table indexes
CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_hosts_os ON hosts(os);
CREATE INDEX idx_hosts_name ON hosts USING btree(name);
CREATE INDEX idx_hosts_created_at ON hosts(created_at DESC);

-- JSONB metadata index for complex queries
CREATE INDEX idx_hosts_metadata_gin ON hosts USING GIN(meta_data);

-- SSH credentials indexes
CREATE INDEX idx_ssh_credentials_user_id ON ssh_credentials(user_id);
CREATE INDEX idx_ssh_credentials_user_name ON ssh_credentials(user_name);
```

#### Composite Indexes

```sql
-- User-specific host queries
CREATE INDEX idx_hosts_user_os ON hosts(user_id, os);
CREATE INDEX idx_hosts_user_created ON hosts(user_id, created_at DESC);

-- SSH credential lookups
CREATE INDEX idx_ssh_user_key ON ssh_credentials(user_id, key_name);
```

### Query Optimization

#### Common Query Patterns

**Get user hosts with filtering:**

```sql
-- Optimized query using indexes
SELECT h.* FROM hosts h
WHERE h.user_id = $1
  AND h.os = $2
ORDER BY h.created_at DESC
LIMIT 20 OFFSET $3;
```

**JSONB metadata queries:**

```sql
-- Query hosts by provider using GIN index
SELECT * FROM hosts
WHERE meta_data @> '{"provider": "aws"}';

-- Query hosts by specific metadata path
SELECT * FROM hosts
WHERE meta_data->>'region' = 'us-west-1';
```

**User aggregation queries:**

```sql
-- Count hosts per user
SELECT u.name, COUNT(h.id) as host_count
FROM users u
LEFT JOIN hosts h ON u.id = h.user_id
GROUP BY u.id, u.name;
```

### Connection Pooling

```go
// Database connection configuration
func Connect(cfg *config.Config) *sqlx.DB {
    db, err := sqlx.Connect("postgres", buildDSN(cfg))
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // Configure connection pool
    db.SetMaxOpenConns(25)                // Maximum open connections
    db.SetMaxIdleConns(10)                // Maximum idle connections
    db.SetConnMaxLifetime(5 * time.Minute) // Connection lifetime

    return db
}
```

## 🔧 Database Operations

### CRUD Operations

#### Users

**Create User:**

```sql
INSERT INTO users (name, email)
VALUES ($1, $2)
RETURNING id, created_at;
```

**Get User by ID:**

```sql
SELECT id, name, email, created_at, updated_at
FROM users
WHERE id = $1;
```

**Update User:**

```sql
UPDATE users
SET name = $1, email = $2, updated_at = NOW()
WHERE id = $3
RETURNING updated_at;
```

**Delete User:**

```sql
DELETE FROM users WHERE id = $1 RETURNING id;
```

#### Hosts

**Create Host:**

```sql
INSERT INTO hosts (user_id, name, ip, os, meta_data)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, created_at;
```

**Get Hosts by User:**

```sql
SELECT id, user_id, name, ip, os, meta_data, created_at, updated_at
FROM hosts
WHERE user_id = $1
ORDER BY created_at DESC;
```

**Update Host Metadata:**

```sql
UPDATE hosts
SET meta_data = meta_data || $1, updated_at = NOW()
WHERE id = $2
RETURNING updated_at;
```

### Advanced Queries

#### JSONB Operations

**Update specific metadata field:**

```sql
UPDATE hosts
SET meta_data = jsonb_set(meta_data, '{region}', '"us-east-1"')
WHERE id = $1;
```

**Remove metadata field:**

```sql
UPDATE hosts
SET meta_data = meta_data - 'old_field'
WHERE id = $1;
```

**Query by nested JSON path:**

```sql
SELECT * FROM hosts
WHERE meta_data #> '{aws,instance_type}' = '"t3.large"';
```

#### Aggregation Queries

**User statistics:**

```sql
SELECT
    u.name,
    COUNT(h.id) as total_hosts,
    COUNT(DISTINCT h.os) as unique_os,
    MIN(h.created_at) as first_host_created,
    MAX(h.updated_at) as last_activity
FROM users u
LEFT JOIN hosts h ON u.id = h.user_id
GROUP BY u.id, u.name;
```

**OS distribution:**

```sql
SELECT
    os,
    COUNT(*) as host_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM hosts
GROUP BY os
ORDER BY host_count DESC;
```

## 🚀 Migration Management

### Migration Structure

```
backend/migrations/
├── 001_initial_schema.sql
├── 002_add_ssh_credentials.sql
├── 003_add_host_indexes.sql
└── 004_jsonb_optimizations.sql
```

### Migration Examples

#### Initial Schema Migration (001_initial_schema.sql)

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hosts table
CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ip TEXT NOT NULL,
    os TEXT NOT NULL,
    meta_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create initial indexes
CREATE INDEX idx_hosts_user_id ON hosts(user_id);
CREATE INDEX idx_users_email ON users(email);
```

#### SSH Credentials Migration (002_add_ssh_credentials.sql)

```sql
-- Create ssh_credentials table
CREATE TABLE ssh_credentials (
    id SERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    key_name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_ssh_credentials_user_key UNIQUE(user_id, key_name)
);

-- Create indexes for ssh_credentials
CREATE INDEX idx_ssh_credentials_user_id ON ssh_credentials(user_id);
CREATE INDEX idx_ssh_credentials_user_name ON ssh_credentials(user_name);
```

### Migration Best Practices

1. **Incremental Changes**: Make small, incremental changes
2. **Rollback Strategy**: Include rollback instructions
3. **Data Validation**: Validate data integrity after migration
4. **Performance Testing**: Test migration performance on large datasets
5. **Backup**: Always backup before major schema changes

## 🔒 Security Considerations

### Data Protection

#### Sensitive Data

- Passwords are handled by Supabase Auth (not stored locally)
- SSH keys are referenced by name (actual keys stored securely)
- User emails are indexed but should be handled with care

#### Access Control

```sql
-- Create read-only user for reporting
CREATE USER reporting_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE clouding_db TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporting_user;

-- Create application user with limited permissions
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE clouding_db TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

#### Row Level Security (Future Enhancement)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;

-- Policy examples (for future implementation)
CREATE POLICY user_owns_hosts ON hosts
FOR ALL TO app_role
USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

## 📊 Monitoring and Maintenance

### Database Health Checks

```sql
-- Check table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/clouding"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U clouding_user -d clouding_db > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +30 -delete
```

---

For more information, see:

- [Backend Documentation](../backend/README.md) for application layer details
- [API Documentation](../api/README.md) for endpoint specifications
- [Getting Started](../getting-started.md) for setup instructions
