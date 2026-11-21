// Lectura (solo lectura) de un mundo de EU5: el de un mod de Random New World o el del juego.
// Lo usan asigna-recursos.mjs (y, mas adelante, asigna-facciones.mjs).
//   cargaMundo({ juego, mundo, vanilla })  -> { dir, meta, jer, plant, costa, locsAmerica }
//   vecinos(mundo, juego)                   -> Promise<Map(loc -> Set(loc))>, desde locations.png
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { analizaFichero, leeTexto, esBloque, juegoPorDefecto } from './pdx.mjs';
export { juegoPorDefecto };

const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const DOC_MOD = path.join(os.homedir(), 'Documents', 'Paradox Interactive', 'Europa Universalis V', 'mod');

export function buscaMundo({ juego, mundo, vanilla, docMod = DOC_MOD }) {
  if (vanilla) return juego;
  if (mundo) return path.resolve(mundo);
  if (!fs.existsSync(docMod)) throw new Error(`no existe ${docMod}: genera antes un mundo con RNW`);
  const ms = fs.readdirSync(docMod).filter((d) => d.startsWith('rnw_exp_')).map((d) => path.join(docMod, d))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!ms.length) throw new Error(`no hay ningun mundo rnw_exp_* en ${docMod}`);
  return ms[0];
}

// Fichero del mundo, o el del juego si el mundo no lo trae.
export const enMundo = (dir, juego, ...p) => {
  const r = path.join(dir, ...p);
  if (fs.existsSync(r)) return r;
  const j = path.join(juego, ...p);
  return fs.existsSync(j) ? j : null;
};

export function cargaMundo({ juego = juegoPorDefecto(), mundo = null, vanilla = false } = {}) {
  const dir = buscaMundo({ juego, mundo, vanilla });
  let meta = { id: 'vanilla', name: 'America del juego base', version: '1.4.9' };
  if (!vanilla) {
    const rm = path.join(dir, '.metadata', 'metadata.json');
    if (!fs.existsSync(rm)) throw new Error(`${dir} no tiene .metadata/metadata.json: no parece un mundo RNW`);
    meta = JSON.parse(leeTexto(rm).texto);
  }
  const jer = new Map();
  {
    const f = enMundo(dir, juego, 'in_game', 'map_data', 'definitions.txt');
    if (!f) throw new Error('no encuentro definitions.txt');
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
  const plant = new Map();
  {
    const f = enMundo(dir, juego, 'in_game', 'map_data', 'location_templates.txt');
    if (!f) throw new Error('no encuentro location_templates.txt');
    for (const ln of leeTexto(f).texto.split('\n')) {
      const m = ln.match(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*\{(.*)\}/);
      if (!m) continue;
      const campo = (k) => (m[2].match(new RegExp(`\\b${k}\\s*=\\s*([A-Za-z0-9_]+)`)) || [])[1];
      plant.set(m[1], { clima: campo('climate'), topo: campo('topography'), veg: campo('vegetation'), cultura: campo('culture'), religion: campo('religion'), bien: campo('raw_material') });
    }
  }
  const costa = new Set();
  {
    const f = enMundo(dir, juego, 'in_game', 'map_data', 'ports.csv');
    if (f) for (const ln of leeTexto(f).texto.split('\n').slice(1)) { const l = ln.split(';')[0].trim(); if (l) costa.add(l); }
  }
  const locsAmerica = [...jer].filter(([l, j]) => j.continente === 'america' && plant.get(l)?.bien).map(([l]) => l).sort();
  return { dir, meta, jer, plant, costa, locsAmerica };
}

// Localizaciones propias de cada pais en el arranque (main_menu/setup/1337/10_countries.txt).
export function paisesDelMundo(dir, juego = juegoPorDefecto()) {
  const f = enMundo(dir, juego, 'main_menu', 'setup', '1337', '10_countries.txt');
  if (!f) throw new Error('no encuentro 10_countries.txt');
  const a = analizaFichero(f).arbol;
  const ext = a.items.find((x) => x.k === 'countries');
  const lista = ext && esBloque(ext.v) ? ext.v.items.find((x) => x.k === 'countries') : null;
  const out = new Map();
  if (!lista || !esBloque(lista.v)) return out;
  for (const it of lista.v.items) {
    if (!it.k || !esBloque(it.v)) continue;
    const locs = [];
    for (const x of it.v.items) if (x.k && /^own_/.test(x.k) && esBloque(x.v)) for (const y of x.v.items) if (y.k === null && typeof y.v === 'string') locs.push(y.v);
    if (locs.length) out.set(it.k, locs);
  }
  return out;
}

// ---------------------------------------------------------------- vecindad desde locations.png
// Cada localizacion tiene un color en map_data/named_locations/*.txt (nombre = rrggbb). Dos
// localizaciones son vecinas si sus colores se tocan en locations.png (izquierda o arriba).
// Se lee el PNG a trozos (el crudo pesa ~400 MB) y se guarda en cache por huella del fichero.
function coloresDeLocalizaciones(dir, juego) {
  const d = enMundo(dir, juego, 'in_game', 'map_data', 'named_locations');
  if (!d) throw new Error('no encuentro map_data/named_locations');
  const porColor = new Map();
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.txt')).sort()) {
    for (const m of leeTexto(path.join(d, f)).texto.matchAll(/^\s*([A-Za-z0-9_\-.]+)\s*=\s*"?([0-9a-fA-F]{6})"?/gm)) porColor.set(parseInt(m[2], 16), m[1]);
  }
  return porColor;
}

async function bordesDePng(fichero) {
  const buf = fs.readFileSync(fichero);
  if (buf.readUInt32BE(12) !== 0x49484452) throw new Error(`${fichero} no es un PNG`);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20), prof = buf[24], tipo = buf[25], entrelazado = buf[28];
  if (prof !== 8 || ![2, 6].includes(tipo) || entrelazado) throw new Error(`${fichero}: formato PNG no previsto (bits ${prof}, tipo ${tipo}, entrelazado ${entrelazado})`);
  const bpp = tipo === 6 ? 4 : 3, ancho = w * bpp;
  const idat = [];
  for (let o = 8; o < buf.length;) {
    const n = buf.readUInt32BE(o), t = buf.toString('ascii', o + 4, o + 8);
    if (t === 'IDAT') idat.push(buf.subarray(o + 8, o + 8 + n));
    o += 12 + n;
  }
  const pares = new Map(); // color -> Set(color)
  const acum = new Map(); // color -> [suma x, suma y, pixeles]: el centro de cada localizacion
  const suma = (col, x0, x1, y) => { const n = x1 - x0 + 1; let a = acum.get(col); if (!a) acum.set(col, a = [0, 0, 0]); a[0] += (x0 + x1) * n / 2; a[1] += y * n; a[2] += n; };
  const anota = (a, b) => { if (!pares.has(a)) pares.set(a, new Set()); pares.get(a).add(b); if (!pares.has(b)) pares.set(b, new Set()); pares.get(b).add(a); };
  let prev = Buffer.alloc(ancho), cur = Buffer.alloc(ancho), prevColor = new Int32Array(w), curColor = new Int32Array(w);
  let fila = 0, pos = -1; // pos -1: toca leer el byte de filtro
  let filtro = 0;
  const procesaFila = () => {
    // quitar el filtro
    for (let i = 0; i < ancho; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let x = cur[i];
      if (filtro === 1) x += a; else if (filtro === 2) x += b; else if (filtro === 3) x += (a + b) >> 1;
      else if (filtro === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); x += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = x & 255;
    }
    let ultimoA = -1, ultimoB = -1, ini = 0;
    for (let x = 0, i = 0; x < w; x++, i += bpp) {
      const col = (cur[i] << 16) | (cur[i + 1] << 8) | cur[i + 2];
      curColor[x] = col;
      if (x > 0 && curColor[x - 1] !== col) { suma(curColor[x - 1], ini, x - 1, fila); ini = x; }
      if (x > 0 && curColor[x - 1] !== col && !(ultimoA === curColor[x - 1] && ultimoB === col)) { anota(curColor[x - 1], col); ultimoA = curColor[x - 1]; ultimoB = col; }
      if (fila > 0 && prevColor[x] !== col) anota(prevColor[x], col);
    }
    suma(curColor[w - 1], ini, w - 1, fila);
    [prev, cur] = [cur, prev];
    [prevColor, curColor] = [curColor, prevColor];
    fila++;
  };
  await pipeline(Readable.from(idat), zlib.createInflate(), new Writable({
    write(trozo, _, listo) {
      for (let k = 0; k < trozo.length; k++) {
        if (pos < 0) { filtro = trozo[k]; pos = 0; continue; }
        cur[pos++] = trozo[k];
        if (pos === ancho) { procesaFila(); pos = -1; }
      }
      listo();
    },
  }));
  if (fila !== h) throw new Error(`${fichero}: lei ${fila} filas de ${h}`);
  return { pares, acum, w, h };
}

// Lee locations.png una vez y deja en cache la vecindad y el centro (pixel medio) de cada
// localizacion, por huella del fichero.
async function leeLocalizaciones(dir, juego) {
  const png = enMundo(dir, juego, 'in_game', 'map_data', 'locations.png');
  if (!png) throw new Error('no encuentro map_data/locations.png');
  const st = fs.statSync(png);
  const huella = crypto.createHash('sha256').update(`${path.resolve(png)}|${st.size}|${st.mtimeMs}`).digest('hex').slice(0, 16);
  const cV = path.join(AQUI, 'cache', `vecinos-${huella}.json`), cC = path.join(AQUI, 'cache', `centros-${huella}.json`);
  return { cV, cC, calcula: async () => {
    const porColor = coloresDeLocalizaciones(dir, juego);
    const { pares, acum, w, h } = await bordesDePng(png);
    const out = new Map();
    for (const [a, bs] of pares) {
      const la = porColor.get(a); if (!la) continue;
      for (const b of bs) { const lb = porColor.get(b); if (lb && lb !== la) { if (!out.has(la)) out.set(la, new Set()); out.get(la).add(lb); } }
    }
    const cen = { _tamano: [w, h] };
    for (const [c, [sx, sy, n]] of acum) { const l = porColor.get(c); if (l) cen[l] = [Math.round(sx / n * 10) / 10, Math.round(sy / n * 10) / 10, n]; }
    fs.mkdirSync(path.dirname(cV), { recursive: true });
    fs.writeFileSync(cV, JSON.stringify(Object.fromEntries([...out].map(([k, v]) => [k, [...v].sort()]))));
    fs.writeFileSync(cC, JSON.stringify(cen));
  } };
}

// Filas de un PNG de 8 bits sin entrelazar (RGB, RGBA o con paleta), ya sin filtro: alFila(fila, y).
async function filasDePng(fichero, alFila) {
  const buf = fs.readFileSync(fichero);
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20), prof = buf[24], tipo = buf[25];
  if (prof !== 8 || ![2, 3, 6].includes(tipo) || buf[28]) throw new Error(`${fichero}: formato PNG no previsto`);
  const bpp = tipo === 6 ? 4 : tipo === 2 ? 3 : 1, ancho = w * bpp, idat = [];
  for (let o = 8; o < buf.length;) { const n = buf.readUInt32BE(o); if (buf.toString('ascii', o + 4, o + 8) === 'IDAT') idat.push(buf.subarray(o + 8, o + 8 + n)); o += 12 + n; }
  let prev = Buffer.alloc(ancho), cur = Buffer.alloc(ancho), fila = 0, pos = -1, filtro = 0;
  await pipeline(Readable.from(idat), zlib.createInflate(), new Writable({
    write(trozo, _, listo) {
      for (let k = 0; k < trozo.length; k++) {
        if (pos < 0) { filtro = trozo[k]; pos = 0; continue; }
        cur[pos++] = trozo[k];
        if (pos === ancho) {
          for (let i = 0; i < ancho; i++) {
            const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
            let x = cur[i];
            if (filtro === 1) x += a; else if (filtro === 2) x += b; else if (filtro === 3) x += (a + b) >> 1;
            else if (filtro === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); x += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
            cur[i] = x & 255;
          }
          alFila(cur, fila++); [prev, cur] = [cur, prev]; pos = -1;
        }
      }
      listo();
    },
  }));
  return { w, h };
}

// Rios de cada localizacion (map_data/rivers.png, del mismo tamano que locations.png): los
// indices 3-11 de la paleta son rio, de mas estrecho a mas ancho (0-2: nacimiento, union y
// division; 254-255: nada). Map(loc -> [pixeles de rio, indice de anchura maximo]), en cache.
export async function rios(dir, juego = juegoPorDefecto()) {
  const fR = enMundo(dir, juego, 'in_game', 'map_data', 'rivers.png'), fL = enMundo(dir, juego, 'in_game', 'map_data', 'locations.png');
  if (!fR || !fL) return new Map();
  const st = [fR, fL].map((f) => fs.statSync(f));
  const huella = crypto.createHash('sha256').update(`${path.resolve(fR)}|${st[0].size}|${st[0].mtimeMs}|${st[1].size}|${st[1].mtimeMs}`).digest('hex').slice(0, 16);
  const cR = path.join(AQUI, 'cache', `rios-${huella}.json`);
  if (!fs.existsSync(cR)) {
    let riv = null, wR = 0;
    await filasDePng(fR, (f, y) => { if (!riv) { wR = f.length; riv = new Uint8Array(f.length * 8192); } if ((y + 1) * wR > riv.length) { const n = new Uint8Array(riv.length * 2); n.set(riv); riv = n; } riv.set(f, y * wR); });
    const acc = new Map(); // color -> [pixeles, ancho maximo]
    await filasDePng(fL, (f, y) => {
      for (let x = 0, o = y * wR; x < wR; x++) {
        const r = riv[o + x]; if (r < 3 || r > 11) continue;
        const col = (f[x * 3] << 16) | (f[x * 3 + 1] << 8) | f[x * 3 + 2];
        const a = acc.get(col); if (a) { a[0]++; if (r > a[1]) a[1] = r; } else acc.set(col, [1, r]);
      }
    });
    const porColor = coloresDeLocalizaciones(dir, juego), out = {};
    for (const [c, a] of acc) { const l = porColor.get(c); if (l) out[l] = a; }
    fs.mkdirSync(path.dirname(cR), { recursive: true });
    fs.writeFileSync(cR, JSON.stringify(out));
  }
  return new Map(Object.entries(JSON.parse(fs.readFileSync(cR, 'utf8'))));
}

// Centro de cada localizacion en pixeles de locations.png: Map(loc -> [x, y, pixeles]).
// El tamano del mapa va en la clave _tamano.
export async function centros(dir, juego = juegoPorDefecto()) {
  const { cC, calcula } = await leeLocalizaciones(dir, juego);
  if (!fs.existsSync(cC)) await calcula();
  return new Map(Object.entries(JSON.parse(fs.readFileSync(cC, 'utf8'))));
}

export async function vecinos(dir, juego = juegoPorDefecto()) {
  const { cV, calcula } = await leeLocalizaciones(dir, juego);
  if (!fs.existsSync(cV)) await calcula();
  return new Map(Object.entries(JSON.parse(fs.readFileSync(cV, 'utf8'))).map(([k, v]) => [k, new Set(v)]));
}
