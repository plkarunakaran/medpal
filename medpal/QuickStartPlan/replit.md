# MedPal - Personal Health & Medicine Tracker

## Overview

MedPal is a comprehensive health management application that helps users track medications, manage appointments, monitor health metrics, and maintain emergency contacts. The application features a modern, responsive design with real-time medication reminders, family sharing capabilities, and emergency SOS functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management with React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect and session management
- **Session Storage**: PostgreSQL-based session store with connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle migrations and schema definitions
- **Key Entities**:
  - Users with profile information and authentication data
  - Medications with scheduling, dosage, and visual pill identification
  - Appointments with datetime, location, and type categorization
  - Health metrics tracking (blood pressure, weight, etc.)
  - Emergency contacts for SOS functionality
  - Family sharing permissions and access control
  - Reminder logs for medication adherence tracking

### Authentication & Authorization
- **Primary Auth**: Replit Auth with OIDC integration
- **Session Management**: Express sessions with PostgreSQL storage
- **User Data**: Automatic user creation and profile management
- **Access Control**: User-scoped data access with owner-only permissions

### API Architecture
- **Pattern**: RESTful API with conventional HTTP methods
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with structured responses
- **Logging**: Request/response logging with performance metrics

### Development Tooling
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: ESLint and Prettier integration
- **Development**: Hot module replacement and runtime error overlays

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Driver**: @neondatabase/serverless for WebSocket-based connections

### Authentication
- **Replit Auth**: OpenID Connect provider integration
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### UI Framework
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Consistent icon library for UI elements

### Development Tools
- **Vite Plugins**: Replit-specific plugins for development environment integration
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **React Query**: Server state management with caching and synchronization

### Date & Time
- **date-fns**: Comprehensive date manipulation and formatting library

### Form Handling
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Runtime type validation and schema definition