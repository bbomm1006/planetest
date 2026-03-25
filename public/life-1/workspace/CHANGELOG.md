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

## 2026-03-25 — Redesign ReviewsSection to match reference image
- `ReviewCard.tsx` — increased card height to 520px/560px, refined avatar row, green tag style with border, body gradient `from-white via-white/80`, tighter typography
- `ReviewHeader.tsx` — emoji star, sky-500 subtitle, amber pill button (non-link, cleaner look)
- `CarouselDots.tsx` — dots now 7px circle / 18px×7px pill for active, blue-500 active color, gap-[5px]
- `ReviewCarousel.tsx` — updated card width 300px mobile / 380px desktop, gap 14px/20px
- `ReviewsSection/index.tsx` — background `bg-[#eef7ee]` (softer green), adjusted vertical padding

## 2026-03-25 — Redesign #team section as swipeable YouTube video carousel
- `CasesSection/components/TeamCarouselSection.tsx` — new component: 5-card thumbnail carousel with scale/opacity active card effect
- Touch-swipe (pan-y safe, horizontal lock) + pointer drag with live `dragOffset` feedback, snaps on release
- Click any card → YouTube modal overlay with autoplay embed + close button
- Dot indicators synced to `activeIndex` state; active dot stretches wider
- `CasesSection/index.tsx` — replaced old static team strip with `<TeamCarouselSection />`

## 2026-03-25 — Touch-swipe + live drag feedback for ReviewCarousel
- `ReviewCarousel.tsx` — added `onTouchStart`/`onTouchMove`/`onTouchEnd` handlers for native mobile swipe
- Added `dragOffset` state so the track visually follows the finger in real-time during drag (pointer & touch)
- `transition: none` while dragging, `ease-out 300ms` on release for natural snap feel
- `touchAction: "pan-y"` preserves vertical page scroll; `e.preventDefault()` only fires on horizontal moves >8px
- Unified `commitDrag` callback shared by both pointer-up and touch-end for consistent threshold logic

## 2026-03-25 — Remove Header/Navbar/Footer/Floating + Redesign ReviewSection
## 2026-03-25 — Remove Header/Navbar/Footer/Floating + Redesign ReviewSection
- `App.tsx` — removed `<Header>`, `<Navbar>`, `<Footer>`, `<FloatingButton>` and all their imports
- `ReviewHeader.tsx` — redesigned to match reference image: flex row layout, star icon + title/subtitle left, amber pill "모두보기" button right (no longer `absolute`-positioned)
- `ReviewsSection/index.tsx` — added shared `activeIndex` state connecting carousel ↔ dots; adjusted padding to accommodate interactive dots
- `ReviewCarousel.tsx` — full rewrite with pointer drag/swipe support, `translateX` driven by `activeIndex` prop, `cardWidth`/`cardGap` forwarded from parent
- `ReviewCard.tsx` — added `cardWidth`/`cardGap` props (inline style), fixed "이어서 읽기" button to static bottom (no absolute), cleaner gradient fade on body text
- `CarouselDots.tsx` — rewritten as interactive: active dot wider (`w-4`), clickable, driven by prop

## 2026-03-24 — Font Swap: Pretendard → Noto Sans KR
- Removed all 5 `@font-face` blocks with `@FONTWARNING` from `tailwind.css`
- Added Google Fonts preconnect + Noto Sans KR (wght 400–800) link to `index.html`
- Updated `tailwind.config.js` `pretendard` font stack: `"Pretendard"` → `"Noto Sans KR"`
- All `font-pretendard` Tailwind classes in components automatically pick up new font — no component changes needed

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
