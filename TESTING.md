# Verificatie minicss 0.1.0

Uitgevoerd op 8 november 2026, Windows, Node.js 24.21.0, Playwright 1.61.1.

## Resultaten

Na uitbreiding van de installatie-instructies: **9 gerichte browsertests geslaagd** in Chromium, Firefox en WebKit. De volledige installatiefragmenten worden als broncode getoond en niet in de voorbeeldframes uitgevoerd. Bestaande elementvoorbeelden, mobiele breedte, 200% tekstvergroting en minimale markup blijven gecontroleerd. De volledige suite is voor deze documentatiewijziging niet opnieuw uitgevoerd.

Na de combineerbare knopmodifiers en primaire paginaheader: build geslaagd, **14 moduletests** en de volledige set van **123 browsertests geslaagd** (41 scenario's per engine). De nieuwe tests controleren primaire, secundaire en tertiaire outline op buttons, inputacties en linkknoppen, ook binnen nav, in licht/donker en de gewone/scoped minificaties. Default, hover, active en focus houden de gekozen accentkleur, met minimaal 4,5:1 voor tekst en 3:1 voor randen. De headercontrole test een primaire onderlijn met en zonder nav, een primaire achtergrond met contrasterende tekst/links/focus bij donkerblauw en helder geel, en ongewijzigde cardheaders.

## Eerdere controles

- Na uitbreiding van de handleiding met zichtbare voorbeelden: **9 gerichte browsertests geslaagd** in Chromium, Firefox en WebKit. Gecontroleerd: echte frameworkweergave in afzonderlijke documenten, het verschil met demo-opmaak, formulierfeedback zonder verzending, native details en dialogen, openen als aparte pagina, mobiele breedte, 200% tekstvergroting en opruimen van preview-observers bij verwijdering. De volledige suite is voor deze documentatiewijziging niet opnieuw uitgevoerd.

- `npm run build`: semantische basisstylesheet en optionele scoped export, beide leesbaar en geminificeerd, plus runtimebundel, losse modules, themaloader en licenties gebouwd. De oude strict-classless- en fluid-classless-bestanden worden verwijderd bij de build.
- `npm test`: **14 tests geslaagd** na de definitieve build.
- Volledige browserrun na de semantische vereenvoudiging: **111 tests geslaagd**, 37 scenario's in elk van Chromium 149.0.7827.55, Firefox 151.0 en WebKit 26.5.
- Na de laatste aanpassingen aan native hidden en scoped asides: **21 gerichte tests geslaagd**, inclusief een nieuwe controle dat onbekende aria-controls-doelen zichtbaar blijven en een ingebedde aside zonder containerklasse als paneel kan werken.
- Na verwijdering van de demoformulier- en statushaken: **15 gerichte tests geslaagd** voor native verzending zonder JS, dubbele POST, applicatieverwerking en native dialoogannulering.
- Na de laatste opschoning van de dialoogmarkering en printselector: **9 gerichte tests geslaagd** voor dialogen, annuleren tijdens verwerking, selectfallback, reduced-motion en print in alle drie engines. De volledige suite is na deze laatste gerichte wijzigingen niet opnieuw uitgevoerd.
- Desktop- en mobiele screenshots van demo en editor zijn visueel gecontroleerd. De aangepaste linkknoppen behouden hun linkrol, asides volgen de documentvolgorde en er is geen extra sticky-scroll-JavaScript toegevoegd.

Firefox vereist in deze omgeving normale browserprocessen buiten de beperkte sandbox. De browsercontroles zijn met die uitvoerrechten uitgevoerd. De testconfig start de lokale server automatisch of gebruikt een bestaande server.

## Specifieke controles voor minimale HTML

- Automatische paginalandmarks, instelbare volle breedte en scoped isolatie.
- Geen dubbele frameworkhaken in de geschreven demo-, editor- of handleidingmarkup.
- Geen extra formuliermarker voor POST-bescherming; ook dynamische formulieren worden beschermd. GET-formulieren blijven vrij. Herhaald initialiseren verdubbelt de behandeling niet.
- De submitternaam en -waarde blijven beschikbaar in FormData. Herstel gebeurt via setProcessing, reset of pageshow.
- Native method=dialog en formmethod=dialog sluiten zonder onnodige validatie en blijven tijdens een lopende POST bruikbaar. Focus keert terug naar de opener.
- Links/rechts geplaatste asides krijgen de resterende inhoudsbreedte; lange asides kunnen intern scrollen. Op smalle schermen blijven ze zonder paneelopener zichtbaar in documentvolgorde.
- Een gewone wrapper met alleen een tabel krijgt horizontaal scrollgedrag zonder overflowklasse of data-attribuut.

## Automatisch gecontroleerd

### CSS en layout

- Breedtes 1440, 768, 390 en 320 CSS-pixels; geen documentbrede overflow in demo en editor.
- Lichte en donkere systeemvoorkeur; rootlettergrootte blijft 16px bij standaard browserinstelling, ook op desktop.
- Alleen een directe articleheader activeert een card. Footer-only en geneste headers blijven neutraal.
- Link en echte submitknop in de navigatie hebben dezelfde hoogte.
- De samengestelde zoekbediening houdt de knoptekst op één regel bij 1440, 390 en 320px. Het invoerveld krimpt binnen de beschikbare ruimte.
- Een smalle geneste container verbergt de optionele aside ook op een breed scherm.
- Classless-landmarks hebben de juiste maximale breedte; de fluidvariant heeft geen maximale breedte. Data-grid en data-variant werken zonder klassen.
- Conditional CSS geeft externe hostelementen geen minicss-tokens of controlmaten, ook wanneer de host zelf een data-theme heeft.
- Korte pagina's plaatsen de footer onderaan; langere inhoud kan normaal doorlopen.
- De handleiding blijft binnen de viewport bij 200% CSS-tekstvergroting op een 390px-viewport.
- Printemulatie verbergt navigatie en toont de aanvullende aside.
- Reduced-motion beperkt de spinneranimatie en schakelt stapelbeweging uit.
- Forced-colors-emulatie in Chromium behoudt controlranden en zichtbare focus.

### JavaScript

- Mobiele navigatie opent, focust de eerste link, sluit met Escape en herstelt focus; resize toont desktoplinks. Een lang menu kan binnen de viewport scrollen.
- Hetzelfde aside-element opent als mobiel paneel; achtergrond wordt inert; Tab blijft binnen het paneel; Escape sluit en focus keert terug. Desktopresize herstelt de gewone aside.
- Native dialog opent met passende autofocus, valideert verplichte invoer, blokkeert stapelen en sluit niet bij buiten klikken. Een afgeronde formulieractie laat de modal open. Escape sluit, herstelt focus en heft scrollblokkering op.
- Dubbele verzending tijdens verwerking wordt geblokkeerd; de spinner verandert de knopafmetingen niet. Afronding herstelt aria-busy en aria-disabled.
- Meldingen worden onderaan toegevoegd, hebben onafhankelijke timers en pauzeren bij gelijktijdige hover en focus. Sluiten verwijdert alleen de betrokken melding. Een echte compositoranimatie verplaatst de resterende stapel omhoog.
- Een aanvullende regressietest klikt de echte succesknop en controleert automatisch sluiten na de standaard vijf seconden, zonder gesimuleerde klok. Ook pauzeren en hervatten bij hover wordt met echte browsertimers gecontroleerd. Deze test ontdekte en verifieert de correctie van een onjuiste native setTimeout-aanroep die door de eerdere kloksimulatie verborgen bleef.
- Thema's ondersteunen expliciet licht/donker, persistentie na herladen en terugkeren naar automatisch. Een gewijzigde systeemvoorkeur werkt door. Geblokkeerde lokale opslag verhindert de bediening niet.
- Zonder JavaScript blijven navigatie en beide asides zichtbaar. Het echte afmeldformulier verzendt een POST naar de demonstratiebackend.
- Klassieke en verbeterde native selects blijven met native selectie bedienbaar. In iedere engine wordt base-select-ondersteuning gedetecteerd. De klassieke route is expliciet getest met data-select-classic; de andere select kiest via @supports de beschikbare browserroute.
- De thema-editor verwerkt hexinvoer, toetsenbordschuiven, onafhankelijke previews, handmatige fouten en reset. De CSS-export bevat de bronkleur en kan worden gedownload.
- Demo, editor en handleiding veroorzaken in de geteste scenario's geen ongehanteerde paginafouten.

### Kleur en contrast

- Bekende WCAG-referentiewaarden: zwart/wit 21:1, identieke kleuren 1:1 en grijs #777 op wit circa 4,478:1.
- Alpha-compositing van voorgrond en achtergrond, inclusief een expliciete canvasachtergrond.
- RGB → OKLCH → sRGB-roundtrips en chromareductie bij kleuren buiten sRGB.
- Een matrix van 10 bronkleuren, 3 neutralentinten en 4 accentinstellingen: 120 configuraties, elk met een licht en donker thema. Alle 70 geregistreerde kleurparen per thema voldoen na afronding naar de geëxporteerde hexkleuren. Afzonderlijke tests controleren exacte Pico-accentcodes, zwarte/witte knoptekst, de derde accenthoek, onafhankelijke neutralentint en het stapsgewijze kleurenwiel.
- Handmatige onleesbare tokenwijzigingen worden als onvoldoende gemeld.
- De geminificeerde stylesheet is daadwerkelijk gerenderd in alle drie browserengines. De uiteindelijke computed kleuren van tekst, links, labels, inputtekst, placeholders, cardtekst, footertekst en knoptekst in beide previews voldoen aan 4,5:1. Inputranden voldoen aan 3:1. Transparante achtergrondlagen worden bij die controle samengesteld.

## Visueel bekeken

Chromium-screenshots van de demo op desktop in licht en donker, de mobiele demo en de desktopeditor zijn bekeken. De mobiele editor is ook gerenderd en vastgelegd. De captures kunnen opnieuw worden gemaakt met `node scripts/capture.mjs` terwijl de server draait; ze staan onder de genegeerde map `test-results/screenshots/`.

## Niet als uitgevoerd geclaimd

- Geen handmatige screenreadersessie met NVDA, JAWS of VoiceOver; live-regiongedrag is geïmplementeerd maar niet door een screenreadergebruiker beoordeeld.
- Geen echte iOS-/Android-apparaten en geen handmatige browserzoom via browserbediening. Responsive viewports en 200% CSS-tekstvergroting vervangen die controles niet volledig.
- Geen volledige WCAG-audit, HTML-conformiteitscertificering of inventarisatie van alle ondersteunde oudere browserversies.
- Geen echte sessie-, account-, servervalidatie-, CSRF- of opslagbackend. De ontwikkelserver bevestigt demo-POSTs zonder gegevens te bewaren.
- Geen algemene contrastgarantie voor eigen project-CSS, externe widgets, afbeeldingen, behouden extra Pico-componenten, disabled states of onbekende achtergrondlagen.
- De kopieerknop heeft een selecteerbare tekstfallback wanneer de Clipboard API ontbreekt of toestemming weigert. De automatische test controleert CSS-export en downloaden; verschillende besturingssysteemklemborden zijn niet afzonderlijk getest.

## Opnieuw uitvoeren

```sh
npm ci
npm run build
npm test
npx playwright install
npm run test:browser
```

Gebruik `npm.cmd`/`npx.cmd` als PowerShell de gelijknamige scripts blokkeert. De Playwright-config start de lokale ontwikkelserver automatisch wanneer die nog niet draait. Geef browserprocessen de vereiste lokale uitvoerrechten als de sandbox ze verhindert.
