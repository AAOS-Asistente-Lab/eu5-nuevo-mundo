// comprueba-paises.mjs: lee el setup de paises del montaje (la copia de 10_countries del mod y los
// ficheros del setup que nombran paises; sin copia, los del mundo) y falla si
//   (a) algun pais del Nuevo Mundo queda dentro de otro (enclaves() de reparte-paises.mjs),
//   (b) alguno pasa de TALLA_MAXIMA localizaciones, salvo los de SIN_TOPE (Kaivan),
//   (d) algun tag del setup nombra un pais que no tiene bloque en 10_countries,
//   (e) la capital de algun pais con tierra en el Nuevo Mundo no es suya,
//   (f) alguna localizacion de America con dueno sigue en un add_pops_from_locations,
//   (g) alguna localizacion del Nuevo Mundo no es de nadie ni de ninguna tribu, o 07 (rango,
//       town_setup, edificio) o 03 (add_market) ponen algo en una sin dueno.
// (c) Si la talla media (sin Kaivan) sale de MEDIA, avisa con la cifra. Imprime la tabla de tamanos.
// Uso: node comprueba-paises.mjs --mundo <carpeta> --mod <mod> [--juego <carpeta>] [--vinculo <json>]
import fs from 'node:fs';
import path from 'node:path';
import { juegoPorDefecto, leeTexto } from './pdx.mjs';
import { cargaMundo, centros, vecinos } from './mundo.mjs';
import { enclaves, TALLA_MAXIMA, SIN_TOPE } from './reparte-paises.mjs';
import { tierraDe, tagsDeLinea, locDeLinea, EDIFICIOS, MERCADOS } from './setup-paises.mjs';

export const MEDIA = [100, 120];

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
if (!arg('--mundo') || !arg('--mod')) { console.error('Uso: node comprueba-paises.mjs --mundo <carpeta> --mod <mod>'); process.exit(2); }
const MUNDO = path.resolve(arg('--mundo')), MOD = path.resolve(arg('--mod')), JUEGO = path.resolve(arg('--juego', juegoPorDefecto()));
const RV = path.resolve(arg('--vinculo', path.join(MOD, '..', 'vinculo.json')));
const vinculo = fs.existsSync(RV) ? JSON.parse(fs.readFileSync(RV, 'utf8')) : {};
const SETUP = path.join('main_menu', 'setup', '1337');
const deSetup = (f) => [MOD, MUNDO, JUEGO].map((d) => path.join(d, SETUP, f)).find((r) => fs.existsSync(r));

const mw = cargaMundo({ juego: JUEGO, mundo: MUNDO });
const cen = await centros(MUNDO, JUEGO), vec = await vecinos(MUNDO, JUEGO);
const nm = new Set(mw.locsAmerica.filter((l) => cen.has(l)));
const f10 = deSetup('10_countries.txt');
const paises = tierraDe(leeTexto(f10).texto);
const errores = [], avisos = [];

// tierra del Nuevo Mundo de cada pais
const dueno = new Map();
for (const [t, p] of paises) for (const l of p.own) if (nm.has(l)) { if (dueno.has(l) && dueno.get(l) !== t) errores.push(`${l} esta en la tierra de ${dueno.get(l)} y de ${t}`); dueno.set(l, t); }
const suyas = new Map();
for (const [l, t] of dueno) suyas.set(t, (suyas.get(t) || 0) + 1);
const exentos = new Set(SIN_TOPE.map((k) => vinculo.paises?.[k]).filter(Boolean));
if (!exentos.size) avisos.push(`no encuentro el tag de ${SIN_TOPE.join(', ')} en ${RV}: nadie queda exento del tope`);
const nombreDe = new Map([...Object.entries(vinculo.paises || {}), ...Object.entries(vinculo.menores || {})].map(([k, t]) => [t, k]));

// (a) dentro de otro
for (const e of enclaves(dueno, vec, nm, mw.costa)) errores.push(`(a) ${e.tag} esta dentro de ${e.dentroDe}`);
// (b) tope y (c) media
for (const [t, n] of suyas) if (n > TALLA_MAXIMA && !exentos.has(t)) errores.push(`(b) ${t} tiene ${n} localizaciones (tope ${TALLA_MAXIMA})`);
const tallas = [...suyas].filter(([t]) => !exentos.has(t)).map(([, n]) => n);
const media = tallas.reduce((s, n) => s + n, 0) / (tallas.length || 1);
if (media < MEDIA[0] || media > MEDIA[1]) avisos.push(`(c) la talla media sin ${SIN_TOPE.join(', ')} es ${media.toFixed(1)}: fuera de ${MEDIA[0]}-${MEDIA[1]}`);
// (d) tags que nombran paises sin bloque
const ficheros = [...new Set([MOD, MUNDO].flatMap((d) => (fs.existsSync(path.join(d, SETUP)) ? fs.readdirSync(path.join(d, SETUP)) : [])))].filter((f) => f.endsWith('.txt') && f !== '10_countries.txt').sort();
for (const f of ficheros) {
  const colgantes = new Map();
  leeTexto(deSetup(f)).texto.split('\n').forEach((linea, i) => { for (const t of tagsDeLinea(linea)) if (!paises.has(t) && !colgantes.has(t)) colgantes.set(t, i + 1); });
  for (const [t, l] of colgantes) errores.push(`(d) ${f}:${l} nombra ${t}, que no tiene bloque en 10_countries`);
}
// (e) capitales
for (const [t] of suyas) { const c = paises.get(t).capital; if (dueno.get(c) !== t) errores.push(`(e) la capital de ${t} (${c ?? 'ninguna'}) no es suya${c && dueno.has(c) ? `: es de ${dueno.get(c)}` : ''}`); }
// (f) tierra con dueno en una lista de pops
const conDueno = new Set([...paises.values()].flatMap((p) => p.own));
let enPops = 0, ejemplo = null;
for (const [t, p] of paises) for (const l of p.pops) if (conDueno.has(l) && mw.jer.get(l)?.continente === 'america') { enPops++; ejemplo ??= `${l} en ${t}`; }
if (enPops) errores.push(`(f) ${enPops} localizaciones de America con dueno siguen en un add_pops_from_locations (p. ej. ${ejemplo})`);
// (g) tierra sin dueno: toda localizacion del Nuevo Mundo es de un pais o de una tribu, y ni 07 ni 03 ponen nada en una sin dueno
const enTribu = new Set([...paises.values()].flatMap((p) => p.pops));
const sueltas = [...nm].filter((l) => !conDueno.has(l) && !enTribu.has(l)).sort();
if (sueltas.length) errores.push(`(g) ${sueltas.length} localizaciones del Nuevo Mundo sin dueno ni tribu (p. ej. ${sueltas.slice(0, 3).join(' ')})`);
for (const f of [EDIFICIOS, MERCADOS]) {
  const malas = [];
  leeTexto(deSetup(f)).texto.split('\n').forEach((linea, i) => { const l = locDeLinea(linea); if (nm.has(l) && !conDueno.has(l)) malas.push(`${f}:${i + 1} ${l}`); });
  if (malas.length) errores.push(`(g) ${malas.length} lineas de ${f} en tierra sin dueno (p. ej. ${malas.slice(0, 3).join(', ')})`);
}

// tabla
const filas = [...suyas].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
console.log(`Paises con tierra en el Nuevo Mundo: ${filas.length}, con ${dueno.size} de ${nm.size} localizaciones (${(100 * dueno.size / nm.size).toFixed(1)} %). Media sin ${SIN_TOPE.join(', ')}: ${media.toFixed(1)}. Fichero: ${path.relative(process.cwd(), f10)}\n`);
console.log('| Tag | Faccion o menor | Localizaciones | Capital |\n|---|---|---|---|');
for (const [t, n] of filas) console.log(`| ${t} | ${nombreDe.get(t) || '-'} | ${n}${exentos.has(t) ? ' (sin tope)' : ''} | ${paises.get(t).capital} |`);
console.log('');
for (const a of avisos) console.log(`AVISO ${a}`);
for (const e of errores) console.log(`ERROR ${e}`);
console.log(`RESULTADO: ${errores.length ? 'FALLA' : 'PASA'} (${errores.length} errores, ${avisos.length} avisos)`);
process.exit(errores.length ? 1 : 0);
