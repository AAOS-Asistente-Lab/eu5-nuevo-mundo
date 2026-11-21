// ensancha-tierra.mjs: del dibujo fino (mundo/35cl) saca uno con la tierra mas ancha y los mares
// interiores mas pequenos, con peninsulas, sin cambiar la forma general (peticion de Javier, 21-11).
//
//   node herramientas/ensancha-tierra.mjs [--origen mundo/35cl] [--salida mundo] [--semilla 9]
//
// Lee mascara.png, zonas.png y zonas.json del origen y escribe los tres, mas vista.png, en la salida.
// Es determinista: la misma semilla da los mismos bytes.
//
// Como crece la tierra (todo en px del dibujo; una localizacion mide unos 12):
//  1. Mar interior = el mar que queda detras de una boca de menos de 2*BOCA px. En cada uno la costa
//     avanza hasta DENTRO veces su semiancho, por un ruido: donde el ruido es alto sale una peninsula
//     y donde es bajo una bahia. Queda siempre un canal (TRONCO) del fondo del mar al oceano.
//  2. En la costa de fuera, la tierra avanza FUERA px, tambien con ruido.
//  3. No se toca el agua estrecha (fiordos, rias, canales de menos de 2*ESTRECHO px), ni los lagos.
//  4. Los charcos que quedan cerrados pasan a lago o a tierra.
// La tierra nueva hereda la zona (faccion) de la tierra mas cercana.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPngFile, writePngFile } from './png.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ORIGEN = path.resolve(arg('--origen', path.join(AQUI, '..', 'mundo', '35cl')));
const SALIDA = path.resolve(arg('--salida', path.join(AQUI, '..', 'mundo')));
const SEMILLA = +arg('--semilla', 9);

// los mandos
const BOCA = +arg('--boca', 20);          // un mar es interior si su boca mide menos de 2*BOCA
const MAR_MINIMO = +arg('--mar-minimo', 30000); // px: por debajo no cuenta como mar interior
const DENTRO = +arg('--dentro', 1.0);     // hasta donde llega una peninsula en un mar interior, sobre su semiancho
const DENTRO_MAX = +arg('--dentro-max', 110);
const BAHIA = +arg('--bahia', 0.6);     // lo que avanza la costa en una bahia, sobre lo de una peninsula
const ONDA = +arg('--onda', 150);        // px entre peninsula y peninsula
const LENGUA = +arg('--lengua', 0.26);   // anchura de las peninsulas (sobre la onda)
const RIZO = +arg('--rizo', 0.3);        // rizo de la costa nueva
const CABOS = +arg('--cabos', 0.5);      // cabos y calas de la costa nueva
const FONDO = +arg('--fondo', 22);       // semiancho del mar que se respeta a lo largo de su eje
const VENTANA = +arg('--ventana', 90);   // px alrededor en los que se mide el semiancho del mar
const SUAVE = +arg('--suave', 90);       // px desde la boca en los que el avance va de 0 a todo
const FUERA = +arg('--fuera', 8);         // px que avanza, como mucho, la costa de fuera
const ISLA = +arg('--isla', 6000);       // px: una masa menor es una isla y no empuja la costa
const GUARDA = +arg('--guarda', 12);     // px que se respetan alrededor del agua estrecha
const ESTRECHO = +arg('--estrecho', 22);  // fuera de los mares interiores no se toca el agua de menos de 2*ESTRECHO de ancho
const TRONCO = +arg('--tronco', 14);      // semiancho del canal que se respeta hasta el oceano
const PASO = +arg('--paso', 6.5);        // semiancho minimo de los pasos del tronco
const LAGO_MAX = +arg('--lago-max', 20000); // un charco cerrado mayor que esto es un error
const DIQUE = 7;
const MOTA = 60;                          // px: RNW borra las islas de menos de unos 38
const LAGO_MIN = 150, LAGO_RADIO = 5.5;   // un charco menor o mas fino que esto se rellena

export const MAR = 0, TIERRA = 1, MONTANA = 2, ALTAS = 3, LLANURA = 4, LAGO = 5;
export const COLOR = [[0, 0, 0], [255, 255, 255], [160, 82, 45], [218, 165, 32], [124, 205, 124], [30, 144, 255]];
const VISTA = [[20, 54, 100], [150, 185, 100], [110, 70, 45], [200, 160, 90], [190, 225, 150], [100, 170, 235]];

export function clases(png) {
  const { width: W, height: H, rgba } = png, c = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
    let k = COLOR.findIndex((q) => q[0] === r && q[1] === g && q[2] === b);
    if (k < 0) k = r + g + b > 380 ? TIERRA : MAR;
    c[i] = k;
  }
  return c;
}
// distancia euclidea exacta, en px, de cada pixel con dentro[i] al mas cercano que no lo tiene
// (transformada por filas y columnas de Felzenszwalb y Huttenlocher)
export function distancia(W, H, dentro) {
  const INF = 1e12, d = new Float64Array(W * H), m = Math.max(W, H);
  const f = new Float64Array(m), v = new Int32Array(m), z = new Float64Array(m + 1);
  const pasada = (n, lee, pon) => {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 0; q < n; q++) f[q] = lee(q);
    for (let q = 1; q < n; q++) {
      let s;
      for (;;) { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k] && k > 0) k--; else break; }
      if (s <= z[k]) { v[k] = q; } else { k++; v[k] = q; z[k] = s; } z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; pon(q, (q - p) * (q - p) + f[p]); }
  };
  for (let x = 0; x < W; x++) pasada(H, (y) => (dentro[y * W + x] ? INF : 0), (y, val) => { d[y * W + x] = val; });
  const fila = new Float64Array(W);
  for (let y = 0; y < H; y++) { const o = y * W; for (let x = 0; x < W; x++) fila[x] = d[o + x]; pasada(W, (x) => fila[x], (x, val) => { d[o + x] = val; }); }
  const r = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) r[i] = Math.sqrt(d[i]);
  return r;
}
// trozos 4-conexos de los pixeles con ok[i]: etiqueta por pixel (0 = fuera) y tamano por etiqueta
export function trozos(W, H, ok) {
  const et = new Int32Array(W * H), tam = [0], pila = new Int32Array(W * H);
  for (let s = 0; s < W * H; s++) {
    if (!ok[s] || et[s]) continue;
    const id = tam.length; let n = 0, t = 0; pila[t++] = s; et[s] = id;
    while (t) {
      const i = pila[--t]; n++; const x = i % W;
      if (x && ok[i - 1] && !et[i - 1]) { et[i - 1] = id; pila[t++] = i - 1; }
      if (x < W - 1 && ok[i + 1] && !et[i + 1]) { et[i + 1] = id; pila[t++] = i + 1; }
      if (i >= W && ok[i - W] && !et[i - W]) { et[i - W] = id; pila[t++] = i - W; }
      if (i < W * H - W && ok[i + W] && !et[i + W]) { et[i + W] = id; pila[t++] = i + W; }
    }
    tam.push(n);
  }
  return { et, tam };
}
// el mar que se alcanza desde la esquina por canales de 2*r px o mas (r = 0: cualquier canal)
export function marAbierto(W, H, c, r) {
  const mar = Uint8Array.from(c, (v) => +(v === MAR));
  if (!r) { const { et } = trozos(W, H, mar); return Uint8Array.from(et, (v) => +(v && v === et[0])); }
  const d = distancia(W, H, mar);
  const { et } = trozos(W, H, Uint8Array.from(d, (v) => +(v > r)));
  const lejos = distancia(W, H, Uint8Array.from(et, (v) => +(v !== et[0])));
  const abierto = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) abierto[i] = +(mar[i] && lejos[i] <= r + 1.5);
  return abierto;
}
// ruido de valores, suave, en [0, 1]; determinista por semilla
function ruido(semilla) {
  const h = (x, y) => { let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(semilla, 2147483647); n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const s = (t) => t * t * (3 - 2 * t);
  const base = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = s(x - xi), v = s(y - yi); return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v; };
  return (x, y, onda, octavas = 3) => { let a = 0, p = 1, t = 0; for (let o = 0; o < octavas; o++) { a += p * base(x / onda * (1 << o) + 17.3 * o, y / onda * (1 << o) - 9.1 * o); t += p; p *= 0.5; } return a / t; };
}

export function ensancha(c0, W, H, registro = () => {}) {
  const n = W * H, c = Uint8Array.from(c0);
  const mar = Uint8Array.from(c, (v) => +(v === MAR));
  const dL = distancia(W, H, mar); // de cada pixel de mar a la tierra
  const R = ruido(SEMILLA);

  // 1. mares interiores: su semiancho y su tronco
  const abierto = marAbierto(W, H, c, BOCA);
  const { et: mi, tam } = trozos(W, H, Uint8Array.from(mar, (v, i) => +(v && !abierto[i])));
  const semi = tam.map(() => 0), fondo = tam.map(() => -1);
  for (let i = 0; i < n; i++) if (mi[i] && dL[i] > semi[mi[i]]) { semi[mi[i]] = dL[i]; fondo[mi[i]] = i; }
  const interiores = tam.map((t, k) => k).filter((k) => k && tam[k] >= MAR_MINIMO);
  const grande = new Uint8Array(n); // pixel de un mar interior de los grandes
  for (let i = 0; i < n; i++) grande[i] = +(mi[i] > 0 && tam[mi[i]] >= MAR_MINIMO);
  // cuanto hay, por mar, desde cada pixel de un mar interior hasta su boca (para no cortar en seco alli)
  const aBoca = new Float32Array(n).fill(-1);
  { const cola = new Int32Array(n); let a = 0, b = 0;
    const vec = (i) => { const x = i % W; return [x ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i >= W ? i - W : -1, i < n - W ? i + W : -1]; };
    for (let i = 0; i < n; i++) if (grande[i] && vec(i).some((j) => j >= 0 && mar[j] && !grande[j])) { aBoca[i] = 0; cola[b++] = i; }
    while (a < b) { const i = cola[a++]; for (const j of vec(i)) if (j >= 0 && grande[j] && aBoca[j] < 0) { aBoca[j] = aBoca[i] + 1; cola[b++] = j; } } }
  // el semiancho del mar interior en cada sitio (un mar alargado es estrecho aunque sea grande):
  // lo mas hondo que hay a VENTANA px, en una rejilla de 8 px, suavizado
  const E = 8, ew = Math.ceil(W / E), eh = Math.ceil(H / E), V8 = Math.round(VENTANA / E);
  let hondo = new Float32Array(ew * eh);
  for (let i = 0; i < n; i++) if (grande[i]) { const g = (((i / W) | 0) / E | 0) * ew + ((i % W) / E | 0); if (dL[i] > hondo[g]) hondo[g] = dL[i]; }
  for (const [op, r] of [['max', V8], ['media', 3], ['media', 3]]) {
    for (const eje of [1, ew]) { // separable: por filas y por columnas
      const b = new Float32Array(ew * eh);
      for (let y = 0; y < eh; y++) for (let x = 0; x < ew; x++) {
        let m = 0, s = 0, q = 0;
        for (let k = -r; k <= r; k++) { const a = eje === 1 ? x + k : x, c2 = eje === 1 ? y : y + k; if (a < 0 || c2 < 0 || a >= ew || c2 >= eh) continue; const v = hondo[c2 * ew + a]; if (v > m) m = v; if (v > 0) { s += v; q++; } }
        b[y * ew + x] = op === 'max' ? m : (q ? s / q : 0);
      }
      hondo = b;
    }
  }
  const semiAqui = (x, y) => hondo[Math.min(eh - 1, (y / E) | 0) * ew + Math.min(ew - 1, (x / E) | 0)];
  // la tierra firme: las masas de ISLA px o mas (las islas pequenas no empujan la costa)
  const { et: masa, tam: tmasa } = trozos(W, H, Uint8Array.from(mar, (v) => 1 - v));
  const dF = distancia(W, H, Uint8Array.from(masa, (v) => +(tmasa[v] < ISLA))); // del mar (y las islas) a tierra firme

  // el tronco de cada mar interior: el camino por mar, lo mas hondo posible, de su fondo al oceano.
  // No se rellena: asi el mar no se queda cerrado. (Dijkstra pixel a pixel, 4 vecinos: no salta tierra.)
  const oceano = marAbierto(W, H, c, 45);
  const tronco = new Uint8Array(n), canal = new Uint8Array(n);
  for (const k of interiores) {
    const coste = new Float64Array(n).fill(Infinity), de = new Int32Array(n).fill(-1);
    let cap = 1 << 16, hk = new Float64Array(cap), hv = new Int32Array(cap), hn = 0; // monticulo binario
    const mete = (d, v) => {
      if (hn === cap) { cap *= 2; const a = new Float64Array(cap), b = new Int32Array(cap); a.set(hk); b.set(hv); hk = a; hv = b; }
      let j = hn++;
      while (j) { const p = (j - 1) >> 1; if (hk[p] <= d) break; hk[j] = hk[p]; hv[j] = hv[p]; j = p; }
      hk[j] = d; hv[j] = v;
    };
    const saca = () => {
      const v = hv[0], d = hk[--hn], u = hv[hn]; let j = 0;
      for (;;) { let m = 2 * j + 1; if (m >= hn) break; if (m + 1 < hn && hk[m + 1] < hk[m]) m++; if (hk[m] >= d) break; hk[j] = hk[m]; hv[j] = hv[m]; j = m; }
      hk[j] = d; hv[j] = u; return v;
    };
    coste[fondo[k]] = 0; mete(0, fondo[k]); let fin = -1;
    while (hn) {
      const d = hk[0], i = saca();
      if (d > coste[i]) continue;
      if (oceano[i] && dL[i] > 45) { fin = i; break; }
      const x = i % W, y = (i / W) | 0;
      for (const j of [x ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y ? i - W : -1, y < H - 1 ? i + W : -1]) {
        if (j < 0 || !mar[j]) continue;
        const nd = d + (1 + 80 / (dL[j] + 1)) * (0.5 + 1.5 * R(j % W, (j / W) | 0, 150, 2));
        if (nd < coste[j]) { coste[j] = nd; de[j] = i; mete(nd, j); }
      }
    }
    if (fin < 0) throw new Error(`el mar interior de (${fondo[k] % W},${(fondo[k] / W) | 0}) no tiene salida al oceano`);
    const camino = [];
    for (let i = fin; i >= 0; i = de[i]) camino.push(i);
    for (let j = 0; j < camino.length; j += 3) {
      const px = camino[j] % W, py = (camino[j] / W) | 0;
      // tan ancho como el mandado, pero nunca mas que el canal que ya hay (para no comerse la orilla)
      const r = Math.max(4, TRONCO * (0.7 + 0.9 * R(px, py, 110, 3)));
      for (let y = Math.max(0, Math.floor(py - r)); y <= Math.min(H - 1, py + r); y++) for (let x = Math.max(0, Math.floor(px - r)); x <= Math.min(W - 1, px + r); x++) { const q = (x - px) ** 2 + (y - py) ** 2; if (q <= r * r) tronco[y * W + x] = 1; if (q <= PASO * PASO) canal[y * W + x] = 1; }
    }
    let angosto = Infinity; for (const i of camino) if (dL[i] < angosto) angosto = dL[i];
    registro(`mar interior en (${fondo[k] % W},${(fondo[k] / W) | 0}): ${tam[k]} px, semiancho ${semi[k].toFixed(0)}, tronco de ${camino.length} px, paso mas estrecho ${(2 * angosto).toFixed(0)} px`);
  }

  // 2 y 3. crecer: solo en agua ancha, y sin arrimarse a la estrecha (fiordos, rias, canales)
  const ancha = distancia(W, H, Uint8Array.from(dL, (v) => +(v <= ESTRECHO))); // distancia al agua honda
  const fina = Uint8Array.from(mar, (v, i) => +(v && ancha[i] > ESTRECHO + 1.5));
  const aFina = distancia(W, H, Uint8Array.from(fina, (v) => 1 - v));
  let nueva = 0;
  const crece = new Uint8Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!mar[i] || tronco[i]) continue;
    if (!grande[i] && (fina[i] || aFina[i] <= GUARDA)) continue;
    let umbral = FUERA * (0.3 + 1.4 * R(x + 999, y, 70, 3));
    if (grande[i]) {
      // las peninsulas siguen las crestas de un ruido (donde vale 0,5): lenguas de tierra que salen de la
      // costa y se afilan hacia la punta; entre lengua y lengua queda una bahia. Mas un rizo fino de costa.
      const cresta = Math.max(0, 1 - Math.abs(2 * R(x + 60 * R(x, y, 320, 2), y + 60 * R(x + 77, y, 320, 2), ONDA, 2) - 1) / LENGUA);
      const f = BAHIA + (1 - BAHIA) * cresta ** 0.8 + RIZO * (R(x + 555, y + 333, 26, 3) - 0.5) + CABOS * (R(x - 321, y + 123, 64, 2) - 0.5);
      const s = semiAqui(x, y); // por el eje del mar queda siempre un canal de 2*FONDO px
      umbral = Math.max(umbral, Math.min(DENTRO_MAX, DENTRO * s, Math.max(0, s - FONDO)) * f * Math.min(1, aBoca[i] / SUAVE));
    }
    if (dF[i] < umbral) { crece[i] = 1; nueva++; }
  }
  for (let i = 0; i < n; i++) if (crece[i]) c[i] = TIERRA;
  // los pasos de menos de 2*PASO px del tronco se ensanchan (sin acercarse a un lago)
  const deLago = distancia(W, H, Uint8Array.from(c, (v) => +(v !== LAGO)));
  let abierta = 0;
  for (let i = 0; i < n; i++) if (canal[i] && c[i] !== MAR && c[i] !== LAGO && deLago[i] > DIQUE + 1) { c[i] = MAR; abierta++; }
  if (abierta) registro(`pasos ensanchados: ${abierta} px de tierra pasan a mar`);

  // 4. limpiar: lo que queda de mar tiene que llegar al oceano por canales de 9 px o mas
  const llega = marAbierto(W, H, c, 4.5);
  const { et: ch, tam: tch } = trozos(W, H, Uint8Array.from(c, (v, i) => +(v === MAR && !llega[i])));
  // un charco que antes ya estaba (un fiordo fino) se deja como estaba; el que he creado yo se arregla
  const creado = tch.map(() => false), toca = tch.map(() => false);
  for (let i = 0; i < n; i++) {
    const k = ch[i]; if (!k) continue;
    const x = i % W;
    for (const j of [x ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < n) { if (crece[j]) creado[k] = true; if (c[j] === MAR && !ch[j]) toca[k] = true; }
  }
  const radio = tch.map(() => 0), dCh = distancia(W, H, Uint8Array.from(ch, (v) => +(v > 0))); // lo ancho de cada charco
  for (let i = 0; i < n; i++) if (ch[i] && dCh[i] > radio[ch[i]]) radio[ch[i]] = dCh[i];
  let aLago = 0, aTierra = 0; const errores = [];
  for (const k of interiores) if (!llega[fondo[k]]) errores.push(`el mar interior de (${fondo[k] % W},${(fondo[k] / W) | 0}) se ha quedado sin salida`);
  for (let k = 1; k < tch.length; k++) {
    if (!creado[k]) continue;
    // si toca mar abierto es una lengua fina: se rellena; si no, es un charco: lago o tierra
    // fino o pequeno: se rellena; si no, es un lago (su borde con el mar se cierra mas abajo)
    const tipo = tch[k] < LAGO_MIN || radio[k] < LAGO_RADIO ? TIERRA : LAGO;
    if (tipo === LAGO && tch[k] > LAGO_MAX) errores.push(`charco cerrado de ${tch[k]} px`);
    tch[k] = -tipo; if (tipo === LAGO) aLago++; else aTierra++;
  }
  for (let i = 0; i < n; i++) if (ch[i] && tch[ch[i]] < 0) { if (c[i] === MAR) nueva++; c[i] = -tch[ch[i]]; }
  // un lago no puede tocar el mar ni quedarse a menos de DIQUE px: RNW suaviza el dibujo y lo abriria
  const aMar = distancia(W, H, Uint8Array.from(c, (v) => +(v !== MAR)));
  for (let i = 0; i < n; i++) if (c[i] === LAGO && c0[i] === MAR && aMar[i] < DIQUE) { c[i] = TIERRA; nueva++; }
  // motas: las islas de menos de MOTA px que han salido nuevas se quitan, y los huecos de mar sueltos se rellenan
  const { et: isla, tam: tisla } = trozos(W, H, Uint8Array.from(c, (v) => +(v !== MAR)));
  const esNueva = tisla.map(() => false);
  for (let i = 0; i < n; i++) if (isla[i] && c0[i] === MAR) esNueva[isla[i]] = true;
  let motas = 0;
  for (let i = 0; i < n; i++) if (isla[i] && tisla[isla[i]] < MOTA && esNueva[isla[i]]) { c[i] = MAR; motas++; }
  const { et: hueco, tam: thueco } = trozos(W, H, Uint8Array.from(c, (v) => +(v === MAR)));
  for (let i = 0; i < n; i++) if (hueco[i] && hueco[i] !== hueco[0]) { if (thueco[hueco[i]] >= LAGO_MIN) errores.push(`mar cerrado de ${thueco[hueco[i]]} px`); c[i] = TIERRA; }
  registro(`tierra nueva: ${nueva} px; charcos a lago ${aLago}, a tierra ${aTierra}; motas quitadas: ${motas} px`);
  if (errores.length) throw new Error(errores.join('; '));
  return c;
}

// Lo que RNW rechaza o estropea (docs/estudio-rnw.md §2): devuelve la lista de fallos del dibujo nuevo.
export function comprueba(c0, c, W, H) {
  const n = W * H, fallos = [];
  const { et: mar, tam: tmar } = trozos(W, H, Uint8Array.from(c, (v) => +(v === MAR)));
  if (tmar.length !== 2 || !mar[0]) fallos.push(`hay ${tmar.length - 2} mares cerrados sin pintar de lago`);
  const aMar = distancia(W, H, Uint8Array.from(c, (v) => +(v !== MAR)));
  let cerca = 0;
  for (let i = 0; i < n; i++) if (c[i] === LAGO && c0[i] !== LAGO && aMar[i] < DIQUE - 1) cerca++;
  if (cerca) fallos.push(`${cerca} px de lago nuevo a menos de ${DIQUE - 1} px del mar`);
  for (let i = 0; i < n; i++) if (c0[i] === LAGO && c[i] !== LAGO) { fallos.push('se ha tocado un lago del dibujo de partida'); break; }
  const { et: isla, tam: tisla } = trozos(W, H, Uint8Array.from(c, (v) => +(v !== MAR)));
  const nueva = tisla.map(() => false);
  for (let i = 0; i < n; i++) if (isla[i] && c0[i] === MAR) nueva[isla[i]] = true;
  const motas = tisla.filter((v, k) => k && v < 38 && nueva[k]).length;
  if (motas) fallos.push(`${motas} islas nuevas de menos de 38 px (RNW las borra)`);
  let tierra = 0; for (const v of c) if (v !== MAR && v !== LAGO) tierra++;
  if (tierra < 0.03 * n || tierra > 0.9 * n) fallos.push('la tierra no esta entre el 3 % y el 90 % de la hoja');
  // Medido con RNW 1.2.2 y location_px 45 (mundo BC2T): 139 px del dibujo por localizacion de tierra;
  // 7.533 de tierra dan 31.226 en total y RNW rechaza el mundo a partir de 32.000.
  if (tierra / 139 > 8000) fallos.push(`unas ${Math.round(tierra / 139)} localizaciones de tierra: con location_px 45 el mundo pasaria de las 32.000 de RNW`);
  return fallos;
}

// la zona de la tierra nueva: la de la tierra con zona mas cercana (por tierra)
function heredaZonas(W, H, c, id) {
  const cola = new Int32Array(W * H); let a = 0, b = 0;
  for (let i = 0; i < W * H; i++) if (id[i] >= 0) cola[b++] = i;
  while (a < b) {
    const i = cola[a++], x = i % W;
    for (const j of [x ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < W * H && id[j] < 0 && c[j] !== MAR && c[j] !== LAGO) { id[j] = id[i]; cola[b++] = j; }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const png = readPngFile(path.join(ORIGEN, 'mascara.png')), W = png.width, H = png.height, n = W * H;
  const c0 = clases(png);
  const c = ensancha(c0, W, H, (m) => console.log(m));
  const fallos = comprueba(c0, c, W, H);
  if (fallos.length) { console.error('ensancha-tierra: el dibujo no vale: ' + fallos.join('; ')); process.exit(1); }
  const cuenta = (q) => { let t = 0; for (const v of q) if (v !== MAR && v !== LAGO) t++; return t; };
  console.log(`tierra: ${(100 * cuenta(c0) / n).toFixed(1)} % -> ${(100 * cuenta(c) / n).toFixed(1)} % de la hoja (x${(cuenta(c) / cuenta(c0)).toFixed(2)})`);
  fs.mkdirSync(SALIDA, { recursive: true });
  const pinta = (tabla, f) => { const rgb = Buffer.alloc(n * 3); for (let i = 0; i < n; i++) { const q = tabla(i); rgb[i * 3] = q[0]; rgb[i * 3 + 1] = q[1]; rgb[i * 3 + 2] = q[2]; } writePngFile(path.join(SALIDA, f), W, H, rgb); };
  pinta((i) => COLOR[c[i]], 'mascara.png');
  pinta((i) => VISTA[c[i]], 'vista.png');

  // zonas: las del origen, mas la tierra nueva
  const fz = path.join(ORIGEN, 'zonas.json');
  if (fs.existsSync(fz)) {
    const z = JSON.parse(fs.readFileSync(fz, 'utf8').replace(/^﻿/, ''));
    const zonas = z.zonas, zp = readPngFile(path.join(ORIGEN, 'zonas.png')).rgba;
    const rgb = ([r, g, b]) => (r << 16) | (g << 8) | b, porColor = new Map();
    zonas.forEach((x, i) => porColor.set(rgb(x.color_rgb), i));
    zonas.forEach((x, i) => { const k = rgb(x.color_rgb.map((v) => Math.round(v * 0.55))); if (!porColor.has(k)) porColor.set(k, i); });
    const id = new Int16Array(n).fill(-1);
    for (let i = 0; i < n; i++) { const k = porColor.get((zp[i * 4] << 16) | (zp[i * 4 + 1] << 8) | zp[i * 4 + 2]); if (k !== undefined && c[i] !== MAR && c[i] !== LAGO) id[i] = k; }
    heredaZonas(W, H, c, id);
    pinta((i) => (c[i] === MAR ? [14, 36, 70] : c[i] === LAGO ? [150, 200, 240] : id[i] < 0 ? [14, 36, 70] : c[i] === MONTANA ? zonas[id[i]].color_rgb.map((v) => Math.round(v * 0.55)) : zonas[id[i]].color_rgb), 'zonas.png');
    const s = zonas.map(() => ({ px: 0, x: 0, y: 0, x0: W, y0: H, x1: 0, y1: 0, t: [0, 0, 0, 0, 0, 0] }));
    for (let i = 0; i < n; i++) if (id[i] >= 0) { const q = s[id[i]], x = i % W, y = (i / W) | 0; q.px++; q.x += x; q.y += y; q.x0 = Math.min(q.x0, x); q.y0 = Math.min(q.y0, y); q.x1 = Math.max(q.x1, x); q.y1 = Math.max(q.y1, y); q.t[c[i]]++; }
    const porCont = {}; zonas.forEach((x, i) => { porCont[x.continente] = (porCont[x.continente] || 0) + s[i].px; });
    const pct = (a, b) => Math.round(1000 * a / b) / 10;
    zonas.forEach((x, i) => {
      const q = s[i]; if (!q.px) return;
      Object.assign(x, { px: q.px, pct_del_continente: pct(q.px, porCont[x.continente]), localizaciones_aprox: Math.round(q.px * x.localizaciones_aprox / Math.max(1, x.px)), caja: [q.x0, q.y0, q.x1, q.y1], centroide: [Math.round(q.x / q.px), Math.round(q.y / q.px)], pct_montana: pct(q.t[MONTANA], q.px), pct_altas: pct(q.t[ALTAS], q.px), pct_llanura: pct(q.t[LLANURA], q.px) });
    });
    z.nota_ensanche = `Tierra ensanchada con herramientas/ensancha-tierra.mjs (semilla ${SEMILLA}) a partir de mundo/35cl. localizaciones_aprox sigue en la escala del dibujo fino (location_px 45).`;
    fs.writeFileSync(path.join(SALIDA, 'zonas.json'), JSON.stringify(z, null, 1) + '\n');
    console.log(zonas.map((x, i) => `${x.id} ${s[i].px}`).join(', '));
  }
}
