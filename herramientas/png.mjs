// png.mjs: lector minimo de PNG (8 bits, sin entrelazar; gris, RGB, paleta, con o sin alfa).
//   readPngFile(ruta) -> { width, height, rgba: Buffer de 4 bytes por pixel }
import fs from 'node:fs';
import zlib from 'node:zlib';

export function readPngFile(ruta) {
  const b = fs.readFileSync(ruta);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${ruta}: no es un PNG`);
  let width, height, tipo, paleta, trns;
  const idat = [];
  for (let p = 8; p < b.length;) {
    const n = b.readUInt32BE(p), nombre = b.toString('latin1', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + n);
    if (nombre === 'IHDR') {
      width = d.readUInt32BE(0); height = d.readUInt32BE(4); tipo = d[9];
      if (d[8] !== 8 || d[12] !== 0) throw new Error(`${ruta}: solo leo PNG de 8 bits sin entrelazar`);
    } else if (nombre === 'PLTE') paleta = d;
    else if (nombre === 'tRNS') trns = d;
    else if (nombre === 'IDAT') idat.push(d);
    p += 12 + n;
  }
  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo];
  if (!canales) throw new Error(`${ruta}: tipo de color ${tipo} desconocido`);
  const crudo = zlib.inflateSync(Buffer.concat(idat));
  const fila = width * canales;
  const pix = Buffer.alloc(fila * height);
  for (let y = 0; y < height; y++) {
    const f = crudo[y * (fila + 1)], o = y * (fila + 1) + 1, s = y * fila;
    for (let x = 0; x < fila; x++) {
      const a = x >= canales ? pix[s + x - canales] : 0, u = y ? pix[s + x - fila] : 0, c = x >= canales && y ? pix[s + x - fila - canales] : 0;
      let pr = 0;
      if (f === 1) pr = a; else if (f === 2) pr = u; else if (f === 3) pr = (a + u) >> 1;
      else if (f === 4) { const q = a + u - c, pa = Math.abs(q - a), pb = Math.abs(q - u), pc = Math.abs(q - c); pr = pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
      pix[s + x] = (crudo[o + x] + pr) & 255;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += 4) {
    const q = i * canales;
    if (tipo === 3) { const k = pix[q]; rgba[j] = paleta[3 * k]; rgba[j + 1] = paleta[3 * k + 1]; rgba[j + 2] = paleta[3 * k + 2]; rgba[j + 3] = trns && k < trns.length ? trns[k] : 255; }
    else if (tipo === 0 || tipo === 4) { rgba[j] = rgba[j + 1] = rgba[j + 2] = pix[q]; rgba[j + 3] = tipo === 4 ? pix[q + 1] : 255; }
    else { rgba[j] = pix[q]; rgba[j + 1] = pix[q + 1]; rgba[j + 2] = pix[q + 2]; rgba[j + 3] = tipo === 6 ? pix[q + 3] : 255; }
  }
  return { width, height, rgba };
}
