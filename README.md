# minicss

Een compact CSS-framework op basis van **Pico CSS 2.1.1**. Gewone CSS, semantische HTML, afzonderlijk instelbare maten en kleine optionele JavaScriptmodules. Dit is versie 0.1.0; er is geen npm-publicatie of CDN nodig.

## Starten

Gebruik Node.js 22 of nieuwer voor ontwikkeling. De website zelf heeft alleen de bestanden uit `dist/` nodig.

```sh
npm ci
npm run build
npm run dev
```

Op Windows met een geblokkeerd PowerShell-npm-script: gebruik `npm.cmd` in plaats van `npm`. Open de demo op <http://127.0.0.1:4173>, de editor op `/theme.html` en de handleiding op `/docs.html`. Een bestaande Laragon-host kan dezelfde bestanden aanbieden. De demonstratie-POST-endpoints werken alleen met de meegeleverde ontwikkelserver.

```html
<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>Mijn project</title>
  <link rel="stylesheet" href="/assets/minicss/minicss.min.css">
</head>
<body>
  <main><h1>Mijn project</h1><p>Klaar om te beginnen.</p></main>
  <footer>Mijn project</footer>
</body>
</html>
```

Voor alleen gebruik hoef je de ontwikkelcommando's niet uit te voeren. Kopieer de gebouwde bestanden uit `dist/` naar de map die je webserver aanbiedt. In dit voorbeeld staan ze in `public/assets/minicss/`; de URL begint dan met `/assets/minicss/`. Pas die URL aan als jouw indeling anders is. Pico zit al in minicss: laad geen losse Pico-stylesheet.

| Bestand | Nodig voor |
| --- | --- |
| `minicss.min.css` | Alle basisopmaak; vereist |
| `minicss.js` | Optionele bediening; importeren en initialiseren |
| `theme-init.js` | Optioneel: een opgeslagen lichte/donkere keuze toepassen voor de CSS |
| `LICENSE`, `LICENSE.pico` | Licentievermeldingen; meekopieren |

De demo, editor, tests en ontwikkelbestanden zijn geen vereiste voor je website. Eigen bestanden zoals `assets/theme.css`, `assets/app.css` en `assets/app.js` maak je alleen wanneer je ze gebruikt.

Voor de optionele bediening maak je `assets/app.js`:

```js
import { init } from '/assets/minicss/minicss.js';
init();
```

Laad dit vlak voor `</body>` met `<script type="module" src="/assets/app.js"></script>`. Alleen `minicss.js` laden initialiseert niets. `init()` activeert de aanwezige bediening en POST-beveiliging; voor eigen AJAX-acties herstel je de verwerking via `setProcessing(form, false)`. Je kunt ook alleen de benodigde functies initialiseren, zie de API hieronder.

Met themavoorkeur, een eigen kleurthema en projectopmaak is dit de volgorde in de head:

```html
<script src="/assets/minicss/theme-init.js"></script>
<link rel="stylesheet" href="/assets/minicss/minicss.min.css">
<link rel="stylesheet" href="/assets/theme.css">
<link rel="stylesheet" href="/assets/app.css">
```

Laat optionele bestanden weg. Het vroege themascript heeft geen async, defer of module-attribuut: het past de opgeslagen keuze toe voordat de CSS wordt getoond. De aparte themabediening komt uit de gewone runtime. Zonder scripts volgt licht/donker de systeemvoorkeur.

Een vaste stand gebruikt `<html data-theme="light">` of `<html data-theme="dark">`. Laat de voorkeurloader en themabediening weg als die vaste stand niet mag worden overschreven. Voor een opgeslagen bezoekerskeuze gebruik je een gelabelde `select name="theme"` met auto/light/dark, de vroege loader en `init()`.

Exporteer een eigen palet met de editor naar bijvoorbeeld `assets/theme.css`. De export bevat licht en donker; laad deze na de framework-CSS. Voor verschillende kleurversies kun je meerdere exports bewaren en de gewenste stylesheet kiezen per project of pagina. Je hoeft de editor niet mee te publiceren.

De frameworkversie is 0.1.0 (Pico-basis 2.1.1). Een eigen thema heeft geen automatisch versienummer. Voor cachevernieuwing kun je bijvoorbeeld `minicss.min.css?v=0.1.0`, `theme-init.js?v=0.1.0` en `theme.css?v=2026-11-08-1` gebruiken. Neem de frameworkversie ook mee in de import van `minicss.js` en vernieuw de URL van je eigen app.js wanneer die verandert. Werk bij een release CSS en JavaScript samen bij; controleer of je thema opnieuw moet worden gegenereerd. Een assetbundler met inhoudshashes kan deze cachevernieuwing verzorgen.

De [installatiehandleiding](docs.html#installatie) bevat de complete bestandsindeling, kopieerbare voorbeelden en uitleg over kleurversies, licht/donker en versie-URL's.

## Opbouw en Pico-basis

`src/minicss.css` is de gedeelde CSS-bron. De build importeert de vastgepinde npm-bron van Pico en vervangt uitsluitend de upstream container-, grid-, article-, dialog- en algemene details-componentregels. De overige Pico-basis, waaronder typografie, formulieren, tabellen, voortgangsbalken, tooltips en navigatiedropdowns, blijft in de lagere `pico`-laag. Er wordt geen Sass gecompileerd. Een gewone details/summary gebruikt zijn native marker; er is geen minicss-accordeoncomponent. De expliciete Pico-klasse `details.dropdown` blijft als optioneel navigatiepatroon beschikbaar en staat los van selectpickers.

CSS-laagvolgorde: `@layer pico, minicss`. Minicss gebruikt voornamelijk `:where()` met lage specificiteit. Eigen CSS zonder laag overschrijft beide lagen. Gebruik dezelfde componentregels niet tegelijk uit een losse Pico-stylesheet: Pico zit al in de minicss-build.

## Een semantische basis

Laad `dist/minicss.min.css`. Gewone HTML krijgt automatisch opmaak, inclusief gecentreerde pagina-inhoud, navigatie, formulieren, cards, tabellen en een aside. De aparte strict-classless- en fluid-classless-bestanden zijn vervallen: dezelfde stylesheet bevat ook de kleine uitzonderingen.

`body > main`, `body > footer` en `body > header > nav` krijgen automatisch breedte en zijruimte. Voor volledige breedte stel je `--mini-content-width: none` in, op de root of een gericht element. Een bijzondere geneste container kan `.container` gebruiken.

Gebruik geen data-attributen als alternatieve opmaakklassen. De beperkte uitzonderingen zijn `.grid`, `.container`, `.button` voor een navigatielink met knopuiterlijk, `.secondary`, `.tertiary`, `.outline`, `.borderless`, `.full-width`, `.text-start`, `.actions`, `.group`, `.classic`, `.error`, `.muted`, `.sr-only` en `.print-hide`. Alleen toevoegen wanneer je van de automatische basis wilt afwijken. Statuskleuren gebruiken `.success`, `.info`, `.warning` en `.error`.

De optionele `minicss.conditional.min.css` is een scoped export van dezelfde basis, voor inbedding binnen `.minicss`. Het is geen apart componentenpakket. Alle selectors blijven binnen de wrapper; laag- en keyframenamen bestaan documentbreed. De JavaScriptmodules gebruiken documentbrede focus en scrollvergrendeling waar een modal dat vereist.

## Wat is automatisch en wat blijft expliciet?

| Onderdeel | Minimale instelling |
| --- | --- |
| Tekst, lijsten, code, media, details/summary en gewone tabellen | Alleen de passende HTML-elementen |
| Pagina-inhoud, paginanavigatie en footer | Automatische breedte en zijruimte; CSS-variabelen voor afwijkingen |
| Bijzondere geneste container | Een enkele `.container` |
| Grid, ook op formulieren | `.grid`; optioneel `--mini-grid-min` en `--mini-grid-gap` |
| Aside links/rechts, sticky en eigen scrollgebied | Directe aside, positie via documentvolgorde; geen extra klasse |
| Mobiel asidepaneel | Opener met `aria-controls`, aside-ID en sluitknop `.close` |
| Article/card | Gewoon article; directe header activeert cardopmaak |
| Formuliervelden en selects | Native label, input, select en textarea; `.classic` alleen voor een afwijkende pickerkeuze |
| Hulptekst en validatie | Native veldkoppelingen en `aria-invalid`; `.error` bij een afwijkende foutstructuur |
| Knoppenrij | Automatisch in een directe formulierwrapper met knoppen; elders zo nodig `.actions` |
| Samengestelde bediening | Automatisch bij een zoekformulier met directe zoekinput; anders `.group` |
| Knopvariant of navigatielink met knopuiterlijk | Een gerichte variantklasse of `.button`; geen vervangende data-attributen |
| Scrollbare tabel | Gewone div met alleen een tabel |
| Mobiel menu en dialog openen | Knop met `aria-controls` naar de doel-ID; native `hidden` is optioneel voor de toestand zonder JS |
| Dialog sluiten | Native `form method="dialog"` of `formmethod="dialog"` op een annuleerknop |
| Dubbele POST-verzending voorkomen | Alleen de optionele formuliermodule initialiseren; geen extra formulierattribuut |
| Themabediening | Gelabelde `select name="theme"`; de module beheert de thematoestand |
| Tijdelijke meldingen | API-aanroep; de module maakt markup en toegankelijkheidsattributen |
| Schermlezertekst en bijzonder printgedrag | `.sr-only` en `.print-hide` als expliciete uitzonderingen |

Native attributen zoals `name`, `type`, `required`, `href`, `action`, `method` en benodigde ARIA-koppelingen blijven behouden. Ze zijn geen opmaakhaken. De overige behouden Pico-opties, zoals een expliciet navigatiedropdown of tooltip, zijn optioneel; gewone native details en title blijven bruikbaar zonder die toevoegingen.

De documentatie en kleureneditor hebben eigen vormgeving en applicatielogica. Klassen zoals de editorindeling en interne previewhaken zijn geen vereiste voor pagina's die minicss gebruiken. Ook de notificatieknoppen in de demo hebben eigen applicatiegedrag; dat schrijft het framework niet voor.

`wordmark` en `footer-content` staan alleen in `demo/demo.css`: de eerste verzorgt het tekstlogo, de tweede de flexindeling van de demofooter. Ze horen niet bij het framework. De [handleiding](docs.html#demoklassen) toont dezelfde HTML met en zonder deze extra CSS. Bij de HTML-fragmenten staan werkende voorbeelden met uitsluitend de frameworkstylesheet; ze kunnen ook als aparte pagina worden geopend.

## Variabelen

Stel waarden in op `:root` of op een gerichte container. De rootlettergrootte is 100% en groeit niet automatisch op brede schermen. Heading- en controlematen staan hier los van.

| Variabele | Standaard | Doel |
| --- | --- | --- |
| `--mini-font-size` | `100%` | Basislettergrootte |
| `--mini-text-small` | `.875rem` | Kleine tekst |
| `--mini-heading-1` | `clamp(2.25rem, 5vw, 3.5rem)` | H1 |
| `--mini-heading-2` | `1.75rem` | H2 |
| `--mini-space` | `1rem` | Algemene afstand; koppelt ook Pico spacing |
| `--mini-radius` | `.6rem` | Algemene afronding; radio’s en spinners blijven rond |
| `--mini-content-width` | `76rem` | Max. containerbreedte |
| `--mini-gutter` | `clamp(1rem, 3vw, 2rem)` | Zijruimte |
| `--mini-control-height` | `2.75rem` | Minimumhoogte bediening |
| `--mini-control-padding` | `.625rem 1rem` | Knopruimte |
| `--mini-grid-min` | `16rem` | Minimale gridkolom |
| `--mini-grid-gap` | `1.5rem` | Gridafstand |
| `--mini-sidebar-width` | `17rem` | Asidebreedte |
| `--mini-main-min` | `28rem` | Minimale hoofdinhoud voor JS-ruimtecontrole |
| `--mini-sidebar-gap` | `3rem` | Afstand tot aside |
| `--mini-aside-gap` | `1rem` | Vrije ruimte boven/onder de sticky aside |
| `--mini-aside-offset` | `0px`, of navigatiehoogte | Ruimte voor de sticky paginanavigatie; lokaal op de container aanpasbaar |
| `--mini-form-width` | `100%` | Formulierbreedte |
| `--mini-nav-sticky` | `sticky` | Zet op `static` om sticky uit te schakelen |
| `--mini-nav-height` | `4rem` | Minimale navhoogte en offsetfallback zonder JS |
| `--mini-header-space` | `.5rem` | Verticale ruimte in de paginaheader |
| `--mini-footer-space` | `.75rem` | Verticale ruimte in de paginafooter |
| `--mini-nav-offset` | gemeten met JS | Werkelijke sticky-headerhoogte voor ankers en meldingen |

Voor `--mini-main-min`, `--mini-sidebar-width` en `--mini-sidebar-gap` ondersteunt de aanvullende JS-ruimtecontrole eenvoudige waarden in `rem`, `em` of `px`. Gebruik voor de querygrens de buildconfiguratie. Stel `--mini-nav-height` zonder JS zo in dat hij de werkelijke headerhoogte benadert.

```css
:root { --mini-radius: .25rem; --mini-content-width: 70rem; }
.contactformulier { --mini-grid-min: 18rem; }
```

Themakleuren gebruiken prefix `--mini-`: `source`, `background`, `surface`, `surface-alt`, `text`, `muted`, `border`, `link`, `link-hover`, `focus`, `success`, `warning`, `error` en `info`. Elk accent (`primary`, `secondary`, `tertiary`) heeft een basiskleur, `-text`, `-hover`, `-active`, `-border`, `-hover-border` en `-active-border`. Zo kan een heldere knop zijn kleur behouden terwijl de rand herkenbaar blijft. De Pico-variabelen worden aan deze semantische variabelen gekoppeld. Andere behouden Pico-componenten blijven via hun `--pico-*`-variabelen aanpasbaar.

## Containers, grid en aside

```html
<section style="background: var(--mini-surface-alt)">
  <div class="container">Een achtergrond tot de schermrand.</div>
</section>
<div class="grid">
  <section><h2>Uitleg</h2><p>Een thematische sectie.</p></section>
  <form><!-- Velden --></form>
</div>
<main>
  <div>
    <h1>Hoofdinhoud</h1>
    <button type="button" aria-controls="filters" hidden>Filters openen</button>
  </div>
  <aside id="filters" aria-labelledby="filters-titel">
    <button type="button" class="close">Filters sluiten</button>
    <h2 id="filters-titel">Filters</h2>
    <!-- Dezelfde inhoud op desktop en mobiel -->
  </aside>
</main>
```

Gebruik één directe hoofdinhoudwrapper en één directe aside. Plaats de aside vóór de wrapper voor links, of erna voor rechts. Op mobiel volgen de lees- en toetsenbordvolgorde dezelfde documentvolgorde. Er is geen verplichte layoutklasse. Een containerquery bepaalt of de aside ernaast past. Met JavaScript controleert ResizeObserver bovendien de ingestelde minimummaten. Een smalle geneste container wordt ook op een breed scherm als smal behandeld. Alleen een aside met een gekoppelde openingsknop wordt als mobiel paneel verbeterd. Zonder opener blijft aanvullende inhoud zichtbaar in de documentstroom. Zonder JS blijft de openingsknop verborgen.

```html
<!-- Semantische basis: aside links. Verwissel de twee kinderen voor rechts. -->
<main>
  <aside><h2>Filters</h2><p>Aanvullende inhoud.</p></aside>
  <div><h1>Projecten</h1><p>Hoofdinhoud.</p></div>
</main>
```

Op desktop is de aside volledig met CSS sticky, met standaard `1rem` ruimte onder de navigatie. Een korte aside blijft volledig zichtbaar. Een lange aside wordt begrensd tot de beschikbare schermhoogte en krijgt met `overflow-y: auto` een eigen verticaal scrollgebied. Native CSS-sticky houdt hem binnen de container, zodat hij de paginafooter niet bedekt. Inhouds- en vensterhoogtewijzigingen worden vanzelf door CSS verwerkt; print toont de volledige aside in de normale documentstroom.

Sticky en intern scrollen werken ook zonder JavaScript. Er zijn hiervoor geen scrolllisteners of JavaScriptmetingen nodig. De bestaande optionele aside-module verzorgt alleen de mobiele paneelbediening en de aanvullende ruimtecontrole. `--mini-aside-gap` bepaalt de afstand tot de viewportranden. De CSS-offset is afgestemd op de standaardpaginaheader (navigatiehoogte, verticale headerpadding en rand). Gebruik bij een afwijkende of niet-sticky header een passende `--mini-aside-offset` op de container; gebruik bijvoorbeeld `0px` als er geen ruimte voor navigatie nodig is. Voeg `tabindex="0"` toe aan de aside als je het scrollgebied zelf met het toetsenbord bereikbaar wilt maken.

**Bevat de aside essentiële bediening of informatie, voeg dan een expliciet gekoppelde openingsknop én sluitknop toe.** Het framework leidt dit niet af uit de inhoud. Zonder opener mag alleen aanvullende inhoud verdwijnen. Het mobiele paneel behoudt de originele DOM-positie, krijgt een dialogrol en naam, maakt de achtergrond inert, vangt Tab en Escape af en herstelt focus na sluiten. Een asidepaneel en native modal openen niet tegelijk. Op brede schermen wordt de openingsknop verborgen.

Wanneer het paneel beschikbaar is, staat de openingsknop met CSS vast rechtsonder, boven een eventuele veilige schermrand. Hij heeft een ondoorzichtige achtergrond en blijft bereikbaar tijdens het scrollen. Bij de standaard paginalayout wordt onderaan ruimte vrijgehouden zodat de knop de footer niet bedekt. De positionering vereist geen extra JavaScript. Bij een eigen afwijkende layout met een smalle container op een breed scherm moet het project eventuele vrije ruimte onder de pagina zelf afstemmen.

Gebruik dezelfde `.grid` op een formulier of een andere wrapper. Stel de minimale kolombreedte in via `--mini-grid-min`, bijvoorbeeld `form.grid { --mini-grid-min: 14rem; }`. Zonder `.grid` blijven formuliervelden gestapeld. Het grid gebruikt `repeat(auto-fit, minmax(min(100%, var(--mini-grid-min)), 1fr))`, zodat ook een container onder de minimumbreedte niet uitrekt. Gebruik section, form, article of div volgens de inhoud. Lijsten worden niet in cards veranderd.

Tabelcellen mogen tekst tussen woorden afbreken, maar splitsen woorden niet willekeurig middenin. Zet een tabel als enig element in een gewone `div`: de regio wordt automatisch horizontaal scrollbaar zodra ononderbroken inhoud niet meer past, zonder dat de hele pagina uitrekt.

## Articles

```html
<article><h2>Gewone inhoud</h2><p>Geen card.</p></article>
<article><header><h2>Een card</h2></header><p>Inhoud.</p><footer>Voettekst.</footer></article>
<article><p>Gewone inhoud.</p><footer>Geen card.</footer></article>
```

Alleen `article:has(> header)` activeert cardstijl. Geneste headers en footers activeren de bovenliggende card niet. Een genest article behoudt zijn eigen betekenis.

## Knoppen en navigatie

```html
<button type="button">Primair</button>
<button type="button" class="secondary">Secundair</button>
<button type="button" class="tertiary">Derde accent</button>
<button type="button" class="outline">Omlijnd</button>
<button type="button" class="secondary outline">Secundair omlijnd</button>
<button type="button" class="tertiary outline">Derde accent omlijnd</button>
<a href="/projecten" class="button">Projecten</a>
<a href="/projecten" class="button secondary">Secundaire linkknop</a>
<a href="/projecten" class="button tertiary outline">Derde outline-link</a>
<button type="button" class="borderless full-width text-start">Onafhankelijke keuzes</button>
<form  action="/actie" method="post"><button type="submit">Actie</button></form>
```

Kleurmodifiers (`secondary`, `tertiary`) en uiterlijk (`outline`, `borderless`) zijn onafhankelijk combineerbaar. Een navigatielink met knopuiterlijk gebruikt `.button` gevolgd door de modifiers, ook binnen nav. De tekst en rand van outline volgen het gekozen accent; de generator berekent voor tweede en derde accenten automatisch een leesbare `--mini-secondary-outline` en `--mini-tertiary-outline`. Daarvoor zijn geen extra basisinstellingen nodig.

Een disabled link kent geen native `disabled`. Gebruik `aria-disabled="true"` en voorkom navigatie in je applicatie, of toon tekst in plaats van een link. `aria-busy="true"` behoudt de knopmaat en toegankelijke naam; buttons en links tonen een spinner, inputs een statische laadindicator. Gebruik de formuliermodule om dubbele verzending te blokkeren. Controls in een `.group` krijgen alleen ronde buitenhoeken.

```html
<header>
  <nav class="container" aria-label="Hoofdnavigatie">
    <a href="/">Project</a>
    <button type="button" aria-controls="menu" hidden>Menu</button>
    <ul id="menu">
      <li><a href="/projecten">Projecten</a></li>
      <li><a href="/login">Inloggen</a></li>
      <li><form action="/logout" method="post"><button type="submit">Afmelden</button></form></li>
    </ul>
  </nav>
</header>
```

Gebruik een echt afmeldformulier en de CSRF-bescherming van je backend. Navigatieformulieren krijgen dezelfde maat en uitlijning als links en worden nooit automatisch veldgrids. Op smalle schermen toont JS de menuknop en verbergt de links tot openen. Focus gaat naar de eerste link; Escape sluit en herstelt focus. Het menu kan verticaal scrollen. Zonder JS blijven de links zichtbaar en wordt de mobiele paginaheader statisch, zodat een lange navigatie geen ankerdoelen bedekt. De paginafooter staat onderaan een korte pagina en volgt de inhoud bij een lange pagina; hij is nooit fixed.

Elke directe `body > header` krijgt een onderlijn van `1px` in `--mini-primary`, ook zonder navigatie. Met `<header class="primary">` kies je een volledig primaire achtergrond. De generator levert de bijpassende zwarte of witte tekstkleur; tekst, gewone links, headings en focus volgen die kleur. Outline en randloos gebruiken in deze header dezelfde contrasterende tekstkleur. De nav-hoverachtergrond gebruikt de afgeleide primaire hoverkleur. De regel is beperkt tot de paginaheader en raakt cardheaders niet. De [handleiding](docs.html#paginaheader) toont beide uitvoeringen.

## Formulieren en selects

```html
<form action="/contact" method="post" class="grid" >
  <label for="naam">Naam<input id="naam" name="name" required autocomplete="name"></label>
  <div>
    <label for="email">E-mailadres<input id="email" name="email" type="email" aria-invalid="true" aria-describedby="email-hulp email-fout"></label>
    <small id="email-hulp">Gebruik je werkadres.</small>
    <small id="email-fout" class="error">Fout: vul een volledig e-mailadres in.</small>
  </div>
  <label for="soort">Soort<select id="soort" name="type"><option>Vraag</option><option>Voorstel</option></select></label>
  <div ><button type="submit">Verzenden</button></div>
</form>
```

Een label of eenvoudige div per veld is genoeg. Labels, hulpteksten en foutteksten blijven expliciet gekoppeld. `aria-invalid` is een status voor ondersteunende technologie en vervangt geen applicatievalidatie. Geef fouten ook een tekstuele aanduiding. De demo bevat bewust een foutvoorbeeld dat niet als werkelijk gevalideerd veld wordt verzonden.

De native select krijgt binnen `@supports (appearance: base-select)` een aangepaste picker. Zonder ondersteuning blijft Pico's klassieke native select bruikbaar. Gebruik `.classic` om deze fallback ook in ondersteunende browsers te tonen. Multi-select en size-listboxes blijven klassiek. Er is geen JavaScript-selectvervanger en geen afhankelijkheid van navigatiedropdowns.

## Optioneel JavaScript

Importeer alles uit `dist/minicss.js` of alleen de benodigde bestanden uit `dist/modules/` (behoud hun onderlinge relatieve imports). De editor en kleurmodule worden niet in de runtimebundel opgenomen. Initialiseer na de HTML, bijvoorbeeld met een modulescript.

| API | Gedrag |
| --- | --- |
| `init(root = document)` | Initialiseert thema, navigatie, dialogs, formulieren en asides. Bedoeld om eenmaal per pagina te draaien. Geeft `{ theme, destroyAsides }`. |
| `initTheme()` | Geeft `{ set('auto'|'light'|'dark'), mode, destroy() }`; `destroy` verwijdert de systeemlistener. |
| `initNavigation(root)` | Activeert gekoppelde mobiele menu's en meet sticky offset. |
| `initAsides(root)` | Geeft een cleanupfunctie voor paneel-/observerlisteners. |
| `initDialogs(root)` | Koppelt `button[aria-controls]` aan een native dialog met die ID. Sluiten gebruikt native dialoogformulieren. |
| `openDialog(dialog, opener?)` | Gebruikt `showModal()`, geeft `false` als er al een modal/paneel open is. |
| `closeDialog(dialog, returnValue?)` | Sluit en herstelt focus naar de opener. |
| `initForms(root)` | Beschermt POST-formulieren, ook later toegevoegde formulieren, zonder extra HTML-markeringen. GET en native dialoogsluiting blijven vrij. |
| `setProcessing(form, boolean)` | Zet/herstelt laadstatus; roep `false` aan bij elk afgerond applicatieresultaat, ook bij fouten. |
| `createNotifier(root = document.body)` | Geeft `{ notify, destroy }`; plaats hem voor conditional styling binnen de wrapper. |
| `notify(text, { variant='info', duration=5000 })` | Geeft `{ element, close() }`. Varianten: `success`, `info`, `warning`, `error`. `duration: 0` blijft staan. Tekst wordt veilig als tekst ingevoegd. |

`initTheme` bewaart alleen een expliciete keuze onder `minicss-theme`. Automatisch verwijdert de voorkeur en volgt de systeemwijzigingen via CSS; `mini:theme` op het root-element bevat `{ mode, resolved }`. Geblokkeerde opslag verhindert de bediening niet. Gebruik een gelabelde select met `name="theme"`.

De formuliermodule is optioneel. Initialiseer haar alleen wanneer je de POST-bescherming wilt gebruiken; `initForms(container)` begrenst dit tot een gedeelte van de pagina. Knoppen die zonder JavaScript niet bruikbaar zijn, kunnen native `hidden` krijgen; de module toont ze na succesvolle koppeling. Onbekende `aria-controls`-doelen worden niet verborgen.

Voor AJAX-formulieren: initialiseer minicss vóór je applicatie-submitlistener, voorkom daarin de native verzending en herstel de status in `finally`. De module houdt de native submitterwaarde beschikbaar: submitknoppen krijgen `aria-disabled`, geen HTML-disabled. Verdere submit-events en klikken tijdens verwerking worden geblokkeerd. Een reset en terugkeer via de browser herstellen de bediening. Sluitknoppen met `formmethod="dialog"` blijven ook tijdens een POST bruikbaar. De module maakt geen netwerkverzoek en beslist niet over slagen, wissen of sluiten.

```js
import { initForms, setProcessing } from '/assets/minicss/minicss.js';
initForms();
form.addEventListener('submit', async event => {
  if (event.submitter?.getAttribute('formmethod') === 'dialog') return;
  event.preventDefault();
  try {
    const body = new FormData(form, event.submitter);
    const response = await fetch(form.action, { method: 'POST', body });
    if (!response.ok) throw new Error('Opslaan mislukt');
    // Toon het applicatieresultaat en werk de inhoud bij.
  } finally { setProcessing(form, false); }
});
```

### Modals

```html
<button type="button" aria-controls="bewerken" hidden>Bewerken</button>
<dialog id="bewerken" aria-labelledby="bewerk-titel">
  <header>
    <h2 id="bewerk-titel">Gegevens bewerken</h2>
    <form method="dialog"><button>Sluiten</button></form>
  </header>
  <form action="/opslaan" method="post">
    <label>Naam<input name="name" required autofocus></label>
    <div>
      <button type="submit">Opslaan</button>
      <button formmethod="dialog" formnovalidate>Annuleren</button>
    </div>
  </form>
</dialog>
```

Geef iedere dialog een naam via `aria-labelledby` of `aria-label`; kies autofocus passend bij de taak. Native focusbegrenzing en Escape blijven intact. Alleen de sluit-/annuleerknop of de applicatie sluit de modal; buiten klikken sluit niet. Gebruik geen `method="dialog"` voor formulieren die eerst applicatieverwerking vereisen. Lange inhoud scrollt in de modal; documentscroll wordt tijdelijk geblokkeerd. Geen gestapelde modals. Voor blijvende resultaatmodals gebruik je dezelfde structuur met een statusklasse (`success`, `info`, `warning` of `error`) en een titel die de status ook in woorden benoemt.

### Meldingen

```js
import { createNotifier } from '/assets/minicss/minicss.js';
const { notify } = createNotifier();
notify('Je wijziging is opgeslagen.', { variant: 'success', duration: 5000 });
```

Meldingen staan linksboven onder de sticky nav, nemen geen focus over en verschuiven geen paginainhoud. Iedere timer is onafhankelijk en pauzeert bij hover en focus, ook wanneer die tegelijk optreden. Verwijderen laat lagere meldingen omhoog schuiven; reduced-motion schakelt deze animatie uit. Een aparte beleefde live region kondigt nieuwe meldingen eenmaal aan. De zichtbare melding is geen tweede live region. Gebruik tijdelijke meldingen nooit voor noodzakelijke acties of als enige vindplaats van cruciale feedback. Vereiste keuzes of bevestigingen horen in een blijvende native dialog. Als de verwijderde melding focus had, gaat die naar een resterende sluitknop of terug naar het element dat focus had bij het openen. Dit gebeurt met behoud van de scrollpositie.

## Thema-editor en contrast

Het standaardpalet volgt [AI in het onderwijs](https://aiinhetonderwijs.be/): primair `#30476f`, tweede accent `#354783`, lichte achtergrond `#f6f7f6` en lichte tekst `#182e46`. Donker en afgeleide kleuren worden berekend. De gedeelde configuratie `DEFAULT_THEME` in `src/js/colors.js` wordt gebruikt door de build en de editor; `generateTheme()` zonder argument gebruikt dit palet.

`theme.html` is een afzonderlijke ontwikkeltool. Het wiel heeft 24 vaste tinten en vijf intensiteitsniveaus, waarvan het binnenste niveau neutraal is. Elke tint gebruikt zijn beschikbare sRGB-chroma, zodat buitenste ringen niet allemaal dezelfde afgekapte kleur tonen. De lichtheidsschuif blijft vrij instelbaar. De schuiven en exacte hexinvoer zijn niet tot de wielvlakken beperkt; dit is geen klassiek websafe-palet van 216 kleuren.

De bronkleur blijft ongewijzigd in `--mini-source`. De primaire knopachtergrond is in licht én donker exact dezelfde gekozen sRGB-kleur (`--mini-primary`), zonder vaste verdonkering of verbleking. De generator kiest zwarte of witte tekst en leidt leesbare hover-/active-kleuren af. Links en focus krijgen hun eigen contrastcorrectie. Waar de accentvulling niet genoeg afsteekt tegen de omgeving, levert een aparte rand de benodigde herkenning. Ook het vinkje van een checkbox past zich aan de tekstkleur op de accentvulling aan.

De basisinstellingen zijn een primaire kleur, optionele onafhankelijke tweede en derde accenten, en optionele achtergrond- en tekstkleuren voor licht en donker. Extra accenten behouden hun exacte hexkleur wanneer je primair verandert. De hoekschuiven onder **Kleur voorstellen** zijn alleen een hulpmiddel: een voorstel wordt pas toegepast met **Gebruik voorstel**. Het derde accent staat aanvankelijk uit. Het wiel en de neutralentint staan onder **Primair verfijnen**.

Hover, active, knoptekst, links, focus, randen en oppervlakken worden automatisch afgeleid. **Geavanceerde kleuren** staat standaard dicht en bevat uitzonderingen per variabele. Je beheert dus slechts de basiskleuren; de CSS-export bevat nog steeds alle afgeleide variabelen. Statuskleuren worden onafhankelijk van de merkhue gegenereerd. De controle toetst de geregistreerde tekst- en randcombinaties; verschillende accenten hebben onderling geen gegarandeerd contrast.

```js
import { generateTheme, exportTheme } from './dist/modules/colors.js';
const themes = generateTheme({
  source: '#173748', secondary: '#bd9656', tertiary: null,
  background: { light: '#f5f7f8' }, text: { light: '#172c3b' },
});
const css = exportTheme(themes);
```

`secondary` en `tertiary` accepteren een ondoorzichtige hexkleur; `null` gebruikt de primaire kleur. Zonder deze opties blijven de bestaande `accent`/`accent3`-hoeken werken. `background` en `text` accepteren `{ light, dark }`; ontbrekende modi blijven automatisch. Een losse hexstring geldt alleen voor licht. Expliciete tekstkleuren blijven exact bewaard; onvoldoende contrast wordt gemeld. Achtergrondkleuren bepalen ook de afgeleide oppervlakken.

`src/js/colors.js` converteert via OKLab/OKLCH. Afgeleide kleuren buiten sRGB verliezen via binaire zoekactie chroma bij behoud van lichtheid en tint. Export gebruikt afgeronde, ondoorzichtige sRGB-hexkleuren voor voorspelbaar browsercontrast. Licht en donker hebben eigen oppervlakken, leesbare links en randen, met behoud van de gekozen primaire accentvulling. Een willekeurige bronkleur bootst niet automatisch een complete handmatig samengestelde Pico-kleurreeks na; een ingevoerde Pico-accentkleur blijft wel exact die knopkleur.

De controle gebruikt WCAG relatieve sRGB-luminantie na alpha-compositing, op de uiteindelijk geëxporteerde kleuren. De standaardtokens zijn ondoorzichtig; de afzonderlijke contrastfunctie ondersteunt ook `#RRGGBBAA` en RGB(A)-arrays met kanaalwaarden 0–1. De editor controleert gewone tekst, secundaire tekst, links en hover, knoptekst op interactiestaten, controlegrenzen, focus en statuskleuren op de geregistreerde oppervlakken. Alle gegenereerde tekst wordt aan de strengere 4,5:1-grens getoetst, ook wanneer de tekst groot genoeg is voor 3:1. Noodzakelijke niet-tekstuele grenzen vragen 3:1. De lijst staat expliciet in de kleurmodule (`checks`) en verschijnt in de editor.

Handmatige tokenwijzigingen blijven behouden wanneer je de bronkleur verder aanpast. Ze worden niet stilzwijgend gecorrigeerd: onopgeloste fouten verschijnen duidelijk boven de controlelijst. Wis correcties om weer volledig gegenereerde kleuren te gebruiken. Kopieer/download de CSS en laad hem na minicss; de export bevat automatisch donker plus expliciete lichte/donkere selectors.

De controle is **geen volledige toegankelijkheidsaudit**. Eigen combinaties, beelden, externe widgets, halfdoorzichtige projectkleuren, disabled controls, behouden extra Pico-componenten en gewijzigde tokens moet je ook in hun werkelijke context controleren. De contrastfunctie berekent transparantie alleen voor de expliciet aangeleverde lagen; hij leest geen willekeurige browsercompositing, achtergronden of blend-modes uit.

## Buildconfiguratie

`build.config.mjs` is de enige bron voor expliciete querygrenzen: navigatie `48rem` en aside `64rem`. De build vervangt deze in media-/containerqueries en schrijft `dist/breakpoints.json`. Runtimevariabelen bepalen maten binnen de layout; ze kunnen geen querygrenzen vervangen. CSS ondersteunt geen `var()` als grens van deze groottequeries. Na wijziging van breekpunten of wrapper bouw je alle varianten opnieuw. De normale pagina heeft geen containerklasse nodig. De wrapperinstelling betreft alleen de scoped CSS-export; plaats de geinitialiseerde bediening binnen dezelfde documentcontext.

`scripts/build.mjs` verwerkt selectors met PostCSS en een selector-AST, bundelt/minificeert met esbuild en bewaart licentievermeldingen. Bewerk nooit handmatig de gegenereerde `dist/`-bestanden. Productiegebruik vereist geen Node, Sass, editor of package manager.

## Browserondersteuning en toegankelijkheid

Gericht op moderne browsers met CSS-lagen, `:has()`, containerqueries, native dialog, inert, ResizeObserver en ES-modules. Concrete oudere browserminima zijn niet door een volledige versie-/apparaattest vastgesteld. De selectpicker is een progressieve verbetering met `@supports`; zie de [MDN-documentatie voor ::picker(select)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::picker). De vastgelegde basis is [Pico CSS 2.1.1](https://picocss.com/docs/version-picker).

Zichtbare focus, leesbare fouttekst, native controls, scrollbare tabellen/code, tekstafbreking, printregels, reduced-motion en forced-colors zijn voorzien. Zet een tabel als enig element in een gewone `div` met een naam en `tabindex="0"` als de scrollregio met het toetsenbord bereikbaar moet zijn. Print verbergt navigatie, tijdelijke meldingen, dialogs en overbodige bediening; asides blijven leesbaar. `data-print-hide` verbergt projectbediening bij print. Pas de semantiek en formuliertaal aan je eigen applicatie aan.

## Verificatie

```sh
npm run build
npm test
npx playwright install
npm run test:browser
```

Node-tests controleren WCAG-referentiewaarden, alpha-compositing, OKLCH-conversie, gamutmapping, een matrix van bronkleuren/tint/accent, handmatige fouten, pauzeerbare timers en uitvoervarianten. Playwright controleert de werkelijke interacties en responsive opmaak. Zie **[TESTING.md](TESTING.md)** voor de daadwerkelijk uitgevoerde controles en beperkingen. `node scripts/capture.mjs` maakt Chromium-screenshots als de lokale server draait.

De demo-POST-routes bevestigen alleen ontvangst en bewaren geen gegevens. Accountbeheer, CSRF, servervalidatie en echte opslag horen in het gebruikende project.

## Licentie

MIT voor minicss en de afgeleide Pico-code. Bewaar `LICENSE`, `LICENSE.pico` en de banners bij hergebruik. Upstream Pico heeft zijn eigen copyrightvermelding; de build kopieert de oorspronkelijke licentie ongewijzigd.
