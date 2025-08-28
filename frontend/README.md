# Clouding

A developer-first infrastructure management platform that enables you to visualize, configure, and deploy your infrastructure with visual drag-and-drop simplicity.

## 🚀 Features

- **Visual Blueprint Builder**: Drag-and-drop interface for building infrastructure configurations
- **Developer-First Design**: Built with developers in mind - clean interfaces, monospace fonts, and dark themes
- **Component Library**: Extensive collection of infrastructure components including:
  - Web servers (Nginx, Apache)
  - Languages & runtimes (Java, Go, Python, Node.js, PHP)
  - Databases (PostgreSQL, MySQL, MongoDB, Redis, Kafka)
  - Containers & orchestration (Docker, Kubernetes)
  - Security & networking tools
  - Monitoring & observability solutions
- **Instant Deployment**: Deploy infrastructure changes instantly with intelligent deployment engine
- **Modern UI/UX**: Built with Tailwind CSS and Shadcn/ui components for a polished experience

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with Tailwind Animate
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Icons**: Lucide React
- **Flow Diagrams**: React Flow (@xyflow/react)
- **Forms**: React Hook Form with Zod validation
- **Theme**: Next Themes for dark/light mode support
- **Animations**: Class Variance Authority for component variants

### Key Dependencies

- **React**: 19 (Latest version)
- **Radix UI**: Complete set of accessible UI primitives
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation
- **Sonner**: Toast notifications
- **Date-fns**: Modern JavaScript date utility library

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Main dashboard
│   │   ├── create/        # Blueprint builder
│   │   └── settings/      # User settings
│   ├── privacy/           # Privacy policy page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── infrastructure/    # Infrastructure-specific components
│   │   ├── component-category.tsx
│   │   ├── component-item.tsx
│   │   ├── components-sidebar.tsx
│   │   ├── empty-state.tsx
│   │   ├── navigation-header.tsx
│   │   └── search-bar.tsx
│   ├── ui/               # Shadcn/ui components
│   ├── custom-node.tsx   # Flow diagram custom nodes
│   ├── dashboard-*.tsx   # Dashboard components
│   ├── navbar.tsx        # Navigation bar
│   └── theme-provider.tsx # Theme context provider
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── infrastructure-components.ts # Infrastructure component definitions
│   ├── node-types.ts     # Flow diagram node type definitions
│   └── utils.ts          # General utilities
├── public/               # Static assets
├── styles/               # Additional stylesheets
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd clouding
   ```

2. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
```

## 🎨 Design System

The project uses a custom design system built on top of Tailwind CSS:

- **Colors**: Custom color palette with accent colors (cyan, purple, orange)
- **Typography**: JetBrains Mono for monospace elements
- **Glass Effects**: Custom glass morphism effects for modern UI
- **Gradient Effects**: Custom gradient text and border utilities
- **Components**: Consistent component library using Shadcn/ui

### Custom CSS Classes

- `.gradient-text` - Gradient text effect
- `.gradient-border-btn` - Gradient border button
- `.glass-card-hover` - Glass morphism hover effects

## 🏗️ Architecture

### Component Architecture

- **Page Components**: Located in `app/` directory following Next.js App Router convention
- **UI Components**: Reusable components in `components/ui/` based on Shadcn/ui
- **Feature Components**: Business logic components in `components/`
- **Custom Hooks**: Reusable logic in `hooks/`
- **Utilities**: Helper functions and configurations in `lib/`

### State Management

- React state for local component state
- React Context for theme management
- React Hook Form for form state management

### Styling Approach

- Utility-first CSS with Tailwind
- Component variants with Class Variance Authority
- Custom CSS for complex animations and effects
- Responsive design with mobile-first approach

## 🔧 Configuration

### Next.js Configuration

- **TypeScript**: Strict mode enabled with custom path mapping
- **ESLint**: Build errors ignored for development flexibility
- **Images**: Unoptimized for faster development builds

### Tailwind Configuration

- Custom color scheme
- Extended typography with JetBrains Mono
- Custom animations and utilities
- Dark mode support

## 📝 Development Guidelines

### Code Standards

- **TypeScript**: Strict typing with proper interfaces
- **Component Structure**: Default exports for components, named exports for utilities
- **Naming Conventions**:
  - PascalCase for components
  - camelCase for functions and variables
  - kebab-case for file names
  - "handle" prefix for event handlers
- **Import Organization**: React, third-party, internal components, types

### Component Patterns

- Early returns for better readability
- Proper TypeScript interfaces for props
- Consistent error handling
- Accessible design patterns

## 🚀 Deployment

The application is configured for easy deployment:

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

The build output is optimized for performance with static generation where possible.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ by developers, for developers.
