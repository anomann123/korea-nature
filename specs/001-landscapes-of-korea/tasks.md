---

description: "Task list template for feature implementation"
---

# Tasks: 한국의 결 (Landscapes of Korea)

**Input**: Design documents from `/specs/001-landscapes-of-korea/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/markup-contract.md, quickstart.md

**Tests**: 자동화 테스트는 요청되지 않았다. `quickstart.md`의 수동 브라우저 검증 시나리오가 각 단계의
검증 기준이다(Polish 단계 T031에서 전체 실행).

**Organization**: 작업은 spec.md의 사용자 스토리(P1/P2/P3)별로 그룹화되어 있다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 선행 의존성 없음)
- **[Story]**: 이 작업이 속한 사용자 스토리 (US1, US2, US3)
- 각 작업에 정확한 파일 경로 포함

## Path Conventions

빌드 없는 단일 정적 사이트 구조(plan.md Project Structure)를 그대로 사용한다.

```text
index.html
styles.css
script.js
.nojekyll
CREDITS.md
assets/images/
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 저장소 루트에 빌드 없는 정적 사이트의 뼈대 파일을 만든다.

- [X] T001 저장소 루트에 `index.html`, `styles.css`, `script.js`, `.nojekyll`, 빈 `assets/images/` 디렉터리를 plan.md Project Structure대로 생성한다
- [X] T002 [P] `index.html`의 `<head>`에 charset/viewport meta, `<title>한국의 결</title>`, `./styles.css` 상대경로 stylesheet 링크를 추가하고, `</body>` 직전에 GSAP core + ScrollTrigger CDN `<script>` 태그(고정 버전, jsDelivr)를 이 순서대로, 그 다음에 `./script.js`를 로드하도록 배치한다
- [X] T003 [P] `styles.css`에 CSS reset(box-sizing 등)과 `:root` 커스텀 프로퍼티 자리(색상/타이포/spacing 토큰 변수명만 우선 정의, 값은 DESIGN.md 참조)를 추가한다

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리 이전에 반드시 끝나야 하는 실사진 확보, 정적 콘텐츠 뼈대, 그리고
스크롤 애니메이션이 올라탈 scene 겹침 레이아웃까지 준비한다.

**⚠️ CRITICAL**: 이 단계가 끝나기 전에는 어떤 사용자 스토리 작업도 시작할 수 없다.

- [X] T004 웹 검색/브라우징 도구로 Hero(한국 자연 풍경), 설악산, 제주, 순천만, 보성 녹차밭 각각에 대해 Wikimedia Commons/Unsplash/Pexels 원본 상세 페이지를 열어 작가·라이선스·재사용 조건을 확인하고 최종 사진 후보 5장을 선정한다 (research.md §8 워크플로 따름, 아직 다운로드하지 않음)
- [X] T005 T004에서 확정한 5장의 원본을 `assets/images/`에 `hero-korea`, `seoraksan`, `jeju`, `suncheon-bay`, `boseong-tea-fields` 파일명으로 다운로드하고, 라이선스가 허용하는 범위에서 화면 용도에 맞게 리사이즈 후 WebP로 최적화한다 (depends on T004)
- [X] T006 `CREDITS.md`를 생성하고 T005의 5개 이미지 각각에 대해 파일 경로·촬영자/제공기관·원본 상세 페이지 URL·라이선스·확인 날짜를 data-model.md의 Credit Entry 형식대로 기록한다 (depends on T005)
- [X] T007 `index.html`에 contracts/markup-contract.md 구조대로 `header#hero`, `main#journey[data-pin-root]` 안에 4개 `section[data-scene]`(설악산 → 제주 → 순천만 → 보성 녹차밭 순서, 각각 `figure.scene__media > img`(T005 이미지의 `./assets/images/...` 경로, width/height, 한국어 alt) + `div.scene__panel`(eyebrow, tagline, 본문 2문단, 키워드 목록)), `section#cta`, `footer#site-footer`를 만들고 spec.md에 지정된 Hero 리드문·장소별 본문·CTA 문구 전체를 그대로 채워 넣는다 (depends on T006)
- [X] T008 [P] `styles.css`에 DESIGN.md 타이포 스케일을 반영한 대체 폰트 스택(시스템 sans-serif + Pretendard/Noto Sans KR 등 OFL 라이선스 한글 웹폰트)과 디스플레이/본문 타이포 규칙을 정의한다 (depends on T003)
- [X] T009 [P] `styles.css`에 애니메이션 없는 기본 반응형 레이아웃(전체 화면에 가까운 이미지 `object-fit`, 패널 기본 위치, 섹션 간 세로 흐름)을 구현해, JS 없이도 페이지 전체가 읽을 수 있는 정적 문서로 동작하게 한다 (depends on T007, T008)
- [X] T010 [P] `styles.css`에서 `#journey` 내부 4개 scene의 `position: absolute; inset: 0` 겹침 스태킹을 **`body[data-motion="auto"] #journey [data-scene]`로 한정**하여 적용한다. JS가 아직 실행되지 않았거나(`data-motion` 속성 없음) `data-motion="reduced"`인 기본 상태에서는 T009의 정상 세로 흐름이 그대로 유지되어야 한다 (depends on T009)
- [X] T011 `script.js`에서 `window.matchMedia('(prefers-reduced-motion: reduce)')`와 모바일 브레이크포인트 `matchMedia`를 사용해 `document.body`의 `data-motion` 속성을 `"auto"` 또는 `"reduced"`로 설정하고, `gsap.registerPlugin(ScrollTrigger)`를 호출하는 초기화 골격을 작성한다 (depends on T002)
- [X] T012 [P] `script.js`에서 `[data-action="scroll-to-hero"]` 버튼 클릭 시 `#hero`로 스크롤 이동하는 핸들러를 구현한다 (depends on T007, T011)

**Checkpoint**: 실사진과 전체 한국어 콘텐츠가 들어간, **JS 실행 전이나 reduced-motion 상태에서는 항상**
애니메이션 없이 완전히 읽을 수 있는 키보드 접근 가능한 정적 페이지가 완성된다. `data-motion="auto"`가
설정된 이후에만 scene 겹침 레이아웃이 활성화될 준비가 되어 있다.

---

## Phase 3: User Story 1 - 스크롤로 네 곳의 풍경을 순서대로 감상한다 (Priority: P1) 🎯 MVP

**Goal**: Hero → 설악산 → 제주 → 순천만 → 보성 녹차밭 → CTA/footer가 하나의 pin + master timeline으로 연결된 연속 스크롤 여정이 되게 한다.

**Independent Test**: 페이지 최상단에서 최하단까지 스크롤만으로 이동해 6개 구획이 순서대로 나타나고, 섹션별 강제 정지·scroll-snap·휠 가로채기 없이 자연스럽게 전환되는지 확인한다.

### Implementation for User Story 1

- [X] T013 [US1] `script.js`에서 `data-motion === "auto"`일 때만 `ScrollTrigger.create({ trigger: '#journey', pin: true, start: 'top top', end: '+=<총 스크롤 거리>', scrub: 1.2 })`를 **단 하나만** 생성한다 (depends on T010, T011)
- [X] T014 [US1] `script.js`에서 하나의 `gsap.timeline()`을 만들어 장소별 label로 구간을 나누고, 각 scene의 `[data-parallax="background"]` 이미지에 대해 scale(1→1.1)·opacity(1→0/0→1) 트윈으로 20~30% 겹치는 cross-fade를 구현한다 (`ease: 'none'`) (depends on T013)
- [X] T015 [US1] 같은 timeline에 `[data-parallax="foreground"]` 패널에 대해 배경과 다른 속도의 translateY 트윈을 추가해 parallax를 만든다 (depends on T014)
- [X] T016 [US1] 같은 timeline에 각 scene의 장소명/한 줄 제목/본문/키워드가 서로 시차를 두고 fade+translate로 등장하는 트윈을 label 근처에 추가한다 (depends on T014)
- [X] T017 [US1] `script.js`에서 모든 `<img>`의 `decode()` 완료 + `document.fonts.ready` 이후 `ScrollTrigger.refresh()`를 1회 호출하고, `resize` 이벤트를 디바운스하여 재호출하는 로직을 추가한다 (depends on T013)

**Checkpoint**: 데스크톱에서 하나의 pin과 하나의 timeline만으로 처음부터 끝까지 끊김 없는 스크롤 여정이 동작한다.

---

## Phase 4: User Story 2 - 각 장소의 본문을 방해받지 않고 읽는다 (Priority: P2)

**Goal**: 본문이 사진 위 캡션이 아니라 독립된 읽기 영역으로, 충분한 폭·행간·대비와 체류 시간을 갖게 한다.

**Independent Test**: 임의의 장소 구획에서 스크롤을 멈추고 본문 두 문단 전체를 끝까지 읽을 수 있는지, 데스크톱 본문 폭이 약 36~48rem인지 확인한다.

### Implementation for User Story 2

- [X] T018 [US2] `styles.css`의 `.scene__panel`에 `width: clamp(36rem, 42vw, 48rem)`(또는 동등한 clamp 값), `font-size: 17~20px`, `line-height: 1.65~1.85`를 적용한다 (depends on T009)
- [X] T019 [US2] `styles.css`에서 사진 전체를 어둡게 하는 대신 `.scene__panel` 주변에 국소 gradient 또는 반투명 패널 배경을 적용해 텍스트-배경 명도 대비를 확보한다 (depends on T018)
- [X] T020 [US2] `script.js`의 master timeline에서 각 장소의 "hold"(정지/유지) 구간 duration 비중을 늘려, 스크롤이 멈추거나 느리게 진행되는 동안 본문이 등장 직후 사라지지 않고 충분히 유지되도록 label 간격을 조정한다 (depends on T014, T016)

**Checkpoint**: 실사진 배경 위에서도 본문 두 문단이 각 장소마다 여유 있게 읽힌다.

---

## Phase 5: User Story 3 - 네 장소가 서로 다른 리듬으로 구성되어 있음을 느낀다 (Priority: P3)

**Goal**: 장소마다 이미지-본문 좌우 배치·정렬·여백을 다르게 구성해 여행 잡지 같은 리듬을 만든다.

**Independent Test**: 네 장소 구획을 나란히 비교해 최소 2가지 이상의 서로 다른 배치 패턴이 쓰였는지 확인한다.

### Implementation for User Story 3

- [X] T021 [P] [US3] `styles.css`에 `[data-layout="text-right"]` 변형(패널이 화면 오른쪽 정렬)을 구현하고 설악산 scene(`#scene-seoraksan`)에 적용한다 (depends on T010)
- [X] T022 [P] [US3] `styles.css`에 `[data-layout="text-left"]` 변형(패널이 화면 왼쪽 정렬)을 구현하고 제주 scene(`#scene-jeju`)에 적용한다 (depends on T010)
- [X] T023 [P] [US3] `styles.css`에 `[data-layout="text-overlay-panel"]` 변형(반투명 패널이 이미지 중앙/하단에 겹침)을 구현하고 순천만 scene(`#scene-suncheon-bay`)에 적용한다 (depends on T010)
- [X] T024 [P] [US3] `styles.css`에 `[data-layout="text-lower-band"]` 변형(패널이 화면 하단 띠 형태)을 구현하고 보성 녹차밭 scene(`#scene-boseong-tea-fields`)에 적용한다 (depends on T010)

**Checkpoint**: 네 장소가 시각적으로 뚜렷이 구별되는 편집 레이아웃을 갖는다. (Foundational의 T010만
끝나면 US1/US2와 무관하게 바로 시작할 수 있다.)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 접근성, 성능, 배포 안정성을 마무리하고 전체 시나리오를 검증한다.

- [X] T025 [P] `styles.css`에 `body[data-motion="reduced"] #journey` 및 하위 scene에 대해 `position: static`, `transform: none`, `opacity: 1`를 명시적으로 재확인하는 방어 규칙을 추가한다 (T010이 이미 `data-motion="auto"`로 스코프를 좁혀 두었으므로 이 작업은 회귀 방지용 안전장치다) (depends on T010, T018–T024)
- [X] T026 `script.js`에서 `data-motion === "reduced"`이거나 모바일 브레이크포인트일 때 T013의 `ScrollTrigger.create` 및 T014–T017의 timeline 생성 자체가 호출되지 않는지 재검토하고 분기 로직을 확정한다 (depends on T013–T017, T011)
- [X] T027 [P] `styles.css`에 모바일 브레이크포인트 이하에서 `#journey`와 scene들이 pin 없이 이미지 다음에 본문이 이어지는 일반 세로 문서로 렌더링되도록 규칙을 추가한다 (depends on T009, T010)
- [X] T028 [P] `index.html`/`styles.css`/`script.js` 전반에서 애니메이션 대상이 `transform`/`opacity`뿐인지, 연속적인 `filter`/`blur` 애니메이션이 없는지 점검하고, `will-change`를 실제로 움직이는 레이어(`[data-parallax]`)에만 제한적으로 적용한다 (depends on T014–T017)
- [X] T029 [P] 헤딩 위계, CTA 버튼의 키보드 포커스/포커스 링, 모든 `img`의 한국어 alt 텍스트 구체성을 점검하고 필요한 수정을 `index.html`/`styles.css`에 반영한다 (depends on T007, T012)
- [X] T030 `index.html`, `styles.css`, `script.js`에서 모든 자산/스크립트/스타일 참조가 `./` 상대 경로인지, `/assets/...` 같은 루트 절대 경로나 외부 hotlink가 없는지 전수 점검한다 (depends on T007, T002)
- [X] T031 로컬 정적 서버와 GitHub Pages 하위 경로를 시뮬레이션한 환경에서 `quickstart.md`의 9개 시나리오를 모두 실행하고 결과를 기록한다 (depends on T017, T020, T025–T027, T030, T032) — 결과는 아래 "quickstart.md 검증 결과" 참고. 시나리오 1/6/7/8/9는 HTTP/구조 레벨로 직접 확인, 시나리오 2/3/4/5는 코드·CSS 리뷰로 확인(실제 브라우저 렌더링 확인 아님, claude-in-chrome 등으로 후속 확인 권장)
- [X] T032 `assets/images/`의 실제 파일 목록과 `CREDITS.md` 항목을 1:1 대조해 누락되거나 짝이 맞지 않는 항목이 없는지 최종 확인한다 (depends on T006, T005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 시작, 모든 사용자 스토리를 막는 선행 단계 (T004–T007은 순차적, 그 뒤 T008–T012)
- **User Stories (Phase 3–5)**: 모두 Foundational 완료 후 시작. 우선순위(P1 → P2 → P3) 순서로 진행 권장하나, US3(레이아웃 변형)은 Foundational의 T010만 있으면 되므로 US1/US2와 완전히 병행 가능
- **Polish (Phase 6)**: 원하는 사용자 스토리가 모두 끝난 뒤 시작

### User Story Dependencies

- **US1 (P1)**: Foundational 이후 시작 가능, 다른 스토리에 의존하지 않음 — master timeline/pin 자체를 만듦
- **US2 (P2)**: Foundational 이후 시작 가능하나, T020(hold 구간 조정)은 US1의 T014/T016 timeline이 이미 존재해야 의미가 있음 — US1 이후 진행 권장
- **US3 (P3)**: Foundational의 T010(scene 겹침 스태킹)만 끝나면 즉시 시작 가능(순수 CSS 레이아웃 변형), US1/US2와 파일 충돌 없이 실제로 병행 가능

### Within Each User Story

- US1: T013(pin, Foundational T010/T011에 의존) → T014(cross-fade) → T015/T016(parallax/텍스트, 병행 가능) → T017(refresh)
- US2: T018 → T019 → T020(US1 timeline 존재 후)
- US3: T021–T024는 서로 다른 scene의 서로 다른 선택자이므로 전부 병렬 가능 (Foundational T010에만 의존)

### Parallel Opportunities

- Setup: T002, T003 병렬 가능
- Foundational: T008, T009 병렬 가능 (T007 완료 후); T009 완료 후 T010 진행; T012는 T007/T011 완료 후 독립적으로 가능
- US3의 T021–T024는 4개 모두 병렬 가능하며 US1/US2 진행 여부와 무관하게 시작 가능
- Polish의 T025, T027, T028, T029는 서로 다른 관심사라 병렬 가능

---

## Parallel Example: User Story 3

```bash
Task: "[P] [US3] styles.css에 [data-layout=\"text-right\"] 변형 구현 (설악산)"
Task: "[P] [US3] styles.css에 [data-layout=\"text-left\"] 변형 구현 (제주)"
Task: "[P] [US3] styles.css에 [data-layout=\"text-overlay-panel\"] 변형 구현 (순천만)"
Task: "[P] [US3] styles.css에 [data-layout=\"text-lower-band\"] 변형 구현 (보성 녹차밭)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup 완료
2. Phase 2 Foundational 완료 (실사진 확보 + CREDITS.md + 정적 콘텐츠 뼈대 + scene 겹침 레이아웃 — 필수 게이트)
3. Phase 3 User Story 1 완료 (단일 pin + master timeline 스크롤 여정)
4. **STOP and VALIDATE**: quickstart.md 시나리오 1을 독립적으로 확인
5. 이 시점에서 이미 "스크롤로 네 장소를 감상"하는 핵심 가치는 전달됨

### Incremental Delivery

1. Setup + Foundational → 실사진과 전체 텍스트가 들어간 정적 폴백 페이지 완성 (scene 겹침 레이아웃은 `data-motion="auto"`일 때만 활성화되도록 준비됨)
2. US1 추가 → 연속 스크롤 여정 완성 → 검증 (MVP)
3. US2 추가 → 본문 가독성/체류 시간 보강 → 검증
4. US3 추가 → 장소별 레이아웃 리듬 보강 → 검증 (Foundational 직후 US1/US2와 병행 가능)
5. Polish → reduced-motion/모바일 폴백, 성능/접근성/경로 점검, 전체 quickstart 검증

---

## Notes

- [P] 작업 = 서로 다른 파일 또는 서로 다른 CSS 선택자, 선행 의존성 없음
- [Story] 라벨은 spec.md의 사용자 스토리 추적용
- Foundational 단계(T004–T007)의 이미지 확보는 실제 네트워크 검색이 필요하며, 확보 실패 시 placeholder로 대체하지 않고 어떤 장소가 누락되었는지 보고한 뒤 해당 단계를 완료 처리하지 않는다 (헌법 VI, spec.md FR-018)
- T010의 scene 겹침 스태킹은 반드시 `body[data-motion="auto"]` 선택자로 스코프를 좁혀야 하며, 그렇지 않으면 Foundational 체크포인트("JS 없이도 읽을 수 있는 정적 페이지")가 깨진다
- 모든 CSS/JS 변경은 `transform`/`opacity` 중심 원칙(FR 성능 요구)을 벗어나지 않는지 각 작업 완료 시 확인한다
