# CLAUDE.md — Lady Bandit Studios

## What This Is

Portfolio website for Lady Bandit Studios, a design agency. The homepage is an infinite canvas where visitors pan and zoom to explore projects. Other pages (About, Services, Contact) are simple vertical scrolls.

This is a design agency — the aesthetic bar is high. Always consult the `frontend-design` skill before building UI components.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion (animation)
- @use-gesture/react (canvas pan/zoom)
- Sanity v3 (CMS)
- next-themes (dark/light toggle)
- Vercel (hosting)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, nav, theme provider
│   ├── page.tsx                # Homepage (infinite canvas)
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── contact/page.tsx
│   └── studio/[[...tool]]/page.tsx  # Sanity Studio
├── components/
│   ├── canvas/                 # Canvas, CanvasNode, NodePreview, layout-engine
│   ├── modal/                  # ProjectModal, Gallery
│   ├── nav/                    # Navigation, ThemeToggle
│   └── ui/                     # Shared primitives
├── lib/
│   ├── sanity/                 # Client, GROQ queries, schemas
│   └── utils.ts
└── styles/
    └── globals.css             # Tailwind imports, CSS custom properties
```

## Code Patterns

- TypeScript strict mode, no `any`
- Functional components with hooks only
- Named exports for components, default exports for pages
- Use `cn()` (clsx + tailwind-merge) for conditional classes
- Components under 150 lines — split if larger
- Prefer composition over configuration — no boolean prop sprawl
- React Server Components by default, `'use client'` only for interactive components
- Co-locate styles: Tailwind classes live in the component file, not in separate CSS

## Animation & Interaction

- Framer Motion `motion` components for all animation
- `useGesture` from @use-gesture for all pointer/touch interactions
- Define shared motion tokens (easing, duration) in a constants file
- Always wrap animated content in `AnimatePresence` for enter/exit transitions

## Performance

- Use Next.js `<Image>` for all images (with Sanity image loader)
- Video: use `<video>` with `preload="none"`, load on hover only
- Lazy load canvas nodes outside the visible viewport
- Set explicit width/height on all media to prevent layout shifts
- Avoid fetching waterfalls — parallel data fetches where possible
- Target 90+ Lighthouse scores on all metrics

## Canvas Behavior

- Pan: click-drag on empty space
- Zoom: scroll wheel or pinch, range ~0.3x to 3x
- 10-20 project nodes, procedurally placed
- Hover: node expands to show preview or auto-playing video
- Click: modal opens with image/video gallery (user stays on canvas)
- Close modal: return to exact same canvas position and zoom
- Mobile (< 768px): replace canvas with intentionally-designed scrollable grid

## Accessibility

- Canvas keyboard navigable (Tab through nodes, Enter to open)
- Modals trap focus, Escape to close
- All images require alt text (pulled from Sanity)
- Respect `prefers-reduced-motion` — reduce or disable animations
- WCAG AA color contrast minimum
- Skip-to-content link on non-canvas pages

## Sanity CMS

- Schema definitions in `src/lib/sanity/schemas/`
- GROQ for all queries (not GraphQL)
- Use `@sanity/image-url` for image URL building with transforms
- Sanity Studio embedded at `/studio` route
- Content model: Project → title, slug, category, client, year, description, thumbnail, hoverPreview (image or video), gallery (array of image/video/text), featured flag

## Skills Reference

Consult these installed skills when relevant:

- **`frontend-design`** (Anthropic): Before building ANY visual component. Prevents generic AI aesthetics.
- **`vercel-react-best-practices`** (Vercel Labs): Before writing new components or pages. 40+ performance rules for React/Next.js.
- **`web-design-guidelines`** (Vercel Labs): To audit completed components for accessibility and UX. 100+ rules.
- **`vercel-composition-patterns`** (Vercel Labs): When component APIs feel complex. Guides toward compound components over prop sprawl.

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npx sanity dev       # Sanity Studio local
```

## Git

- Branch: `feature/descriptive-name`
- Commits: conventional (`feat:`, `fix:`, `chore:`)
