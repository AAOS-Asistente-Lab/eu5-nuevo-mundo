// reparte-paises.mjs: reparto del Nuevo Mundo en paises parejos (Javier, 21-11: «ningun pais con mas
// de 150 provincias salvo Kaivan, tamano medio de 100 a 120, prioriza minimizar la distancia a la
// capital, la capital en un buen sitio, ningun pais dentro de otro»). Sustituye a reparte-tierra.mjs.
//   1. Capitales primero. La de cada faccion y cada menor con nombre, en el mejor sitio de su zona
//      del dibujo (capitales.mjs: costa, puerto, rio, llano, cultivos). Las de los demas paises, en
//      los mejores sitios que queden a SEPARACION pasos o mas de otra capital.
//   2. Todos crecen a la vez desde su capital: cada localizacion es del pais que llega antes a ella
//      por tierra (coste de terreno), hasta su tope. Un peso por pais iguala las tallas en unas
//      vueltas, y la capital se recoloca en el mejor sitio cerca del centro de su tierra.
//   3. La faccion solo toma tierra de su zona; el menor, de la suya y de la de su vecina.
//   4. Los estados de RNW que no hacen de faccion ni de menor desaparecen: su tierra entra en el
//      reparto (lista `retirados`). Los paises que no son faccion ni menor son nuevos.
//   5. Queda sin dueno la tierra de los trozos pequenos (islotes) y las regiones mas hostiles,
//      enteras, hasta dejar con dueno CON_DUENO del continente.
// Sin azar y sin depender del idioma del PC (las cadenas se comparan con <, no con localeCompare).

import { esMala } from './capitales.mjs';
import { trozosDe } from './reparte-tierra.mjs';

export const TALLA_OBJETIVO = 112;   // localizaciones de un pais corriente
export const TALLA_FACCION = 140;    // las facciones, algo mas, sin pasar del tope
export const TALLA_MAXIMA = 150;     // tope de cualquier pais salvo los de SIN_TOPE
export const SIN_TOPE = ['kaivan'];  // facciones exentas del tope (mecanicas propias)
export const FRACCION_SIN_TOPE = 0.35; // parte de su zona que tienen las exentas
export const TALLA_MINIMA = 45;      // un pais nuevo con menos se disuelve entre sus vecinos
export const TROZO_MINIMO = 30;      // los trozos de tierra seguida mas pequenos quedan libres
export const SEPARACION = 11;        // pasos entre capitales al sembrar (baja de uno en uno si no caben)
export const CON_DUENO = 0.80;       // parte del continente con dueno al empezar (jugadores, 21-11 tarde)
export const MINIMO_SUBZONA = 8;     // localizaciones de la faccion en cada sub-zona que piden sus mecanicas
export const COSTE_TOPO = { flatland: 1, plateau: 1.3, hills: 1.7, mountains: 4, wetlands: 3 };
export const COSTE_VEG = { desert: 2.5, jungle: 1.6, forest: 1.2 };
export const RUIDO = 0.15;           // poco: lo que manda es la distancia a la capital
export const PESO_CENTRO = 0.35;     // puntos de capital que cuesta cada paso lejos del centro de su tierra
export const VUELTAS = 40;
export const SEMILLA = 'gj-nuevo-mundo';

const fraccion = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// Monticulo minimo de [clave, indice de pais, localizacion]
class Monton {
  constructor() { this.a = []; }
  static menor(x, y) { return x[0] < y[0] || (x[0] === y[0] && (x[1] < y[1] || (x[1] === y[1] && x[2] < y[2]))); }
  mete(x) { const a = this.a; let i = a.push(x) - 1; while (i > 0) { const p = (i - 1) >> 1; if (!Monton.menor(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; } }
  saca() {
    const a = this.a, r = a[0], u = a.pop();
    if (a.length) { a[0] = u; for (let i = 0; ;) { const l = 2 * i + 1, d = l + 1; let m = i; if (l < a.length && Monton.menor(a[l], a[m])) m = l; if (d < a.length && Monton.menor(a[d], a[m])) m = d; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } }
    return r;
  }
  get vacio() { return !this.a.length; }
}

// Pasos de tierra desde un conjunto de localizaciones: Map(loc -> pasos)
export function pasosDesde(origen, vec, dentro) {
  const d = new Map(), cola = [];
  for (const l of origen) if (!d.has(l)) { d.set(l, 0); cola.push(l); }
  for (let i = 0; i < cola.length; i++) for (const w of vec.get(cola[i]) || []) if (dentro(w) && !d.has(w)) { d.set(w, d.get(cola[i]) + 1); cola.push(w); }
  return d;
}

// Paises metidos dentro de otro: un solo pais vecino por tierra, sin tierra libre al lado y sin
// costa (el que tiene costa es una peninsula, no un enclave).
export function enclaves(dueno, vec, esTierra, costa) {
  const vecinos = new Map(), libre = new Set(), conCosta = new Set();
  for (const [l, t] of dueno) {
    if (!vecinos.has(t)) vecinos.set(t, new Set());
    if (costa.has(l)) conCosta.add(t);
    for (const w of vec.get(l) || []) if (esTierra.has(w)) { const o = dueno.get(w); if (!o) libre.add(t); else if (o !== t) vecinos.get(t).add(o); }
  }
  return [...vecinos].filter(([t, vs]) => vs.size === 1 && !libre.has(t) && !conCosta.has(t)).map(([t, vs]) => ({ tag: t, dentroDe: [...vs][0] })).sort((a, b) => cmp(a.tag, b.tag));
}

export function repartePaises({ liga, vec, paises, asignados, facciones, subzonas = [], menores = [], poblacion = new Map(), puntua, plant = new Map(), costa = new Set(), nuevoTag,
  objetivo = TALLA_OBJETIVO, tallaFaccion = TALLA_FACCION, maximo = TALLA_MAXIMA, sinTope = SIN_TOPE, fraccionSinTope = FRACCION_SIN_TOPE, tallaMinima = TALLA_MINIMA,
  trozoMinimo = TROZO_MINIMO, separacion = SEPARACION, conDueno = CON_DUENO, minimoSubzona = MINIMO_SUBZONA, costeTopo = COSTE_TOPO, costeVeg = COSTE_VEG, ruido = RUIDO,
  pesoCentro = PESO_CENTRO, vueltas = VUELTAS, semilla = SEMILLA }) {
  const tierra = [...liga.tierra].sort();
  const esTierra = new Set(tierra);
  const total = tierra.length;
  const zonaId = (l) => liga.zonaDe.get(l)?.id;
  const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
  const antes = new Map();
  for (const p of paises) for (const l of p.locs) if (esTierra.has(l)) antes.set(l, p.tag);
  const enT = (l) => esTierra.has(l);

  // tierra que entra en el reparto: la de los trozos de tierra seguida de trozoMinimo o mas
  const trozos = trozosDe(tierra, vec);
  const jugable = new Set(trozos.filter((t) => t.length >= trozoMinimo).flat());
  const enJ = (l) => jugable.has(l);
  const paso = (l) => { const p = plant.get(l) || {}; return (costeTopo[p.topo] ?? 1) * (costeVeg[p.veg] ?? 1) * (1 + ruido * (2 * fraccion(`${semilla}:${l}`) - 1)); };
  const pasoMedio = (() => { const ds = []; for (const l of tierra.slice(0, 4000)) for (const v of vec.get(l) || []) if (liga.xy.has(v)) { const [a, b] = liga.xy.get(l), [c, e] = liga.xy.get(v); ds.push(Math.hypot(a - c, b - e)); } ds.sort((x, y) => x - y); return ds[ds.length >> 1] || 1; })();
  const mala = (l) => esMala(plant.get(l));
  const base = (l) => puntua(l); // puntuacion del sitio, sin el termino de centro

  // ---------------------------------------------------------------- paises con nombre
  const P = []; // { tag, tipo, clave, zonas, casa, meta, tope, cap, peso, pide: [Set de sub-zona] }
  const locsZona = new Map();
  for (const l of tierra) { const z = zonaId(l); if (!locsZona.has(z)) locsZona.set(z, []); locsZona.get(z).push(l); }
  for (const f of [...facciones].sort((a, b) => cmp(a.clave, b.clave))) {
    if (!asignados[f.clave]) continue;
    const z = facZona(f), nz = (locsZona.get(z) || []).length, exenta = sinTope.includes(f.clave);
    const meta = exenta ? Math.round(fraccionSinTope * nz) : tallaFaccion;
    const pide = subzonas.map((s) => ({ nombre: s.nombre, locs: s.locs.filter(enT) })).filter((s) => s.locs.length && s.locs.filter((l) => zonaId(l) === z).length * 2 > s.locs.length);
    P.push({ tag: asignados[f.clave].tag, tipo: 'faccion', clave: f.clave, zonas: new Set([z]), casa: z, meta, tope: exenta ? meta : maximo, pide });
  }
  for (const m of [...menores].sort((a, b) => cmp(a.tag, b.tag))) P.push({ tag: m.tag, tipo: 'menor', clave: m.clave || m.tag, zonas: new Set(m.zonas || [m.zona]), casa: m.zona, meta: objetivo, tope: maximo, pide: [] });
  const puede = (c, l) => !c.zonas || c.zonas.has(zonaId(l));

  // capital de un pais con nombre: el mejor sitio del trozo mayor de su zona. Con una sub-zona que
  // piden sus mecanicas, a 3 pasos o menos de ella; con varias (Kaivan), lo mas cerca de todas.
  const tomadas = new Set();
  const lejosDe = (sep) => { const d = pasosDesde(tomadas, vec, enT); return (l) => (d.get(l) ?? Infinity) >= sep; };
  const mejor = (cands, valor) => [...cands].sort((a, b) => (mala(a) - mala(b)) || valor(b) - valor(a) || cmp(a, b))[0];
  for (const c of P) {
    const deCasa = (locsZona.get(c.casa) || []).filter(enT);
    if (!deCasa.length) continue;
    const trozo = trozosDe(deCasa, vec).sort((a, b) => b.length - a.length || cmp(a[0], b[0]))[0];
    let cands = trozo, valor = base;
    const dS = c.pide.map((s) => pasosDesde(s.locs, vec, enT));
    if (dS.length === 1) { const cerca = trozo.filter((l) => (dS[0].get(l) ?? Infinity) <= 3); if (cerca.length) cands = cerca; }
    else if (dS.length > 1) valor = (l) => base(l) - 0.5 * Math.max(...dS.map((d) => d.get(l) ?? 99));
    for (let sep = separacion; sep >= 0; sep--) { const ok = cands.filter(lejosDe(sep)); if (ok.length) { cands = ok; break; } }
    c.cap = mejor(cands, valor); tomadas.add(c.cap);
  }
  const conNombre = P.filter((c) => c.cap);

  // ---------------------------------------------------------------- paises nuevos: cuantos y donde
  const alcance = (c) => { const v = new Set([c.cap]), cola = [c.cap]; for (let i = 0; i < cola.length && v.size < c.meta; i++) for (const w of vec.get(cola[i]) || []) if (enT(w) && !v.has(w) && puede(c, w)) { v.add(w); cola.push(w); } return Math.min(c.meta, v.size); };
  const reservado = conNombre.reduce((s, c) => s + alcance(c), 0);
  const nNuevos = Math.max(0, Math.round((jugable.size - reservado) / objetivo));
  const todos = [...conNombre];
  for (let sep = separacion, n = 0; n < nNuevos && sep >= 5;) {
    const lejos = lejosDe(sep);
    const cands = [...jugable].filter((l) => !mala(l) && lejos(l));
    if (!cands.length) { sep--; continue; }
    const cap = mejor(cands, base);
    tomadas.add(cap); n++;
    todos.push({ tag: null, tipo: 'nuevo', clave: `nuevo-${String(n).padStart(2, '0')}`, zonas: null, casa: null, meta: objetivo, tope: maximo, cap, pide: [] });
  }
  todos.forEach((c, i) => { c.i = i; c.peso = 1; });

  // ---------------------------------------------------------------- crecimiento a la vez
  const crece = () => {
    const dueno = new Map(), n = todos.map(() => 0), m = new Monton(), g = todos.map(() => new Map());
    for (const c of todos) { g[c.i].set(c.cap, 0); m.mete([0, c.i, c.cap]); }
    while (!m.vacio) {
      const [k, i, l] = m.saca(), c = todos[i];
      if (dueno.has(l) || n[i] >= c.tope) continue;
      const gl = g[i].get(l);
      if (k > gl * c.peso + 1e-9) continue; // entrada vieja
      dueno.set(l, i); n[i]++;
      for (const w of [...(vec.get(l) || [])].sort()) {
        if (!enT(w) || dueno.has(w) || !puede(c, w)) continue;
        const nv = gl + paso(w);
        if (!g[i].has(w) || nv < g[i].get(w)) { g[i].set(w, nv); m.mete([nv * c.peso, i, w]); }
      }
    }
    return { dueno, n };
  };
  const suyasDe = (dueno) => { const r = todos.map(() => []); for (const [l, i] of dueno) r[i].push(l); return r; };
  const centroide = (ls) => [0, 1].map((k) => ls.reduce((s, l) => s + liga.xy.get(l)[k], 0) / ls.length);
  const recoloca = (dueno) => {
    const por = suyasDe(dueno);
    for (const c of todos) {
      const ls = por[c.i]; if (!ls.length) continue;
      const cen = centroide(ls);
      let cands = c.casa ? ls.filter((l) => zonaId(l) === c.casa) : ls;
      if (c.pide.length === 1) { const d = pasosDesde(c.pide[0].locs, vec, enT); const cerca = cands.filter((l) => (d.get(l) ?? Infinity) <= 3); if (cerca.length) cands = cerca; }
      if (!cands.length) continue;
      const valor = (l) => { const [x, y] = liga.xy.get(l); return base(l) - pesoCentro * Math.hypot(x - cen[0], y - cen[1]) / pasoMedio; };
      c.cap = mejor(cands, valor);
    }
  };
  // Los pesos oscilan: el ajuste se amortigua con las vueltas y se guarda la mejor (la que menos se
  // aparta de las metas; las facciones cuentan triple). La meta de un pais encerrado es lo que alcanza.
  const error = (res) => todos.reduce((s, c) => s + (c.tipo === 'faccion' ? 3 : 1) * ((res.n[c.i] - Math.min(c.meta, alcance(c))) / c.meta) ** 2, 0);
  let r = crece(), mejorVuelta = { e: error(r), caps: todos.map((c) => c.cap), pesos: todos.map((c) => c.peso) };
  for (let v = 1; v < vueltas; v++) {
    const exp = 0.1 + 0.5 * (1 - v / vueltas);
    for (const c of todos) c.peso *= Math.min(1.25, Math.max(0.8, (Math.max(r.n[c.i], 1) / c.meta) ** exp));
    if (v % 4 === 0 && v < vueltas / 2) recoloca(r.dueno);
    r = crece();
    const e = error(r);
    if (e < mejorVuelta.e) mejorVuelta = { e, caps: todos.map((c) => c.cap), pesos: todos.map((c) => c.peso) };
  }
  todos.forEach((c, i) => { c.cap = mejorVuelta.caps[i]; c.peso = mejorVuelta.pesos[i]; });
  r = crece();
  const dueno = r.dueno, n = r.n;

  // lo que nadie ha alcanzado, al vecino con menos tierra que aun quepa; el pais nuevo que queda
  // por debajo de tallaMinima se disuelve entre sus vecinos
  const rellena = () => {
    for (let avanza = true; avanza;) {
      avanza = false;
      for (const l of tierra) {
        if (dueno.has(l) || !enJ(l)) continue;
        const vs = [...new Set([...(vec.get(l) || [])].filter((w) => dueno.has(w)).map((w) => dueno.get(w)))].filter((i) => todos[i].vivo !== false && n[i] < todos[i].tope && puede(todos[i], l));
        if (!vs.length) continue;
        const i = vs.sort((a, b) => n[a] / todos[a].meta - n[b] / todos[b].meta || a - b)[0];
        dueno.set(l, i); n[i]++; avanza = true;
      }
    }
  };
  rellena();
  for (const c of [...todos].sort((a, b) => n[a.i] - n[b.i] || a.i - b.i)) {
    if (c.tipo !== 'nuevo' || n[c.i] >= tallaMinima) continue;
    c.vivo = false;
    for (const [l, i] of [...dueno]) if (i === c.i) dueno.delete(l);
    n[c.i] = 0;
    rellena();
  }

  // ---------------------------------------------------------------- tierra libre: regiones enteras
  // De los paises nuevos, se quedan sin dueno los de tierra mas hostil (mas montana, desierto,
  // pantano y artico; a igualdad, menos gente), hasta bajar a conDueno del continente.
  const por0 = suyasDe(dueno);
  const hostil = (c) => { const ls = por0[c.i]; return ls.filter(mala).length / ls.length; };
  const gente = (c) => por0[c.i].reduce((s, l) => s + (poblacion.get(l) || 0), 0);
  const metaDueno = Math.round(conDueno * total);
  const liberadas = [];
  for (const c of todos.filter((x) => x.tipo === 'nuevo' && x.vivo !== false).sort((a, b) => hostil(b) - hostil(a) || gente(a) - gente(b) || a.i - b.i)) {
    if (dueno.size - n[c.i] < metaDueno) continue;
    c.vivo = false; liberadas.push({ clave: c.clave, locs: n[c.i], hostil: hostil(c) });
    for (const l of por0[c.i]) dueno.delete(l);
    n[c.i] = 0;
  }

  // ---------------------------------------------------------------- tags y salida
  const vivos = todos.filter((c) => c.vivo !== false && n[c.i] > 0);
  for (const c of vivos) if (!c.tag) c.tag = nuevoTag();
  const final = new Map([...dueno].map(([l, i]) => [l, todos[i].tag]));
  const por = new Map(); for (const [l, t] of final) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  for (const ls of por.values()) ls.sort();
  const da = {}, suelta = {};
  for (const l of tierra) {
    const t = final.get(l), a = antes.get(l);
    if (t && t !== a) da[l] = t;
    else if (!t && a) suelta[l] = a;
  }
  const capital = {};
  const porTag = new Map(paises.map((p) => [p.tag, p]));
  for (const c of vivos) if (c.tipo !== 'nuevo') { const p = porTag.get(c.tag); if (p && p.capital !== c.cap) capital[c.tag] = { de: p.capital, a: c.cap, clave: c.tipo === 'menor' ? 'menor' : c.clave }; }
  const nuevos = vivos.filter((c) => c.tipo === 'nuevo').map((c) => ({ tag: c.tag, capital: c.cap, locs: por.get(c.tag) }));
  const conTierra = new Set(vivos.map((c) => c.tag));
  const retirados = paises.filter((p) => !conTierra.has(p.tag)).map((p) => p.tag).sort();

  // ---------------------------------------------------------------- informe y comprobaciones
  const tallas = vivos.map((c) => n[c.i]).sort((a, b) => a - b);
  const media = tallas.reduce((s, x) => s + x, 0) / tallas.length;
  const dCap = vivos.map((c) => { const d = pasosDesde([c.cap], vec, (w) => final.get(w) === c.tag); const xs = [...d.values()].sort((a, b) => a - b); return { tag: c.tag, media: xs.reduce((s, x) => s + x, 0) / xs.length, max: xs.at(-1) }; });
  const fila = (c) => ({ tag: c.tag, tipo: c.tipo, clave: c.clave, n: n[c.i], enCasa: c.casa ? por.get(c.tag).filter((l) => zonaId(l) === c.casa).length : null, cap: c.cap, puntos: base(c.cap), mala: mala(c.cap), costa: costa.has(c.cap), pasosMedia: dCap.find((x) => x.tag === c.tag).media, pasosMax: dCap.find((x) => x.tag === c.tag).max });
  const fallos = [];
  for (const c of vivos) {
    if (trozosDe(por.get(c.tag), vec).length > 1) fallos.push(`${c.tag} (${c.clave}) esta partido en trozos`);
    if (final.get(c.cap) !== c.tag) fallos.push(`${c.tag} (${c.clave}): su capital ${c.cap} no es suya`);
    if (n[c.i] > c.tope) fallos.push(`${c.tag} (${c.clave}) pasa de su tope: ${n[c.i]} > ${c.tope}`);
    for (const s of c.pide) { const k = s.locs.filter((l) => final.get(l) === c.tag).length; if (k < Math.min(minimoSubzona, s.locs.length)) fallos.push(`${c.tag} (${c.clave}) tiene ${k} localizaciones en ${s.nombre}: sus mecanicas piden ${minimoSubzona}`); }
  }
  for (const c of P) if (!vivos.includes(c)) fallos.push(`${c.tag} (${c.clave}) se queda sin tierra`);
  const dentro = enclaves(final, vec, esTierra, costa);
  for (const e of dentro) fallos.push(`${e.tag} esta dentro de ${e.dentroDe}`);
  return {
    da, suelta, capital, nuevos, retirados, fallos,
    informe: {
      total, conDuenoAntes: antes.size, conDueno: final.size, metaDueno, jugable: jugable.size, islotes: total - jugable.size,
      paises: vivos.length, media, mediana: tallas[tallas.length >> 1], minimo: tallas[0], maximo: tallas.at(-1),
      filas: vivos.map(fila).sort((a, b) => cmp(a.tipo, b.tipo) || b.n - a.n || cmp(a.tag, b.tag)),
      liberadas, retirados: retirados.length, enclaves: dentro,
      pasosMedia: dCap.reduce((s, x) => s + x.media, 0) / dCap.length, pasosMax: Math.max(...dCap.map((x) => x.max)),
      capitalesMalas: vivos.filter((c) => mala(c.cap)).length, capitalesCosta: vivos.filter((c) => costa.has(c.cap)).length,
    },
  };
}

export function textoPaises(r) {
  const i = r.informe, pc = (x) => `${(100 * x / i.total).toFixed(1)} %`;
  const tabla = (tipo) => i.filas.filter((f) => f.tipo === tipo).map((f) => `| ${f.clave} | ${f.tag} | ${f.n} |${f.enCasa === null ? ' |' : ` ${f.enCasa} |`} ${f.cap} | ${f.puntos.toFixed(1)}${f.mala ? ' (mala)' : ''} | ${f.costa ? 'si' : 'no'} | ${f.pasosMedia.toFixed(1)} | ${f.pasosMax} |`).join('\n');
  const cab = '| Pais | Tag | Localizaciones | En su zona | Capital | Puntos del sitio | Costa | Pasos medios a la capital | Pasos maximos |\n|---|---|---|---|---|---|---|---|---|';
  return `## Tierra con dueno al empezar (reparte-paises.mjs)
Nuevo Mundo: ${i.total} localizaciones de tierra (${i.islotes} en trozos de menos de ${TROZO_MINIMO}, que quedan libres). Con dueno en el mundo de RNW: ${i.conDuenoAntes} (${pc(i.conDuenoAntes)}). Tras el reparto: **${i.conDueno} (${pc(i.conDueno)})**, entre **${i.paises} paises** (la meta es ${pc(i.metaDueno)}).

**Tallas:** media **${i.media.toFixed(1)}**, mediana ${i.mediana}, de ${i.minimo} a ${i.maximo} (tope ${TALLA_MAXIMA}, salvo ${SIN_TOPE.join(', ')}). **Pasos a la capital:** media ${i.pasosMedia.toFixed(1)}, maximo ${i.pasosMax}. **Capitales:** ${i.capitalesCosta} de ${i.paises} en la costa, ${i.capitalesMalas} en mal sitio (montana, desierto, pantano o artico).

**Paises dentro de otro: ${i.enclaves.length}**${i.enclaves.length ? ` (${i.enclaves.map((e) => `${e.tag} en ${e.dentroDe}`).join(', ')})` : ''}. **Fallos: ${r.fallos.length}**${r.fallos.length ? `\n${r.fallos.map((f) => `- ${f}`).join('\n')}` : '.'}

Estados de RNW que desaparecen (su tierra entra en el reparto): ${i.retirados}. Regiones que quedan libres para colonizar: ${i.liberadas.length}${i.liberadas.length ? ` (${i.liberadas.map((l) => `${l.locs} localizaciones, ${(100 * l.hostil).toFixed(0)} % hostil`).join('; ')})` : ''}.

### Facciones
${cab}
${tabla('faccion')}

### Menores con nombre
${cab}
${tabla('menor')}

### Paises nuevos
${cab}
${tabla('nuevo')}
`;
}
