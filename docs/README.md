# Clouding - Infrastructure Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.23.4-blue)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)

## Overview

Clouding is a developer-first infrastructure management platform that enables users to visualize, configure, and deploy infrastructure with visual drag-and-drop simplicity. The platform consists of a Go-based REST API backend and a modern Next.js frontend.

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Go/Gin)      │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Shadcn/ui
- **UI Components**: Radix UI primitives
- **Diagrams**: React Flow (@xyflow/react)
- **Authentication**: Supabase Auth integration
- **State Management**: React Context + React Hook Form

### Backend Stack

- **Language**: Go 1.23.4
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL with SQLX
- **Query Builder**: Squirrel
- **Authentication**: JWT with Supabase integration
- **Logging**: Zerolog
- **Configuration**: Viper
- **Cloud**: AWS SDK (Secrets Manager)

## 📚 Documentation Structure

This documentation is organized into the following sections:

### 🚀 [Getting Started](./getting-started.md)

- Prerequisites and installation
- Environment setup
- Running the application
- Development workflow

### 🏛️ [Backend Documentation](./backend/README.md)

- API architecture and design patterns
- Database schema and models
- Authentication and middleware
- API endpoints reference

### 🎨 [Frontend Documentation](./frontend/README.md)

- Component architecture
- Page structure and routing
- UI component library
- Styling and theming

### 🗄️ [Database Documentation](./database/README.md)

- Schema design
- Entity relationships
- Migration management
- Data models

### 🔌 [API Reference](./api/README.md)

- REST API endpoints
- Request/response schemas
- Authentication flows
- Error handling

### 🎯 [Infrastructure Components](./infrastructure/README.md)

- Available infrastructure components
- Component categories and usage
- Custom node types
- Configuration options

### 🛠️ [Development Guide](./development/README.md)

- Code standards and conventions
- Testing strategies
- Deployment procedures
- Contributing guidelines

### 🔧 [Configuration](./configuration/README.md)

- Environment variables
- Configuration management
- Secrets management
- Production setup

## 🎯 Key Features

### Infrastructure Visualization

- Drag-and-drop infrastructure components
- Visual configuration builder
- Real-time preview and validation
- Component relationship mapping

### Component Library

- **Web Servers**: Nginx, Apache
- **Languages**: Java, Go, Python, Node.js, PHP
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis, Kafka
- **Containers**: Docker, Kubernetes
- **Security**: SSL, Firewall, VPN
- **Monitoring**: Prometheus, Grafana, ELK Stack

### User Management

- User authentication and authorization
- Host/server management
- SSH credential management
- Multi-user support

### Modern UI/UX

- Responsive design with mobile support
- Dark/light theme support
- Glass morphism design effects
- Smooth animations and transitions

## 🚦 Project Status

### Current Implementation

- ✅ Backend API with user and host management
- ✅ Frontend homepage and dashboard structure
- ✅ Database schema with PostgreSQL
- ✅ Authentication middleware
- ✅ Component library and UI system
- ✅ Infrastructure component definitions

### In Development

- 🔄 Infrastructure builder with React Flow
- 🔄 Host configuration and deployment
- 🔄 SSH key management
- 🔄 Real-time updates and notifications

### Planned Features

- 📋 Infrastructure templates
- 📋 Deployment automation
- 📋 Monitoring integration
- 📋 Cost optimization recommendations

## 🤝 Contributing

Please read our [Development Guide](./development/README.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review API reference for integration help

---

**Last Updated**: December 2024  
**Version**: 0.1.0  
**Maintainers**: Development Team
