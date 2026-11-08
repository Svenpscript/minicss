// OKLab matrices: https://bottosson.github.io/posts/oklab/
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const linear = v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const encode = v => v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
export function parseHex(hex) {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(hex)) throw new TypeError('Gebruik #RGB, #RRGGBB of #RRGGBBAA.');
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  return [...rgb, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
}
export function toHex(rgb) { return '#' + rgb.slice(0, 3).map(v => Math.round(clamp(v) * 255).toString(16).padStart(2, '0')).join(''); }
export function oklchToRgb({ l, c, h }) {
  const a = c * Math.cos(h * Math.PI / 180), b = c * Math.sin(h * Math.PI / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S, -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S, -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S].map(encode);
}
export function rgbToOklch(rgb) {
  const [r, g, b] = rgb.slice(0, 3).map(linear);
  const L = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const M = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const S = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S;
  const bb = 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S;
  return { l: 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S, c: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
}
export function gamutMap(color) {
  const inside = rgb => rgb.every(v => v >= -0.000001 && v <= 1.000001);
  let rgb = oklchToRgb(color);
  if (inside(rgb)) return rgb.map(v => clamp(v));
  let lo = 0, hi = Math.max(0, color.c);
  for (let i = 0; i < 26; i++) {
    const c = (lo + hi) / 2;
    if (inside(oklchToRgb({ ...color, c }))) lo = c; else hi = c;
  }
  return oklchToRgb({ ...color, c: lo }).map(v => clamp(v));
}
export function composite(foreground, background = [1, 1, 1, 1]) {
  const f = typeof foreground === 'string' ? parseHex(foreground) : foreground;
  const b = typeof background === 'string' ? parseHex(background) : background;
  const fa = f[3] ?? 1, ba = b[3] ?? 1, a = fa + ba * (1 - fa);
  return [...f.slice(0, 3).map((v, i) => a ? (v * fa + b[i] * ba * (1 - fa)) / a : 0), a];
}
export function contrast(foreground, background, canvas = '#ffffff') {
  const bg = composite(background, composite(canvas));
  const fg = composite(foreground, bg);
  const luminance = rgb => rgb.slice(0, 3).map(linear).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const a = luminance(fg), b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function accessible(color, backgrounds, ratio = 4.5) {
  const original = typeof color === 'string' ? rgbToOklch(parseHex(color)) : color;
  const candidates = Array.from({ length: 201 }, (_, i) => ({ ...original, l: i / 200 })).sort((a, b) => Math.abs(a.l - original.l) - Math.abs(b.l - original.l));
  for (const candidate of [original, ...candidates]) {
    const hex = toHex(gamutMap(candidate));
    if (backgrounds.every(bg => contrast(hex, bg) >= ratio)) return hex;
  }
  throw new Error('Geen kleur voldoet voor deze combinatie van achtergronden.');
}
export const checks = [
  ['text', 'background', 4.5], ['text', 'surface', 4.5], ['text', 'surface-alt', 4.5],
  ['muted', 'background', 4.5], ['muted', 'surface', 4.5], ['muted', 'surface-alt', 4.5],
  ['link', 'background', 4.5], ['link', 'surface', 4.5], ['link-hover', 'background', 4.5], ['link-hover', 'surface', 4.5],
  ...['primary', 'secondary', 'tertiary'].flatMap(kind => [
    ...['', '-hover', '-active'].map(state => [`${kind}-text`, `${kind}${state}`, 4.5]),
    ...['', '-hover', '-active'].flatMap(state => ['background', 'surface', 'surface-alt'].map(surface => [`${kind}${state}-border`, surface, 3])),
  ]),
  ...['secondary', 'tertiary'].flatMap(kind => ['background', 'surface', 'surface-alt'].map(surface => [`${kind}-outline`, surface, 4.5])),
  ['border', 'surface', 3], ['border', 'background', 3], ['border', 'surface-alt', 3],
  ['focus', 'surface', 3], ['focus', 'background', 3], ['focus', 'surface-alt', 3],
  ...['success', 'warning', 'error', 'info'].flatMap(kind => [[kind, 'surface', 4.5], [kind, 'background', 4.5], [kind, 'surface-alt', 4.5]]),
];
export function auditTheme(tokens) {
  return checks.map(([fg, bg, minimum]) => {
    const ratio = contrast(tokens[fg], tokens[bg]);
    return { fg, bg, minimum, ratio, pass: ratio >= minimum };
  });
}
function addAccent(tokens, name, color, surfaces) {
  const hex = typeof color === 'string' ? toHex(parseHex(color)) : toHex(gamutMap(color));
  const base = rgbToOklch(parseHex(hex));
  const text = contrast('#000000', hex) >= contrast('#ffffff', hex) ? '#000000' : '#ffffff';
  const direction = text === '#000000' ? (base.l > .85 ? -1 : 1) : (base.l < .2 ? 1 : -1);
  tokens[name] = hex;
  tokens[`${name}-text`] = text;
  if (name !== 'primary') tokens[`${name}-outline`] = accessible(hex, surfaces);
  for (const [state, step] of [['', 0], ['-hover', .045], ['-active', .09]]) {
    if (step) tokens[`${name}${state}`] = accessible({ ...base, l: clamp(base.l + direction * step) }, [text]);
    tokens[`${name}${state}-border`] = accessible(tokens[`${name}${state}`], surfaces, 3);
  }
}
function opaqueHex(value) {
  const rgba = parseHex(value);
  if (rgba[3] !== 1) throw new TypeError('Basiskleuren moeten ondoorzichtig zijn.');
  return toHex(rgba);
}
function modeColor(value, mode) {
  const selected = typeof value === 'string' ? (mode === 'light' ? value : null) : value?.[mode];
  return selected == null ? null : opaqueHex(selected);
}
export const DEFAULT_THEME = Object.freeze({
  source: '#30476f', secondary: '#354783', tertiary: null,
  // Light colors come from the reference site; dark base colors are derived from its primary.
  background: Object.freeze({ light: '#f6f7f6', dark: '#0e0f12' }),
  text: Object.freeze({ light: '#182e46', dark: '#e9ebef' }),
});

export function generateTheme({ source = DEFAULT_THEME.source, tint = 0.12, accent = 120, accent3 = null, secondary, tertiary, background, text } = DEFAULT_THEME) {
  const rgba = parseHex(opaqueHex(source));
  const base = rgbToOklch(rgba);
  const second = secondary !== undefined ? (secondary === null ? source : opaqueHex(secondary)) : (accent === null ? source : { ...base, h: (base.h + accent) % 360 });
  const third = tertiary !== undefined ? (tertiary === null ? source : opaqueHex(tertiary)) : (accent3 === null ? source : { ...base, h: (base.h + accent3) % 360 });
  const modes = {};
  for (const dark of [false, true]) {
    const mode = dark ? 'dark' : 'light';
    const neutral = l => toHex(gamutMap({ l, c: clamp(tint) * 0.045, h: base.h }));
    const chosenBackground = modeColor(background, mode);
    const t = { source, background: chosenBackground || neutral(dark ? 0.17 : 0.985) };
    const onDark = rgbToOklch(parseHex(t.background)).l < .55;
    if (chosenBackground) {
      const bg = rgbToOklch(parseHex(chosenBackground));
      const onBackground = contrast('#000000', chosenBackground) >= contrast('#ffffff', chosenBackground) ? '#000000' : '#ffffff';
      // Keep derived surfaces on the readable side of middle-gray as well.
      t.surface = accessible({ ...bg, l: clamp(bg.l + (onDark ? .035 : .02)) }, [onBackground]);
      t['surface-alt'] = accessible({ ...bg, l: clamp(bg.l + (onDark ? .07 : -.025)) }, [onBackground]);
    } else {
      t.surface = neutral(dark ? .22 : 1);
      t['surface-alt'] = neutral(dark ? .26 : .96);
    }
    const surfaces = [t.background, t.surface, t['surface-alt']];
    const chosenText = modeColor(text, mode);
    t.text = chosenText || accessible(neutral(onDark ? .94 : .25), surfaces);
    const textBase = rgbToOklch(parseHex(t.text));
    t.muted = accessible(chosenText ? { ...textBase, l: clamp(textBase.l + (onDark ? -.18 : .20)) } : neutral(onDark ? .76 : .46), surfaces);
    t.border = accessible(neutral(onDark ? .60 : .63), surfaces, 3);
    t.link = accessible(base, surfaces);
    const linkBase = rgbToOklch(parseHex(t.link));
    t['link-hover'] = accessible({ ...linkBase, l: clamp(linkBase.l + (onDark ? .05 : -.05)) }, surfaces);
    t.focus = accessible(base, surfaces, 3);
    // Brand fills retain the selected lightness/chroma in both themes. A border,
    // rather than a changed brand fill, supplies component recognition if needed.
    addAccent(t, 'primary', source, surfaces);
    addAccent(t, 'secondary', second, surfaces);
    addAccent(t, 'tertiary', third, surfaces);
    for (const [kind, h] of Object.entries({ success: 150, warning: 75, error: 25, info: 250 })) t[kind] = accessible({ l: onDark ? .82 : .40, c: .14, h }, surfaces);
    // Check the rounded, exported sRGB values rather than the unrounded OKLCH source.
    modes[mode] = t;
  }
  return modes;
}
export const declarations = tokens => Object.entries(tokens).map(([key, value]) => `  --mini-${key}: ${value};`).join('\n');
export function exportTheme(themes) {
  return `/* minicss theme; source: ${themes.light.source} */\n:root, [data-theme="light"] {\n${declarations(themes.light)}\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${declarations(themes.dark)}\n  }\n}\n[data-theme="dark"] {\n${declarations(themes.dark)}\n}\n`;
}
