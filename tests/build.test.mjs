import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import postcss from 'postcss';
test('base and scoped build outputs contain licenses and no unresolved build placeholders or query vars', async () => {
  for (const variant of ['minicss', 'minicss.conditional']) {
    const css = await readFile(`dist/${variant}.css`, 'utf8');
    assert.match(css, /Pico CSS v2.1.1/);
    assert.doesNotMatch(css, /__(?:NAV|SIDEBAR|THEMES)__/);
    const parsed = postcss.parse(css);
    parsed.walkAtRules(rule => { if (['media', 'container'].includes(rule.name)) assert.doesNotMatch(rule.params, /var\(/); });
    parsed.walkRules(rule => assert.ok(rule.selector.trim()));
    assert.doesNotMatch(css, /data-variant|data-borderless|data-form-grid|data-form-actions|data-field-error|data-overflow|data-select-classic/);
  }
});
