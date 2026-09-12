# Research: 한국의 결 (Landscapes of Korea)

## 1. 단일 pin + master timeline 구조

**Decision**: 전체 여정(Hero 제외 또는 포함 가능한 4개 장소 구간)을 감싸는 하나의 wrapper
(`<div id="journey">`)에 `ScrollTrigger.create({ trigger: '#journey', pin: true, start: 'top top',
end: '+=<총 스크롤 거리>', scrub: 1.2 })`를 걸고, 그 안에서 하나의 `gsap.timeline()`에 장소별
세그먼트를 순차적으로 이어 붙인다. 각 장소는 timeline의 label(`.to('#seoraksan-scene', {...},
'seoraksan')`)로 구간을 나눠 관리한다.

**Rationale**: 사용자 지시("장소별로 ScrollTrigger pin을 여러 개 만들지 말고 전체 여정에 하나의
pin과 하나의 master timeline을 우선 사용")와 스펙 FR-009(섹션별 강제 pin 반복 금지)를 동시에
만족하는 유일한 구조다. 하나의 timeline이면 장면 간 겹침(20~30% cross-fade)과 텍스트 시차 등장을
정확한 스크롤 진행률(progress) 값으로 동기화하기 쉽다.

**Alternatives considered**:
- 장소별 개별 `ScrollTrigger` pin 4개: 구현은 단순하지만 섹션 경계마다 스크롤이 멈췄다 풀리는
  느낌을 주기 쉬워 금지 사항과 충돌.
- IntersectionObserver 기반 수동 페이드: pin/scrub 없이 섹션이 뷰포트에 들어올 때 클래스 토글로
  페이드만 주는 방식. 자연스러운 "확대되며 들어오는" tunnel 느낌과 scrub 연동이 어려워 기각.

## 2. scrub 값과 easing

**Decision**: `scrub: 1.2`(숫자, `true` 아님), timeline 내부 tween의 `ease: 'none'`을 사용한다.
Hero → 첫 장소 진입 구간과 장소 간 전환 구간에는 `duration`을 크게 잡아(전체 timeline 대비 각
장소 30~40% 비중) 본문 체류 구간을 확보한다.

**Rationale**: `scrub: true`는 스크롤 위치에 즉시 1:1로 붙어 빠른 휠 동작에서 장면이 튀어 보일 수
있다. 숫자 scrub은 지정한 초(1.2초) 동안 지연 보간(lag)되어 "부드럽게 따라오는" 느낌을 만든다.
`ease: 'none'`은 scrub 구간 자체가 이미 스크롤 위치의 함수이므로, 추가 가속/감속 이징을 넣으면
스크롤 입력과 시각적 진행이 어긋나 튀는 느낌(rubber-banding)이 생기기 때문에 피한다.

**Alternatives considered**: `scrub: true` — 반응은 즉각적이지만 "빠르게 휠을 움직여도 장면이
순간 교체되지 않아야 한다"는 요구와 충돌해 기각.

## 3. Cross-fade / tunnel 전환 구현 방식

**Decision**: 각 장소 장면을 `position: absolute; inset: 0`으로 겹쳐 쌓고, timeline에서
이전 장면 `scale`을 1 → 1.08~1.12로, `opacity`를 1 → 0으로, 다음 장면은 `scale` 1.05 → 1,
`opacity` 0 → 1로 동시에 트윈해 20~30% 구간 동안 겹치게 한다. 배경(사진) 레이어와 전경(텍스트
패널) 레이어를 분리해 서로 다른 스크롤 배율로 움직여 parallax를 만든다(전경 텍스트는 배경보다
약간 느리게/빠르게 translateY). "tunnel" 느낌은 다음 장면의 `scale`이 확대되며 들어오는
효과만으로 재해석하며, 실제 3D perspective/`clip-path` 터널 지오메트리는 복잡도 대비 성능 이점이
낮아 사용하지 않는다.

**Rationale**: Awwwards 레퍼런스의 "장면 안으로 들어가는 느낌"을 코드/에셋을 복제하지 않고
독자적으로 재해석하라는 요구를 만족하면서, `transform`(scale, translate)과 `opacity`만 사용해
성능 원칙(레이아웃 재계산 회피)을 지킨다.

**Alternatives considered**: `clip-path` 기반 mask reveal을 전면 tunnel 효과로 사용 — 시각적으로
화려하지만 매 프레임 clip-path 보간이 GPU 합성 경로를 타지 못하는 브라우저가 있어 성능 리스크가
있음. 대신 mask/overflow reveal은 텍스트 패널 등장 시 보조 효과로 제한적으로만 사용.

## 4. prefers-reduced-motion 폴백

**Decision**: 페이지 로드 시 `window.matchMedia('(prefers-reduced-motion: reduce)').matches`를
확인해 true면 `ScrollTrigger.create`/`pin`/`scrub` 애니메이션 초기화 자체를 건너뛰고, 모든 장면을
기본 문서 흐름(`position: static`, `opacity: 1`)으로 렌더링한다. 모바일 폭(예: 두 브레이크포인트
`max-width: 768px` 등 구체 값은 구현 단계에서 CSS로 확정)에서도 동일하게 pin을 해제하고 일반
세로 스크롤 문서로 전환한다. 두 조건 중 하나라도 참이면 "reduced experience 모드"로 취급한다.

**Rationale**: 스펙 FR-012, 헌법 IV/VII과 사용자 지시("prefers-reduced-motion에서는
ScrollTrigger 기반 강한 전환을 끄고 일반 세로 스크롤 페이지로 동작")를 그대로 반영. 조건부로
`ScrollTrigger` 자체를 생성하지 않으면 리스너/픽셀 계산 오버헤드도 없어 성능에도 유리하다.

**Alternatives considered**: 애니메이션을 만들되 duration만 0으로 줄이는 방식 — 여전히 pin으로
인한 레이아웃 강제 및 스크롤 재계산 비용이 남아 있어 완전한 정적 폴백보다 열등해 기각.

## 5. 리사이즈/로드 후 재계산

**Decision**: 이미지와 웹폰트 로딩이 끝난 뒤(`Promise.all`로 모든 `<img>` `decode()`/`load` 이벤트
+ `document.fonts.ready`) `ScrollTrigger.refresh()`를 1회 호출한다. `window`의 `resize` 이벤트는
디바운스(예: 200ms)해 `ScrollTrigger.refresh()`를 재호출한다. GSAP의 `ScrollTrigger.config`나
`matchMedia()` 헬퍼를 사용해 데스크톱/모바일 브레이크포인트 전환 시 pin 애니메이션 자체를
생성/해제하도록 구성한다.

**Rationale**: 이미지가 늦게 로드되면 실제 문서 높이가 바뀌어 pin 종료 지점(`end`) 계산이
어긋난다. 사용자 지시("이미지와 폰트 로딩이 끝난 뒤 ScrollTrigger.refresh() 호출", "리사이즈 시
timeline과 trigger 위치가 정상적으로 다시 계산")를 그대로 반영.

**Alternatives considered**: `end: 'max'` 같은 고정값 추정 — 이미지 개수/비율이 정해져 있어 근사는
가능하지만 폰트 로딩 지연에 따른 미세한 레이아웃 시프트에 취약해 명시적 refresh를 우선한다.

## 6. GSAP/ScrollTrigger 로드 방식

**Decision**: jsDelivr CDN에서 GSAP 코어와 ScrollTrigger 플러그인을 정확한 버전으로 pin한
`<script>` 태그 두 개를 `</body>` 직전에 순서대로 로드하고, 이어서 `gsap.registerPlugin(ScrollTrigger)`를
포함한 `script.js`를 로드한다. 로컬 vendor 복사본을 두지 않고 CDN 참조를 사용하되, 두 스크립트
모두 `defer` 없이 순서를 보장하는 동기 로드로 배치한다(작은 라이브러리이며 애니메이션 초기화가
페이지 최상단 렌더링을 막지 않도록 body 하단에 배치).

**Rationale**: 빌드 과정 없이 정적 파일만으로 배포한다는 제약(헌법 VIII, 사용자 지시)과 GitHub
Pages에는 npm 설치/번들링 스텝이 없다는 점을 고려하면 CDN `<script>` 태그가 가장 단순하고 검증된
방법이다.

**Alternatives considered**: GSAP를 로컬 `vendor/gsap.min.js`로 다운로드해 저장소에 포함 — 라이선스상
문제는 없으나(GSAP 3 코어는 No-Charge 라이선스) "핵심 파일을 이 수준으로 단순하게 유지"라는
프로젝트 파일 목록에 vendor 디렉터리가 없어 CDN을 기본으로 채택. (참고: 네트워크가 전혀 없는
오프라인 배포가 요구되면 이 결정은 로컬 vendor 방식으로 재검토되어야 한다.)

## 7. 폰트 대체

**Decision**: `DESIGN.md`가 참조하는 GT Walsheim Medium은 상용 유료 폰트이므로 무단 복사하지
않는다. 대신 시스템 sans-serif 스택(`-apple-system, "Segoe UI", "Pretendard Variable", "Noto Sans
KR", sans-serif` 등, 한국어 본문 가독성을 위해 한글 웹폰트 포함)을 기본으로 하고, 필요 시 Google
Fonts처럼 합법적으로 자유 사용 가능한 대체 서체(예: Pretendard — SIL OFL, 또는 Noto Sans KR —
OFL)를 CDN 링크로 로드한다. `DESIGN.md`의 타이포 스케일(자간, 크기, 행간 비율)은 최대한 유지하되
폰트 패밀리명만 대체한다.

**Rationale**: 헌법 II(디자인 기준 준수)와 사용자 지시("커스텀 폰트 파일을 무단으로 복사하지
않는다")를 동시에 만족하려면 시각적 특성(넓은 자간의 큰 디스플레이 타이틀)은 유지하면서 라이선스
문제가 없는 폰트로 치환하는 것이 유일한 방법이다.

**Alternatives considered**: 순수 시스템 폰트만 사용(웹폰트 CDN 없이) — 라이선스 리스크는 0이지만
플랫폼마다 한글 렌더링 품질 편차가 커서, OFL 라이선스 한글 웹폰트(Pretendard/Noto Sans KR) CDN
로드를 함께 허용하는 쪽을 채택.

## 8. 이미지 소싱 워크플로

**Decision**: 구현(`/speckit-implement` 또는 실제 코딩 단계) 초기에 웹 검색/브라우징 도구로
Wikimedia Commons를 1순위로, Unsplash/Pexels를 2순위로 하여 각 장소(설악산/제주/순천만/보성
녹차밭)와 Hero용 한국 자연 사진 후보를 찾는다. 각 후보는 반드시 원본 상세 페이지를 열어
작가/제공기관, 라이선스(CC0, CC BY, Unsplash License, Pexels License 등), 재사용 조건을 확인한
뒤 최종 선택한다. 선택된 이미지만 `assets/images/`에 다운로드하고, 웹 서비스에 적합한 해상도로
리사이즈 후 WebP로 변환(원본 라이선스가 변환을 금지하지 않는 한)한다. 확보에 실패한 장소가 있으면
placeholder를 만들지 않고 그 사실을 명시적으로 보고한다.

**Rationale**: 헌법 VI, 스펙 FR-015/FR-016/FR-018, 사용자가 제공한 상세 소싱 원칙을 그대로
반영한 필수 워크플로다. 이 리서치 문서는 "어떤 이미지를 쓸지"를 미리 정하지 않는다 — 실제 검색은
네트워크 접근이 가능한 구현 단계에서 수행되어야 하며, 계획 단계에서 이미지 URL을 추정하거나
가정하지 않는다.

**Alternatives considered**: 계획 단계에서 특정 이미지 URL을 미리 지정 — 링크 부패/라이선스 변경
가능성이 있고, "검색 결과 화면에서 보이는 사진을 그대로 복사하지 말고 반드시 원본 상세 페이지를
열어 확인"하라는 지시에 따라 구현 시점의 실제 확인을 필수로 남겨둔다.
