<instructions>
This file will be automatically added to your context. 
It serves multiple purposes:
  1. Storing frequently used tools so you can use them without searching each time
  2. Recording the user's code style preferences (naming conventions, preferred libraries, etc.)
  3. Maintaining useful information about the codebase structure and organization
  4. Remembering tricky quirks from this codebase

When you spend time searching for certain configuration files, tricky code coupled dependencies, or other codebase information, add that to this CODER.md file so you can remember it for next time.
Keep entries sorted in DESC order (newest first) so recent knowledge stays in prompt context if the file is truncated.
</instructions>

<coder>

# Project: DDok.life (똑생) — Korean legaltech personal bankruptcy (개인회생) landing page

## Stack
- React 18 + TypeScript, Vite, Tailwind CSS 3, lucide-react, radix-ui
- No router (single-page, hash anchors)
- Font: Pretendard (loaded via CDN woff2 in tailwind.css)
- Path alias: `@/` → `./src/` (configured in vite.config.ts / tsconfig)

## Key File Locations
- All sections: `src/sections/<SectionName>/index.tsx`
- Global CSS + animation utilities: `tailwind.css`
- Tailwind config (custom keyframes/animations): `tailwind.config.js`
- Floating scroll-to-top: `src/components/FloatingButton.tsx`
- Scroll-reveal hook: `src/hooks/useScrollReveal.ts`

## Design Conventions
- Color palette: green (primary CTA), sky-blue (diagnosis CTA), indigo/purple (accents), amber (highlight tags)
- Rounded corners: mobile `rounded-[17px]`, desktop `rounded-[33px]` for card blocks
- Mobile padding: `p-[17px]`, desktop: `p-[34px]`
- Korean copy — do NOT change text content
- All images from CDN: `https://c.animaapp.com/mn4j4i5rMNHjkT/assets/`

## Animation Utilities (tailwind.css)
- `.reveal` + `.visible` — scroll-triggered fade-up
- `.btn-press` — hover opacity + active scale-down
- `.nav-link` — hover bg on nav items
- `.faq-answer` + `.open` — max-height accordion

## Animation Keyframes (tailwind.config.js)
- `animate-cta-slide-up` — bottom CTA entrance (was hidden with translate-y-[100px])
- `animate-float` — gentle vertical float (hero phone image, star image)
- `animate-marquee` — infinite horizontal scroll (services strip)
- `animate-fade-in` — simple opacity entrance

## Quirks
- `BottomCTA` was broken (had `translate-y-[100px]` and no animation) — fixed to `animate-cta-slide-up`
- `FloatingButton` was `opacity-0` — now fades in after 1.2s delay
- `CasesSection` is the mega-section with ALL page blocks after hero (reviews, lawyer, pricing, team, FAQ, etc.)
- Nav is `sticky top-0 z-50` — mobile hamburger appears at md breakpoint via `md:hidden`

</coder>
