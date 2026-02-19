# Kisan Sathi - AI-Powered Agricultural Scheme Recommender

## Overview

Kisan Sathi is a full-stack web application that helps Indian farmers discover government agricultural schemes tailored to their profile. Users create a profile with their state, land size, income, crop type, and category. The app then uses AI (OpenAI) to analyze their profile against a database of government schemes and generate personalized recommendations with explanations.

The app follows a monorepo structure with a React frontend, Express backend, PostgreSQL database, and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Directory Structure
- `client/` — React frontend (Vite-based SPA)
- `server/` — Express backend API
- `shared/` — Shared types, schemas, and route definitions used by both client and server
- `server/replit_integrations/` — Pre-built integration modules (auth, chat, audio, image, batch processing)
- `migrations/` — Drizzle ORM database migrations
- `attached_assets/` — Reference data files (scheme JSON data)

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React Hook Form for form state
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (agricultural green/earth tone theme)
- **Animations**: Framer Motion for page transitions and card interactions
- **Fonts**: 'Outfit' for headings (display), 'DM Sans' for body text
- **Build Tool**: Vite with React plugin
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Key Frontend Pages
- **Landing** (`/`) — Marketing page shown to unauthenticated users
- **Dashboard** (`/dashboard`) — Shows AI-generated scheme recommendations (protected)
- **Profile** (`/profile`) — Form to input agricultural details like state, land size, income, crop (protected)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: tsx for development, esbuild for production builds
- **API Pattern**: RESTful JSON API under `/api/*`
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js, sessions stored in PostgreSQL via `connect-pg-simple`
- **AI Integration**: OpenAI API (via Replit AI Integrations proxy) for generating scheme recommendations
- **Build**: esbuild bundles server to `dist/index.cjs`; Vite builds client to `dist/public/`

### API Routes
- `GET /api/auth/user` — Get current authenticated user
- `GET /api/profile` — Get user's agricultural profile
- `POST /api/profile` — Create or update user's agricultural profile
- `GET /api/schemes` — List all available government schemes
- `POST /api/recommendations/generate` — AI-powered scheme recommendation generation
- `GET /api/login` — Initiate Replit Auth login flow
- `GET /api/logout` — Logout

### Database
- **Database**: PostgreSQL (required, provisioned via Replit)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Schema location**: `shared/schema.ts` and `shared/models/`
- **Migration tool**: `drizzle-kit push` (use `npm run db:push`)

### Database Tables
- `users` — Auth users (managed by Replit Auth, id is varchar primary key)
- `sessions` — Session storage for express-session (managed by connect-pg-simple)
- `profiles` — User agricultural profiles (state, land size, income, crop, category)
- `schemes` — Government agricultural schemes (name, benefit amount, income/land limits, eligible states/crops)
- `recommendations` — AI-generated recommendations linking users to schemes with explanations
- `conversations` / `messages` — Chat storage (from replit integrations, may not be actively used)

### Shared Code
- `shared/schema.ts` — Drizzle table definitions and Zod validation schemas
- `shared/routes.ts` — API route contracts with Zod input/output schemas (used by both client and server)
- `shared/models/auth.ts` — Auth-related table definitions (users, sessions)
- `shared/models/chat.ts` — Chat-related table definitions (conversations, messages)

### Authentication Flow
- Uses Replit Auth (OpenID Connect) — no custom username/password
- Login redirects to `/api/login`, which initiates OIDC flow
- Sessions persisted in PostgreSQL `sessions` table
- Frontend checks auth state via `GET /api/auth/user`
- Protected routes redirect unauthenticated users to login

### Storage Layer
- `server/storage.ts` — DatabaseStorage class implementing IStorage interface for profiles, schemes, recommendations
- `server/replit_integrations/auth/storage.ts` — Auth-specific user storage
- `server/replit_integrations/chat/storage.ts` — Chat conversation/message storage

## External Dependencies

### Required Services
- **PostgreSQL Database** — Primary data store (connection via `DATABASE_URL` env var)
- **OpenAI API** (via Replit AI Integrations) — Used for generating scheme recommendations
  - Env vars: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Replit Auth** — Authentication provider (OpenID Connect)
  - Env vars: `REPL_ID`, `ISSUER_URL`, `SESSION_SECRET`

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
- `express` + `express-session` — HTTP server and session management
- `passport` + `openid-client` — Authentication
- `openai` — AI API client
- `@tanstack/react-query` — Client-side data fetching
- `react-hook-form` + `@hookform/resolvers` — Form management with Zod validation
- `framer-motion` — Animations
- `wouter` — Client-side routing
- `zod` — Runtime type validation (shared between client and server)
- `connect-pg-simple` — PostgreSQL session store
- Full shadcn/ui component library (Radix UI primitives)