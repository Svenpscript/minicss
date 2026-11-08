import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHex, toHex, contrast, composite, rgbToOklch, gamutMap, generateTheme, auditTheme, exportTheme } from '../src/js/colors.js';
test('WCAG reference black/white and identical colors', () => {
  assert.equal(contrast('#000', '#fff'), 21);
  assert.equal(contrast('#fff', '#fff'), 1);
  assert.ok(Math.abs(contrast('#777', '#fff') - 4.478) < .001);
});
test('alpha compositing uses the final rendered foreground and background', () => {
  assert.deepEqual(composite('#00000080', '#ffffff'), [127 / 255, 127 / 255, 127 / 255, 1]);
  assert.ok(Math.abs(contrast('#00000080', '#ffffff') - contrast('#7f7f7f', '#ffffff')) < 1e-12);
  assert.equal(contrast('#00000000', '#12345680'), 1);
  assert.equal(contrast('#000', '#ffffff00', '#000'), 1);
});
test('OKLCH round trips and chroma mapping preserve usable sRGB', () => {
  for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#286b56', '#ffffff', '#000000']) assert.equal(toHex(gamutMap(rgbToOklch(parseHex(hex)))), hex);
  const mapped = gamutMap({ l: .6, c: .8, h: 130 });
  assert.ok(mapped.every(v => v >= 0 && v <= 1));
  const back = rgbToOklch(mapped);
  assert.ok(Math.abs(back.l - .6) < .001);
  assert.ok(Math.abs(back.h - 130) < .1);
  assert.ok(back.c < .8);
});
test('generated, rounded theme tokens pass all registered contrast checks across gamut extremes', () => {
  for (const source of ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#777777', '#286b56']) for (const tint of [0, .5, 1]) for (const accent of [null, 0, 180, 300]) {
    const theme = generateTheme({ source, tint, accent });
    for (const [mode, tokens] of Object.entries(theme)) {
      assert.equal(tokens.source, source);
      assert.equal(tokens.primary, source);
      assert.deepEqual(auditTheme(tokens).filter(check => !check.pass), [], `${source} ${mode} ${tint} ${accent}`);
    }
    assert.notEqual(theme.light.background, theme.dark.background);
  }
});
test('Pico accent fills stay exact in both themes with readable text and separate boundaries', () => {
  for (const source of ['#0172ad', '#007a50', '#f2df0d', '#ff9500', '#fff', '#000', '#777']) {
    const themes = generateTheme({ source, accent: 120, accent3: 240 });
    for (const tokens of Object.values(themes)) {
      assert.equal(tokens.primary, toHex(parseHex(source)));
      assert.ok(contrast(tokens['primary-text'], tokens.primary) >= 4.5);
      assert.deepEqual(auditTheme(tokens).filter(row => !row.pass), []);
    }
    assert.equal(themes.light.primary, themes.dark.primary);
  }
  const yellow = generateTheme({ source: '#f2df0d' }).light;
  assert.equal(yellow['primary-text'], '#000000');
  assert.notEqual(yellow['primary-border'], yellow.primary);
  assert.equal(generateTheme({ source: '#0172ad' }).light['primary-text'], '#ffffff');
});
test('optional accent angles and neutral tint leave the selected primary fill untouched', () => {
  const a = generateTheme({ source: '#286b56', tint: 0, accent: null, accent3: null });
  const b = generateTheme({ source: '#286b56', tint: 1, accent: 120, accent3: 240 });
  assert.equal(a.light.secondary, a.light.primary);
  assert.equal(a.light.tertiary, a.light.primary);
  assert.equal(a.light.primary, b.light.primary);
  assert.notEqual(b.light.secondary, b.light.tertiary);
  assert.notEqual(a.light.background, b.light.background);
});
test('manual overrides remain detectable and export preserves source and modes', () => {
  const themes = generateTheme({ source: '#abcdef' });
  themes.light.text = themes.light.surface;
  assert.ok(auditTheme(themes.light).some(row => row.fg === 'text' && !row.pass));
  const css = exportTheme(themes);
  assert.match(css, /--mini-source: #abcdef/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /:root:not\(\[data-theme\]\)/);
  assert.throws(() => parseHex('red'), TypeError);
  assert.throws(() => generateTheme({ source: '#00000080' }), TypeError);
});

test('independent brand colors stay exact and derive readable interaction states', () => {
  for (const source of ['#173748', '#ffcc00']) {
    const themes = generateTheme({ source, secondary: '#bd9656', tertiary: '#354783' });
    for (const tokens of Object.values(themes)) {
      assert.equal(tokens.primary, source);
      assert.equal(tokens.secondary, '#bd9656');
      assert.equal(tokens.tertiary, '#354783');
      assert.deepEqual(auditTheme(tokens).filter(row => !row.pass), []);
    }
  }
});

test('custom backgrounds derive readable surfaces while explicit text remains auditable', () => {
  for (const background of ['#000000', '#ffffff', '#777777', '#888888', '#ff0000', '#0000ff']) {
    const themes = generateTheme({ background: { light: background, dark: background } });
    for (const tokens of Object.values(themes)) {
      assert.equal(tokens.background, background);
      assert.deepEqual(auditTheme(tokens).filter(row => !row.pass), []);
    }
  }
  const themes = generateTheme({ source: '#173748', secondary: '#bd9656', background: { light: '#f5f7f8' }, text: { light: '#172c3b' } });
  assert.equal(themes.light.text, '#172c3b');
  assert.equal(themes.light.background, '#f5f7f8');
  assert.deepEqual(auditTheme(themes.light).filter(row => !row.pass), []);
  assert.ok(auditTheme(generateTheme({ background: '#ffffff', text: '#ffffff' }).light).some(row => !row.pass));
  for (const key of ['secondary', 'tertiary', 'background', 'text']) assert.throws(() => generateTheme({ [key]: '#00000080' }), TypeError);
});
