// reparte-tierra.mjs: con el mapa final, deja el Nuevo Mundo repartido entre MUCHOS paises, cada uno
// de UNA pieza de tierra seguida (dos localizaciones estan seguidas si se tocan en locations.png).
//   1. Nadie absorbe a nadie: los estados de RNW siguen siendo paises.
//   2. Cada pais se queda solo con su nucleo: la faccion, su trozo con mas tierra en su zona del
//      dibujo; los demas, el trozo de su capital. Los otros trozos que traia de RNW se sueltan.
//   3. Cada faccion crece desde su nucleo, dentro de su zona, hasta una fraccion de ella
//      (FRACCION_FACCION), tomando siempre la localizacion libre que toca mas cerca del centro de la
//      zona: sale una mancha compacta. Asi hay algun pais grande, no doce imperios. Si la tierra
//      libre no le llega, toma tambien la de los estados de RNW de su zona (nunca su capital).
//   3b. Los menores con nombre (facciones.json) crecen antes que las facciones, hasta TALLA_MENOR,
//      y ninguna faccion les quita tierra. El que no tiene tierra en su zona del dibujo, o esta
//      encerrado, se muda a ella (como una faccion): empieza en la tierra libre de su zona.
//   4. Los demas paises crecen por turnos, una localizacion cada uno, la libre que tocan mas cerca
//      de su capital, hasta su talla. La talla sale del tag (TALLAS): la mayoria pequenos, bastantes
//      medianos y unos pocos grandes.
//   5. La tierra suelta que nadie ha tomado se abandona (queda sin dueno, para colonizar), igual que
//      la que nadie alcanza.
// Todo sale en listas ordenadas y sin azar: el mismo mundo y el mismo dibujo dan los mismos bytes.

import { esMala, RIO_ANCHO } from './capitales.mjs';
export const FRACCION_FACCION = 0.35; // parte de su zona que tiene cada faccion al empezar (0,25 hasta el 21-11: +40 %)
export const FACCION_MINIMO = 42;     // ninguna faccion empieza con menos en su zona (30 hasta el 21-11)
// pasos de pasillo como mucho hasta una sub-zona; si no, enclave. Sin tope: un pais no puede quedar
// partido en trozos sueltos por el continente (regla de los jugadores, comprueba-trozos.mjs)
export const MAX_PASILLO = Infinity;
// Crecimiento con fronteras naturales: cada paso cuesta segun el terreno (montaña, pantano y
// desierto hacen de frontera), con un ruido de semilla fija; las provincias empezadas se acaban
// antes de abrir otras. PESO_PUNTO tira hacia el punto de crecimiento para que salga compacto.
export const COSTE_TOPO = { flatland: 1, plateau: 1.3, hills: 1.7, mountains: 4, wetlands: 3 };
export const COSTE_VEG = { desert: 2.5, jungle: 1.6, forest: 1.2 };
export const RUIDO = 0.8;
export const PESO_PUNTO = 1.0;
export const SEMILLA = 'gj-nuevo-mundo';
export const RECARGO_OCUPADA = 4;
export const BONO_PROVINCIA = 1.5;
export const COSTE_RIO_ANCHO = 1.5; // entrar en una localizacion con rio ancho (rivers.png): el rio hace de frontera
export const ESTIRA = 1.3;           // cada pais crece en una elipse (ejes 1,3:1, angulo de su tag): ni circulo perfecto ni tira
export const ANCHO_PASILLO = 1;      // vecinos que se suman a cada lado del pasillo a una sub-zona: cuello de 3, no de 1
export const MINIMO_SUBZONA = 8;      // localizaciones de la faccion en cada sub-zona de su zona
// [parte de los paises, talla minima, talla maxima]
export const TALLAS = [[0.45, 8, 18], [0.40, 20, 50], [0.15, 55, 110]];
export const TALLA_MENOR = [30, 56];  // los menores con nombre (facciones.json): talla minima y maxima
// Parte del Nuevo Mundo que empieza con dueno (Javier, 21-11: que quede libre alrededor del 40 %).
// Si con las tallas no se llega, los paises que no son faccion siguen creciendo por turnos, todos
// en la misma proporcion, hasta ESTIRON_MAXIMO veces su talla.
export const CON_DUENO = 0.60;      // hasta aqui crecen los estados de RNW...
export const CON_DUENO_TOTAL = 0.80; // ...y hasta aqui se rellena con paises nuevos (jugadores, 21-11 tarde)
export const TALLA_NUEVO = [20, 60];
export const ESTIRON_MAXIMO = 3;
// Un estado de RNW no baja de PISO_ESTADO localizaciones porque crezcan a su costa las facciones o
// los menores: si no, se queda en ciudad-estado encerrada (jugadores, 21-11 tarde: «los paises son
// demasiado pequenitos»). El que ya es mas pequeno no pierde nada.
export const PISO_ESTADO = 6;

// Map localizacion -> tag que lleva la cuenta de localizaciones de cada tag
class ConCuenta extends Map {
  constructor(it) { super(); this.n = new Map(); if (it) for (const [k, v] of it) this.set(k, v); }
  set(k, v) { const o = super.get(k); if (o !== undefined) this.n.set(o, this.n.get(o) - 1); this.n.set(v, (this.n.get(v) || 0) + 1); return super.set(k, v); }
  delete(k) { const o = super.get(k); if (o !== undefined) this.n.set(o, this.n.get(o) - 1); return super.delete(k); }
  cuenta(tag) { return this.n.get(tag) || 0; }
}

// FNV-1a de 32 bits a [0, 1): el "azar" de cada pais sale de su tag
const fraccion = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export function tallaDe(tag, tallas = TALLAS) {
  let u = fraccion(tag + ':clase');
  for (const [parte, min, max] of tallas) { if (u < parte) return min + Math.floor(fraccion(tag + ':talla') * (max - min + 1)); u -= parte; }
  return tallas.at(-1)[2];
}

// Trozos de tierra seguida de una lista de localizaciones: [[loc, ...], ...], cada uno ordenado.
export function trozosDe(locs, vec) {
  const mias = new Set(locs), visto = new Set(), r = [];
  for (const l of [...locs].sort()) {
    if (visto.has(l)) continue;
    const t = [], cola = [l]; visto.add(l);
    while (cola.length) { const x = cola.pop(); t.push(x); for (const y of vec.get(x) || []) if (mias.has(y) && !visto.has(y)) { visto.add(y); cola.push(y); } }
    r.push(t.sort());
  }
  return r;
}

export function reparteTierra({ liga, vec, paises, asignados, facciones, subzonas = [], menores = [], poblacion = new Map(), minimoSubzona = MINIMO_SUBZONA, maxPasillo = MAX_PASILLO, puntua = null, plant = new Map(), provincia = new Map(), costeTopo = COSTE_TOPO, costeVeg = COSTE_VEG, ruido = RUIDO, pesoPunto = PESO_PUNTO, semilla = SEMILLA, recargoOcupada = RECARGO_OCUPADA, bonoProvincia = BONO_PROVINCIA, nuevoTag = null, conDuenoTotal = CON_DUENO_TOTAL, tallaNuevo = TALLA_NUEVO, rio = new Map(), costeRioAncho = COSTE_RIO_ANCHO, estira = ESTIRA, anchoPasillo = ANCHO_PASILLO, fraccionFaccion = FRACCION_FACCION, faccionMinimo = FACCION_MINIMO, tallas = TALLAS, tallaMenor = TALLA_MENOR, conDueno = CON_DUENO, estironMaximo = ESTIRON_MAXIMO }) {
  const tierra = [...liga.tierra].sort();
  const esTierra = new Set(tierra);
  const zonaId = (l) => liga.zonaDe.get(l)?.id;
  const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
  const antes = new Map();
  for (const p of paises) for (const l of p.locs) if (esTierra.has(l)) antes.set(l, p.tag);
  const dueno = new ConCuenta(antes);
  const total = tierra.length, conDuenoAntes = dueno.size;
  const duenoZona = new Map();
  for (const f of facciones) if (asignados[f.clave]) duenoZona.set(facZona(f), { tag: asignados[f.clave].tag, clave: f.clave });
  const zonaDeTag = new Map([...duenoZona].map(([z, d]) => [d.tag, z]));
  const centroDe = (z) => liga.mapa.centro[liga.mapa.zonas.findIndex((x) => x.id === z)] || [0, 0];
  const distA = ([cx, cy]) => (l) => { const [x, y] = liga.xy.get(l); return Math.hypot(x - cx, y - cy); };

  // 2. el nucleo de cada pais; lo demas se suelta. Primero las facciones; los demas, cuando las
  // facciones ya han crecido (pueden haberles quitado tierra y haberlos partido)
  const esMenor = new Set(menores.map((m) => m.tag));
  const partidosAntes = paises.filter((p) => trozosDe(p.locs.filter((l) => esTierra.has(l)), vec).length > 1).length;
  const capitales = new Set(paises.map((p) => p.capital));
  const dejaNucleo = (p) => {
    const ts = trozosDe(tierra.filter((l) => dueno.get(l) === p.tag), vec);
    const z = zonaDeTag.get(p.tag);
    const enZ = (t) => t.filter((l) => zonaId(l) === z).length;
    const nucleo = z
      ? [...ts].sort((a, b) => enZ(b) - enZ(a) || b.length - a.length || a[0].localeCompare(b[0])).find((t) => enZ(t) > 0)
      : ts.find((t) => t.includes(p.capital)) || [...ts].sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))[0];
    for (const t of ts) if (t !== nucleo) for (const l of t) dueno.delete(l);
  };
  const porTag = [...paises].sort((a, b) => a.tag.localeCompare(b.tag));
  for (const p of porTag) if (zonaDeTag.has(p.tag)) dejaNucleo(p);

  // crecimiento con fronteras naturales: de la tierra libre que toca la del pais, la de menor
  // coste = coste de terreno acumulado desde su tierra + PESO_PUNTO x pasos hasta el punto
  const pasoMedio = (() => { const ds = []; for (const l of tierra.slice(0, 4000)) for (const v of vec.get(l) || []) if (liga.xy.has(v)) { const [a, b] = liga.xy.get(l), [c, e] = liga.xy.get(v); ds.push(Math.hypot(a - c, b - e)); } ds.sort((x, y) => x - y); return ds[ds.length >> 1] || 1; })();
  const paso = (l) => { const p = plant.get(l) || {}; const pr = provincia.get(l); return (costeTopo[p.topo] ?? 1) * (costeVeg[p.veg] ?? 1) * (1 + ruido * (2 * fraccion(`${semilla}:${l}`) - 1)) * (pr ? 1 + ruido * (2 * fraccion(`${semilla}:p:${pr}`) - 1) : 1) * (rio.get(l)?.[0] >= 8 && rio.get(l)[1] >= RIO_ANCHO ? costeRioAncho : 1); };
  const crecedor = (tag, punto, libre, antesLibre = true) => {
    // distancia al punto en una elipse de ejes estira:1, girada un angulo que sale de su tag
    const th = 2 * Math.PI * fraccion(`${semilla}:angulo:${tag}`), co = Math.cos(th), si = Math.sin(th), k = Math.sqrt(estira);
    const dist = (l) => { const [x, y] = liga.xy.get(l), dx = x - punto[0], dy = y - punto[1]; return Math.hypot((dx * co + dy * si) / k, (dy * co - dx * si) * k); };
    const g = new Map(); // coste acumulado desde la tierra del pais
    const borde = new Map(); // libre que toca -> coste
    const empezadas = new Set(); // provincias donde ya tiene tierra
    const prio = (v) => g.get(v) + pesoPunto * dist(v) / pasoMedio;
    const mira = (l) => {
      if (provincia.has(l)) empezadas.add(provincia.get(l));
      const gl = g.get(l) ?? 0;
      for (const v of [...(vec.get(l) || [])].sort()) if (esTierra.has(v) && libre(v)) { const nv = gl + paso(v); if (!g.has(v) || nv < g.get(v)) { g.set(v, nv); borde.set(v, prio(v)); } }
    };
    for (const l of tierra) if (dueno.get(l) === tag) mira(l);
    return {
      siembra: (l) => { g.set(l, 0); borde.set(l, prio(l)); },
      toma: () => {
        let mejor = null, dm = Infinity;
        for (const [l, d0] of borde) {
          if (!libre(l)) { borde.delete(l); continue; }
          // la tierra de otro pais cuesta RECARGO_OCUPADA pasos mas (con prioridad estricta, la
          // faccion rodeaba a los estados de RNW y salia en forma de C); la que acaba una provincia
          // empezada, BONO_PROVINCIA menos
          const d = d0 + (antesLibre && dueno.has(l) ? recargoOcupada : 0) - (empezadas.has(provincia.get(l)) ? bonoProvincia : 0);
          if (mejor === null || d < dm || (d === dm && l < mejor)) { mejor = l; dm = d; }
        }
        if (mejor === null) return false;
        borde.delete(mejor); dueno.set(mejor, tag); mira(mejor);
        return true;
      },
    };
  };

  // 2b. los menores con nombre crecen antes que las facciones, alrededor de su capital, hasta su
  // talla: si no, la mancha de la faccion vecina los deja encerrados en una o dos localizaciones.
  // Su tierra ya no la toma ninguna faccion.
  const tallaDelMenor = (tag) => tallaDe(tag, [[1, ...tallaMenor]]);
  for (const p of porTag) if (esMenor.has(p.tag)) dejaNucleo(p);
  // El menor vive en su zona del dibujo. Si no tiene tierra en ella, o desde la que tiene no alcanza
  // su talla minima por tierra libre, se muda al trozo libre mayor de su zona: el primero de la
  // zona, a la localizacion mas cerca del centro; los siguientes, a la mas lejos de los otros menores.
  const ancla = new Map(), mudados = new Set(); // tag -> punto hacia el que crece
  // un menor no toma tierra de la zona de una faccion, salvo la de su vecina (sus `zonas`)
  const zonasDelMenor = new Map(menores.map((m) => [m.tag, new Set(m.zonas || [m.zona])]));
  const libreMenor = (tag) => (l) => !dueno.has(l) && (!duenoZona.has(zonaId(l)) || zonasDelMenor.get(tag).has(zonaId(l)));
  const muda = (m) => {
    const mias = tierra.filter((l) => dueno.get(l) === m.tag);
    const alcance = new Set(mias);
    for (const cola = [...mias]; cola.length && alcance.size < tallaMenor[0];) for (const v of vec.get(cola.pop()) || []) if (esTierra.has(v) && libreMenor(m.tag)(v) && !alcance.has(v)) { alcance.add(v); cola.push(v); }
    const enCasa = mias.some((l) => zonaId(l) === m.zona);
    const mejor = trozosDe(tierra.filter((l) => zonaId(l) === m.zona && !dueno.has(l)), vec).sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))[0];
    if (!mejor || (enCasa && (alcance.size >= tallaMenor[0] || mejor.length <= alcance.size))) return;
    for (const l of mias) dueno.delete(l);
    const otros = tierra.filter((l) => esMenor.has(dueno.get(l)) && zonaId(l) === m.zona).map((l) => liga.xy.get(l));
    const centro = distA(centroDe(m.zona));
    const lejos = (l) => { const [x, y] = liga.xy.get(l); return Math.min(...otros.map(([a, b]) => Math.hypot(x - a, y - b))); };
    const s = [...mejor].sort(otros.length ? (a, b) => lejos(b) - lejos(a) || a.localeCompare(b) : (a, b) => centro(a) - centro(b) || a.localeCompare(b))[0];
    dueno.set(s, m.tag); ancla.set(m.tag, liga.xy.get(s)); mudados.add(m.tag);
  };
  const puntoDe = (p) => ancla.get(p.tag) || liga.xy.get(p.capital);
  const cuantas = (tag) => tierra.filter((l) => dueno.get(l) === tag).length;
  const creceMenores = () => {
    const ms = porTag.filter((p) => esMenor.has(p.tag) && puntoDe(p))
      .map((p) => ({ talla: tallaDelMenor(p.tag), n: tierra.filter((l) => dueno.get(l) === p.tag).length, c: crecedor(p.tag, puntoDe(p), libreMenor(p.tag)) }));
    for (let avanza = true; avanza;) { avanza = false; for (const o of ms) if (o.n < o.talla && o.c.toma()) { o.n++; avanza = true; } }
  };
  const porOrden = [...menores].sort((a, b) => a.tag.localeCompare(b.tag));
  for (const m of porOrden) muda(m);
  creceMenores();
  // segunda vuelta: al que otro menor ha dejado encerrado por debajo de su talla minima (dos
  // capitales pegadas en la misma zona) se le muda ahora, con la tierra ya repartida
  for (const m of porOrden) if (cuantas(m.tag) < tallaMenor[0]) muda(m);
  creceMenores();
  // tercera vuelta: el que sigue por debajo de su talla minima (sin tierra libre alrededor) toma
  // tierra de un estado de RNW, nunca su capital, con el recargo de la tierra ocupada
  const deEstado = (l) => dueno.has(l) && !zonaDeTag.has(dueno.get(l)) && !esMenor.has(dueno.get(l)) && !capitales.has(l) && dueno.cuenta(dueno.get(l)) > PISO_ESTADO;
  for (const p of porTag) if (esMenor.has(p.tag) && puntoDe(p) && cuantas(p.tag) < tallaMenor[0]) {
    const c = crecedor(p.tag, puntoDe(p), (l) => (!dueno.has(l) || deEstado(l)) && (!duenoZona.has(zonaId(l)) || zonasDelMenor.get(p.tag).has(zonaId(l))));
    for (let n = cuantas(p.tag); n < tallaMenor[0] && c.toma(); n++);
  }

  // 3. facciones: dentro de su zona, alrededor de su capital
  const capitalElegida = new Map();
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const deZona = tierra.filter((l) => zonaId(l) === z);
    const meta = Math.max(faccionMinimo, Math.round(fraccionFaccion * deZona.length));
    // de su zona: la tierra sin dueno y la de los estados que no son faccion, salvo sus capitales
    const tomable = (l) => zonaId(l) === z && (!dueno.has(l) || (!zonaDeTag.has(dueno.get(l)) && !esMenor.has(dueno.get(l)) && !capitales.has(l) && dueno.cuenta(dueno.get(l)) > PISO_ESTADO));
    // la zona puede venir en varios trozos (lagos, estrechos, islas): si en el del nucleo no cabe
    // la meta, la faccion se muda al trozo mas grande, a la localizacion mas cerca del centro
    const dist = distA(centroDe(z));
    const mias = () => tierra.filter((l) => dueno.get(l) === d.tag);
    const trozosZ = trozosDe(deZona.filter((l) => tomable(l) || dueno.get(l) === d.tag), vec).sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
    const suyo = trozosZ.find((tz) => tz.some((l) => dueno.get(l) === d.tag));
    let semilla = null;
    if (trozosZ.length && (!suyo || (suyo.length < meta && trozosZ[0].length > suyo.length))) {
      for (const l of mias()) dueno.delete(l);
      semilla = [...trozosZ[0]].sort((a, b) => (dueno.has(a) - dueno.has(b)) || dist(a) - dist(b) || a.localeCompare(b))[0];
    }
    const enZona = () => mias().filter((l) => zonaId(l) === z).length;
    if (semilla) { const c0 = crecedor(d.tag, centroDe(z), tomable); c0.siembra(semilla); c0.toma(); }
    // la capital, antes de crecer (la tierra crece en anillos desde ella): la que mejor puntua
    // (capitales.mjs) de su tierra en la zona o de la tomable a 3 pasos o menos. La de RNW se
    // queda si no es MALA (montaña, desierto, pantano, artico) y no puntua 2 puntos peor.
    if (puntua) {
      const p0c = paises.find((x) => x.tag === d.tag);
      const nuc = mias().filter((l) => zonaId(l) === z);
      if (nuc.length) {
        const cen = [0, 1].map((i) => nuc.reduce((s, l) => s + liga.xy.get(l)[i], 0) / nuc.length);
        const paso = new Map(nuc.map((l) => [l, 0])), cola = [...nuc].sort();
        for (let i = 0; i < cola.length; i++) {
          const l = cola[i]; if (paso.get(l) >= 3) continue;
          for (const v of [...(vec.get(l) || [])].sort()) if (!paso.has(v) && esTierra.has(v) && tomable(v)) { paso.set(v, paso.get(l) + 1); cola.push(v); }
        }
        const pt = (l) => puntua(l, cen, liga.xy);
        const mejor = [...paso.keys()].filter((l) => liga.xy.has(l)).sort((a, b) => pt(b) - pt(a) || a.localeCompare(b))[0];
        const deRnw = p0c && dueno.get(p0c.capital) === d.tag && zonaId(p0c.capital) === z ? p0c.capital : null;
        const cap = deRnw && !esMala(plant.get(deRnw)) && pt(deRnw) >= pt(mejor) - 2 ? deRnw : mejor;
        if (cap) { dueno.set(cap, d.tag); capitalElegida.set(d.tag, cap); }
      }
    }
    // un brazo hasta cada sub-zona gj_zona_* de su zona (mas de la mitad dentro) donde aun no tiene
    // MINIMO_SUBZONA localizaciones: crece hacia el centro de la sub-zona, sin soltarse del nucleo.
    // Lo piden sus mecanicas (los cuatro clanes de Kaivan votan si la faccion tiene tierra en su cuarto).
    for (const sz of [...subzonas].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
      const ls = sz.locs.filter((l) => esTierra.has(l) && liga.xy.has(l));
      if (!ls.length || ls.filter((l) => zonaId(l) === z).length * 2 <= ls.length) continue;
      const tengo = () => ls.filter((l) => dueno.get(l) === d.tag).length;
      const punto = [0, 1].map((i) => ls.reduce((s, l) => s + liga.xy.get(l)[i], 0) / ls.length);
      const falta = () => tengo() < Math.min(minimoSubzona, ls.filter((l) => tomable(l) || dueno.get(l) === d.tag).length);
      if (!falta()) continue;
      // el camino mas corto por tierra desde la faccion hasta la sub-zona. Puede salir de la zona
      // (la zona viene en trozos); nunca pisa otra faccion ni una capital.
      const enSub = new Set(ls);
      // Si no hay otro paso (un istmo), cruza la capital de un estado de RNW: ese estado la muda.
      const pasable = (l) => esTierra.has(l) && (!dueno.has(l) || dueno.get(l) === d.tag || (!zonaDeTag.has(dueno.get(l)) && !esMenor.has(dueno.get(l))));
      const coste = new Map(mias().map((l) => [l, 0])), de = new Map(mias().map((l) => [l, null]));
      let fin = null;
      for (let ahora = [...coste.keys()], luego = []; (ahora.length || luego.length) && !fin;) { // 0-1: primero sin capitales
        if (!ahora.length) { ahora = luego; luego = []; }
        const l = ahora.shift();
        if (enSub.has(l) && dueno.get(l) !== d.tag) { fin = l; break; }
        for (const v of [...(vec.get(l) || [])].sort()) {
          if (!pasable(v)) continue;
          const cap = dueno.get(v) !== d.tag && capitales.has(v) ? 1 : 0, c = coste.get(l) + cap;
          if (coste.has(v) && coste.get(v) <= c) continue;
          coste.set(v, c); de.set(v, l); (cap ? luego : ahora).push(v);
        }
      }
      // pasillo solo si es corto (MAX_PASILLO pasos): si no, un enclave compacto en la sub-zona,
      // sembrado en su localizacion tomable mas cerca de su centro (las tiras largas, fuera)
      const camino = []; for (let l = fin; l && de.get(l) !== null; l = de.get(l)) camino.push(l);
      if (fin && camino.length <= maxPasillo + 1) {
        for (const l of camino) dueno.set(l, d.tag);
        // el pasillo se ensancha anchoPasillo vecinos a cada lado (nunca capitales ajenas)
        for (let a = 0, borde = [...camino]; a < anchoPasillo; a++) {
          const nuevos = [];
          for (const l of borde) for (const v of vec.get(l) || []) if (pasable(v) && dueno.get(v) !== d.tag && !capitales.has(v)) { dueno.set(v, d.tag); nuevos.push(v); }
          borde = nuevos;
        }
      }
      else {
        const dp = distA(punto);
        const s = ls.filter((l) => tomable(l)).sort((a, b) => dp(a) - dp(b) || a.localeCompare(b))[0];
        if (s) dueno.set(s, d.tag);
      }
      const brazo = crecedor(d.tag, punto, (l) => enSub.has(l) && tomable(l), false);
      while (falta() && brazo.toma());
    }
    // crece en anillos alrededor de su nucleo (su capital, o la semilla si se ha mudado), no hacia
    // el centro de la zona: hacia el centro salian tiras largas (Ostrevar, 21-11)
    const p0 = paises.find((x) => x.tag === d.tag);
    const nucleoZ = mias().filter((l) => zonaId(l) === z);
    // con capital elegida: el centro de las `meta` localizaciones mas cercanas a ella por pasos; una
    // capital en la costa queda en el borde y el pais no sale como una tira a lo largo de la costa
    const bola = (s) => { const v = new Set([s]), c = [s]; for (let i = 0; i < c.length && c.length < meta; i++) for (const w of vec.get(c[i]) || []) if (!v.has(w) && liga.xy.has(w) && (dueno.get(w) === d.tag || tomable(w)) && c.length < meta) { v.add(w); c.push(w); } return c; };
    const centroBola = (s) => { const b = bola(s); return [0, 1].map((i) => b.reduce((t, l) => t + liga.xy.get(l)[i], 0) / b.length); };
    const puntoNucleo = capitalElegida.has(d.tag) ? centroBola(capitalElegida.get(d.tag)) : semilla ? liga.xy.get(semilla)
      : p0 && dueno.get(p0.capital) === d.tag && zonaId(p0.capital) === z && liga.xy.has(p0.capital) ? liga.xy.get(p0.capital)
      : nucleoZ.length ? [0, 1].map((i) => nucleoZ.reduce((s, l) => s + liga.xy.get(l)[i], 0) / nucleoZ.length) : centroDe(z);
    const c = crecedor(d.tag, puntoNucleo, tomable);
    for (let n = enZona(); n < meta && c.toma(); n++);
  }
  for (const p of porTag) if (!zonaDeTag.has(p.tag) && !esMenor.has(p.tag)) dejaNucleo(p);
  // nadie absorbe a nadie: el estado que se ha quedado sin tierra (el pasillo de una faccion ha
  // cruzado su capital) vuelve a empezar en la tierra libre mas cerca de donde estaba
  for (const p of porTag) {
    if (zonaDeTag.has(p.tag) || !liga.xy.has(p.capital) || tierra.some((l) => dueno.get(l) === p.tag)) continue;
    const dist = distA(liga.xy.get(p.capital));
    const s = tierra.filter((l) => !dueno.has(l)).sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
    if (s) dueno.set(s, p.tag);
  }
  // 3b. el menor que en su zona no llega a su talla (jugadores, 21-11 tarde: «haz los paises que ya
  // estan un poco mas grandes») sigue creciendo, con las facciones ya hechas, por la tierra libre de
  // cualquier zona; si aun no llega, por la de los estados de RNW (nunca su capital ni partiendolos)
  // y, por debajo de la talla minima, por el borde de la faccion vecina (nunca su capital ni sus
  // sub-zonas, y sin partirla). Una isla pequena se queda como esta.
  const enSubzona = new Set(subzonas.flatMap((s) => s.locs));
  const sinPartir = (l) => {
    const t = dueno.get(l), resto = tierra.filter((x) => x !== l && dueno.get(x) === t);
    if (!resto.length) return false;
    const S = new Set(resto), vis = new Set([resto[0]]), cola = [resto[0]];
    for (let i = 0; i < cola.length; i++) for (const w of vec.get(cola[i]) || []) if (S.has(w) && !vis.has(w)) { vis.add(w); cola.push(w); }
    return vis.size === S.size;
  };
  const sigueMenores = (libre) => {
    const ms = porTag.filter((p) => esMenor.has(p.tag) && puntoDe(p)).map((p) => ({ talla: tallaDelMenor(p.tag), n: cuantas(p.tag), c: crecedor(p.tag, puntoDe(p), libre) }));
    for (let avanza = true; avanza;) { avanza = false; for (const o of ms) if (o.n < o.talla && o.c.toma()) { o.n++; avanza = true; } }
  };
  sigueMenores((l) => !dueno.has(l));
  sigueMenores((l) => !dueno.has(l) || (deEstado(l) && sinPartir(l)));
  for (const p of porTag) if (esMenor.has(p.tag) && puntoDe(p) && cuantas(p.tag) < tallaMenor[0]) {
    const c = crecedor(p.tag, puntoDe(p), (l) => !dueno.has(l) || ((deEstado(l) || (zonaDeTag.has(dueno.get(l)) && !capitales.has(l) && capitalElegida.get(dueno.get(l)) !== l && !enSubzona.has(l))) && sinPartir(l)));
    for (let n = cuantas(p.tag); n < tallaMenor[0] && c.toma(); n++);
  }
  const conDuenoFacciones = dueno.size;

  // 4. los demas: por turnos, hacia su capital
  // (los menores ya han crecido hasta su talla en 2b y el estiron no les toca: siguen siendo menores)
  const otros = paises.filter((p) => !zonaDeTag.has(p.tag) && !esMenor.has(p.tag) && liga.xy.has(p.capital)).sort((a, b) => a.tag.localeCompare(b.tag))
    .map((p) => ({ tag: p.tag, talla: tallaDe(p.tag, tallas), n: tierra.filter((l) => dueno.get(l) === p.tag).length, c: crecedor(p.tag, liga.xy.get(p.capital), (l) => !dueno.has(l)) }));
  const metaDueno = Math.round(conDueno * total);
  let estiron = 1;
  for (let k = 1; k <= estironMaximo + 1e-9; k += 0.05) {
    estiron = k;
    for (let avanza = true; avanza;) {
      avanza = false;
      for (const o of otros) {
        if (k > 1 && dueno.size >= metaDueno) break; // el estiron para justo en la meta
        if (o.n < Math.ceil(o.talla * k) && o.c.toma()) { o.n++; avanza = true; }
      }
    }
    if (dueno.size >= metaDueno) break;
  }

  // 4c. paises nuevos (jugadores, 21-11 tarde: «rellena con mas»): en la tierra libre, hasta
  // conDuenoTotal del continente. Cada uno nace en la localizacion libre mas lejos de toda tierra
  // con dueno (sin dueno en el setup de RNW: su capital va en el setup) y crece con las mismas
  // fronteras naturales hasta su talla (tallaNuevo, por su tag); en un solo trozo, de 20 o mas.
  const nuevos = [];
  if (nuevoTag) {
    const metaTotal = Math.round(conDuenoTotal * total), descartadas = new Set();
    for (let vuelta = 0; dueno.size < metaTotal && vuelta < 1000; vuelta++) {
      const libres = tierra.filter((l) => !dueno.has(l));
      const grandes = new Set(trozosDe(libres, vec).filter((t) => t.length >= tallaNuevo[0]).flat());
      if (!grandes.size) break;
      const d = new Map(), cola = [];
      for (const l of tierra) if (dueno.has(l)) { d.set(l, 0); cola.push(l); }
      for (let i = 0; i < cola.length; i++) for (const w of vec.get(cola[i]) || []) if (esTierra.has(w) && !d.has(w)) { d.set(w, d.get(cola[i]) + 1); cola.push(w); }
      const semilla = [...grandes].filter((l) => !antes.has(l) && !descartadas.has(l)).sort((a, b) => (d.get(b) ?? 1e9) - (d.get(a) ?? 1e9) || a.localeCompare(b))[0];
      if (!semilla) break;
      const tag = nuevoTag();
      const talla = Math.min(tallaNuevo[0] + Math.floor(fraccion(`${tag}:talla`) * (tallaNuevo[1] - tallaNuevo[0] + 1)), metaTotal - dueno.size + tallaNuevo[0]);
      dueno.set(semilla, tag);
      const c = crecedor(tag, liga.xy.get(semilla), (l) => !dueno.has(l));
      for (let n = 1; n < talla && c.toma(); n++);
      const suyas = tierra.filter((l) => dueno.get(l) === tag);
      if (suyas.length < tallaNuevo[0]) { for (const l of suyas) { dueno.delete(l); descartadas.add(l); } continue; } // no cabe: se deja libre
      const cen = [0, 1].map((i) => suyas.reduce((s, l) => s + liga.xy.get(l)[i], 0) / suyas.length);
      const enSetup = suyas.filter((l) => !antes.has(l));
      const pt = puntua ? (l) => puntua(l, cen, liga.xy) : () => 0;
      const cap = [...enSetup].sort((a, b) => (esMala(plant.get(a)) - esMala(plant.get(b))) || pt(b) - pt(a) || a.localeCompare(b))[0];
      nuevos.push({ tag, capital: cap, locs: suyas.sort() });
    }
  }

  // 4b. huecos: la tierra libre que solo toca tierra de un mismo pais (el coste de la montaña la
  // saltaba y quedaba un agujero dentro) pasa a ese pais; dos vueltas, para los huecos de dos
  for (let vuelta = 0; vuelta < 2; vuelta++) for (const l of tierra) {
    if (dueno.has(l)) continue;
    const ts = new Set([...(vec.get(l) || [])].filter((v) => esTierra.has(v)).map((v) => dueno.get(v)));
    if (ts.size === 1 && [...ts][0]) dueno.set(l, [...ts][0]);
  }

  // 5. lo que cambia de manos, lo que se abandona y las capitales
  const da = {}, suelta = {};
  for (const l of tierra) {
    const t = dueno.get(l), a = antes.get(l);
    if (t && t !== a) da[l] = t;
    else if (!t && a) suelta[l] = a;
  }
  const capital = {};
  // la capital nueva va a la localizacion con mas gente del pais (la distancia desempata); con
  // puntuacion (capitales.mjs), a la que mejor puntua. Una capital de RNW MALA (montaña,
  // desierto, pantano, artico) se muda si el pais tiene un sitio 3 puntos mejor que no es malo.
  const gente = (l) => poblacion.get(l) || 0;
  for (const p of porTag) {
    if (zonaDeTag.has(p.tag) || !liga.xy.has(p.capital)) continue;
    const todas = tierra.filter((l) => dueno.get(l) === p.tag);
    if (!todas.length) continue;
    // la de un menor, dentro de su zona del dibujo si tiene tierra en ella (Brazalmar se iba a la de Sorava)
    const zonaPropia = esMenor.has(p.tag) ? menores.find((m) => m.tag === p.tag)?.zona : null;
    const enZona = zonaPropia ? todas.filter((l) => zonaId(l) === zonaPropia) : [];
    const suyas = enZona.length ? enZona : todas;
    const cen = [0, 1].map((i) => todas.reduce((s, l) => s + liga.xy.get(l)[i], 0) / todas.length);
    const pt = puntua ? (l) => puntua(l, cen, liga.xy) : null;
    const tiene = dueno.get(p.capital) === p.tag;
    if (tiene && !(pt && esMala(plant.get(p.capital))) && (!enZona.length || enZona.includes(p.capital))) continue;
    const dist = distA(puntoDe(p));
    // la mejor que no sea MALA; una capital MALA solo se queda si el pais no tiene otra cosa
    const s = [...suyas].sort(pt ? (a, b) => (esMala(plant.get(a)) - esMala(plant.get(b))) || pt(b) - pt(a) || a.localeCompare(b) : (a, b) => gente(b) - gente(a) || dist(a) - dist(b) || a.localeCompare(b))[0];
    if (!s || s === p.capital || (tiene && esMala(plant.get(s)))) continue;
    capital[p.tag] = { de: p.capital, a: s, clave: esMenor.has(p.tag) ? 'menor' : 'estado de RNW' };
  }
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const p = paises.find((x) => x.tag === d.tag);
    const elegida = capitalElegida.get(d.tag);
    if (p && elegida && dueno.get(elegida) === d.tag) { if (elegida !== p.capital) capital[d.tag] = { de: p.capital, a: elegida, clave: d.clave }; continue; }
    if (!p || (dueno.get(p.capital) === d.tag && zonaId(p.capital) === z)) continue;
    const dist = distA(centroDe(z));
    const s = tierra.filter((l) => dueno.get(l) === d.tag && zonaId(l) === z).sort((a, b) => gente(b) - gente(a) || dist(a) - dist(b) || a.localeCompare(b))[0];
    if (s) capital[d.tag] = { de: p.capital, a: s, clave: d.clave };
  }

  // informe
  const por = new Map();
  for (const [l, t] of dueno) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  const partidos = [...por].filter(([, ls]) => trozosDe(ls, vec).length > 1).map(([t]) => t).sort();
  const sinTierra = paises.filter((p) => !por.has(p.tag)).map((p) => p.tag).sort();
  const filas = [...duenoZona].sort(([a], [b]) => a.localeCompare(b)).map(([z, d]) => {
    const p = paises.find((x) => x.tag === d.tag);
    const ls = por.get(d.tag) || [];
    return { zona: z, ...d, inicial: p.locs.filter((l) => esTierra.has(l)).length, final: ls.length, enZona: ls.filter((l) => zonaId(l) === z).length, zonaLocs: tierra.filter((l) => zonaId(l) === z).length };
  });
  const pies = [];
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) for (const sz of [...subzonas].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
    const ls = sz.locs.filter((l) => esTierra.has(l));
    if (ls.length && ls.filter((l) => zonaId(l) === z).length * 2 > ls.length) pies.push({ clave: d.clave, nombre: sz.nombre, tiene: ls.filter((l) => dueno.get(l) === d.tag).length, total: ls.length });
  }
  const TRAMOS = [[1, 5], [6, 15], [16, 45], [46, 90], [91, Infinity]];
  const tramos = TRAMOS.map(([a, b]) => ({ de: a, a: b, paises: [...por.values()].filter((ls) => ls.length >= a && ls.length <= b).length }));
  return {
    da, suelta, capital, nuevos,
    informe: { total, conDuenoAntes, conDuenoFacciones, conDuenoDespues: dueno.size, metaDueno, estiron, menores: [...menores].sort((a, b) => a.tag.localeCompare(b.tag)).map((m) => ({ ...m, n: (por.get(m.tag) || []).length, enZona: (por.get(m.tag) || []).filter((l) => zonaId(l) === m.zona).length, mudado: mudados.has(m.tag), corto: (por.get(m.tag) || []).length < tallaMenor[0] })), paises: por.size, partidosAntes, partidos, sinTierra, abandonadas: Object.keys(suelta).length, filas, tramos, pies },
  };
}

export function textoTierra(r) {
  const pc = (n) => `${(100 * n / r.informe.total).toFixed(1)} %`;
  const i = r.informe;
  return `## Tierra con dueno al empezar (reparte-tierra.mjs)
Nuevo Mundo: ${i.total} localizaciones de tierra. Con dueno en el mundo de RNW: ${i.conDuenoAntes} (${pc(i.conDuenoAntes)}), con ${i.partidosAntes} paises partidos en varios trozos. Tras crecer las facciones y dejar a cada pais en su nucleo: ${i.conDuenoFacciones} (${pc(i.conDuenoFacciones)}). Tras crecer los demas: **${i.conDuenoDespues} (${pc(i.conDuenoDespues)})**, repartidas entre **${i.paises} paises** (la meta es ${pc(i.metaDueno)}; los que no son faccion han crecido hasta ${i.estiron.toFixed(2)} veces su talla); el resto queda libre para colonizar (${i.abandonadas} localizaciones de trozos sueltos se abandonan). Nadie absorbe a nadie.

**Paises partidos en varios trozos: ${i.partidos.length}**${i.partidos.length ? ` (${i.partidos.join(', ')})` : ''}.${i.sinTierra.length ? ` Paises sin tierra: ${i.sinTierra.join(', ')}.` : ''}

| Tamano (localizaciones) | Paises |
|---|---|
${i.tramos.map((t) => `| ${t.a === Infinity ? `${t.de} o mas` : `${t.de}-${t.a}`} | ${t.paises} |`).join('\n')}

| Zona | Faccion | Pais | En el mundo de RNW | Al empezar | De ellas, en su zona | De su zona |
|---|---|---|---|---|---|---|
${i.filas.map((f) => `| ${f.zona} | ${f.clave} | ${f.tag} | ${f.inicial} | ${f.final} | ${f.enZona} | ${(100 * f.enZona / f.zonaLocs).toFixed(0)} % |`).join('\n')}
${i.menores.length ? `
Menores con nombre (pais: localizaciones al empezar, de ellas en su zona): ${i.menores.map((m) => `${m.tag} ${m.n} (${m.enZona} en ${m.zona}${m.mudado ? ', mudado' : ''})`).join('; ')}.${i.menores.some((m) => m.corto) ? ` **Por debajo de su talla minima: ${i.menores.filter((m) => m.corto).map((m) => m.tag).join(', ')}.**` : ''}
` : ''}${i.pies.length ? `
Sub-zonas que piden las mecanicas (localizaciones de la faccion / de la sub-zona): ${i.pies.map((p) => `${p.clave} en ${p.nombre}: ${p.tiene}/${p.total}`).join('; ')}.
` : ''}
${Object.keys(r.capital || {}).length ? `\nCapital mudada (a su zona, o porque la ha perdido): ${Object.entries(r.capital).map(([t, c]) => `${c.clave} ${t} de ${c.de} a ${c.a}`).join('; ')}.\n` : ''}`;
}
