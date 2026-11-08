Bouw een compact, herbruikbaar CSS-framework op basis van Pico CSS v2.1.1. Het doel is duidelijke, functionele interfaces met semantische HTML, voorspelbare standaardopmaak en weinig verplichte klassen.

Inspecteer eerst de workspace en eventuele AGENTS.md-instructies. Geef een beknopt implementatieplan en bouw daarna een eerste werkende versie, met demonstratiepagina en documentatie.

## Afgesproken vereenvoudiging (8 november 2026)

Deze afspraken vervangen tegenstrijdige details hieronder:

- Een semantische basisstylesheet, met minimale expliciete uitzonderingen zoals `.grid` en knopvarianten. Geen aparte strict-classless- of fluid-classless-uitvoer; een scoped export blijft beschikbaar voor inbedding.
- Paginalandmarks krijgen automatisch breedte en zijruimte. Volledige breedte en gridkolommen worden met CSS-variabelen ingesteld.
- Geen dubbele data-opmaakhaken voor klassen. Native HTML- en toegankelijkheidsattributen behouden hun functionele betekenis.
- Een aside staat links of rechts volgens zijn documentvolgorde. Sticky en interne scroll blijven uitsluitend CSS. Zonder gekoppelde opener blijft de inhoud zichtbaar, ook met JavaScript.
- Menu-, aside- en dialoogopeners gebruiken aria-controls. Native hidden kan een JS-afhankelijke knop verbergen totdat de module klaar is. Native dialoogformulieren verzorgen sluiten en annuleren.
- De optionele formuliermodule beschermt POST-formulieren automatisch, ook dynamische formulieren. GET en native dialoogsluiting worden niet onderschept. Geen submit-ready-attribuut.
- De keuze voor secundair, derde accent, outline en randloos blijft expliciet via eenvoudige klassen. Gewone elementen vragen geen klasse.
- Kleur- en uiterlijkmodifiers zijn combineerbaar. Linkknoppen gebruiken `class="button"` gevolgd door hun modifiers. De gewone paginaheader krijgt een primaire onderlijn; `header.primary` kiest een volledig primaire achtergrond met passende contrasterende tekst en navigatie.

## Technische basis

- Gebruik gewone moderne CSS en CSS-variabelen, zonder Sass.
- Een kleine buildstap is toegestaan voor bundeling, minificatie, uitvoervarianten en centraal ingestelde breekpunten.
- Onderhoud één gedeelde bron; genereer varianten zonder handmatig onderhouden kopieën.
- Gebruik Pico als concrete basis. Behoud bruikbare functionaliteit buiten de hieronder beschreven wijzigingen.
- Bewaar vereiste licentievermeldingen en geef het afgeleide framework een eigen naam.
- Basisopmaak werkt zonder JavaScript. Lever kleine, optionele vanilla-JavaScriptmodules voor interacties.
- Houd specificiteit laag en maak projectaanpassingen eenvoudig.

## Schaal en variabelen

- Basislettergrootte is 100%, zonder automatische vergroting op grotere schermen.
- Tekstgroottes, afstanden, contentbreedtes en bedieningselementen zijn afzonderlijk instelbaar.
- Gebruik rem waar passend, aangevuld met onder andere em, %, fr, ch en px.
- Eén algemene CSS-variabele bepaalt de afronding.
- Bewust ronde elementen blijven rond.
- Samengestelde controls krijgen alleen afronding aan de buitenhoeken.

## Knoppen en navigatieacties

- Buttons, submit-inputs en links met knopopmaak delen dezelfde maatvoering, uitlijning en visuele varianten.
- Een submitknop in een navigatieformulier krijgt hetzelfde uiterlijk en dezelfde uitlijning als gewone navigatielinks.
- Behoud juiste HTML-semantiek: links voor navigatie, buttons voor acties, een echt formulier voor afmelden.
- Navigatieformulieren veroorzaken geen extra marge, breedte of afwijkende uitlijning.
- Randloos, volle breedte en tekstuitlijning zijn onafhankelijke keuzes.
- Voorzie consistente hover-, focus-, active- en disabled-toestanden waar van toepassing.
- Voorzie een laadstatus zonder verspringen en een manier om dubbele verzending tijdens verwerking te blokkeren.

## Articles en cards

- Een article zonder directe header krijgt geen bijkomende card-opmaak: geen achtergrond, rand, schaduw of extra padding.
- Alleen een directe header activeert automatisch card-opmaak, bijvoorbeeld via `article:has(> header)`.
- Een directe footer alleen activeert geen card-opmaak.
- Binnen een card krijgt een eventuele directe footer bijpassende opmaak.
- Geneste headers en footers mogen de card-opmaak van een bovenliggend article niet activeren.
- Gebruik een rustige cardstijl met beperkte decoratie.
- Neem geen specifieke accordeoncomponent op. Native details/summary blijft bruikbaar.
- Verplicht geen structuur met ul > li > article. Gewone lijsten blijven onaangeroerd.

## Containers en grid

- `.container`: gecentreerde inhoud met instelbare maximale breedte en zijruimte.
- `.container-fluid`: volledige beschikbare breedte met instelbare zijruimte.
- Rand-tot-rand achtergronden kunnen op een buitenste element staan met een container erin.
- Vervang Pico’s grid door intrinsiek responsief CSS Grid: zoveel kolommen als passen.
- Minimale kolombreedte en tussenruimte zijn CSS-variabelen.
- Voorkom overflow wanneer de container smaller is dan de ingestelde minimale kolombreedte.
- `.grid` werkt op verschillende containers en verdeelt directe kinderen, ongeacht hun elementtype.
- Gebruik semantische elementen volgens hun inhoud: section voor een thematische sectie, form voor een formulier, article voor zelfstandige inhoud en div voor neutrale layout.
- Een uitlegsectie en een formulier kunnen rechtstreeks naast elkaar in een grid staan.
- Gebruik containerqueries waar componenten op hun eigen beschikbare ruimte moeten reageren.
- Gebruik geen `var()` als grens in media- of groottecontainerqueries.
- Genereer benodigde expliciete breekpunten uit één centrale buildconfiguratie, zonder Sass. Documenteer het verschil met runtime-CSS-variabelen.

## Rechter aside

- Een direct aside binnen `.container` of `.container-fluid` activeert automatisch een zijbalklayout, zonder verplichte layoutklasse.
- Hoofdinhoud staat links, aside rechts.
- HTML-volgorde: eerst hoofdinhoud, daarna aside.
- Sidebarbreedte, minimale hoofdinhoudbreedte en tussenruimte zijn instelbaar.
- Bij onvoldoende ruimte wordt de aside standaard verborgen wanneer JavaScript beschikbaar is.
- Voorzie een expliciet gekoppelde openingsknop wanneer de aside essentiële bediening bevat.
- Op brede schermen is deze knop verborgen en staat de aside rechts.
- Op smalle schermen opent de knop dezelfde aside-inhoud als toegankelijk paneel, met sluitknop, Escape-afhandeling en passende focusafhandeling.
- Na sluiten keert focus terug naar de openingsknop.
- Houd de inhoud één keer in de HTML; maak geen aparte desktop- en mobiele kopieën.
- Verborgen inhoud mag geen toetsenbordfocus krijgen.
- Het framework bepaalt niet automatisch of inhoud essentieel is; documenteer wanneer een openingsknop nodig is.
- Zonder JavaScript blijft de aside onder de hoofdinhoud zichtbaar.

## Formulieren

- Formulierbreedte is standaard 100%, via een CSS-variabele aanpasbaar.
- Voorzie een eenvoudige, expliciet te activeren formuliergrid met automatisch passende kolommen.
- Velden vullen hun kolom. Geen aparte breedteklassen voor postcode, naam enzovoort.
- Navigatieformulieren en compacte actieformulieren worden niet automatisch formuliergrids.
- Houd benodigde veldwrappers eenvoudig en documenteer de structuur.
- Voorzie consistente labels, hulpteksten en validatiefouten.
- Koppel hulpteksten en fouten via passende HTML-attributen, zoals `aria-describedby` en `aria-invalid`.
- Geef fouten nooit uitsluitend met kleur aan.

## Selectvelden

- Gebruik native select als basis.
- Voeg aanpasbare select-opmaak toe via `appearance: base-select` en `::picker(select)` waar ondersteund.
- Detecteer ondersteuning met `@supports`, zonder browserdetectie.
- Niet-ondersteunende browsers behouden een bruikbare klassieke select.
- Behoud labels, native formulierwerking en toetsenbordbediening.
- Gebruik geen JavaScript-vervanger voor de native select.
- Deze selectpicker staat los van eventuele navigatiedropdowns.

## Kleuren en thema-editor

Bouw een afzonderlijke ontwikkel- en demonstratiepagina voor thema-instellingen:

- Basiskleur via een kleurenwiel voor tint en intensiteit/chroma, plus een lichtheidsschuif.
- Ondersteun ook invoer van een exacte kleurcode.
- Optionele instelling voor de hoeveelheid basiskleur in neutrale achtergronden, tekst en randen.
- Optionele tweede accentkleur via een instelbare hoek ten opzichte van de basiskleur.
- Geen uitgebreide bibliotheek met vooraf ingestelde paletten.
- Succes-, waarschuwings-, fout- en informatiekleuren blijven onafhankelijk van de merkkleuren.
- Gebruik bij voorkeur OKLCH voor kleurgeneratie, met correcte verwerking van kleuren buiten het beschikbare kleurbereik.
- Genereer semantische variabelen voor achtergronden, oppervlakken, tekst, secundaire tekst, randen, links, knoppen en interactietoestanden.
- Genereer afzonderlijk een samenhangend licht en donker thema; donker is geen simpele kleurinversie.
- Controleer relevante uiteindelijke kleurcombinaties automatisch op WCAG AA:
  - Gewone tekst minstens 4,5:1.
  - Grote tekst minstens 3:1.
  - Noodzakelijke niet-tekstuele herkenningskenmerken minstens 3:1 tegenover aangrenzende kleuren.
- Bereken contrast op de uiteindelijke weergegeven kleuren, inclusief transparantie waar van toepassing.
- Corrigeer afgeleide kleuren automatisch. Bewaar de gekozen basiskleur als bronkleur.
- Laat handmatige correcties toe met onmiddellijke hercontrole.
- Toon onopgeloste contrastproblemen duidelijk; contrastcontrole garandeert geen volledige toegankelijkheid.
- Toon licht en donker naast elkaar.
- Exporteer de gegenereerde CSS-variabelen.
- De editor is geen runtime-afhankelijkheid voor websites die het framework gebruiken.

## Uitvoervarianten

Genereer vanuit dezelfde bron:

- Standaardversie met component- en layoutklassen.
- Classless-versie met semantische containers.
- Fluid classless-versie.
- Conditional styling binnen een eigen wrapper.

Documenteer welke mogelijkheden in elke variant beschikbaar zijn en welke minimale globale basisregels eventueel blijven gelden.

## Licht/donker-JavaScript

- Ondersteun automatisch, licht en donker.
- Automatisch volgt de systeemvoorkeur, ook wanneer deze verandert.
- Voorzie een toegankelijke bediening om de stand te wijzigen.
- Bewaar een expliciete keuze lokaal en maak terugkeren naar automatisch mogelijk.
- Pas de voorkeur vroeg toe om een verkeerde themaflits te voorkomen.
- Blijf functioneren wanneer lokale opslag niet beschikbaar is.

## Navigatie en footer

- Navigatie is standaard sticky bovenaan, uitschakelbaar per project.
- Op kleine schermen klapt de navigatie in tot een hamburgermenu.
- Gebruik een echte knop met `aria-expanded` en `aria-controls`.
- Ondersteun Escape en correcte focuswerking.
- Zonder JavaScript blijven navigatielinks bereikbaar.
- Een lang geopend mobiel menu kan scrollen.
- Ankerdoelen en gefocuste elementen verdwijnen niet achter de sticky navigatie.
- De paginafooter staat bij korte pagina’s onderaan het scherm en bij lange pagina’s na de inhoud.
- De footer is niet fixed en bedekt geen inhoud.

## Modals

- Gebruik native dialog met `showModal()`.
- Openingsknoppen verwijzen eenvoudig naar hun dialoogvenster.
- Modals staan gecentreerd met een gedimde en vervaagde backdrop.
- Geef elk dialoogvenster een toegankelijke naam.
- Ondersteun sluiten via sluitknop, annuleren en Escape.
- Klikken buiten de modal sluit deze standaard niet.
- Plaats focus passend en herstel die na sluiten bij de opener.
- Blokkeer achtergrondscroll; lange modalinhoud kan zelf scrollen.
- Ondersteun meerdere dialoogvensters per pagina, zonder gestapelde modals.
- Sluit formulieren niet automatisch bij verzenden: validatie en applicatieresultaat bepalen het gedrag.

## Resultaatmeldingen

- Ondersteun succes, informatie, waarschuwing en fout, herkenbaar zonder uitsluitend kleur.
- Niet-blokkerende meldingen verschijnen linksboven, onder de aanwezige navigatie.
- Ze verschuiven de paginalayout niet en nemen geen focus over.
- Nieuwe meldingen verschijnen onderaan de stapel.
- Elke melding verdwijnt standaard na 5 seconden; de duur is instelbaar.
- Voorzie een toegankelijke sluitknop.
- Pauzeer de timer bij hover of toetsenbordfocus.
- Wanneer een melding verdwijnt, schuiven de meldingen eronder soepel omhoog.
- Respecteer `prefers-reduced-motion`.
- Gebruik passende live regions zonder onnodige herhaalde aankondigingen.
- Automatisch verdwijnende meldingen bevatten geen noodzakelijke acties.
- Meldingen die bevestiging of een keuze vereisen verschijnen als blijvende, gecentreerde modal met dezelfde resultaatvarianten.

## Robuustheid en toegankelijkheid

- Voorzie zichtbare toetsenbordfocus en voldoende grote klikdoelen.
- Ondersteun tekstvergroting, browserzoom, verminderde beweging en forced-colors waar relevant.
- Lange links en woorden mogen de pagina niet uitrekken.
- Tabellen en codeblokken kunnen indien nodig afzonderlijk horizontaal scrollen.
- Voorzie eenvoudige printopmaak met leesbare inhoud, zonder navigatie, tijdelijke meldingen en overbodige bediening.
- Houd componentregels voldoende afgebakend om ongewenste effecten op geneste inhoud en externe widgets te voorkomen.

## Demonstratie en verificatie

Lever een demonstratiepagina met:

- Navigatielinks, een loginlink en een echt afmeldformulier naast elkaar.
- Dezelfde knopvarianten binnen en buiten formulieren.
- Neutrale articles zonder header, cards met directe header en articles met alleen footer.
- Automatische grids met verschillende semantische kinderen.
- Rechter aside, zowel zonder als met gekoppelde mobiele openingsknop.
- Een formulier met standaard 100% breedte en automatische veldkolommen.
- Klassieke en customizable selects.
- Licht/donkerbediening, hamburgermenu en paginafooter.
- Een formuliermodal en resultaatmodals.
- Gestapelde meldingen met afzonderlijke timers en omhoogschuiven.
- Thema-editor met contrastcontrole en CSS-export.

Controleer desktop en mobiel, licht en donker, toetsenbordbediening, gedrag zonder JavaScript en de selectfallback. Schrijf gerichte tests voor JavaScriptinteracties en contrastberekeningen.

Documenteer installatie, variabelen, HTML-patronen, JavaScript-API, buildconfiguratie, uitvoervarianten en browserondersteuning. Vermeld eerlijk welke controles werkelijk zijn uitgevoerd.

Maak de eerste versie compleet en bruikbaar. Voeg geen extra componenten toe buiten deze scope.
