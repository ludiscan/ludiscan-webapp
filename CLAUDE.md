# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ludiscan-webapp** is a 3D/2D heatmap visualization tool built with Next.js and React. It's designed to visualize gameplay data with heatmaps overlaid on 3D or 2D maps. The application handles authentication, project/session management, and provides real-time visualization of player movement patterns and events. Recent additions include Route Coach functionality for gameplay improvement suggestions and an integrated documentation system.

## Development Commands

### Environment & Build
- **Development**: `bun run dev` (runs with Turbopack on port 5173)
- **Production build**: `bun run build:prod` (includes heatmap bundle prebuild)
- **Development build**: `bun run build:dev --turbopack`
- **Start production server**: `bun run start`

### Code Quality
- **Lint**: `bun run lint` (runs both eslint and stylelint in parallel)
- **Fix linting issues**: `bun run fix` (eslint and stylelint auto-fix in parallel)
- **ESLint**: `bun run lint:eslint` / `bun run fix:eslint`
- **Stylelint**: `bun run lint:stylelint` / `bun run fix:stylelint`
- **Format check**: `bun run format:check` (Prettier)
- **Auto-format**: `bun run format` (Prettier)
- **Type check**: `bun run type` (TypeScript no emit)

### Testing
- **Run tests**: `bun run test` (Jest with ts-jest)
- **Run single test**: `bun run test -- src/__tests__/path/to/file.test.ts`

### Storybook & Documentation
- **Start Storybook**: `bun run storybook` (port 6006)
- **Build Storybook**: `bun run build-storybook`
- **Test Storybook**: `bun run test-storybook`

### API & Generation
- **Generate API types**: `bun run generate:api-schemes` (requires `swagger.json` in root)
- **Generate from local API**: `bun run generate:api-schemes:local-fetch` (from `http://localhost:3211/swagger/api/v0/json`)
- **Build heatmap bundle**: `bun run build:heatmap-bundle` (runs automatically before prod build via prebuild:prod hook)

### Release
- `bun run release:patch`, `release:minor`, `release:major` - Bumps version, creates git tags, and pushes to remote

## Architecture

### High-Level Structure

The application uses a layered architecture with Pages Router (not App Router):

```
src/
  - pages/           → Next.js Pages Router (SSR) with custom extensions (.page.tsx, .api.ts)
    - api/           → API routes
    - heatmap/       → Heatmap visualization pages
      - projects/    → Dynamic project routes
      - docs/        → Dynamic documentation system
    - auth/          → Authentication pages
    - home/          → Dashboard
    - profile/       → User profile management
    - security/      → Security settings
    - api-keys/      → API key management
    - login/         → Login page
    - _app.page.tsx  → App wrapper with Redux & TanStack Query providers
    - _document.page.tsx → Custom document for SSR
    - index.page.tsx → Landing page

  - component/       → Reusable UI components (Atomic Design)
    - atoms/         → Basic UI elements (buttons, inputs, flex layouts, icons)
    - molecules/     → Simple combinations of atoms (modals, cards)
    - organisms/     → Complex components (sidebars, toolbars)
    - templates/     → Page-level layouts

  - features/        → Feature-specific components & business logic
    - heatmap/       → Heatmap visualization components
      - routecoach/  → Route Coach feature (improvement suggestions)
      - summary/     → AI Summary menu content
    - docs/          → Documentation system components

  - hooks/           → Custom React hooks for state & side effects
  - slices/          → Redux Toolkit slices for global state
  - utils/           → Utility functions organized by domain
    - heatmap/       → Heatmap-specific utilities (data service, offline mode)
    - docs/          → Documentation loader and parser
  - modeles/         → API client & data models (not a typo - follows project naming)
  - styles/          → Global styles, theme, constants
  - config/          → Environment configuration
  - types/           → TypeScript type definitions
  - @types/          → Global type augmentations
  - files/           → Static file assets
  - docs/            → Documentation content files
```

### Key Technologies & Patterns

**State Management:**
- **Redux Toolkit** for global state (authentication, canvas settings, selection, route coach)
- **TanStack Query** (React Query) for server state and API caching
- Custom hooks like `useAuth()`, `useGeneral()`, `useRouteCoach()` for accessing Redux state
- `createSlicePatchHook` pattern for safe Redux slice updates

**API Communication:**
- **openapi-fetch** client generated from swagger.json (types at `@generated/api.d.ts`)
- Client creation: `src/modeles/qeury.ts:createClient()` with auth middleware
- Default cache stale time: 5 minutes (configurable per query)
- **Mock API system** for offline development (`ApiClientContext`, `MockApiClient`, `MockApiRouter`)
  - Supports switching between real and mock API via context
  - Mock data documentation in `src/modeles/MOCK_API_GUIDE.md`

**Styling:**
- **Emotion** for CSS-in-JS (NO inline styled HTML tags - always use components)
- Components must be styled using Emotion's `styled(Component)` pattern
- Theme available in `src/styles/style.ts` (colors, zIndexes, dimensions)
- `useSharedTheme()` hook for accessing theme consistently

**3D Visualization:**
- **Three.js** + **@react-three/fiber** for 3D rendering
- **@react-three/drei** utilities (PerformanceMonitor, Stats)
- Supports 2D (orthographic camera) and 3D (perspective) rendering
- Model loading: OBJ, GLTF, GLB, or server-provided formats
- Dynamic dimensionality detection (`detectDimensionality.ts`)

**Data Models:**
- Located in `src/modeles/` (heatmapView, project, session, user, heatmaptask, env, theme)
- API responses typed using generated OpenAPI types from `@generated/api.d.ts`

**Documentation System:**
- Markdown-based documentation with custom loader (`src/utils/docs/loader.ts`)
- Dynamic routing via `[[...slug]].page.tsx` for nested docs
- Parser (`src/utils/docs/parser.ts`) for frontmatter and content processing

### Core Features

**Heatmap Viewer** (`src/features/heatmap/HeatmapViewer.tsx`):
- Main visualization component combining 3D canvas with menu system
- Manages map content, timeline, dimensionality detection (2D/3D)
- Uses `HeatmapDataService` for data operations
- Exports visualization data with event logs
- Supports offline mode via `OfflineHeatmapProvider`

**Route Coach** (NEW):
- AI-powered gameplay improvement suggestions
- `RouteCoachVisualization.tsx` - Visualizes optimal routes and waypoints
- `RouteCoachMenuContent.tsx` - UI for coach feedback
- `routeCoachSlice.ts` - Redux state management
- `useRouteCoach()`, `useImprovementRoutes()` - Custom hooks

**Event System**:
- `src/utils/canvasEventBus.ts` - Custom event bus for cross-component communication
- Events: `click-menu-icon`, `click-event-log` for menu interactions
- Decouples menu interactions from canvas rendering

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
  routeCoach: RouteCoachState // route coach visualization state (NEW)
}
```

Authentication persists via localStorage using `src/utils/localstrage.ts` utilities (note: typo in filename is intentional).

### Development Patterns

**Custom Hooks**:
- Use `createSlicePatchHook` from `src/hooks/createSlicePatchHook.ts` to create hooks that patch Redux slices safely
- Example: `useHeatmapState()` wraps canvas state updates
- `useGetApi()` - Generic hook for GET API calls with TanStack Query
- `useHVQuery()` - Heatmap-specific query wrapper

**API Calls**:
- Always use TanStack Query with appropriate cache keys
- Use `createClient()` for making requests - automatically adds auth headers
- Check `.error` property on responses before accessing `.data`
- Use `ApiClientContext` for mock/real API switching

**Page Routing**:
- Uses Next.js 15 Pages Router with custom page extensions: `page.tsx`, `page.ts`, `api.ts`
- Public pages: `/`, `/login`, `/home`, `/auth`
- Protected pages: `/heatmap`, `/profile`, `/security`, `/api-keys`
- Dynamic routes: `/heatmap/projects/[project_id]`, `/heatmap/docs/[[...slug]]`

**Testing**:
- Jest configuration with ts-jest
- Path aliases: `@src/`, `@generated/`
- Example tests: `flattenObject.test.ts`, `vql.test.ts`, `string.test.ts`

**Webpack/Turbopack Configuration**:
- `.md` files imported as strings (raw-loader)
- `.svg` files imported as React components via SVGR from JS/TS
- Custom page extensions configured in `next.config.ts`

## Deployment

**Branch Strategy:**
- `develop` - Default branch, manual deployments to dev environment
- `main` - Auto-deploys to production on push

**AWS Amplify**:
- Build settings in `amplify.yml`
- Output: `standalone` mode for optimized production builds
- Pre-build hook runs `build:heatmap-bundle`

**Environment:**
- Node.js: 24.9.x
- Bun: 1.3.x (primary package manager)

## Important Conventions

1. **Always use components for styling, never HTML tags** - Ensures clarity and maintainability. Use Emotion's `styled()` function.
2. **Place theme/color constants in `src/styles/style.ts`** - Centralized theme management. Access via `useSharedTheme()`.
3. **Keep API client calls in custom hooks or models** - Separates concerns and enables caching. Use `useGetApi()` pattern.
4. **Use Redux for UI state, TanStack Query for server state** - Clear separation of concerns. Don't duplicate server data in Redux.
5. **Event bus for cross-component canvas events** - Decouples menu interactions from canvas via `canvasEventBus`.
6. **Module aliases** - Always use `@src/`, `@generated/` imports (not relative paths for cross-directory imports).
7. **Custom page extensions** - All pages must end with `.page.tsx` or `.page.ts`, API routes with `.api.ts`.
8. **Mock API for offline development** - Use `ApiClientContext` to switch between real/mock API. Document mock data patterns.

## Performance Considerations

- Heatmap uses Three.js with performance monitoring (PerformanceMonitor component)
- Device pixel ratio (`dpr`) dynamically adjusts based on performance
- Memoized components to prevent unnecessary re-renders (especially HeatmapViewer)
- Query caching with configurable stale times to reduce API calls
- Standalone Next.js output for optimized server deployment
- Parallel script execution with `npm-run-all2` for linting/fixing

## Recent Additions

- **Route Coach System**: AI-powered gameplay improvement with route visualization
- **Documentation System**: Markdown-based docs with dynamic routing and frontmatter parsing
- **Mock API Infrastructure**: Full offline development support with `ApiClientContext`
- **Offline Heatmap Mode**: View heatmaps without server connection
- **Improved Theme System**: `useSharedTheme()` hook for consistent theming
- **Feedback System**: User feedback submission via `useSubmitFeedback()`
- **Hotspot Mode**: Enhanced interaction mode via `useHotspotMode()`
