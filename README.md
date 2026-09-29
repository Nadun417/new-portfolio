# Nadun Mathuja · Portfolio

My personal portfolio: a single-page site with a project showcase and a case-study page for each
project. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion, GSAP with
ScrollTrigger, and Lenis.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Where things live

```
app/
  layout.tsx            fonts, providers, cursor, preloader, nav, progress rail
  page.tsx              the home page sections, in order
  work/[slug]/page.tsx  case studies, one static page per project
  globals.css           Tailwind tokens, type scale, masks, helpers
data/
  site.ts               identity, nav, loader words, manifesto, about and contact copy
  projects.ts           the projects and their case-study content
  skills.ts             the two skill rows and their hover details
  experience.ts         education and work timeline
components/
  providers/            smooth scrolling (Lenis with GSAP), cursor, page transitions
  layout/               navbar and full-screen menu, footer, transition links
  motion/               text reveals, marquee, magnetic buttons, cursor, parallax,
                        reveal masks, scroll progress, preloader, circular text
  sections/             the home page sections
  projects/             case-study page and header, project images
public/media/           hero and reel video, portraits, project images
scripts/                image generation (project images, hero art, social card)
```

## Changing content

All the copy lives in `data/`. The text for each project in `data/projects.ts` is written from that
project's own repository and README, so check any new claim against the code before adding it.

Each project has two images in `public/media/projects/`: `<slug>-card.jpg` (portrait, 4:5) for the
showcase cards and `<slug>-hero.jpg` (landscape, 16:9) for the case-study header and banner. Phones
held upright get the portrait image in the header instead. `scripts/generate-media.mjs` rebuilds
both from the full-size originals, which stay out of the repository because of their size.

## Notes

- Lenis owns scrolling. GSAP's ticker drives it and it reports to ScrollTrigger, so nothing else
  moves the scroll position.
- The preloader runs once per session (`sessionStorage` key `nm:loaded`) and is skipped for anyone
  who prefers reduced motion.
- The custom cursor and magnetic effects switch off on touch screens.
- Below 1024px, and with reduced motion, the project arc becomes a plain vertical list.
- The site is live at https://nadunmathujaportfolio.netlify.app. If the domain changes, update
  `metadataBase` in `app/layout.tsx` so link previews point at the right images.

## Framer components

Three community Framer components are vendored under `components/framer/vendor/` and run outside
Framer through a small runtime shim (`components/framer/runtime.ts`), with their `framer-motion`
imports pointed at `motion/react`. Typed wrappers sit beside them: LiquidImage (WebGL displacement
and a greyscale to colour hover on the portraits), MagicBlendCursor (the global blend cursor) and
CircularTextPro (the rotating label in the hero and contact section).

To update one, fetch its module again from its `framer.com/m/...` share URL, follow the redirect to
`framerusercontent.com`, and point its `"framer"` and `"framer-motion"` imports back at the shim and
`motion/react`.
