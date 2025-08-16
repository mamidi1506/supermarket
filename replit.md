# FreshMart - Supermarket Web Application

## Overview

FreshMart is a full-stack supermarket web application similar to Swiggy Instamart/Blinkit that enables customers to browse and purchase groceries online with fast delivery. The application features a modern React frontend with TypeScript and a Node.js/Express backend, providing functionality for product browsing, cart management, order processing, and payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes based on authentication
- **UI Framework**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Authentication**: Session-based authentication with OpenID Connect (Replit Auth)
- **Payment Processing**: Stripe integration for secure payment handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with OpenID Connect strategy for Replit authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful API endpoints with proper error handling and logging middleware

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless driver with WebSocket support

### Key Data Models
- **Users**: Customer and admin user management with Stripe integration
- **Categories**: Product categorization (Vegetables, Fruits, Dairy, Snacks, Beverages)
- **Products**: Inventory management with pricing, stock, and images
- **Cart**: User shopping cart with quantity management
- **Orders**: Order processing with status tracking and delivery options
- **Coupons**: Discount code system with validation
- **Feedback**: Customer rating and review system

### Authentication & Authorization
- **Strategy**: OpenID Connect with Replit as identity provider
- **Session Storage**: PostgreSQL-backed sessions with TTL management
- **Role-based Access**: Customer and admin role separation
- **Protected Routes**: Client-side route protection with authentication checks

### Payment Integration
- **Provider**: Stripe for payment processing
- **Implementation**: Stripe Elements for secure card input with server-side payment intent creation
- **Security**: Environment-based API key management with test mode support

### File Structure & Organization
- **Monorepo Structure**: Shared schema definitions between client and server
- **Client**: React application with component-based architecture
- **Server**: Express API with modular route organization
- **Shared**: Common TypeScript types and database schema definitions

### Development & Build Process
- **Development**: Vite dev server with HMR and Express backend integration
- **Build**: Separate client (Vite) and server (esbuild) build processes
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Organization**: Path aliases for clean imports and modular structure

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, Wouter for routing
- **Build Tools**: Vite with TypeScript support and React plugin
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer

### UI Component Libraries
- **Radix UI**: Complete set of accessible UI primitives (@radix-ui/react-*)
- **Utility Libraries**: clsx and tailwind-merge for conditional styling
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Express.js**: Web framework with middleware support
- **Authentication**: Passport.js with OpenID Connect strategy
- **Session Management**: express-session with connect-pg-simple store
- **Database**: Drizzle ORM with Neon PostgreSQL driver

### Payment & External Services
- **Stripe**: Payment processing with @stripe/stripe-js and @stripe/react-stripe-js
- **Database**: Neon serverless PostgreSQL with WebSocket support

### State Management & Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for date formatting and manipulation

### Development Tools
- **TypeScript**: Strict type checking with ES modules
- **Replit Integration**: Development plugins for Replit environment
- **Build Optimization**: esbuild for server bundling, Vite for client