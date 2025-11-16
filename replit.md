# Patient Monitoring Dashboard

## Overview

This is a healthcare dashboard application for monitoring hospitalized patients. The system provides real-time visibility into patient admissions, displaying key indicators and allowing medical staff to filter and track patients across different departments, specialties, and procedures. Built as a responsive web application, it serves healthcare professionals who need quick access to patient data on desktop, tablet, and mobile devices.

The application connects to an existing PostgreSQL database with established healthcare data schemas and provides a streamlined interface for viewing patient information without modifying the underlying database structure.

**Current Status:** ✅ Fully operational with 246 hospitalized patients being monitored. All features tested and working: authentication, dynamic filters, real-time indicators (161.6 days average stay, 43% bed occupancy), and responsive patient list.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, using Vite as the build tool and development server.

**UI Component System:** Shadcn/ui (New York style variant) built on Radix UI primitives, providing an accessible, pre-styled component library. Components use Tailwind CSS for styling with a healthcare-focused design system emphasizing clarity and professional aesthetics.

**State Management:** TanStack Query (React Query) handles server state, data fetching, and caching. No global client state management is needed as the application is primarily data-display focused rather than stateful.

**Routing:** Wouter provides lightweight client-side routing with two main routes: login page and dashboard.

**Form Handling:** React Hook Form with Zod schema validation ensures type-safe form submissions, particularly for authentication.

**Responsive Design:** Mobile-first approach using Tailwind's responsive breakpoints. The layout adapts from single-column stacked cards on mobile to multi-column grids and full tables on desktop.

### Backend Architecture

**Runtime:** Node.js with Express.js handling HTTP requests.

**Authentication:** Session-based authentication using express-session with hardcoded credentials (admin/@dm1n and operador/Oper4321). Sessions are stored in-memory, suitable for development or small-scale deployment. All API endpoints except login/logout require authentication via middleware.

**Database Access:** Direct PostgreSQL connection using the `pg` library's connection pool. Queries are written as raw SQL rather than using an ORM, providing direct control over complex healthcare data queries.

**API Design:** RESTful endpoints returning JSON. Key endpoints include:
- `/api/auth/login` and `/api/auth/logout` for authentication
- `/api/pacientes-internados` for fetching hospitalized patients with optional query parameters for filtering
- `/api/indicadores` for dashboard metrics
- Reference data endpoints (`/api/medicos`, `/api/unidades`, `/api/leitos`, `/api/especialidades`, `/api/procedimentos`) for populating filter dropdowns

**Schema Definition:** Drizzle ORM schema definitions in `shared/schema.ts` serve as TypeScript type definitions and documentation of the database structure, but are not used for migrations or database modification since the database already exists.

### Data Storage Solutions

**Database:** PostgreSQL accessed via environment variable `DATABASE_URL`. The database contains existing healthcare data in the `sotech` schema.

**Key Tables and Column Mappings:**
- `sotech.ate_atendimento` - Main patient admissions/attendance table (fktipoatendimento=2 for inpatients, datasaida IS NULL for current)
- `sotech.cdg_paciente` - Patient demographic data (column: `paciente` for name)
- `sotech.cdg_interveniente` - Healthcare professionals/physicians (column: `interveniente` for name)
- `sotech.cdg_unidadesaude` - Healthcare units/facilities (column: `unidadesaude` for name)
- `sotech.cdg_leito` - Bed/room assignments (column: `codleito` for bed number)
- `sotech.tbn_especialidade` - Medical specialties (column: `especialidade` for name)
- `sotech.tbl_procedimento` - Medical procedures (column: `procedimento` for name, `codprocedimento` for code)

**Session Storage:** Express sessions stored in-memory (default MemoryStore). For production, this should be replaced with a persistent session store like connect-pg-simple with PostgreSQL or Redis.

### Authentication and Authorization

**Mechanism:** Session-based authentication with HTTP-only cookies. User credentials are validated against hardcoded user list in `server/auth.ts`.

**User Roles:** Two roles defined - "admin" and "operador" (operator) - though role-based access control is not currently enforced beyond authentication requirement.

**Session Configuration:** 24-hour session lifetime, secure cookies enabled in production, sessions cleared on logout.

**Security Considerations:** Current implementation uses plain-text password comparison for simplicity. Production deployment should implement proper password hashing (bcryptjs is already included as a dependency but not utilized).

## External Dependencies

### Third-Party UI Libraries
- **Radix UI:** Unstyled, accessible UI primitives for components like dialogs, dropdowns, popovers, and form controls
- **Shadcn/ui:** Pre-configured component templates built on Radix UI
- **Lucide React:** Icon library for consistent iconography

### Build and Development Tools
- **Vite:** Fast development server and optimized production builds
- **TypeScript:** Type safety across frontend and backend
- **Tailwind CSS:** Utility-first CSS framework with custom design tokens
- **PostCSS & Autoprefixer:** CSS processing

### Backend Dependencies
- **Express.js:** Web framework for API routes
- **express-session:** Session management middleware
- **pg (node-postgres):** PostgreSQL client
- **@neondatabase/serverless:** Serverless PostgreSQL driver compatibility

### Data Handling
- **TanStack Query:** Server state management and data fetching
- **React Hook Form:** Form state and validation
- **Zod:** Schema validation for TypeScript
- **date-fns:** Date formatting and manipulation with Portuguese locale support

### Database Tooling
- **Drizzle Kit:** Schema definition and type generation (configured but not used for migrations)

### Font Resources
- **Google Fonts:** Inter font family loaded via CDN for consistent typography