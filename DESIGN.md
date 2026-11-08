# minicss vormgeving

De demo is een leesbare componenthandleiding; de thema-editor is een bedieningstool. De componenten volgen de rustige, functionele richting uit specs.md.

- Standaardpalet van AI in het onderwijs: primair `#30476f`, tweede accent `#354783`, lichte achtergrond `#f6f7f6` en tekst `#182e46`, met een afgeleide donkere variant. De gekozen accentvullingen blijven exact gelijk in beide thema's, met passende zwarte/witte tekst en afzonderlijke contrastgrenzen. Het derde accent staat aanvankelijk uit.
- Lopende tekst gebruikt Pico's lokale system-fontstack. Alleen het compacte woordmerk gebruikt Georgia; code gebruikt de monospace-stack van Pico. Geen externe fontafhankelijkheid.
- Body 100%; kleine tekst `.875rem`; H1 `clamp(2.25rem, 5vw, 3.5rem)`; H2 `1.75rem`. Alle schalen zijn afzonderlijk instelbaar.
- Inhoud maximaal `76rem`; intrinsieke grids minimaal `16rem`; gridafstand `1.5rem`. De hoofdaside gebruikt `17rem`, met `3rem` afstand.
- Eén `.grid` voor formulieren en andere wrappers; kolombreedte via `--mini-grid-min`. De gewone stylesheet gebruikt semantische HTML als basis; kleine klassen blijven beschikbaar voor expliciete uitzonderingen. Dubbele data-opmaakhaken vervallen. Een directe aside vóór de hoofdinhoudwrapper staat links, erna rechts; op smalle schermen blijft de documentvolgorde behouden.
- Eén afrondingstoken: `--mini-radius: .6rem`. Alleen bewust ronde elementen en controls met native ronde betekenis blijven rond.
- Cards ontstaan uitsluitend door een directe header. Een enkele rand en onderverdeelde header/footer; geen decoratieve schaduw. Modals en tijdelijke meldingen gebruiken schaduw om hun zwevende positie te verduidelijken.
- Alle interactieve controls hebben zichtbare focus en een minimumhoogte van `2.75rem`. Primaire, secundaire, outline- en randloze knoppen delen de geometrie.
- Kleur en uiterlijk van knoppen zijn combineerbaar: `secondary outline` en `tertiary outline` volgen hun accent. Links gebruiken `button` gevolgd door de modifiers, ook in navigatie. Outlinekleuren worden automatisch op leesbaarheid gecorrigeerd.
- Directe paginaheaders en paginafooters lopen over de volle breedte en delen achtergrond en tekstkleur. De header krijgt standaard een primaire onderlijn, de footer een primaire bovenlijn. De directe footer-div krijgt dezelfde automatische inhoudsbreedte en zijruimte als de headernav. `primary`, `secondary` en `tertiary` kiezen de accentachtergrond met leesbare tekst, links en focus. `primary-line`, `secondary-line` en `tertiary-line` wijzigen uitsluitend de lijnkleur en zijn combineerbaar met een achtergrond. Cardheaders en cardfooters behouden hun eigen stijl.
- De paginaheader heeft `.5rem` verticale padding en een navigatie van minimaal `4rem`; de footer heeft `.75rem` verticale padding. De mobiele asideknop staat vast rechtsonder, met een dekkende achtergrond en ruimte voor de schermrand.
- De editor gebruikt een kleurenwiel met 24 tinten en vijf intensiteitsniveaus binnen sRGB, plus vrije lichtheid, schuiven en hexinvoer. De twee thema's worden naast elkaar getoond. Primair, onafhankelijke extra accenten en optionele achtergrond-/tekstkleuren vormen de basis. Het wiel staat onder Primair verfijnen; hoekschuiven dienen als expliciet toe te passen suggesties. Afgeleide variabelen staan onder het standaard gesloten Geavanceerde kleuren.
- Animatie is beperkt tot laadstatus en het verschuiven van de meldingstapel. Reduced-motion maakt die beweging vrijwel direct.

De functionele CSS staat in src/minicss.css. demo/demo.css bevat alleen de documentatie-/editorindeling. Wijzig gegenereerde kleuren via de editor of bronmodule en bouw dist opnieuw.
