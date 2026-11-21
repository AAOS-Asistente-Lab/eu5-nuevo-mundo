// setup-paises.mjs: deja el setup de paises del mod coherente con el reparto (reparte-paises.mjs).
// Trabaja sobre el texto de la copia de 10_countries.txt que escribe asigna-facciones.mjs y sobre
// los ficheros del setup que nombran paises (07, 12, 18, 20 y 26 de main_menu/setup/1337):
//   1. Tribus de RNW (type = pop): fuera de su add_pops_from_locations la tierra que ya tiene dueno
//      (error.log: "is owned by X but has no pops owned by that country"). La que se queda sin
//      ninguna localizacion se retira como un estado.
//   2. Retirados (estados de RNW sin tierra tras el reparto y tribus vacias): con RETIRADOS =
//      'quitar' su bloque sale de la copia (lo que pide Gabriel probar primero); con 'vacio' se
//      queda sin tierra y sin capital, como OGK y HLE del 10_countries del juego (lineas 35360 y
//      37278 de game/main_menu/setup/1337/10_countries.txt). La definicion (rnw_natives.txt) no se
//      toca. En los dos casos salen las lineas de 07/12/18/20/26 que los nombran.
//   1b. Tierra suelta: la del Nuevo Mundo que no tiene dueno ni esta en ninguna tribu (tierra de
//      estados retirados que el reparto deja libre) pasa a la tribu mas cercana por tierra suelta,
//      como en el mundo de RNW, donde toda localizacion es de un estado o de una tribu. Se cuenta desde
//      la tierra que la tribu tenia en RNW: una tribu vaciada que gana asi tierra no se retira. Lo
//      que no alcanza ninguna por tierra suelta (islas, bolsas entre estados) va a la mas cercana
//      por cualquier casilla, mar incluido.
//   3. Descubrimiento: cada pais con tierra en el Nuevo Mundo conoce las areas de su tierra y las
//      vecinas, la de su capital y las de las capitales de los paises que nombra en 12/18/20
//      (error.log: "does not know its capital" y "have not discovered the capital of").
//   4. Tierra sin dueno en 07 y 03: salen de 07 las lineas de una localizacion del Nuevo Mundo sin
//      dueno (rango, town_setup o edificio en ella; error.log de c83f781, initialize_from_bookmark.cpp:2340:
//      "that location is not owned by someone, you can't set it up through town_setup!"). Cada
//      add_market de 03 en tierra sin dueno pasa a la localizacion con dueno y rango mas cercana sin
//      mercado, a MERCADO_PASOS como mucho; si no, se quita (el juego no trae ningun add_market sin
//      dueno; 120 de sus 123 tienen rango en 07).
// Sin azar ni dependencia del idioma del PC. Comprobacion: node setup-paises.mjs --prueba
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analiza, esBloque, valoresSueltos } from './pdx.mjs';

// ---------------------------------------------------------------- mandos
export const RETIRADOS = 'quitar'; // 'quitar' o 'vacio' (asigna-facciones.mjs --retirados vacio)
export const REFERENCIAS = ['03_markets.txt', '07_cities_and_buildings.txt', '12_diplomacy.txt', '18_opinions.txt', '20_rivals.txt', '26_ai_personalities.txt'];
export const EDIFICIOS = '07_cities_and_buildings.txt', MERCADOS = '03_markets.txt';
// Un add_market en tierra sin dueno se mueve como mucho estos pasos por tierra; mas lejos, su zona
// es tierra libre y el mercado se quita. Calibrar en partida (acceso a mercado de los paises cercanos).
export const MERCADO_PASOS = 8;
export const PAREJAS = ['12_diplomacy.txt', '18_opinions.txt', '20_rivals.txt']; // cada linea: un pais que mira a otro
export const TECNOLOGIA_NUEVOS = 2; // si el pais de RNW mas cercano no trae starting_technology_level
// Gobierno de los paises nuevos, el mismo para cualquier cultura y fe. Cada pieza, con sus
// requisitos en game/in_game/common (ninguno pide cultura ni religion):
//   monarchy                government_types/00_default.txt:1 (sin potential; admite cognatic_primogeniture, linea 4)
//   cognatic_primogeniture  heir_selections/monarchy.txt:1 (potential: no tener fratricide_succesion ni unigeniture)
//   assembly                parliament_types/00_default.txt:11 (allow: no tener supreme_authority_modifier)
//   privilegios             estate_privileges/nobles_estate.txt:13, 104 (potential: monarchy o tribe), 152;
//                           clergy_estate.txt:44 (potential y allow vacios); burghers_estate.txt:364, 1, 948;
//                           peasants_estate.txt:155, 182, 194 (sin potential ni allow)
//   heir_any_religion       laws/01_common.txt:1860 (potential: que la sucesion no tenga empty_heir_religion_law)
// Es game/main_menu/setup/templates/amerindian_monarchy.txt sin lo que pide fe o cultura (polygyny,
// laws/01_common.txt:1724, pide fe pagana; clergy_land_rights, clergy_estate.txt:137, fe no cristiana)
// y sin reformas: los 13 estados de RNW con ese include no traen ninguna.
export const GOBIERNO_NUEVOS = `\t\tgovernment = {
\t\t\ttype = monarchy
\t\t\their_selection = cognatic_primogeniture
\t\t\tparliament = {
\t\t\t\tparliament_type = assembly
\t\t\t}
\t\t\tprivilege = {
\t\t\t\tnobles_land_rights noble_marriage_rights noble_leaders_only
\t\t\t\tclergy_enforced_unity
\t\t\t\tmarket_fairs formal_guilds building_roads_rights
\t\t\t\tallow_hunting communal_lands partial_yield
\t\t\t}
\t\t\tlaws = {
\t\t\t\their_religion_law = heir_any_religion
\t\t\t}
\t\t\truler = random
\t\t}`;

const RE_BLOQUE = /^\t([A-Z][A-Z0-9]{2}) = \{\r?\n[\s\S]*?^\t\}[ \t]*(?:\r?\n|$)/gm;
const RE_TAG = /(?<![A-Za-z0-9_:.@$])[A-Z][A-Z0-9]{2}(?![A-Za-z0-9_:.])/g;
const lista = (cuerpo, clave) => { const m = cuerpo.match(new RegExp(`^\\t\\t${clave} = \\{([^}]*)\\}`, 'm')); return m ? m[1].split(/\s+/).filter(Boolean) : null; };
const ponLista = (cuerpo, clave, ls) => cuerpo.replace(new RegExp(`^(\\t\\t${clave} = \\{)[^}]*(\\})`, 'm'), (m, a, z) => (ls.length ? `${a}\n\t\t\t${ls.join(' ')}\n\t\t${z}` : `${a}\n\t\t${z}`));
export const tagsDeLinea = (linea) => linea.replace(/#.*/, '').match(RE_TAG) || [];
// Localizacion de una linea de 07 (`loc = { rank ... }` o `edificio = { ... location = loc }`) o de 03 (`add_market = loc`)
export const locDeLinea = (linea) => { const c = linea.replace(/#.*/, ''); return (c.match(/\blocation\s*=\s*(\w+)/) || c.match(/^\s*(\w+)\s*=\s*\{[^{}]*\}\s*$/) || c.match(/^\s*add_market\s*=\s*(\w+)/) || [])[1] ?? null; };
export const conRango = (t07) => new Set(t07.split('\n').filter((l) => /\brank\s*=/.test(l.replace(/#.*/, ''))).map(locDeLinea).filter(Boolean));

// Tierra de cada pais segun el arbol: Map(tag -> { own: [], pops: [] })
export function tierraDe(t10) {
  const raiz = analiza(t10.replace(/^﻿/, ''));
  const ext = raiz.items.find((x) => x.k === 'countries'), dentro = esBloque(ext?.v) ? ext.v.items.find((x) => x.k === 'countries') : null;
  const r = new Map();
  for (const it of esBloque(dentro?.v) ? dentro.v.items : []) {
    if (!it.k || !esBloque(it.v)) continue;
    const t = { own: [], pops: [], capital: null };
    for (const x of it.v.items) {
      if (x.k && /^own_/.test(x.k)) t.own.push(...valoresSueltos(x.v));
      else if (x.k === 'add_pops_from_locations') t.pops.push(...valoresSueltos(x.v));
      else if (x.k === 'capital' && typeof x.v === 'string') t.capital = x.v;
    }
    r.set(it.k, t);
  }
  return r;
}

// Quita las lineas que nombran un tag de `fuera`; cada una tiene que ser una sentencia entera.
export function filtraLineas(texto, fuera, nombre = '') {
  let quitadas = 0;
  const ls = texto.split('\n').filter((linea, i) => {
    if (!tagsDeLinea(linea).some((t) => fuera.has(t))) return true;
    const c = linea.replace(/#.*/, '');
    if (!/\{/.test(c) || (c.match(/\{/g) || []).length !== (c.match(/\}/g) || []).length) throw new Error(`${nombre}:${i + 1}: nombra un pais retirado y no es una sentencia de una linea: ${linea.trim()}`);
    quitadas++;
    return false;
  });
  return { texto: ls.join('\n'), quitadas };
}

export function arreglaSetup({ t10, otros = {}, nativos, retirados = [], modo = RETIRADOS, area, vec, nm }) {
  if (!['quitar', 'vacio'].includes(modo)) throw new Error(`modo de retirados desconocido: ${modo} (quitar o vacio)`);
  const antes = tierraDe(t10);
  const conDueno = new Set([...antes.values()].flatMap((t) => t.own));
  const fuera = new Set(), conTierra = [];
  for (const t of retirados) { if (antes.get(t)?.own.length) conTierra.push(t); else fuera.add(t); }
  // 1. tribus de RNW
  let sacadas = 0, tribusVacias = 0;
  let texto = t10.replace(RE_BLOQUE, (b, tag) => {
    if (!nativos.has(tag) || fuera.has(tag)) return b;
    const ls = lista(b, 'add_pops_from_locations');
    if (!ls) return b;
    const quedan = ls.filter((l) => !conDueno.has(l));
    if (quedan.length === ls.length) return b;
    sacadas += ls.length - quedan.length;
    if (!quedan.length) { fuera.add(tag); tribusVacias++; }
    return ponLista(b, 'add_pops_from_locations', quedan);
  });
  // 1b. tierra suelta -> tribu mas cercana: a capas por la tierra suelta, desde la tierra que tenia
  // cada tribu en RNW (aunque ya sea de un estado; una tribu vaciada que gana tierra no se retira)
  const tribu = new Map(), suelta = (l) => nm.has(l) && !conDueno.has(l);
  for (const [t, p] of antes) if (nativos.has(t)) for (const l of p.pops) if (!tribu.has(l)) tribu.set(l, t);
  // Primero solo por tierra suelta; lo que quede (islas, bolsas entre estados), por cualquier casilla.
  const sueltas = new Set([...nm].filter((l) => suelta(l) && !tribu.has(l))), gana = new Map();
  for (const porTodo of [false, true]) {
    const de = new Map(tribu);
    for (let capa = [...de.keys()].sort(); capa.length && sueltas.size;) {
      const sig = [];
      for (const l of capa) for (const w of [...(vec.get(l) || [])].sort()) {
        if (de.has(w)) continue;
        const t = de.get(l);
        if (sueltas.delete(w)) { tribu.set(w, t); if (!gana.has(t)) gana.set(t, []); gana.get(t).push(w); } else if (!porTodo) continue;
        de.set(w, t); sig.push(w);
      }
      capa = sig;
    }
  }
  let aTribus = 0;
  texto = texto.replace(RE_BLOQUE, (b, tag) => {
    if (!gana.has(tag)) return b;
    aTribus += gana.get(tag).length;
    if (fuera.delete(tag)) tribusVacias--;
    return ponLista(b, 'add_pops_from_locations', [...(lista(b, 'add_pops_from_locations') || []), ...gana.get(tag).sort()]);
  });
  // 2. retirados
  const vistos = new Set();
  texto = texto.replace(RE_BLOQUE, (b, tag) => {
    if (!fuera.has(tag)) return b;
    vistos.add(tag);
    if (modo === 'quitar') return '';
    let v = b.replace(/^\t\tcapital = \S+[^\n]*\n/m, '');
    for (const m of [...v.matchAll(/^\t\t(own_[a-z_]+|add_pops_from_locations) = \{/gm)]) v = ponLista(v, m[1], []);
    return v;
  });
  const sinBloque = [...fuera].filter((t) => !vistos.has(t)).sort();
  if (sinBloque.length) throw new Error(`retirados sin bloque en la copia de 10_countries: ${sinBloque.join(' ')}`);
  const fueraOtros = {}, lineas = {};
  for (const [f, t] of Object.entries(otros)) { const r = filtraLineas(t, fuera, f); fueraOtros[f] = r.texto; lineas[f] = r.quitadas; }
  // 3. descubrimiento
  const despues = tierraDe(texto);
  const mira = new Map();
  for (const f of PAREJAS) for (const linea of (fueraOtros[f] ?? '').split('\n')) {
    const ts = [...new Set(tagsDeLinea(linea))];
    for (const a of ts) for (const b of ts) if (a !== b) { if (!mira.has(a)) mira.set(a, new Set()); mira.get(a).add(b); }
  }
  let areasNuevas = 0, paisesAreas = 0;
  texto = texto.replace(RE_BLOQUE, (b, tag) => {
    const t = despues.get(tag), suyas = (t?.own || []).filter((l) => nm.has(l));
    if (!suyas.length) return b;
    const pide = new Set();
    for (const l of suyas) { pide.add(area(l)); for (const w of vec.get(l) || []) pide.add(area(w)); }
    pide.add(area(t.capital));
    for (const o of mira.get(tag) || []) { const c = despues.get(o)?.capital; if (c) pide.add(area(c)); }
    pide.delete(undefined); pide.delete(null);
    const ya = lista(b, 'discovered_areas');
    const faltan = [...pide].filter((a) => !(ya || []).includes(a)).sort();
    if (!faltan.length) return b;
    areasNuevas += faltan.length; paisesAreas++;
    if (ya) return b.replace(/^(\t\tdiscovered_areas = \{[^}]*?)(\s*\t\t\})/m, (m, a, z) => `${a}\n\t\t\t${faltan.join(' ')}${z}`);
    return b.replace(/^(\t\tcapital = [^\n]*\n)/m, `$1\t\tdiscovered_areas = {\n\t\t\t${faltan.join(' ')}\n\t\t}\n`);
  });
  // 4. tierra sin dueno en 07 (fuera) y en 03 (el mercado se mueve)
  let en07 = 0, movidos = [], perdidos = [];
  if (fueraOtros[EDIFICIOS] != null) {
    const ls = fueraOtros[EDIFICIOS].split('\n'), q = ls.filter((x) => !suelta(locDeLinea(x)));
    en07 = ls.length - q.length; fueraOtros[EDIFICIOS] = q.join('\n');
  }
  if (fueraOtros[MERCADOS] != null) {
    const rango = conRango(fueraOtros[EDIFICIOS] ?? ''), ls = fueraOtros[MERCADOS].split('\n');
    const mercados = new Set(ls.map((x) => /^\s*add_market\b/.test(x) && locDeLinea(x)).filter(Boolean));
    fueraOtros[MERCADOS] = ls.flatMap((x) => {
      const l = /^\s*add_market\b/.test(x) && locDeLinea(x);
      if (!l || !suelta(l)) return [x];
      // a capas por la tierra, hasta MERCADO_PASOS; en cada capa, la primera por nombre
      const visto = new Set([l]);
      for (let capa = [l], paso = 0; capa.length && paso <= MERCADO_PASOS; paso++) {
        const ok = capa.filter((w) => conDueno.has(w) && rango.has(w) && !mercados.has(w)).sort()[0];
        if (ok) { mercados.add(ok); movidos.push(`${l}>${ok}`); return [x.replace(l, ok)]; }
        capa = [...new Set(capa.flatMap((w) => [...(vec.get(w) || [])]))].filter((w) => nm.has(w) && !visto.has(w)).sort();
        capa.forEach((w) => visto.add(w));
      }
      perdidos.push(l); return [];
    }).join('\n');
  }
  return { t10: texto, otros: fueraOtros, informe: { retirados: fuera.size - tribusVacias, tribusVacias, sacadas, aTribus, sinTribu: [...sueltas].sort(), conTierra, lineas, areasNuevas, paisesAreas, en07, movidos, perdidos, modo } };
}

export const textoSetup = (i) => `Setup de paises (setup-paises.mjs, retirados: ${i.modo}): ${i.retirados} estados y ${i.tribusVacias} tribus vacias retirados; ${i.sacadas} localizaciones con dueno fuera de las tribus; ${Object.entries(i.lineas).map(([f, n]) => `${n} lineas en ${f}`).join(', ')}; ${i.aTribus} localizaciones sueltas a la tribu mas cercana${i.sinTribu.length ? ` (${i.sinTribu.length} sin tribu al alcance)` : ''}; ${i.areasNuevas} areas descubiertas nuevas en ${i.paisesAreas} paises; ${i.en07} lineas de 07 en tierra sin dueno; ${i.movidos.length} mercados de 03 movidos a tierra con dueno (${i.movidos.join(' ') || '-'})${i.perdidos.length ? ` y ${i.perdidos.length} quitados, sin tierra con dueno y rango a ${MERCADO_PASOS} pasos (${i.perdidos.join(' ')})` : ''}.${i.conTierra.length ? ` Retirados que aun tienen tierra fuera del Nuevo Mundo (se quedan): ${i.conTierra.join(' ')}.` : ''}`;

// ---------------------------------------------------------------- comprobacion
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--prueba')) {
  const { default: assert } = await import('node:assert/strict');
  const t10 = 'countries = {\n\tcountries = {\n'
    + '\tAAA = {\n\t\town_control_core = {\n\t\t\tl1 l2\n\t\t}\n\t\tcapital = l1\n\t\tdiscovered_areas = {\n\t\t\ta1\n\t\t}\n\t}\n'
    + '\tBBB = {\n\t\town_control_core = {\n\t\t}\n\t\tcapital = l1\n\t}\n'
    + '\tTTT = {\n\t\ttype = pop\n\t\tadd_pops_from_locations = {\n\t\t\tl2 l9\n\t\t}\n\t}\n'
    + '\tUUU = {\n\t\ttype = pop\n\t\tadd_pops_from_locations = {\n\t\t\tl1\n\t\t}\n\t}\n'
    + '\tCCC = {\n\t\town_control_core = {\n\t\t\tl3\n\t\t}\n\t\tcapital = l3\n\t}\n'
    + '\tWWW = {\n\t\ttype = pop\n\t\tadd_pops_from_locations = {\n\t\t\tl3\n\t\t}\n\t}\n'
    + '}\n}\n';
  const otros = { '20_rivals.txt': 'x = {\n\trival = { first = AAA second = BBB }\n\trival = { first = AAA second = CCC } # comentario BBB\n}\n', '26_ai_personalities.txt': '\tUUU = { ai_personality = ai_balanced }\n\tWWW = { ai_personality = ai_balanced }\n',
    [EDIFICIOS]: 'locations = {\n\tl3 = { rank = town }\n\tl4 = { rank = town town_setup = x }\n\tm = { tag = AAA level = 1 location = l4 }\n}\n', [MERCADOS]: 'market_manager = {\n\tadd_market = l4\n\tadd_market = l7\n}\n' };
  const area = (l) => ({ l1: 'a1', l2: 'a2', l3: 'a3', l4: 'a4', l5: 'a5', l6: 'a6', l7: 'a7', l8: 'a8', l9: 'a9' })[l];
  const vec = new Map([['l2', new Set(['l9'])], ['l9', new Set(['l5', 'w1'])], ['w1', new Set(['l8'])], ['l4', new Set(['l3'])], ['l1', new Set(['l6'])]]), nm = new Set(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9']);
  const r = arreglaSetup({ t10, otros, nativos: new Set(['AAA', 'BBB', 'TTT', 'UUU', 'CCC', 'WWW']), retirados: ['BBB', 'CCC'], area, vec, nm });
  const d = tierraDe(r.t10);
  assert.deepEqual([...d.keys()], ['AAA', 'TTT', 'UUU', 'CCC']); // BBB retirado, WWW vacia; CCC aun tiene tierra
  assert.deepEqual(d.get('UUU').pops, ['l6']); // vaciada, pero gana la suelta junto a su tierra de RNW: no se retira
  assert.deepEqual(d.get('TTT').pops, ['l9', 'l5', 'l8']); // l5, suelta, pasa a la tribu vecina; l8, isla, a la de mas cerca por mar
  assert.deepEqual(r.informe.sinTribu, ['l4', 'l7']); // ninguna tribu las alcanza por ninguna casilla
  assert.equal(r.otros[EDIFICIOS], 'locations = {\n\tl3 = { rank = town }\n}\n'); // fuera el rango y el edificio de l4, sin dueno
  assert.equal(r.otros[MERCADOS], 'market_manager = {\n\tadd_market = l3\n}\n'); // l4, a la tierra con dueno y rango mas cercana; l7, sin sitio, fuera
  assert.deepEqual(r.informe.perdidos, ['l7']);
  assert.deepEqual(r.informe.conTierra, ['CCC']);
  assert.equal(r.otros['20_rivals.txt'], 'x = {\n\trival = { first = AAA second = CCC } # comentario BBB\n}\n');
  assert.equal(r.otros['26_ai_personalities.txt'], '\tUUU = { ai_personality = ai_balanced }\n');
  assert.match(r.t10, /discovered_areas = \{\n\t\t\ta1\n\t\t\ta2 a3 a6 a9\n\t\t\}/); // su tierra, la vecina y la capital de su rival
  assert.match(r.t10, /\tCCC = \{[\s\S]*?capital = l3\n\t\tdiscovered_areas = \{\n\t\t\ta1 a3\n/);
  const v = tierraDe(arreglaSetup({ t10, nativos: new Set(['BBB']), retirados: ['BBB'], modo: 'vacio', area, vec, nm }).t10).get('BBB');
  assert.deepEqual(v, { own: [], pops: [], capital: null });
  assert.throws(() => filtraLineas('dependency = {\n\tfirst = BBB\n}', new Set(['BBB'])), /una linea/);
  console.log('setup-paises: prueba PASA');
}
