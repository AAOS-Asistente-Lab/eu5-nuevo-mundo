// Comprueba UNA parte dentro del mod fundido: funde todas las partes en una carpeta temporal
// propia (eu5-mundo/tmp-parte-<clave>/, asi varias comprobaciones a la vez no se pisan), pasa
// comprueba-mod.mjs y enseña solo los errores de los ficheros de esa parte. No toca
// eu5-mundo/mod ni las partes.
// Uso: node comprueba-parte.mjs <clave> [--partes <carpeta>] [--conserva] [--avisos]
// Sale con 0 si la parte no tiene errores y con 1 si tiene.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listaFicheros } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const CLAVE = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--partes'));
const PARTES = path.resolve(arg('--partes', path.join(RAIZ, 'partes')));
if (!CLAVE) { console.error('uso: node comprueba-parte.mjs <clave>   (la carpeta de partes/<clave>)'); process.exit(2); }
const BASE = path.join(PARTES, CLAVE);
if (!fs.existsSync(BASE)) { console.error(`no existe ${BASE}`); process.exit(2); }

const OBRA = path.join(RAIZ, `tmp-parte-${CLAVE}`);
const MOD = path.join(OBRA, 'gj_nuevo_mundo');
fs.rmSync(OBRA, { recursive: true, force: true });
fs.mkdirSync(MOD, { recursive: true });
fs.cpSync(path.join(RAIZ, 'mod', 'gj_nuevo_mundo', '.metadata'), path.join(MOD, '.metadata'), { recursive: true });
const corre = (script, extra) => spawnSync(process.execPath, [path.join(AQUI, script), ...extra], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const fu = corre('funde-partes.mjs', ['--mod', MOD, '--partes', PARTES, '--vinculo', path.join(OBRA, 'sin-vinculo.json'), '--informe', path.join(OBRA, 'INTEGRACION.md')]);
if (fu.status !== 0) { console.log((fu.stdout || '') + (fu.stderr || '')); console.log(`RESULTADO ${CLAVE}: el fundido ha fallado (mira arriba)`); process.exit(1); }
const fallosFundido = ((fu.stdout || '').match(/^ERROR.*$/gm) || []).filter((l) => l.includes(CLAVE));
const co = corre('comprueba-mod.mjs', ['--mod', MOD]);
const salida = (co.stdout || '') + (co.stderr || '');

const mios = new Set(listaFicheros(BASE).map((f) => path.relative(BASE, f).split(path.sep).join('/')));
const deLaParte = (l) => { const m = l.match(/^(?:ERROR|AVISO) ([^:]+?)(?::\d+)?: /); return m && mios.has(m[1]); };
const errores = salida.split('\n').filter((l) => l.startsWith('ERROR ') && deLaParte(l));
const avisos = salida.split('\n').filter((l) => l.startsWith('AVISO ') && deLaParte(l));
const textos = errores.filter((l) => /falta la localizacion|esta en (spanish|english) y no en/.test(l)).length;
for (const l of fallosFundido) console.log(l);
if (args.includes('--avisos')) for (const l of avisos) console.log(l);
for (const l of errores) console.log(l);
if (/^No encuentro|Error:/m.test(salida) && !errores.length) console.log(salida.split('\n').slice(-15).join('\n'));
console.log(`RESULTADO ${CLAVE}: ${errores.length ? 'FALLA' : 'PASA'} (${errores.length} errores: ${textos} textos que faltan y ${errores.length - textos} otros; ${avisos.length} avisos${args.includes('--avisos') ? '' : ', verlos con --avisos'})`);
if (!args.includes('--conserva')) fs.rmSync(OBRA, { recursive: true, force: true });
process.exit(errores.length || fallosFundido.length ? 1 : 0);
