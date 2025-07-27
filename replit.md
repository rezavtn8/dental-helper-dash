# Clinic Task Management System

## Overview

This is a full-stack clinic task management application built with React, Express, and PostgreSQL. The system helps veterinary clinics organize their daily operations through task management, team performance tracking, and role-based access control.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design Preference: Clean, professional interface focused on daily access with minimal clutter.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state, React Context for auth/clinic state
- **Routing**: React Router for client-side navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with `/api` prefix
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development**: Hot reloading with Vite middleware integration

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with `@neondatabase/serverless`

### Authentication and Authorization
- **Primary Auth**: Supabase authentication service
- **Role-Based Access**: Three user roles (owner, assistant, admin)
- **PIN Authentication**: Secondary PIN-based auth for assistants
- **Session Management**: Supabase session handling with React Context
- **Multi-Clinic Support**: Clinic-based user segmentation

## Key Components

### Client-Side Components
- **Dashboard Components**: Role-specific dashboards (Owner, Assistant, Admin)
- **Task Management**: CRUD operations for tasks with checklists
- **Team Performance**: Analytics and performance tracking
- **Template System**: Pre-built task templates for common clinic operations
- **Authentication Flow**: Login, signup, and PIN authentication screens

### Server-Side Components
- **Route Registration**: Centralized route management in `registerRoutes`
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Database Connection**: Centralized database connection and schema
- **Development Server**: Vite integration for hot reloading

### Shared Components
- **Schema Definitions**: Shared TypeScript types and Zod validators
- **Database Schema**: Drizzle schema definitions for type safety

## Data Flow

### Authentication Flow
1. User enters clinic code to access clinic-specific login
2. Owners authenticate via email/password through Supabase
3. Assistants authenticate via name/PIN combination
4. User profile and clinic data loaded from database
5. Role-based dashboard redirection

### Task Management Flow
1. Tasks created through templates or custom forms
2. Tasks stored with metadata (priority, due dates, assignments)
3. Real-time updates via database subscriptions
4. Checklist items tracked individually
5. Performance metrics calculated from task completion data

### Multi-Clinic Architecture
1. Clinic identification via URL slug or stored clinic code
2. All data scoped to specific clinic contexts
3. User permissions managed per clinic
4. Clinic-specific branding and configuration

## External Dependencies

### Core Dependencies
- **@supabase/supabase-js**: Authentication and real-time subscriptions
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: PostgreSQL connection management

### UI Dependencies
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **recharts**: Data visualization and charting

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-***: Replit-specific development tools

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Supabase Configuration**: Embedded in client-side code
- **Node Environment**: Detected via `NODE_ENV` variable

### Production Deployment
- Server serves built static files from `dist/public`
- Express API handles `/api` routes
- Database connections managed through connection pooling
- Environment-specific configuration via environment variables

### Development Workflow
- `npm run dev`: Starts development server with hot reloading
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes