# CLAUDE.md

## Project Overview

**ludiscan-webapp** (v1.0.0) - 3D/2D heatmap visualization tool built with Next.js 15 + React 19. Visualizes gameplay data with Three.js heatmaps, Route Coach AI suggestions, offline mode, and embeddable viewer.

## Commands

| Task | Command |
|------|---------|
| Dev server | `bun run dev` (port 5173) |
| Build | `bun run build:prod` |
| Lint/Fix | `bun run lint` / `bun run fix` |
| Format | `bun run format` |
| Type check | `bun run type` |
| Test | `bun run test` |
| Storybook | `bun run storybook` (port 6006) |
| Generate API | `bun run generate:api-schemes` |

## Architecture

```
src/
  pages/          → Pages Router (.page.tsx, .api.ts extensions)
  component/      → Atomic Design (atoms/molecules/organisms/templates)
  features/       → Business logic (heatmap/, docs/, session/)
  hooks/          → Custom hooks (useAuth, useLocale, useRouteCoach, etc.)
  slices/         → Redux slices (auth, canvas, selection, routeCoach, ui)
  modeles/        → API client & models (intentional spelling)
  utils/          → Utilities (heatmap/, docs/, security/)
  locales/        → i18n (en.ts, ja.ts)
  styles/         → Theme & constants
  config/         → Zod-validated env config
```

## Tech Stack

- **State**: Redux Toolkit (UI) + TanStack Query v5 (server)
- **Styling**: Emotion CSS-in-JS - always use `styled()`, never raw HTML
- **3D**: Three.js + @react-three/fiber
- **API**: openapi-fetch from swagger.json (`@generated/api.d.ts`)
- **i18n**: `useLocale()` hook with LocaleContext

## Key Patterns

- **Page extensions**: `.page.tsx`, `.page.ts`, `.api.ts`
- **Imports**: Use `@src/`, `@generated/` aliases
- **API calls**: Use `createClient()` from `src/modeles/qeury.ts`
- **Theme**: Access via `useSharedTheme()`
- **Mock API**: Toggle via `ApiClientContext` (see `src/modeles/MOCK_API_GUIDE.md`)

## Pre-Push (MANDATORY)

```bash
bun install && bun run fix && bun run format && bun run type && bun run lint
```

ALL errors must be fixed. No exceptions.

## Claude Skills

Located in `.claude/skills/`:
- **pre-push-quality-checks** - Quality gates before PR/push
- **implementation-planning** - Structured planning templates
- **design-implementation-guide** - Accessibility & design tokens
- **ui-guidelines** - UI patterns & conventions

## Deployment

- **develop** → dev environment (manual)
- **main** → production (auto via AWS Amplify)
- Runtime: Node.js 24.9.x, Bun 1.3.x
