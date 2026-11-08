import { initTheme, initNavigation, createNotifier } from '../dist/minicss.js';
import { parseHex, toHex, rgbToOklch, gamutMap, generateTheme, auditTheme, exportTheme } from '../src/js/colors.js';
import { HUES, RINGS, wheelColor, wheelChoice, maxChroma } from './wheel.js';
initTheme(); initNavigation();
const notifier = createNotifier();
const $ = selector => document.querySelector(selector);
const form = $('#kleurinstellingen');
const controls = { h: $('#tint'), c: $('#chroma'), l: $('#lichtheid') };
const initial = generateTheme();
let source = initial.light.source;
let color = rgbToOklch(parseHex(source));
$('#broncode').value = source;
const baseValues = {
  secondary: initial.light.secondary, tertiary: generateTheme({ source, accent3: 240 }).light.tertiary,
  background: { light: initial.light.background, dark: initial.dark.background },
  text: { light: initial.light.text, dark: initial.dark.text },
};
$('#accent-code').value = baseValues.secondary;
$('#accent3-code').value = baseValues.tertiary;
for (const kind of ['background', 'text']) for (const mode of ['light', 'dark']) $(`#${kind}-${mode}`).value = baseValues[kind][mode];
let themes;
const overrides = { light: {}, dark: {} };
let lastLightness;
const canvas = $('#kleurenwiel'), context = canvas.getContext('2d');
function drawWheel() {
  if (lastLightness === color.l) return;
  lastLightness = color.l;
  const size = canvas.width, center = size / 2, image = context.createImageData(size, size);
  const palette = Array.from({ length: HUES }, (_, hue) => Array.from({ length: RINGS }, (_, ring) => gamutMap(wheelColor(color.l, hue, ring)).map(v => Math.round(v * 255))));
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = (x - center) / center, dy = (y - center) / center, radius = Math.hypot(dx, dy);
    if (radius > 1) continue;
    const h = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
    const rgb = palette[Math.round(h / (360 / HUES)) % HUES][Math.min(RINGS - 1, Math.floor(radius * RINGS))];
    const i = (y * size + x) * 4;
    rgb.forEach((v, j) => { image.data[i + j] = v; }); image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  context.strokeStyle = 'rgba(255,255,255,.3)'; context.lineWidth = .75;
  for (let ring = 1; ring < RINGS; ring++) { context.beginPath(); context.arc(center, center, center * ring / RINGS, 0, 2 * Math.PI); context.stroke(); }
  for (let hue = 0; hue < HUES; hue++) {
    const angle = (hue + .5) * 2 * Math.PI / HUES;
    context.beginPath(); context.moveTo(center + Math.cos(angle) * center / RINGS, center + Math.sin(angle) * center / RINGS);
    context.lineTo(center + Math.cos(angle) * center, center + Math.sin(angle) * center); context.stroke();
  }
}
function syncControls() {
  Object.entries(controls).forEach(([key, input]) => { input.value = color[key]; });
  $('#tint-waarde').textContent = `${Math.round(color.h)}°`;
  $('#chroma-waarde').textContent = color.c.toFixed(3);
  $('#lichtheid-waarde').textContent = `${Math.round(color.l * 100)}%`;
  $('#neutralen-waarde').textContent = `${Math.round(Number($('#neutralen').value) * 100)}%`;
  $('#accent-waarde').textContent = `${$('#accent').value}°`;
  $('#accent3-waarde').textContent = `${$('#accent3').value}°`;
  $('#accent-suggestie').textContent = suggestColor(Number($('#accent').value));
  $('#accent3-suggestie').textContent = suggestColor(Number($('#accent3').value));
  for (const [toggle, fields] of [['accent-aan', 'secondary-fields'], ['accent3-aan', 'tertiary-fields'], ['background-aan', 'background-fields'], ['text-aan', 'text-fields']]) {
    const enabled = $(`#${toggle}`).checked;
    $(`#${fields}`).hidden = !enabled;
    $(`#${fields}`).querySelectorAll('input, button').forEach(input => { input.disabled = !enabled; });
  }
  for (const [id, value] of [['source-swatch', source], ['secondary-swatch', baseValues.secondary], ['tertiary-swatch', baseValues.tertiary]]) $(`#${id}`).style.backgroundColor = value;
  $('#broncode').value = source;
  const radians = color.h * Math.PI / 180, maximum = maxChroma(color.l, color.h);
  const radius = maximum > .00001 ? Math.min(1, color.c / maximum) * 45 : 0;
  $('.wheel-marker').style.left = `${50 + Math.cos(radians) * radius}%`;
  $('.wheel-marker').style.top = `${50 + Math.sin(radians) * radius}%`;
  drawWheel();
}
function suggestColor(angle) { return toHex(gamutMap({ ...color, h: (color.h + angle) % 360 })); }
function syncOverride() { $('#override-value').value = themes[$('#override-mode').value][$('#override-token').value]; $('#override-error').hidden = true; $('#override-value').removeAttribute('aria-invalid'); }
function render() {
  themes = generateTheme({
    source, tint: Number($('#neutralen').value),
    secondary: $('#accent-aan').checked ? baseValues.secondary : null,
    tertiary: $('#accent3-aan').checked ? baseValues.tertiary : null,
    background: $('#background-aan').checked ? baseValues.background : undefined,
    text: $('#text-aan').checked ? baseValues.text : undefined,
  });
  for (const mode of ['light', 'dark']) Object.assign(themes[mode], overrides[mode]);
  const count = Object.values(overrides).reduce((sum, values) => sum + Object.keys(values).length, 0);
  $('#override-count').textContent = count ? `${count} ${count === 1 ? 'correctie' : 'correcties'}` : 'Automatisch';
  for (const mode of ['light', 'dark']) for (const [key, value] of Object.entries(themes[mode])) $(`#preview-${mode}`).style.setProperty(`--mini-${key}`, value);
  for (const mode of ['light', 'dark']) {
    const preview = $(`#preview-${mode}`);
    preview.querySelector('[data-preview-secondary]').hidden = !$('#accent-aan').checked;
    preview.querySelector('[data-preview-tertiary]').hidden = !$('#accent3-aan').checked;
    preview.querySelector('[data-accent-codes]').textContent = `Primair ${themes[mode].primary}${$('#accent-aan').checked ? ` · Tweede ${themes[mode].secondary}` : ''}${$('#accent3-aan').checked ? ` · Derde ${themes[mode].tertiary}` : ''}`;
  }
  const results = Object.entries(themes).flatMap(([mode, tokens]) => auditTheme(tokens).map(result => ({ ...result, mode })));
  const errors = results.filter(result => !result.pass);
  $('#audit-summary').dataset.pass = String(!errors.length);
  $('#audit-summary').textContent = errors.length ? `Aandacht: ${errors.length} van ${results.length} combinaties voldoen niet. Pas de gemarkeerde kleuren aan.` : `Alle ${results.length} gecontroleerde combinaties voldoen aan WCAG AA.`;
  $('#audit-rows').replaceChildren(...results.map(result => {
    const tr = document.createElement('tr'); if (!result.pass) tr.dataset.fail = '';
    for (const value of [result.mode === 'light' ? 'Licht' : 'Donker', `${result.fg} / ${result.bg}`, `${result.ratio.toFixed(2)}:1`, `${result.minimum}:1`, result.pass ? 'Voldoet' : 'Onvoldoende']) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
    return tr;
  }));
  $('#audit-errors').replaceChildren(...errors.map(result => { const li = document.createElement('li'); li.textContent = `${result.mode}: ${result.fg} op ${result.bg}: ${result.ratio.toFixed(2)}:1 (minimaal ${result.minimum}:1).`; return li; }));
  $('#css-export').value = exportTheme(themes);
}
function updateSource() {
  source = toHex(gamutMap(color));
  $('#bron-fout').hidden = true; $('#broncode').removeAttribute('aria-invalid');
  syncControls(); render(); syncOverride();
}
Object.entries(controls).forEach(([key, input]) => input.addEventListener('input', () => { color[key] = Number(input.value); updateSource(); }));
function bindHex(id, errorId, apply) {
  $(`#${id}`).addEventListener('input', event => {
    const value = event.target.value;
    const valid = /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
    $(`#${errorId}`).hidden = valid;
    if (!valid) {
      $(`#${errorId}`).textContent = 'Gebruik een ondoorzichtige hexkleur, zoals #30476f.';
      event.target.setAttribute('aria-invalid', 'true'); return;
    }
    event.target.removeAttribute('aria-invalid');
    apply(value.toLowerCase()); syncControls(); render(); syncOverride();
  });
}
bindHex('broncode', 'bron-fout', value => { source = value; color = rgbToOklch(parseHex(value)); });
bindHex('accent-code', 'accent-code-error', value => { baseValues.secondary = value; });
bindHex('accent3-code', 'accent3-code-error', value => { baseValues.tertiary = value; });
for (const kind of ['background', 'text']) for (const mode of ['light', 'dark']) bindHex(`${kind}-${mode}`, `${kind}-${mode}-error`, value => { baseValues[kind][mode] = value; });
for (const id of ['neutralen', 'accent-aan', 'accent3-aan', 'background-aan', 'text-aan']) $(`#${id}`).addEventListener('input', () => { syncControls(); render(); syncOverride(); });
for (const id of ['accent', 'accent3']) {
  $(`#${id}`).addEventListener('input', syncControls);
  $(`#apply-${id}`).addEventListener('click', () => {
    const code = $(`#${id}-code`);
    code.value = suggestColor(Number($(`#${id}`).value));
    code.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function pick(event) {
  const rect = canvas.getBoundingClientRect(), dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2), dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
  color = wheelChoice(color.l, dx, dy); updateSource();
}
canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); pick(event); });
canvas.addEventListener('pointermove', event => { if (canvas.hasPointerCapture(event.pointerId)) pick(event); });
canvas.addEventListener('pointerup', event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
canvas.addEventListener('pointercancel', event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
form.addEventListener('submit', event => event.preventDefault());
render();
for (const key of Object.keys(themes.light).filter(key => key !== 'source')) { const option = document.createElement('option'); option.value = key; option.textContent = `--mini-${key}`; $('#override-token').append(option); }
$('#override-token').value = 'text';
$('#override-mode').addEventListener('change', syncOverride); $('#override-token').addEventListener('change', syncOverride);
$('#override-value').addEventListener('input', event => {
  const value = event.target.value;
  const valid = /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
  $('#override-error').hidden = valid; event.target.setAttribute('aria-invalid', String(!valid));
  if (!valid) return;
  overrides[$('#override-mode').value][$('#override-token').value] = toHex(parseHex(value)); render();
});
$('#reset-overrides').addEventListener('click', () => { for (const mode of ['light', 'dark']) for (const key of Object.keys(overrides[mode])) delete overrides[mode][key]; render(); syncOverride(); });
$('#copy-css').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#css-export').value); $('#export-status').textContent = 'CSS gekopieerd.'; }
  catch { $('#css-export').focus(); $('#css-export').select(); $('#export-status').textContent = 'Kopiëren niet beschikbaar. De CSS is geselecteerd; gebruik Ctrl+C of Command+C.'; }
});
$('#download-css').addEventListener('click', () => {
  const blob = new Blob([$('#css-export').value], { type: 'text/css' }), url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'minicss-theme.css'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('#export-status').textContent = 'Thema gedownload.';
});
document.querySelectorAll('[data-preview-button]').forEach(button => button.addEventListener('click', () => notifier.notify('Dit is een voorbeeld van een thema-actie.', { variant: 'success' })));
syncControls(); syncOverride();
window.minicssEditor = { get themes() { return themes; } };
