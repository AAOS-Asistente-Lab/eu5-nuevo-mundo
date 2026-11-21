// comprueba-zonas-dibujo.mjs: prueba las reglas de los gj_zona_* (zonas-mapa.mjs) sobre el dibujo
// de mapa/final, sin mundo de RNW. Hace un mundo de mentira con el mismo dibujo: una localizacion
// por casilla de ~127 px (lo que mide una de RNW a location_px 45, FORMATO-PNG.md), su zona por
// el pixel central, el relieve de mascara.png, la costa si toca mar y areas de 6 x 6 casillas.
// Despues corre defineZonas tal cual y dice cuantas localizaciones tiene cada zona.
//
// Uso: node comprueba-zonas-dibujo.mjs [--mapa <carpeta>]   sale con 1 si una zona queda vacia
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPngFile } from './png.mjs';
import { cargaMapa, defineZonas, DIR_MAPA } from './zonas-mapa.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dirMapa = path.resolve(args.includes('--mapa') ? args[args.indexOf('--mapa') + 1] : DIR_MAPA);
const FAC = JSON.parse(fs.readFileSync(path.join(AQUI, 'facciones.json'), 'utf8'));
const mapa = cargaMapa(dirMapa);
const W = mapa.ancho, H = mapa.alto;

// 1. las zonas de zonas.png cuadran con zonas.json
const npx = mapa.zonas.map(() => 0); for (const v of mapa.id) if (v >= 0) npx[v]++;
const descuadres = mapa.zonas.filter((z, i) => z.px && Math.abs(npx[i] / z.px - 1) > 0.02).map((z) => z.id);

// 2. mundo de mentira
const masc = readPngFile(path.join(dirMapa, 'mascara.png'));
if (masc.width !== W || masc.height !== H) throw new Error(`mascara.png mide ${masc.width}x${masc.height} y zonas.png ${W}x${H}`);
const COLORES = { '0,0,0': 'mar', '255,255,255': 'flatland', '160,82,45': 'mountains', '218,165,32': 'plateau', '124,205,124': 'flatland', '30,144,255': 'lago' };
const clase = (x, y) => { const p = (y * W + x) * 4; return COLORES[`${masc.rgba[p]},${masc.rgba[p + 1]},${masc.rgba[p + 2]}`] || 'flatland'; };
const S = Math.round(Math.sqrt(127)), BLOQUE = 6;
const nx = Math.floor(W / S), ny = Math.floor(H / S);
const celda = new Map(); // "i,j" -> loc
const zonaDe = new Map(), xy = new Map(), jer = new Map(), plant = new Map(), costaS = new Set(), tierra = [];
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
  const cx = i * S + (S >> 1), cy = j * S + (S >> 1);
  const c = clase(cx, cy), z = mapa.id[cy * W + cx];
  if (c === 'mar' || c === 'lago' || z < 0) continue;
  const l = `c_${i}_${j}`;
  celda.set(`${i},${j}`, l); tierra.push(l);
  zonaDe.set(l, mapa.zonas[z]); xy.set(l, [cx, cy]);
  jer.set(l, { continente: 'america', subcontinente: mapa.zonas[z].continente === 'N' ? 'north_america' : 'south_america', area: `a_${Math.floor(i / BLOQUE)}_${Math.floor(j / BLOQUE)}` });
  plant.set(l, { topo: c, veg: 'forest' });
  let mar = false;
  for (let y = j * S; y < (j + 1) * S && !mar; y++) for (let x = i * S; x < (i + 1) * S; x++) if (clase(x, y) === 'mar') { mar = true; break; }
  if (mar) costaS.add(l);
}
const vec = new Map();
for (const l of tierra) {
  const [, i, j] = l.split('_').map(Number);
  vec.set(l, new Set([[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => celda.get(`${i + a},${j + b}`)).filter(Boolean)));
}
const mundo = { jer, plant, costa: costaS, locsAmerica: tierra };
const liga = { zonaDe, xy, mapa, tierra };
const { zonas, detalle } = await defineZonas({ liga, mundo, conf: FAC.zonas || {}, facciones: FAC.facciones, vec });

// 3. informe
const locsDe = (d) => {
  const s = new Set();
  for (const x of d.lista) {
    if (x.tipo === 'location') s.add(x.clave);
    else if (x.tipo === 'area') for (const l of tierra) { if (jer.get(l).area === x.clave) s.add(l); }
    else if (x.tipo === 'sub_continent') for (const l of tierra) { if (jer.get(l).subcontinente === x.clave) s.add(l); }
  }
  return s;
};
const zonasDe = (s) => { const c = {}; for (const l of s) { const z = zonaDe.get(l).id; c[z] = (c[z] || 0) + 1; } return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([z, n]) => `${z} ${n}`).join(', '); };
console.log(`Dibujo ${W}x${H} (${path.basename(dirMapa)}): ${mapa.zonas.length} zonas, ${tierra.length} localizaciones de mentira (casilla de ${S} px).`);
console.log(`Zonas de zonas.png frente a zonas.json: ${descuadres.length ? `descuadran ${descuadres.join(', ')}` : 'cuadran todas (menos del 2 %)'}.`);
const vacias = [];
for (const z of Object.keys(FAC.zonas || {}).filter((k) => !k.startsWith('_')).sort()) {
  const d = zonas[z];
  if (!d) { vacias.push(z); console.log(`- ${z}: VACIA (${detalle[z] || 'sin regla'})`); continue; }
  const s = locsDe(d);
  let extra = '';
  if (z === 'gj_zona_marca_occidental') {
    const ost = FAC.facciones.find((f) => f.clave === 'ostrevar'); const zo = ost?.zona_mapa || 'ostrevar';
    const toca = [...s].filter((l) => [...vec.get(l)].some((v) => zonaDe.get(v).id === zo)).length;
    extra = `; toca a ${zo} en ${toca} localizaciones`;
  }
  console.log(`- ${z} (${d.ambito}): ${s.size} localizaciones (${zonasDe(s)})${extra}`);
}
process.exit(vacias.length || descuadres.length ? 1 : 0);
