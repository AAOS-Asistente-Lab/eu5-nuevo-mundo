// comprueba-trozos.mjs: cuantos trozos de tierra seguida tiene cada pais del Nuevo Mundo, en el
// mundo de RNW y tras nuestro reparto (tmp-instalar/vinculo.json). Dos localizaciones estan
// seguidas si se tocan en locations.png. Uso: node comprueba-trozos.mjs --mundo <carpeta> [--todos]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { juegoPorDefecto, analizaFichero, hijo, esBloque, valoresSueltos } from './pdx.mjs';
import { vecinos } from './mundo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MUNDO = path.resolve(arg('--mundo'));
const vec = await vecinos(MUNDO, juegoPorDefecto());
const v = JSON.parse(fs.readFileSync(arg('--vinculo', path.join(AQUI, '..', 'tmp-instalar', 'vinculo.json')), 'utf8'));
const lista = hijo(hijo(analizaFichero(path.join(MUNDO, 'main_menu', 'setup', '1337', '10_countries.txt')).arbol, 'countries').v, 'countries');
const antes = new Map();
for (const it of lista.v.items) if (it.k && esBloque(it.v)) for (const x of it.v.items) if (x.k && /^own_/.test(x.k) && esBloque(x.v)) for (const l of valoresSueltos(x.v)) if (l.startsWith('rnw_loc_')) antes.set(l, it.k);
// la tierra de los paises nuevos que ya es suya en el setup (nuestra copia de 10_countries) y la repartida
const despues = new Map([...antes, ...Object.entries(v.tierra?.nuevos || {}), ...Object.entries(v.tierra?.da || {})]);
for (const l of Object.keys(v.tierra?.suelta || {})) despues.delete(l);
export function trozos(dueno) {
  const por = new Map();
  for (const [l, t] of dueno) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  const r = new Map();
  for (const [t, ls] of por) {
    const mias = new Set(ls), visto = new Set(), tam = [];
    for (const l of ls.sort()) {
      if (visto.has(l)) continue;
      let n = 0; const cola = [l]; visto.add(l);
      while (cola.length) { const x = cola.pop(); n++; for (const y of vec.get(x) || []) if (mias.has(y) && !visto.has(y)) { visto.add(y); cola.push(y); } }
      tam.push(n);
    }
    r.set(t, tam.sort((a, b) => b - a));
  }
  return r;
}
const A = trozos(antes), D = trozos(despues);
const fac = new Map(Object.entries(v.paises || {}).map(([k, t]) => [t, k]));
const partidos = (m) => [...m].filter(([, t]) => t.length > 1);
console.log(`Paises: ${D.size}. Partidos en el mundo de RNW: ${partidos(A).length}. Partidos tras el reparto: ${partidos(D).length}.`);
for (const [t, tam] of [...D].sort(([a], [b]) => a.localeCompare(b))) if (tam.length > 1 || (args.includes('--todos') && fac.has(t))) console.log(`  ${t}${fac.has(t) ? ` (${fac.get(t)})` : ''}: ${tam.join(' + ')}   [en RNW: ${(A.get(t) || []).join(' + ')}]`);
process.exit(partidos(D).length ? 1 : 0);
