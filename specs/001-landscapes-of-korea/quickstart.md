# Quickstart: 한국의 결 (Landscapes of Korea)

빌드 과정이 없는 정적 사이트이므로 "실행"은 정적 파일 서빙만으로 충분하다. 이 문서는 구현 완료
후 사람이 브라우저에서 직접 확인해야 하는 검증 시나리오를 정의한다(자동화 테스트 스위트는 이
프로젝트 범위에 없음 — plan.md Technical Context 참조).

## 사전 준비물

- `index.html`, `styles.css`, `script.js`, `.nojekyll`, `assets/images/*`, `CREDITS.md`가 저장소
  루트에 존재해야 함
- `assets/images/`에 최소 5개 실제 사진 파일 존재: `hero-korea.*`, `seoraksan.*`, `jeju.*`,
  `suncheon-bay.*`, `boseong-tea-fields.*` (placeholder/단색 박스 없음)
- 로컬에서 확인할 정적 파일 서버(예: `npx serve .` 또는 VS Code Live Server 등 임의의 정적
  서버) — 파일을 `file://`로 직접 열면 일부 브라우저에서 상대 경로/폰트 로딩이 다르게 동작할 수
  있으므로 `http://localhost`로 서빙해 확인한다.

## 실행

```bash
npx serve .
# 또는: python -m http.server 8000
```

브라우저에서 `http://localhost:<port>/index.html` 접속.

## 검증 시나리오

### 1. 연속 스크롤 여정 (User Story 1, FR-001·FR-008·FR-009)
- 페이지 최상단(Hero)에서 끝까지 마우스 휠/트랙패드로만 스크롤한다.
- **기대 결과**: Hero → 설악산 → 제주 → 순천만 → 보성 녹차밭 → CTA/footer 순서로 전부 나타나며,
  섹션 경계에서 스크롤이 멈췄다 풀리는 느낌(추가 pin)이나 `scroll-snap` 식의 계단형 이동이 없다.
  빠르게 휠을 여러 번 돌려도 장면이 한 번에 통째로 교체되지 않는다.

### 2. 본문 읽기 유지 (User Story 2, FR-005·FR-006·FR-010)
- 임의의 장소 구획 중앙에서 스크롤을 멈춘다.
- **기대 결과**: 본문 두 문단이 화면에 유지된 채로 끝까지 읽을 수 있다. 데스크톱 폭(≥1280px
  권장)에서 본문 컨테이너의 실제 렌더링 폭을 DevTools로 측정해 약 36~48rem(≈576~768px, 루트
  폰트 16px 기준) 범위인지 확인한다. `font-size`는 17~20px, `line-height`는 1.65~1.85 범위인지
  computed style로 확인한다.

### 3. 장소별 레이아웃 리듬 (User Story 3, FR-007)
- 네 장소 구획을 나란히 비교(스크린샷 또는 DevTools로 각 `[data-layout]` 값 확인)한다.
- **기대 결과**: `data-layout` 값이 최소 2종류 이상 실제로 다르게 적용되어 있다(예:
  `text-right`, `text-left`, `text-overlay-panel`, `text-lower-band` 중 반복 없이 다양하게 사용).

### 4. `prefers-reduced-motion` 폴백 (FR-012, 헌법 IV/VII)
- OS 또는 브라우저 DevTools의 Rendering 패널에서 "Emulate CSS media feature
  prefers-reduced-motion: reduce"를 켠다.
- **기대 결과**: `body[data-motion="reduced"]`로 전환되고, `#journey`에 pin/scrub 동작이 없는
  일반 세로 스크롤 문서로 렌더링된다. Hero부터 CTA까지 모든 텍스트·이미지 콘텐츠는 동일하게
  전부 보인다(생략된 문단 없음).

### 5. 모바일 폭 폴백 (FR-011, 헌법 VII)
- DevTools 반응형 모드에서 폭 375~430px로 축소한다.
- **기대 결과**: pin이 해제되고 이미지 다음에 본문이 이어지는 일반 세로 문서 흐름이 된다. 본문
  두 문단과 키워드가 데스크톱과 동일하게 전부 노출되며 한두 줄로 축약되거나 숨겨지지 않는다.

### 6. 키보드 접근성 (FR-013, 헌법 IV)
- 마우스를 사용하지 않고 `Tab` 키만으로 페이지 최상단부터 CTA 버튼까지 포커스를 이동한다.
- **기대 결과**: 포커스 가능한 요소(최소 CTA 버튼)에 도달할 수 있고, `Enter`/`Space`로 실행하면
  `#hero`로 스크롤 이동한다. 포커스 링이 시각적으로 보인다(outline 제거 없음).

### 7. 이미지 무결성 및 상대 경로 (FR-015~FR-019, 헌법 III·VI)
- DevTools Network 탭에서 페이지 새로고침 후 `assets/images/` 요청을 확인한다.
- **기대 결과**: 모든 이미지 요청이 200으로 응답하고, 응답 `content-type`이 실제 이미지
  포맷과 일치하며, 외부 도메인(hotlink)으로 나가는 이미지 요청이 없다. `index.html`/`styles.css`
  소스에서 이미지·자산 경로가 전부 `./assets/...`(또는 `assets/...`) 상대 경로이고
  `/assets/...` 같은 루트 절대 경로가 없는지 텍스트 검색으로 확인한다.

### 8. GitHub Project Pages 하위 경로 시뮬레이션 (FR-019, SC-008)
- 로컬 정적 서버에서 사이트 전체를 `/some-repo-name/` 같은 하위 경로 아래로 옮겨(또는 서버의
  base path 옵션으로) 서빙한 뒤 같은 URL 하위경로로 접속한다.
- **기대 결과**: 모든 이미지·스타일·스크립트가 깨지지 않고 로드된다.

### 9. `CREDITS.md` 대조 (FR-016, 헌법 VI)
- `assets/images/` 안의 각 파일과 `CREDITS.md`의 항목을 1:1로 대조한다.
- **기대 결과**: 파일마다 경로·작가/제공기관·원본 URL·라이선스·확인 날짜가 모두 채워져 있고,
  빠진 이미지나 짝이 맞지 않는 항목이 없다.

## 완료 판정

위 9개 시나리오가 모두 기대 결과대로 동작해야 이 기능이 "구현 완료"로 간주된다. 특히 시나리오
7·9는 헌법 VI(라이선스가 확인되지 않은 이미지·placeholder 금지)의 필수 게이트이며, 어느 한
장소라도 실제 라이선스 확인 사진을 확보하지 못했다면 그 사실을 명시적으로 보고하고 완료로
처리하지 않는다(스펙 FR-018).
