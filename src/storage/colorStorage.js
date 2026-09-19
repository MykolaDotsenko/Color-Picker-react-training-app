import { normalizeHex } from "../domain/color.js";

const STORAGE_KEY = "chromalab:state:v1";

export function parseStoredColor(raw, fallback) {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeHex(parsed?.baseColor) ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadColor(fallback = "#6366F1") {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return parseStoredColor(window.localStorage.getItem(STORAGE_KEY), fallback);
  } catch {
    return fallback;
  }
}

export function saveColor(baseColor) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, baseColor }),
    );
  } catch {
    // Storage is an enhancement. Color editing remains functional without it.
  }
}
