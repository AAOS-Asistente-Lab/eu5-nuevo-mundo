// zonas-mapa.mjs: liga el mapa final del Nuevo Mundo (mapa/final/zonas.json y zonas.png) con
// un mundo de RNW generado a partir de ese dibujo, y define los gj_zona_* que piden las partes.
//
// El dibujo mide ancho x alto; por escala_lienzo (4) es el lienzo de RNW, que ocupa las 8192
// filas del mapa del juego y una franja de columnas que RNW recorta. Por eso la x lleva un
// desplazamiento que no se sabe de antemano: se ajusta x_mundo = sx * x_dibujo + bx (y lo mismo
// en y) con las cajas de la tierra y, despues, con el centro de cada zona. «Una localizacion
// pertenece a la zona de su pixel central» (zonas.json): su centro, pasado al dibujo, cae en el
// color de una zona de zonas.png.
//
// Si menos del CALIDAD_MINIMA de las localizaciones de tierra cae dentro de una zona, el mundo no
// esta hecho con este dibujo (por ejemplo, la America del juego base) y no se usa.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPngFile } from './png.mjs';
import { centros, vecinos } from './mundo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
// el mapa final: mapa/final en la carpeta de trabajo, mundo/ en el repo
export const DIR_MAPA = [path.join(AQUI, '..', 'mapa', 'final'), path.join(AQUI, '..', 'mundo')].find((d) => fs.existsSync(path.join(d, 'zonas.json'))) || path.join(AQUI, '..', 'mapa', 'final');
export const CALIDAD_MINIMA = 0.85;
const ALTO = new Set(['mountains', 'hills', 'plateau']);

export function cargaMapa(dirMapa = DIR_MAPA) {
  const z = JSON.parse(fs.readFileSync(path.join(dirMapa, 'zonas.json'), 'utf8').replace(/^﻿/, ''));
  const zonas = typeof z.zonas === 'string' ? JSON.parse(z.zonas) : z.zonas;
  const rasgos = typeof z.rasgos === 'string' ? JSON.parse(z.rasgos) : (z.rasgos || {});
  const png = readPngFile(path.join(dirMapa, 'zonas.png'));
  const W = png.width, H = png.height;
  if (z.ancho && (z.ancho !== W || z.alto !== H)) throw new Error(`zonas.png mide ${W}x${H} y zonas.json dice ${z.ancho}x${z.alto}`);
  // Cada zona con su color; las montanas van con el mismo color por 0,55 (genera.mjs, MAPA.md §4).
  const rgb = ([r, g, b]) => (r << 16) | (g << 8) | b;
  const porColor = new Map();
  zonas.forEach((x, i) => { porColor.set(rgb(x.color_rgb), i); });
  zonas.forEach((x, i) => { const k = rgb(x.color_rgb.map((v) => Math.round(v * 0.55))); if (!porColor.has(k)) porColor.set(k, i); });
  const id = new Int16Array(W * H).fill(-1);
  const suma = zonas.map(() => [0, 0, 0]);
  const hx = new Float64Array(W), hy = new Float64Array(H);
  const px = png.rgba;
  for (let y = 0, p = 0; y < H; y++) for (let x = 0; x < W; x++, p++) {
    const i = porColor.get((px[p * 4] << 16) | (px[p * 4 + 1] << 8) | px[p * 4 + 2]);
    if (i === undefined) continue;
    id[p] = i; suma[i][0] += x; suma[i][1] += y; suma[i][2]++; hx[x]++; hy[y]++;
  }
  const centro = suma.map(([sx, sy, n]) => (n ? [sx / n, sy / n, n] : null));
  return { ancho: W, alto: H, zonas, rasgos, id, centro, hx, hy, escala: z.escala_lienzo || 4 };
}

// Zona del pixel (x, y) del dibujo; con radio, la mas cercana a esa distancia (costas y bordes).
export function zonaEn(mapa, x, y, radio = 0) {
  const { ancho: W, alto: H, id } = mapa;
  const xi = Math.round(x), yi = Math.round(y);
  if (xi >= 0 && yi >= 0 && xi < W && yi < H && id[yi * W + xi] >= 0) return id[yi * W + xi];
  for (let r = 1; r <= radio; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const a = xi + dx, b = yi + dy;
    if (a >= 0 && b >= 0 && a < W && b < H && id[b * W + a] >= 0) return id[b * W + a];
  }
  return -1;
}

const percentil = (pesos, q) => { const tot = pesos.reduce((s, v) => s + v, 0); let ac = 0; for (let i = 0; i < pesos.length; i++) { ac += pesos[i]; if (ac >= q * tot) return i; } return pesos.length - 1; };
function percentilPonderado(vals, pesos, q) {
  const o = vals.map((v, i) => [v, pesos[i]]).sort((a, b) => a[0] - b[0]);
  const tot = o.reduce((s, x) => s + x[1], 0); let ac = 0;
  for (const [v, w] of o) { ac += w; if (ac >= q * tot) return v; }
  return o[o.length - 1][0];
}
// Recta por minimos cuadrados ponderados: mundo = s * dibujo + b.
function recta(pares) {
  let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [x, y, w] of pares) { sw += w; sx += w * x; sy += w * y; sxx += w * x * x; sxy += w * x * y; }
  const d = sw * sxx - sx * sx; if (!d) return null;
  const s = (sw * sxy - sx * sy) / d; return { s, b: (sy - s * sx) / sw };
}

// Liga el dibujo con el mundo. mundo: lo que devuelve cargaMundo (locsAmerica = la tierra).
export async function ligaMapa({ dir, juego, mundo, mapa = cargaMapa(), forzar = false }) {
  const cen = await centros(dir, juego);
  const tierra = mundo.locsAmerica.filter((l) => cen.has(l)).sort();
  const P = tierra.map((l) => { const [x, y, n] = cen.get(l); return { l, x, y, n }; });
  if (!P.length) return { usable: false, calidad: 0, motivo: 'el mundo no tiene tierra con centro en locations.png' };
  const q = 0.002;
  const caja = (vals, pesos) => [percentilPonderado(vals, pesos, q), percentilPonderado(vals, pesos, 1 - q)];
  const [wx0, wx1] = caja(P.map((p) => p.x), P.map((p) => p.n)), [wy0, wy1] = caja(P.map((p) => p.y), P.map((p) => p.n));
  const dx0 = percentil([...mapa.hx], q), dx1 = percentil([...mapa.hx], 1 - q), dy0 = percentil([...mapa.hy], q), dy1 = percentil([...mapa.hy], 1 - q);
  let aj = { sx: (wx1 - wx0) / (dx1 - dx0 || 1), sy: (wy1 - wy0) / (dy1 - dy0 || 1) };
  aj.bx = wx0 - aj.sx * dx0; aj.by = wy0 - aj.sy * dy0;
  // El mapa del juego da la vuelta en x (16384 columnas): una localizacion puede caer al otro
  // lado de la costura. Se prueba x, x - ancho y x + ancho y vale la que cae dentro del dibujo.
  const Wm = (cen.get('_tamano') || [16384])[0];
  const xDibujo = (x, a) => { for (const d of [0, -Wm, Wm]) { const xd = (x + d - a.bx) / a.sx; if (xd >= 0 && xd < mapa.ancho) return xd; } return (x - a.bx) / a.sx; };
  // La caja sola falla si hay tierra suelta lejos (islas al otro lado de la costura): se busca la
  // escala y el desplazamiento en x que mas centros dejan en tierra del dibujo, y luego en y.
  const tierraDib = new Uint8Array(mapa.id.length); for (let i = 0; i < mapa.id.length; i++) tierraDib[i] = mapa.id[i] >= 0 ? 1 : 0;
  const aciertos = (a, pts) => { let n = 0; for (const p of pts) { const xd = Math.round(xDibujo(p.x, a)), yd = Math.round((p.y - a.by) / a.sy); if (xd >= 0 && yd >= 0 && xd < mapa.ancho && yd < mapa.alto && tierraDib[yd * mapa.ancho + xd]) n++; } return n; };
  const busca = (a, pts, campo, valores) => { let mejor = a, mn = aciertos(a, pts); for (const v of valores) { const b = { ...a, ...v }; const n = aciertos(b, pts); if (n > mn) { mn = n; mejor = b; } } return mejor; };
  const rango = (c, r, paso) => { const o = []; for (let v = c - r; v <= c + r + 1e-9; v += paso) o.push(v); return o; };
  {
    const muestra = P.filter((_, i) => i % Math.max(1, Math.floor(P.length / 800)) === 0);
    const cand = [];
    for (const sx of rango(4, 1, 0.02)) for (const bx of rango(0, Wm / 2, 16)) cand.push({ sx, bx });
    aj = busca(aj, muestra, 'x', cand);
    aj = busca(aj, P, 'x', rango(aj.sx, 0.03, 0.002).flatMap((sx) => rango(aj.bx, 24, 2).map((bx) => ({ sx, bx }))));
    aj = busca(aj, P, 'y', rango(aj.sy, 0.03, 0.003).flatMap((sy) => rango(aj.by, 40, 2).map((by) => ({ sy, by }))));
    // desde aqui, la x de cada centro ya del lado de la costura que cae en el dibujo
    for (const p of P) for (const d of [0, -Wm, Wm]) { const xd = (p.x + d - aj.bx) / aj.sx; if (xd >= 0 && xd < mapa.ancho) { p.x += d; break; } }
  }
  const reparte = (a) => {
    const zona = new Map(), xy = new Map(); let dentro = 0;
    for (const p of P) {
      const xd = xDibujo(p.x, a), yd = (p.y - a.by) / a.sy;
      xy.set(p.l, [xd, yd]);
      const z0 = zonaEn(mapa, xd, yd, 2); // 2 px de dibujo (8 de lienzo): lo que mueve RNW la costa al suavizar
      if (z0 >= 0) dentro++;
      const z = z0 >= 0 ? z0 : zonaEn(mapa, xd, yd, 4);
      if (z >= 0) zona.set(p.l, z);
    }
    return { zona, xy, calidad: dentro / P.length };
  };
  let r = reparte(aj);
  // Afinar con el centro de cada zona (pesado por pixeles); solo si mejora.
  for (let it = 0; it < 4; it++) {
    const acum = mapa.zonas.map(() => [0, 0, 0]);
    for (const p of P) { const z = r.zona.get(p.l); if (z === undefined) continue; acum[z][0] += p.x * p.n; acum[z][1] += p.y * p.n; acum[z][2] += p.n; }
    const px = [], py = [];
    acum.forEach(([sx, sy, n], z) => { if (n && mapa.centro[z] && n > 15 * 2000) { px.push([mapa.centro[z][0], sx / n, n]); py.push([mapa.centro[z][1], sy / n, n]); } });
    const rx = recta(px), ry = recta(py);
    if (!rx || !ry) break;
    const nuevo = { sx: rx.s, bx: rx.b, sy: ry.s, by: ry.b };
    const r2 = reparte(nuevo);
    if (r2.calidad <= r.calidad + 1e-4) break;
    aj = nuevo; r = r2;
  }
  const porZona = new Map(mapa.zonas.map((z) => [z.id, []]));
  for (const [l, z] of r.zona) porZona.get(mapa.zonas[z].id).push(l);
  return {
    usable: forzar || r.calidad >= CALIDAD_MINIMA, forzado: forzar && r.calidad < CALIDAD_MINIMA, calidad: r.calidad,
    ajuste: aj, escalaEsperada: (cen.get('_tamano') || [0, 8192])[1] / mapa.alto,
    zonaDe: new Map([...r.zona].map(([l, z]) => [l, mapa.zonas[z]])), xy: r.xy, porZona, mapa, tierra,
  };
}

// ---------------------------------------------------------------- zonas de las partes
// conf: facciones.json "zonas" (con "mapa": la regla de cada una). facZona: clave de faccion ->
// id de zona del dibujo. Devuelve { zonas: { gj_zona_x: descriptor }, detalle: { gj_zona_x: texto } }.
// Descriptor: { ambito, lista: [{ tipo: 'area'|'location'|'sub_continent', clave }] }, con
// ambito 'localizacion' (por defecto), 'pais_capital' o 'pais_frontera'.
export async function defineZonas({ liga, mundo, dir, juego, conf, facciones, vec: vecDado = null }) {
  const { zonaDe, xy, mapa, tierra } = liga;
  const vec = vecDado || await vecinos(dir, juego);
  const { jer, plant } = mundo;
  const facZona = new Map(facciones.map((f) => [f.clave, f.zona_mapa || f.clave.replace(/_/g, '-')]));
  const zonaFac = new Map([...facZona].map(([f, z]) => [z, f]));
  const metal = new Set(facciones.filter((f) => (f.recursos || []).includes('metales')).map((f) => facZona.get(f.clave)));
  const esTierra = new Set(tierra);
  // costa: los puertos de ports.csv; si el mundo no lo trae, la tierra que toca algo que no es tierra
  const costa = new Set(mundo.costa.size ? tierra.filter((l) => mundo.costa.has(l)) : tierra.filter((l) => [...(vec.get(l) || [])].some((v) => !esTierra.has(v))));
  const zid = (l) => zonaDe.get(l)?.id;
  const cont = (l) => zonaDe.get(l)?.continente;
  const esFac = (l) => zonaFac.has(zid(l));
  const dist = (l, [cx, cy]) => { const [x, y] = xy.get(l); return Math.hypot(x - cx, y - cy); };
  const area = (l) => jer.get(l)?.area;
  const topo = (l) => plant.get(l)?.topo, veg = (l) => plant.get(l)?.veg;
  const bordeFac = (l) => [...(vec.get(l) || [])].filter((v) => esTierra.has(v) && esFac(v) && zid(v) !== zid(l)).map(zid);
  // areas: zona mayoritaria, centro en el dibujo y cuanto tiene de alto
  const areas = new Map();
  for (const l of tierra) { const a = area(l); if (!a) continue; if (!areas.has(a)) areas.set(a, []); areas.get(a).push(l); }
  const infoArea = new Map([...areas].map(([a, ls]) => {
    const c = {}; for (const l of ls) { const z = zid(l); if (z) c[z] = (c[z] || 0) + 1; }
    const zona = Object.entries(c).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0]?.[0];
    const x = ls.reduce((s, l) => s + xy.get(l)[0], 0) / ls.length, y = ls.reduce((s, l) => s + xy.get(l)[1], 0) / ls.length;
    return [a, { zona, x, y, alto: ls.filter((l) => ALTO.has(topo(l))).length / ls.length }];
  }));
  const areasDe = (zonaId) => [...infoArea].filter(([, i]) => i.zona === zonaId).map(([a]) => a).sort();
  const usados = new Set();
  const elige = (cands, n, puntos, maxCont = Infinity) => { // maxCont: tope por continente del dibujo
    const o = cands.filter((l) => !usados.has(l)).map((l) => [l, puntos(l)]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const out = [], ar = new Set();
    const pc = {};
    for (const [l] of o) { if (out.length >= n) break; const a = area(l) || l; if (ar.has(a) || (pc[cont(l)] || 0) >= maxCont) continue; out.push(l); ar.add(a); pc[cont(l)] = (pc[cont(l)] || 0) + 1; }
    for (const l of out) usados.add(l);
    return out.sort();
  };
  const crece = (base, centro, minimo, r0 = 150, rMax = 400) => { let r = r0, s = []; for (; r <= rMax; r += 50) { s = base.filter((l) => dist(l, centro) <= r); if (s.length >= minimo) break; } return { s: s.sort(), r }; };
  const circo = (nombre) => (mapa.rasgos.circos || []).find((c) => c.nombre === nombre);
  const mares = mapa.rasgos.mares_interiores || [];
  const estrecho = mapa.rasgos.estrecho_entre_mundos;
  const centroZona = (id) => mapa.centro[mapa.zonas.findIndex((z) => z.id === id)];
  const loc = (ls) => ls.map((clave) => ({ tipo: 'location', clave }));
  const ar = (as) => as.map((clave) => ({ tipo: 'area', clave }));
  const zonas = {}, detalle = {};
  const pon = (z, ambito, lista, txt) => { zonas[z] = { ambito, lista }; detalle[z] = txt; };

  // primero las zonas grandes y las de un rasgo; ruinas y vetas al final, sin repetir location
  const rango = (c) => (c.mapa.regla.startsWith('veta') ? 2 : c.mapa.regla.startsWith('ruina') ? 1 : 0);
  const orden = Object.entries(conf).filter(([z, c]) => !z.startsWith('_') && c.mapa).sort(([a, x], [b, y]) => rango(x) - rango(y) || a.localeCompare(b));
  let marInterior = null;
  for (const [z, c] of orden) {
    const m = c.mapa, ambito = c.ambito || 'localizacion', fz = c.faccion && facZona.get(c.faccion);
    switch (m.regla) {
      case 'zona': { // todas las areas de la zona de la faccion
        const as = areasDe(fz); pon(z, ambito, ar(as), `${as.length} areas de la zona ${fz}`); break;
      }
      case 'oeste': case 'este': case 'alto': case 'bajo': { // un cuarto de la zona de la faccion
        const as = areasDe(fz).sort((a, b) => infoArea.get(a).x - infoArea.get(b).x || a.localeCompare(b));
        const k = Math.max(1, Math.ceil(as.length / 4));
        const oeste = as.slice(0, k), este = as.slice(Math.max(k, as.length - k)), medio = as.slice(k, Math.max(k, as.length - k))
          .sort((a, b) => infoArea.get(b).alto - infoArea.get(a).alto || infoArea.get(a).y - infoArea.get(b).y || a.localeCompare(b));
        const h = Math.ceil(medio.length / 2);
        const sel = { oeste, este, alto: medio.slice(0, h), bajo: medio.slice(h) }[m.regla];
        const final = sel.length ? sel : [as[Math.min(as.length - 1, { oeste: 0, este: as.length - 1, alto: k, bajo: k + 1 }[m.regla])]].filter(Boolean);
        pon(z, ambito, ar(final.sort()), `${final.length} areas (${m.regla}) de la zona ${fz}`); break;
      }
      case 'continente': { // la capital en ese continente del dibujo: su subcontinente en el mundo
        const c2 = {}; for (const l of tierra) if (cont(l) === m.continente) { const s = jer.get(l)?.subcontinente; if (s) c2[s] = (c2[s] || 0) + 1; }
        const s = Object.entries(c2).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (s) pon(z, ambito, [{ tipo: 'sub_continent', clave: s }], `subcontinente ${s} (el del continente ${m.continente} del dibujo)`); break;
      }
      case 'circo': { // el interior de un circo del dibujo
        const ci = circo(m.nombre); if (!ci) break;
        const [cx, cy] = ci.centro, [rx, ry] = ci.radios, f = m.interior || 0.4;
        let s = tierra.filter((l) => { const [x, y] = xy.get(l); return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < f * f; }).sort();
        if (s.length < 4) s = [...tierra].sort((a, b) => dist(a, ci.centro) - dist(b, ci.centro) || a.localeCompare(b)).slice(0, 6).sort();
        pon(z, ambito, loc(s), `${s.length} localizaciones dentro del ${m.nombre} (${f} del radio)`); break;
      }
      case 'estrecho': { // la costa del estrecho entre los dos continentes
        if (!estrecho) break;
        const cs = Object.values(estrecho.cabos || {}); const centro = cs.length ? [cs.reduce((s, c) => s + c[0], 0) / cs.length, cs.reduce((s, c) => s + c[1], 0) / cs.length] : [mapa.ancho / 2, (estrecho.franja_y[0] + estrecho.franja_y[1]) / 2];
        const { s, r } = crece([...costa], centro, m.minimo || 8);
        pon(z, ambito, loc(s), `${s.length} localizaciones de costa a ${r} px del estrecho (${centro.map(Math.round).join(', ')})`); break;
      }
      case 'mar_interior': { // la costa del mar interior mas cercano a la zona de la faccion
        const cz = centroZona(fz); if (!cz || !mares.length) break;
        const mar = [...mares].sort((a, b) => Math.hypot(a.centro[0] - cz[0], a.centro[1] - cz[1]) - Math.hypot(b.centro[0] - cz[0], b.centro[1] - cz[1]))[0];
        const { s, r } = crece([...costa], mar.centro, m.minimo || 10);
        marInterior = { mar, s };
        pon(z, ambito, loc(s), `${s.length} localizaciones de costa a ${r} px del ${mar.nombre}`); break;
      }
      case 'ruina_enana': { // montes y colinas del norte, cerca de las zonas de metal y de los circos
        const circosN = (mapa.rasgos.circos || []).filter((ci) => zonaDe.get([...tierra].sort((a, b) => dist(a, ci.centro) - dist(b, ci.centro))[0])?.continente === 'N');
        const s = elige(tierra.filter((l) => cont(l) === 'N' && ['mountains', 'hills'].includes(topo(l))), m.n || 5,
          (l) => (topo(l) === 'mountains' ? 2 : 1) + (metal.has(zid(l)) ? 2 : 0) + Math.max(0, ...circosN.map((ci) => 2 * (1 - dist(l, ci.centro) / 300))));
        pon(z, ambito, loc(s), `${s.length} ruinas enanas: montes del norte, cerca del metal y de los circos`); break;
      }
      case 'ruina_atlante': { // tierra adentro en el sur, hacia el mar interior
        const marS = [...mares].sort((a, b) => b.centro[1] - a.centro[1])[0];
        const s = elige(tierra.filter((l) => cont(l) === 'S' && !costa.has(l)), m.n || 5,
          (l) => (marS ? 3 * Math.max(0, 1 - dist(l, marS.centro) / 400) : 0) + (esFac(l) ? 1 : 0));
        pon(z, ambito, loc(s), `${s.length} ruinas atlantes: tierra adentro del sur, hacia el mar interior`); break;
      }
      case 'ruina_antigua': { // mesetas y selvas de altura, entre el norte y el sur
        const yE = estrecho ? (estrecho.franja_y[0] + estrecho.franja_y[1]) / 2 : mapa.alto / 2;
        const s = elige(tierra.filter((l) => topo(l) === 'plateau' || (veg(l) === 'jungle' && ALTO.has(topo(l)))), m.n || 5,
          (l) => (topo(l) === 'plateau' ? 2 : 0) + (veg(l) === 'jungle' ? 1 : 0) + 2 * Math.max(0, 1 - Math.abs(xy.get(l)[1] - yE) / 600), Math.ceil((m.n || 5) / 2)); // mezcladas entre norte y sur
        pon(z, ambito, loc(s), `${s.length} ruinas de los Anteriores: mesetas y selvas de altura`); break;
      }
      case 'veta_fuego': case 'veta_raiz': { // frontera entre facciones (del norte, con metal; del sur)
        const c0 = m.regla === 'veta_fuego' ? 'N' : 'S';
        let base = tierra.filter((l) => cont(l) === c0 && esFac(l) && bordeFac(l).length);
        if (m.regla === 'veta_fuego') { const conMetal = base.filter((l) => metal.has(zid(l)) || bordeFac(l).some((z2) => metal.has(z2))); if (conMetal.length) base = conMetal; }
        const s = elige(base, m.n || 2, (l) => (ALTO.has(topo(l)) ? 1 : 0) + (['forest', 'jungle', 'woods'].includes(veg(l)) && c0 === 'S' ? 1 : 0) + bordeFac(l).length / 10);
        pon(z, ambito, loc(s), `${s.length} en la frontera entre facciones del ${c0 === 'N' ? 'norte' : 'sur'}`); break;
      }
      case 'veta_marea': { // costa del mar interior
        const mar = marInterior?.mar || mares[0]; const base = marInterior?.s?.length ? marInterior.s : [...costa];
        const s = mar ? elige(base, m.n || 1, (l) => -dist(l, mar.centro)) : [];
        pon(z, ambito, loc(s), `${s.length} en la costa del ${mar?.nombre || 'mar interior'}`); break;
      }
      case 'veta_estrella': { // alta meseta: la meseta con mas vecinos altos
        const s = elige(tierra.filter((l) => topo(l) === 'plateau'), m.n || 1, (l) => [...(vec.get(l) || [])].filter((v) => ALTO.has(topo(v))).length);
        pon(z, ambito, loc(s), `${s.length} en la alta meseta`); break;
      }
      default: detalle[z] = `regla de mapa desconocida: ${m.regla}`;
    }
    if (zonas[z] && !zonas[z].lista.length) { delete zonas[z]; detalle[z] = `${detalle[z]}: vacia`; }
  }
  return { zonas, detalle };
}
