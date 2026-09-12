# Implementation Plan: 한국의 결 (Landscapes of Korea)

**Branch**: `001-landscapes-of-korea` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-landscapes-of-korea/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

한국의 결(LANDSCAPES OF KOREA)은 설악산·제주·순천만·보성 녹차밭 네 장소를 큰 사진과 충분한 한국어
본문으로 소개하는 단일 페이지 정적 사이트다. 기술적으로는 빌드 과정 없는 순수 `index.html` /
`styles.css` / `script.js` 세 파일과 `assets/images/`만으로 구성하고, GSAP + ScrollTrigger로
전체 여정을 감싸는 **하나의 pin과 하나의 master timeline**에 이미지 스케일·교차·시차 텍스트 등장을
연결한다. 섹션별 개별 pin, `scroll-snap`, 휠 가로채기는 사용하지 않는다. 모바일과
`prefers-reduced-motion`에서는 pin을 해제하고 일반 세로 문서로 자연스럽게 폴백한다. 사진은 구현
과정에서 Wikimedia Commons/Unsplash/Pexels 등 출처가 확인되는 원본을 직접 검색해
`assets/images/`에 다운로드하고, 파일별 출처를 `CREDITS.md`에 기록한다.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2019+, no transpilation) — 브라우저 네이티브 `<script type="module">` 불필요, 단일 non-module 스크립트로 충분

**Primary Dependencies**: GSAP 3.x (core) + ScrollTrigger 플러그인, 둘 다 jsDelivr CDN에서 고정 버전으로 로드 (빌드 도구 없음)

**Storage**: N/A — 서버·데이터베이스 없음. 상태는 없음(스크롤 위치는 브라우저 네이티브 상태)

**Testing**: 자동화 단위 테스트 없음(정적 마크업/애니메이션 프로젝트). `quickstart.md`의 수동 브라우저 검증 체크리스트(스크롤 전체 여정, reduced-motion, 모바일 폭, 키보드 내비게이션, 이미지 로드/치수, GitHub Pages 하위 경로 시뮬레이션)로 검증

**Target Platform**: 최신 데스크톱/모바일 브라우저(Chrome, Safari, Firefox, Edge 최근 2개 메이저 버전), GitHub Pages(Project Pages 하위 경로 포함) 정적 호스팅

**Project Type**: 정적 단일 페이지 웹사이트 (build-less)

**Performance Goals**: 애니메이션은 60fps를 목표로 `transform`/`opacity`만 사용해 매 프레임 layout/paint 재계산을 피함. 초기 진입 시 Hero + 첫 장소 이미지만 우선 로드되어 체감 로딩이 빠르게 시작되도록 함

**Constraints**: 빌드 파이프라인 없음(순수 정적 파일), 서버·DB·로그인 없음(헌법 I), 모든 경로는 상대 경로(`./assets/...`, 헌법 III), 커스텀 폰트 무단 복사 금지 → 시스템 sans-serif 또는 합법적 대체 폰트 사용, 이미지 전부 실사진(라이선스 확인) + `CREDITS.md` 기록(헌법 VI), 섹션별 개별 pin/scroll-snap/휠 가로채기 금지(스펙 FR-009)

**Scale/Scope**: 페이지 1개, 구획 6개(Hero, 장소 4개, CTA/footer), 이미지 5장 내외(Hero 1 + 장소별 최소 1), 방문자 트래픽은 정적 GitHub Pages 수준(별도 스케일링 설계 불필요)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 근거 |
|---|---|---|
| I. Single-Page Static Scope | PASS | 단일 `index.html`, 서버/DB/로그인 없음. GSAP는 클라이언트 전용 애니메이션 라이브러리로 서버 의존성을 만들지 않음 |
| II. DESIGN.md as Visual Source of Truth | PASS | `DESIGN.md`는 읽기 전용 참조로만 사용, 수정하지 않음. 색상/타이포/spacing 토큰을 CSS 변수로 매핑해 사용 |
| III. Portable Relative Paths | PASS | 모든 이미지·자산 경로를 `./assets/...` 상대 경로로 작성, 절대 루트 경로(`/assets/...`) 금지 |
| IV. Semantic HTML & Accessibility | PASS | `header`/`main`/`section`/`figure`/`footer` 등 시맨틱 태그, 키보드로 도달 가능한 CTA, `prefers-reduced-motion` 시 ScrollTrigger 강한 전환 비활성화 |
| V. Real Content Over Decoration | PASS | spec.md의 Hero 리드문·장소별 본문 2문단·키워드 전문을 HTML에 그대로 포함, 캡션으로 축약하지 않음 |
| VI. Authentic, Licensed Imagery | PASS (구현 시 검증) | 구현 단계에서 실제 사진을 직접 검색·다운로드하고 `CREDITS.md`에 출처 기록. 확보 실패 시 placeholder로 대체하지 않고 완료 처리 보류(스펙 FR-018) |
| VII. Continuous Desktop Scroll, Simple Mobile Fallback | PASS | 데스크톱은 단일 pin + master timeline 기반 연속 스크롤, 모바일은 pin 해제 후 일반 세로 문서로 폴백 |
| VIII. No Unnecessary Dependencies | PASS | GSAP/ScrollTrigger 외 프레임워크(React/Vue/Next 등) 없음, 빌드 도구 없음, 순수 정적 파일 |

**Initial Gate Result**: 모든 원칙 통과. 위반 없음 — Complexity Tracking 불필요.

## Project Structure

### Documentation (this feature)

```text
specs/001-landscapes-of-korea/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── markup-contract.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html              # 전체 페이지 마크업 (Hero, 4개 장소 section, CTA/footer)
styles.css              # DESIGN.md 기반 토큰 + 레이아웃 + 모션/reduced-motion 규칙
script.js               # GSAP + ScrollTrigger 초기화, master timeline, resize/refresh 처리
DESIGN.md                # 기존 파일, 읽기 전용 (수정 금지)
CREDITS.md               # 이미지별 출처 기록 (구현 단계에서 생성/갱신)
.nojekyll                 # GitHub Pages Jekyll 처리 비활성화
assets/
└── images/
    ├── hero-korea.webp
    ├── seoraksan.webp
    ├── jeju.webp
    ├── suncheon-bay.webp
    └── boseong-tea-fields.webp
```

**Structure Decision**: 별도의 `src/`, `backend/`, `frontend/` 분리 없이 저장소 루트에 3개 핵심
파일(`index.html`, `styles.css`, `script.js`)과 `assets/images/`만 두는 **단일 정적 사이트 구조**를
채택한다. 이는 헌법 VIII(불필요한 의존성 금지)과 사용자가 지정한 "핵심 파일을 이 수준으로 단순하게
유지" 요구를 그대로 반영한 것이다. GSAP/ScrollTrigger는 로컬 번들링 없이 CDN `<script>` 태그로
로드해 빌드 단계를 만들지 않는다.

## Complexity Tracking

> 위반 없음 — 이 표는 비워둔다.
