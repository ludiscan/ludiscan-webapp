# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ludiscan-webapp** is a 3D/2D heatmap visualization tool built with Next.js and React. It's designed to visualize gameplay data with heatmaps overlaid on 3D or 2D maps. The application handles authentication, project/session management, and provides real-time visualization of player movement patterns and events.

## Development Commands

### Environment & Build
- **Development**: `bun run dev --turbopack -p 5173` (with Turbopack for faster builds)
- **Production build**: `bun run build:prod`
- **Development build**: `bun run build:dev --turbopack`
- **Start production server**: `bun run start`

### Code Quality
- **Lint**: `bun run lint` (runs both eslint and stylelint)
- **Fix linting issues**: `bun run fix` (eslint and stylelint auto-fix)
- **ESLint**: `bun run lint:eslint` / `bun run fix:eslint`
- **Stylelint**: `bun run lint:stylelint` / `bun run fix:stylelint`
- **Format check**: `bun run format:check` (Prettier)
- **Auto-format**: `bun run format` (Prettier)
- **Type check**: `bun run type` (TypeScript no emit)

### Testing
- **Run tests**: `bun run test` (Jest)
- **Run single test**: `bun run test -- src/__tests__/path/to/file.test.ts`

### Storybook & Documentation
- **Start Storybook**: `bun run storybook` (port 6006)
- **Build Storybook**: `bun run build-storybook`
- **Test Storybook**: `bun run test-storybook`

### API & Generation
- **Generate API types**: `bun run generate:api-schemes` (requires `swagger.json` in root)
- **Generate from local API**: `bun run generate:api-schemes:local-fetch` (from `http://localhost:3211/swagger/api/v0/json`)
- **Build heatmap bundle**: `bun run build:heatmap-bundle` (runs automatically before prod build)

### Release
- `bun run release:patch`, `release:minor`, `release:major` - Creates git tags and pushes

## Architecture

### High-Level Structure

The application uses a layered architecture:

```
pages/           → Next.js route handlers (SSR) and API routes
  - [feature]/   → Feature-based page structure (heatmap, auth, profile, etc.)

src/
  - component/   → Reusable UI components (atoms, molecules, organisms, templates)
  - features/    → Feature-specific components & business logic (e.g., heatmap visualization)
  - hooks/       → Custom React hooks for state & side effects
  - slices/      → Redux Toolkit slices for global state (auth, canvas, selection)
  - utils/       → Utility functions organized by domain (heatmap/, color, locale, etc.)
  - modeles/     → API client & data models (not a typo - follows project naming)
  - styles/      → Global styles, theme, constants
  - config/      → Environment configuration
  - types/       → TypeScript type definitions
  - @types/      → Global type augmentations
```

### Key Technologies & Patterns

**State Management:**
- **Redux Toolkit** for global state (authentication, canvas settings, selection)
- **TanStack Query** (React Query) for server state and API caching
- Custom hooks like `useAuth()`, `useGeneral()` for accessing Redux state

**API Communication:**
- **openapi-fetch** client generated from swagger.json (types at `@generated/api`)
- Client creation: `src/modeles/qeury.ts:createClient()` with auth middleware
- Default cache stale time: 5 minutes (configurable per query)

**Styling:**
- **Emotion** for CSS-in-JS (NO inline styled HTML tags - always use components)
- Components must be styled using Emotion's `styled(Component)` pattern
- Theme available in `src/styles/style.ts` (colors, zIndexes, dimensions)

**3D Visualization:**
- **Three.js** + **@react-three/fiber** for 3D rendering
- **@react-three/drei** utilities (PerformanceMonitor, Stats)
- Supports 2D (orthographic camera) and 3D (perspective) rendering
- Model loading: OBJ, GLTF, GLB, or server-provided formats

**Data Models:**
- Located in `src/modeles/` (models, project, session, user, heatmaptask, environment)
- API responses typed using generated OpenAPI types from `@generated/api.d.ts`

### Core Features

**Heatmap Viewer** (`src/features/heatmap/HeatmapViewer.tsx`):
- Main visualization component combining 3D canvas with menu system
- Manages map content, timeline, dimensionality detection (2D/3D)
- Uses `HeatmapDataService` for data operations
- Exports visualization data with event logs

**Event System**:
- `src/utils/canvasEventBus.ts` - Custom event bus for cross-component communication
- Events: `click-menu-icon`, `click-event-log` for menu interactions

**Component Architecture** (Atomic Design):
- **atoms/**: Basic UI elements (buttons, inputs, flex layouts, icons)
- **molecules/**: Simple combinations of atoms (modals, cards)
- **organisms/**: Complex components (sidebars, toolbars)
- **templates/**: Page-level layouts

### Redux Store Structure

```typescript
store: {
  auth: AuthState           // authentication & user info
  heatmapCanvas: CanvasState // canvas settings, event logs
  selection: SelectionState  // selected objects, inspector state
}
```

Authentication persists via localStorage using `src/utils/localstrage.ts` utilities.

### Development Patterns

**Custom Hooks**:
- Use `createSlicePatchHook` from `src/hooks/createSlicePatchHook.ts` to create hooks that patch Redux slices safely
- Example: `useHeatmapState()` wraps canvas state updates

**API Calls**:
- Always use TanStack Query with appropriate cache keys
- Use `createClient()` for making requests - automatically adds auth headers
- Check `.error` property on responses before accessing `.data`

**Page Routing**:
- Uses Next.js 15 with custom page extensions: `page.tsx`, `page.ts`, `api.ts`
- Public pages: `/`, `/login`, `/home`, `/auth`
- Protected pages: `/heatmap`, `/profile`, `/security`, `/api-keys`

**Testing**:
- Jest configuration with ts-jest
- Path aliases: `@src/`, `@mock/`, `@generated/`
- Example tests in `src/utils/` (flattenObject.test.ts, vql.test.ts)

## Deployment

**Branch Strategy:**
- `develop` - Default branch, manual deployments to dev environment
- `main` - Auto-deploys to production on push

**AWS Amplify**:
- Build settings in `amplify.yml`
- Output: `standalone` mode for optimized production builds

## Important Conventions

1. **Always use components for styling, never HTML tags** - Ensures clarity and maintainability
2. **Place theme/color constants in `src/styles/style.ts`** - Centralized theme management
3. **Keep API client calls in custom hooks or models** - Separates concerns and enables caching
4. **Use Redux for auth state, TanStack Query for server state** - Clear separation of concerns
5. **Event bus for cross-component canvas events** - Decouples menu interactions from canvas
6. **Module aliases** - Always use `@src/`, `@generated/`, `@mock/` imports

## Performance Considerations

- Heatmap uses Three.js with performance monitoring (PerformanceMonitor component)
- Device pixel ratio (`dpr`) dynamically adjusts based on performance
- Memoized components to prevent unnecessary re-renders (especially HeatmapViewer)
- Query caching with configurable stale times to reduce API calls
- Standalone Next.js output for optimized server deployment