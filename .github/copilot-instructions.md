# Royal Editions Website - AI Coding Agent Instructions

## Project Overview
Next.js 16 application for Royal Editions using App Router, React 19, TypeScript, and Tailwind CSS v4. This is a fresh project bootstrapped with `create-next-app` for a publishing/book-related website.

## Tech Stack & Architecture
- **Framework**: Next.js 16.0.3 with App Router (`app/` directory)
- **React**: Version 19.2.0 (latest)
- **Styling**: Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- **TypeScript**: Strict mode enabled with path alias `@/*` for root imports
- **Fonts**: Geist Sans & Geist Mono via `next/font/google`

## Key File Locations
- Pages: `app/page.tsx` (Server Components by default)
- Layouts: `app/layout.tsx` (root layout with metadata)
- Styles: `app/globals.css` (Tailwind v4 with `@import "tailwindcss"`)
- Static assets: `public/assets/` (contains book covers and logo)
- Config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`

## Development Workflow
```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint with Next.js config
```

## Styling Conventions
- **Tailwind v4 syntax**: Use `@import "tailwindcss"` (not `@tailwind` directives)
- **Theme tokens**: Define via `@theme inline` in `globals.css`
- **CSS variables**: `--background`, `--foreground` for light/dark mode
- **Dark mode**: Automatic via `prefers-color-scheme`, use `dark:` prefix
- **Font variables**: `--font-geist-sans`, `--font-geist-mono` set in layout

## TypeScript Patterns
- **Imports**: Use `@/*` path alias for clean imports (e.g., `@/app/layout.tsx`)
- **Metadata**: Export `metadata` object from layouts/pages (see `app/layout.tsx`)
- **Types**: Import types with `import type { ... }` for clarity

## Component Patterns
- **Server Components**: Default in App Router - no "use client" needed unless using hooks/interactivity
- **Layout props**: Use `Readonly<{ children: React.ReactNode }>` pattern
- **Image optimization**: Use `next/image` with explicit `width`/`height` and `priority` for above-fold images

## ESLint Configuration
Uses Next.js recommended configs (`eslint-config-next/core-web-vitals`, `typescript`) with `eslint/config` v9 flat config format. Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`.

## Brand Assets
- Logo: `public/assets/Logo-Royal-Editions.png`
- Book covers: `public/assets/1000_techniques_book_2.png` (with transparent variant)
- Favicons: All sizes in `app/` directory with PWA manifest

## Important Notes
- This project uses **Tailwind v4** - syntax differs from v3 (use `@import` not `@tailwind`)
- App Router (not Pages Router) - file-based routing in `app/` directory
- React 19 requires Server Components awareness - client components need explicit "use client"
- Geist fonts loaded via `next/font/google` with CSS variables for consistent typography
