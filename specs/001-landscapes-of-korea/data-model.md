# Data Model: 한국의 결 (Landscapes of Korea)

정적 사이트이므로 영속 데이터베이스는 없다. 아래 엔티티는 `index.html`의 마크업 구조와
`script.js`가 참조하는 in-memory 구조, 그리고 `CREDITS.md`의 기록 형식을 정의한다.

## 1. Place Section (장소 구획)

콘텐츠 소스는 스펙(`spec.md`)의 지정 문구이며, 값은 고정되어 있고 사용자 입력으로 변경되지
않는다(콘텐츠 관리 UI 없음). 구조는 HTML 마크업 순서와 `script.js`가 timeline label로 참조하는
DOM id를 통해 표현된다.

| 필드 | 타입 | 설명 | 예시 값 |
|---|---|---|---|
| `id` | string (slug) | 장소 구획의 DOM id / timeline label | `seoraksan` |
| `nameKo` | string | 한국어 장소명 | "설악산" |
| `nameEn` | string | 영문 표기 | "SEORAKSAN" |
| `tagline` | string | 풍경의 성격을 짚는 한 줄 제목 | "바위 능선 사이로 계절이 지나가는 산" |
| `paragraph1` | string | 본문 문단 1 (spec.md 원문 그대로) | (spec.md 참조) |
| `paragraph2` | string | 본문 문단 2 (spec.md 원문 그대로, paragraph1과 길이가 다름) | (spec.md 참조) |
| `keywords` | string[2..3] | 짧은 풍경 키워드/장소 정보 | ["암봉과 계곡", "사계절", "깊은 숲"] |
| `imagePath` | string (relative path) | 대표 사진의 상대 경로 | `./assets/images/seoraksan.webp` |
| `imageAlt` | string | 풍경을 구체적으로 설명하는 한국어 alt 텍스트 | (구현 시 실제 사진에 맞춰 작성) |
| `layoutVariant` | enum | 이미지-본문 좌우 배치 변형 (FR-007: 장소마다 달라야 함) | `text-right` \| `text-left` \| `text-overlay-panel` \| `text-lower-band` |

**검증 규칙**:
- `paragraph1.length !== paragraph2.length` (문자 수 기준, "서로 다른 길이" 요구를 근사 검증)
- `keywords.length`는 2 또는 3
- 4개 Place Section의 `layoutVariant` 값 중 최소 2종류 이상이 사용되어야 함 (FR-007)
- `imagePath`는 반드시 `./assets/images/`로 시작 (헌법 III, FR-019)

**순서(고정)**: 설악산 → 제주 → 순천만 → 보성 녹차밭 (spec.md User Story 1과 동일)

## 2. Hero Block

| 필드 | 타입 | 설명 |
|---|---|---|
| `titleKo` | string | "한국의 결" |
| `titleEn` | string | "LANDSCAPES OF KOREA" |
| `lead` | string | 페이지 관점을 설명하는 리드문 전문 (spec.md 원문) |
| `imagePath` | string | `./assets/images/hero-korea.webp` |
| `imageAlt` | string | Hero 사진의 한국어 alt 텍스트 |

## 3. Closing CTA Block

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | string | "오래 보고 싶은 풍경은 천천히 남습니다" |
| `body` | string | "네 개의 장면을 지나며 마음에 남은 빛과 색을 다시 떠올려 보세요. 한국의 자연은 다음 계절에 또 다른 얼굴로 기다리고 있습니다." |
| `buttonLabel` | string | "처음 풍경부터 다시 보기" |
| `buttonAction` | behavior | 클릭 시 Hero(`#hero` 또는 페이지 최상단)로 스크롤 이동 |

## 4. Image Asset (이미지 자산)

`assets/images/` 아래 실제로 저장되는 파일과, 그 파일이 어떤 콘텐츠 블록에 연결되는지를 나타낸다.
구현 단계에서 실제 검색/다운로드 후 채워진다 — 계획 단계에서는 파일명 규칙만 고정한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `filePath` | string | 프로젝트 내 상대 경로, 예: `assets/images/jeju.webp` |
| `linkedBlock` | reference | Hero 또는 4개 Place Section 중 하나 |
| `altTextKo` | string | 한국어 alt 텍스트 |
| `width` / `height` (or `aspectRatio`) | number | 레이아웃 시프트 방지를 위한 고정 치수 |
| `format` | enum | `webp` (기본), 라이선스가 변환을 제한하면 원본 포맷 유지 |

**검증 규칙**:
- 5개 필수 파일명: `hero-korea`, `seoraksan`, `jeju`, `suncheon-bay`, `boseong-tea-fields` (확장자는 최적화 결과에 따름, 기본 `.webp`)
- 모든 `filePath`는 외부 URL이 아닌 로컬 상대 경로여야 함 (hotlink 금지, 헌법 VI)
- 이미지마다 `CREDITS.md`에 대응하는 Credit Entry가 정확히 1개 존재해야 함

## 5. Credit Entry (`CREDITS.md` 레코드)

| 필드 | 타입 | 설명 |
|---|---|---|
| `filePath` | string | Image Asset과 동일한 프로젝트 내 경로 |
| `author` | string | 촬영자 또는 제공 기관명 |
| `sourceUrl` | string | 원본 사진 상세 페이지 URL (검색 결과 썸네일 URL 아님) |
| `license` | string | 라이선스/사용 조건 (예: "CC BY-SA 4.0", "Unsplash License") |
| `verifiedDate` | date (YYYY-MM-DD) | 출처·라이선스를 확인한 날짜 |

**관계**: Image Asset 1개 ↔ Credit Entry 1개 (1:1). `filePath`로 조인된다.

## 6. Scene Transition State (런타임 개념 모델, `script.js` 내부)

DOM/데이터로 저장되지 않는 순수 런타임 개념이며, 하나의 master `gsap.timeline()`이 아래 상태
전이를 스크롤 진행률(0~1)에 따라 구동한다.

```
Hero (visible)
  → Hero exit / Seoraksan enter (20~30% overlap, cross-fade + scale)
    → Seoraksan hold (본문 읽기 유지 구간)
      → Seoraksan exit / Jeju enter (20~30% overlap)
        → Jeju hold
          → Jeju exit / Suncheon Bay enter (20~30% overlap)
            → Suncheon Bay hold
              → Suncheon Bay exit / Boseong Tea Fields enter (20~30% overlap)
                → Boseong Tea Fields hold
                  → CTA / footer (일반 문서 흐름, pin 종료)
```

각 "enter"와 "hold" 구간은 timeline label + duration 비율로 정의되며, `prefers-reduced-motion`
또는 모바일 브레이크포인트에서는 이 상태 기계 전체가 생성되지 않고 모든 구획이 정적 세로 문서로
렌더링된다.
