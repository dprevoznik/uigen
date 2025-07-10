# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup & Database
```bash
npm run setup              # Install dependencies + generate Prisma client + run migrations
npm run db:reset          # Reset database (destructive)
```

### Development
```bash
npm run dev               # Start development server with Turbopack
npm run dev:daemon        # Start dev server in background, logs to logs.txt
npm run build             # Build for production
npm run start             # Start production server
```

### Code Quality & Testing
```bash
npm run lint              # Run ESLint
npm run test              # Run tests with Vitest
```

## Architecture Overview

UIGen is an AI-powered React component generator built with Next.js 15. The application uses a virtual file system approach where generated components exist in memory rather than being written to disk.

### Core Architecture

**Virtual File System**: Components are generated and stored in a virtual file system (`src/lib/file-system.ts`) that exists entirely in memory. This allows for real-time component generation and editing without affecting the actual filesystem.

**Context-Based State Management**: The app uses React Context for state management:
- `FileSystemContext`: Manages the virtual file system, file operations, and tool calls
- `ChatContext`: Handles AI chat interactions and integrates with the file system

**AI Integration**: Uses Anthropic's Claude AI via the Vercel AI SDK for component generation. The AI can manipulate the virtual file system through tool calls.

### Key Components

**Project Structure**:
- `src/app/`: Next.js app router pages and API routes
- `src/components/`: React components organized by feature (auth, chat, editor, preview, ui)
- `src/lib/`: Core utilities, contexts, and business logic
- `src/actions/`: Server actions for database operations
- `prisma/`: Database schema and migrations

**Database Model** (Prisma with SQLite):
- `User`: Authentication and user management
- `Project`: Stores project metadata, chat messages, and virtual file system state

**File System Operations**: The virtual file system supports standard operations (create, read, update, delete, rename) and integrates with AI tool calls for automated file manipulation.

**Live Preview**: Components are rendered in real-time using a sandboxed preview frame that compiles and executes the generated React code.

### Testing

Tests are written with Vitest and React Testing Library. Test files are located in `__tests__/` directories adjacent to the components they test.

### Database

Uses Prisma with SQLite for development. The Prisma client is generated to `src/generated/prisma/` directory. Database migrations are stored in `prisma/migrations/`.

## Database

- The database schema is defined in @prisma/schema.prisma file. Reference it anytime you need to understand the structure of the data stored in the database.

## Environment Variables

Optional `ANTHROPIC_API_KEY` in `.env`. Without it, the app returns static code instead of AI-generated components.

## Testing Notes

- Vitest config is in vitest.config.mts