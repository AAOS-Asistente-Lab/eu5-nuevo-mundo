// Lector del formato de script de Paradox (EU5 1.4.9): tokens, arbol y utilidades.
// Sin dependencias. Lo usan comprueba-mod.mjs, asigna-ostrevar.mjs y prepara-mod.mjs.
import fs from 'node:fs';
import path from 'node:path';

export const BOM = '﻿';

// Ajustes de esta maquina, que no van al repo: herramientas/local.json, por ejemplo
// { "juego": "<carpeta game de EU5>", "nombres_privados": ["nombre1", "nombre2"] }
export const LOCAL = (() => { try { return JSON.parse(fs.readFileSync(new URL('./local.json', import.meta.url), 'utf8').replace(/^﻿/, '')); } catch { return {}; } })();

// Carpeta game de EU5: --juego (en cada herramienta), EU5_JUEGO, local.json o Steam en su sitio.
export function juegoPorDefecto() {
  const j = process.env.EU5_JUEGO || LOCAL.juego;
  if (j) return j;
  for (const base of [process.env['ProgramFiles(x86)'], process.env.ProgramFiles].filter(Boolean)) {
    const c = path.join(base, 'Steam', 'steamapps', 'common', 'Europa Universalis V', 'game');
    if (fs.existsSync(c)) return c;
  }
  console.error('No encuentro EU5: pasa --juego <carpeta game>, define EU5_JUEGO o pon "juego" en herramientas/local.json.');
  process.exit(2);
}

export function leeTexto(ruta) {
  const buf = fs.readFileSync(ruta);
  const tieneBom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
  const texto = buf.toString('utf8');
  return { texto: tieneBom ? texto.slice(1) : texto, tieneBom };
}

export class ErrorPdx extends Error {
  constructor(msg, linea) { super(`linea ${linea}: ${msg}`); this.linea = linea; }
}

// Tokens: { t: 'abre'|'cierra'|'op'|'pal'|'cad', v, l }
// Una sola expresion regular "pegajosa": mucho mas rapida que ir caracter a caracter.
const RE_TOK = /([ \t\r]+)|(\n)|(#[^\n]*)|(\{)|(\})|("(?:[^"\\]|\\.)*")|(>=|<=|!=|\?=|==|=|>|<)|([^\s{}=<>!?#"]+)|(")|([\s\S])/y;
export function tokeniza(texto) {
  const toks = [];
  let l = 1;
  RE_TOK.lastIndex = 0;
  let m;
  while (RE_TOK.lastIndex < texto.length && (m = RE_TOK.exec(texto))) {
    if (m[1] || m[3]) continue;
    if (m[2]) { l++; continue; }
    if (m[4]) { toks.push({ t: 'abre', v: '{', l }); continue; }
    if (m[5]) { toks.push({ t: 'cierra', v: '}', l }); continue; }
    if (m[6]) {
      const crudo = m[6].slice(1, -1);
      toks.push({ t: 'cad', v: crudo.replace(/\\(.)/g, '$1'), l });
      l += (crudo.match(/\n/g) || []).length;
      continue;
    }
    if (m[7]) { toks.push({ t: 'op', v: m[7], l }); continue; }
    if (m[8]) { toks.push({ t: 'pal', v: m[8], l }); continue; }
    if (m[9]) throw new ErrorPdx('cadena sin cerrar', l);
    throw new ErrorPdx(`caracter inesperado '${m[10]}'`, l);
  }
  return toks;
}

// Arbol: bloque = { tipo: 'bloque', items: [...], l }
// item = { k, op, v, l } (v: string | bloque | { tipo:'color', modo, bloque }) o { k: null, v, l } (valor suelto).
export function analiza(texto) {
  const toks = tokeniza(texto);
  let p = 0;
  function bloque(lAbre, raiz) {
    const items = [];
    while (true) {
      const tk = toks[p];
      if (!tk) {
        if (raiz) return { tipo: 'bloque', items, l: lAbre };
        throw new ErrorPdx('llave { sin cerrar', lAbre);
      }
      if (tk.t === 'cierra') {
        if (raiz) throw new ErrorPdx('llave } de mas', tk.l);
        p++; return { tipo: 'bloque', items, l: lAbre };
      }
      if (tk.t === 'abre') { p++; items.push({ k: null, v: bloque(tk.l, false), l: tk.l }); continue; }
      if (tk.t === 'op') throw new ErrorPdx(`operador '${tk.v}' sin clave`, tk.l);
      const sig = toks[p + 1];
      if (sig && sig.t === 'op') {
        p += 2;
        const val = toks[p];
        if (!val || val.t === 'cierra' || val.t === 'op') throw new ErrorPdx(`'${tk.v} ${sig.v}' sin valor`, sig.l);
        if (val.t === 'abre') { p++; items.push({ k: tk.v, op: sig.v, v: bloque(val.l, false), l: tk.l }); continue; }
        p++;
        const tras = toks[p];
        if (val.t === 'pal' && tras && tras.t === 'abre' && /^(rgb|hsv|hsv360)$/.test(val.v)) {
          p++; items.push({ k: tk.v, op: sig.v, v: { tipo: 'color', modo: val.v, bloque: bloque(tras.l, false) }, l: tk.l }); continue;
        }
        items.push({ k: tk.v, op: sig.v, v: val.v, cad: val.t === 'cad', l: tk.l });
        continue;
      }
      p++;
      items.push({ k: null, v: tk.v, cad: tk.t === 'cad', l: tk.l });
    }
  }
  return bloque(1, true);
}

export function analizaFichero(ruta) {
  const { texto, tieneBom } = leeTexto(ruta);
  return { arbol: analiza(texto), tieneBom, texto };
}

export const esBloque = (v) => v && typeof v === 'object' && v.tipo === 'bloque';
export const hijos = (b, k) => (esBloque(b) ? b.items.filter((it) => it.k === k) : []);
export const hijo = (b, k) => hijos(b, k)[0];
export const valoresSueltos = (b) => (esBloque(b) ? b.items.filter((it) => it.k === null && typeof it.v === 'string').map((it) => it.v) : []);

// Recorre todos los items de un arbol; visita(item, pila de claves de los padres).
export function recorre(b, visita, pila = []) {
  if (!esBloque(b)) return;
  for (const it of b.items) {
    visita(it, pila);
    if (esBloque(it.v)) recorre(it.v, visita, [...pila, it.k]);
    else if (it.v && it.v.tipo === 'color') recorre(it.v.bloque, visita, [...pila, it.k]);
  }
}

export function listaFicheros(dir, filtro = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const pila = [dir];
  while (pila.length) {
    const d = pila.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const r = path.join(d, e.name);
      if (e.isDirectory()) pila.push(r);
      else if (filtro(r)) out.push(r);
    }
  }
  return out.sort();
}

// Claves de primer nivel de todos los .txt de una carpeta (sin prefijos REPLACE:/INJECT:...).
export function clavesDePrimerNivel(dir) {
  const claves = new Set();
  for (const f of listaFicheros(dir, (r) => r.endsWith('.txt'))) {
    let arbol;
    try { arbol = analizaFichero(f).arbol; } catch { continue; }
    for (const it of arbol.items) if (it.k) claves.add(it.k.replace(/^(REPLACE|INJECT|TRY_INJECT|TRY_REPLACE|REPLACE_OR_CREATE|INJECT_OR_CREATE):/, ''));
  }
  return claves;
}

export function escribeConBom(ruta, texto) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, BOM + texto.replace(/^﻿/, ''), 'utf8');
}
