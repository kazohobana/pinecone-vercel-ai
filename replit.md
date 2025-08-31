# Stellarium AI ICO Platform

## Overview

This is a full-stack web application for the Stellarium AI Initial Coin Offering (ICO). The platform provides both user-facing and admin functionality for cryptocurrency token sales. Users can connect Web3 wallets, view ICO progress, purchase tokens, and track their investments. Administrators can manage ICO stages, monitor analytics, and configure platform settings. The application is built as a single-page application that runs entirely in the browser with no external installation requirements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React patterns
- **Routing**: Wouter for lightweight client-side routing without external dependencies
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom CSS variables for theming, configured for dark mode

### Backend Architecture
- **Runtime**: Node.js with Express.js as the web framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API with JSON responses following conventional HTTP methods
- **Storage**: In-memory storage implementation with interface abstraction for easy database migration
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite middleware integration for seamless development experience

### Data Storage Design
- **Database**: PostgreSQL configured through Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Connection**: Neon serverless PostgreSQL for cloud-native database hosting
- **Storage Interface**: Abstract storage interface allowing easy switching between in-memory and database implementations

### Authentication & Web3 Integration
- **Wallet Integration**: Web3 wallet connection (MetaMask, Trust Wallet) using ethereum provider
- **Authentication Flow**: Wallet-based authentication without traditional login/password
- **Transaction Management**: Web3 transaction handling with status tracking and confirmations
- **Participant Management**: Automatic participant creation on wallet connection

### Component Architecture
- **Design System**: Consistent component library with variant-based styling using class-variance-authority
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Data Visualization**: Chart.js integration for ICO progress and analytics charts
- **Responsive Design**: Mobile-first approach with responsive breakpoints and touch-friendly interfaces

### Development Workflow
- **Type Safety**: Shared TypeScript interfaces between client and server via shared schema
- **Code Quality**: ESLint and TypeScript strict mode for code consistency
- **Path Resolution**: Absolute imports with path mapping for cleaner import statements
- **Error Handling**: Runtime error overlay and comprehensive error boundaries

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and API caching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **wouter**: Lightweight routing library for single-page applications

### UI Component Dependencies
- **@radix-ui/***: Headless UI components for accessibility and functionality
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe component variants and styling
- **lucide-react**: Modern icon library with React components

### Development Dependencies
- **vite**: Build tool and development server with hot module replacement
- **typescript**: Static type checking and enhanced developer experience
- **@replit/vite-plugin-***: Replit-specific development tooling and integrations

### Web3 Integration
- **ethereum**: Browser-based Web3 wallet integration (MetaMask, Trust Wallet)
- **crypto**: Node.js built-in module for cryptographic operations and UUID generation

### Validation & Forms
- **zod**: Runtime type validation and schema definition
- **@hookform/resolvers**: React Hook Form integration with Zod validation
- **react-hook-form**: Performant form library with minimal re-renders

### Data Visualization
- **chart.js**: Flexible charting library for ICO progress and analytics
- **date-fns**: Modern date utility library for time calculations and formatting