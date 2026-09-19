const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(value) {
  const candidate = String(value ?? "").trim();

  if (!HEX_PATTERN.test(candidate)) {
    return null;
  }

  const raw = candidate.replace("#", "");
  const expanded =
    raw.length === 3
      ? raw
          .split("")
          .map((character) => character + character)
          .join("")
      : raw;

  return "#" + expanded.toUpperCase();
}

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    throw new TypeError("Expected a 3 or 6 digit hexadecimal color.");
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const channel = (value) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return ("#" + channel(r) + channel(g) + channel(b)).toUpperCase();
}

export function mixHex(base, target, targetWeight) {
  const ratio = Math.max(0, Math.min(1, targetWeight));
  const from = hexToRgb(base);
  const to = hexToRgb(target);

  return rgbToHex({
    r: from.r + (to.r - from.r) * ratio,
    g: from.g + (to.g - from.g) * ratio,
    b: from.b + (to.b - from.b) * ratio,
  });
}

export function buildScale(base) {
  const normalized = normalizeHex(base);

  if (!normalized) {
    throw new TypeError("Cannot build a scale from an invalid color.");
  }

  return [
    [50, mixHex(normalized, "#FFFFFF", 0.9)],
    [100, mixHex(normalized, "#FFFFFF", 0.78)],
    [200, mixHex(normalized, "#FFFFFF", 0.62)],
    [300, mixHex(normalized, "#FFFFFF", 0.45)],
    [400, mixHex(normalized, "#FFFFFF", 0.24)],
    [500, normalized],
    [600, mixHex(normalized, "#000000", 0.12)],
    [700, mixHex(normalized, "#000000", 0.25)],
    [800, mixHex(normalized, "#000000", 0.38)],
    [900, mixHex(normalized, "#000000", 0.52)],
    [950, mixHex(normalized, "#000000", 0.66)],
  ].map(([step, hex]) => ({ step, hex }));
}

function linearize(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);

  return (
    0.2126 * linearize(r) +
    0.7152 * linearize(g) +
    0.0722 * linearize(b)
  );
}

export function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastGrade(ratio) {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}

export function bestTextColor(background) {
  const whiteRatio = contrastRatio(background, "#FFFFFF");
  const blackRatio = contrastRatio(background, "#000000");

  return blackRatio >= whiteRatio ? "#000000" : "#FFFFFF";
}

export function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(lightness * 100) };
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  hue /= 6;

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function describeColor(hex) {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    throw new TypeError("Cannot describe an invalid color.");
  }

  const rgb = hexToRgb(normalized);
  const hsl = rgbToHsl(rgb);

  return {
    hex: normalized,
    rgb: "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")",
    hsl: "hsl(" + hsl.h + " " + hsl.s + "% " + hsl.l + "%)",
  };
}

export function toCssTokens(scale, prefix = "brand") {
  return [
    ":root {",
    ...scale.map(
      ({ step, hex }) => "  --color-" + prefix + "-" + step + ": " + hex + ";",
    ),
    "}",
  ].join("\n");
}
