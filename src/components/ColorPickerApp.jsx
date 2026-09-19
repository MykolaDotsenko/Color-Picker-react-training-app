import { useEffect, useMemo, useState } from "react";

import {
  bestTextColor,
  buildScale,
  contrastGrade,
  contrastRatio,
  describeColor,
  normalizeHex,
  toCssTokens,
} from "../domain/color.js";
import { loadColor, saveColor } from "../storage/colorStorage.js";
import "./ColorPickerApp.css";

const PRESETS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#A855F7"];

function formatRatio(value) {
  return value.toFixed(2) + ":1";
}

export default function ColorPickerApp() {
  const [baseColor, setBaseColor] = useState(() => loadColor());
  const [draft, setDraft] = useState(() => loadColor());
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const palette = useMemo(() => buildScale(baseColor), [baseColor]);
  const description = useMemo(() => describeColor(baseColor), [baseColor]);
  const cssTokens = useMemo(() => toCssTokens(palette), [palette]);
  const whiteContrast = useMemo(
    () => contrastRatio(baseColor, "#FFFFFF"),
    [baseColor],
  );
  const blackContrast = useMemo(
    () => contrastRatio(baseColor, "#000000"),
    [baseColor],
  );
  const recommendedText = useMemo(() => bestTextColor(baseColor), [baseColor]);

  useEffect(() => {
    saveColor(baseColor);
  }, [baseColor]);

  function commitColor(value) {
    const normalized = normalizeHex(value);

    if (!normalized) {
      setError("Use a valid 3 or 6 digit HEX value, for example #6366F1.");
      return;
    }

    setBaseColor(normalized);
    setDraft(normalized);
    setError("");
  }

  function handleTextChange(event) {
    const value = event.target.value;
    setDraft(value);

    const normalized = normalizeHex(value);
    if (normalized) {
      setBaseColor(normalized);
      setError("");
    } else {
      setError("Use a valid 3 or 6 digit HEX value, for example #6366F1.");
    }
  }

  async function copy(value, label) {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(value);
      setCopyStatus(label + " copied");
    } catch {
      setCopyStatus("Clipboard permission unavailable");
    }
  }

  return (
    <>
      <a className="skip-link" href="#studio">
        Skip to color studio
      </a>

      <header className="topbar">
        <a className="brand" href="#studio" aria-label="ChromaLab home">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            <strong>ChromaLab</strong>
            <small>Accessible color systems</small>
          </span>
        </a>

        <a
          className="repo-link"
          href="https://github.com/MykolaDotsenko/Color-Picker-react-training-app"
          target="_blank"
          rel="noreferrer"
        >
          View source
        </a>
      </header>

      <main id="studio">
        <section className="hero">
          <p className="eyebrow">Color system studio</p>
          <h1>Turn one seed color into a usable, accessible design system.</h1>
          <p>
            Generate a deterministic 50–950 scale, inspect color models, verify
            WCAG contrast, preview UI, and export CSS variables without a color
            library or runtime design-system dependency.
          </p>
        </section>

        <div className="studio-grid">
          <section className="panel controls-panel" aria-labelledby="seed-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Input</p>
                <h2 id="seed-title">Seed color</h2>
              </div>
              <span className="color-chip">{baseColor}</span>
            </div>

            <div className="color-input-row">
              <label className="native-picker">
                <span>Visual picker</span>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(event) => commitColor(event.target.value)}
                />
              </label>

              <label className="hex-field">
                <span>HEX</span>
                <input
                  type="text"
                  value={draft}
                  onChange={handleTextChange}
                  onBlur={() => {
                    if (!error) setDraft(baseColor);
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby="hex-help"
                  spellCheck="false"
                  inputMode="text"
                />
              </label>
            </div>

            <p
              id="hex-help"
              className={error ? "field-message error-message" : "field-message"}
              role={error ? "alert" : undefined}
            >
              {error || "Three- and six-digit HEX values are accepted."}
            </p>

            <div className="preset-group" aria-labelledby="preset-label">
              <span id="preset-label">Quick seeds</span>
              <div className="preset-list">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="preset"
                    style={{ "--preset": preset }}
                    aria-label={"Use " + preset}
                    aria-pressed={preset === baseColor}
                    onClick={() => commitColor(preset)}
                  />
                ))}
              </div>
            </div>

            <dl className="color-values">
              <div>
                <dt>HEX</dt>
                <dd>{description.hex}</dd>
              </div>
              <div>
                <dt>RGB</dt>
                <dd>{description.rgb}</dd>
              </div>
              <div>
                <dt>HSL</dt>
                <dd>{description.hsl}</dd>
              </div>
            </dl>
          </section>

          <section className="panel preview-panel" aria-labelledby="preview-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Preview</p>
                <h2 id="preview-title">Adaptive surface</h2>
              </div>
              <span className="recommendation">
                Auto text · {recommendedText === "#000000" ? "dark" : "light"}
              </span>
            </div>

            <div
              className="product-preview"
              style={{ backgroundColor: baseColor, color: recommendedText }}
            >
              <span className="preview-kicker">Design token preview</span>
              <h3>Accessible by calculation, not guesswork.</h3>
              <p>
                ChromaLab selects the higher-contrast black or white foreground
                for this surface.
              </p>
              <button
                type="button"
                style={{ color: baseColor, backgroundColor: recommendedText }}
              >
                Primary action
              </button>
            </div>

            <div className="contrast-grid">
              <article>
                <span>On white</span>
                <strong>{formatRatio(whiteContrast)}</strong>
                <small>{contrastGrade(whiteContrast)}</small>
              </article>
              <article>
                <span>On black</span>
                <strong>{formatRatio(blackContrast)}</strong>
                <small>{contrastGrade(blackContrast)}</small>
              </article>
            </div>
          </section>
        </div>

        <section className="palette-section" aria-labelledby="palette-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Scale</p>
              <h2 id="palette-title">Brand tokens 50–950</h2>
            </div>
            <p>Click a swatch to copy its HEX value.</p>
          </div>

          <div className="palette-grid">
            {palette.map((swatch) => (
              <button
                key={swatch.step}
                type="button"
                className="swatch"
                style={{
                  "--swatch": swatch.hex,
                  "--swatch-text": bestTextColor(swatch.hex),
                }}
                onClick={() => copy(swatch.hex, "Brand " + swatch.step)}
                aria-label={"Copy brand " + swatch.step + " color " + swatch.hex}
              >
                <span>{swatch.step}</span>
                <strong>{swatch.hex}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="export-grid">
          <div>
            <p className="eyebrow">Handoff</p>
            <h2>Production-ready CSS variables</h2>
            <p>
              The export is derived from the same canonical scale rendered above,
              so design inspection and implementation stay in sync.
            </p>
            <button
              className="copy-button"
              type="button"
              onClick={() => copy(cssTokens, "CSS tokens")}
            >
              Copy CSS tokens
            </button>
            <p className="copy-status" role="status" aria-live="polite">
              {copyStatus}
            </p>
          </div>

          <pre className="code-panel" tabIndex="0">
            <code>{cssTokens}</code>
          </pre>
        </section>

        <footer>
          <span>ChromaLab · React color engineering case study</span>
          <span>WCAG contrast math · local-first · zero runtime color libraries</span>
        </footer>
      </main>
    </>
  );
}
