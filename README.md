# SCSS 구조 가이드

## 폴더 구조

```
scss/
├── main.scss                     ← 진입점 (여기만 컴파일)
│
├── abstracts/                    ← 출력 없는 설정값
│   ├── _variables.scss           ← CSS 커스텀 프로퍼티 + SCSS 변수
│   └── _mixins.scss              ← 미디어쿼리 단축 믹스인
│
├── base/                         ← 전역 기반
│   ├── _reset.scss               ← reset + backToTop
│   └── _layout.scss              ← .sw .inner .s-tag .s-h .s-p
│
├── components/                   ← 재사용 UI 조각
│   ├── _modal.scss               ← 백드롭 + 공통 모달 헤더
│   ├── _floating.scss            ← 플로팅 버튼 + 추천 모달
│   ├── _utils.scss               ← .fu fade-up 유틸
│   └── _board.scss               ← 게시판 공통 컴포넌트
│
├── sections/                     ← 페이지 섹션별 분리
│   ├── _hero.scss
│   ├── _benefits.scss
│   ├── _products.scss            ← 제품 카드 + 상세 모달
│   ├── _compare.scss             ← 비교 바 + 비교 모달
│   ├── _combo.scss               ← 콤보 계산기 모달 + 신청폼
│   ├── _videos.scss              ← 영상 + 리뷰 슬라이더
│   ├── _event.scss               ← 이벤트/카운트다운 + 문의폼
│   ├── _notices.scss             ← 공지사항 + 상세 오버레이
│   ├── _stores.scss              ← 매장 찾기 + 지도
│   ├── _faq.scss                 ← FAQ + 갤러리 탭
│   ├── _gallery.scss             ← 갤러리 + 라이트박스 + 슬라이드갤러리
│   ├── _reservation.scss         ← 예약 + 조회 + rv2
│   └── _footer.scss              ← 푸터 + 법적 약관 페이지
│
└── features/                     ← 독립 기능 단위 (별도 CSS였던 것들)
    ├── _bkf_public.scss          ← bkf_public.css (.bkf-* 접두어)
    └── _custom_inquiry.scss      ← custom_inquiry_front.css (.ci-* 접두어)
```

## 빌드 방법

"savePath": "/css"

## 핵심 원칙

| 원칙 | 내용 |
|------|------|
| **Partial 파일** | `_` 접두사 → 단독 컴파일 방지 |
| **@use 사용** | 구식 `@import` 대신 모듈 스코프 관리 |
| **반응형 동거** | 각 섹션 파일 안에 해당 반응형을 같이 작성 |
| **CSS 변수 유지** | `--sky`, `--blue` 등 런타임 토큰은 그대로, SCSS 변수는 내부 계산용 |
| **믹스인 활용** | `@include md { }` 로 768px 이하 단축 가능 |

## 믹스인 사용 예시

```scss
@use '../abstracts/mixins' as m;

.my-component {
  display: grid;
  grid-template-columns: 1fr 1fr;

  @include m.md {
    grid-template-columns: 1fr;
  }
}
```
