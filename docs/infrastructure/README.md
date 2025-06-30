# Infrastructure Components

The Clouding platform provides a comprehensive library of infrastructure components that can be used to build and visualize infrastructure architectures through a drag-and-drop interface.

## 🎯 Overview

### Component Architecture

Infrastructure components are organized into categories and can be easily dragged onto the canvas to create infrastructure diagrams. Each component has:

- **Visual Representation**: Icon and styling in the UI
- **Configuration Schema**: Customizable properties
- **Connection Points**: Input/output handles for relationships
- **Metadata**: Tags, descriptions, and usage information

### Component Structure

```typescript
interface InfrastructureComponent {
  id: string; // Unique component identifier
  name: string; // Display name
  description: string; // Component description
  icon: LucideIcon; // Visual icon
  category: string; // Component category
  tags: string[]; // Searchable tags
  configSchema?: {
    // Configuration options
    properties: Record<string, any>;
    required: string[];
  };
}
```

## 🗂️ Component Categories

### 🌐 Web Servers

HTTP servers, reverse proxies, and load balancers for web applications.

#### Nginx

**High-performance web server and reverse proxy**

- **Use Cases**: Web hosting, reverse proxy, load balancing
- **Default Port**: 80 (HTTP), 443 (HTTPS)
- **Configuration Options**:
  - Server blocks (virtual hosts)
  - SSL/TLS certificates
  - Upstream servers
  - Caching settings
  - Rate limiting

```json
{
  "configSchema": {
    "properties": {
      "port": { "type": "number", "default": 80 },
      "ssl": { "type": "boolean", "default": false },
      "upstream": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Backend servers for load balancing"
      },
      "maxBodySize": { "type": "string", "default": "1m" },
      "workerProcesses": { "type": "number", "default": "auto" }
    },
    "required": ["port"]
  }
}
```

#### Apache HTTP Server

**Robust and feature-rich web server**

- **Use Cases**: Web hosting, content serving, CGI applications
- **Default Port**: 80 (HTTP), 443 (HTTPS)
- **Configuration Options**:
  - Virtual hosts
  - Modules (mod_rewrite, mod_ssl, etc.)
  - Directory permissions
  - Performance tuning

#### HAProxy

**Reliable load balancer and proxy server**

- **Use Cases**: Load balancing, SSL termination, health checks
- **Features**: High availability, traffic distribution, failover
- **Configuration Options**:
  - Backend pools
  - Health check intervals
  - Load balancing algorithms
  - SSL termination

### 💻 Languages & Runtimes

Programming language runtimes and execution environments.

#### Node.js

**JavaScript runtime for server-side applications**

- **Use Cases**: Web APIs, real-time applications, microservices
- **Default Port**: 3000
- **Configuration Options**:
  - Node version
  - Package manager (npm, yarn, pnpm)
  - Environment variables
  - Process management (PM2, Forever)

```json
{
  "configSchema": {
    "properties": {
      "version": { "type": "string", "default": "18.x" },
      "port": { "type": "number", "default": 3000 },
      "packageManager": {
        "type": "string",
        "enum": ["npm", "yarn", "pnpm"],
        "default": "npm"
      },
      "environment": { "type": "string", "default": "production" },
      "processManager": {
        "type": "string",
        "enum": ["pm2", "forever", "systemd"],
        "default": "pm2"
      }
    }
  }
}
```

#### Python

**Versatile programming language for various applications**

- **Use Cases**: Web frameworks (Django, Flask), data processing, ML/AI
- **Configuration Options**:
  - Python version
  - Virtual environment
  - Package requirements
  - WSGI server (Gunicorn, uWSGI)

#### Java

**Enterprise-grade platform for scalable applications**

- **Use Cases**: Spring Boot applications, microservices, enterprise systems
- **Configuration Options**:
  - JDK version
  - Application server (Tomcat, Jetty)
  - JVM parameters
  - Memory allocation

#### Go

**Efficient language for modern applications**

- **Use Cases**: APIs, microservices, system tools
- **Configuration Options**:
  - Go version
  - Build flags
  - CGO settings
  - Binary optimization

#### PHP

**Web-focused scripting language**

- **Use Cases**: WordPress, Laravel applications, content management
- **Configuration Options**:
  - PHP version
  - Extensions (MySQL, Redis, etc.)
  - FPM configuration
  - Memory limits

### 🗄️ Databases

Data storage and management systems.

#### PostgreSQL

**Advanced open-source relational database**

- **Use Cases**: OLTP, analytics, JSON storage, geospatial data
- **Default Port**: 5432
- **Configuration Options**:
  - Database version
  - Memory settings
  - Connection limits
  - Backup schedule
  - Replication setup

```json
{
  "configSchema": {
    "properties": {
      "version": { "type": "string", "default": "15" },
      "port": { "type": "number", "default": 5432 },
      "maxConnections": { "type": "number", "default": 100 },
      "sharedBuffers": { "type": "string", "default": "256MB" },
      "effectiveCacheSize": { "type": "string", "default": "1GB" },
      "walLevel": {
        "type": "string",
        "enum": ["minimal", "replica", "logical"],
        "default": "replica"
      }
    }
  }
}
```

#### MySQL

**Popular relational database management system**

- **Use Cases**: Web applications, e-commerce, content management
- **Default Port**: 3306
- **Configuration Options**:
  - MySQL version
  - Engine type (InnoDB, MyISAM)
  - Character set
  - Replication configuration

#### MongoDB

**Document-oriented NoSQL database**

- **Use Cases**: Content management, catalogs, real-time analytics
- **Default Port**: 27017
- **Configuration Options**:
  - MongoDB version
  - Replica set configuration
  - Sharding setup
  - Storage engine

#### Redis

**In-memory data structure store**

- **Use Cases**: Caching, session storage, real-time analytics
- **Default Port**: 6379
- **Configuration Options**:
  - Memory allocation
  - Persistence settings
  - Cluster configuration
  - Eviction policies

#### Apache Kafka

**Distributed event streaming platform**

- **Use Cases**: Event sourcing, real-time data pipelines, microservices communication
- **Default Port**: 9092
- **Configuration Options**:
  - Broker configuration
  - Topic settings
  - Replication factor
  - Retention policies

### 📦 Containers & Orchestration

Containerization and container orchestration platforms.

#### Docker

**Containerization platform**

- **Use Cases**: Application packaging, development environments, microservices
- **Configuration Options**:
  - Docker version
  - Registry configuration
  - Volume mounts
  - Network settings
  - Resource limits

```json
{
  "configSchema": {
    "properties": {
      "version": { "type": "string", "default": "latest" },
      "image": { "type": "string", "required": true },
      "ports": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Port mappings (host:container)"
      },
      "volumes": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Volume mounts"
      },
      "environment": {
        "type": "object",
        "description": "Environment variables"
      },
      "restart": {
        "type": "string",
        "enum": ["no", "always", "unless-stopped", "on-failure"],
        "default": "unless-stopped"
      }
    },
    "required": ["image"]
  }
}
```

#### Kubernetes

**Container orchestration platform**

- **Use Cases**: Container orchestration, scaling, service discovery
- **Configuration Options**:
  - Cluster configuration
  - Namespace organization
  - Resource quotas
  - Ingress controllers
  - Storage classes

#### Docker Compose

**Multi-container Docker application definition**

- **Use Cases**: Development environments, testing, simple deployments
- **Configuration Options**:
  - Service definitions
  - Network configuration
  - Volume management
  - Environment variables

### 🔒 Security & Networking

Security tools and networking components.

#### SSL/TLS Certificate

**Secure communication certificates**

- **Use Cases**: HTTPS encryption, API security, service-to-service communication
- **Configuration Options**:
  - Certificate authority
  - Domain names
  - Validity period
  - Key size
  - Certificate format

#### Firewall

**Network traffic filtering and security**

- **Use Cases**: Network security, access control, traffic filtering
- **Configuration Options**:
  - Rule definitions
  - Port configurations
  - IP allowlists/blocklists
  - Protocol settings

#### VPN

**Virtual private network for secure connectivity**

- **Use Cases**: Remote access, site-to-site connectivity, secure tunneling
- **Configuration Options**:
  - VPN protocol (OpenVPN, WireGuard, IPSec)
  - Authentication methods
  - Encryption settings
  - Network ranges

#### OAuth2/JWT Auth

**Authentication and authorization services**

- **Use Cases**: API authentication, single sign-on, token management
- **Configuration Options**:
  - Token expiration
  - Signing algorithms
  - Scope definitions
  - Refresh token settings

### 📊 Monitoring & Observability

Monitoring, logging, and observability tools.

#### Prometheus

**Time-series monitoring and alerting**

- **Use Cases**: Metrics collection, monitoring, alerting
- **Default Port**: 9090
- **Configuration Options**:
  - Scrape intervals
  - Retention period
  - Alert rules
  - Target discovery

#### Grafana

**Visualization and analytics platform**

- **Use Cases**: Dashboards, data visualization, monitoring
- **Default Port**: 3000
- **Configuration Options**:
  - Data sources
  - Dashboard templates
  - User authentication
  - Plugin configuration

#### ELK Stack (Elasticsearch, Logstash, Kibana)

**Search, analytics, and visualization platform**

- **Use Cases**: Log aggregation, search, analytics, visualization
- **Configuration Options**:
  - Index settings
  - Log parsing rules
  - Dashboard configuration
  - Cluster settings

#### Jaeger

**Distributed tracing system**

- **Use Cases**: Microservices tracing, performance monitoring
- **Configuration Options**:
  - Sampling strategies
  - Storage backend
  - UI configuration
  - Agent settings

### ☁️ Cloud Services

Cloud provider services and integrations.

#### AWS Services

- **EC2**: Virtual compute instances
- **RDS**: Managed relational databases
- **S3**: Object storage
- **Lambda**: Serverless functions
- **CloudFront**: Content delivery network
- **Route 53**: DNS and domain management

#### Google Cloud Platform

- **Compute Engine**: Virtual machines
- **Cloud SQL**: Managed databases
- **Cloud Storage**: Object storage
- **Cloud Functions**: Serverless computing
- **Cloud CDN**: Content delivery
- **Cloud DNS**: Domain name system

#### Azure Services

- **Virtual Machines**: Compute instances
- **Azure SQL**: Managed databases
- **Blob Storage**: Object storage
- **Functions**: Serverless platform
- **CDN**: Content delivery network
- **DNS**: Domain name services

## 🔧 Component Configuration

### Configuration Schema

Each component defines its configurable properties using JSON Schema:

```typescript
interface ConfigSchema {
  properties: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "array" | "object";
      default?: any;
      enum?: string[];
      description?: string;
      minimum?: number;
      maximum?: number;
      items?: any;
    }
  >;
  required: string[];
}
```

### Configuration Examples

#### Web Server Configuration

```json
{
  "nginx": {
    "port": 80,
    "ssl": true,
    "upstream": ["backend1:8080", "backend2:8080"],
    "maxBodySize": "10m",
    "workerProcesses": 4,
    "sslCertificate": "/path/to/cert.pem",
    "sslPrivateKey": "/path/to/private.key"
  }
}
```

#### Database Configuration

```json
{
  "postgresql": {
    "version": "15",
    "port": 5432,
    "maxConnections": 200,
    "sharedBuffers": "512MB",
    "effectiveCacheSize": "2GB",
    "databases": ["app_db", "analytics_db"],
    "users": [
      { "name": "app_user", "privileges": ["CONNECT", "SELECT", "INSERT"] },
      { "name": "admin_user", "privileges": ["ALL"] }
    ]
  }
}
```

#### Container Configuration

```json
{
  "docker": {
    "image": "nginx:alpine",
    "ports": ["80:80", "443:443"],
    "volumes": ["./nginx.conf:/etc/nginx/nginx.conf", "./ssl:/etc/nginx/ssl"],
    "environment": {
      "NGINX_HOST": "example.com",
      "NGINX_PORT": "80"
    },
    "restart": "unless-stopped",
    "healthcheck": {
      "test": "curl -f http://localhost/health || exit 1",
      "interval": "30s",
      "timeout": "10s",
      "retries": 3
    }
  }
}
```

## 🔗 Component Relationships

### Connection Types

Components can be connected to show relationships and data flow:

#### Network Connections

- **HTTP/HTTPS**: Web traffic between components
- **TCP/UDP**: General network connections
- **Database**: Database connections and queries
- **Message Queue**: Asynchronous message passing

#### Data Flow

- **Input**: Data entering a component
- **Output**: Data leaving a component
- **Bidirectional**: Two-way data exchange
- **Broadcast**: One-to-many data distribution

### Connection Configuration

```typescript
interface Connection {
  id: string;
  source: string; // Source component ID
  target: string; // Target component ID
  type: ConnectionType; // Connection type
  config?: {
    protocol?: string;
    port?: number;
    authentication?: any;
    encryption?: boolean;
  };
}
```

## 🎨 Visual Customization

### Component Styling

Components can be visually customized:

#### Color Schemes

- **Category Colors**: Different colors for each component category
- **Status Colors**: Green (healthy), yellow (warning), red (error)
- **Custom Colors**: User-defined color schemes

#### Icons and Labels

- **Component Icons**: Lucide React icons for visual identification
- **Custom Labels**: User-defined component names
- **Status Indicators**: Visual status representation

### Layout Options

#### Automatic Layout

- **Hierarchical**: Top-down organization
- **Force-directed**: Physics-based positioning
- **Grid**: Structured grid layout
- **Circular**: Circular arrangement

#### Manual Layout

- **Drag and Drop**: Free-form positioning
- **Snap to Grid**: Aligned positioning
- **Grouping**: Component grouping and organization

## 🚀 Custom Components

### Creating Custom Components

Users can create custom infrastructure components:

```typescript
const customComponent: InfrastructureComponent = {
  id: "custom-api-gateway",
  name: "API Gateway",
  description: "Custom API gateway with rate limiting and authentication",
  icon: Shield,
  category: "custom",
  tags: ["api", "gateway", "security"],
  configSchema: {
    properties: {
      port: { type: "number", default: 8080 },
      rateLimit: { type: "number", default: 1000 },
      authMethod: {
        type: "string",
        enum: ["jwt", "oauth2", "apikey"],
        default: "jwt",
      },
    },
    required: ["port"],
  },
};
```

### Component Templates

Pre-built templates for common infrastructure patterns:

#### LAMP Stack

- Linux + Apache + MySQL + PHP
- Pre-configured with common settings
- Optimized for web applications

#### MEAN Stack

- MongoDB + Express + Angular + Node.js
- Modern web application stack
- Real-time capabilities

#### Microservices Pattern

- API Gateway + Multiple Services + Database
- Container-based deployment
- Service discovery and load balancing

## 📊 Usage Analytics

### Component Popularity

- Most used components
- Category preferences
- Configuration patterns

### Performance Metrics

- Component load times
- Configuration validation speed
- Diagram rendering performance

### User Behavior

- Common component combinations
- Preferred layout patterns
- Configuration complexity

---

For more information, see:

- [Frontend Documentation](../frontend/README.md) for component implementation
- [Getting Started](../getting-started.md) for setup instructions
- [Development Guide](../development/README.md) for creating custom components
