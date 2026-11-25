#!/usr/bin/env node
// Controleert de stof van een vak-app. Gebruik: node ../toetsweek/core/check.js   (vanuit de map van het vak)
// Laadt de scripts uit index.html met de echte kern en controleert het dataformaat, verwijzingen en rekenopgaven.
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const html = fs.readFileSync(path.join(dir, fs.existsSync(path.join(dir, "index.html")) ? "index.html" : "demo.html"), "utf8");
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const ctx = { console, Math, Date, JSON, Number, String, Array, Object, isFinite, isNaN, parseFloat, parseInt, setTimeout, clearTimeout, setInterval, clearInterval,
  document: { getElementById: () => null, documentElement: { style: { setProperty() {} } }, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} }, location: { hash: "" }, addEventListener() {}, requestAnimationFrame() {} };
ctx.window = ctx; vm.createContext(ctx);
const fouten = [], waarsch = [];
const F = (m) => fouten.push(m), W = (m) => waarsch.push(m);
for (const s of srcs) {
  if (/^https?:/.test(s)) { F(`extern script niet toegestaan: ${s}`); continue; }
  try { vm.runInContext(fs.readFileSync(path.join(dir, s), "utf8"), ctx, { filename: s }); }
  catch (e) { F(`${s}: ${e.message}`); }
}
const S = ctx.TW && ctx.TW._S;
if (!S) { console.error("Kern niet geladen (core.js ontbreekt in index.html?)"); process.exit(1); }
if (!S.vak.id || S.vak.id === "demo" && !/core$/.test(dir)) W("vak.id is nog 'demo'");
const isS = (x) => typeof x === "string" && x.trim().length > 0;
const ids = new Set(); let nV = 0, langste = 0, tot = { o: 0, k: 0, v: 0, r: 0, oe: 0, p: 0 };
const KERN = ["kop", "fig", "widget", "tip", "let", "ezel", "formule", "voorbeeld", "tabel"];
const figOk = (n, waar) => { if (!S.figs[n]) F(`${waar}: figuur "${n}" bestaat niet`); };
const widOk = (n, waar) => { if (!S.widgets[n]) F(`${waar}: widget "${n}" bestaat niet`); };
function rekenOk(d, waar) {
  if (!isS(d.q)) F(`${waar}: q ontbreekt`);
  const a = d.antwoord;
  if (typeof a === "number") { if (!isFinite(a)) F(`${waar}: antwoord is geen eindig getal`); }
  else if (!(isS(a) || (Array.isArray(a) && a.length && a.every(isS)))) F(`${waar}: antwoord moet getal, tekst of lijst met teksten zijn`);
  if (d.stappen && !(Array.isArray(d.stappen) && d.stappen.every(isS))) F(`${waar}: stappen moet een lijst met teksten zijn`);
  if (!d.stappen || !d.stappen.length) W(`${waar}: geen stappen (uitwerking)`);
  if (d.fig) figOk(d.fig, waar);
  for (const t of [d.q, d.hint, d.u].concat(d.stappen || [])) if (typeof t === "string" && /NaN|undefined|Infinity/.test(t)) F(`${waar}: tekst bevat NaN/undefined: ${t.slice(0, 60)}`);
}
S.hfst.forEach((h) => {
  if (!isS(h.id) || !isS(h.titel)) F(`hoofdstuk zonder id/titel`);
  (h.onderdelen || []).forEach((o) => {
    const w = `${o.id}`; tot.o++;
    if (!/^[a-z0-9-]+$/.test(o.id || "")) F(`${w}: id mag alleen kleine letters, cijfers en - bevatten`);
    if (ids.has(o.id)) F(`${w}: id komt dubbel voor`); ids.add(o.id);
    if (!isS(o.titel)) F(`${w}: titel ontbreekt`);
    (o.kern || []).forEach((k, i) => {
      if (typeof k === "string") return;
      const sleutel = Object.keys(k).find((x) => KERN.includes(x));
      if (!sleutel) return F(`${w} kern[${i}]: onbekend blok ${JSON.stringify(Object.keys(k))}`);
      if (k.fig) figOk(k.fig, `${w} kern[${i}]`);
      if (k.widget) widOk(k.widget, `${w} kern[${i}]`);
      if (k.voorbeeld && !(isS(k.voorbeeld.titel) && Array.isArray(k.voorbeeld.stappen))) F(`${w} kern[${i}]: voorbeeld heeft titel en stappen nodig`);
      if (k.tabel && !Array.isArray(k.tabel.rijen)) F(`${w} kern[${i}]: tabel heeft rijen nodig`);
    });
    (o.begrippen || []).forEach((b, i) => { tot.k++; if (!(Array.isArray(b) && isS(b[0]) && isS(b[1]))) F(`${w} begrip[${i}]: moet [term, omschrijving] zijn`); });
    (o.vragen || []).forEach((v, i) => {
      tot.v++; const ww = `${w} vraag[${i}]`;
      if (!isS(v.q)) F(`${ww}: q ontbreekt`);
      if (!(Array.isArray(v.a) && v.a.length >= 3 && v.a.every(isS))) return F(`${ww}: a moet minstens 3 antwoorden hebben`);
      if (new Set(v.a.map((x) => x.trim().toLowerCase())).size !== v.a.length) F(`${ww}: dubbele antwoorden`);
      if (!isS(v.u)) F(`${ww}: uitleg (u) ontbreekt`);
      if (v.fig) figOk(v.fig, ww);
      nV++; if (v.a.slice(1).every((x) => x.length < v.a[0].length * 0.8)) langste++;
    });
    (o.reken || []).forEach((r, i) => {
      tot.r++; const ww = `${w} reken[${i}]`;
      if (typeof r.gen === "function") { for (let n = 0; n < 40; n++) { let d; try { d = r.gen(ctx.TW.R); } catch (e) { F(`${ww}: gen gooit fout: ${e.message}`); break; } rekenOk(d, ww + " (gen)"); } }
      else rekenOk(r, ww);
    });
    (o.oefen || []).forEach((e, i) => {
      tot.oe++; const ww = `${w} oefen[${i}]`;
      if (!isS(e.q)) F(`${ww}: q ontbreekt`);
      if (!isS(e.u)) W(`${ww}: uitleg (u) ontbreekt`);
      if (e.type === "sorteer") { if (!(Array.isArray(e.groepen) && e.groepen.length >= 2)) F(`${ww}: groepen`); (e.items || []).forEach((it) => { if (!(isS(it[0]) && Number.isInteger(it[1]) && it[1] >= 0 && it[1] < (e.groepen || []).length)) F(`${ww}: item ${JSON.stringify(it)} ongeldig`); }); if ((e.items || []).length < 4) F(`${ww}: minstens 4 items`); }
      else if (e.type === "volgorde") { if (!(Array.isArray(e.items) && e.items.length >= 3 && e.items.every(isS))) F(`${ww}: items`); }
      else if (e.type === "koppel") { if (!(Array.isArray(e.paren) && e.paren.length >= 3)) F(`${ww}: minstens 3 paren`); else if (new Set(e.paren.map((p) => p[1])).size !== e.paren.length || new Set(e.paren.map((p) => p[0])).size !== e.paren.length) F(`${ww}: paren moeten uniek zijn`); if ((e.paren || []).length > 6) W(`${ww}: meer dan 6 paren wordt krap op een telefoon`); }
      else if (e.type === "invul") { const g = (e.tekst || "").match(/\{(.+?)\}/g) || []; if (!g.length) F(`${ww}: tekst heeft geen {gaten}`); }
      else F(`${ww}: onbekend type "${e.type}"`);
      if (e.fig) figOk(e.fig, ww);
    });
    (o.open || []).forEach((p, i) => { tot.p++; if (!(isS(p.q) && isS(p.a))) F(`${w} open[${i}]: q en a nodig`); if (p.fig) figOk(p.fig, `${w} open[${i}]`); });
    if (!Array.isArray(o.open) && o.open) F(`${w}: open moet een lijst zijn`);
    (o.widgets || []).forEach((n) => widOk(n, `${w} widgets`));
    console.log(`  ${(o.nr || "").padEnd(8)} ${o.titel.slice(0, 44).padEnd(44)} kern ${String((o.kern || []).length).padStart(2)} · begr ${String((o.begrippen || []).length).padStart(2)} · mc ${String((o.vragen || []).length).padStart(2)} · reken ${(o.reken || []).length} · oefen ${(o.oefen || []).length} · open ${(o.open || []).length} · widgets ${(o.widgets || []).length}`);
  });
});
Object.entries(S.figs).forEach(([n, f]) => { for (const q of [false, true]) { try { const r = f(q); if (typeof r !== "string" || !/<(svg|table|div)/.test(r)) F(`figuur "${n}": geeft geen svg/tabel terug`); else if (/NaN|undefined/.test(r)) F(`figuur "${n}": bevat NaN/undefined`); } catch (e) { F(`figuur "${n}": ${e.message}`); } } });
Object.entries(S.widgets).forEach(([n, w]) => { if (!isS(w.titel) || typeof w.maak !== "function") F(`widget "${n}": titel en maak(el, api) nodig`); });
if (nV && langste / nV > 0.4) W(`bij ${Math.round((langste / nV) * 100)}% van de meerkeuzevragen is het goede antwoord duidelijk het langste: maak de afleiders even lang`);
console.log(`\n${S.vak.titel}: ${S.hfst.length} hoofdstukken, ${tot.o} onderdelen, ${tot.k} begrippen, ${tot.v} meerkeuze, ${tot.r} reken, ${tot.oe} oefen, ${tot.p} open, ${Object.keys(S.figs).length} figuren, ${Object.keys(S.widgets).length} widgets`);
waarsch.forEach((m) => console.log("⚠︎  " + m));
fouten.forEach((m) => console.log("✖  " + m));
console.log(fouten.length ? `\n${fouten.length} fout(en)` : "\nGeen fouten ✔");
process.exit(fouten.length ? 1 : 0);
