// exporta-3d.mjs: hace el mod local «GJ Nuevo Mundo: graficos», con los arboles 3D y el suelo del
// mapa segun nuestra vegetacion mezclada. Vuelve a correr la generacion de RNW del mundo (unos
// 10-15 min, 8 GB de RAM libres, juego cerrado) con exporta-3d.py y copia SOLO lo que cambia:
// in_game/gfx/map/map_objects y in_game/gfx/terrain2/decals/*_materials.* (unos 880 MB: no van a git).
// Si cualquier otro fichero sale distinto del mundo instalado, para sin instalar nada.
//
// Uso (con gj_nuevo_mundo y el mundo ya instalados):
//   node herramientas/exporta-3d.mjs
//   --mundo <carpeta rnw_exp_world_*>   --mod <carpeta gj_nuevo_mundo instalada>
//   --rnw <carpeta del Workshop de RNW (3829217331)>   --obra <carpeta de trabajo, ~3 GB>
//   --destino <carpeta mod de Documents>
// Coleccion: mundo, GJ Nuevo Mundo, GJ Nuevo Mundo: graficos (el ultimo). Los dos jugadores lo corren.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { leeTexto, escribeConBom, listaFicheros } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const muere = (m) => { console.error('exporta-3d: ' + m); process.exit(1); };
const DOC_MOD = path.resolve(arg('--destino', path.join(os.homedir(), 'Documents', 'Paradox Interactive', 'Europa Universalis V', 'mod')));
const MOD = path.resolve(arg('--mod', path.join(DOC_MOD, 'gj_nuevo_mundo')));
const metaMod = JSON.parse(leeTexto(path.join(MOD, '.metadata', 'metadata.json')).texto);
const idMundo = metaMod.relationships?.[0]?.id || muere(`${MOD} no esta vinculado a ningun mundo`);
const MUNDO = path.resolve(arg('--mundo', path.join(DOC_MOD, idMundo)));
const OBRA = path.resolve(arg('--obra', path.join(AQUI, '..', 'tmp-3d')));
const RNW = arg('--rnw') || [process.env['ProgramFiles(x86)'], process.env.ProgramFiles].filter(Boolean)
  .map((b) => path.join(b, 'Steam', 'steamapps', 'workshop', 'content', '3450310', '3829217331')).find((d) => fs.existsSync(d))
  || muere('no encuentro Random New World en el Workshop: pasa --rnw <carpeta 3829217331>');
const python = path.join(RNW, 'generator', 'python', 'python.exe');
const lib = path.join(MUNDO, '.metadata', 'rnw-library');
const plantillas = path.join(MOD, 'in_game', 'map_data', 'location_templates.txt');
for (const f of [python, plantillas, path.join(lib, 'atlas.json'), path.join(lib, 'world.json'), path.join(lib, 'land_mask.png')]) if (!fs.existsSync(f)) muere(`falta ${f}`);
const mundo = JSON.parse(fs.readFileSync(path.join(lib, 'world.json'), 'utf8'));

// 1. generar otra vez, en la carpeta de trabajo (la biblioteca de RNW y su carpeta no se tocan)
fs.rmSync(OBRA, { recursive: true, force: true });
const datos = path.join(OBRA, 'datos'), salida = path.join(OBRA, 'salida');
fs.mkdirSync(datos, { recursive: true });
fs.writeFileSync(path.join(datos, 'preferences.json'), JSON.stringify({ show_new_world: !fs.existsSync(path.join(MUNDO, 'main_menu', 'gfx', 'FX', 'rnw_new_world_cover.fxh')) }));
console.log(`Generando ${mundo.id} con nuestra vegetacion (10-15 min)...`);
const r = spawnSync(python, [path.join(AQUI, 'exporta-3d.py'), plantillas, path.join(lib, 'atlas.json'), mundo.code, path.join(lib, 'land_mask.png'), datos, salida],
  { stdio: ['ignore', fs.openSync(path.join(OBRA, 'exporta-3d.log'), 'w'), 'inherit'], env: { ...process.env, PYTHONPYCACHEPREFIX: path.join(OBRA, 'pyc') } });
if (r.status !== 0) muere(`la generacion ha fallado (${r.status}): mira ${path.join(OBRA, 'exporta-3d.log')}`);
const nuevo = path.join(salida, path.basename(MUNDO));
if (!fs.existsSync(nuevo)) muere(`no ha salido ${nuevo}`);

// 2. solo pueden cambiar los arboles y el suelo
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const rel = (d) => listaFicheros(d, () => true).map((x) => path.relative(d, x).split(path.sep).join('/')).sort();
const esGrafico = (f) => f.startsWith('in_game/gfx/map/map_objects/') || /^in_game\/gfx\/terrain2\/decals\/.*_materials\.[a-z]+$/.test(f);
const viejos = new Set(rel(MUNDO));
const cambian = [], raros = [];
for (const f of rel(nuevo)) {
  if (f.startsWith('.metadata/')) continue;
  if (viejos.has(f) && sha(path.join(nuevo, f)) === sha(path.join(MUNDO, f))) continue;
  (esGrafico(f) ? cambian : raros).push(f);
}
for (const f of viejos) if (!f.startsWith('.metadata/') && !fs.existsSync(path.join(nuevo, f))) raros.push(f + ' (falta)');
if (raros.length) muere(`salen distintos ${raros.length} ficheros que no son arboles ni suelo (otra version de RNW o del juego?): ${raros.slice(0, 8).join(', ')}`);
if (!cambian.length) muere('no cambia ningun fichero: la vegetacion del mod es la del mundo?');

// 3. el mod local
const destino = path.join(DOC_MOD, 'gj_nuevo_mundo_graficos');
if (fs.existsSync(destino)) {
  const mm = path.join(destino, '.metadata', 'metadata.json');
  if (!(fs.existsSync(mm) && JSON.parse(leeTexto(mm).texto).id === 'gj_nuevo_mundo_graficos')) muere(`${destino} existe y no es este mod: no lo toco`);
  fs.rmSync(destino, { recursive: true, force: true });
}
for (const f of cambian) { fs.mkdirSync(path.dirname(path.join(destino, f)), { recursive: true }); fs.copyFileSync(path.join(nuevo, f), path.join(destino, f)); }
fs.mkdirSync(path.join(destino, '.metadata'), { recursive: true });
escribeConBom(path.join(destino, '.metadata', 'metadata.json'), JSON.stringify({
  name: 'GJ Nuevo Mundo: graficos', id: 'gj_nuevo_mundo_graficos', version: metaMod.version, game_id: 'eu5',
  supported_game_version: metaMod.supported_game_version,
  short_description: 'Arboles y suelo del mapa segun la vegetacion de GJ Nuevo Mundo. Generado en local por exporta-3d.mjs.',
  tags: ['Graphics'],
  relationships: [metaMod.relationships[0], { rel_type: 'dependency', id: 'gj_nuevo_mundo', display_name: metaMod.name, resource_type: 'mod', version: metaMod.version }],
  game_custom_data: {},
}, null, 4) + '\n');
const h = crypto.createHash('sha256');
for (const f of cambian) { h.update(f + '\0'); h.update(fs.readFileSync(path.join(destino, f))); h.update('\0'); }
const mb = cambian.reduce((s, f) => s + fs.statSync(path.join(destino, f)).size, 0) / 1e6;
console.log(`Instalado en ${destino}: ${cambian.length} ficheros, ${mb.toFixed(0)} MB. Huella de los graficos: ${h.digest('hex').slice(0, 16)} (comparadla entre los dos PC).`);
console.log(`Activa «GJ Nuevo Mundo: graficos» en la coleccion, el ULTIMO. La carpeta de trabajo ${OBRA} se puede borrar.`);
