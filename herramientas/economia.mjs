// economia.mjs: que los paises del Nuevo Mundo empiecen con una economia de pais europeo mediano
// (tmp-mundo/estudio-v5/economia.md). Solo en la tierra con dueno; la libre queda como la trae RNW.
// Escribe copias de los ficheros del setup del mundo (el juego carga la del mod en su lugar):
//   06_pops        tribesmen a campesinos; gente por localizacion y clases como la Europa del juego, por rango
//   14_development el desarrollo de cada localizacion, al de Europa (mas en capital, ciudades y costa)
//   09_roads       caminos desde cada capital a sus pueblos y ciudades, y alrededor, hasta CAMINOS
//   03_markets     un mercado en la capital de cada pais
//   10_countries   (la copia ya escrita) starting_technology_level como Europa
// y el town_setup de los pueblos y ciudades (TOWN_SETUPS, todos los edificios a nivel 1: lo que dice el
// error.log de c83f781 es que con poco acceso a mercado el tope de guild_max_level cae a 1).
// La "base fiscal" no se calcula sin el juego: es riqueza x control, y la riqueza es el beneficio de RGO
// y edificios mas el comercio de burgueses (main_menu/localization/english/game_concepts_l_english.yml
// lineas 1732 y 1738); tax_per_pop de los estamentos solo reparte esa riqueza entre ellos (linea 1741).
// cifraPais es un indice comparable (mismo calculo para Europa y para nosotros, estima-economia.mjs lo
// imprime) y sirve para igualar a los paises con un factor de gente por pais: por eso cada pais cae en
// CIFRA_BANDA por construccion, y eso no prueba nada. La prueba es la base fiscal del lobby: con ella,
// calibraLobby (estima-economia.mjs --lobby) dice si el indice la sigue y que CIFRA_BANDA toca.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leeTexto, analizaFichero, esBloque, hijo, valoresSueltos, escribeConBom } from './pdx.mjs';

// ---------------------------------------------------------------- mandos (se calibran en partida)
export const F_RGO_PAIS = fileURLToPath(new URL('./rgo-pais.json', import.meta.url));
export const MANDOS = {
  POB_FACTOR: 2.0,           // gente de cada localizacion = media europea de su rango x esto
  POB_VARIA: [0.6, 1.5],     // cuanto conserva de la variacion de RNW: raiz(gente de RNW / mediana), entre estos topes
  // Nivel del recurso (RGO) de cada localizacion al empezar, como parte de su tope. El juego carga al 33 %
  // (00_defines.txt:1951); lo que falta lo sube gj_rgo_iniciales tras el lobby, y sus obreros van en 06_pops.
  // Javier (21/11): ni un tribesmen en los paises del Nuevo Mundo, y la riqueza se sube con el recurso.
  // Medido en partida (21/11, mide-riqueza.mjs): a 0,33 la mediana de los 55 paises ya es la europea (2,19
  // de riqueza por localizacion frente a 2,27) y a 0,67 se dispara a 4,99. Por eso el mando general se queda
  // en la carga del juego y solo suben, cada uno con su parte (RGO_PAIS), los paises que quedan por debajo.
  RGO_PARTE: 0.33,
  // tag -> parte, para el pais que no vale con RGO_PARTE (lo escribe mide-riqueza.mjs --calibra)
  RGO_PAIS: fs.existsSync(F_RGO_PAIS) ? JSON.parse(fs.readFileSync(F_RGO_PAIS, 'utf8')) : {},
  TIPOS: ['nobles', 'clergy', 'burghers', 'peasants'], // clases que se copian de Europa (ni esclavos ni tribus)
  DEV: { rural: 16, town: 24, city: 30, megalopolis: 34 }, // desarrollo objetivo por rango
  DEV_CAPITAL: 4, DEV_COSTA: 2, DEV_CAMINO: 1, // y lo que suma ser capital, tener puerto o camino
  TECNOLOGIA: 3,             // starting_technology_level (Europa: 3)
  CAMINOS: 0.35,             // parte de las localizaciones de cada pais con camino
  // banda del indice a la que se lleva cada pais con su factor de gente (null: sin igualar). Sale de
  // estima-economia.mjs: mediana del rango europeo (POR, 3350) / y x raiz de 2, la proporcion de 100-200.
  // Con la base fiscal del lobby, estima-economia.mjs --lobby da la banda que toca (BASE_OBJETIVO x indice por punto).
  CIFRA_BANDA: null,
  BASE_OBJETIVO: [100, 200], // base fiscal de salida que pide Javier, en la lista de paises del lobby
  DISPERSION_MAX: 1.5,       // si el indice por punto de base fiscal de los europeos medidos varia mas que esto, el indice no sirve
  K: [0.35, 4],              // topes de ese factor (hasta 2,5 es la densidad de NAP o BOH; de ahi a 4 solo una ciudad-estado como LPX)
  CIFRA: { PESO_POP: 1, PESO_EDIF: 2, DEV_ESCALA: 10, PASO: 0.04, PASO_CAMINO: 0.02, CTRL_MIN: 0.15, TRIBU_CTRL: 0.5 },
  SETUP: { town: 'gj_pueblo', city: 'gj_ciudad', megalopolis: 'gj_ciudad' }, // town_setup por rango
  // Probado y descartado en partida (21/11): un local_governor en el town_setup de las ciudades con camino
  // a la capital. El juego lo da por invalido ("invalid building local_governor"), la base fiscal de salida
  // no cambia (Isbrant 56,67 -> 57,54) y el gasto en edificios sube 18 de oro al mes.
  // Mercados (medido en partida, 21/11): la riqueza de una localizacion va con su acceso a mercado. Sin
  // mercado propio, solo los 29 de RNW, la base fiscal se hunde (Isbrant 0,72; Hrimval 0,83; Durnhal 49).
  MERCADO_EN_CIUDADES: false, // ademas de en la capital, un mercado en cada ciudad
};
// Edificios de los town_setup de RNW y del juego para America (mexican_city, rnw_andes_town) que
// no dieron "invalid building" en c83f781, y tres de iberian_city en las ciudades; todos a nivel 1
// (granary, tools_guild y weapon_guild a 2 dieron "above max level": guild_max_level, en
// in_game/common/script_values/building_caps.txt, se multiplica por acceso a mercado + 0,25 si el
// acceso baja de 0,75, con minimo 1). El marketplace tiene otro tope (market_max_level) y a 2 no fallo.
export const TOWN_SETUPS = {
  gj_pueblo: { temple: 1, granary: 1, marketplace: 1, mason: 1, pottery_guild: 1, tools_guild: 1, weapon_guild: 1, tannery: 1, brewery: 1, cloth_guild: 1, fine_cloth_guild: 1 },
  gj_ciudad: { temple: 1, granary: 1, marketplace: 2, mason: 2, pottery_guild: 2, tools_guild: 2, weapon_guild: 2, tannery: 2, brewery: 2, cloth_guild: 2, fine_cloth_guild: 2, stockade: 1, scriptorium: 1, furniture_guild: 2 },
};
export const textoTownSetups = () => `# GJ Nuevo Mundo (economia.mjs): pueblos y ciudades de la tierra con dueno del Nuevo Mundo.\n\n${Object.entries(TOWN_SETUPS).map(([k, b]) => `${k} = {\n${Object.entries(b).map(([e, n]) => `\t${e} = ${n}`).join('\n')}\n}\n`).join('\n')}`;

// ---------------------------------------------------------------- lectura del setup
// dirs: pila de carpetas (mod, mundo, juego): cada fichero sale de la primera que lo trae.
export const primero = (dirs, ...p) => { for (const d of dirs.filter(Boolean)) { const r = path.join(d, ...p); if (fs.existsSync(r)) return r; } return null; };
const SET = ['main_menu', 'setup', '1337'];
const RE_POP = /type = (\w+)\s+size = ([\d.]+)\s+culture = (\w+)\s+religion = (\w+)/;

export function leePops(texto) { // Map(loc -> [{ tipo, size, cultura, fe }])
  const m = new Map();
  let loc = null;
  for (const ln of texto.split('\n')) {
    const c = ln.match(/^([A-Za-z0-9_\-.]+)\s*=\s*\{/);
    if (c) { loc = c[1]; m.set(loc, []); continue; }
    const p = loc && ln.match(RE_POP);
    if (p) m.get(loc).push({ tipo: p[1], size: +p[2], cultura: p[3], fe: p[4] });
  }
  return m;
}
const bloqueLocations = (t) => t.slice(0, t.search(/^\}/m));
export const leeRangos = (t) => new Map([...bloqueLocations(t).matchAll(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*\{([^}\n]*)\}/gm)]
  .filter((x) => /\brank\s*=/.test(x[2])).map((x) => [x[1], { rango: x[2].match(/\brank\s*=\s*([a-z_]+)/)[1], setup: (x[2].match(/\btown_setup\s*=\s*([A-Za-z0-9_]+)/) || [])[1] }]));
export const leeCaminos = (t) => [...t.matchAll(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*([A-Za-z0-9_\-.]+)\s*$/gm)].filter((x) => x[1] !== 'road_network').map((x) => [x[1], x[2]]);
export const leeMercados = (t) => new Set([...t.matchAll(/\badd_market\s*=\s*([A-Za-z0-9_\-.]+)/g)].map((x) => x[1]));
export const leeReglas = (t) => new Map([...t.matchAll(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*(-?[\d.]+)/gm)].map((x) => [x[1], +x[2]]));
export function leePlantillas(dirs) { // Map(loc -> { clima, topo, veg, puerto }), de location_templates.txt
  const f = primero(dirs, 'in_game', 'map_data', 'location_templates.txt'), out = new Map();
  for (const x of leeTexto(f).texto.matchAll(/^[ \t]*([A-Za-z0-9_\-.]+)[ \t]*=[ \t]*\{([^\n]*)\}/gm)) {
    const c = (k) => (x[2].match(new RegExp(`\\b${k}\\s*=\\s*([A-Za-z0-9_.]+)`)) || [])[1];
    out.set(x[1], { clima: c('climate'), topo: c('topography'), veg: c('vegetation'), puerto: +(c('natural_harbor_suitability') || 0) });
  }
  return out;
}
export function leeNiveles(dirs) { // Map(town_setup -> niveles), de todas las carpetas
  const m = new Map();
  for (const d of [...dirs].reverse().filter(Boolean)) {
    const dir = path.join(d, 'in_game', 'common', 'town_setups');
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.txt')).sort()) {
      for (const it of analizaFichero(path.join(dir, f)).arbol.items) if (it.k && esBloque(it.v)) m.set(it.k, it.v.items.reduce((s, x) => s + (Number(x.v) || 0), 0));
    }
  }
  for (const [k, b] of Object.entries(TOWN_SETUPS)) if (!m.has(k)) m.set(k, Object.values(b).reduce((s, n) => s + n, 0));
  return m;
}
export function leePaises(dirs) { // Map(tag -> { locs, capital, tecnologia })
  const f = primero(dirs, ...SET, '10_countries.txt');
  const lista = hijo(hijo(analizaFichero(f).arbol, 'countries')?.v, 'countries');
  const tecPlantilla = new Map();
  const tec = (inc) => {
    if (!tecPlantilla.has(inc)) { const fp = primero(dirs, 'main_menu', 'setup', 'templates', `${inc}.txt`); tecPlantilla.set(inc, fp ? +((leeTexto(fp).texto.match(/starting_technology_level\s*=\s*(\d+)/) || [])[1] || 0) : 0); }
    return tecPlantilla.get(inc);
  };
  const out = new Map();
  for (const it of lista?.v.items || []) {
    if (!it.k || !esBloque(it.v)) continue;
    const locs = [];
    for (const x of it.v.items) if (x.k && /^own_/.test(x.k) && esBloque(x.v)) locs.push(...valoresSueltos(x.v));
    if (!locs.length) continue;
    const t = hijo(it.v, 'starting_technology_level'), inc = hijo(it.v, 'include');
    out.set(it.k, { locs, capital: hijo(it.v, 'capital')?.v, tecnologia: t ? +t.v : inc ? tec(String(inc.v).replace(/"/g, '')) : 0 });
  }
  return out;
}

// Desarrollo de una localizacion por las reglas de 14_development ("all valid values is added
// together"). ponytail: sin el termino de rios (como el estudio) y recortado a 0; si el juego no
// recorta o los rios pesan, la cifra de Europa sube un poco.
export function desarrolloReglas(l, { reglas, jer, plant, rango, camino }) {
  const g = (k) => (k && reglas.has(k) ? reglas.get(k) : 0);
  const j = jer.get(l) || {}, p = plant.get(l) || {};
  return g('base') + g('coastal') * (p.puerto || 0) + (camino ? g('road') : 0) + g(rango)
    + g(p.veg) + g(p.clima) + g(p.topo) + g(j.region) + g(j.area) + g(j.provincia) + g(l);
}

// ---------------------------------------------------------------- el indice comparable
// cifra = suma, en cada localizacion, de control x riqueza (la base fiscal del juego es riqueza x
// control). riqueza = PESO_POP x miles de gente no tribal x (1 + desarrollo / DEV_ESCALA) + PESO_EDIF x
// niveles de edificio; control = 1 - PASO x pasos desde la capital por su tierra (PASO_CAMINO por un
// camino), con suelo CTRL_MIN y la mitad de propagacion donde hay tribesmen (pop_types/00_default.txt).
// ponytail: indice sin unidades, no la base fiscal; vale para comparar con Europa, no para leer 100-200.
export function cifraPais({ locs, capital, vec, caminos, rec, m = MANDOS.CIFRA }) {
  const mias = new Set(locs), dist = new Map([[capital, 0]]), hechos = new Set();
  for (;;) { // Dijkstra pequeno (n < 400)
    let v = null;
    for (const [l, d] of dist) if (!hechos.has(l) && (v === null || d < dist.get(v) || (d === dist.get(v) && l < v))) v = l;
    if (v === null) break;
    hechos.add(v);
    for (const w of vec.get(v) || []) {
      if (!mias.has(w)) continue;
      const d = dist.get(v) + (caminos.has(`${v}|${w}`) ? m.PASO_CAMINO : m.PASO);
      if (!dist.has(w) || d < dist.get(w)) dist.set(w, d);
    }
  }
  let A = 0, B = 0;
  for (const l of locs) {
    const r = rec(l), tot = r.noTrib + r.trib;
    const ctrl = Math.max(m.CTRL_MIN, 1 - (dist.has(l) ? dist.get(l) : Infinity)) * (1 - m.TRIBU_CTRL * (tot ? r.trib / tot : 0));
    A += ctrl * m.PESO_POP * r.noTrib * (1 + r.dev / m.DEV_ESCALA);
    B += ctrl * m.PESO_EDIF * r.niveles;
  }
  return { cifra: A + B, A, B };
}
// Calibracion con la base fiscal leida en el lobby. indices: Map(tag -> indice); lobby: Map(tag -> base
// fiscal medida); europeos: los tags que fijan la escala. Devuelve el indice por punto de base fiscal
// (mediana de los europeos medidos), cuanto varia entre ellos (max / min: 1 = el indice sigue a la base
// fiscal) y la CIFRA_BANDA que corresponde a BASE_OBJETIVO.
export function calibraLobby({ indices, lobby, europeos, m = MANDOS }) {
  const pares = [...lobby].filter(([t, b]) => europeos.has(t) && b > 0 && indices.get(t) > 0)
    .map(([t, b]) => ({ tag: t, base: b, porPunto: indices.get(t) / b })).sort((a, b) => a.porPunto - b.porPunto || (a.tag < b.tag ? -1 : 1));
  if (!pares.length) return null;
  const h = pares.length >> 1, porPunto = pares.length % 2 ? pares[h].porPunto : (pares[h - 1].porPunto + pares[h].porPunto) / 2;
  return { pares, porPunto, dispersion: pares.at(-1).porPunto / pares[0].porPunto, banda: m.BASE_OBJETIVO.map((b) => Math.round(b * porPunto)) };
}
const parCamino = (pares) => { const s = new Set(); for (const [a, b] of pares) { s.add(`${a}|${b}`); s.add(`${b}|${a}`); } return s; };

// Indicadores de un pais leidos del setup (estima-economia.mjs): los mismos para Europa y para nosotros.
export function indicadores({ tag, pais, pops, rangos, niveles, caminos, mercados, devDe, vec }) {
  const { locs, capital } = pais, conCamino = new Set(caminos.flatMap((x) => x)), pares = parCamino(caminos);
  const suma = (tipo) => locs.reduce((s, l) => s + (pops.get(l) || []).filter((p) => p.tipo === tipo).reduce((a, p) => a + p.size, 0), 0);
  const total = locs.reduce((s, l) => s + (pops.get(l) || []).reduce((a, p) => a + p.size, 0), 0), trib = suma('tribesmen');
  const nivelesDe = (l) => niveles.get(rangos.get(l)?.setup) || 0;
  const rec = (l) => { const ps = pops.get(l) || [], t = ps.filter((p) => p.tipo === 'tribesmen').reduce((a, p) => a + p.size, 0); return { trib: t, noTrib: ps.reduce((a, p) => a + p.size, 0) - t, dev: devDe(l), niveles: nivelesDe(l) }; };
  const n = locs.length, r = (x) => Math.round(x * 100) / 100;
  return { tag, n, pop: r(total), popLoc: r(total / n), noTribLoc: r((total - trib) / n), tribPct: r(100 * trib / (total || 1)),
    burLoc: r(suma('burghers') / n), nobLoc: Math.round(1e4 * suma('nobles') / n) / 1e4, cleLoc: Math.round(1e4 * suma('clergy') / n) / 1e4,
    dev: r(locs.reduce((s, l) => s + devDe(l), 0) / n), caminoPct: r(100 * locs.filter((l) => conCamino.has(l)).length / n),
    nivLoc: r(locs.reduce((s, l) => s + nivelesDe(l), 0) / n), pueblos: locs.filter((l) => rangos.get(l)?.rango === 'town').length,
    ciudades: locs.filter((l) => /city|megalopolis/.test(rangos.get(l)?.rango || '')).length, mercados: locs.filter((l) => mercados.has(l)).length,
    tecnologia: pais.tecnologia, cifra: Math.round(cifraPais({ locs, capital, vec, caminos: pares, rec }).cifra) };
}

// Gente media y reparto de clases de las localizaciones europeas del juego, por rango.
export function perfilEuropa(juego, jer, m = MANDOS) {
  const pops = leePops(leeTexto(path.join(juego, ...SET, '06_pops.txt')).texto);
  const rangos = leeRangos(leeTexto(path.join(juego, ...SET, '07_cities_and_buildings.txt')).texto);
  const acc = {};
  for (const [l, ps] of pops) {
    if (jer.get(l)?.continente !== 'europe' || !ps.length) continue;
    const r = rangos.get(l)?.rango === 'megalopolis' ? 'city' : rangos.get(l)?.rango || 'rural';
    const a = (acc[r] ||= { n: 0, total: 0, tipos: {} });
    a.n++;
    for (const p of ps) { a.total += p.size; if (m.TIPOS.includes(p.tipo)) a.tipos[p.tipo] = (a.tipos[p.tipo] || 0) + p.size; }
  }
  const out = {};
  for (const [r, a] of Object.entries(acc)) {
    const s = Object.values(a.tipos).reduce((x, y) => x + y, 0);
    out[r] = { n: a.n, gente: a.total / a.n, cuota: Object.fromEntries(m.TIPOS.map((t) => [t, (a.tipos[t] || 0) / s])) };
  }
  out.megalopolis = out.city;
  return out;
}

// ---------------------------------------------------------------- la gente nueva de una localizacion
// Misma cultura y fe: los campesinos se reparten como la gente de RNW; nobles, clero y burgueses van con
// la pareja cultura-fe mayoritaria. Sin tribesmen. Sin obreros: el juego los crea al cargar (el 10 % de
// los campesinos) y devuelve a campesinos los que se pongan aqui de mas (medido en partida, 21/11).
// `obreros` (miles): campesinos que no se ponen porque llegan como obreros tras el lobby (textoRgo).
export function gentNueva(viejos, { total, cuota, obreros = 0 }) {
  const vt = viejos.reduce((s, p) => s + p.size, 0);
  if (!vt) return [];
  const pareja = new Map();
  for (const p of viejos) { const k = `${p.cultura} ${p.fe}`; pareja.set(k, (pareja.get(k) || 0) + p.size); }
  const orden = [...pareja].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const mayor = orden[0][0], out = [];
  const pon = (tipo, size, k) => { const [cultura, fe] = k.split(' '); if (size >= 0.0005) out.push({ tipo, size, cultura, fe }); };
  for (const [tipo, c] of Object.entries(cuota)) {
    if (tipo === 'peasants') for (const [k, n] of orden) pon(tipo, (total * c - obreros) * n / vt, k);
    else pon(tipo, total * c, mayor);
  }
  return out;
}

// Tope de niveles del RGO de una localizacion (main_menu/common/static_modifiers/location.txt: 2 de base,
// 0,1 por punto de desarrollo y 0,025 por mil habitantes; location_ranks: rural +100 %, megalopolis -50 %;
// vegetation: farmland +10 %). Con Salvik (desarrollo 16, 36,9 mil, rural) da 9,05, y el juego dice 9.
export const topeRgo = ({ dev, gente, rango, veg }) => (2 + 0.1 * dev + 0.025 * gente) * (1 + (rango === 'rural' ? 1 : rango === 'megalopolis' ? -0.5 : 0) + (veg === 'farmland' ? 0.1 : 0));
// El fichero del efecto: funde-partes.mjs lo escribe vacio (sin mundo no sube nada) y aplicaEconomia lo rellena.
export const RGO_EFECTOS = 'gj_economia_rgo.txt';
// suben: [loc, niveles, cultura, fe]. Cada nivel pide mil obreros y llegan aqui mismo con add_pop (como
// events/DHE/flavor_BOH.txt:1480): el ascenso del juego es de decenas al mes y split_pop no los crea.
// Medido en partida (21/11): Salvik, de 3.000/6.000 empleados el dia 1 a 6.000/6.000 a los tres meses.
export const textoRgo = (suben = []) => `# GJ Nuevo Mundo (economia.mjs): niveles de recurso que se suman tras el lobby, con sus obreros. GENERADO.\ngj_rgo_iniciales = {\n${suben.map(([l, n, c, f]) => `\tlocation:${l} = { if = { limit = { is_full_expanded_rgo = no } change_max_raw_material_workers = ${n} add_pop = { culture = culture:${c} religion = religion:${f} type = pop_type:laborers size = ${n} } } }`).join('\n')}\n}\n`;
// niveles con que carga el juego (33 % del tope) y los que hay que sumar para llegar a `parte` del tope, con
// decimales: aplicaEconomia los redondea arrastrando el resto de una localizacion a la siguiente del pais
export function nivelRgo(tope, parte) {
  const carga = Math.round(0.33 * tope);
  return { carga, extra: Math.max(0, Math.min(Math.floor(tope) - carga, (parte - 0.33) * tope)) };
}

// ---------------------------------------------------------------- caminos de un pais
// Red de caminos de la capital por su tierra: une cada vez el pueblo o la ciudad mas cerca de la red
// (por el camino mas corto), y despues crece alrededor de la capital, hasta tener `parte` de las
// localizaciones con camino (contando las que ya lo tienen). Los pueblos lejanos pueden quedar sin el.
export function caminosPais({ locs, capital, vec, destinos, parte, yaTienen = new Set() }) {
  const mias = new Set(locs), orden = [capital], pos = new Map([[capital, 0]]);
  const vs = (l) => [...(vec.get(l) || [])].filter((w) => mias.has(w)).sort();
  for (let i = 0; i < orden.length; i++) for (const w of vs(orden[i])) if (!pos.has(w)) { pos.set(w, orden.length); orden.push(w); }
  const pares = [], con = new Set(yaTienen), red = new Set([capital]); // red: lo unido a la capital por nuestros caminos
  const quiere = Math.ceil(parte * locs.length), cuenta = () => locs.filter((x) => con.has(x)).length;
  const une = (a, b) => { pares.push([a, b]); red.add(b); con.add(a); con.add(b); };
  const pend = new Set(destinos.filter((d) => pos.has(d)));
  while (pend.size && cuenta() < quiere) {
    const prev = new Map([...red].sort().map((l) => [l, null])), cola = [...prev.keys()];
    let hallado = null;
    for (let i = 0; i < cola.length && !hallado; i++) for (const w of vs(cola[i])) if (!prev.has(w)) { prev.set(w, cola[i]); if (pend.has(w)) { hallado = w; break; } cola.push(w); }
    if (!hallado) break;
    const tramo = []; for (let v = hallado; !red.has(v); v = prev.get(v)) tramo.push([prev.get(v), v]);
    for (const [a, b] of tramo.reverse()) une(a, b);
    for (const p of [...pend]) if (red.has(p)) pend.delete(p);
  }
  while (cuenta() < quiere) {
    const l = orden.find((x) => !red.has(x) && vs(x).some((w) => red.has(w)));
    if (!l) break;
    une(vs(l).filter((w) => red.has(w)).sort((a, b) => pos.get(a) - pos.get(b))[0], l);
  }
  return pares;
}

// ---------------------------------------------------------------- todo junto, en la carpeta del montaje
// dueno: Map(loc -> tag) de la tierra con dueno del Nuevo Mundo; capitales: Map(tag -> loc);
// rangos: Map(loc -> rango) final del Nuevo Mundo.
export function aplicaEconomia({ obra, mundo, juego, jer, dueno, capitales, rangos, vec, m = MANDOS }) {
  const dirs = [obra, mundo, juego];
  // la copia del montaje manda si ya existe (setup-paises.mjs ya ha movido los mercados de 03)
  const leeW = (f) => fs.readFileSync(primero([obra, mundo, juego], ...SET, f), 'utf8');
  const escribe = (f, t) => { const d = path.join(obra, ...SET, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, t, 'utf8'); };
  const perfil = perfilEuropa(juego, jer, m);
  const t06 = leeW('06_pops.txt'), viejos = leePops(t06);
  const por = new Map(); for (const [l, t] of dueno) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  for (const ls of por.values()) ls.sort();
  const tags = [...por.keys()].sort();
  // caminos
  const t09 = leeW('09_roads.txt'), viejosC = leeCaminos(t09), conC = new Set(viejosC.flat()), nuevosC = [];
  for (const t of tags) nuevosC.push(...caminosPais({ locs: por.get(t), capital: capitales.get(t), vec, destinos: por.get(t).filter((l) => rangos.has(l) && l !== capitales.get(t)), parte: m.CAMINOS, yaTienen: conC }));
  for (const p of nuevosC) p.forEach((l) => conC.add(l));
  // sin repetir un camino que ya trae el mundo (road_manager.cpp:349 "Road specified ... more than once")
  const clave = ([a, b]) => (a < b ? `${a}|${b}` : `${b}|${a}`), yaC = new Set(viejosC.map(clave));
  nuevosC.splice(0, nuevosC.length, ...nuevosC.filter((p) => !yaC.has(clave(p))));
  const pares = parCamino([...viejosC, ...nuevosC]);
  // desarrollo: el termino de la localizacion lleva la suma de las reglas al objetivo
  const t14 = leeW('14_development.txt'), reglas = leeReglas(t14), plant = leePlantillas(dirs), devFin = new Map(), devLoc = new Map();
  const capSet = new Set(capitales.values());
  for (const [l] of dueno) {
    const r = rangos.get(l) || 'rural', sinLoc = desarrolloReglas(l, { reglas, jer, plant, rango: r, camino: conC.has(l) }) - (reglas.get(l) || 0);
    const obj = (m.DEV[r] ?? m.DEV.rural) + (capSet.has(l) ? m.DEV_CAPITAL : 0) + (plant.get(l)?.puerto ? m.DEV_COSTA : 0) + (conC.has(l) ? m.DEV_CAMINO : 0);
    devLoc.set(l, Math.round(obj - sinLoc)); devFin.set(l, Math.round(obj - sinLoc) + sinLoc);
  }
  // gente: con factor 1, el indice de cada pais; fuera de CIFRA_BANDA, el factor que lo lleva a su borde
  const vivos = [...dueno.keys()].filter((l) => viejos.get(l)?.length).map((l) => viejos.get(l).reduce((s, p) => s + p.size, 0)).sort((a, b) => a - b);
  const mediana = vivos[Math.floor(vivos.length / 2)] || 1;
  const nivelesDe = (l) => { const s = TOWN_SETUPS[m.SETUP[rangos.get(l)]]; return s ? Object.values(s).reduce((a, b) => a + b, 0) : 0; };
  const rgo = new Map(), resto = new Map(); // loc -> [niveles, cultura, fe] del ultimo calculo (el de 06_pops); tag -> decimales pendientes
  const nueva = (l, k) => {
    const vs = viejos.get(l) || [], vt = vs.reduce((s, p) => s + p.size, 0), r = rangos.get(l) || 'rural', pf = perfil[r];
    const total = pf.gente * m.POB_FACTOR * k * Math.min(m.POB_VARIA[1], Math.max(m.POB_VARIA[0], Math.sqrt(vt / mediana)));
    const n = nivelRgo(topeRgo({ dev: Math.max(0, devFin.get(l)), gente: total, rango: r, veg: plant.get(l)?.veg }), m.RGO_PAIS[dueno.get(l)] ?? m.RGO_PARTE);
    // los obreros de los niveles nuevos salen de los campesinos (como mucho la mitad): la gente total no cambia
    const t = dueno.get(l), ac = (resto.get(t) || 0) + (vt ? n.extra : 0), ent = Math.floor(ac + 1e-9);
    resto.set(t, ac - ent);
    const ob = Math.min(ent, Math.floor(total * pf.cuota.peasants / 2));
    const ps = gentNueva(vs, { total, cuota: pf.cuota, obreros: ob }), may = ps.find((p) => p.tipo === 'peasants');
    if (ob && may) rgo.set(l, [ob, may.cultura, may.fe]);
    return ps;
  };
  const rec = (k) => (l) => { const ps = nueva(l, k), t = ps.filter((p) => p.tipo === 'tribesmen').reduce((a, p) => a + p.size, 0); return { trib: t, noTrib: ps.reduce((a, p) => a + p.size, 0) - t, dev: Math.max(0, devFin.get(l)), niveles: nivelesDe(l) }; };
  const factor = new Map(), cifras = new Map();
  for (const t of tags) {
    const c = cifraPais({ locs: por.get(t), capital: capitales.get(t), vec, caminos: pares, rec: rec(1), m: m.CIFRA });
    const obj = !m.CIFRA_BANDA ? null : c.cifra < m.CIFRA_BANDA[0] ? 1.01 * m.CIFRA_BANDA[0] : c.cifra > m.CIFRA_BANDA[1] ? 0.99 * m.CIFRA_BANDA[1] : null; // 1 % dentro: el redondeo de la gente no lo saca
    const k = obj === null ? 1 : Math.min(m.K[1], Math.max(m.K[0], (obj - c.B) / (c.A || 1)));
    factor.set(t, Math.round(k * 1000) / 1000); cifras.set(t, Math.round(k * c.A + c.B));
  }
  // 06_pops
  let cambian = 0, sinGente = 0;
  rgo.clear(); resto.clear(); // fuera lo del calculo de cifras (factor 1)
  const f3 = (x) => x.toFixed(3);
  const n06 = t06.replace(/^([A-Za-z0-9_\-.]+) = \{\r?\n([\s\S]*?)^\}/gm, (todo, l) => {
    if (!dueno.has(l)) return todo;
    const ps = nueva(l, factor.get(dueno.get(l)));
    if (!ps.length) { sinGente++; return todo; }
    cambian++;
    return `${l} = {\n${ps.map((p) => `\tdefine_pop = {\ttype = ${p.tipo}\tsize = ${f3(p.size)}\tculture = ${p.cultura}\treligion = ${p.fe} }`).join('\n')}\n}`;
  });
  escribe('06_pops.txt', n06);
  // RGO: lo que falta hasta el objetivo, tras el lobby (funde-partes.mjs llama a gj_rgo_iniciales). Sintaxis
  // del juego: events/DHE/flavor_BOH.txt:1689 (change_max_raw_material_workers con is_full_expanded_rgo = no).
  const suben = [...rgo].sort(([a], [b]) => (a < b ? -1 : 1)).map(([l, v]) => [l, ...v]);
  escribeConBom(path.join(obra, 'in_game', 'common', 'scripted_effects', RGO_EFECTOS), textoRgo(suben));
  // 14_development: fuera las lineas de RNW de la tierra con dueno; las nuestras, antes del cierre
  const cierre = (t) => t.search(/\}\s*$/);
  const s14 = t14.replace(/^[ \t]*([A-Za-z0-9_\-.]+)[ \t]*=[ \t]*-?[\d.]+[^\n]*\r?\n/gm, (x, l) => (devLoc.has(l) ? '' : x)), c14 = cierre(s14);
  escribe('14_development.txt', `${s14.slice(0, c14)}\n\t# GJ Nuevo Mundo (economia.mjs): desarrollo de la tierra con dueno\n${[...devLoc].sort(([a], [b]) => (a < b ? -1 : 1)).map(([l, v]) => `\t${l} = ${v}`).join('\n')}\n${s14.slice(c14)}`);
  const c09 = cierre(t09);
  escribe('09_roads.txt', `${t09.slice(0, c09)}\n\t# GJ Nuevo Mundo (economia.mjs): caminos de cada capital\n${nuevosC.map(([a, b]) => `\t${a} = ${b}`).join('\n')}\n${t09.slice(c09)}`);
  const t03 = leeW('03_markets.txt'), ya03 = leeMercados(t03), mercados = [...new Set([...tags.map((t) => capitales.get(t)), ...(m.MERCADO_EN_CIUDADES ? [...dueno.keys()].filter((l) => m.SETUP[rangos.get(l)] === m.SETUP.city).sort() : [])])].filter((l) => !ya03.has(l)), c03 = cierre(t03);
  escribe('03_markets.txt', `${t03.slice(0, c03)}\n\t# GJ Nuevo Mundo (economia.mjs): la capital de cada pais\n${mercados.map((l) => `\tadd_market = ${l}`).join('\n')}\n${t03.slice(c03)}`);
  // tecnologia en la copia de 10_countries que ya esta escrita
  const r10 = path.join(obra, ...SET, '10_countries.txt'), mios = new Set(tags);
  let tec = 0;
  fs.writeFileSync(r10, fs.readFileSync(r10, 'utf8').replace(/^\t([A-Z][A-Z0-9]{2}) = \{\r?\n([\s\S]*?)^\t\}/gm, (todo, tag, cuerpo) => {
    if (!mios.has(tag)) return todo;
    tec++;
    const c = /^\t\tstarting_technology_level = \d+/m.test(cuerpo) ? cuerpo.replace(/^\t\tstarting_technology_level = \d+/m, `\t\tstarting_technology_level = ${m.TECNOLOGIA}`)
      : cuerpo.replace(/^(\t\tcapital = \S+\r?\n)/m, `$1\t\tstarting_technology_level = ${m.TECNOLOGIA}\n`);
    return `\t${tag} = {\n${c}\t}`;
  }), 'utf8');
  escribeConBom(path.join(obra, 'in_game', 'common', 'town_setups', 'gj_economia_town_setups.txt'), textoTownSetups());
  return { paises: tags.length, cambian, sinGente, caminos: nuevosC.length, conCamino: [...dueno.keys()].filter((l) => conC.has(l)).length, tierra: dueno.size, mercados: mercados.length, tecnologia: tec, factor, cifras, perfil };
}

// ---------------------------------------------------------------- comprobacion pequena
// node herramientas/economia.mjs: la gente nueva conserva cultura y fe, y los caminos llegan.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const assert = (await import('node:assert')).strict;
  const g = gentNueva([{ tipo: 'tribesmen', size: 3, cultura: 'a', fe: 'x' }, { tipo: 'peasants', size: 1, cultura: 'b', fe: 'y' }],
    { total: 20, cuota: { nobles: 0.01, clergy: 0.02, burghers: 0.07, peasants: 0.9 } });
  assert.ok(Math.abs(g.reduce((s, p) => s + p.size, 0) - 20) < 1e-9, 'gente total');
  assert.ok(!g.some((p) => p.tipo === 'tribesmen'), 'sin tribus');
  assert.equal(g.filter((p) => p.tipo === 'peasants' && p.cultura === 'a').reduce((s, p) => s + p.size, 0), 20 * 0.9 * 0.75, 'campesinos de la cultura a: 3/4');
  assert.ok(g.filter((p) => p.tipo !== 'peasants').every((p) => p.cultura === 'a' && p.fe === 'x'), 'clases altas con la pareja mayor');
  const tp = topeRgo({ dev: 16, gente: 36.861, rango: 'rural', veg: 'forest' });
  assert.ok(Math.abs(tp - 9.04) < 0.01, 'tope de Salvik');
  assert.equal(nivelRgo(tp, 0.67).carga, 3);
  assert.ok(Math.abs(nivelRgo(tp, 0.67).extra - 0.34 * tp) < 1e-9, 'de 3 a unos 6 niveles');
  assert.equal(nivelRgo(tp, 0.2).extra, 0, 'nunca por debajo de la carga');
  assert.equal(nivelRgo(tp, 2).extra, 6, 'ni por encima del tope');
  assert.ok(textoRgo([['l1', 3, 'a', 'x']]).includes('location:l1 = { if = { limit = { is_full_expanded_rgo = no } change_max_raw_material_workers = 3 add_pop = { culture = culture:a religion = religion:x type = pop_type:laborers size = 3 } } }'), 'linea del efecto');
  const go = gentNueva([{ tipo: 'peasants', size: 1, cultura: 'b', fe: 'y' }], { total: 20, cuota: { nobles: 0.1, peasants: 0.9 }, obreros: 3 });
  assert.equal(go.reduce((s, p) => s + p.size, 0), 17, 'los obreros salen de los campesinos');
  const vec = new Map([['c', new Set(['a', 'b'])], ['a', new Set(['c', 'd'])], ['b', new Set(['c'])], ['d', new Set(['a'])]]);
  assert.deepEqual(caminosPais({ locs: ['a', 'b', 'c', 'd'], capital: 'c', vec, destinos: ['d'], parte: 0.75 }), [['c', 'a'], ['a', 'd']], 'camino capital -> pueblo');
  assert.deepEqual(caminosPais({ locs: ['a', 'b', 'c', 'd'], capital: 'c', vec, destinos: ['d'], parte: 0.5 }), [['c', 'a'], ['a', 'd']], 'el pueblo antes que el relleno');
  assert.deepEqual(caminosPais({ locs: ['a', 'b', 'c', 'd'], capital: 'c', vec, destinos: [], parte: 1 }), [['c', 'a'], ['c', 'b'], ['a', 'd']], 'relleno alrededor de la capital');
  const ci = cifraPais({ locs: ['c', 'a'], capital: 'c', vec, caminos: new Set(), rec: () => ({ noTrib: 10, trib: 0, dev: 10, niveles: 0 }) });
  assert.ok(Math.abs(ci.cifra - (20 + 20 * (1 - MANDOS.CIFRA.PASO))) < 1e-9, 'cifra con un paso');
  const cal = calibraLobby({ indices: new Map([['POL', 2000], ['POR', 3000], ['ENG', 8000], ['GQT', 4000]]), lobby: new Map([['POL', 100], ['POR', 120], ['ENG', 400], ['GQT', 1]]), europeos: new Set(['POL', 'POR', 'ENG']) });
  assert.equal(cal.porPunto, 20, 'mediana de 20, 25 y 20 (los nuestros no fijan la escala)');
  assert.equal(cal.dispersion, 25 / 20, 'dispersion max / min');
  assert.deepEqual(cal.banda, [2000, 4000], 'banda = BASE_OBJETIVO x indice por punto');
  assert.equal(calibraLobby({ indices: new Map(), lobby: new Map([['POL', 100]]), europeos: new Set(['POL']) }), null, 'sin indice, sin calibracion');
  console.log('economia.mjs: comprobacion PASA');
}
