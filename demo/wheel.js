import { gamutMap, rgbToOklch } from '../src/js/colors.js';
export const HUES = 24;
export const RINGS = 5;
export function maxChroma(l, h) {
  return rgbToOklch(gamutMap({ l, h, c: .4 })).c;
}
export function wheelColor(l, hueIndex, ringIndex) {
  const h = ((hueIndex % HUES) + HUES) % HUES * 360 / HUES;
  return { l, h, c: maxChroma(l, h) * Math.max(0, Math.min(RINGS - 1, ringIndex)) / (RINGS - 1) };
}
export function wheelChoice(l, x, y) {
  const angle = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  const hueIndex = Math.round(angle / (360 / HUES)) % HUES;
  const ringIndex = Math.min(RINGS - 1, Math.floor(Math.hypot(x, y) * RINGS));
  return wheelColor(l, hueIndex, ringIndex);
}
