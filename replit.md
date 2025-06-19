# Logistics Management System - Architecture Documentation

## Overview

This is a full-stack logistics management application built with React, Express, and PostgreSQL. The system manages delivery trucks, clients, and deliveries with real-time tracking capabilities. It features a modern web interface with a dashboard for monitoring truck locations, managing deliveries, and optimizing routes.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **UI Components**: Shadcn/ui component library with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Schema Location**: `shared/schema.ts` - contains all database table definitions
- **Tables**: 
  - `clients` - Customer information with geographic coordinates
  - `trucks` - Vehicle fleet with real-time location tracking
  - `deliveries` - Delivery orders linking clients and trucks
  - `routes` - Optimized delivery routes with multiple stops
- **Database Provider**: Neon Database (serverless PostgreSQL)

### Backend Architecture
- **Server Entry**: `server/index.ts` - Express app setup with middleware
- **Routes**: `server/routes.ts` - RESTful API endpoints for all CRUD operations
- **Storage Interface**: `server/storage.ts` - Abstraction layer for data operations
- **Development**: In-memory storage implementation for rapid prototyping
- **Production**: Database-backed storage using Drizzle ORM

### Frontend Architecture
- **Entry Point**: `client/src/main.tsx` - React app initialization
- **App Structure**: `client/src/App.tsx` - Main app component with routing
- **Pages**: Dashboard-centric single-page application
- **Components**: 
  - `sidebar.tsx` - Truck management and fleet overview
  - `map.tsx` - Interactive map with real-time truck positions
  - `delivery-panel.tsx` - Delivery management interface
  - `truck-status.tsx` - Individual truck status display
- **Utilities**: Route optimization algorithms and formatting helpers

### UI System
- **Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom logistics-specific color scheme
- **Theme**: Light theme with neutral color palette
- **Mobile**: Responsive design with mobile-first approach

## Data Flow

1. **Client Requests**: Frontend makes API calls through TanStack Query
2. **API Layer**: Express routes handle HTTP requests and validate input
3. **Business Logic**: Storage interface processes business operations
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Real-time Updates**: Polling-based updates for truck locations and delivery status
6. **UI Updates**: React components re-render based on query cache updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless deployment
- **drizzle-orm**: Type-safe database queries and schema management
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **embla-carousel-react**: Touch-friendly carousels

### Development Dependencies
- **vite**: Fast development server and build tool
- **typescript**: Type safety across the application
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` - Starts both client and server in development mode
- **Port**: 5000 - Single port serves both API and static assets
- **Hot Reload**: Vite HMR for instant frontend updates
- **Server Restart**: Manual restart required for backend changes

### Production Build
- **Build Process**: 
  1. `vite build` - Compiles React app to static assets
  2. `esbuild` - Bundles Express server for production
- **Output**: `dist/` directory contains both client and server builds
- **Deployment**: Replit autoscale deployment target
- **Database**: Requires `DATABASE_URL` environment variable

### Environment Configuration
- **Development**: Uses in-memory storage by default
- **Production**: Connects to PostgreSQL via DATABASE_URL
- **Modules**: Node.js 20, PostgreSQL 16 via Replit nix configuration

## Changelog
- June 19, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.