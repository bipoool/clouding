# Frontend Documentation

The Clouding frontend is a modern Next.js application built with TypeScript, Tailwind CSS, and a comprehensive component library using Shadcn/ui and Radix UI primitives.

## 🏗️ Architecture Overview

### Technology Stack

#### Core Framework

- **Next.js 15.2.4**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Static type checking
- **App Router**: File-based routing system

#### Styling & UI

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind Animate**: Animation utilities
- **Next Themes**: Theme switching support

#### State Management & Forms

- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation
- **React Context**: Global state management

#### Visualization & Interaction

- **React Flow (@xyflow/react)**: Node-based diagrams
- **Lucide React**: Beautiful icon library
- **GSAP**: High-performance animations
- **Sonner**: Toast notifications

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── about/             # Static pages
│   ├── auth/              # Authentication
│   ├── dashboard/         # Main application
│   │   ├── create/        # Infrastructure builder
│   │   └── settings/      # User settings
│   ├── privacy/           # Legal pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── homepage/          # Landing page components
│   ├── infrastructure/    # Infrastructure builder
│   ├── ui/               # Shadcn/ui components
│   ├── custom-node.tsx   # Flow diagram nodes
│   ├── dashboard-*.tsx   # Dashboard components
│   ├── navbar.tsx        # Navigation
│   └── theme-provider.tsx # Theme context
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and data
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🎨 Design System

### Theme Configuration

#### Color Palette

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 47.4% 11.2%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

#### Custom Design Tokens

```css
/* Gradient effects */
.gradient-text {
  background: linear-gradient(135deg, #06b6d4, #8b5cf6, #f97316);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Glass morphism */
.glass-card-hover {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animated background */
.animated-bg {
  background: linear-gradient(-45deg, #0a0a0a, #1a1a1a, #0a0a0a, #2a2a2a);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
```

### Typography

- **Primary Font**: JetBrains Mono (monospace)
- **Fallback**: System monospace fonts
- **Font Loading**: Custom font loader component

## 🎯 Component Architecture

### Page Components (App Router)

#### Root Layout (`app/layout.tsx`)

```tsx
import type React from "react";
import type { Metadata } from "next";
import { FontLoader } from "@/components/font-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clouding - Infrastructure Management",
  description: "Visualize. Configure. Deploy.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased animated-bg min-h-screen">
        <FontLoader />
        {children}
      </body>
    </html>
  );
}
```

#### Homepage (`app/page.tsx`)

```tsx
"use client";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import {
  Background,
  HeroSection,
  FeaturesSection,
} from "@/components/homepage";

export default function HomePage() {
  return (
    <>
      <Background />
      <div className="min-h-screen relative overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>
      <FeaturesSection />
      <div className="relative z-20">
        <Footer />
      </div>
    </>
  );
}
```

### Component Categories

#### 1. Homepage Components (`components/homepage/`)

**Hero Section**

```tsx
export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryAction?: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
}

export function HeroSection({
  title = "Visualize. Configure. Deploy.",
  subtitle = "A developer-first infrastructure management platform...",
  primaryAction = { text: "Get Started", href: "/dashboard" },
  secondaryAction = { text: "Learn More", href: "/about" },
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Implementation */}
    </section>
  );
}
```

**Feature Cards**

```tsx
export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: FeatureCardProps) {
  return (
    <div className="glass-card-hover rounded-xl p-6 transition-all duration-300 hover:scale-105">
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
```

#### 2. Infrastructure Components (`components/infrastructure/`)

**Components Sidebar**

```tsx
export interface ComponentsSidebarProps {
  categories: ComponentCategory[];
  onComponentSelect: (component: InfrastructureComponent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ComponentsSidebar({
  categories,
  onComponentSelect,
  searchQuery,
  onSearchChange,
}: ComponentsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  return (
    <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search components..."
      />

      <div className="mt-4 space-y-2">
        {categories.map((category) => (
          <ComponentCategory
            key={category.id}
            category={category}
            isExpanded={expandedCategories.has(category.id)}
            onToggle={() => toggleCategory(category.id)}
            onComponentSelect={onComponentSelect}
          />
        ))}
      </div>
    </div>
  );
}
```

**Custom Nodes for React Flow**

```tsx
export interface CustomNodeData {
  label: string;
  type: "server" | "database" | "service";
  config?: Record<string, any>;
}

export function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <>
      <div
        className={`
        px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400
        ${selected ? "border-blue-500" : ""}
      `}
      >
        <Handle type="target" position={Position.Top} />

        <div className="flex items-center">
          <div className="ml-2">
            <div className="text-lg font-bold">{data.label}</div>
            <div className="text-gray-500">{data.type}</div>
          </div>
        </div>

        <Handle type="source" position={Position.Bottom} />
      </div>

      <NodeConfigurationDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        nodeData={data}
      />
    </>
  );
}
```

#### 3. UI Components (`components/ui/`)

The UI components are built using Shadcn/ui patterns:

**Button Component**

```tsx
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Custom Hooks

#### Theme Hook

```tsx
import { useTheme } from "next-themes";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
  };
}
```

#### Mobile Detection Hook

```tsx
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

## 🗂️ Data Management

### Infrastructure Components Data

#### Component Definitions (`lib/infrastructure-components.ts`)

```tsx
export interface InfrastructureComponent {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  tags: string[];
  configSchema?: {
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  components: InfrastructureComponent[];
}

export const infrastructureComponents: ComponentCategory[] = [
  {
    id: "web-servers",
    name: "Web Servers",
    description: "HTTP servers and reverse proxies",
    icon: Server,
    components: [
      {
        id: "nginx",
        name: "Nginx",
        description: "High-performance web server and reverse proxy",
        icon: Server,
        category: "web-servers",
        tags: ["web", "proxy", "load-balancer"],
        configSchema: {
          properties: {
            port: { type: "number", default: 80 },
            ssl: { type: "boolean", default: false },
            upstream: { type: "array", items: { type: "string" } },
          },
          required: ["port"],
        },
      },
    ],
  },
];
```

### Node Types for React Flow

#### Node Type Definitions (`lib/node-types.ts`)

```tsx
export interface NodeData {
  label: string;
  type: NodeType;
  component?: InfrastructureComponent;
  config?: Record<string, any>;
}

export type NodeType = "infrastructure" | "connection" | "group";

export const nodeTypes = {
  infrastructure: CustomNode,
  connection: ConnectionNode,
  group: GroupNode,
};

export const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: "#06b6d4",
    strokeWidth: 2,
  },
};
```

## 🎭 Styling Patterns

### Responsive Design

```tsx
// Mobile-first responsive classes
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2 md:gap-6
  lg:grid-cols-3 lg:gap-8
  xl:grid-cols-4
">
```

### Component Variants

```tsx
// Using Class Variance Authority
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        glass: "backdrop-blur-md bg-white/10 border-white/20",
        gradient: "bg-gradient-to-br from-primary/10 to-secondary/10",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

### Animation Patterns

```tsx
// Tailwind CSS animations
<div className="
  transform transition-all duration-300 ease-in-out
  hover:scale-105 hover:shadow-lg
  animate-in slide-in-from-bottom-4
">
```

## 🔗 Navigation & Routing

### App Router Structure

```
app/
├── page.tsx              # / (Homepage)
├── about/page.tsx        # /about
├── auth/page.tsx         # /auth (Login/Signup)
├── privacy/page.tsx      # /privacy
├── dashboard/
│   ├── page.tsx         # /dashboard (Overview)
│   ├── create/page.tsx  # /dashboard/create (Builder)
│   └── settings/page.tsx # /dashboard/settings
└── not-found.tsx        # 404 page
```

### Navigation Component

```tsx
export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppTheme();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-card-hover">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text">Clouding</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </nav>
  );
}
```

## 🧪 Development Patterns

### Component Development Guidelines

#### 1. Component Structure

```tsx
// 1. Imports (React, Next.js, third-party, internal)
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

// 7. Default export
export default Component;
```

#### 2. Form Handling Pattern

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
      console.log(values);
    } catch (error) {
      // Error handling
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## 🚀 Performance Optimization

### Next.js Optimizations

- App Router for improved performance
- Automatic code splitting
- Image optimization with next/image
- Font optimization with next/font

### Component Optimization

```tsx
// Lazy loading for heavy components
const InfrastructureBuilder = lazy(
  () => import("@/components/infrastructure-builder")
);

// Memoization for expensive computations
const processedData = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// Callback memoization
const handleCallback = useCallback(
  (id: string) => {
    // Handler logic
  },
  [dependency]
);
```

### Bundle Optimization

- Tree shaking for unused code elimination
- Dynamic imports for code splitting
- Optimized Tailwind CSS purging

## 📱 Responsive Design

### Breakpoint Strategy

```tsx
// Tailwind breakpoints
sm: '640px',   // Small devices
md: '768px',   // Medium devices
lg: '1024px',  // Large devices
xl: '1280px',  // Extra large devices
2xl: '1536px'  // 2X large devices

// Usage examples
<div className="
  text-sm md:text-base lg:text-lg
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement for larger screens.

---

For more specific information, see:

- [API Integration](../api/README.md) for backend communication
- [Component Library](../ui-components.md) for detailed component documentation
- [Development Guide](../development/README.md) for contribution guidelines
