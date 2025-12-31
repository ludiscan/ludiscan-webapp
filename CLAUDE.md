# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ludiscan-webapp** is a 3D/2D heatmap visualization tool built with Next.js 15 and React 19. It visualizes gameplay data with heatmaps overlaid on 3D or 2D maps. The application handles authentication, project/session management, and provides real-time visualization of player movement patterns and events.

**Current Version**: 1.0.0

**Key Features**:
- 3D/2D heatmap visualization with Three.js
- Route Coach for AI-powered gameplay improvement suggestions
- Integrated documentation system
- Offline heatmap viewing mode
- Embeddable heatmap viewer
- Multi-language support (English/Japanese)

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

### Visual Regression Testing
- **Argos CI**: Automated visual diff testing on PRs
- Configuration: `argos.config.js` in project root
- Automatically runs on PR creation/updates via GitHub Actions

### API & Generation
- **Generate API types**: `bun run generate:api-schemes` (requires `swagger.json` in root)
- **Generate from local API**: `bun run generate:api-schemes:local-fetch` (from `http://localhost:3211/swagger/api/v0/json`)
- **Build heatmap bundle**: `bun run build:heatmap-bundle` (runs automatically before prod build)

### Design Tokens
- **Build tokens**: `bun run tokens:build` (style-dictionary)
- **Watch tokens**: `bun run tokens:watch`

### Release
- `bun run release:patch`, `release:minor`, `release:major` - Bumps version, creates git tags, and pushes to remote

## Architecture

### High-Level Structure

The application uses a layered architecture with Pages Router (not App Router):

```
src/
  pages/               → Next.js Pages Router (SSR) with custom extensions
    api/               → API routes
    heatmap/
      projects/        → Dynamic project routes ([project_id])
      docs/            → Dynamic documentation system ([[...slug]])
      embed/           → Embeddable heatmap viewer ([token])
    auth/              → Authentication pages
    home/              → Dashboard and project views
    profile/           → User profile management
    security/          → Security settings
    api-keys/          → API key management
    health/            → Health check endpoint
    login/             → Login page
    _app.page.tsx      → App wrapper with Redux, TanStack Query, Locale, Theme providers
    _document.page.tsx → Custom document for SSR
    index.page.tsx     → Landing page

  component/           → Reusable UI components (Atomic Design)
    atoms/             → Basic UI elements (Button, Card, Flex, Text, Switch, Slider, etc.)
    molecules/         → Combinations of atoms (Modal, TextField, Menu, Pagination, etc.)
    organisms/         → Complex components (GameApiKey modals, landing sections, etc.)
    templates/         → Page-level layouts (Header, SidebarLayout, ToastContext)

  features/            → Feature-specific components & business logic
    heatmap/           → Main heatmap visualization
      menu/            → Menu sidebar content components
      routecoach/      → Route Coach feature (AI improvement suggestions)
      summary/         → AI Summary menu content
      selection/       → Object selection and inspection
      SessionPickerModal/ → Session selection UI
    docs/              → Documentation system components
    session/           → Session aggregation and filtering

  hooks/               → Custom React hooks for state & side effects
  slices/              → Redux Toolkit slices for global state
  contexts/            → React contexts (LocaleContext for i18n)
  locales/             → Translation files (en.ts, ja.ts)
  utils/               → Utility functions organized by domain
    heatmap/           → Heatmap-specific utilities
    docs/              → Documentation loader and parser
    security/          → CSRF, cookies, rate limiting utilities
  modeles/             → API client & data models (intentional spelling)
  styles/              → Global styles, theme, constants
  config/              → Environment configuration with Zod validation
  types/               → TypeScript type definitions
  @types/              → Global type augmentations
  files/               → Static file assets
  docs/                → Documentation content files (Markdown)
```

### Key Technologies & Patterns

**State Management:**
- **Redux Toolkit** for global UI state (auth, canvas, selection, routeCoach, ui)
- **TanStack Query v5** for server state and API caching
- Custom hooks: `useAuth()`, `useGeneral()`, `useRouteCoach()`, `useHeatmapState()`
- `createSlicePatchHook` pattern for safe Redux slice updates

**API Communication:**
- **openapi-fetch** client generated from swagger.json (types at `@generated/api.d.ts`)
- Client creation: `src/modeles/qeury.ts:createClient()` with auth middleware
- Default cache stale time: 5 minutes (configurable per query)
- **Mock API system** for offline development:
  - `ApiClientContext` for switching between real and mock API
  - `MockApiClient`, `MockApiRouter`, `MockDataLoader`
  - Documentation in `src/modeles/MOCK_API_GUIDE.md`

**Styling:**
- **Emotion** for CSS-in-JS (NO inline styled HTML tags - always use components)
- Components must use Emotion's `styled(Component)` pattern
- Theme in `src/styles/style.ts` (colors, zIndexes, dimensions)
- `useSharedTheme()` hook for consistent theme access

**3D Visualization:**
- **Three.js** + **@react-three/fiber** for 3D rendering
- **@react-three/drei** utilities (PerformanceMonitor, Stats)
- Supports 2D (orthographic) and 3D (perspective) cameras
- Model loading: OBJ, GLTF, GLB, or server-provided formats
- Dynamic dimensionality detection (`detectDimensionality.ts`)

**Localization:**
- `LocaleContext` with `LocaleProvider` for i18n
- Translation files: `src/locales/en.ts`, `src/locales/ja.ts`
- `useLocale()` hook for accessing translations

**Environment & Configuration:**
- Zod-validated environment variables (`src/config/env.ts`)
- Runtime validation for production safety
- Environment vars: `NEXT_PUBLIC_HOSTNAME`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GTM_ID`

**Security:**
- OWASP-recommended security headers in `next.config.ts`
- CSRF protection with Double Submit Cookie pattern (`src/utils/security/csrf.ts`)
- Secure cookie utilities (`src/utils/security/cookies.ts`)
- Rate limiting utilities (`src/utils/security/rateLimit.ts`)

### Core Features

**Heatmap Viewer** (`src/features/heatmap/HeatmapViewer.tsx`):
- Main visualization component combining 3D canvas with menu system
- Manages map content, timeline, dimensionality detection (2D/3D)
- Uses `HeatmapDataService` for data operations
- Exports visualization data with event logs
- Supports offline mode via `OfflineHeatmapProvider`

**Route Coach**:
- AI-powered gameplay improvement suggestions
- `RouteCoachVisualization.tsx` - Visualizes optimal routes and waypoints
- `RouteCoachMenuContent.tsx` - UI for coach feedback
- `routeCoachSlice.ts` - Redux state management
- `useRouteCoach()`, `useImprovementRoutes()` hooks

**Embed Mode** (`src/pages/heatmap/embed/[token].page.tsx`):
- Token-based embeddable heatmap viewer
- `EmbedHeatmapDataService` for embedded data loading

**Event System**:
- `src/utils/canvasEventBus.ts` - Custom event bus for cross-component communication
- Events: `click-menu-icon`, `click-event-log` for menu interactions
- Decouples menu interactions from canvas rendering

**Documentation System**:
- Markdown-based docs with frontmatter (`src/docs/`)
- Dynamic routing via `[[...slug]].page.tsx`
- Parser (`src/utils/docs/parser.ts`) for content processing
- Loader (`src/utils/docs/loader.ts`) for file discovery

### Redux Store Structure

```typescript
store: {
  auth: AuthState           // Authentication & user info
  heatmapCanvas: CanvasState // Canvas settings, event logs
  selection: SelectionState  // Selected objects, inspector state
  routeCoach: RouteCoachState // Route coach visualization state
  ui: UiState               // UI state (menu panel width, collapsed state)
}
```

Store factory in `src/store.ts`. Authentication persists via localStorage using `src/utils/localstrage.ts` (intentional spelling).

### Development Patterns

**Custom Hooks**:
- `createSlicePatchHook` from `src/hooks/createSlicePatchHook.ts` for safe Redux patches
- `useGetApi()` - Generic hook for GET API calls with TanStack Query
- `useHVQuery()` - Heatmap-specific query wrapper
- `useDebouncedValue()` - Debounced state values
- `useIsDesktop()` - Responsive breakpoint detection

**API Calls**:
- Always use TanStack Query with appropriate cache keys
- Use `createClient()` for requests - automatically adds auth headers
- Check `.error` property on responses before accessing `.data`
- Use `ApiClientContext` for mock/real API switching

**Page Routing**:
- Uses Next.js 15 Pages Router with custom extensions: `.page.tsx`, `.page.ts`, `.api.ts`
- Public pages: `/`, `/login`, `/home`, `/auth`, `/health`
- Protected pages: `/heatmap`, `/profile`, `/security`, `/api-keys`
- Dynamic routes: `/heatmap/projects/[project_id]`, `/heatmap/docs/[[...slug]]`, `/heatmap/embed/[token]`

**Testing**:
- Jest configuration with ts-jest
- Path aliases: `@src/`, `@generated/`
- Tests in `src/utils/*.test.ts`

**Webpack/Turbopack Configuration**:
- `.md` files imported as strings (raw-loader/asset-source)
- `.svg` files imported as React components via SVGR from JS/TS
- Custom page extensions configured in `next.config.ts`

## Claude Skills

This project includes Claude Code skills in `.claude/skills/`:

### Available Skills

1. **design-implementation-guide** - Design token verification and accessibility guidelines
2. **implementation-planning** - Structured implementation planning with templates
3. **pre-push-quality-checks** - Mandatory quality checks before PR/push
4. **ui-guidelines** - UI development patterns and conventions

### Pre-Push Quality Checks (MANDATORY)

Before any PR creation or git push:

```bash
# 1. Install dependencies
bun install

# 2. Auto-fix and format
bun run fix
bun run format

# 3. Type check (must pass)
bun run type

# 4. Lint check (must pass)
bun run lint
```

**Important**: ALL errors must be fixed, including pre-existing ones. No exceptions.

## CI/CD & GitHub Actions

### Workflows

- **pr.yml** - Runs on PRs: lint, format check, test, type check, build, Storybook tests, Argos visual diff
- **deploy.yml** - Deploy workflow
- **deploy-storybook.yml** - Storybook deployment
- **update-api-client.yml** - Auto-update API types from swagger
- **bump-version.yml** - Version bumping
- **tag-on-main.yml** - Auto-tagging on main branch

### PR Checks

PRs must pass:
1. ESLint + Stylelint
2. Prettier format check
3. Jest tests
4. TypeScript type check
5. Production build
6. Storybook tests
7. Argos visual regression (if enabled)

## Deployment

**Branch Strategy:**
- `develop` - Default branch, manual deployments to dev environment
- `main` - Auto-deploys to production on push

**AWS Amplify:**
- Build settings in `amplify.yml`
- Output: `standalone` mode for optimized production builds
- Pre-build hook runs `build:heatmap-bundle`
- Bun 1.3.0 installed during build

**Environment:**
- Node.js: 24.9.x
- Bun: 1.3.x (primary package manager)

## Important Conventions

1. **Always use components for styling, never HTML tags** - Use Emotion's `styled()` function
2. **Place theme/color constants in `src/styles/style.ts`** - Access via `useSharedTheme()`
3. **Keep API client calls in custom hooks or models** - Use `useGetApi()` pattern
4. **Use Redux for UI state, TanStack Query for server state** - Don't duplicate server data in Redux
5. **Event bus for cross-component canvas events** - Decouples interactions via `canvasEventBus`
6. **Module aliases** - Always use `@src/`, `@generated/` imports
7. **Custom page extensions** - Pages: `.page.tsx`/`.page.ts`, API routes: `.api.ts`
8. **Mock API for offline development** - Use `ApiClientContext` to switch
9. **Localization** - Use `useLocale()` hook for translated strings
10. **Security headers** - Configured in `next.config.ts`, follow OWASP guidelines

## Performance Considerations

- Heatmap uses Three.js with PerformanceMonitor component
- Device pixel ratio (`dpr`) dynamically adjusts based on performance
- Memoized components to prevent unnecessary re-renders
- Query caching with configurable stale times (default: 5 minutes)
- Standalone Next.js output for optimized server deployment
- Parallel script execution with `npm-run-all2` for linting/fixing

## Project Dependencies

### Core
- **Next.js 15.5.x** - React framework with Pages Router
- **React 19.x** - UI library
- **Three.js 0.175.x** - 3D rendering
- **@react-three/fiber** - React renderer for Three.js
- **Redux Toolkit** - State management
- **TanStack Query v5** - Server state management
- **Emotion** - CSS-in-JS styling
- **openapi-fetch** - Type-safe API client

### Development
- **TypeScript 5.9.x** - Type safety
- **ESLint 9.x** - Linting
- **Prettier** - Code formatting
- **Stylelint** - CSS linting
- **Jest** - Testing
- **Storybook 9.x** - Component development
- **Playwright** - E2E testing (via Storybook)
- **Argos CI** - Visual regression testing

## Recent Additions (v1.0.0)

- Route Coach System with AI-powered improvement suggestions
- Documentation System with dynamic routing and frontmatter
- Mock API Infrastructure for offline development
- Offline Heatmap Mode via `OfflineHeatmapProvider`
- Embeddable Heatmap Viewer with token-based access
- Multi-language Support (English/Japanese)
- Enhanced Security with CSRF protection and security headers
- UI Slice for menu panel state management
- Feedback System via `useSubmitFeedback()`
- Hotspot Mode via `useHotspotMode()`
- Design Token System with style-dictionary
