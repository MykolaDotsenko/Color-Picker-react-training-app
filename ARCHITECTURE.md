# Architecture

ChromaLab keeps color mathematics independent from React and browser APIs.

## Dependency direction

~~~text
React studio
  ├─> pure color domain
  └─> persistence adapter

seed color -> domain transformations -> palette / contrast / tokens -> UI
~~~

## Domain boundary

The color module owns:

- hexadecimal normalization
- HEX/RGB/HSL conversion
- deterministic tint and shade generation
- WCAG 2 relative luminance
- contrast ratios and labels
- foreground recommendation
- CSS token serialization

It has no React, DOM, local-storage, or clipboard dependency.

## Persistence

Only the canonical six-digit seed color is persisted. The adapter validates saved state before returning it and falls back safely when browser storage is unavailable or corrupted.

## UI state

The React layer owns only transient interaction concerns:

- editable text draft
- validation message
- copy confirmation

The generated scale, color metadata, and contrast values are derived from the canonical seed.

## Scope

The palette algorithm intentionally uses deterministic sRGB mixing rather than pretending to be a full perceptual color engine. For production brand systems that require perceptual uniformity, an OKLCH-based pipeline would be the next deliberate step.
