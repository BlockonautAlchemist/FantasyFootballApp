# Overview

This is a fantasy football assistant web application built as a FantasyPros-style clone. The application provides comprehensive tools for fantasy football management including start/sit decisions, waiver wire analysis, trade evaluation, lineup optimization, strength of schedule analysis, and fantasy news. It's designed as a frontend-focused MVP with mock data to simulate real fantasy football insights and recommendations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based stack with TypeScript and Vite for development. The frontend follows a feature-based organization pattern with pages organized by functionality (Dashboard, StartSit, Waivers, Trade, Lineup, SoS, News). Component architecture uses shadcn/ui for consistent UI components with Tailwind CSS for styling. The application implements client-side routing using Wouter and state management through TanStack Query for server state management.

## Backend Architecture
The backend is built with Express.js and TypeScript, following a lightweight API architecture. The server implements a RESTful API design pattern with routes prefixed under `/api`. Currently uses an in-memory storage implementation with interfaces designed for easy migration to persistent storage solutions. The architecture separates concerns with dedicated modules for routing, storage abstraction, and Vite integration for development.

## Data Storage Solutions
The application currently uses two data approaches: in-memory storage for user data with a clean interface abstraction, and mock JSON files for fantasy football data simulation. Database configuration is set up for PostgreSQL with Drizzle ORM, indicating preparation for production data persistence. The storage interface is designed to support CRUD operations and can be easily extended or replaced with persistent database implementations.

## Authentication and Authorization
Basic user schema is defined with username/password authentication structure using Zod validation. The current implementation provides the foundation for session-based authentication, though the MVP focuses on frontend functionality with mock data rather than full user management.

## Design System and UI Components
The application implements a comprehensive design system using shadcn/ui components with Tailwind CSS. Custom CSS variables define a consistent color scheme and design tokens. The component library includes specialized fantasy football components like PlayerCard, ComparisonPanel, TierBadge, RiskChip, and SoSHeatmap, providing domain-specific UI elements for fantasy sports data visualization.

# External Dependencies

## Core Framework Dependencies
- **React 18** with TypeScript for frontend development
- **Vite** for build tooling and development server
- **Express.js** for backend API server
- **Wouter** for client-side routing

## UI and Styling
- **Tailwind CSS** for utility-first styling
- **Radix UI** components for accessible UI primitives
- **shadcn/ui** component library for consistent design system
- **Lucide React** for icons

## Data Management
- **TanStack Query** for server state management and caching
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **Neon Database** serverless PostgreSQL for cloud database hosting
- **Zod** for schema validation and type safety

## Development and Build Tools
- **ESBuild** for fast JavaScript bundling
- **PostCSS** with Autoprefixer for CSS processing
- **React Hook Form** for form state management
- **date-fns** for date manipulation utilities

## Specialized Libraries
- **class-variance-authority** and **clsx** for conditional styling
- **cmdk** for command palette functionality
- **embla-carousel-react** for carousel components
- **connect-pg-simple** for PostgreSQL session storage