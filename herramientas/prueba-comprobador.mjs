// Mutantes del comprobador sobre el mod integrado: copia el mod, le mete un fallo cada vez
// y exige que comprueba-mod.mjs lo detecte con el mensaje esperado. La copia sin tocar tiene
// que pasar. Los objetivos se buscan en la copia (las partes cambian), asi que un mutante sin
// objetivo cuenta como problema: hay que cambiarlo, no saltarlo.
// Uso: node prueba-comprobador.mjs [--mod <carpeta>] [--tmp <carpeta>] [--base-limpia]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listaFicheros } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const TMP = path.resolve(arg('--tmp', path.join(AQUI, '..', 'tmp-mutantes')));
const ORIGEN = path.resolve(arg('--mod', path.join(AQUI, '..', 'mod', 'gj_nuevo_mundo')));
const COPIA = path.join(TMP, 'gj_nuevo_mundo');

const ab = (r) => path.join(COPIA, r);
const lee = (r) => fs.readFileSync(ab(r), 'utf8');
const escribe = (r, t) => fs.writeFileSync(ab(r), t, 'utf8');
const ficheros = (sub, ext = /\.txt$/) => listaFicheros(ab(sub), (f) => ext.test(f)).map((f) => path.relative(COPIA, f).split(path.sep).join('/')).sort();
class SinObjetivo extends Error {}
// Primer fichero de sub (en orden) donde re casa; devuelve { r, m }.
function busca(sub, re, ext) {
  for (const r of ficheros(sub, ext)) { const m = lee(r).match(re); if (m) return { r, m }; }
  throw new SinObjetivo(`nada casa ${re} en ${sub}`);
}
const cambia = (r, de, a) => { const t = lee(r); if (!t.includes(de)) throw new SinObjetivo(`'${de}' no esta en ${r}`); escribe(r, t.replace(de, a)); };
const ON = 'in_game/common/on_action/gj_integracion_on_actions.txt';
const IDENT = 'in_game/common/scripted_triggers/gj_integracion_identidad.txt';
const VINC = 'in_game/common/scripted_triggers/gj_integracion_vinculo.txt';
const GRUPOS = 'in_game/common/religion_groups/gj_integracion_grupos_religion.txt';
const ES = /_l_spanish\.yml$/;
const EN = /_l_english\.yml$/;

// Cada mutante devuelve el texto que tiene que salir en alguna linea ERROR.
const mutantes = [
  ['llave de menos', () => { const { r } = busca('in_game/events', /\}\s*$/); escribe(r, lee(r).replace(/\}\s*$/, '\n')); return 'llave'; }],
  ['modificador mal escrito', () => { const { r, m } = busca('in_game/common/religions', /^\s*(global_[a-z_]+)\s*=\s*[-\d.a-z_]+\s*$/m); cambia(r, m[0], m[0].replace(m[1], m[1] + '_x')); return `'${m[1]}_x'`; }],
  ['efecto mal escrito', () => { const { r, m } = busca('in_game/events', /\b(add_prestige|add_stability|add_legitimacy|add_treasury)\s*=/); cambia(r, m[0], m[0].replace(m[1], m[1] + 'x')); return `clave '${m[1]}x' desconocida`; }],
  ['sin BOM', () => { const r = ficheros('main_menu/localization/spanish', ES)[0]; escribe(r, lee(r).replace(/^\uFEFF/, '')); return 'falta el BOM'; }],
  ['texto que falta en ingles', () => { const { r, m } = busca('main_menu/localization/english', /^ ([A-Za-z0-9_.]+):\d* "[^\n]*\n/m, EN); cambia(r, m[0], ''); return `'${m[1]}'`; }],
  ['cultura inexistente', () => { const { r, m } = busca('in_game', /culture:(gj_[a-z0-9_]+)/); cambia(r, m[0], m[0] + 'zz'); return `culture:${m[1]}zz no existe`; }],
  ['effect directo en un gancho', () => { cambia(ON, 'on_game_start = {\n', 'on_game_start = {\n\teffect = { }\n'); return 'solo se admite on_actions'; }],
  ['ruta privada', () => { escribe(IDENT, '﻿# /Users/alguien/gj\n' + lee(IDENT).replace(/^\uFEFF/, '')); return 'privacidad'; }],
  ['carpeta mal escrita', () => { fs.renameSync(ab('in_game/common/religion_groups'), ab('in_game/common/religon_groups')); return "la carpeta 'in_game/common/religon_groups'"; }],
  ['evento fuera del namespace', () => {
    const { r, m } = busca('in_game/events', /^namespace\s*=\s*([A-Za-z0-9_]+)/m);
    const t = lee(r); const e = t.match(new RegExp(`^${m[1]}\\.(\\d+)\\s*=`, 'm'));
    if (!e) throw new SinObjetivo(`ningun evento ${m[1]}.N en ${r}`);
    cambia(r, e[0], e[0].replace(m[1] + '.', m[1] + 'x.')); return 'namespace';
  }],
  ['game_id malo', () => { cambia('.metadata/metadata.json', '"game_id": "eu5"', '"game_id": "eu4"'); return 'game_id'; }],
  ['cabecera de idioma mala', () => { const r = ficheros('main_menu/localization/spanish', ES)[0]; cambia(r, 'l_spanish:', 'l_english:'); return 'primera linea'; }],
  ['valor de script inexistente', () => { const { r, m } = busca('in_game/events', /=\s*([a-z_]+)_(bonus|penalty)\b/); const malo = `${m[1]}x_${m[2]}`; cambia(r, m[0], m[0].replace(`${m[1]}_${m[2]}`, malo)); return `'${malo}'`; }],
  ['identidad que falta', () => {
    let usado = null;
    for (const r of ficheros('in_game')) { if (r === IDENT) continue; const m = lee(r).match(/\b(gj_es_[a-z0-9_]+)\s*=\s*yes\b/); if (m) { usado = m[1]; break; } }
    if (!usado) throw new SinObjetivo('ninguna parte usa gj_es_<clave> = yes');
    const t = lee(IDENT); const bloque = t.match(new RegExp(`\\n${usado} = \\{[\\s\\S]*?\\n\\}\\n`));
    if (!bloque) throw new SinObjetivo(`${usado} no esta en ${IDENT}`);
    escribe(IDENT, t.replace(bloque[0], '\n')); return `'${usado}' no es un scripted_trigger`;
  }],
  ['etiqueta repetida en el vinculo', () => {
    const t = lee(VINC); let n = 0;
    const u = t.replace(/(always = no|tag = [A-Z0-9]{3})/g, (x) => (n++ < 2 ? 'tag = ZZQ' : x));
    if (n < 2) throw new SinObjetivo('menos de dos facciones en el vinculo');
    escribe(VINC, u); return 'asignada a dos facciones';
  }],
  ['evento inexistente', () => { const { r, m } = busca('in_game', /(trigger_event[a-z_]*\s*=\s*\{\s*id\s*=\s*)(gj_[a-z0-9_]+)\.(\d+)/); cambia(r, m[0], `${m[1]}${m[2]}.9998`); return `'${m[2]}.9998'`; }],
  ['grupo de religion que falta', () => { const t = lee(GRUPOS); const b = t.match(/\ngj_fe_norte = \{[\s\S]*?\n\}\n/); if (!b) throw new SinObjetivo('gj_fe_norte no esta en ' + GRUPOS); escribe(GRUPOS, t.replace(b[0], '\n')); return 'gj_fe_norte'; }],
];

function prepara() {
  fs.rmSync(COPIA, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  fs.cpSync(ORIGEN, COPIA, { recursive: true });
}
const corre = () => spawnSync(process.execPath, [path.join(AQUI, 'comprueba-mod.mjs'), '--mod', COPIA], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// Con partes a medio escribir la base puede fallar: un mutante solo cuenta como cazado si
// sale un error NUEVO (sin contar el numero de linea) con el texto esperado.
const sinLinea = (l) => l.replace(/^(ERROR [^:]+):\d+:/, '$1:');
const errores = (r) => r.stdout.split('\n').filter((l) => l.startsWith('ERROR'));
let fallos = 0;
prepara();
const base = corre();
const deBase = new Set(errores(base).map(sinLinea));
console.log(`base sin tocar: ${base.status === 0 ? 'PASA' : `FALLA (${deBase.size} errores distintos)`}`);
if (base.status !== 0 && args.includes('--base-limpia')) { console.log(errores(base).slice(0, 10).join('\n')); fallos++; }
for (const [nombre, muta] of mutantes) {
  prepara();
  let espera;
  try { espera = muta(); } catch (e) { console.log(`${nombre}: ${e instanceof SinObjetivo ? 'SIN OBJETIVO' : 'ROTO'} (${e.message})`); fallos++; continue; }
  const r = corre();
  const errs = errores(r).filter((l) => !deBase.has(sinLinea(l)));
  const cazado = r.status === 1 && errs.some((l) => l.includes(espera));
  console.log(`${nombre}: ${cazado ? 'CAZADO' : 'ESCAPA'}${cazado ? '' : ` (esperaba «${espera}») -> ` + (errs[0] || r.stdout.split('\n').slice(-2).join(' '))}`);
  if (!cazado) fallos++;
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`RESULTADO: ${fallos ? 'FALLA' : 'PASA'} (${mutantes.length} mutantes, ${fallos} problemas)`);
process.exit(fallos ? 1 : 0);
