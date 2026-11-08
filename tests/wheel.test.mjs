import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelColor, wheelChoice, maxChroma, HUES, RINGS } from '../demo/wheel.js';
import { oklchToRgb, gamutMap, toHex } from '../src/js/colors.js';
test('wheel selections snap to fixed hue and intensity cells', () => {
  assert.equal(HUES, 24); assert.equal(RINGS, 5);
  assert.deepEqual(wheelChoice(.65, .85, .01), wheelChoice(.65, .88, .02));
  assert.equal(wheelChoice(.65, .9, 0).h, 0);
  assert.equal(wheelChoice(.65, 0, .9).h, 90);
  assert.equal(wheelChoice(.65, 0, 0).c, 0);
});
test('wheel rings use distinct in-gamut intensities for each hue and lightness', () => {
  for (const l of [.3, .6, .85]) for (let hue = 0; hue < HUES; hue++) {
    const colors = [];
    for (let ring = 0; ring < RINGS; ring++) {
      const color = wheelColor(l, hue, ring);
      assert.ok(oklchToRgb(color).every(channel => channel >= -.00001 && channel <= 1.00001));
      colors.push(toHex(gamutMap(color)));
    }
    assert.equal(new Set(colors).size, RINGS);
    assert.ok(maxChroma(l, hue * 15) > 0);
  }
});
