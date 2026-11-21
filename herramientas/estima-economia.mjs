// estima-economia.mjs: los indicadores de la economia de salida (economia.mjs) de cada pais del Nuevo
// Mundo del mod montado y de los europeos de 60-150 localizaciones del setup del juego, con la misma
// cuenta, y un indice comparable (cifraPais; no es la base fiscal del juego, que solo se ve en partida).
// Uso: node herramientas/estima-economia.mjs --mundo <mundo RNW> [--mod tmp-instalar/gj_nuevo_mundo] [--juego <game>]
//      [--europa 60-150] [--muestra POL,POR,...]   Sale con 1 si algun pais nuestro queda fuera del rango europeo.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { juegoPorDefecto, leeTexto } from './pdx.mjs';
import { cargaMundo, vecinos } from './mundo.mjs';
import * as E from './economia.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const JUEGO = path.resolve(arg('--juego') ?? juegoPorDefecto());
const MUNDO = path.resolve(arg('--mundo'));
const MOD = path.resolve(arg('--mod', path.join(AQUI, '..', 'tmp-instalar', 'gj_nuevo_mundo')));
const [EMIN, EMAX] = arg('--europa', '60-150').split('-').map(Number);
const MUESTRA = arg('--muestra', 'POL,POR,SER,ENG,ARA,HUN,DAN,BOH').split(',');

function lado(dirs, jer, vec, vale) {
  const t = (f) => leeTexto(E.primero(dirs, 'main_menu', 'setup', '1337', f)).texto;
  const pops = E.leePops(t('06_pops.txt')), rangos = E.leeRangos(t('07_cities_and_buildings.txt')), caminos = E.leeCaminos(t('09_roads.txt'));
  const mercados = E.leeMercados(t('03_markets.txt')), reglas = E.leeReglas(t('14_development.txt'));
  const niveles = E.leeNiveles(dirs), plant = E.leePlantillas(dirs), conC = new Set(caminos.flat());
  const devDe = (l) => Math.max(0, E.desarrolloReglas(l, { reglas, jer, plant, rango: rangos.get(l)?.rango, camino: conC.has(l) }));
  return [...E.leePaises(dirs)].filter(([tag, p]) => vale(tag, p)).sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([tag, pais]) => E.indicadores({ tag, pais, pops, rangos, niveles, caminos, mercados, devDe, vec }));
}

const jerJ = cargaMundo({ juego: JUEGO, vanilla: true }).jer;
const europa = lado([JUEGO], jerJ, await vecinos(JUEGO, JUEGO), (tag, p) => jerJ.get(p.capital)?.continente === 'europe' && ((p.locs.length >= EMIN && p.locs.length <= EMAX) || MUESTRA.includes(tag)));
// el rango: los de la muestra con la talla pedida (los europeos medianos); los demas de esa talla, para ver
const ref = europa.filter((x) => x.n >= EMIN && x.n <= EMAX && MUESTRA.includes(x.tag));
const jerM = cargaMundo({ juego: JUEGO, mundo: MUNDO }).jer;
const nuestros = lado([MOD, MUNDO, JUEGO], jerM, await vecinos(MUNDO, JUEGO), (tag, p) => jerM.get(p.capital)?.continente === 'america');

const COL = [['tag', 'Pais'], ['n', 'Locs'], ['popLoc', 'Gente/loc'], ['noTribLoc', 'No tribal/loc'], ['tribPct', '% tribus'], ['burLoc', 'Burgueses/loc'], ['nobLoc', 'Nobles/loc'], ['cleLoc', 'Clero/loc'],
  ['dev', 'Desarrollo'], ['caminoPct', '% camino'], ['nivLoc', 'Niveles edif./loc'], ['pueblos', 'Pueblos'], ['ciudades', 'Ciudades'], ['mercados', 'Mercados'], ['tecnologia', 'Tecnologia'], ['cifra', 'Indice']];
const tabla = (xs) => `| ${COL.map((c) => c[1]).join(' | ')} |\n|${COL.map(() => '---').join('|')}|\n${xs.map((x) => `| ${COL.map(([k]) => x[k]).join(' | ')} |`).join('\n')}`;
const cs = ref.map((x) => x.cifra).sort((a, b) => a - b), [lo, hi] = [cs[0], cs.at(-1)], med = cs[Math.floor(cs.length / 2)];
const fuera = nuestros.filter((x) => x.cifra < lo || x.cifra > hi);
const [blo, bhi] = E.MANDOS.CIFRA_BANDA || [lo, hi], fueraB = nuestros.filter((x) => x.cifra < blo || x.cifra > bhi);
const media = (xs, k) => Math.round(100 * xs.reduce((s, x) => s + x[k], 0) / xs.length) / 100;
const fila = (nombre, xs) => `| ${nombre} | ${COL.slice(1).map(([k]) => media(xs, k)).join(' | ')} |`;
console.log(`## Europa del juego (rango: ${ref.map((x) => x.tag).join(' ')}, de la muestra con ${EMIN}-${EMAX} localizaciones; los demas, solo para ver)\n${tabla(europa)}\n${fila('media del rango', ref)}\n`);
console.log(`## Nuevo Mundo del mod (${nuestros.length} paises)\n${tabla(nuestros)}\n${fila('media', nuestros)}\n`);
const lista = (xs) => xs.map((x) => `${x.tag} (${x.n} locs, ${x.cifra})`).join(', ');
console.log(`Indice del rango europeo: ${lo} a ${hi}, mediana ${med}. Nuestros dentro: ${nuestros.length - fuera.length} de ${nuestros.length}.${fuera.length ? ` Fuera: ${lista(fuera)}.` : ''}`);
console.log(`Banda de economia.mjs (CIFRA_BANDA): ${blo} a ${bhi}. Nuestros dentro: ${nuestros.length - fueraB.length} de ${nuestros.length}.${fueraB.length ? ` Fuera: ${lista(fueraB)}.` : ''}`);
process.exit(fuera.length ? 1 : 0);
