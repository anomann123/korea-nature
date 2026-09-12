(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 768; // styles.css --mobile-breakpoint 와 동일한 값을 유지한다

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isMobileViewport = window.matchMedia("(max-width: " + MOBILE_BREAKPOINT + "px)");

  function computeMotionMode() {
    return prefersReducedMotion.matches || isMobileViewport.matches ? "reduced" : "auto";
  }

  function applyMotionMode() {
    document.body.setAttribute("data-motion", computeMotionMode());
  }

  applyMotionMode();

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", applyMotionMode);
    isMobileViewport.addEventListener("change", applyMotionMode);
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------------------------------------------------------------------
  // CTA: 처음 풍경부터 다시 보기 (data-motion 여부와 무관하게 항상 동작)
  // ---------------------------------------------------------------------
  var scrollToHeroButton = document.querySelector('[data-action="scroll-to-hero"]');
  if (scrollToHeroButton) {
    scrollToHeroButton.addEventListener("click", function () {
      var hero = document.getElementById("hero");
      if (hero) {
        hero.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ---------------------------------------------------------------------
  // Scroll journey: 단일 pin + 단일 master timeline (US1)
  // data-motion === "auto"일 때만 생성한다. reduced/모바일에서는 이 블록 전체를
  // 건너뛰어 #journey가 T009의 정상 세로 흐름으로 남는다 (FR-012, 헌법 IV/VII).
  // ---------------------------------------------------------------------
  if (document.body.getAttribute("data-motion") === "auto" && window.gsap && window.ScrollTrigger) {
    initScrollJourney();
  }

  function initScrollJourney() {
    var journey = document.getElementById("journey");
    var scenes = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
    if (!journey || scenes.length === 0) return;

    var HOLD = 4; // 한 장소가 정지된 채 유지되는 상대 시간 단위 (본문 두 문단을 여유 있게 읽는 구간, FR-010/US2)
    var ENTER = 1; // 이전/다음 장면이 겹쳐 교차되는 상대 시간 단위 (전체 구간(HOLD+ENTER)의 20% ≈ 20~30%, FR-008)

    var sceneRefs = scenes.map(function (scene) {
      var bg = scene.querySelector('[data-parallax="background"]');
      var fg = scene.querySelector('[data-parallax="foreground"]');
      var text = fg
        ? fg.querySelectorAll(".scene__eyebrow, .scene__tagline, .scene__paragraph, .scene__keywords")
        : [];
      return { scene: scene, bg: bg, fg: fg, text: text };
    });

    // 초기 상태: 첫 장소만 보이고 나머지는 숨김 (스크럽 타임라인 밖에서 즉시 적용)
    sceneRefs.forEach(function (ref, i) {
      if (i === 0) {
        gsap.set(ref.bg, { scale: 1, opacity: 1 });
        gsap.set(ref.fg, { y: 0 });
        gsap.set(ref.text, { opacity: 1, y: 0 });
      } else {
        gsap.set(ref.bg, { scale: 1.05, opacity: 0 });
        gsap.set(ref.fg, { y: 40 });
        gsap.set(ref.text, { opacity: 0, y: 24 });
      }
    });

    // 전체 상대 시간 단위 = 첫 장소 HOLD + (전환마다 ENTER+HOLD) * (장소 수 - 1)
    var TOTAL_UNITS = HOLD + (ENTER + HOLD) * (sceneRefs.length - 1);
    // 장소 하나당 대략 2.2 * 뷰포트 높이 정도의 스크롤 거리를 배정한다 (본문을 읽을 시간 확보).
    // 트리거(#journey) 자신의 CSS 높이를 스크롤 거리로 겸용하지 않고 end를 직접 계산해서 넘긴다 —
    // #journey는 100vh로 고정해 두어야 pin-spacer 계산이 항상 예측 가능하다.
    var SCROLL_PX_PER_SCENE = function () {
      return window.innerHeight * 2.2;
    };

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: journey,
        start: "top top",
        end: function () {
          return "+=" + sceneRefs.length * SCROLL_PX_PER_SCENE();
        },
        scrub: 1.2, // 숫자 scrub — 스크롤 입력에 부드럽게 지연 보간되어 따라오게 함 (true 대신 사용)
        pin: true, // 이 프로젝트 전체에서 유일한 pin (FR-009)
        invalidateOnRefresh: true // resize 시 end를 다시 계산하도록 함
      },
      defaults: { ease: "none" } // scrub 구간은 스크롤 위치의 함수이므로 추가 가속/감속을 넣지 않는다
    });

    var cursor = HOLD; // 첫 장소는 진입 없이 바로 HOLD만큼 체류

    for (var i = 1; i < sceneRefs.length; i++) {
      var prev = sceneRefs[i - 1];
      var curr = sceneRefs[i];

      // Cross-fade + scale: 이전 이미지가 확대되며 흐려지고, 다음 이미지가 축소되며 선명해진다 (20~30% 겹침)
      tl.to(prev.bg, { scale: 1.1, opacity: 0, duration: ENTER }, cursor);
      tl.to(curr.bg, { scale: 1, opacity: 1, duration: ENTER }, cursor);

      // 이전 텍스트는 살짝 위로 사라지고, 새 장면의 텍스트는 시차를 두고 등장한다
      tl.to(prev.text, { opacity: 0, y: -16, duration: ENTER }, cursor);
      tl.to(curr.fg, { y: 0, duration: ENTER }, cursor);
      tl.to(curr.text, { opacity: 1, y: 0, duration: ENTER * 0.6, stagger: 0.08 }, cursor + ENTER * 0.35);

      cursor += ENTER;

      // Hold 구간: 배경은 아주 느리게 계속 확대되고(깊이감), 전경 패널은 반대 방향으로 살짝 떠올라
      // 배경/전경 사이의 parallax를 만든다. 본문을 읽는 동안 장면은 바뀌지 않는다.
      tl.to(curr.bg, { scale: 1.04, duration: HOLD }, cursor);
      tl.fromTo(curr.fg, { y: 0 }, { y: -10, duration: HOLD }, cursor);

      cursor += HOLD;
    }

    // 첫 장소에도 동일한 hold 중 배경 미세 확대를 적용 (일관된 parallax 리듬)
    tl.to(sceneRefs[0].bg, { scale: 1.04, duration: HOLD }, 0);
    tl.fromTo(sceneRefs[0].fg, { y: 0 }, { y: -10, duration: HOLD }, 0);

    // 마지막 장소가 pin이 풀리는 순간까지 완전히 보인 상태로 유지되도록,
    // 타임라인 전체 길이를 TOTAL_UNITS에 맞춰 명시적으로 고정한다.
    tl.duration(TOTAL_UNITS);

    // ---------------------------------------------------------------------
    // 이미지/폰트 로딩 완료 후 refresh, 그리고 리사이즈 시 재계산 (T017)
    // ---------------------------------------------------------------------
    var images = Array.prototype.slice.call(document.images);
    var imagesReady = Promise.all(
      images.map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

    Promise.all([imagesReady, fontsReady]).then(function () {
      ScrollTrigger.refresh();
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    });
  }
})();
