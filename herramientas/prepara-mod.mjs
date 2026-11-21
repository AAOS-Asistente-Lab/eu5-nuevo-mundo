// Prepara el esqueleto del mod gj_nuevo_mundo: el descriptor .metadata/metadata.json,
// la miniatura y el BOM en todo .txt, .yml y .json. El contenido lo pone funde-partes.mjs.
// Uso: node prepara-mod.mjs [--mod <carpeta>] [--version 0.1.0]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { BOM, escribeConBom, listaFicheros } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MOD = path.resolve(arg('--mod', path.join(AQUI, '..', 'mod', 'gj_nuevo_mundo')));
const VERSION = arg('--version', '0.1.0');

// 1. Descriptor
const meta = {
  name: 'GJ Nuevo Mundo',
  id: 'gj_nuevo_mundo',
  version: VERSION,
  game_id: 'eu5',
  supported_game_version: '1.4.*',
  short_description: 'Facciones propias para un Nuevo Mundo de Random New World. Doce facciones con cultura, religion y eventos propios.',
  tags: ['Events', 'Gameplay'],
  relationships: [],
  game_custom_data: {},
};
const rutaMeta = path.join(MOD, '.metadata/metadata.json');
if (fs.existsSync(rutaMeta)) {
  // Conserva la dependencia al mundo que haya puesto asigna-facciones.mjs.
  const viejo = JSON.parse(fs.readFileSync(rutaMeta, 'utf8').replace(/^﻿/, ''));
  if (Array.isArray(viejo.relationships)) meta.relationships = viejo.relationships;
}
escribeConBom(rutaMeta, JSON.stringify(meta, null, 4) + '\n');

// 2. Miniatura 512x512: un valle de montanas al anochecer y la Primera Piedra.
function png(ancho, alto, pixel) {
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const trozo = (tipo, datos) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(datos.length);
    const td = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([l, td, c]);
  };
  const crudo = Buffer.alloc((ancho * 3 + 1) * alto);
  for (let y = 0; y < alto; y++) {
    crudo[y * (ancho * 3 + 1)] = 0;
    for (let x = 0; x < ancho; x++) {
      const [r, g, b] = pixel(x, y);
      const o = y * (ancho * 3 + 1) + 1 + x * 3;
      crudo[o] = r; crudo[o + 1] = g; crudo[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0); ihdr.writeUInt32BE(alto, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ihdr), trozo('IDAT', zlib.deflateSync(crudo, { level: 9 })), trozo('IEND', Buffer.alloc(0))]);
}
const mezcla = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const imagen = png(512, 512, (x, y) => {
  const cielo = mezcla([38, 52, 78], [196, 150, 112], Math.min(1, y / 330));
  const lejos = 300 - 70 * Math.sin(x / 70) - 40 * Math.sin(x / 23 + 1);
  const cerca = 360 - 50 * Math.cos(x / 95 + 0.5) - 18 * Math.sin(x / 17);
  let c = cielo;
  if (y > lejos) c = mezcla([70, 84, 104], [52, 62, 80], (y - lejos) / 200);
  if (y > cerca) c = mezcla([58, 72, 60], [34, 44, 38], Math.min(1, (y - cerca) / 150));
  const dx = x - 256;
  const enPiedra = y < 440 && Math.abs(dx) < 40 && (y >= 270 || dx * dx + (y - 270) * (y - 270) < 1600);
  if (enPiedra) c = mezcla([214, 196, 160], [150, 130, 102], Math.abs(dx) / 40);
  return c;
});
fs.writeFileSync(path.join(MOD, '.metadata/thumbnail.png'), imagen);

// 3. BOM en todo .txt, .yml y .json del mod
let puestos = 0;
for (const f of listaFicheros(MOD, (r) => /\.(txt|yml|json)$/.test(r))) {
  const t = fs.readFileSync(f, 'utf8');
  if (!t.startsWith(BOM)) { fs.writeFileSync(f, BOM + t, 'utf8'); puestos++; }
}
console.log(`prepara-mod: metadata ${VERSION}, miniatura ${imagen.length} bytes, BOM puesto en ${puestos} ficheros.`);
