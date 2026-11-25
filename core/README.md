# Toetsweek-kern

Gedeelde leer-engine (`core.js`, `core.css`) voor de zeven vak-apps. Elke vak-app heeft een eigen kopie; de bron staat hier.
Na een wijziging: `./sync-core.sh` (kopieert naar alle `../toetsweek-*`). Controle van een vak: `node ../toetsweek/core/check.js` vanuit de map van het vak.
`demo.html` + `demo-data.js` laten elk blok- en vraagtype zien.

## Bestanden per vak-app
`index.html` (laadt in deze volgorde: `core.js`, `vak.js`, `figs.js`, `widgets.js`, `data-*.js`, daarna `TW.start()`), `vak.css` (eigen stijl), `core.js`/`core.css` (niet aanpassen).

## Dataformaat
```js
TW.vak({ id: "biologie", titel: "Biologie", icoon: "🧬", kleur: "#1f8a5b", kleurDonker: "#4cc38a", methode: "Biologie voor jou", toets: "Thema 9 · Thema 11 · Thema 3" });

TW.hoofdstuk({
  id: "t9", nr: "Thema 9", titel: "DNA", icoon: "🧬", intro: "optioneel",
  onderdelen: [{
    id: "t9-1",            // uniek, alleen a-z 0-9 en -, nooit meer wijzigen (voortgang hangt eraan)
    nr: "BS 1", titel: "…",
    kern: [                // tekst = kernzin (opeenvolgende zinnen vormen één lijst); objecten zijn blokken
      "Kernzin met **vet**, [[begrip]], H_{2}O, x^{2}.",
      { kop: "Tussenkop" }, { fig: "naam", bij: "bijschrift" }, { widget: "naam" },
      { formule: "…" }, { tip: "…" }, { let: "veelgemaakte fout" }, { ezel: "ezelsbruggetje" },
      { voorbeeld: { titel: "…", stappen: ["…", "…"] } }, { tabel: { kop: ["a", "b"], rijen: [["1", "2"]] } }
    ],
    begrippen: [["term", "omschrijving"]],                       // flitskaarten met gespreide herhaling
    vragen: [{ q, a: ["goed", "fout", "fout", "fout"], u: "uitleg", fig: "optioneel" }],   // eerste antwoord is goed; app husselt
    reken: [                                                    // getal of kort antwoord, twee pogingen, hint, stap voor stap
      { q, antwoord: 60, eenheid: "euro", tol: 0.5, hint: "…", stappen: ["…"], u: "optioneel", toon: "optionele weergave" },
      { q, antwoord: ["y=2x+3", "y=3+2x"] },                   // tekst: spaties/hoofdletters/komma-punt tellen niet
      { gen: (R) => ({ q, antwoord, eenheid, stappen }) }       // steeds nieuwe getallen: R.int(a,b), R.kies(lijst), R.rond(x,d), R.nl(x,d)
    ],
    oefen: [
      { type: "sorteer", q, groepen: ["A", "B"], items: [["tekst", 0], ["tekst", 1]], u },
      { type: "volgorde", q, items: ["eerste", "tweede", "derde"], u },      // items staan in de goede volgorde
      { type: "koppel", q, paren: [["links", "rechts"]], u },                // 3 tot 6 paren
      { type: "invul", q, tekst: "Het {mRNA} verlaat de {kern}.", extra: ["afleider"], u }
    ],
    open: [{ q, a: "modelantwoord", punten: ["kernpunt 1", "kernpunt 2"] }],
    widgets: ["naam"]      // interactieve onderdelen, als tegel op de onderdeelpagina
  }]
});
```
Standaardtolerantie bij rekenen: 1% van het antwoord (minimaal 0,005); zet `tol` (absoluut) als dat niet past.
Nieuwe vragen altijd achteraan toevoegen: de voortgang is gekoppeld aan de positie in de lijst.

## Figuren en widgets
```js
TW.fig("naam", (quiz) => "<svg class=\"fig\" viewBox=\"0 0 340 200\" role=\"img\" aria-label=\"…\">…</svg>");   // quiz = true: laat weg wat het antwoord verklapt
TW.widget("naam", { titel: "…", icoon: "🔬", uitleg: "…", maak(el, api) { /* bouw DOM in el */ } });
```
`api`: `klaar()` (markeert het onderdeel als gedaan), `opruimen(fn)` (timers stoppen bij weggaan), `plot`, `sleep`, `fmt`, `esc`, `nl`, `R`, `shuffle`.
- `P = TW.plot({ x:[0,10], y:[0,100], xl, yl, xt, yt, w, h })` → `P.assen()`, `P.fn(f, cls)`, `P.pad(punten, cls)`, `P.vlak(punten, cls)`, `P.punt(x, y, cls, r, attrs)`, `P.lijn(…)`, `P.tekst(x, y, s, anker, cls, dx, dy)`, `P.svg(body, label)`, `P.X/P.Y` (waarde → pixel), `P.ix/P.iy` (pixel → waarde).
- `TW.sleep(svg, element, (x, y, fase) => …)`: slepen met vinger of muis, coördinaten in de viewBox; fase is `start`, `move` of `eind`. Vervang het gesleepte element niet tijdens het slepen.
- SVG-klassen: `s` (lijn), `raster`, `curve` t/m `curve5`, `vlak` t/m `vlak3`, `stip`, `dot`, `greep`, `cel`; tekst: `k` (klein), `b` (vet), `g` (groot), `pa`/`pb`/`pr`/`pg` (kleur).
- Widget-klassen: `.schuif` (label + range), `.uit` (uitkomstvak), `.keuze` (rij knoppen), `.groot`, en alle knoppen/kaarten van de kern (`.btn`, `.chip`, `.card`, `.two`, `.drie`).
- Kleuren altijd via CSS-variabelen (`--accent`, `--text`, `--muted`, `--line`, `--card`, `--good`, `--bad`, `--oranje`, `--geel`, `--turq`), zodat licht en donker beide kloppen.

## Opslag
`localStorage["tw:<vak.id>"]`: kaarten (`k`), antwoorden (`q`), markeringen (`m`: `af` = geel, `her` = turquoise), gelezen (`l`), widgets (`w`), dagen (`d`) en een samenvatting (`sum`) die de startpagina leest.
