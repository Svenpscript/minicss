import { init } from '../dist/minicss.js';

init();

const stylesheet = new URL('../dist/minicss.css', import.meta.url).href;
const demoStylesheet = new URL('./demo.css', import.meta.url).href;
const runtime = new URL('../dist/minicss.js', import.meta.url).href;

function preview(code, title, withDemoStyles = false) {
  const figure = document.createElement('figure');
  figure.className = 'docs-example';
  const caption = document.createElement('figcaption');
  caption.textContent = withDemoStyles ? 'Met extra demo/demo.css' : 'Voorbeeld — alleen minicss.css';
  const minimumHeight = /<dialog\b/i.test(code) ? 320 : 160;
  const frame = document.createElement('iframe');
  frame.title = `${title} (${withDemoStyles ? 'met demonstratieopmaak' : 'alleen het framework'})`;
  let observer;
  frame.addEventListener('load', () => {
    observer?.disconnect();
    if (!frame.isConnected || !frame.contentDocument?.body) return;
    const resize = () => {
      const body = frame.contentDocument?.body;
      if (!frame.isConnected || !body) { observer?.disconnect(); return; }
      // Fit the preview to its content; keep the framework's actual element styles.
      const height = Math.max(minimumHeight, Math.ceil(body.getBoundingClientRect().height));
      if (Math.abs(frame.getBoundingClientRect().height - height) > 2) frame.style.height = `${height + 2}px`;
    };
    observer = new ResizeObserver(resize);
    observer.observe(frame.contentDocument.body);
    resize();
  });
  const theme = document.documentElement.dataset.theme;
  frame.srcdoc = `<!doctype html><html lang="nl"${['light', 'dark'].includes(theme) ? ` data-theme="${theme}"` : ''}><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <base href="${document.baseURI}">
    <link rel="stylesheet" href="${stylesheet}">
    ${withDemoStyles ? `<link rel="stylesheet" href="${demoStylesheet}">` : ''}
    <style>body { min-height: 0; }</style>
    <script type="module">
      import { init, setProcessing } from ${JSON.stringify(runtime)};
      init();
      document.addEventListener('submit', event => {
        if ((event.submitter?.getAttribute('formmethod') || event.target.method) === 'dialog') return;
        event.preventDefault();
        setProcessing(event.target, false);
        let status = event.target.querySelector('[role="status"]');
        if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); event.target.append(status); }
        status.textContent = 'Dit is een voorbeeld; er worden geen gegevens verstuurd.';
      });
      document.addEventListener('click', event => {
        // Example navigation should not replace the preview with another page.
        const link = event.target.closest('a[href]');
        if (link && !link.getAttribute('href').startsWith('#')) event.preventDefault();
      });
    </script></head><body>${code}</body></html>`;
  const open = document.createElement('a');
  const fullPage = frame.srcdoc.replace('<style>body { min-height: 0; }</style>', '');
  const url = URL.createObjectURL(new Blob([fullPage], { type: 'text/html' }));
  open.href = url;
  open.target = '_blank';
  open.rel = 'noopener';
  open.textContent = 'Open als aparte pagina';
  window.addEventListener('pagehide', event => { if (!event.persisted) URL.revokeObjectURL(url); });
  caption.append(open);
  figure.append(caption, frame);
  return figure;
}

document.querySelectorAll('main pre > code').forEach(code => {
  // Installation examples contain complete documents and deployment-specific asset paths.
  if (code.closest('#installatie')) return;
  const source = code.textContent.trim();
  if (!source.startsWith('<')) return;
  const pre = code.parentElement;
  let heading = pre.previousElementSibling;
  while (heading && !heading.matches('h2, h3')) heading = heading.previousElementSibling;
  const title = heading?.textContent || pre.closest('section').querySelector('h2').textContent;
  // The preview supplies its own framework stylesheet.
  const markup = source.replace(/<link\b[^>]*>/gi, '');
  pre.before(preview(markup, title));
  if (pre.id === 'demo-brand-source') pre.before(preview(markup, title, true));
});
