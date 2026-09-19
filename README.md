# ChromaLab — Accessible Color System Studio

[![Quality](https://github.com/MykolaDotsenko/Color-Picker-react-training-app/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Color-Picker-react-training-app/actions/workflows/quality.yml)

A focused React color-engineering case study that turns one seed color into an inspectable **50–950 token scale**, calculates **WCAG contrast**, recommends a high-contrast foreground, and exports CSS variables.

**GitHub Pages target:** https://mykoladotsenko.github.io/Color-Picker-react-training-app/

The project began as an eight-button color-picker exercise. The current implementation keeps the interaction small while moving the interesting work into a browser-independent domain module that can be verified without React.

## Product capabilities

- native visual color picker plus editable 3/6-digit HEX input
- validation that preserves the last valid canonical color
- six high-signal preset seeds
- HEX, RGB, and HSL inspection
- deterministic 50–950 tint/shade generation
- WCAG 2 relative-luminance and contrast-ratio calculations
- AA / AAA / large-text contrast labels
- automatic black-or-white foreground recommendation
- real UI preview using the calculated foreground
- click-to-copy palette swatches
- CSS custom-property export
- versioned local persistence with corruption-safe fallback
- responsive, keyboard-accessible interface
- reduced-motion and forced-colors support

## Stack

- React 18
- Vite 5
- modern CSS
- Web Storage API
- Clipboard API
- Node.js built-in test runner
- ESLint
- GitHub Actions
- GitHub Pages deployment workflow

There is intentionally **no color library, component framework, state library, router, or runtime animation package**.

## Architecture

~~~text
React studio
  ├─> pure color domain
  └─> persistence adapter

seed color
   ↓
normalize
   ↓
palette + metadata + contrast + CSS tokens
   ↓
accessible UI
~~~

The domain module owns the mathematics and serialization. It has no React, DOM, storage, or clipboard dependency.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the boundary and trade-offs.

## Color math

ChromaLab implements the WCAG relative-luminance calculation for sRGB colors and derives contrast as:

~~~text
(Llighter + 0.05) / (Ldarker + 0.05)
~~~

The domain tests include the canonical black-versus-white 21:1 reference case.

The generated palette deliberately uses deterministic sRGB mixing. That makes the algorithm small and inspectable. It does **not** claim perceptual uniformity; an OKLCH-based scale would be the next step for a production brand system where equal perceived lightness steps are a hard requirement.

## Quality strategy

Run the same gate used in CI:

~~~bash
npm ci
npm run check
~~~

The gate runs:

1. ESLint with zero warnings
2. Node unit tests for color-domain rules and persistence parsing
3. a production Vite build

Tests cover:

- shorthand and canonical HEX normalization
- invalid input rejection
- RGB round trips
- deterministic color mixing
- seed preservation at token 500
- WCAG contrast reference math
- contrast-grade boundaries
- foreground recommendation
- HSL presentation
- CSS token serialization
- corrupted local-state fallback

## Accessibility

The product includes:

- skip navigation
- explicit labels for visual and text color inputs
- validation state via aria-invalid and an alert message
- native controls instead of custom picker semantics
- pressed state for preset seeds
- descriptive copy actions for every palette token
- live clipboard status
- high-contrast focus treatment
- reduced-motion handling
- forced-colors fallbacks

Color accessibility is treated as domain behavior, not as a visual afterthought.

## Persistence model

Only the canonical six-digit seed color is persisted.

Transient state such as validation text and clipboard confirmation is intentionally not stored. Saved state is parsed defensively and an invalid payload falls back to the default seed rather than breaking the application.

## Deployment

The repository includes a GitHub Pages workflow. On pushes to main it:

1. installs the locked dependency graph
2. runs the complete quality gate
3. uploads the Vite dist artifact
4. deploys with the official GitHub Pages actions

The Vite base path is scoped to this repository so static assets resolve correctly on project Pages.

## Recruiter walkthrough

For a fast technical review:

1. [src/domain/color.js](./src/domain/color.js) — color math and token generation
2. [src/components/ColorPickerApp.jsx](./src/components/ColorPickerApp.jsx) — product composition
3. [src/storage/colorStorage.js](./src/storage/colorStorage.js) — resilient persistence
4. [tests/color.test.js](./tests/color.test.js) — domain regression suite
5. [.github/workflows/quality.yml](./.github/workflows/quality.yml) — automated verification
6. [.github/workflows/pages.yml](./.github/workflows/pages.yml) — deployment path

## Scope discipline

This is not trying to be Figma, a complete design-token platform, or a color-science library.

Its value is the opposite: one small product with a clear domain boundary, correct contrast math, useful handoff output, accessible interaction, and minimal runtime complexity.
