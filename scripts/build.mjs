import { readFile, writeFile, mkdir, copyFile, rm } from 'node:fs/promises';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { transform, build } from 'esbuild';
import config from '../build.config.mjs';
import { generateTheme, exportTheme } from '../src/js/colors.js';
await mkdir('dist', { recursive: true });
const pico = postcss.parse(await readFile('node_modules/@picocss/pico/css/pico.css', 'utf8'));
pico.walkAtRules('charset', rule => rule.remove());
// Replace precisely the upstream components whose behavior minicss changes.
pico.walkRules(rule => {
  const selectors = rule.selectors.filter(s => !/\barticle\b|\bdialog\b|\.modal-is-|\.container(?:-fluid)?\b|\.grid\b/.test(s) && !/^details(?::|\s|\[)/.test(s.trim()));
  if (!selectors.length) rule.remove(); else rule.selectors = selectors;
});
pico.walkDecls('--pico-font-size', decl => { if (decl.parent.parent.type === 'atrule') decl.remove(); });
const custom = (await readFile('src/minicss.css', 'utf8'))
  .replaceAll('__NAV__', config.breakpoints.navigation).replaceAll('__SIDEBAR__', config.breakpoints.sidebar)
  .replace('__THEMES__', exportTheme(generateTheme()));
const base = postcss.parse(`@layer pico, minicss;\n@layer pico {${pico}}\n@layer minicss {${custom}}`);
function scope(root) {
  root.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    rule.selector = selectorParser(selectors => {
      selectors.each(selector => {
        selector.walk(node => {
          if ((node.type === 'pseudo' && [':root', ':host'].includes(node.value)) || (node.type === 'tag' && ['html', 'body'].includes(node.value))) {
            const replacement = selectorParser().astSync(`:where(${config.wrapper})`).nodes[0].nodes[0].clone();
            if (node.value === ':host' && node.nodes?.length) {
              const inner = node.nodes.map(n => n.toString()).join(',');
              replacement.value = ':is'; replacement.nodes = selectorParser().astSync(`${config.wrapper}${inner}`).nodes;
            }
            node.replaceWith(replacement);
          }
        });
        // Guard the subject itself, including root/theme alternatives inside :where().
        const guard = selectorParser().astSync(`:where(${config.wrapper}, ${config.wrapper} *)`).nodes[0].nodes[0].clone();
        const pseudoElement = selector.nodes.find(n => n.type === 'pseudo' && (n.value.startsWith('::') || [':before', ':after'].includes(n.value)));
        if (pseudoElement) selector.insertBefore(pseudoElement, guard); else selector.append(guard);
      });
    }).processSync(rule.selector);
  });
}
for (const variant of ['minicss', 'minicss.conditional']) {
  const root = base.clone();
  if (variant.includes('conditional')) scope(root);
  root.walkAtRules(rule => { if (rule.nodes && !rule.nodes.length) rule.remove(); });
  const banner = '/*! minicss v0.1.0 | Derived from Pico CSS v2.1.1 | MIT | See LICENSE and LICENSE.pico */\n';
  const css = banner + root.toString();
  await writeFile(`dist/${variant}.css`, css);
  await writeFile(`dist/${variant}.min.css`, banner + (await transform(css, { loader: 'css', minify: true, legalComments: 'none', target: ['chrome120', 'firefox128', 'safari17.4'] })).code);
}
await build({ entryPoints: { minicss: 'src/js/index.js' }, outdir: 'dist', bundle: true, minify: true, format: 'esm', target: 'es2022' });
await build({ entryPoints: ['theme', 'navigation', 'dialog', 'aside', 'focus', 'forms', 'notifications', 'colors'].map(name => `src/js/${name}.js`), outdir: 'dist/modules', bundle: false, minify: true, format: 'esm', target: 'es2022' });
// Blocking head script: applies a saved explicit theme before the stylesheet is parsed.
await build({ entryPoints: ['src/js/theme-init.js'], outfile: 'dist/theme-init.js', bundle: true, minify: true, format: 'iife', target: 'es2022' });
await copyFile('node_modules/@picocss/pico/LICENSE.md', 'LICENSE.pico');
await copyFile('LICENSE', 'dist/LICENSE');
await copyFile('LICENSE.pico', 'dist/LICENSE.pico');
await writeFile('dist/breakpoints.json', JSON.stringify(config.breakpoints, null, 2));
// Retire the old strict classless builds; all features now share the semantic base.
for (const name of ['minicss.classless', 'minicss.fluid.classless']) for (const suffix of ['.css', '.min.css']) await rm(`dist/${name}${suffix}`, { force: true });
console.log('minicss: semantische basis, scoped export en optionele JavaScriptmodules gebouwd.');
