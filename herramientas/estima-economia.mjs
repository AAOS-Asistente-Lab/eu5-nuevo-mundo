// estima-economia.mjs: los indicadores de la economia de salida (economia.mjs) de cada pais del Nuevo
// Mundo del mod montado y de los europeos de 60-150 localizaciones del setup del juego, con la misma
// cuenta, y un indice comparable (cifraPais; no es la base fiscal del juego, que solo se ve en partida).
// Sin --lobby, que los nuestros caigan en el rango europeo del indice sale por construccion (economia.mjs
// ajusta la gente de cada pais para meterlo en CIFRA_BANDA): solo guarda contra roturas del montaje.
// Con --lobby TAG=base,... (la base fiscal leida en la lista de paises del lobby, Country.GetTotalTaxBase,
// in_game/gui/multiplayer_lobby.gui linea 2878) dice si el indice sigue a la base fiscal de los europeos
// medidos, la base fiscal estimada de cada pais nuestro y la CIFRA_BANDA que toca para BASE_OBJETIVO.
// Uso: node herramientas/estima-economia.mjs --mundo <mundo RNW> [--mod tmp-instalar/gj_nuevo_mundo] [--juego <game>]
//      [--europa 60-150] [--muestra POL,POR,...] [--lobby POL=120,POR=150,GQT=90,...]
// Sale con 1 si algun pais nuestro queda fuera: del rango europeo del indice (sin --lobby) o de BASE_OBJETIVO
// (con --lobby: la base medida si se paso, si no la estimada), o si el indice no sigue a la base fiscal.
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
const LOBBY = new Map((arg('--lobby', '') || '').split(',').filter(Boolean).map((x) => {
  const [t, b] = x.split('=');
  if (!/^[A-Z][A-Z0-9]{2}$/.test(t) || !(+b > 0)) { console.error(`--lobby: "${x}" no es TAG=base`); process.exit(2); }
  return [t, +b];
}));

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

// densidad frente a la media del rango: lo que estira el factor de gente por pais de economia.mjs
const densRef = ref.reduce((s, x) => s + x.noTribLoc, 0) / ref.length;
for (const x of [...europa, ...nuestros]) x.dens = Math.round(100 * x.noTribLoc / densRef) / 100;
const COL = [['tag', 'Pais'], ['n', 'Locs'], ['popLoc', 'Gente/loc'], ['noTribLoc', 'No tribal/loc'], ['dens', 'Dens./Europa'], ['tribPct', '% tribus'], ['burLoc', 'Burgueses/loc'], ['nobLoc', 'Nobles/loc'], ['cleLoc', 'Clero/loc'],
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
console.log('Ojo: el indice entra en la banda por construccion (factor de gente por pais); no mide la base fiscal.');
const talla = europa.filter((x) => x.n >= EMIN && x.n <= EMAX), dmax = Math.max(...talla.map((x) => x.dens));
const densos = nuestros.filter((x) => x.dens > dmax);
console.log(`Densidad: el europeo de ${EMIN}-${EMAX} localizaciones mas denso tiene ${dmax} veces la media del rango.${densos.length ? ` Mas densos que el (el factor los estira para llegar a la banda): ${densos.map((x) => `${x.tag} (${x.n} locs, ${x.dens})`).join(', ')}.` : ''}`);
if (!LOBBY.size) {
  console.log(`Base fiscal: NO MEDIDA. Leela en la lista de paises del lobby y pasala con --lobby ${ref.map((x) => `${x.tag}=...`).join(',')}[,nuestros].`);
  process.exit(fuera.length ? 1 : 0);
}
const indices = new Map([...europa, ...nuestros].map((x) => [x.tag, x.cifra]));
const cal = E.calibraLobby({ indices, lobby: LOBBY, europeos: new Set(europa.map((x) => x.tag)) });
if (!cal) { console.log('--lobby: ningun europeo de la tabla con base fiscal: no hay escala.'); process.exit(1); }
const sigue = cal.pares.length >= 2 && cal.dispersion <= E.MANDOS.DISPERSION_MAX;
console.log(`Calibracion con el lobby: indice por punto de base fiscal ${cal.pares.map((p) => `${p.tag} ${Math.round(p.porPunto)}`).join(', ')}; mediana ${Math.round(cal.porPunto)}, dispersion ${cal.dispersion.toFixed(2)} (max ${E.MANDOS.DISPERSION_MAX}): ${cal.pares.length < 2 ? 'hace falta mas de un europeo' : sigue ? 'el indice sigue a la base fiscal' : 'el indice NO sigue a la base fiscal, no fiarse de la estimacion'}.`);
console.log(`CIFRA_BANDA que toca para BASE_OBJETIVO ${E.MANDOS.BASE_OBJETIVO.join('-')}: [${cal.banda.join(', ')}] (hoy [${blo}, ${bhi}]).`);
const [bmin, bmax] = E.MANDOS.BASE_OBJETIVO;
const base = nuestros.map((x) => ({ ...x, est: Math.round(x.cifra / cal.porPunto), med: LOBBY.get(x.tag) }));
const fueraL = base.filter((x) => { const v = x.med ?? x.est; return v < bmin || v > bmax; });
console.log(`Base fiscal de los nuestros (medida, si se paso; si no, estimada): ${base.map((x) => `${x.tag} ${x.med ?? `~${x.est}`}${x.med ? ` (est. ${x.est})` : ''}`).join(', ')}.`);
console.log(`Dentro de ${bmin}-${bmax}: ${base.length - fueraL.length} de ${base.length}.${fueraL.length ? ` Fuera: ${fueraL.map((x) => `${x.tag} ${x.med ?? `~${x.est}`}`).join(', ')}.` : ''}`);
process.exit(fueraL.length || !sigue ? 1 : 0);
