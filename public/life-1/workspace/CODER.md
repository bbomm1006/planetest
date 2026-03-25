<instructions>
이 파일은 자동으로 컨텍스트에 추가됩니다.
여러 목적으로 사용됩니다:
  1. 자주 사용하는 도구를 저장하여 매번 검색하지 않아도 되도록
  2. 사용자의 코드 스타일 선호도 기록 (네이밍 컨벤션, 선호 라이브러리 등)
  3. 코드베이스 구조와 구성에 대한 유용한 정보 유지
  4. 이 코드베이스의 까다로운 특이사항 기억

특정 설정 파일, 복잡하게 결합된 코드 의존성, 기타 코드베이스 정보를 검색하는 데 시간을 쓴 경우,
다음에 기억할 수 있도록 이 CODER.md 파일에 추가하세요.
항목은 내림차순(최신순)으로 정렬하여 파일이 잘릴 경우 최근 정보가 컨텍스트에 유지되도록 합니다.
</instructions>

<coder>

# 프로젝트: DDok.life (클린메이트)

## 기술 스택
- React 18 + TypeScript, Vite, Tailwind CSS 3, lucide-react, radix-ui
- 라우터 없음 (단일 페이지, 해시 앵커 방식)
- 폰트: Noto Sans KR (Google Fonts, index.html의 <link>로 로드) — Pretendard 대체 (모든 5가지 굵기에서 @FONTWARNING 발생)
- 경로 별칭: `@/` → `./src/` (vite.config.ts / tsconfig에 설정됨)

## 주요 파일 위치
- 모든 섹션: `src/sections/<섹션명>/index.tsx`
- 전역 CSS + 애니메이션 유틸리티: `tailwind.css`
- Tailwind 설정 (커스텀 keyframes/애니메이션): `tailwind.config.js`
- 플로팅 스크롤-투-탑: `src/components/FloatingButton.tsx`
- 스크롤 리빌 훅: `src/hooks/useScrollReveal.ts`

## 디자인 컨벤션
- 색상 팔레트: green (주요 CTA), sky-blue (진단 CTA), indigo/purple (강조), amber (하이라이트 태그)
- 모서리 둥글기: 모바일 `rounded-[17px]`, 데스크탑 `rounded-[33px]` (카드 블록)
- 모바일 패딩: `p-[17px]`, 데스크탑: `p-[34px]`
- 한국어 텍스트 — 내용 변경 금지
- 모든 이미지는 CDN 사용: `https://c.animaapp.com/mn4j4i5rMNHjkT/assets/`

## 애니메이션 유틸리티 (tailwind.css)
- `.reveal` + `.visible` — 스크롤 트리거 페이드업
- `.btn-press` — 호버 투명도 + 액티브 축소 효과
- `.nav-link` — 네비게이션 항목 호버 배경
- `.faq-answer` + `.open` — max-height 아코디언

## 애니메이션 Keyframes (tailwind.config.js)
- `animate-cta-slide-up` — 하단 CTA 등장 효과 (translate-y-[100px]로 숨겨져 있었음)
- `animate-float` — 부드러운 수직 부유 효과 (히어로 폰 이미지, 별 이미지)
- `animate-marquee` — 무한 수평 스크롤 (서비스 스트립)
- `animate-fade-in` — 단순 투명도 등장 효과

## 특이사항
- `BottomCTA`가 깨져 있었음 (`translate-y-[100px]`에 애니메이션 없음) — `animate-cta-slide-up`으로 수정
- `FloatingButton`이 `opacity-0` 상태였음 — 1.2초 딜레이 후 페이드인으로 수정
- `CasesSection`은 히어로 이후 모든 페이지 블록(리뷰, 가격, 팀, FAQ 등)을 포함하는 메가 섹션
- 네비게이션은 `sticky top-0 z-50` — 모바일 햄버거 메뉴는 `md:hidden`으로 md 브레이크포인트에서 표시

</coder>