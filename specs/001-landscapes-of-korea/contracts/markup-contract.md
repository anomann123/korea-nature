# Markup Contract: index.html ↔ styles.css / script.js

이 프로젝트에는 네트워크 API가 없다. 대신 `script.js`(GSAP timeline)와 `styles.css`(레이아웃/
reduced-motion 규칙)가 `index.html`의 특정 id/data-attribute/구조에 의존한다. 이 문서는 그
"내부 인터페이스" 계약을 고정해, 마크업이 바뀌어도 스크립트가 조용히 깨지지 않도록 한다.

## 1. 최상위 구조 (고정)

```html
<body data-motion="auto">
  <header class="hero" id="hero"> ... </header>

  <main id="journey" data-pin-root>
    <section class="scene" id="scene-seoraksan" data-scene data-layout="text-right"> ... </section>
    <section class="scene" id="scene-jeju" data-scene data-layout="text-left"> ... </section>
    <section class="scene" id="scene-suncheon-bay" data-scene data-layout="text-overlay-panel"> ... </section>
    <section class="scene" id="scene-boseong-tea-fields" data-scene data-layout="text-lower-band"> ... </section>
  </main>

  <section class="cta" id="cta"> ... </section>
  <footer id="site-footer"> ... </footer>
</body>
```

- `#journey`는 `data-pin-root` 속성을 가진 **유일한** pin 대상이다. `script.js`는 이 selector
  하나에만 `ScrollTrigger.create({ pin: true, ... })`를 건다. 다른 요소에 `pin: true`를 추가로
  거는 것은 이 계약 위반이다(FR-009).
- `[data-scene]`을 가진 `<section>`은 정확히 4개여야 하며 순서(설악산 → 제주 → 순천만 → 보성
  녹차밭)가 문서 순서와 일치해야 한다. `script.js`는 `document.querySelectorAll('[data-scene]')`
  의 배열 인덱스를 timeline label 순서로 그대로 사용한다.
- `data-layout` 값은 `styles.css`의 레이아웃 변형 클래스/속성 선택자와 1:1 대응해야 한다
  (`text-right`, `text-left`, `text-overlay-panel`, `text-lower-band` 중 하나). 최소 2종 이상
  실제로 사용되어야 한다(data-model.md 검증 규칙).

## 2. 장소 구획(scene) 내부 구조

```html
<section class="scene" id="scene-seoraksan" data-scene data-layout="text-right">
  <figure class="scene__media">
    <img class="scene__image" src="./assets/images/seoraksan.webp"
         width="1600" height="2000"
         alt="가을 단풍이 든 설악산의 회색 암봉과 깊은 계곡"
         data-parallax="background">
  </figure>
  <div class="scene__panel" data-parallax="foreground">
    <p class="scene__eyebrow">설악산 <span lang="en">SEORAKSAN</span></p>
    <h2 class="scene__tagline">바위 능선 사이로 계절이 지나가는 산</h2>
    <p class="scene__paragraph">…본문 1…</p>
    <p class="scene__paragraph">…본문 2…</p>
    <ul class="scene__keywords">
      <li>암봉과 계곡</li>
      <li>사계절</li>
      <li>깊은 숲</li>
    </ul>
  </div>
</section>
```

- `[data-parallax="background"]`와 `[data-parallax="foreground"]`는 `script.js`가 서로 다른
  스크롤 배율의 transform tween을 붙이는 훅이다. 이 두 값은 한 scene 안에 정확히 하나씩만
  존재해야 한다.
- `img`는 반드시 `width`/`height`(또는 CSS `aspect-ratio`와 병행)를 가져 레이아웃 시프트를
  방지한다.
- `alt`는 매번 실제 사진 내용을 구체적으로 설명하는 한국어 문장이어야 한다(빈 alt·파일명 alt
  금지, FR-017).
- 본문 문단(`.scene__paragraph`)은 정확히 2개, 키워드(`.scene__keywords > li`)는 2~3개여야
  한다(FR-003).

## 3. reduced-motion / 모바일 폴백 계약

- `script.js`는 페이지 로드 시 다음 중 하나라도 참이면 `#journey`에 대한 `ScrollTrigger.create`
  자체를 호출하지 않는다:
  1. `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true`
  2. 뷰포트 폭이 모바일 브레이크포인트 이하 (`styles.css`의 `--mobile-breakpoint`와 동일한 값을
     JS에서도 `matchMedia('(max-width: …px)')`로 참조 — 값은 한 곳에서만 정의)
- 위 조건이 참일 때 `body`의 `data-motion` 속성을 `"auto"`에서 `"reduced"`로 변경한다.
  `styles.css`는 `body[data-motion="reduced"] #journey`에 대해 `position: static`, 각 scene을
  `opacity: 1; transform: none`인 일반 세로 흐름으로 강제 오버라이드하는 규칙을 가진다.
- 이 속성 하나(`data-motion`)가 "강한 전환 켜짐/꺼짐"을 나타내는 유일한 신호이며, JS와 CSS는
  이 값을 통해서만 상태를 공유한다.

## 4. CTA 버튼 계약

```html
<button type="button" class="cta__button" data-action="scroll-to-hero">
  처음 풍경부터 다시 보기
</button>
```

- `[data-action="scroll-to-hero"]`는 `script.js`가 클릭 리스너를 등록하는 유일한 훅이다. 클릭 시
  `#hero`로 스크롤 이동(reduced-motion 여부와 무관하게 항상 동작)한다.
- 네이티브 `<button>` 요소를 사용해 키보드 포커스·Enter/Space 실행이 브라우저 기본 동작으로
  보장되어야 한다(커스텀 `<div onclick>` 금지, 헌법 IV).

## 5. 상대 경로 계약

- `index.html`, `styles.css`, `script.js` 안의 모든 자산 참조(`src`, `href`, CSS `url()`)는
  `./`로 시작하는 상대 경로만 사용한다. 절대 루트 경로(`/assets/...`)나 파일 시스템 절대 경로는
  금지된다(헌법 III, FR-019).
