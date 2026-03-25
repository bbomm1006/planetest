<instructions>
## 🚨 MANDATORY: CHANGELOG TRACKING 🚨

You MUST maintain this file to track your work across messages. This is NON-NEGOTIABLE.

---

## INSTRUCTIONS

- **MAX 5 lines** per entry - be concise but informative
- **Include file paths** of key files modified or discovered
- **Note patterns/conventions** found in the codebase
- **Sort entries by date** in DESCENDING order (most recent first)
- If this file gets corrupted, messy, or unsorted -> re-create it. 
- CRITICAL: Updating this file at the END of EVERY response is MANDATORY.
- CRITICAL: Keep this file under 300 lines. You are allowed to summarize, change the format, delete entries, etc., in order to keep it under the limit.

</instructions>

<changelog>

## 2026-03-24 — Animations, Interactivity & Responsiveness Pass
- Added scroll-reveal (`reveal`/`visible` CSS), `btn-press` hover/active, `nav-link` hover, `faq-answer` accordion CSS in `tailwind.css`
- Added custom keyframes/animations to `tailwind.config.js`: `fade-in-up`, `slide-up`, `cta-slide-up`, `float`, `marquee`, `fade-in`
- `Navbar/index.tsx` — mobile hamburger drawer with useState open/close, backdrop overlay, scroll shadow; `NavbarLinks.tsx` updated with internal anchors + hover
- `HeroSection/index.tsx` — staggered entrance animation on mount with `hero-reveal` class; app phone image floats
- `BottomCTA/index.tsx` — fixed `translate-y-[100px]` → `animate-cta-slide-up` so CTA is now visible
- `FloatingButton.tsx` — was `opacity-0`, now fades in after delay + scroll-to-top functionality
- `FAQBanner/index.tsx` — rotating FAQ questions with `setInterval`, scroll-reveal entrance
- `CasesSection/index.tsx` — full rewrite: `RevealSection` wrapper for every block, `FAQItem` accordion with per-item open/close state, `ReviewCard` extracted, `animate-marquee` for services strip, team section with hover effects, all nav links converted to internal anchors
- `AnnouncementBar.tsx`, `BottomBanner.tsx`, `FooterContent.tsx` — `btn-press` on buttons, hover states on links/social icons
- Created `src/hooks/useScrollReveal.ts` utility

</changelog>
<changelog>

## 2026-03-24 — Animations, Interactivity & Responsiveness Pass
- Added scroll-reveal (`reveal`/`visible` CSS), `btn-press` hover/active, `nav-link` hover, `faq-answer` accordion CSS in `tailwind.css`
- Added custom keyframes/animations to `tailwind.config.js`: `fade-in-up`, `slide-up`, `cta-slide-up`, `float`, `marquee`, `fade-in`
- `Navbar/index.tsx` — mobile hamburger drawer with useState open/close, backdrop overlay, scroll shadow; `NavbarLinks.tsx` updated with internal anchors + hover
- `HeroSection/index.tsx` — staggered entrance animation on mount with `hero-reveal` class; app phone image floats
- `BottomCTA/index.tsx` — fixed `translate-y-[100px]` → `animate-cta-slide-up` so CTA is now visible
- `FloatingButton.tsx` — was `opacity-0`, now fades in after delay + scroll-to-top functionality
- `FAQBanner/index.tsx` — rotating FAQ questions with `setInterval`, scroll-reveal entrance
- `CasesSection/index.tsx` — full rewrite: `RevealSection` wrapper for every block, `FAQItem` accordion with per-item open/close state, `ReviewCard` extracted, `animate-marquee` for services strip, team section with hover effects, all nav links converted to internal anchors
- `AnnouncementBar.tsx`, `BottomBanner.tsx`, `FooterContent.tsx` — `btn-press` on buttons, hover states on links/social icons

</changelog>
