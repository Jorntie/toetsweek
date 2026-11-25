// Startpagina: de planner. Leest de samenvatting die elke vak-app bewaart in localStorage["tw:<vak>"].
(function () {
  "use strict";
  // "regel" is de tekst zoals die in de planner staat.
  const VAKKEN = [
    { id: "aardrijkskunde", kort: "Ak", regel: "H2 exo en endo + H5 klimaat", icoon: "🌍", kleur: "#0e7490" },
    { id: "biologie", kort: "Biologie", regel: "Th. 9 DNA + Th. 11 transport + Th. 3 erfelijkheid (5 t/m 7)", icoon: "🧬", kleur: "#1f8a5b" },
    { id: "economie", kort: "Economie", regel: "welvaart 2.1 t/m 2.4 + arbeid 5.1 t/m 5.3", icoon: "📈", kleur: "#2563a8" },
    { id: "engels", kort: "Engels", regel: "schrijftoets", icoon: "🇬🇧", kleur: "#c0263b" },
    { id: "nederlands", kort: "Nederlands", regel: "schrijfvaardigheid", icoon: "✍️", kleur: "#d9480f" },
    { id: "scheikunde", kort: "Scheikunde", regel: "H10 redox + H13 groene chemie en industrie", icoon: "⚗️", kleur: "#7c3aed" },
    { id: "wiskunde-a", kort: "Wiskunde A", regel: "H11 allerlei formules + H13 conclusies uit data + vaardigheden 5", icoon: "📊", kleur: "#be185d" }
  ];
  const hub = document.getElementById("hub");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lees = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const START = "2026-12-09"; // eerste dag van de toetsweek; per vak kan een eigen datum worden ingevuld
  let inst = Object.assign({ naam: "", toets: {} }, lees("tw:hub") || {});
  const bewaar = () => { try { localStorage.setItem("tw:hub", JSON.stringify(inst)); } catch (e) { /* negeren */ } };

  const vandaag = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const alsDatum = (s) => { const [j, m, d] = s.split("-").map(Number); return new Date(j, m - 1, d); };
  const dagenTot = (s) => Math.round((alsDatum(s) - vandaag()) / 864e5);
  const mooi = (s) => alsDatum(s).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  const over = (n) => (n < 0 ? "geweest" : n === 0 ? "vandaag!" : n === 1 ? "morgen" : `nog ${n} dagen`);

  function teken() {
    const rijen = VAKKEN.map((v) => {
      const s = (lees("tw:" + v.id) || {}).sum || null;
      const n = s ? s.n : 0, af = s ? s.af : 0, her = s ? s.her : 0;
      const stift = n && af === n ? "geel" : her ? "turq" : "";
      const datum = inst.toets[v.id] || "";
      const rest = dagenTot(datum || START); // zonder eigen datum telt de start van de toetsweek
      const open = s ? n - af : null;
      return { v, s, n, af, her, stift, datum, rest, open };
    });
    const eerst = rijen.filter((r) => r.datum && r.rest >= 0).sort((a, b) => a.rest - b.rest)[0];
    const totStart = dagenTot(START);
    const totN = rijen.reduce((t, r) => t + r.n, 0), totAf = rijen.reduce((t, r) => t + r.af, 0);
    const totDue = rijen.reduce((t, r) => t + (r.s ? r.s.due : 0), 0), totFout = rijen.reduce((t, r) => t + (r.s ? r.s.fout : 0), 0);
    const reeks = Math.max(0, ...rijen.map((r) => (r.s && Date.now() - r.s.laatst < 2 * 864e5 ? r.s.reeks : 0)));

    // Advies: het vak waarvan de toets het eerst komt en nog niet af is, anders het vak met de laagste beheersing.
    const kandidaten = rijen.filter((r) => !(r.n && r.af === r.n) && !(r.datum && r.rest < 0));
    const tip = kandidaten.slice().sort((a, b) => a.rest - b.rest || (a.s ? a.s.pct : 0) - (b.s ? b.s.pct : 0))[0];
    let tipTekst = "";
    if (tip) {
      if (tip.s && tip.rest > 0 && tip.open) tipTekst = `Nog ${tip.open} ${tip.open === 1 ? "onderdeel" : "onderdelen"} in ${tip.rest} ${tip.rest === 1 ? "dag" : "dagen"}: ongeveer ${Math.max(1, Math.ceil(tip.open / tip.rest))} per dag.`;
      else if (tip.s && tip.s.fout) tipTekst = `${tip.s.fout} ${tip.s.fout === 1 ? "fout" : "fouten"} om te herhalen.`;
      else if (!tip.s) tipTekst = "Hier ben je nog niet aan begonnen.";
      else tipTekst = `${tip.s.pct}% beheerst.`;
    }

    hub.innerHTML = `
      <header class="kop">
        <div class="week">toetsweek</div>
        <h1>${inst.naam ? `Hoi ${esc(inst.naam)}` : "Mijn planner"} <button class="pen" id="naam" aria-label="Naam aanpassen">✎</button></h1>
        <p class="onder">${eerst ? `Eerste toets: <b>${esc(eerst.v.kort)}</b>, ${mooi(eerst.datum)} · ${over(eerst.rest)}` : totStart >= 0 ? `De toetsweek begint <b>${mooi(START)}</b> · ${over(totStart)}. Tik bij een vak op <b>datum</b> voor je rooster.` : "Tik bij een vak op <b>datum</b> om je toetsrooster in te vullen."}</p>
        <div class="tellers">
          <div><b>${totAf}/${totN || "–"}</b><span>onderdelen af</span></div>
          <div><b>${totDue}</b><span>kaarten herhalen</span></div>
          <div><b>${totFout}</b><span>fouten open</span></div>
          <div><b>${reeks ? "🔥 " + reeks : "–"}</b><span>dagen op rij</span></div>
        </div>
      </header>
      ${tip ? `<a class="nu" href="../toetsweek-${tip.v.id}/" style="--vk:${tip.v.kleur}"><span class="nu-l">Nu doen</span><span class="nu-t">${tip.v.icoon} ${esc(tip.v.kort)}</span><span class="nu-s">${tipTekst}</span></a>` : `<div class="nu klaar"><span class="nu-t">🎉 Alles is geel. Klaar voor de toetsweek!</span></div>`}
      <section class="blad">
        <h2>to do</h2>
        <ul class="todo">
          ${rijen.map((r) => `
          <li>
            <a class="regel" href="../toetsweek-${r.v.id}/" style="--vk:${r.v.kleur}">
              <span class="vakje ${r.n && r.af === r.n ? "aan" : ""}" aria-hidden="true">${r.n && r.af === r.n ? "✓" : ""}</span>
              <span class="tekst"><span class="hl ${r.stift}"><b>${esc(r.v.kort)}:</b> ${esc(r.v.regel)}</span></span>
              <span class="pct">${r.s ? r.s.pct + "%" : ""}</span>
            </a>
            <div class="sub">
              <div class="strook" role="img" aria-label="${r.s ? `${r.af} van ${r.n} onderdelen af, ${r.her} herhalen` : "nog niet begonnen"}">${r.s ? r.s.ond.map((o) => `<i class="${o.m === "af" ? "geel" : o.m === "her" ? "turq" : o.p > 0 ? "bezig" : ""}" title="${esc(o.nr)} ${esc(o.titel)}"></i>`).join("") : '<span class="leeg">nog niet begonnen</span>'}</div>
              <label class="datum ${r.datum && r.rest <= 2 && r.rest >= 0 ? "dichtbij" : ""}">${r.datum ? `${mooi(r.datum)} · ${over(r.rest)}` : "datum"}<input type="date" data-vak="${r.v.id}" value="${esc(r.datum)}" aria-label="Datum toets ${esc(r.v.kort)}"></label>
            </div>
          </li>`).join("")}
        </ul>
        <p class="legenda"><span class="hl geel">&nbsp; &nbsp; &nbsp; &nbsp;</span> = af &nbsp;&nbsp; <span class="hl turq">&nbsp; &nbsp; &nbsp; &nbsp;</span> = herhalen</p>
      </section>
      <section class="uitleg">
        <h2>Zo werkt het</h2>
        <ol>
          <li><b>Leren</b>: lees per onderdeel de samenvatting en doe de interactieve opdrachten.</li>
          <li><b>Oefenen</b>: flitskaarten, quiz, rekenen en open vragen. Fouten komen vanzelf terug.</li>
          <li><b>Markeren</b>: zet een onderdeel op geel als het af is. Maak je er later een fout in, dan wordt het turquoise: herhalen.</li>
          <li><b>Toetsen</b>: doe per vak een oefentoets en kijk welk cijfer je nu zou halen.</li>
        </ol>
      </section>`;

    document.getElementById("naam").onclick = () => {
      const n = prompt("Hoe heet je? (blijft alleen op dit apparaat)", inst.naam || "");
      if (n !== null) { inst.naam = n.trim().slice(0, 30); bewaar(); teken(); }
    };
    hub.querySelectorAll("input[type=date]").forEach((i) => (i.onchange = () => {
      if (i.value) inst.toets[i.dataset.vak] = i.value; else delete inst.toets[i.dataset.vak];
      bewaar(); teken();
    }));
  }
  window.addEventListener("pageshow", teken);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) teken(); });
  teken();
})();
