// pinta-paises.mjs: dibuja el reparto (un color por pais, la capital en negro, la tierra libre en
// gris) para verlo sin abrir el juego.
//   node pinta-paises.mjs --mundo <carpeta del mundo> --dueno <json de asigna-facciones --dueno> --salida <png> [--escala 4]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { juegoPorDefecto, enMundo, coloresDeLocalizaciones, filasDePng } from './mundo.mjs';
import { writePngFile } from './png.mjs';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (!arg('--mundo') || !arg('--dueno') || !arg('--salida')) { console.error('uso: node pinta-paises.mjs --mundo <carpeta> --dueno <json> --salida <png> [--escala 4]'); process.exit(2); }
const MUNDO = path.resolve(arg('--mundo')), JUEGO = juegoPorDefecto(), E = Number(arg('--escala', 4));
const { dueno, capitales, tierra } = JSON.parse(fs.readFileSync(arg('--dueno'), 'utf8'));
const esTierra = new Set(tierra), esCapital = new Set(Object.values(capitales));
const locDe = coloresDeLocalizaciones(MUNDO, JUEGO);
const colorTag = (t) => { const h = crypto.createHash('sha256').update(`pinta:${t}`).digest(); return [70 + (h[0] % 170), 70 + (h[1] % 170), 70 + (h[2] % 170)]; };
const cache = new Map(); // color de locations.png -> [r, g, b, codigo] (codigo 0 mar, 1 nuestra)
const pinta = (c) => {
  let v = cache.get(c);
  if (!v) { const l = locDe.get(c); v = !l || !esTierra.has(l) ? [38, 58, 92, 0] : esCapital.has(l) ? [0, 0, 0, 1] : dueno[l] ? [...colorTag(dueno[l]), 1] : [205, 205, 205, 1]; cache.set(c, v); }
  return v;
};
// primera pasada: la caja del Nuevo Mundo; segunda: el dibujo (una muestra cada E pixeles)
const fL = enMundo(MUNDO, JUEGO, 'in_game', 'map_data', 'locations.png');
let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
const filas = [];
const { w } = await filasDePng(fL, (f, y) => {
  if (y % E) return;
  const fila = new Uint32Array(Math.ceil(f.length / 3 / E));
  for (let x = 0, i = 0; x * 3 < f.length; x += E, i++) { const c = (f[x * 3] << 16) | (f[x * 3 + 1] << 8) | f[x * 3 + 2]; fila[i] = c; if (pinta(c)[3]) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y / E < y0) y0 = y / E; if (y / E > y1) y1 = y / E; } }
  filas.push(fila);
});
// el Nuevo Mundo cruza la costura del mapa: si la caja ocupa casi todo el ancho, se gira medio mapa
if (x1 - x0 + 1 > 0.9 * filas[0].length) {
  const C = filas[0].length, medio = C >> 1;
  x0 = Infinity; x1 = -1;
  for (let y = 0; y < filas.length; y++) { const f = filas[y], g = new Uint32Array(C); for (let i = 0; i < C; i++) { const c = f[(i + medio) % C]; g[i] = c; if (pinta(c)[3]) { if (i < x0) x0 = i; if (i > x1) x1 = i; } } filas[y] = g; }
}
const M = 6; x0 = Math.max(0, x0 - M); y0 = Math.max(0, y0 - M); x1 = Math.min(Math.ceil(w / E) - 1, x1 + M); y1 = Math.min(filas.length - 1, y1 + M);
const W = x1 - x0 + 1, H = y1 - y0 + 1, rgb = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const c = filas[y + y0][x + x0], v = pinta(c);
  // frontera entre localizaciones de distinto pais: mas oscura
  const der = x + 1 < W ? filas[y + y0][x + x0 + 1] : c, aba = y + 1 < H ? filas[y + y0 + 1][x + x0] : c;
  const borde = v[3] && [der, aba].some((o) => o !== c && dueno[locDe.get(o)] !== dueno[locDe.get(c)]);
  const k = borde ? 0.45 : 1, o = (y * W + x) * 3;
  rgb[o] = v[0] * k; rgb[o + 1] = v[1] * k; rgb[o + 2] = v[2] * k;
}
writePngFile(path.resolve(arg('--salida')), W, H, rgb);
console.log(`pinta-paises: ${W}x${H} en ${arg('--salida')}`);
