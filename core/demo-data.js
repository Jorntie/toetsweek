// Demo-stof: laat elk blok- en vraagtype van de kern zien. Dient als voorbeeld voor de vak-apps.
TW.vak({ id: "demo", titel: "Demo", icoon: "🧪", kleur: "#7c3aed", kleurDonker: "#b79cff", methode: "de demo", toets: "H1 Voorbeeld · alle vraagtypen" });

TW.fig("driehoek", (quiz) => `<svg class="fig" viewBox="0 0 340 140" role="img" aria-label="Rechthoekige driehoek">
  <path d="M60 110 L260 110 L260 30 Z" class="vlak"/><path d="M60 110 L260 110 L260 30 Z" class="s"/>
  <text x="160" y="128" text-anchor="middle">4</text><text x="272" y="74">3</text>${quiz ? "" : `<text x="150" y="62" class="pa">5</text>`}</svg>`);

TW.widget("lijn", {
  titel: "Sleep de lijn", icoon: "📈",
  uitleg: "Sleep het punt of verschuif de helling. Wat gebeurt er met de formule?",
  maak(el, api) {
    let a = 2, b = 1;
    const P = api.plot({ x: [0, 10], y: [0, 30], xl: "x", yl: "y", xt: 2, yt: 5 });
    el.innerHTML = `<div id="g"></div>
      <label class="schuif"><span>Helling a</span><output id="oa"></output><input id="a" type="range" min="0" max="4" step="0.5" value="2"></label>
      <div class="uit" id="uit"></div>`;
    const g = el.querySelector("#g");
    function teken() {
      g.innerHTML = P.svg(P.assen() + P.fn((x) => a * x + b) + P.punt(0, b, "greep", 9, 'id="greep"'), "Lijn y = ax + b");
      el.querySelector("#oa").textContent = api.nl(a);
      el.querySelector("#uit").innerHTML = `<span class="groot">y = ${api.nl(a)}x + ${api.nl(b)}</span>`;
      const svg = g.querySelector("svg"), greep = g.querySelector("#greep");
      api.sleep(svg, greep, (x, y, fase) => {
        b = Math.max(0, Math.min(30, Math.round(P.iy(y))));
        if (fase === "eind") { teken(); api.klaar(); } else { greep.setAttribute("cy", P.Y(b)); el.querySelector("#uit").innerHTML = `<span class="groot">y = ${api.nl(a)}x + ${api.nl(b)}</span>`; }
      });
    }
    el.querySelector("#a").oninput = (e) => { a = +e.target.value; teken(); };
    teken();
  }
});

TW.hoofdstuk({
  id: "h1", nr: "H1", titel: "Voorbeeldhoofdstuk", icoon: "🧪", intro: "Twee onderdelen met alle soorten oefeningen.",
  onderdelen: [
    {
      id: "h1-1", nr: "1.1", titel: "Alle blokken en vraagtypen",
      kern: [
        "Een gewone kernzin met **vet**, een [[begrip]], H_{2}O en x^{2}.",
        "Opeenvolgende zinnen komen samen in één lijst.",
        { kop: "Tussenkopje" },
        { fig: "driehoek", bij: "Bijschrift bij de figuur." },
        { formule: "a^{2} + b^{2} = c^{2}" },
        { tip: "Een tip voor de toets." },
        { let: "Een veelgemaakte fout." },
        { ezel: "Een ezelsbruggetje." },
        { voorbeeld: { titel: "schuine zijde", stappen: ["3^{2} + 4^{2} = 25", "√25 = 5"] } },
        { tabel: { kop: ["x", "y"], rijen: [["1", "3"], ["2", "5"]] } },
        { widget: "lijn" }
      ],
      begrippen: [["Begrip", "Een woord met een vaste betekenis."], ["Formule", "Een rekenregel met letters."], ["Helling", "Hoeveel y toeneemt als x met 1 toeneemt."]],
      vragen: [
        { q: "Hoe lang is de schuine zijde?", a: ["5", "7", "12", "25"], u: "3^{2} + 4^{2} = 25 en √25 = 5.", fig: "driehoek" },
        { q: "Wat is 2 + 2?", a: ["4", "3", "5", "22"], u: "Twee plus twee is vier." }
      ],
      reken: [
        { q: "Een broek van € 80 wordt 25% goedkoper. Wat is de nieuwe prijs?", antwoord: 60, eenheid: "euro", hint: "Reken eerst 25% van 80 uit.", stappen: ["25% van 80 = 0,25 × 80 = 20", "80 − 20 = 60 euro"] },
        { gen: (R) => { const a = R.int(2, 9), b = R.int(11, 19); return { q: `Bereken ${a} × ${b}.`, antwoord: a * b, stappen: [`${a} × 10 = ${a * 10}`, `${a} × ${b - 10} = ${a * (b - 10)}`, `Samen: ${a * b}`] }; } },
        { q: "Schrijf de formule van een lijn met helling 2 door (0, 3).", antwoord: ["y=2x+3", "y=3+2x"], hint: "y = ax + b" }
      ],
      oefen: [
        { type: "sorteer", q: "Even of oneven?", groepen: ["Even", "Oneven"], items: [["2", 0], ["7", 1], ["10", 0], ["13", 1]], u: "Even getallen zijn deelbaar door 2." },
        { type: "volgorde", q: "Zet in de juiste volgorde: van klein naar groot.", items: ["millimeter", "centimeter", "meter", "kilometer"], u: "Elke stap is een grotere lengtemaat." },
        { type: "koppel", q: "Koppel de hoofdstad aan het land.", paren: [["Nederland", "Amsterdam"], ["Frankrijk", "Parijs"], ["Italië", "Rome"]], u: "Topografie." },
        { type: "invul", q: "Vul de zin aan.", tekst: "Water kookt bij {100} graden en bevriest bij {0} graden.", extra: ["50", "37"], u: "Bij normale luchtdruk." }
      ],
      open: [{ q: "Leg uit waarom de schuine zijde altijd de langste zijde is.", a: "De schuine zijde ligt tegenover de grootste hoek (90°) en tegenover de grootste hoek ligt de langste zijde.", punten: ["tegenover de rechte hoek", "grootste hoek, dus langste zijde"] }],
      widgets: ["lijn"]
    },
    {
      id: "h1-2", nr: "1.2", titel: "Tweede onderdeel",
      kern: ["Kort onderdeel om de navigatie te testen."],
      begrippen: [["Tweede", "Volgt op de eerste."]],
      vragen: [{ q: "Wat komt na 1?", a: ["2", "3", "0", "11"], u: "Na 1 komt 2." }]
    }
  ]
});
