import test from "node:test";
import assert from "node:assert/strict";

import {
  bestTextColor,
  buildScale,
  contrastGrade,
  contrastRatio,
  describeColor,
  hexToRgb,
  mixHex,
  normalizeHex,
  rgbToHex,
  toCssTokens,
} from "../src/domain/color.js";
import { parseStoredColor } from "../src/storage/colorStorage.js";

test("hex normalization accepts shorthand and canonicalizes case", () => {
  assert.equal(normalizeHex("abc"), "#AABBCC");
  assert.equal(normalizeHex("#12ef90"), "#12EF90");
  assert.equal(normalizeHex("#xyz"), null);
});

test("RGB conversion round trips", () => {
  const rgb = hexToRgb("#12EF90");
  assert.deepEqual(rgb, { r: 18, g: 239, b: 144 });
  assert.equal(rgbToHex(rgb), "#12EF90");
});

test("color mixing is deterministic at useful boundaries", () => {
  assert.equal(mixHex("#336699", "#FFFFFF", 0), "#336699");
  assert.equal(mixHex("#336699", "#FFFFFF", 1), "#FFFFFF");
});

test("generated scale contains a stable 500 seed", () => {
  const scale = buildScale("#6366F1");
  assert.equal(scale.length, 11);
  assert.deepEqual(scale[5], { step: 500, hex: "#6366F1" });
  assert.equal(scale[0].step, 50);
  assert.equal(scale.at(-1).step, 950);
});

test("WCAG contrast math matches the black and white reference ratio", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(contrastGrade(7), "AAA");
  assert.equal(contrastGrade(4.5), "AA");
  assert.equal(contrastGrade(3), "AA Large");
  assert.equal(contrastGrade(2.99), "Fail");
});

test("best text picks the higher contrast neutral", () => {
  assert.equal(bestTextColor("#FFFFFF"), "#000000");
  assert.equal(bestTextColor("#000000"), "#FFFFFF");
});

test("color descriptions and CSS export are presentation ready", () => {
  assert.deepEqual(describeColor("#FF0000"), {
    hex: "#FF0000",
    rgb: "rgb(255, 0, 0)",
    hsl: "hsl(0 100% 50%)",
  });

  const tokens = toCssTokens([{ step: 500, hex: "#FF0000" }]);
  assert.match(tokens, /--color-brand-500: #FF0000;/);
});

test("stored state fails closed to the supplied fallback", () => {
  assert.equal(
    parseStoredColor('{"version":1,"baseColor":"#abc"}', "#6366F1"),
    "#AABBCC",
  );
  assert.equal(parseStoredColor("{broken", "#6366F1"), "#6366F1");
  assert.equal(parseStoredColor('{"baseColor":"nope"}', "#6366F1"), "#6366F1");
});
