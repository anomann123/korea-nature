<!--
Sync Impact Report
- Version change: (unset/template) → 1.0.0
- Modified principles: n/a (initial ratification; template placeholders replaced)
- Added sections:
  - I. Single-Page Static Scope
  - II. DESIGN.md as Visual Source of Truth
  - III. Portable Relative Paths
  - IV. Semantic HTML & Accessibility
  - V. Real Content Over Decoration
  - VI. Authentic, Licensed Imagery
  - VII. Continuous Desktop Scroll, Simple Mobile Fallback
  - VIII. No Unnecessary Dependencies
  - Governance
- Removed sections: none (all template placeholders resolved)
- Follow-up TODOs: none
-->

# Korea Nature Constitution

## Core Principles

### I. Single-Page Static Scope
The project is a single-page static website introducing the beauty of Korea's nature.
No login, server, database, or API backend MAY be built or introduced. Any feature that
would require server-side state or authentication is out of scope and MUST be rejected
or redesigned as a static, client-only alternative.

**Rationale**: Keeping the project static and serverless guarantees it can be hosted
entirely on GitHub Pages with no infrastructure, no secrets, and no ongoing operational
burden.

### II. DESIGN.md as Visual Source of Truth
`DESIGN.md` at the project root is the highest-priority visual reference for all UI
decisions. All layout, color, typography, and interaction choices MUST be validated
against it. The original `DESIGN.md` file MUST NOT be modified — it is a fixed
reference, not a living document.

**Rationale**: A single, unmodified design reference prevents visual drift across
implementation sessions and keeps design intent unambiguous.

### III. Portable Relative Paths
Every page route and image path MUST use relative paths so the site works correctly
when served from a GitHub Project Pages subpath (e.g. `username.github.io/repo/`).
Absolute root-relative paths (`/img/...`) or environment-specific base URLs MUST NOT be
used.

**Rationale**: GitHub Project Pages serves sites from a subdirectory; absolute paths
silently break navigation and assets in that context.

### IV. Semantic HTML & Accessibility
Markup MUST use semantic HTML elements appropriate to their content (headings, `nav`,
`main`, `section`, `figure`/`figcaption`, etc.) and MUST support keyboard navigation for
all interactive elements. Users with `prefers-reduced-motion` enabled MUST be able to
read and navigate all content without relying on animation, and MUST NOT be shown
excessive or jarring motion.

**Rationale**: Accessibility is a baseline requirement, not an enhancement, for a public
content site.

### V. Real Content Over Decoration
The site MUST NOT be a mere list of photographs. It MUST include a hero lead paragraph
and, for each featured place, two substantive body paragraphs of real written content.
Body text MUST be treated as an independent design element with readable size and line
height — not shrunk into a small caption layered over a photo.

**Rationale**: The site's purpose is to introduce Korea's nature meaningfully, not to
serve as an image gallery; content must be legible and given real editorial weight.

### VI. Authentic, Licensed Imagery
During implementation, real photographs of Seoraksan, Jeju, Suncheon Bay, and the
Boseong green tea fields MUST be sourced and downloaded directly rather than invented.
Only images whose reuse terms can be verified MAY be used. Placeholder images, solid-
color filler boxes, and hotlinked external images MUST NOT remain in the final result.
For every image file used, its source, photographer/author, original URL, and license
MUST be recorded in `CREDITS.md`.

**Rationale**: Real, properly licensed imagery is both a legal requirement and core to
the site's credibility; `CREDITS.md` gives a verifiable audit trail per file.

### VII. Continuous Desktop Scroll, Simple Mobile Fallback
On desktop, the site MUST provide strong scroll-driven interaction, and transitions
between scenes MUST feel continuous — no jarring cuts or forced jumps between sections.
On mobile, the site MAY fall back to an ordinary, easy-to-read vertical flow with
simple transitions instead of the full desktop scroll interaction.

**Rationale**: Desktop affords room for an immersive scroll narrative, while mobile
prioritizes readability and simplicity over complex interaction.

### VIII. No Unnecessary Dependencies
Unnecessary frameworks and server-side dependencies MUST NOT be added. The final
result MUST be structured for direct deployment on GitHub Pages with no build
infrastructure required beyond what GitHub Pages natively supports.

**Rationale**: Minimal dependencies keep the site simple to maintain, fast to load, and
trivially deployable as static files.

## Governance

This constitution supersedes ad hoc practices for this project. Any change to project
structure, content approach, or tooling MUST be checked against these principles before
being adopted.

Amendments to this constitution require: (1) an explicit written proposal describing the
change and rationale, (2) a version bump following semantic versioning (MAJOR for
backward-incompatible principle removals/redefinitions, MINOR for new or materially
expanded principles/sections, PATCH for clarifications and wording fixes), and (3)
updating the Sync Impact Report at the top of this file.

All work on this project MUST be reviewed for compliance with these principles,
including the presence of `CREDITS.md` entries for every used image and the absence of
placeholder or hotlinked assets, before being considered complete.

**Version**: 1.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-12
