# Lady Bandit Studios — Infinite Canvas Website

## Build Plan

### Vision

A design agency portfolio experienced as an exploratory infinite canvas. Visitors discover projects by panning and zooming through a spatial field of images, videos, and text. Hovering reveals previews (scrolling snippets or auto-playing video). Clicking opens a modal gallery without leaving the canvas. The feel is ephemeral, clean, and discovery-driven. Other pages (About, Services) are simple vertical scrolls.

---

### Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | File-based routing, image/video optimization, Vercel-native |
| Styling | Tailwind CSS v4 | Utility-first, design-token friendly, fast iteration |
| Animation | Framer Motion | Hover reveals, modal transitions, canvas transforms |
| Canvas interaction | @use-gesture/react | Pan, pinch-zoom, drag — lightweight and composable |
| CMS | Sanity v3 | Free tier, excellent media handling, visual Studio editor |
| Theme | next-themes | Dark/light toggle with Tailwind |
| Hosting | Vercel | Zero-config deploys, preview URLs, edge optimized |
| Linting/Formatting | ESLint + Prettier | Consistent code from day one |

---

### Site Architecture

```
/ (homepage)            → Infinite canvas with project nodes
/project/[slug]         → (not a real page — modal from canvas)
/about                  → Vertical scroll, text + images (ephemeral style)
/services               → Vertical scroll, text + images
/contact                → Simple form or CTA
```

The canvas homepage is the entire portfolio. Project detail views are modals overlaid on the canvas, so the user never leaves the exploration context.

---

### Phase Plan

#### Phase 0: Project Setup ✅ COMPLETE

- [x] Initialize Next.js 15 project with TypeScript
- [x] Install dependencies: framer-motion, @use-gesture/react, next-themes, clsx, tailwind-merge, next-sanity, @sanity/image-url, @sanity/vision, prettier, eslint-config-prettier
- [x] Set up ESLint + Prettier
- [x] Initialize Git repo, connect to GitHub
- [x] Install Claude Code skills (frontend-design, vercel-react-best-practices, web-design-guidelines, vercel-composition-patterns)
- [x] Create CLAUDE.md and BUILD_PLAN.md
- [x] Create src/lib/utils.ts with cn() utility
- [ ] Deploy empty project to Vercel (do this whenever ready — just connect the GitHub repo at vercel.com/new)

#### Phase 1: Design Tokens & Theme

This is where the visual identity gets established in code. Consult the `frontend-design` skill. Make these decisions now — the rest of the build inherits them automatically.

Design direction: warm, ephemeral feel. Think cream and off-white for light mode, deep warm grays (not pure black) for dark mode. Subtle accent color for interactive feedback. Clean, no ambient effects — the work speaks for itself.

- [ ] Choose typography: display font + body font (distinctive, intentional pairing)
- [ ] Define color palette for light and dark modes as CSS custom properties
- [ ] Define accent color for interactive feedback
- [ ] Set up Tailwind v4 `@theme` with all design tokens
- [ ] Set up next-themes with Tailwind dark mode
- [ ] Build theme toggle component
- [ ] Create global layout shell: minimal persistent nav + theme toggle
- [ ] Define spacing scale and breakpoints
- [ ] Establish animation principles: easing curves, default durations, motion tokens

#### Phase 2: Canvas Engine ← Core feature

- [ ] Build `<Canvas>` wrapper component with pan/zoom via @use-gesture
- [ ] Implement transform state (x, y, scale) with Framer Motion animated values
- [ ] Set zoom bounds (approx 0.3x to 3x)
- [ ] Build `<CanvasNode>` component for individual project items
- [ ] Implement procedural layout algorithm (place 10-20 items with controlled randomness)
- [ ] Handle viewport culling (only render nodes visible in viewport for performance)
- [ ] Add minimap or subtle position indicator (optional)
- [ ] Desktop-first responsive: on mobile, simplify to a scrollable grid fallback

#### Phase 3: Project Nodes & Interactions

- [ ] **Hover state**: Node expands vertically to reveal a scrolling preview snippet or auto-playing video loop
- [ ] **Click state**: Opens a modal overlay (Framer Motion `AnimatePresence`)
- [ ] **Modal content**: Image/video gallery with minimal text, swipeable or scrollable
- [ ] **Close modal**: Returns to canvas at same position/zoom
- [ ] Support three node types: image, video (looping), text/quote
- [ ] Add subtle cursor feedback (pointer change, maybe custom cursor)
- [ ] URL state: Update URL hash or query param when modal is open (for shareability)

#### Phase 4: Sanity CMS Integration

- [ ] Initialize Sanity project (v3, free tier)
- [ ] Define schema: Project (title, slug, category, media gallery, description, canvas position hint)
- [ ] Define media types: images (with alt text), video (with poster frame), text blocks
- [ ] Set up Sanity Studio (hosted or embedded at /studio)
- [ ] Create GROQ queries for fetching projects
- [ ] Connect canvas nodes to Sanity data
- [ ] Connect modal gallery to Sanity media arrays
- [ ] Add image optimization via Sanity's image pipeline + Next.js Image

#### Phase 5: Secondary Pages

- [ ] **About page**: Vertical scroll layout (warm, personal tone)
- [ ] **Services page**: Similar vertical layout, clear structure
- [ ] **Contact**: Simple form or mailto CTA
- [ ] Navigation: Minimal persistent nav (hamburger or text links, stays out of the way on canvas)
- [ ] Page transitions: Smooth route transitions with Framer Motion

#### Phase 6: Polish & Performance

- [ ] Audit accessibility (keyboard navigation on canvas, focus management in modals, ARIA)
- [ ] Performance: lazy load offscreen canvas nodes, optimize video loading
- [ ] SEO: metadata, Open Graph images, structured data
- [ ] Test across browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile: ensure grid fallback works well
- [ ] Loading states and skeleton UI
- [ ] 404 page
- [ ] Favicon and site metadata

#### Phase 7: Launch

- [ ] Custom domain setup on Vercel
- [ ] Final content entry in Sanity
- [ ] Lighthouse audit (target 90+ on all scores)
- [ ] Share preview URL with Haven for review
- [ ] Go live

---

### Key Architectural Decisions

**Why a custom canvas over a library (react-flow, pixi.js, etc.)?**
At 10-20 nodes with moderate zoom, a custom solution using @use-gesture + Framer Motion gives full creative control without fighting library constraints. Libraries like react-flow are optimized for node-graph UIs (flowcharts, diagrams) and pixi.js is overkill WebGL for this scale.

**Why modals instead of page navigation?**
Keeps the user in the canvas context. The exploration metaphor breaks if you navigate away — opening a modal feels like examining something you found, then putting it back and continuing your journey.

**Why Sanity over alternatives?**
Sanity's free tier (10k API requests/mo, 500k API CDN requests, 5GB assets) is generous for this scale. It handles images and video natively with automatic optimization. The schema-as-code approach means Claude Code can set up your content model, and you edit through a visual Studio UI.

**Why Tailwind v4?**
Tailwind v4 uses CSS-first configuration with `@theme` directive instead of JavaScript config files. It's cleaner, faster, and the design token system maps naturally to your light/dark theme needs.

---

### Content Model (Sanity Schema)

```
Project
├── title: string
├── slug: slug (auto-generated from title)
├── category: string (e.g., "Brand Identity", "Interface Design", "Campaign")
├── client: string (optional)
├── year: number
├── description: text (short, for modal)
├── canvasPosition: object { x: number, y: number } (hint for procedural layout)
├── thumbnail: image (what shows on the canvas)
├── hoverPreview: image | video (what reveals on hover)
├── gallery: array of (image | video | text block)
└── featured: boolean
```
