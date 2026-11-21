// Recursos por zonas (PLAN fase 2): reparte las materias primas del juego (todas, no solo las
// americanas de RNW) entre las localizaciones del Nuevo Mundo, con una identidad economica por
// area que cuadra con su clima, su terreno y la faccion que vive alli. Determinista: el mismo
// mundo y el mismo vinculo dan siempre el mismo reparto (lo exige el multijugador).
//
// 1. Aptitud de cada bien en cada localizacion: Bayes ingenuo con lo que hace el juego en TODO
//    su mapa (clima, terreno, vegetacion y costa de las ~21.000 localizaciones con bien).
// 2. Identidad de cada area (metales, joyas, cereales, frutas y vino, especias y tintes, ganado,
//    pieles, madera o pesca): la que mejor cuadra, con prima si es la de su faccion y castigo si
//    ya se repite mucho en la region.
// 3. Dentro del area: el bien dominante (el mejor de la identidad) no pasa del TOPE_DOMINANTE de
//    sus localizaciones y nunca hay mas de MAX_JUNTAS casillas vecinas con el mismo bien.
//
// Uso (CLI):
//   node asigna-recursos.mjs --vanilla | --mundo <carpeta>  [--vinculo <vinculo.json>] [--seco]
//                            [--salida <fichero de efectos>] [--json <recursos.json>] [--informe <md>]
// Como modulo: import { asignaRecursos } from './asigna-recursos.mjs'
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analizaFichero, esBloque, listaFicheros, escribeConBom } from './pdx.mjs';
import { cargaMundo, vecinos, paisesDelMundo, juegoPorDefecto } from './mundo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const TOPE_DOMINANTE = 0.55;
export const MAX_JUNTAS = 4;
export const MIN_POR_CONTINENTE = 4;
export const TOPE_REGION = 0.25; // ninguna region con mas de esta parte de un metal o un precioso
export const TOPE_BIEN = 0.08;   // ningun bien por encima de esta parte del Nuevo Mundo
export const EXP_PRIOR = Number(process.env.GJ_EXP_PRIOR || 0.6);

// Identidades de zona (MECANICAS y PLAN 5): que bienes tira cada una.
export const IDENTIDADES = {
  metales: ['iron', 'copper', 'tin', 'lead', 'silver', 'goods_gold', 'coal', 'mercury', 'saltpeter', 'alum'],
  joyas: ['gems', 'pearls', 'amber', 'marble'],
  cereales: ['wheat', 'maize', 'rice', 'millet', 'legumes', 'potato', 'fiber_crops'],
  frutas_vino: ['wine', 'fruit', 'olives', 'sugar'],
  especias_tintes: ['pepper', 'cloves', 'saffron', 'chili', 'dyes', 'incense', 'cocoa', 'coffee', 'tea', 'tobacco', 'silk', 'medicaments'],
  ganado: ['livestock', 'wool', 'horses', 'camels', 'elephants', 'beeswax'],
  pieles: ['fur', 'wild_game', 'ivory'],
  madera: ['lumber'],
  pesca: ['fish', 'salt'],
};
// Lo que no esta en ninguna identidad (piedra, arcilla, arena) solo sale como relleno.

function bienesDelJuego(juego, modDirs = []) {
  const out = new Map(); // bien -> metodo
  const dirs = [path.join(juego, 'in_game', 'common', 'goods'), ...modDirs.map((d) => path.join(d, 'in_game', 'common', 'goods'))];
  for (const d of dirs) for (const f of listaFicheros(d, (x) => /\.txt$/.test(x) && !/readme/i.test(x))) {
    for (const it of analizaFichero(f).arbol.items) {
      if (!it.k || !esBloque(it.v)) continue;
      const cat = it.v.items.find((x) => x.k === 'category')?.v;
      if (cat === 'raw_material') out.set(it.k, it.v.items.find((x) => x.k === 'method')?.v || '?');
    }
  }
  return out;
}

// Bayes ingenuo con suavizado de Laplace sobre las plantillas del juego.
function aprende(juegoMundo, bienes) {
  const n = new Map(), rasgo = { clima: new Map(), topo: new Map(), veg: new Map(), costa: new Map() };
  const valores = { clima: new Set(), topo: new Set(), veg: new Set(), costa: new Set(['si', 'no']) };
  let total = 0;
  for (const [l, p] of juegoMundo.plant) {
    if (!p.bien || !bienes.has(p.bien)) continue;
    total++;
    n.set(p.bien, (n.get(p.bien) || 0) + 1);
    const r = { clima: p.clima, topo: p.topo, veg: p.veg, costa: juegoMundo.costa.has(l) ? 'si' : 'no' };
    for (const k of Object.keys(rasgo)) {
      if (!r[k]) continue;
      valores[k].add(r[k]);
      const m = rasgo[k]; const c = `${p.bien}|${r[k]}`; m.set(c, (m.get(c) || 0) + 1);
    }
  }
  return (loc) => {
    // devuelve Map(bien -> probabilidad) normalizada
    const r = { clima: loc.clima, topo: loc.topo, veg: loc.veg, costa: loc.costa ? 'si' : 'no' };
    const puntos = new Map(); let suma = 0;
    for (const b of [...bienes.keys()].sort()) {
      const nb = n.get(b) || 0;
      let lp = Math.log((nb + 1) / (total + bienes.size));
      for (const k of Object.keys(rasgo)) {
        if (!r[k]) continue;
        lp += Math.log(((rasgo[k].get(`${b}|${r[k]}`) || 0) + 0.5) / (nb + 0.5 * Math.max(1, valores[k].size)));
      }
      const p = Math.exp(lp); puntos.set(b, p); suma += p;
    }
    // Elevacion: P(bien | casilla) / P(bien). Mide donde un bien es MAS propio que de media,
    // asi lo raro (oro, plata, especias) gana donde le toca y lo comun no lo tapa todo.
    // Con la elevacion pura (exponente 1) lo exotico se pasa (camellos al 5 % del norte); con el
    // posterior (exponente 0) lo comun lo tapa todo (24 bienes). EXP_PRIOR queda en medio.
    for (const [b, p] of puntos) puntos.set(b, (p / suma) / Math.pow(((n.get(b) || 0) + 1) / (total + bienes.size), EXP_PRIOR));
    return puntos;
  };
}

class Conjuntos { // union-find de casillas con el mismo bien
  constructor() { this.padre = new Map(); this.talla = new Map(); }
  raiz(x) { let r = x; while (this.padre.get(r) !== r) r = this.padre.get(r); let y = x; while (y !== r) { const s = this.padre.get(y); this.padre.set(y, r); y = s; } return r; }
  nuevo(x) { this.padre.set(x, x); this.talla.set(x, 1); }
  une(a, b) { let ra = this.raiz(a), rb = this.raiz(b); if (ra === rb) return; if (ra > rb) [ra, rb] = [rb, ra]; this.padre.set(rb, ra); this.talla.set(ra, this.talla.get(ra) + this.talla.get(rb)); }
}

export async function asignaRecursos({ juego = juegoPorDefecto(), mundo = null, vanilla = false, paisesFaccion = {}, facciones = null, modDirs = [] } = {}) {
  const M = cargaMundo({ juego, mundo, vanilla });
  const J = vanilla ? M : cargaMundo({ juego, vanilla: true });
  const todos = bienesDelJuego(juego, modDirs);
  // Un bien sin ninguna casilla en el mapa del juego no tiene estadistica: no se reparte solo
  // (necesitaria una regla propia, p. ej. el cristal de marea en las costas de Thalassar).
  const conDatos = new Set([...J.plant.values()].map((p) => p.bien).filter(Boolean));
  const sinRegla = [...todos.keys()].filter((b) => !conDatos.has(b)).sort();
  const bienes = new Map([...todos].filter(([b]) => conDatos.has(b)));
  const aptitud = aprende(J, bienes);
  const vec = await vecinos(M.dir, juego);
  const FAC = facciones || JSON.parse(fs.readFileSync(path.join(AQUI, 'facciones.json'), 'utf8'));
  const afin = Object.fromEntries(FAC.facciones.map((f) => [f.clave, f.recursos || []]));

  // dueño de cada area: la faccion con mas localizaciones en ella
  const paises = paisesDelMundo(M.dir, juego);
  const duenoLoc = new Map();
  for (const [clave, tag] of Object.entries(paisesFaccion)) for (const l of paises.get(tag) || []) duenoLoc.set(l, clave);
  const areas = new Map(); // area -> [locs]
  for (const l of M.locsAmerica) { const a = M.jer.get(l).area; if (!areas.has(a)) areas.set(a, []); areas.get(a).push(l); }
  const P = new Map();
  for (const l of M.locsAmerica) { const p = M.plant.get(l); P.set(l, aptitud({ clima: p.clima, topo: p.topo, veg: p.veg, costa: M.costa.has(l) })); }
  // camellos solo en desierto o matorral de clima arido (si no, el clima arid que RNW copia del
  // Viejo Mundo por latitud los ponia en ~10 % del Nuevo Mundo)
  for (const l of M.locsAmerica) { const p = M.plant.get(l); if (!(['desert', 'sparse'].includes(p.veg) && ['arid', 'cold_arid'].includes(p.clima))) P.get(l).set('camels', 0); }

  // 2. identidad de cada area, region a region y en orden fijo
  const identidad = new Map(), faccionArea = new Map();
  const usadasRegion = new Map();
  const ordenAreas = [...areas.keys()].sort((a, b) => (M.jer.get(areas.get(a)[0]).region || '').localeCompare(M.jer.get(areas.get(b)[0]).region || '') || a.localeCompare(b));
  for (const a of ordenAreas) {
    const ls = areas.get(a);
    const reg = M.jer.get(ls[0]).region;
    const cuenta = {}; for (const l of ls) { const d = duenoLoc.get(l); if (d) cuenta[d] = (cuenta[d] || 0) + 1; }
    const dueno = Object.entries(cuenta).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0]?.[0] || null;
    faccionArea.set(a, dueno);
    const usadas = usadasRegion.get(reg) || {};
    let mejor = null, max = -1;
    for (const [id, bs] of Object.entries(IDENTIDADES)) {
      // cuanto cuadra: media, por casilla, de la mejor elevacion entre los bienes de la identidad
      const ajuste = ls.reduce((s, l) => s + Math.max(...bs.map((b) => P.get(l).get(b) || 0)), 0) / ls.length;
      let pt = ajuste * Math.pow(0.7, usadas[id] || 0);
      if (dueno && afin[dueno]?.includes(id)) pt = pt * 1.6 + 0.5;
      if (pt > max) { max = pt; mejor = id; }
    }
    identidad.set(a, mejor);
    usadas[mejor] = (usadas[mejor] || 0) + 1; usadasRegion.set(reg, usadas);
  }

  // 3. reparto dentro de cada area
  const asignado = new Map();
  const uf = new Conjuntos();
  const tallaSiPongo = (l, b) => {
    let t = 1; const vistas = new Set();
    for (const v of vec.get(l) || []) if (asignado.get(v) === b) { const r = uf.raiz(v); if (!vistas.has(r)) { vistas.add(r); t += uf.talla.get(r); } }
    return t;
  };
  const dominante = new Map();
  for (const a of ordenAreas) {
    const ls = [...areas.get(a)].sort();
    const bs = IDENTIDADES[identidad.get(a)];
    const dom = [...bs].sort((x, y) => ls.reduce((s, l) => s + (P.get(l).get(y) || 0), 0) - ls.reduce((s, l) => s + (P.get(l).get(x) || 0), 0) || x.localeCompare(y))[0];
    dominante.set(a, dom);
    const tope = Math.max(1, Math.floor(TOPE_DOMINANTE * ls.length));
    let nDom = 0;
    const enArea = new Map(); // variedad: cada vez que un bien se repite en el area pesa un poco menos
    for (const l of ls) {
      const orden = [...P.get(l)].map(([b, p]) => [b, p * (bs.includes(b) ? 3 : 1) * (b === dom ? 1.5 : 1) * Math.pow(0.8, b === dom ? 0 : (enArea.get(b) || 0))])
        .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
      let elegido = null;
      for (const [b] of orden) {
        if (b === dom && nDom >= tope) continue;
        if (tallaSiPongo(l, b) > MAX_JUNTAS) continue;
        elegido = b; break;
      }
      if (!elegido) elegido = orden[0][0]; // no deberia pasar: hay 53 bienes
      asignado.set(l, elegido); uf.nuevo(l);
      for (const v of vec.get(l) || []) if (asignado.get(v) === elegido) uf.une(l, v);
      if (elegido === dom) nDom++;
      enArea.set(elegido, (enArea.get(elegido) || 0) + 1);
    }
  }

  // 4. minimo por bien y continente (el jugador A quiere todos: el salitre para la polvora, el
  //    mercurio para joyas y ciencia...). Para cada bien con menos de MIN_POR_CONTINENTE, se
  //    cambian las casillas del continente donde mas aptitud tiene, sin dejar a otro bien por
  //    debajo del minimo y sin pasar de MAX_JUNTAS vecinas iguales.
  const mancha = (l, b) => { // talla de la mancha de b si l pasa a b
    const vistos = new Set([l]); const pila = [...(vec.get(l) || [])].filter((v) => asignado.get(v) === b);
    while (pila.length) { const v = pila.pop(); if (vistos.has(v)) continue; vistos.add(v); if (vistos.size > MAX_JUNTAS + 1) break; for (const w of vec.get(v) || []) if (!vistos.has(w) && asignado.get(w) === b) pila.push(w); }
    return vistos.size;
  };
  const porContinente = new Map(); // subcontinente -> [locs]
  for (const l of M.locsAmerica) { const s = M.jer.get(l).subcontinente || '?'; if (!porContinente.has(s)) porContinente.set(s, []); porContinente.get(s).push(l); }
  const rellenos = [];
  for (const [s, ls] of [...porContinente].sort(([a], [b]) => a.localeCompare(b))) {
    const cuenta = new Map(); for (const l of ls) cuenta.set(asignado.get(l), (cuenta.get(asignado.get(l)) || 0) + 1);
    for (const b of [...bienes.keys()].sort()) {
      const falta = MIN_POR_CONTINENTE - (cuenta.get(b) || 0);
      if (falta <= 0) continue;
      const cands = ls.filter((l) => asignado.get(l) !== b).map((l) => [l, P.get(l).get(b) || 0]).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
      let puestos = 0;
      for (const [l] of cands) {
        if (puestos >= falta) break;
        const viejo = asignado.get(l);
        if ((cuenta.get(viejo) || 0) <= MIN_POR_CONTINENTE) continue;
        if (mancha(l, b) > MAX_JUNTAS) continue;
        const a = M.jer.get(l).area, lsA = areas.get(a);
        if (b === dominante.get(a) && lsA.filter((x) => asignado.get(x) === b).length + 1 > Math.max(1, Math.floor(TOPE_DOMINANTE * lsA.length))) continue;
        asignado.set(l, b); cuenta.set(viejo, cuenta.get(viejo) - 1); cuenta.set(b, (cuenta.get(b) || 0) + 1); puestos++;
      }
      rellenos.push({ continente: s, bien: b, puestos, falta });
    }
  }

  // 4b. criterio de los jugadores (21-11): oro y plata un poco en todas las regiones; los metales
  //     en todas las regiones y, si se puede, en cada area con montes, con mas peso en montaña y
  //     colinas; ninguna region acapara un metal ni un precioso (TOPE_REGION); y ningun bien pasa
  //     de su tope en el Nuevo Mundo (dos veces su parte en el juego base, entre el 1 y el 8 %).
  const METALES = ['iron', 'copper', 'tin', 'lead'].filter((b) => bienes.has(b));
  const PRECIOSOS = ['goods_gold', 'silver'].filter((b) => bienes.has(b));
  const protegidos = new Set([...METALES, ...PRECIOSOS]);
  const relieve = (l) => ({ mountains: 3, hills: 2, plateau: 1.5 }[M.plant.get(l).topo] || 1);
  const porRegion = new Map();
  for (const l of M.locsAmerica) { const r = M.jer.get(l).region || '?'; if (!porRegion.has(r)) porRegion.set(r, []); porRegion.get(r).push(l); }
  const minimoEn = (b, n) => Math.min({ iron: Math.max(3, Math.round(0.01 * n)), copper: 3, tin: 2, lead: 2, goods_gold: 2, silver: 2 }[b] || 1, Math.max(1, Math.floor(n / 40)));
  const cuentaDe = (ls, b) => ls.filter((l) => asignado.get(l) === b).length;
  const total = new Map(); for (const l of M.locsAmerica) total.set(asignado.get(l), (total.get(asignado.get(l)) || 0) + 1);
  const cambia = (l, b) => { const v = asignado.get(l); total.set(v, total.get(v) - 1); total.set(b, (total.get(b) || 0) + 1); asignado.set(l, b); };
  const nJ = [...J.plant.values()].filter((p) => p.bien).length;
  const parteJ = new Map(); for (const p of J.plant.values()) if (p.bien) parteJ.set(p.bien, (parteJ.get(p.bien) || 0) + 1 / nJ);
  const topeNM = (b) => Math.round(M.locsAmerica.length * Math.min(TOPE_BIEN, Math.max(0.01, 2 * (parteJ.get(b) || 0))));
  const siguiente = (l, fuera) => [...P.get(l)].filter(([b, p]) => p > 0 && !fuera.has(b) && (total.get(b) || 0) < topeNM(b) && mancha(l, b) <= MAX_JUNTAS)
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0]?.[0];
  const garantias = { metidos: 0, enAreas: 0, recortados: 0 };
  for (const [, ls] of [...porRegion].sort(([a], [b]) => a.localeCompare(b))) {
    for (const b of [...METALES, ...PRECIOSOS]) {
      let falta = minimoEn(b, ls.length) - cuentaDe(ls, b);
      const cands = ls.filter((l) => !protegidos.has(asignado.get(l))).map((l) => [l, (P.get(l).get(b) || 0) * relieve(l)]).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
      for (const [l] of cands) { if (falta <= 0) break; if (mancha(l, b) > MAX_JUNTAS) continue; cambia(l, b); falta--; garantias.metidos++; }
    }
  }
  for (const a of ordenAreas) {
    const ls = areas.get(a);
    if (ls.some((l) => METALES.includes(asignado.get(l)))) continue;
    const c = ls.filter((l) => ['mountains', 'hills'].includes(M.plant.get(l).topo) && !protegidos.has(asignado.get(l)))
      .flatMap((l) => METALES.map((b) => [l, b, (P.get(l).get(b) || 0) * relieve(l)])).sort((x, y) => y[2] - x[2] || x[0].localeCompare(y[0]) || x[1].localeCompare(y[1]))
      .find(([l, b]) => mancha(l, b) <= MAX_JUNTAS);
    if (c) { cambia(c[0], c[1]); garantias.enAreas++; }
  }
  for (const b of [...METALES, ...PRECIOSOS]) {
    const tope = Math.ceil(TOPE_REGION * (total.get(b) || 0));
    for (const [, ls] of [...porRegion].sort(([a], [x]) => a.localeCompare(x))) {
      const mias = ls.filter((l) => asignado.get(l) === b).sort((x, y) => (P.get(x).get(b) || 0) * relieve(x) - (P.get(y).get(b) || 0) * relieve(y) || x.localeCompare(y));
      for (const l of mias.slice(0, Math.max(0, mias.length - Math.max(tope, minimoEn(b, ls.length))))) { const o = siguiente(l, protegidos); if (o) { cambia(l, o); garantias.recortados++; } }
    }
  }
  for (const [b] of [...total].sort((x, y) => (y[1] - topeNM(y[0])) - (x[1] - topeNM(x[0])) || x[0].localeCompare(y[0]))) {
    if (protegidos.has(b) || (total.get(b) || 0) <= topeNM(b)) continue;
    const suyas = M.locsAmerica.filter((l) => asignado.get(l) === b).sort((x, y) => (P.get(x).get(b) || 0) - (P.get(y).get(b) || 0) || x.localeCompare(y));
    for (const l of suyas) { if (total.get(b) <= topeNM(b)) break; const o = siguiente(l, new Set([b, ...protegidos])); if (o) { cambia(l, o); garantias.recortados++; } }
  }

  // estadisticas (las manchas se miden de nuevo: el paso 4 puede haberlas partido)
  const porSub = {};
  for (const l of M.locsAmerica) { const s = M.jer.get(l).subcontinente || '?'; (porSub[s] ??= new Map()).set(asignado.get(l), (porSub[s].get(asignado.get(l)) || 0) + 1); }
  let maxJuntas = 0;
  { const vistos = new Set(); for (const l of M.locsAmerica) { if (vistos.has(l)) continue; const b = asignado.get(l); let t = 0; const pila = [l]; while (pila.length) { const v = pila.pop(); if (vistos.has(v)) continue; vistos.add(v); t++; for (const w of vec.get(v) || []) if (!vistos.has(w) && asignado.get(w) === b) pila.push(w); } maxJuntas = Math.max(maxJuntas, t); } }
  let maxCuota = 0; for (const a of ordenAreas) { const ls = areas.get(a); if (ls.length < 3) continue; const n = ls.filter((l) => asignado.get(l) === dominante.get(a)).length; maxCuota = Math.max(maxCuota, n / ls.length); }
  const identidades = {}; for (const id of identidad.values()) identidades[id] = (identidades[id] || 0) + 1;
  const cambian = M.locsAmerica.filter((l) => asignado.get(l) !== M.plant.get(l).bien);
  return { M, bienes, sinRegla, rellenos, garantias, asignado, identidad, dominante, faccionArea, porSub, maxJuntas, maxCuota, identidades, cambian, areas };
}

export function textoEfectos(r) {
  const lineas = r.cambian.map((l) => `\tlocation:${l} = { change_raw_material = goods:${r.asignado.get(l)} }`);
  return `# GJ Nuevo Mundo, integracion: recursos por zonas. GENERADO por asigna-recursos.mjs.
# mundo: ${r.M.meta.name} (${r.M.meta.id}); ${r.M.locsAmerica.length} localizaciones del Nuevo Mundo, ${r.cambian.length} cambian de bien.
# Determinista: el mismo mundo y el mismo vinculo dan este mismo fichero.

gj_asigna_recursos = {
${lineas.join('\n')}
}
`;
}

export function informeRecursos(r) {
  const filas = Object.entries(r.porSub).sort().map(([s, m]) => {
    const tot = [...m.values()].reduce((x, y) => x + y, 0);
    const top = [...m].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0])).slice(0, 8).map(([b, n]) => `${b} ${(100 * n / tot).toFixed(0)} %`).join(', ');
    return `| ${s} | ${tot} | **${m.size}** | ${top} |`;
  });
  const faltan = [...r.bienes.keys()].filter((b) => !Object.values(r.porSub).some((m) => m.has(b))).sort();
  return `# Recursos por zonas

Mundo: **${r.M.meta.name}** (\`${r.M.meta.id}\`). ${r.M.locsAmerica.length} localizaciones del Nuevo Mundo en ${r.areas.size} áreas; ${r.cambian.length} cambian de bien. Bienes posibles: ${r.bienes.size} materias primas del juego${[...r.bienes.keys()].some((b) => b.startsWith('gj_')) ? ' y del mod' : ''}.

| Continente | Localizaciones | Bienes distintos | Los más comunes |
|---|---|---|---|
${filas.join('\n')}

- Identidades de área: ${Object.entries(r.identidades).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}.
- Regla de mezcla: el dominante llega como mucho al ${(100 * r.maxCuota).toFixed(0)} % de un área de 3 o más localizaciones (tope ${(100 * TOPE_DOMINANTE).toFixed(0)} %); la mancha más grande de casillas vecinas con el mismo bien tiene ${r.maxJuntas} (tope ${MAX_JUNTAS}).
- Mínimo por bien y continente: ${MIN_POR_CONTINENTE} casillas, en las de más aptitud. Se rellenaron ${r.rellenos.filter((x) => x.puestos).length} huecos (${r.rellenos.reduce((s, x) => s + x.puestos, 0)} casillas)${r.rellenos.some((x) => x.puestos < x.falta) ? `; no llegan al mínimo: ${r.rellenos.filter((x) => x.puestos < x.falta).map((x) => `${x.bien} en ${x.continente} (${x.puestos}/${x.falta})`).join(', ')}` : ''}.
- **Bienes que faltan: ${[...r.bienes.keys()].filter((b) => Object.values(r.porSub).some((m) => !m.has(b))).length}** (bienes que no salen en algún continente: ${[...r.bienes.keys()].filter((b) => Object.values(r.porSub).some((m) => !m.has(b))).sort().join(', ') || 'ninguno'}).
- Bienes que no salen en ningún continente: ${faltan.join(', ') || 'ninguno'}.
- Bienes sin estadística en el mapa del juego, que no se reparten solos: ${r.sinRegla.join(', ') || 'ninguno'}.
`;
}

// ---------------------------------------------------------------- CLI
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
  const vin = arg('--vinculo', null);
  const paisesFaccion = vin ? JSON.parse(fs.readFileSync(vin, 'utf8')).paises || {} : {};
  const r = await asignaRecursos({ juego: path.resolve(arg('--juego') ?? juegoPorDefecto()), mundo: arg('--mundo', null), vanilla: args.includes('--vanilla'), paisesFaccion, modDirs: arg('--mod', null) ? [arg('--mod', null)] : [] });
  const inf = informeRecursos(r);
  console.log(inf);
  if (!args.includes('--seco')) {
    const sal = arg('--salida', null);
    if (sal) { escribeConBom(path.resolve(sal), textoEfectos(r)); console.log(`Efectos: ${sal}`); }
    const js = arg('--json', null);
    if (js) { fs.writeFileSync(path.resolve(js), JSON.stringify(Object.fromEntries(r.cambian.map((l) => [l, r.asignado.get(l)]))) + '\n'); console.log(`JSON: ${js}`); }
    const im = arg('--informe', null);
    if (im) { fs.writeFileSync(path.resolve(im), inf, 'utf8'); console.log(`Informe: ${im}`); }
  }
}
