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
## 2026-03-25 (font swap)
- Replaced all 4 restricted `NanumSquareNeo` @font-face blocks (with @FONTWARNING) in `tailwind.css` with Google Fonts import of `Noto Sans KR` (400/500/700/900)
- Added `<link>` preconnect + stylesheet for Noto Sans KR in `index.html`
- Updated `tailwind.config.js` fontFamily `nanumsquareneo` to use `"Noto Sans KR"` as primary

## 2026-03-25
- Removed `<Header>` and `<CtaBanner>` (footer) from `src/App.tsx`
- Removed `pt-16 pb-[58px] md:pt-24 md:pb-[87px]` padding from App wrapper (was compensating for fixed header/footer)
- Added inline "네이버 현대카드 자세히보기 >" link inside `HeroEvents.tsx` to match screenshot
- Cloned layout matches: Hero (white) → Events (black with CTA link) → Sections flow
</changelog>
