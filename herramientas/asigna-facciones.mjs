// Lee un mundo de Random New World congelado (solo lectura) y elige, para cada faccion de
// facciones.json y en su orden, el pais generado que pasa a ser esa faccion al empezar.
// No escribe nada en eu5-mundo/mod (el repo guarda el mod sin mundo): monta una copia en
// eu5-mundo/tmp-instalar/, la funde con el vinculo, la comprueba y, con --instalar, la copia
// a Documents/Paradox Interactive/Europa Universalis V/mod.
//
// Uso:
//   node asigna-facciones.mjs                      el mundo rnw_exp_* mas reciente de Documents/.../mod
//   node asigna-facciones.mjs --mundo <carpeta>    un mundo concreto
//   node asigna-facciones.mjs --tag ostrevar=ABC   fuerza un pais (se puede repetir)
//   node asigna-facciones.mjs --seco               solo informa, no escribe nada
//   node asigna-facciones.mjs --instalar           ademas comprueba la copia y la instala
//   node asigna-facciones.mjs --vanilla            usa la America del juego base (plan B y pruebas)
//   --juego <carpeta>   --partes <carpeta>   --informe <fichero> (por defecto eu5-mundo/VINCULO.md)
//   --destino <carpeta> donde instalar (por defecto Documents/.../mod)
//   --sin-mapa          no usa el mapa final (mapa/final/zonas.json) aunque el mundo encaje
//   --zonas-mapa        usa el mapa final aunque el mundo no encaje (solo para probar)
//   --sin-reparto       no reparte la tierra al empezar (reparte-tierra.mjs)
//   --sin-vegetacion    no mezcla la vegetacion (mezcla-vegetacion.mjs)
//   --dueno <json>      guarda el reparto final (pais de cada localizacion) para pinta-paises.mjs
//   --pueblo-cada <n>   un pueblo cada n localizaciones de cada pais (rangos.mjs; por defecto 17)
//
// Con un mundo hecho con el dibujo de mapa/final, cada faccion se queda el pais con mas
// localizaciones en su zona del dibujo, y los gj_zona_* salen del dibujo (zonas-mapa.mjs).
// Si el mundo no encaja con el dibujo, se reparte por puntos y las zonas salen de los paises.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { juegoPorDefecto } from './pdx.mjs';
import { analizaFichero, leeTexto, esBloque, hijo, valoresSueltos, escribeConBom, listaFicheros } from './pdx.mjs';
import { asignaRecursos, informeRecursos } from './asigna-recursos.mjs';
import { cargaMundo, vecinos, centros, rios, paisesDelMundo } from './mundo.mjs';
import { mezclaVegetacion, textoVegetacion, tablaDelJuego } from './mezcla-vegetacion.mjs';
import { TALLA_MENOR } from './reparte-tierra.mjs';
import { repartePaises, textoPaises } from './reparte-paises.mjs';
import { rangosIniciales, PUEBLO_CADA } from './rangos.mjs';
import { puntuaCapital } from './capitales.mjs';
import { ligaMapa, defineZonas, DIR_MAPA, CALIDAD_MINIMA } from './zonas-mapa.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const todos = (n) => args.flatMap((a, i) => (a === n ? [args[i + 1]] : []));
const tiene = (n) => args.includes(n);
const JUEGO = path.resolve(arg('--juego') ?? juegoPorDefecto());
const BASE = path.join(RAIZ, 'mod', 'gj_nuevo_mundo');
const PARTES = path.resolve(arg('--partes', path.join(RAIZ, 'partes')));
const DOC_MOD = path.resolve(arg('--destino', path.join(os.homedir(), 'Documents', 'Paradox Interactive', 'Europa Universalis V', 'mod')));
const OBRA = path.join(RAIZ, 'tmp-instalar');
const VANILLA = tiene('--vanilla');
const FAC = JSON.parse(fs.readFileSync(path.join(AQUI, 'facciones.json'), 'utf8'));
const SUBCONT = { norte: 'north_america', sur: 'south_america' };

const muere = (m) => { console.error('asigna-facciones: ' + m); process.exit(1); };

// ---------------------------------------------------------------- el mundo
function buscaMundo() {
  if (VANILLA) return JUEGO;
  const dado = arg('--mundo', null);
  if (dado) return path.resolve(dado);
  if (!fs.existsSync(DOC_MOD)) muere(`no existe ${DOC_MOD}: genera antes un mundo con RNW`);
  const mundos = fs.readdirSync(DOC_MOD).filter((d) => d.startsWith('rnw_exp_')).map((d) => path.join(DOC_MOD, d))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!mundos.length) muere(`no hay ningun mundo rnw_exp_* en ${DOC_MOD}`);
  if (mundos.length > 1) console.log(`Hay ${mundos.length} mundos; uso el mas reciente. Para otro: --mundo <carpeta>.`);
  return mundos[0];
}
const MUNDO = buscaMundo();
const enMundo = (...p) => {
  const r = path.join(MUNDO, ...p);
  if (fs.existsSync(r)) return r;
  const j = path.join(JUEGO, ...p);
  if (fs.existsSync(j)) { if (!VANILLA) console.log(`  (el mundo no trae ${p.join('/')}: uso el del juego)`); return j; }
  return null;
};

let metaMundo = { id: 'vanilla', name: 'America del juego base', version: '1.4.9' };
if (!VANILLA) {
  const rm = path.join(MUNDO, '.metadata', 'metadata.json');
  if (!fs.existsSync(rm)) muere(`${MUNDO} no tiene .metadata/metadata.json: no parece un mundo RNW`);
  metaMundo = JSON.parse(leeTexto(rm).texto);
}

// Jerarquia: localizacion -> { continente, subcontinente, region, area, provincia }
const jer = new Map();
{
  const f = enMundo('in_game', 'map_data', 'definitions.txt') || muere('no encuentro definitions.txt');
  const baja = (b, ruta) => {
    for (const it of b.items) {
      if (it.k && esBloque(it.v)) baja(it.v, [...ruta, it.k]);
      else if (it.k === null && typeof it.v === 'string') {
        const [continente, subcontinente, region, area, provincia] = ruta;
        jer.set(it.v, { continente, subcontinente, region, area, provincia });
      }
    }
  };
  baja(analizaFichero(f).arbol, []);
}

// Plantillas: clima, topografia, vegetacion, cultura y religion de cada localizacion
const plant = new Map();
{
  const f = enMundo('in_game', 'map_data', 'location_templates.txt') || muere('no encuentro location_templates.txt');
  for (const ln of leeTexto(f).texto.split('\n')) {
    const m = ln.match(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*\{(.*)\}/);
    if (!m) continue;
    const campo = (k) => (m[2].match(new RegExp(`\\b${k}\\s*=\\s*([A-Za-z0-9_]+)`)) || [])[1];
    plant.set(m[1], { clima: campo('climate'), topo: campo('topography'), veg: campo('vegetation'), cultura: campo('culture'), religion: campo('religion') });
  }
}

// Costa: localizaciones con puerto en ports.csv
const costa = new Set();
{
  const f = enMundo('in_game', 'map_data', 'ports.csv');
  if (f) for (const ln of leeTexto(f).texto.split('\n').slice(1)) { const l = ln.split(';')[0].trim(); if (l) costa.add(l); }
  else console.log('  (no encuentro ports.csv: la costa no puntua)');
}

// Paises
const fPaises = enMundo('main_menu', 'setup', '1337', '10_countries.txt') || muere('no encuentro 10_countries.txt');
const lista = hijo(hijo(analizaFichero(fPaises).arbol, 'countries')?.v, 'countries');
if (!lista) muere('10_countries.txt sin el bloque countries = { countries = { ... } }');

let nativos = null;
if (!VANILLA) {
  const f = path.join(MUNDO, 'in_game', 'setup', 'countries', 'rnw_natives.txt');
  if (fs.existsSync(f)) nativos = new Set(analizaFichero(f).arbol.items.filter((x) => x.k).map((x) => x.k));
  else console.log('  (el mundo no trae in_game/setup/countries/rnw_natives.txt: miro todos los paises de America)');
}

const nombres = new Map();
for (const dir of [path.join(MUNDO, 'main_menu', 'localization', 'spanish'), ...(VANILLA ? [] : [path.join(JUEGO, 'main_menu', 'localization', 'spanish')])]) {
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.yml') && (VANILLA ? /countr/.test(x) : /^rnw_/.test(x)))) {
    for (const m of leeTexto(path.join(dir, f)).texto.matchAll(/^ ([A-Z][A-Z0-9]{2}):\d* "([^"]*)"/gm)) if (!nombres.has(m[1])) nombres.set(m[1], m[2]);
  }
}

const paises = [];
for (const it of lista.v.items) {
  if (!it.k || !/^[A-Z][A-Z0-9]{2}$/.test(it.k) || !esBloque(it.v)) continue;
  if (nativos && !nativos.has(it.k)) continue;
  const locs = new Set();
  for (const x of it.v.items) if (x.k && /^own_/.test(x.k) && esBloque(x.v)) for (const v of valoresSueltos(x.v)) locs.add(v);
  if (!locs.size) continue;
  const capital = (hijo(it.v, 'capital') || {}).v || [...locs].sort()[0];
  const jc = jer.get(capital);
  if (!jc || jc.continente !== 'america') continue;
  const gob = hijo(it.v, 'government');
  const tipo = gob && esBloque(gob.v) ? (hijo(gob.v, 'type') || {}).v : undefined;
  const ls = [...locs];
  const cuenta = (campo) => { const c = {}; for (const l of ls) { const v = (plant.get(l) || {})[campo]; if (v) c[v] = (c[v] || 0) + 1; } return c; };
  paises.push({ tag: it.k, nombre: nombres.get(it.k) || '?', n: ls.length, locs: ls, capital, ...jc, tipo: tipo || '?',
    clima: cuenta('clima'), topo: cuenta('topo'), veg: cuenta('veg'), costa: ls.filter((l) => costa.has(l)).length,
    areas: [...new Set(ls.map((l) => (jer.get(l) || {}).area).filter(Boolean))].sort(),
    cultura: (plant.get(capital) || {}).cultura || '?', religion: (plant.get(capital) || {}).religion || '?' });
}
if (!paises.length) muere('ningun pais del mundo tiene la capital en el continente america');
paises.sort((a, b) => a.tag.localeCompare(b.tag));

// ---------------------------------------------------------------- mapa final
// Si el mundo sale del dibujo de mapa/final, el centro de cada localizacion cae en una zona.
let liga = null, mundoM = null;
if (!tiene('--sin-mapa') && fs.existsSync(path.join(DIR_MAPA, 'zonas.json'))) {
  mundoM = cargaMundo({ juego: JUEGO, mundo: VANILLA ? null : MUNDO, vanilla: VANILLA });
  liga = await ligaMapa({ dir: MUNDO, juego: JUEGO, mundo: mundoM, forzar: tiene('--zonas-mapa') });
}
const conMapa = !!liga?.usable;
const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
const enZona = (f, p) => (conMapa ? p.locs.filter((l) => liga.zonaDe.get(l)?.id === facZona(f)).length : 0);

// ---------------------------------------------------------------- reparto
const proporcion = (p, campo, lista_) => (lista_ || []).reduce((s, k) => s + (p[campo][k] || 0), 0) / p.n;
function puntua(f, p, asignados) {
  const pr = f.prefiere || {};
  const desglose = {};
  const r = Math.log(p.n / f.talla);
  // Continua: si ningun pais llega a la talla pedida (Ostrevar pide ~135), gana el mas cercano.
  desglose.talla = Math.max(-20, 10 - 10 * Math.abs(r));
  if (pr.clima) desglose.clima = 10 * proporcion(p, 'clima', pr.clima);
  if (pr.topo) desglose.topo = 6 * proporcion(p, 'topo', pr.topo);
  if (pr.veg) desglose.veg = 6 * proporcion(p, 'veg', pr.veg);
  if (pr.costa !== undefined) desglose.costa = -10 * Math.abs(p.costa / p.n - pr.costa);
  if (pr.gobierno) desglose.gobierno = p.tipo === pr.gobierno ? 5 : 0;
  if (f.cerca_de && asignados[f.cerca_de]) {
    const o = asignados[f.cerca_de];
    desglose.cerca = o.region === p.region ? 8 : 0;
  }
  const total = Object.values(desglose).reduce((s, v) => s + v, 0);
  return { total, desglose };
}

const forzados = Object.fromEntries(todos('--tag').map((s) => s.split('=')));
for (const [k, t] of Object.entries(forzados)) {
  if (!FAC.facciones.some((f) => f.clave === k)) muere(`--tag ${k}=${t}: ${k} no es una faccion de facciones.json`);
  if (!paises.some((p) => p.tag === t)) muere(`--tag ${k}=${t}: ${t} no es un pais de America en este mundo`);
}
const asignados = {};
const usados = new Set(Object.values(forzados));
const filas = [];
// Con el mapa: de mayor a menor numero de localizaciones en la zona, cada faccion con su pais.
const porMapa = {};
if (conMapa) {
  const pares = [];
  for (const f of FAC.facciones) if (!forzados[f.clave]) for (const p of paises) { const c = enZona(f, p); if (c && !usados.has(p.tag)) pares.push({ f, p, c }); }
  pares.sort((a, b) => b.c - a.c || b.c / b.p.n - a.c / a.p.n || a.f.clave.localeCompare(b.f.clave) || a.p.tag.localeCompare(b.p.tag));
  const tomados = new Set(usados);
  for (const x of pares) if (!porMapa[x.f.clave] && !tomados.has(x.p.tag)) { porMapa[x.f.clave] = x; tomados.add(x.p.tag); }
  // Sin pais en su zona (RNW deja tierra sin dueno): el pais libre del mismo continente con la
  // capital mas cerca de la zona, mejor si la capital no esta en la zona de otra faccion.
  const zonasFac = new Set(FAC.facciones.map(facZona));
  for (const f of FAC.facciones) {
    if (forzados[f.clave] || porMapa[f.clave]) continue;
    const iz = liga.mapa.zonas.findIndex((z) => z.id === facZona(f));
    if (iz < 0 || !liga.mapa.centro[iz]) continue;
    const [cx, cy] = liga.mapa.centro[iz], contZ = liga.mapa.zonas[iz].continente;
    const cands = paises.filter((p) => !tomados.has(p.tag) && liga.xy.has(p.capital) && liga.zonaDe.get(p.capital)?.continente === contZ)
      .map((p) => { const [x, y] = liga.xy.get(p.capital); const d = Math.hypot(x - cx, y - cy); return { p, d, orden: d + (zonasFac.has(liga.zonaDe.get(p.capital)?.id) ? 300 : 0) }; })
      .sort((a, b) => a.orden - b.orden || a.p.tag.localeCompare(b.p.tag));
    if (!cands.length) continue;
    porMapa[f.clave] = { p: cands[0].p, c: 0, cerca: Math.round(cands[0].d), otros: cands.slice(1, 4).map((x) => `${x.p.tag} (${Math.round(x.d)} px)`) };
    tomados.add(cands[0].p.tag);
  }
}
for (const f of FAC.facciones) {
  const sub = SUBCONT[f.continente];
  if (forzados[f.clave]) {
    const p = paises.find((x) => x.tag === forzados[f.clave]);
    asignados[f.clave] = p; filas.push({ f, p, pt: puntua(f, p, asignados), forzado: true, alternativas: [] });
    continue;
  }
  if (porMapa[f.clave]) {
    const { p, c, cerca, otros: otrosCerca } = porMapa[f.clave];
    asignados[f.clave] = p; usados.add(p.tag);
    const otros = paises.filter((x) => x !== p && enZona(f, x)).sort((a, b) => enZona(f, b) - enZona(f, a) || a.tag.localeCompare(b.tag)).slice(0, 3);
    filas.push({ f, p, pt: { total: c, desglose: { mapa: c } }, enMapa: true, cerca, alternativas: otrosCerca || otros.map((x) => `${x.tag} (${enZona(f, x)})`) });
    continue;
  }
  const cands = paises.filter((p) => !usados.has(p.tag) && p.subcontinente === sub)
    .map((p) => ({ p, pt: puntua(f, p, asignados) }))
    .sort((a, b) => b.pt.total - a.pt.total || a.p.tag.localeCompare(b.p.tag));
  if (!cands.length) { filas.push({ f, p: null, alternativas: [] }); continue; }
  const { p, pt } = cands[0];
  asignados[f.clave] = p; usados.add(p.tag);
  filas.push({ f, p, pt, alternativas: cands.slice(1, 4).map((c) => `${c.p.tag} (${c.pt.total.toFixed(1)})`) });
}

// ---------------------------------------------------------------- los menores con nombre
// Cada menor de facciones.json recibe un estado de RNW que no sea faccion: el mayor de los que
// tienen la capital en la primera de sus zonas del dibujo con alguno libre; si no hay ninguno, el
// libre de su continente con la capital mas cerca de esa zona. Su contenido va por cultura.
// reparte-tierra.mjs lo muda a la primera de sus zonas si no tiene tierra en ella.
const menores = {};
const filasMenores = [];
if (conMapa) for (const m of FAC.menores || []) {
  const libres = paises.filter((p) => !usados.has(p.tag) && liga.xy.has(p.capital));
  let p = null, donde = null;
  for (const z of m.zonas) {
    // en su zona, el mayor que no pase de la talla de un menor; en otra (reparte-tierra lo mudara a la suya), el menor: no gasta un estado grande
    p = libres.filter((x) => liga.zonaDe.get(x.capital)?.id === z).sort((a, b) => (z === m.zonas[0] ? (a.n > TALLA_MENOR[1]) - (b.n > TALLA_MENOR[1]) || b.n - a.n : a.n - b.n) || a.tag.localeCompare(b.tag))[0];
    if (p) { donde = z; break; }
  }
  if (!p) {
    const iz = liga.mapa.zonas.findIndex((z) => z.id === m.zonas[0]);
    if (iz >= 0 && liga.mapa.centro[iz]) {
      const [cx, cy] = liga.mapa.centro[iz], cont = liga.mapa.zonas[iz].continente;
      const d = (x) => { const [a, b] = liga.xy.get(x.capital); return Math.hypot(a - cx, b - cy); };
      p = libres.filter((x) => liga.zonaDe.get(x.capital)?.continente === cont).sort((a, b) => (a.n > TALLA_MENOR[1]) - (b.n > TALLA_MENOR[1]) || d(a) - d(b) || a.tag.localeCompare(b.tag))[0]; // antes uno que no pase de la talla de un menor
      if (p) donde = `cerca de ${m.zonas[0]} (a ${Math.round(d(p))} px)`;
    }
  }
  if (p) { menores[m.clave] = p; usados.add(p.tag); }
  filasMenores.push({ m, p, donde });
}

// ---------------------------------------------------------------- zonas que piden las partes
// Las zonas son triggers de LOCALIZACION (area = area:x). Regla por defecto: gj_zona_<clave>_*
// son las areas del pais de esa faccion. facciones.json puede darlas a mano en "zonas":
//   { "gj_zona_x": { "faccion": "clave" } }               todas las areas de esa faccion
//   { "gj_zona_x": { "faccion": "clave", "parte": [i, n] } } el trozo i de n (areas en orden)
//   { "gj_zona_x": { "areas": ["area_a", ...] } }          a mano
// Se buscan en los scripts, sus comentarios y los .md de las partes (gj_zona_$Z$ no cuenta).
const zonasUsadas = new Set();
if (fs.existsSync(PARTES)) for (const f of listaFicheros(PARTES, (r) => /\.(txt|md)$/.test(r))) for (const m of fs.readFileSync(f, 'utf8').matchAll(/\b(gj_zona_[a-z0-9_]*[a-z0-9])\b(?!\$)/g)) zonasUsadas.add(m[1]);
for (const z of Object.keys(FAC.zonas || {})) if (!z.startsWith('_')) zonasUsadas.add(z);
const zonas = {};
const zonasSin = [];
const dz = conMapa ? await defineZonas({ liga, mundo: mundoM, dir: MUNDO, juego: JUEGO, conf: FAC.zonas || {}, facciones: FAC.facciones }) : null;
const trozo = (xs, [i, n]) => { const t = Math.ceil(xs.length / n); const r = xs.slice((i - 1) * t, i * t); return r.length ? r : [xs[(i - 1) % xs.length]]; };
for (const z of [...zonasUsadas].sort()) {
  const aMano = (FAC.zonas || {})[z];
  let areas = null;
  if (dz?.zonas[z]) { zonas[z] = dz.zonas[z]; continue; }
  if (aMano?.subcontinente) { zonas[z] = { ambito: aMano.ambito || 'localizacion', lista: [{ tipo: 'sub_continent', clave: aMano.subcontinente }] }; continue; }
  if (aMano?.areas) areas = [...aMano.areas].sort();
  else {
    const clave = aMano?.faccion || FAC.facciones.map((f) => f.clave).sort((a, b) => b.length - a.length).find((k) => z.startsWith(`gj_zona_${k}_`) || z === `gj_zona_${k}`);
    if (clave && asignados[clave]?.areas.length) areas = aMano?.parte ? trozo(asignados[clave].areas, aMano.parte) : asignados[clave].areas;
  }
  if (areas) zonas[z] = { ambito: aMano?.ambito || 'localizacion', lista: areas.map((clave) => ({ tipo: 'area', clave })) };
  else zonasSin.push(z);
}

// ---------------------------------------------------------------- tierra de cada faccion al empezar
const vecM = conMapa ? await vecinos(MUNDO, JUEGO) : null;
// gente de cada localizacion (06_pops.txt del mundo): la capital nueva de quien la muda va a la mas poblada
const poblacionM = new Map(), culturaM = new Map(), feM = new Map(); // loc -> Map(cultura|fe -> gente)
const sumaEn = (m, l, k, v) => { if (!m.has(l)) m.set(l, new Map()); m.get(l).set(k, (m.get(l).get(k) || 0) + v); };
if (conMapa) {
  const fp = enMundo('main_menu', 'setup', '1337', '06_pops.txt');
  let loc = null;
  if (fp) for (const linea of leeTexto(fp).texto.split('\n')) {
    const c = linea.match(/^(\w+)\s*=\s*\{/);
    if (c) { loc = c[1]; continue; }
    const s = loc && linea.match(/\bsize\s*=\s*([\d.]+)/);
    if (s) poblacionM.set(loc, (poblacionM.get(loc) || 0) + +s[1]);
    const cu = s && linea.match(/\bculture\s*=\s*(\w+)/), fe = s && linea.match(/\breligion\s*=\s*(\w+)/);
    if (cu) sumaEn(culturaM, loc, cu[1], +s[1]);
    if (fe) sumaEn(feM, loc, fe[1], +s[1]);
  }
}
// sub-zonas de localizacion que piden las partes: cada faccion llega con un brazo a las de su zona
const locsDeArea = new Map();
for (const [l, j] of jer) { if (!locsDeArea.has(j.area)) locsDeArea.set(j.area, []); locsDeArea.get(j.area).push(l); }
const subzonas = Object.entries(zonas).filter(([, d]) => d.ambito === 'localizacion')
  .map(([nombre, d]) => ({ nombre, locs: d.lista.flatMap((x) => (x.tipo === 'location' ? [x.clave] : x.tipo === 'area' ? locsDeArea.get(x.clave) || [] : [])).sort() }))
  .filter((s) => s.locs.length >= 20); // las ruinas y las vetas (1-5 localizaciones) no cuentan
const fPuertos = conMapa ? enMundo('in_game', 'map_data', 'ports.csv') : null;
const puertos = new Set(fPuertos ? leeTexto(fPuertos).texto.split(/\r?\n/).slice(1).map((x) => x.split(';')[0]).filter(Boolean) : []);
const rioM = conMapa ? await rios(MUNDO, JUEGO) : new Map();
// tags libres para los paises nuevos: X.. que no use ni el juego ni el mundo
const tagsUsados = new Set([...paises.map((p) => p.tag), 'XAD']); // XAD: su hash choca con la clave name_li3.mandarin_language del juego (error.log, pdx_localize.cpp:187)
for (const dir of [JUEGO, MUNDO]) {
  const d = path.join(dir, 'in_game', 'setup', 'countries');
  if (fs.existsSync(d)) for (const x of fs.readdirSync(d).filter((y) => y.endsWith('.txt'))) for (const m of leeTexto(path.join(d, x)).texto.matchAll(/^\s*([A-Z][A-Z0-9]{2})\s*=\s*\{/gm)) tagsUsados.add(m[1]);
}
{ const f10 = enMundo('main_menu', 'setup', '1337', '10_countries.txt'); if (f10) for (const m of leeTexto(f10).texto.matchAll(/^\t([A-Z][A-Z0-9]{2}) = \{/gm)) tagsUsados.add(m[1]); }
let iTag = 0;
const nuevoTag = () => { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; for (; iTag < 676; iTag++) { const tg = 'X' + A[Math.floor(iTag / 26)] + A[iTag % 26]; if (!tagsUsados.has(tg)) { tagsUsados.add(tg); iTag++; return tg; } } muere('no quedan tags X.. libres'); };
const tierraR = conMapa && !tiene('--sin-reparto') ? repartePaises({ liga, vec: vecM, costa: mundoM.costa, paises, asignados, facciones: FAC.facciones, subzonas, poblacion: poblacionM, provincia: new Map([...jer].map(([l, j]) => [l, j.provincia])), puntua: conMapa ? puntuaCapital({ plant: mundoM.plant, costa: mundoM.costa, puertos, vec: vecM, poblacion: poblacionM, rio: rioM }) : null, plant: mundoM?.plant || new Map(), rio: rioM, nuevoTag: tiene('--sin-nuevos') ? null : nuevoTag, menores: (FAC.menores || []).filter((m) => menores[m.clave]).map((m) => ({ clave: m.clave, tag: menores[m.clave].tag, zona: m.zonas.find((z) => liga.mapa.zonas.some((x) => x.id === z)), zonas: m.zonas })) }) : null;

// Tierra de los paises nuevos sin dueno en el setup de RNW: va en su entrada de la copia de
// 10_countries (ya es suya al empezar, con sus pops); la que era de un estado de RNW, por efecto.
const conDuenoRNW = new Set(paises.flatMap((p) => p.locs));
const enSetupNuevo = new Map();
for (const nv of tierraR?.nuevos || []) for (const l of nv.locs) if (!conDuenoRNW.has(l)) { enSetupNuevo.set(l, nv.tag); delete tierraR.da[l]; }

// ---------------------------------------------------------------- vegetacion mezclada
// Ciudades de las facciones: sus capitales.
let vegR = null;
if (conMapa && !tiene('--sin-vegetacion')) {
  const capitalDe = new Map(paises.map((p) => [p.tag, tierraR?.capital?.[p.tag]?.a || p.capital])); // con la capital ya llevada a su zona
  const tagsF = Object.values(asignados).map((p) => p.tag);
  const ciudades = tagsF.map((t) => capitalDe.get(t)).filter(Boolean);
  const sur = new Set(FAC.facciones.filter((f) => f.continente === 'sur').map(facZona));
  const zonaSurFaccion = new Set(liga.tierra.filter((l) => sur.has(liga.zonaDe.get(l)?.id)));
  const tabla = tablaDelJuego(leeTexto(path.join(JUEGO, 'in_game', 'map_data', 'location_templates.txt')).texto);
  vegR = mezclaVegetacion({ tierra: liga.tierra, plant: mundoM.plant, vec: vecM, cen: await centros(MUNDO, JUEGO), costa: mundoM.costa, ciudades, capitales: tagsF.map((t) => capitalDe.get(t)).filter(Boolean), zonaSurFaccion, tabla });
}

// ---------------------------------------------------------------- ciudades y pueblos (rangos.mjs)
const { MANDOS: ECO, aplicaEconomia } = await import('./economia.mjs'); // aqui y no arriba: el import es de este corte
let rangosR = null, duenoFin = null;
if (tierraR) {
  duenoFin = new Map();
  for (const p of paises) for (const l of p.locs) if (liga.tierra.includes(l) && !tierraR.suelta[l]) duenoFin.set(l, p.tag);
  for (const [l, t] of Object.entries(tierraR.da)) duenoFin.set(l, t);
  for (const [l, t] of enSetupNuevo) duenoFin.set(l, t);
  const capitalesFin = new Map([...paises.map((p) => [p.tag, tierraR.capital?.[p.tag]?.a || p.capital]), ...(tierraR.nuevos || []).map((nv) => [nv.tag, nv.capital])]);
  if (arg('--dueno', null)) fs.writeFileSync(path.resolve(arg('--dueno')), JSON.stringify({ dueno: Object.fromEntries(duenoFin), capitales: Object.fromEntries([...capitalesFin].filter(([t]) => [...duenoFin.values()].includes(t))), tierra: liga.tierra }));
  const f07 = enMundo('main_menu', 'setup', '1337', '07_cities_and_buildings.txt');
  const yaTienen = new Map(f07 ? [...leeTexto(f07).texto.matchAll(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*\{\s*rank\s*=\s*([a-z_]+)/gm)].map((m) => [m[1], m[2]]) : []);
  const vegFin = new Map(liga.tierra.map((l) => [l, vegR?.veg.get(l) || mundoM.plant.get(l)?.veg]));
  const cada = Number(arg('--pueblo-cada', PUEBLO_CADA));
  // sin rango nuevo donde RNW pone un market_village (no cabe en una ciudad: error.log, building_manager)
  const veto = new Set(f07 ? [...leeTexto(f07).texto.matchAll(/\bmarket_village\s*=\s*\{[^}]*\blocation\s*=\s*([A-Za-z0-9_\-.]+)/g)].map((m) => m[1]) : []);
  const r = rangosIniciales({ dueno: duenoFin, capitales: capitalesFin, vec: vecM, costa: mundoM.costa, veg: vegFin, yaTienen, cada, veto });
  // la tierra tiene su dueno final en el setup (copia de 10_countries): todos los rangos van en la
  // copia de 07, con town_setup y sus edificios
  const setupR = r, efectoR = {};
  const n = (x) => Object.values(r).filter((v) => v === x).length;
  // rango final de la tierra con dueno (el de RNW y el nuestro) y capitales, para economia.mjs
  const fin = new Map([...[...yaTienen].filter(([l]) => duenoFin.has(l)), ...Object.entries(r)]);
  rangosR = { rangos: r, setup: setupR, efecto: efectoR, veto: veto.size, ciudades: n('city'), pueblos: n('town'), cada, ya: [...yaTienen.keys()].filter((l) => liga.tierra.includes(l)).length, fin, capitales: capitalesFin };
}

// ---------------------------------------------------------------- informe
const ahora = new Date();
const dd = (x) => String(x).padStart(2, '0');
const fecha = `${ahora.getFullYear()}-${dd(ahora.getMonth() + 1)}-${dd(ahora.getDate())} ${dd(ahora.getHours())}:${dd(ahora.getMinutes())}`;
const filaInf = ({ f, p, pt, forzado, alternativas, enMapa, cerca }) => p
  ? `| ${f.nombre.es} | ${p.tag} | ${p.nombre} | ${p.n} | ${p.capital} | ${p.region} | ${forzado ? `${pt.total.toFixed(1)} (forzado)` : enMapa ? (cerca !== undefined ? `ninguno en su zona: el mas cerca, a ${cerca} px` : `${pt.total} en su zona`) : pt.total.toFixed(1)} | ${alternativas.join(', ') || '-'} |`
  : `| ${f.nombre.es} | - | sin pais libre en ${SUBCONT[f.continente]} | | | | | |`;
const sinPais = filas.filter((x) => !x.p).map((x) => x.f.clave);
const textoMapa = liga
  ? `**Mapa final:** ${conMapa ? 'se usa' : 'no se usa'}. El ${(liga.calidad * 100).toFixed(1)} % de la tierra cae dentro de una zona del dibujo (hace falta el ${CALIDAD_MINIMA * 100} %)${liga.forzado ? ', forzado con --zonas-mapa' : ''}. Ajuste: x = ${liga.ajuste.sx.toFixed(3)} * x_dibujo + ${liga.ajuste.bx.toFixed(1)}, y = ${liga.ajuste.sy.toFixed(3)} * y_dibujo + ${liga.ajuste.by.toFixed(1)} (escala esperada ${liga.escalaEsperada}).${conMapa ? `\n\n| Zona del dibujo | Continente | Localizaciones (dibujo, aprox.) | En el mundo |\n|---|---|---|---|\n${liga.mapa.zonas.map((z) => `| ${z.nombre} | ${z.continente} | ${z.localizaciones_aprox} | ${liga.porZona.get(z.id).length} |`).join('\n')}` : ''}`
  : '**Mapa final:** no hay mapa/final/zonas.json (o --sin-mapa).';
const informe = `# Vinculo de las facciones con el mundo

Escrito por asigna-facciones.mjs el ${fecha}. Mundo: **${metaMundo.name}** (\`${metaMundo.id}\`, version ${metaMundo.version}). Paises de America que se pueden elegir: ${paises.length}.

En la pantalla de seleccion de pais ya salen con el nombre de la faccion (si no, con el del mundo: elige por la etiqueta).

| Faccion | Tag | Nombre en el mundo | Locs | Capital | Region | Puntos | Siguientes |
|---|---|---|---|---|---|---|---|
${filas.map(filaInf).join('\n')}

${sinPais.length ? `**Sin pais:** ${sinPais.join(', ')}. No se crean en esta partida.\n\n` : ''}${filasMenores.length ? `## Menores con nombre (${Object.keys(menores).length} de ${filasMenores.length})\n| Menor | Tag | Nombre en el mundo | Locs | Capital | Zona de la capital |\n|---|---|---|---|---|---|\n${filasMenores.map(({ m, p, donde }) => (p ? `| ${m.nombre.es} | ${p.tag} | ${p.nombre} | ${p.n} | ${p.capital} | ${donde} |` : `| ${m.nombre.es} | - | sin estado libre | | | |`)).join('\n')}\n\n` : ''}${textoMapa}

${tierraR ? textoPaises(tierraR) : ''}

${vegR ? textoVegetacion(vegR) : ''}
${rangosR ? `## Ciudades y pueblos al empezar (rangos.mjs)
RNW trae ${rangosR.ya} localizaciones del Nuevo Mundo con rango. Se añaden ${rangosR.ciudades} ciudades (la capital de cada pais) y ${rangosR.pueblos} pueblos (uno cada ${rangosR.cada} localizaciones de cada pais; se cambia con --pueblo-cada).
` : ''}

## Zonas (${Object.keys(zonas).length})
${Object.entries(zonas).map(([z, d]) => `- \`${z}\` (${d.ambito}): ${dz?.detalle[z] || `${d.lista.length} ${d.lista[0]?.tipo === 'area' ? 'areas del pais de la faccion' : d.lista[0]?.tipo || ''}`}`).join('\n') || '- ninguna pedida'}
${zonasSin.length ? `\nSin definir (quedan en "always = no"): ${zonasSin.join(', ')}.\n` : ''}

Para cambiar una: \`node asigna-facciones.mjs --tag <faccion>=<TAG> --instalar\` (se puede repetir).
`;
console.log(informe);
if (tiene('--seco')) process.exit(0);

// ---------------------------------------------------------------- montar la copia con el vinculo
// Nada que dependa de la hora ni de la maquina entra en el mod: dos PC con el mismo mundo
// y las mismas partes obtienen los mismos bytes (lo pide el checksum de la sala).
const obraMod = path.join(OBRA, 'gj_nuevo_mundo');
if (!fs.existsSync(path.join(BASE, '.metadata', 'metadata.json'))) muere(`falta ${BASE}/.metadata: corre antes prepara-mod.mjs`);
fs.rmSync(OBRA, { recursive: true, force: true });
fs.mkdirSync(obraMod, { recursive: true });
fs.cpSync(path.join(BASE, '.metadata'), path.join(obraMod, '.metadata'), { recursive: true });
const paisesVinculo = Object.fromEntries(Object.entries(asignados).map(([k, p]) => [k, p.tag]).sort());
// Recursos por zonas (fase 2): dependen del mundo y del reparto, asi que van en el vinculo.
const partesConBienes = fs.existsSync(PARTES) ? fs.readdirSync(PARTES).map((p) => path.join(PARTES, p)).filter((d) => fs.existsSync(path.join(d, 'in_game', 'common', 'goods'))) : [];
const rec = await asignaRecursos({ juego: JUEGO, mundo: VANILLA ? null : MUNDO, vanilla: VANILLA, paisesFaccion: paisesVinculo, modDirs: partesConBienes });
const informeRec = informeRecursos(rec);
fs.writeFileSync(path.join(RAIZ, 'RECURSOS.md'), informeRec, 'utf8');
console.log(informeRec.split('\n').filter((l) => /^\| (north|south)|Regla de mezcla|no salen/.test(l)).join('\n'));
const vinculo = {
  mundo: { id: metaMundo.id, name: metaMundo.name, version: metaMundo.version },
  paises: paisesVinculo,
  menores: Object.fromEntries(Object.entries(menores).map(([k, p]) => [k, p.tag]).sort()),
  zonas,
  tierra: tierraR ? { da: tierraR.da, suelta: tierraR.suelta, capital: tierraR.capital, rangos: rangosR?.efecto || {}, nuevos: Object.fromEntries([...enSetupNuevo].sort()), enSetup: true } : null,
  recursos: Object.fromEntries(rec.cambian.map((l) => [l, rec.asignado.get(l)])),
  // culturas y nombres (nombres.mjs): estilo de nombre de cada localizacion y grupo, cultura, fe y nombre de cada pais de relleno
  nombres: tierraR ? (await import('./nombres.mjs')).vinculoNombres({ liga, dueno: duenoFin, paises: paisesVinculo, menores: Object.fromEntries(Object.entries(menores).map(([k, p]) => [k, p.tag])), nuevos: tierraR.nuevos || [], fe: feM, zonaFaccion: new Map(FAC.facciones.map((f) => [facZona(f), f.clave])), vec: vecM }) : null,
};
const rutaVinculo = path.join(OBRA, 'vinculo.json');
fs.writeFileSync(rutaVinculo, JSON.stringify(vinculo, null, 2) + '\n', 'utf8');
const corre = (script, extra) => {
  const r = spawnSync(process.execPath, [path.join(AQUI, script), ...extra], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status, salida: (r.stdout || '') + (r.stderr || '') };
};
const fu = corre('funde-partes.mjs', ['--mod', obraMod, '--partes', PARTES, '--vinculo', rutaVinculo, '--informe', path.join(OBRA, 'INTEGRACION.md')]);
process.stdout.write(fu.salida.split('\n').slice(-6).join('\n') + '\n');
// La vegetacion mezclada va en una copia del location_templates.txt del mundo: solo cambia el
// valor de vegetation de las localizaciones que cambian; todo lo demas, igual que el del mundo.
if (vegR?.cambia.size && fu.status === 0) {
  const fT = enMundo('in_game', 'map_data', 'location_templates.txt');
  const t = fs.readFileSync(fT, 'utf8');
  let n = 0;
  const nuevo = t.replace(/^(\s*)([A-Za-z0-9_\-.]+)(\s*=\s*\{[^\n]*?\bvegetation\s*=\s*)([A-Za-z_]+)/gm, (m, sp, l, pre) => { const v = vegR.cambia.get(l); if (!v) return m; n++; return sp + l + pre + v; });
  const dest = path.join(obraMod, 'in_game', 'map_data', 'location_templates.txt');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, nuevo, 'utf8');
  console.log(`Vegetacion: ${n} localizaciones cambiadas en in_game/map_data/location_templates.txt (copia del del mundo).`);
}
// Las ciudades y los pueblos van en una copia del 07_cities_and_buildings.txt del mundo, con el
// town_setup de economia.mjs (TOWN_SETUPS): asi el juego pone sus edificios al empezar y la pantalla
// de eleccion ya los ensena. Un change_location_rank en un gancho cambia el rango, pero no trae los
// edificios del setup. Las lineas de RNW del Nuevo Mundo: con dueno, el mismo town_setup nuestro; sin
// dueno, sin town_setup (error.log de c83f781: "not owned by someone, you can't set it up through town_setup").
if (rangosR && Object.keys(rangosR.setup).length && fu.status === 0) {
  const f7 = enMundo('main_menu', 'setup', '1337', '07_cities_and_buildings.txt') || muere('no encuentro 07_cities_and_buildings.txt');
  const t7 = fs.readFileSync(f7, 'utf8');
  const fin = t7.search(/^\}/m); // cierre del bloque locations={
  const ts = (r) => ECO.SETUP[r] || muere(`economia.mjs no tiene town_setup para el rango ${r}`);
  const lineas = Object.entries(rangosR.setup).map(([l, r]) => `\t${l} = { rank = ${r} town_setup = ${ts(r)} }`);
  const nuestras = new Set(Object.keys(rangosR.setup)), nm7 = new Set(liga.tierra);
  let quitadas = 0, sinDueno = 0, otroSetup = 0;
  const cabeza = t7.slice(0, fin).split('\n').flatMap((ln) => {
    const x = ln.match(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*\{[^}]*?\brank\s*=\s*([a-z_]+)/);
    if (!x || !nm7.has(x[1])) return [ln];
    if (nuestras.has(x[1])) { quitadas++; return []; }
    if (!duenoFin.has(x[1])) { if (/\btown_setup\b/.test(ln)) sinDueno++; return [ln.replace(/\s*\btown_setup\s*=\s*[A-Za-z0-9_]+/, '')]; }
    otroSetup++;
    return [/\btown_setup\b/.test(ln) ? ln.replace(/\btown_setup\s*=\s*[A-Za-z0-9_]+/, `town_setup = ${ts(x[2])}`) : ln.replace(/\s*\}([^}]*)$/, ` town_setup = ${ts(x[2])} }$1`)];
  }).join('\n');
  const dest = path.join(obraMod, 'main_menu', 'setup', '1337', '07_cities_and_buildings.txt');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, cabeza + `\n\t# GJ Nuevo Mundo (asigna-facciones.mjs): ${lineas.length} ciudades y pueblos de la tierra repartida\n${lineas.join('\n')}\n` + t7.slice(fin), 'utf8');
  console.log(`Rangos: ${lineas.length} localizaciones en main_menu/setup/1337/07_cities_and_buildings.txt (copia del del mundo; ${quitadas} lineas de RNW sustituidas, ${otroSetup} con nuestro town_setup, ${sinDueno} sin dueno sin town_setup).`);
}
// La tierra al empezar va en una copia de 10_countries.txt del mundo (decision de los jugadores,
// 21-11 tarde): cada pais tiene en el setup su tierra final, asi que sus ciudades reciben los
// edificios, la seleccion de pais ensena el reparto y los pops nacen con su dueno. Despues del
// lobby solo cambian la cultura y la fe (gj_reparte_tierra). Los paises nuevos (reparte-tierra.mjs,
// paso 4c) entran en la misma copia: su definicion (la cultura y la fe de la mayoria de sus pops),
// su nombre (del silabario de su grupo, nombres.mjs), la tecnologia del pais de RNW mas cercano
// y un gobierno valido para cualquier cultura (setup-paises.mjs). Despues, setup-paises.mjs retira
// los estados sin tierra y las tribus vacias (--retirados quitar|vacio), saca de las tribus la tierra
// con dueno, da a las tribus la tierra suelta, quita las lineas de 07/12/18/20/26 que nombran a los
// retirados, completa discovered_areas, quita de 07 lo que cae en tierra sin dueno y mueve los mercados de 03.
let nuevosR = null;
const SP = await import('./setup-paises.mjs');
if (tierraR && fu.status === 0) {
  const f10 = enMundo('main_menu', 'setup', '1337', '10_countries.txt') || muere('no encuentro 10_countries.txt');
  const t10 = fs.readFileSync(f10, 'utf8');
  const cen10 = await centros(MUNDO, JUEGO);
  const xy = (l) => { const c = cen10.get(l); return !c ? null : Array.isArray(c) ? c : [c.x, c.y]; };
  const nm = new Set(liga.tierra);
  // hijos de primer nivel de una entrada (dos tabuladores), con sus bloques enteros
  const hijos = (texto) => {
    const r = []; let act = null, prof = 0;
    for (const linea of texto.split(/\r?\n/)) {
      if (!act) { const m = linea.match(/^\t\t([a-z_]+) =/); if (!m) continue; act = { clave: m[1], lineas: [] }; }
      act.lineas.push(linea);
      prof += (linea.match(/\{/g) || []).length - (linea.match(/\}/g) || []).length;
      if (prof <= 0) { r.push(act); act = null; prof = 0; }
    }
    return r;
  };
  // tierra final de cada pais en el Nuevo Mundo
  const suyasDe = new Map(); for (const [l, t] of duenoFin) { if (!suyasDe.has(t)) suyasDe.set(t, []); suyasDe.get(t).push(l); }
  const plantillas = [], vistos = new Set();
  let cambiadas = 0;
  const t10b = t10.replace(/^\t([A-Z][A-Z0-9]{2}) = \{\r?\n([\s\S]*?)^\t\}/gm, (todo, tag, cuerpo) => {
    vistos.add(tag);
    const hs = hijos(cuerpo), cap = hs.find((h) => h.clave === 'capital')?.lineas[0].match(/= (\S+)/)?.[1];
    if (cap && !hs.some((h) => h.clave === 'type') && hs.some((h) => h.clave === 'government') && jer.get(cap)?.continente === 'america' && xy(cap)) plantillas.push({ tag, capital: cap, hijos: hs.filter((h) => h.clave === 'starting_technology_level') });
    // fuera de sus listas own_* la tierra del Nuevo Mundo que ya no es suya; la que gana, a own_control_core
    const tenia = new Set();
    let c2 = cuerpo.replace(/^(\t\town_[a-z_]+ = \{)([^}]*)(\})/gm, (m, a, lista, z) => {
      const ls = lista.split(/\s+/).filter(Boolean), quedan = ls.filter((l) => !nm.has(l) || duenoFin.get(l) === tag);
      for (const l of ls) tenia.add(l);
      if (quedan.length === ls.length) return m;
      cambiadas += ls.length - quedan.length;
      return quedan.length ? `${a}\n\t\t\t${quedan.join(' ')}\n\t\t${z}` : `${a}\n\t\t${z}`;
    });
    const gana = (suyasDe.get(tag) || []).filter((l) => !tenia.has(l)).sort();
    if (gana.length) {
      cambiadas += gana.length;
      if (/^\t\town_control_core = \{/m.test(c2)) c2 = c2.replace(/^(\t\town_control_core = \{)([^}]*?)(\s*\t\t\})/m, (m, a, lista, z) => `${a}${lista}\n\t\t\t${gana.join(' ')}${z}`);
      else c2 = `\t\town_control_core = {\n\t\t\t${gana.join(' ')}\n\t\t}\n` + c2;
    }
    const capNueva = tierraR.capital?.[tag]?.a;
    if (capNueva) c2 = c2.replace(/^\t\tcapital = \S+/m, `\t\tcapital = ${capNueva}`);
    return c2 === cuerpo ? todo : `\t${tag} = {\n${c2}\t}`;
  });
  if (!plantillas.length) muere('no hay paises de RNW en America para copiar el gobierno');
  const cercana = (l) => { const [x, y] = xy(l); let mej = null, d0 = Infinity; for (const p of plantillas) { const [a, b] = xy(p.capital); const d = (a - x) ** 2 + (b - y) ** 2; if (d < d0 || (d === d0 && p.tag < mej.tag)) { d0 = d; mej = p; } } return mej; };
  const mayoria = (m, locs) => { const c = new Map(); for (const l of locs) for (const [k, n] of m.get(l) || []) c.set(k, (c.get(k) || 0) + n); return [...c].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null; };
  const areasDe = (locs) => { const s = new Set(); for (const l of locs) { s.add(jer.get(l)?.area); for (const w of vecM.get(l) || []) s.add(jer.get(w)?.area); } s.delete(undefined); return [...s].sort(); };
  const color = (tag, k) => { const h = crypto.createHash('sha256').update(`gj-nuevo-${k}-${tag}`).digest(); return `rgb { ${40 + (h[0] % 176)} ${40 + (h[1] % 176)} ${40 + (h[2] % 176)} }`; };
  // nombre, adjetivo y fe de cada pais de relleno: los de vinculo.nombres (nombres.mjs, silabario de su grupo)
  const rell = vinculo.nombres?.rellenos || {};
  const defs = [], entradas = [], sinCultura = [];
  for (const nv of [...(tierraR.nuevos || [])].sort((a, b) => a.tag.localeCompare(b.tag))) {
    const suyas = (suyasDe.get(nv.tag) || []).sort();
    if (!suyas.includes(nv.capital)) muere(`${nv.tag}: su capital ${nv.capital} no es suya`);
    if (!rell[nv.tag]) muere(`${nv.tag}: sin nombre ni cultura en vinculo.nombres`);
    // la cultura del setup sigue siendo la de la mayoria de sus pops (una cultura sin pops en la
    // definicion da initialize_from_bookmark.cpp:232); la nueva (rell.cultura) la pone gj_fundar_faccion tras el lobby
    const cultura = mayoria(culturaM, suyas), fe = rell[nv.tag].religion;
    if (!cultura || !fe) { sinCultura.push(nv.tag); continue; }
    const p = cercana(nv.capital);
    defs.push(`${nv.tag} = {\n\tcolor = ${color(nv.tag, 1)}\n\tcolor2 = ${color(nv.tag, 2)}\n\n\tculture_definition = ${cultura}\n\treligion_definition = ${fe}\n}\n`);
    entradas.push(`\t${nv.tag} = {\n\t\town_control_core = {\n\t\t\t${suyas.join(' ')}\n\t\t}\n\t\tcapital = ${nv.capital}\n${p.hijos.map((h) => h.lineas.join('\n')).join('\n') || `\t\tstarting_technology_level = ${SP.TECNOLOGIA_NUEVOS}`}\n${SP.GOBIERNO_NUEVOS}\n\t\tdiscovered_areas = {\n\t\t\t${areasDe(suyas).join(' ')}\n\t\t}\n\t}`);
    nv.cultura = cultura; nv.fe = fe; nv.plantilla = p.tag; nv.nombre = rell[nv.tag].nombre; nv.adj = rell[nv.tag].adj;
  }
  if (sinCultura.length) muere(`paises nuevos sin pops con cultura y fe: ${sinCultura.join(' ')}`);
  const faltan = [...suyasDe.keys()].filter((t) => !vistos.has(t) && !(tierraR.nuevos || []).some((nv) => nv.tag === t));
  if (faltan.length) muere(`paises con tierra que no estan en 10_countries: ${faltan.join(' ')}`);
  if (entradas.length) {
    escribeConBom(path.join(obraMod, 'in_game', 'setup', 'countries', 'gj_paises_nuevos.txt'), `# GJ Nuevo Mundo (asigna-facciones.mjs): paises nuevos en la tierra que nadie tenia al empezar.\n# Cultura y fe: las de la mayoria de sus pops.\n\n${defs.join('\n')}`);
    for (const lg of fs.readdirSync(path.join(obraMod, 'main_menu', 'localization')).filter((d) => fs.statSync(path.join(obraMod, 'main_menu', 'localization', d)).isDirectory()).sort()) {
      const lineas = tierraR.nuevos.filter((nv) => nv.cultura).sort((a, b) => a.tag.localeCompare(b.tag)).flatMap((nv) => [` ${nv.tag}: "${nv.nombre}"`, ` ${nv.tag}_ADJ: "${nv.adj}"`]);
      escribeConBom(path.join(obraMod, 'main_menu', 'localization', lg, `gj_paises_nuevos_l_${lg}.yml`), `l_${lg}:\n # GENERADO por asigna-facciones.mjs: nombre y adjetivo del silabario de su grupo (nombres.mjs)\n${lineas.join('\n')}\n`);
    }
  }
  const cierre = t10b.match(/\r?\n\}\r?\n\}\s*$/) || muere('10_countries.txt: no encuentro el cierre de countries = { countries = {');
  const dest10 = path.join(obraMod, 'main_menu', 'setup', '1337', '10_countries.txt');
  fs.mkdirSync(path.dirname(dest10), { recursive: true });
  fs.writeFileSync(dest10, t10b.slice(0, cierre.index) + (entradas.length ? `\n\t# GJ Nuevo Mundo (asigna-facciones.mjs): ${entradas.length} paises nuevos\n${entradas.join('\n')}` : '') + t10b.slice(cierre.index), 'utf8');
  // retirados, tribus, referencias y descubrimiento (setup-paises.mjs). 07 es la copia ya escrita
  // en el montaje (rangos); los demas, los del mundo. Solo se copian los que cambian.
  const modoRet = arg('--retirados', SP.RETIRADOS);
  if (!['quitar', 'vacio'].includes(modoRet)) muere(`--retirados ${modoRet}: tiene que ser quitar o vacio`);
  const enSetup = (f) => { const o = path.join(obraMod, 'main_menu', 'setup', '1337', f); return fs.existsSync(o) ? o : enMundo('main_menu', 'setup', '1337', f); };
  const refs = Object.fromEntries(SP.REFERENCIAS.filter(enSetup).map((f) => [f, fs.readFileSync(enSetup(f), 'utf8')]));
  const sp = SP.arreglaSetup({ t10: fs.readFileSync(dest10, 'utf8'), otros: refs, nativos: nativos || new Set(), retirados: tierraR.retirados, modo: modoRet, area: (l) => jer.get(l)?.area, vec: vecM, nm });
  fs.writeFileSync(dest10, sp.t10, 'utf8');
  if (modoRet === 'vacio' && sp.fuera.size) { // el bloque vacio pide is_historic en la definicion (copia de la del mundo)
    const fDef = enMundo('in_game', 'setup', 'countries', SP.DEFINICIONES) || muere(`no encuentro ${SP.DEFINICIONES} en el mundo`);
    const h = SP.marcaHistoricos(fs.readFileSync(fDef, 'utf8'), sp.fuera);
    if (h.faltan.length) muere(`retirados sin definicion en ${SP.DEFINICIONES}: ${h.faltan.slice(0, 10).join(' ')}`);
    fs.writeFileSync(path.join(obraMod, 'in_game', 'setup', 'countries', SP.DEFINICIONES), h.texto, 'utf8');
  }
  for (const [f, t] of Object.entries(sp.otros)) if (t !== refs[f]) fs.writeFileSync(path.join(obraMod, 'main_menu', 'setup', '1337', f), t, 'utf8');
  console.log(SP.textoSetup(sp.informe));
  // la copia tiene que dar, en el Nuevo Mundo, exactamente el reparto
  const leido = new Map(); for (const [t, ls] of paisesDelMundo(obraMod, JUEGO)) for (const l of ls) if (nm.has(l)) leido.set(l, t);
  const malas = [...nm].filter((l) => leido.get(l) !== duenoFin.get(l));
  if (malas.length) muere(`la copia de 10_countries no da el reparto en ${malas.length} localizaciones (p. ej. ${malas.slice(0, 3).join(' ')})`);
  nuevosR = (tierraR.nuevos || []).filter((nv) => nv.cultura);
  console.log(`Tierra en el setup: ${cambiadas} localizaciones cambian de lista en main_menu/setup/1337/10_countries.txt (copia del del mundo), comprobada; ${nuevosR.length} paises nuevos.`);
}
// Economia de salida (economia.mjs, estudio-v5/economia.md): copias de 06_pops, 14_development,
// 09_roads y 03_markets del mundo, la tecnologia en la copia de 10_countries y los town_setup.
// Los bienes que cambia asigna-recursos van tambien en la copia de location_templates: el juego
// pone la aldea (farming_village, forest_village) por el bien de la plantilla, y el
// change_raw_material del arranque la dejaba invalida (error.log de c83f781: las 90 "invalid
// building" son todas de localizaciones que cambian de bien). El efecto se queda (ya no cambia nada).
if (rangosR && fu.status === 0) {
  const capEco = new Map([...rangosR.capitales].filter(([t, l]) => duenoFin.get(l) === t));
  const sinCap = [...new Set(duenoFin.values())].filter((t) => !capEco.has(t));
  if (sinCap.length) muere(`economia: paises con tierra y sin capital propia: ${sinCap.join(' ')}`);
  const eco = aplicaEconomia({ obra: obraMod, mundo: MUNDO, juego: JUEGO, jer, dueno: duenoFin, capitales: capEco, rangos: rangosR.fin, vec: vecM });
  // los formables de RNW, cerrados a nuestros paises (setup-paises.mjs, cierraFormables)
  const relF = ['in_game', 'common', 'formable_countries', 'rnw_formations.txt'];
  if (fs.existsSync(enMundo(...relF))) {
    const cf = SP.cierraFormables(fs.readFileSync(enMundo(...relF), 'utf8'), [...new Set(duenoFin.values())].sort());
    fs.mkdirSync(path.dirname(path.join(obraMod, ...relF)), { recursive: true });
    fs.writeFileSync(path.join(obraMod, ...relF), cf.texto, 'utf8');
    console.log(`Formables de RNW: ${cf.n} cerrados a los ${new Set(duenoFin.values()).size} paises del mod (copia del del mundo).`);
  }
  const rT = path.join(obraMod, 'in_game', 'map_data', 'location_templates.txt');
  const tT = fs.readFileSync(fs.existsSync(rT) ? rT : enMundo('in_game', 'map_data', 'location_templates.txt'), 'utf8');
  let nBien = 0;
  const tT2 = tT.replace(/^(\s*)([A-Za-z0-9_\-.]+)(\s*=\s*\{[^\n]*?\braw_material\s*=\s*)([A-Za-z_]+)/gm, (m, sp, l, pre, b) => { const v = vinculo.recursos[l]; if (!v || v === b) return m; nBien++; return sp + l + pre + v; });
  fs.mkdirSync(path.dirname(rT), { recursive: true });
  fs.writeFileSync(rT, tT2, 'utf8');
  const ks = [...eco.factor.values()];
  console.log(`Economia: ${eco.cambian} localizaciones con gente nueva en 06_pops (${eco.sinGente} sin gente en RNW, igual), desarrollo en 14_development, ${eco.caminos} caminos nuevos en 09_roads (${eco.conCamino} de ${eco.tierra} localizaciones con camino), ${eco.mercados} mercados en 03_markets, tecnologia ${ECO.TECNOLOGIA} en ${eco.tecnologia} paises; factor de gente por pais ${Math.min(...ks)}-${Math.max(...ks)}; ${nBien} bienes en location_templates.`);
}
if (fu.status !== 0) muere('funde-partes ha fallado: no sigo');
const rutaMeta = path.join(obraMod, '.metadata', 'metadata.json');
const meta = JSON.parse(leeTexto(rutaMeta).texto);
meta.relationships = VANILLA ? [] : [{ rel_type: 'dependency', id: metaMundo.id, display_name: metaMundo.name, resource_type: 'mod', version: metaMundo.version }];
escribeConBom(rutaMeta, JSON.stringify(meta, null, 4) + '\n');
const rutaInforme = path.resolve(arg('--informe', path.join(RAIZ, 'VINCULO.md')));
fs.writeFileSync(rutaInforme, informe, 'utf8');

// Huella: SHA-256 de rutas y bytes, para comparar con el otro PC antes de abrir la sala.
function huella(dir) {
  const h = crypto.createHash('sha256');
  for (const f of listaFicheros(dir, () => true).map((x) => path.relative(dir, x).split(path.sep).join('/')).sort()) {
    h.update(f + '\0'); h.update(fs.readFileSync(path.join(dir, f))); h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}
console.log(`Montado en ${path.relative(RAIZ, obraMod)} con ${Object.keys(asignados).length} facciones. Huella: ${huella(obraMod)}`);

if (!tiene('--instalar')) process.exit(0);

// ---------------------------------------------------------------- comprobar y copiar
const comp = corre('comprueba-mod.mjs', ['--mod', obraMod, '--juego', JUEGO, '--mundo', MUNDO]);
process.stdout.write(comp.salida.split('\n').filter((l) => !l.startsWith('AVISO')).join('\n') + '\n');
if (comp.status !== 0) muere('el comprobador ha fallado: no copio nada');
const destino = path.join(DOC_MOD, 'gj_nuevo_mundo');
if (fs.existsSync(destino)) {
  const mm = path.join(destino, '.metadata', 'metadata.json');
  const suyo = fs.existsSync(mm) && JSON.parse(leeTexto(mm).texto).id === 'gj_nuevo_mundo';
  if (!suyo) muere(`${destino} existe y no es este mod: no lo toco`);
  fs.rmSync(destino, { recursive: true, force: true });
}
fs.mkdirSync(DOC_MOD, { recursive: true });
fs.cpSync(obraMod, destino, { recursive: true });
console.log(`\nInstalado en ${destino} (huella ${huella(destino)}). Activa «GJ Nuevo Mundo» en la coleccion, DESPUES del mundo.`);
