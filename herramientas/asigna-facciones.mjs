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
//   --sin-reparto       no da a cada faccion su zona al empezar (reparte-tierra.mjs)
//   --sin-vegetacion    no mezcla la vegetacion (mezcla-vegetacion.mjs)
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
import { cargaMundo, vecinos, centros } from './mundo.mjs';
import { mezclaVegetacion, textoVegetacion, tablaDelJuego } from './mezcla-vegetacion.mjs';
import { reparteTierra, textoTierra } from './reparte-tierra.mjs';
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
const tierraR = conMapa && !tiene('--sin-reparto') ? reparteTierra({ liga, vec: vecM, paises, asignados, facciones: FAC.facciones }) : null;

// ---------------------------------------------------------------- vegetacion mezclada
// Ciudades de las facciones: su capital y las de los estados que absorben al empezar.
let vegR = null;
if (conMapa && !tiene('--sin-vegetacion')) {
  const capitalDe = new Map(paises.map((p) => [p.tag, tierraR?.capital?.[p.tag]?.a || p.capital])); // con la capital ya llevada a su zona
  const tagsF = Object.values(asignados).map((p) => p.tag);
  const ciudades = [...tagsF, ...tagsF.flatMap((t) => tierraR?.absorbe[t] || [])].map((t) => capitalDe.get(t)).filter(Boolean);
  const sur = new Set(FAC.facciones.filter((f) => f.continente === 'sur').map(facZona));
  const zonaSurFaccion = new Set(liga.tierra.filter((l) => sur.has(liga.zonaDe.get(l)?.id)));
  const tabla = tablaDelJuego(leeTexto(path.join(JUEGO, 'in_game', 'map_data', 'location_templates.txt')).texto);
  vegR = mezclaVegetacion({ tierra: liga.tierra, plant: mundoM.plant, vec: vecM, cen: await centros(MUNDO, JUEGO), costa: mundoM.costa, ciudades, capitales: tagsF.map((t) => capitalDe.get(t)).filter(Boolean), zonaSurFaccion, tabla });
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

${sinPais.length ? `**Sin pais:** ${sinPais.join(', ')}. No se crean en esta partida.\n\n` : ''}${textoMapa}

${tierraR ? textoTierra(tierraR) : ''}

${vegR ? textoVegetacion(vegR) : ''}

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
  zonas,
  tierra: tierraR ? { absorbe: tierraR.absorbe, da: tierraR.da, capital: tierraR.capital } : null,
  recursos: Object.fromEntries(rec.cambian.map((l) => [l, rec.asignado.get(l)])),
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
