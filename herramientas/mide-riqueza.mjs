// Mide en partida la riqueza (Wealth) de los paises del mod y de unos europeos de referencia.
// El juego no la exporta: se le pide con debug_log en el pulso mensual y se lee de logs/debug.log.
//   node herramientas/mide-riqueza.mjs --poner <mod instalado> [--vinculo tmp-instalar/vinculo.json]
//   (jugar unos meses con cualquier pais)
//   node herramientas/mide-riqueza.mjs --leer <mod instalado> [--log debug.log] [--mes N]
//   node herramientas/mide-riqueza.mjs --quitar <mod instalado>
// Es una herramienta de prueba: los dos ficheros zz_gj_medida.txt NO van en el mod que se entrega.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { tierraDe } from './setup-paises.mjs';

const EUROPA = ['HUN', 'BOH', 'POL', 'CAS', 'ARA', 'POR', 'ENG', 'FRA', 'NAP', 'DAN', 'SWE', 'SCO'];
const FICHEROS = ['in_game/common/on_action/zz_gj_medida.txt', 'in_game/common/script_values/zz_gj_medida.txt'];
const VALORES = ['gj_m_riqueza', 'gj_m_tasa', 'gj_m_eco'];

export const tagsDe = (v) => (typeof v === 'string' ? (/^[A-Z][A-Z0-9]{2}$/.test(v) ? [v] : []) : v && typeof v === 'object' ? Object.values(v).flatMap(tagsDe) : []);
// Comprobado en partida (21/11): en un debug_log, SCOPE.ScriptValue('x') se evalua sobre el pais del pulso.
export const textoPulso = (tags) => `# PRUEBA (mide-riqueza.mjs): no va en el mod que se entrega
monthly_country_pulse = {
\ton_actions = { gj_medida_pulso }
}
gj_medida_pulso = {
\teffect = {
${tags.map((t) => `\t\tif = { limit = { this = c:${t} } debug_log = "GJMEDIDA;${t};${VALORES.map((x) => `[SCOPE.ScriptValue('${x}')|2]`).join(';')}" }`).join('\n')}
\t\tdebug_log = "GJTODOS;[THIS.GetCountry.GetNameWithNoTooltip];[SCOPE.ScriptValue('gj_m_riqueza')|2]" # por nombre: delata al pais que cambia de tag
\t}
}
`;
const textoValores = `gj_m_riqueza = { value = country_potential_tax_base }
gj_m_tasa = { value = country_tax_base }
gj_m_eco = { value = country_economical_base }
`;
// Map(tag -> [[riqueza, tasa, base economica] por mes])
export function leeMedida(log) {
  const r = new Map();
  for (const m of log.matchAll(/GJMEDIDA;([A-Z][A-Z0-9]{2});([^;\r\n]*);([^;\r\n]*);([^;\r\n]*)/g)) {
    if (!r.has(m[1])) r.set(m[1], []);
    r.get(m[1]).push(m.slice(2).map((x) => Number(x.replace(/[,\s]/g, ''))));
  }
  return r;
}

// Parte del tope de RGO que le toca a un pais para llegar a `objetivo` de riqueza por localizacion: recta entre
// lo medido el mes 1 (w0: los obreros nuevos aun no trabajan, sale igual que en el lobby) y lo medido despues
// (w) con la parte `p` de ahora. null: ya llega sin subir nada. BASE es la carga del juego (33 % del tope).
const BASE = 0.33;
export function parteNueva({ p, w0, w, objetivo }) {
  if (w0 >= objetivo) return null;
  // sin pendiente medida, la tipica (21/11: de 0,33 a 0,67 la riqueza por localizacion sube entre 2 y 4)
  const pend = p <= BASE || w <= w0 ? 8 : (w - w0) / (p - BASE);
  return Math.round(100 * Math.min(1, Math.max(BASE, BASE + (objetivo - w0) / pend))) / 100;
}

const arg = (n) => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
const modo = ['--poner', '--leer', '--quitar', '--calibra'].find((x) => process.argv.includes(x));
const leeTodo = (I) => ({
  tierra: tierraDe(fs.readFileSync(path.join(I, 'main_menu/setup/1337/10_countries.txt'), 'utf8')),
  med: leeMedida(fs.readFileSync(arg('--log') || path.join(os.homedir(), 'Documents/Paradox Interactive/Europa Universalis V/logs/debug.log'), 'utf8')),
});
if (modo === '--poner') {
  const I = arg('--poner'), tags = [...new Set([...tagsDe(JSON.parse(fs.readFileSync(arg('--vinculo') || 'tmp-instalar/vinculo.json', 'utf8'))), ...EUROPA])].sort();
  const pon = (f, t) => { const d = path.join(I, f); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.writeFileSync(d, `﻿${t}`, 'utf8'); };
  pon(FICHEROS[0], textoPulso(tags)); pon(FICHEROS[1], textoValores);
  console.log(`medida puesta para ${tags.length} paises en ${I}`);
} else if (modo === '--quitar') {
  for (const f of FICHEROS) fs.rmSync(path.join(arg('--quitar'), f), { force: true });
  console.log('medida quitada');
} else if (modo === '--leer') {
  const { tierra, med } = leeTodo(arg('--leer'));
  // el pulso de cada pais cae en un dia distinto del mes: por defecto, el ultimo mes que ya tienen casi todos
  const meses = Math.max(...[...med.values()].map((v) => v.length)), mes = Number(arg('--mes') || Math.max(1, meses - 1));
  const faltan = [...med].filter(([, v]) => v.length < mes).map(([t]) => t);
  if (faltan.length) console.log(`sin medida ese mes (fuera de la tabla): ${faltan.join(' ')}`);
  const filas = [...med].filter(([, v]) => v.length >= mes).map(([t, v]) => { const [riq, tasa, eco] = v[mes - 1], locs = tierra.get(t)?.own.length || 0; return { t, locs, riq, porLoc: locs ? riq / locs : 0, tasa, eco }; }).sort((a, b) => a.porLoc - b.porLoc);
  console.log(`mes ${mes} de ${meses}; ${filas.length} paises\ntag  locs  riqueza  por loc   tasa  base eco`);
  for (const f of filas) console.log(`${f.t}  ${String(f.locs).padStart(4)}  ${f.riq.toFixed(1).padStart(7)}  ${f.porLoc.toFixed(2).padStart(7)}  ${f.tasa.toFixed(1).padStart(5)}  ${f.eco.toFixed(1).padStart(8)}${EUROPA.includes(f.t) ? '  (Europa)' : ''}`);
  const med2 = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0, de = (eu) => filas.filter((f) => EUROPA.includes(f.t) === eu && f.locs);
  console.log(`mediana por loc: mod ${med2(de(false).map((f) => f.porLoc)).toFixed(2)}, Europa ${med2(de(true).map((f) => f.porLoc)).toFixed(2)}; riqueza mediana: mod ${med2(de(false).map((f) => f.riq)).toFixed(1)}, Europa ${med2(de(true).map((f) => f.riq)).toFixed(1)}`);
} else if (modo === '--calibra') {
  // node herramientas/mide-riqueza.mjs --calibra <mod instalado> [--log f] [--mes N] [--objetivo 2.5]
  // Escribe herramientas/rgo-pais.json (lo lee economia.mjs) con la parte de RGO de cada pais que no llega.
  const { MANDOS, F_RGO_PAIS } = await import('./economia.mjs');
  const { tierra, med } = leeTodo(arg('--calibra')), objetivo = Number(arg('--objetivo') || 2.5), mes = Number(arg('--mes') || 3), sale = {};
  for (const [t, v] of [...med].sort()) {
    const locs = tierra.get(t)?.own.length;
    if (EUROPA.includes(t) || !locs || v.length < 2) continue;
    const p0 = MANDOS.RGO_PAIS[t] ?? MANDOS.RGO_PARTE, p = parteNueva({ p: p0, w0: v[0][0] / locs, w: v[Math.min(mes, v.length) - 1][0] / locs, objetivo });
    if (p !== null && p > BASE) sale[t] = p;
    console.log(`${t}  ${(v[0][0] / locs).toFixed(2)} -> ${(v[Math.min(mes, v.length) - 1][0] / locs).toFixed(2)} con ${p0}  =>  ${p ?? 'sin subir'}`);
  }
  fs.writeFileSync(F_RGO_PAIS, `${JSON.stringify(sale, null, 1)}\n`);
  console.log(`${Object.keys(sale).length} paises con parte propia en ${F_RGO_PAIS} (objetivo ${objetivo} por localizacion)`);
} else {
  assert.equal(parteNueva({ p: 0.67, w0: 1.17, w: 3.57, objetivo: 2.4 }), 0.5, 'Isbrant: de 0,67 a 0,50');
  assert.equal(parteNueva({ p: 0.67, w0: 2.6, w: 5, objetivo: 2.5 }), null, 'ya llega');
  assert.equal(parteNueva({ p: 0.33, w0: 2.1, w: 2.1, objetivo: 2.5 }), 0.38, 'sin pendiente medida, la tipica');
  assert.deepEqual(tagsDe({ a: { x: 'TBH', y: 'no' }, b: ['HUN', 'rnw_loc_1'] }), ['TBH', 'HUN']);
  assert.ok(textoPulso(['TBH']).includes(`if = { limit = { this = c:TBH } debug_log = "GJMEDIDA;TBH;[SCOPE.ScriptValue('gj_m_riqueza')|2];`));
  const m = leeMedida('x: GJMEDIDA;TBH;136.05;30.96;109.61\ny: GJMEDIDA;HUN;1,406.50;104.12;291.05\nz: GJMEDIDA;TBH;140.00;31.00;110.00\n');
  assert.deepEqual(m.get('TBH'), [[136.05, 30.96, 109.61], [140, 31, 110]]);
  assert.equal(m.get('HUN')[0][0], 1406.5);
  console.log('mide-riqueza: PASA');
}
