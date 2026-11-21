// Reconstruye el mod gj_nuevo_mundo desde cero: las piezas de integracion + partes/<clave>/.
// El mod es una salida: no se edita a mano. Lo que no viene de una parte sale de
// herramientas/facciones.json y de herramientas/vinculo.json (lo escribe asigna-facciones.mjs).
// Uso: node funde-partes.mjs [--mod <carpeta>] [--partes <carpeta>] [--vinculo <json>]
// Escribe eu5-mundo/INTEGRACION.md con lo que ha entrado, lo que falta y los avisos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOM, escribeConBom, leeTexto, listaFicheros, analizaFichero, esBloque, juegoPorDefecto } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MOD = path.resolve(arg('--mod', path.join(RAIZ, 'mod', 'gj_nuevo_mundo')));
const PARTES = path.resolve(arg('--partes', path.join(RAIZ, 'partes')));
const RUTA_VINCULO = path.resolve(arg('--vinculo', path.join(AQUI, 'vinculo.json')));
const INFORME = path.resolve(arg('--informe', path.join(RAIZ, 'INTEGRACION.md')));
const CONF = JSON.parse(fs.readFileSync(path.join(AQUI, 'facciones.json'), 'utf8'));
const VINC = fs.existsSync(RUTA_VINCULO) ? JSON.parse(fs.readFileSync(RUTA_VINCULO, 'utf8')) : { mundo: null, paises: {}, zonas: {} };

const avisos = [];
const errores = [];
const rel = (base, f) => path.relative(base, f).split(path.sep).join('/');
const reDef = /^(?:(?:REPLACE|INJECT|TRY_INJECT|TRY_REPLACE|REPLACE_OR_CREATE|INJECT_OR_CREATE):)?([A-Za-z0-9_\-.]+)\s*=\s*\{/gm;

// ---------------------------------------------------------------- ganchos del juego en on_action
// Bloques de nivel 0 de un script: [{ clave, ini, abre, cierra }] con posiciones en el texto.
function bloquesNivel0(t) {
  const out = [];
  let prof = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '#') { while (i < t.length && t[i] !== '\n') i++; continue; }
    if (c === '"') { i++; while (i < t.length && t[i] !== '"') { if (t[i] === '\\') i++; i++; } continue; }
    if (c === '{') {
      if (prof === 0) {
        const antes = t.slice(Math.max(0, i - 200), i);
        const m = antes.match(/([A-Za-z0-9_:\-.]+)\s*=\s*$/);
        out.push({ clave: m ? m[1] : null, ini: m ? i - m[0].length : i, abre: i, cierra: -1 });
      }
      prof++;
    } else if (c === '}') {
      prof--;
      if (prof === 0 && out.length) out[out.length - 1].cierra = i;
    }
  }
  return out;
}
// Ganchos del juego (on_game_start, yearly_country_pulse, on_ruler_death_delayed...): ninguna
// parte los declara en el mod fundido. Cada bloque de gancho sale del fichero de la parte:
//   - si es solo una lista on_actions = { a b }, sus nombres pasan a la lista del gancho;
//   - si trae otra cosa (effect, events, trigger, random_events...) o INJECT:, su cuerpo queda
//     en la parte como gj_<parte>_<gancho> = { <cuerpo> }, con el mismo efecto, y ese nombre
//     pasa a la lista.
// Despues, gj_integracion_on_actions.txt declara cada gancho UNA vez con toda la lista. El
// juego junta on_actions del mismo nombre de varios ficheros (vanilla define on_winning_war y
// on_royal_marriage en dos, con effect en los dos), asi que esa lista se suma a la de vanilla.
const ganchosHijos = new Map(); // gancho -> [nombres], en orden de parte
// Solo son ganchos los on_actions que define el juego (religion_flavor_pulse_gj_x o
// yearly_gj_x_pulse son de la parte aunque no empiecen por gj_: los avisa el comprobador).
const JUEGO_OA = path.resolve((() => { const i = process.argv.indexOf('--juego'); return i >= 0 ? process.argv[i + 1] : (juegoPorDefecto()); })());
const ganchosDelJuego = new Set();
for (const f of listaFicheros(path.join(JUEGO_OA, 'in_game', 'common', 'on_action'), (x) => x.endsWith('.txt'))) for (const m of leeTexto(f).texto.replace(/#[^\n]*/g, '').matchAll(/^([A-Za-z0-9_]+)\s*=\s*\{/gm)) ganchosDelJuego.add(m[1]);
function reescribeGanchos(t, parte, fichero, cambios) {
  const bloques = bloquesNivel0(t).filter((b) => b.clave && b.cierra > 0);
  let salida = t;
  const nuevosHijos = [];
  for (const b of [...bloques].reverse()) {
    const m = b.clave.match(/^(?:(INJECT|TRY_INJECT|INJECT_OR_CREATE|REPLACE|TRY_REPLACE|REPLACE_OR_CREATE):)?(.+)$/);
    const [, prefijo, gancho] = m;
    if (gancho.startsWith('gj_')) continue;
    if (ganchosDelJuego.size && !ganchosDelJuego.has(gancho)) continue;
    if (prefijo && /REPLACE/.test(prefijo)) { avisos.push(`${parte}: ${fichero} hace ${b.clave} (sustituye el gancho del juego entero); lo dejo, pero pisa a vanilla`); continue; }
    const cuerpo = t.slice(b.abre + 1, b.cierra);
    const sinComentarios = cuerpo.replace(/#[^\n]*/g, '');
    const lista = sinComentarios.match(/^\s*on_actions\s*=\s*\{([^{}]*)\}\s*$/);
    let nuevo, hijos;
    if (lista) {
      hijos = lista[1].split(/\s+/).filter(Boolean);
      nuevo = `# ${b.clave}: lo engancha gj_integracion_on_actions.txt (${hijos.join(', ')}).`;
    } else {
      let hijo = `gj_${parte}_${gancho}`;
      for (let n = 2; new RegExp(`^\\s*${hijo}\\s*=`, 'm').test(salida); n++) hijo = `gj_${parte}_${gancho}_${n}`;
      hijos = [hijo];
      nuevo = `# Cuerpo del gancho ${b.clave}, movido aqui por funde-partes.mjs (lo engancha gj_integracion_on_actions.txt).\n${hijo} = {${cuerpo}}`;
    }
    nuevosHijos.unshift([gancho, hijos]);
    salida = salida.slice(0, b.ini) + nuevo + salida.slice(b.cierra + 1);
    cambios.push(`${parte}: ${fichero}: \`${b.clave}\` → ${lista ? `lista (${hijos.map((h) => `\`${h}\``).join(', ')})` : `\`${hijos[0]}\``}`);
  }
  for (const [g, hs] of nuevosHijos) { if (!ganchosHijos.has(g)) ganchosHijos.set(g, []); for (const h of hs) if (!ganchosHijos.get(g).includes(h)) ganchosHijos.get(g).push(h); }
  return salida;
}
const ganchosReescritos = [];
const renombrados = []; // on_actions propios renombrados a gj_<parte>_...
const intencionGancho = new Map(); // on_action -> { gancho, por }: el gancho que pide la parte

// ---------------------------------------------------------------- 1. vaciar el mod (menos .metadata)
fs.mkdirSync(MOD, { recursive: true });
for (const e of fs.readdirSync(MOD)) if (e !== '.metadata') fs.rmSync(path.join(MOD, e), { recursive: true, force: true });

// ---------------------------------------------------------------- 2. copiar las partes
const partes = fs.existsSync(PARTES) ? fs.readdirSync(PARTES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
const origen = new Map(); // ruta del mod -> parte
const resumen = {};
for (const p of partes) {
  const base = path.join(PARTES, p);
  const ficheros = listaFicheros(base).filter((f) => /^(in_game|main_menu|loading_screen)\//.test(rel(base, f)));
  resumen[p] = { ficheros: 0, sinBom: 0, md: fs.readdirSync(base).filter((x) => x.endsWith('.md')) };
  // On_actions propios que no empiezan por gj_ (yearly_gj_x_pulse, religion_flavor_pulse_gj_x):
  // pasan a gj_<parte>_<resto> en todos los .txt de la parte. Si el nombre lleva delante un
  // gancho del juego, ese es el gancho que queria la parte.
  const renombres = new Map();
  for (const f of ficheros.filter((x) => /^in_game\/common\/on_action\/.+\.txt$/.test(rel(base, x)))) {
    for (const b of bloquesNivel0(leeTexto(f).texto)) {
      const k = b.clave;
      if (!k || k.includes(':') || k.startsWith('gj_') || ganchosDelJuego.has(k) || renombres.has(k)) continue;
      const resto = k.replace(new RegExp(`gj_${p}`), '').replace(/__+/g, '_').replace(/^_|_$/g, '');
      const nuevo = `gj_${p}_${resto}`;
      renombres.set(k, nuevo);
      const g = [...ganchosDelJuego].filter((x) => k.startsWith(x + '_')).sort((a, c) => c.length - a.length)[0];
      if (g) intencionGancho.set(nuevo, { gancho: g, por: `el nombre ${k}` });
      renombrados.push(`${p}: \`${k}\` → \`${nuevo}\`${g ? ` (gancho \`${g}\`)` : ''}`);
    }
  }
  for (const f of ficheros) {
    const r = rel(base, f);
    if (!/\.(txt|yml|gui|dds|png)$/.test(r)) { avisos.push(`${p}: ${r} no es un fichero del juego; no entra`); continue; }
    if (origen.has(r)) { errores.push(`${p} y ${origen.get(r)} traen el mismo fichero ${r}`); continue; }
    origen.set(r, p);
    const destino = path.join(MOD, r);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    if (/\.(txt|yml)$/.test(r)) {
      const { texto, tieneBom } = leeTexto(f);
      if (!tieneBom) resumen[p].sinBom++;
      let limpio = texto.replace(/\r\n/g, '\n');
      if (r.endsWith('.txt')) for (const [k, nuevo] of renombres) limpio = limpio.replace(new RegExp(`\\b${k}\\b`, 'g'), nuevo);
      if (r.startsWith('in_game/common/on_action/') && r.endsWith('.txt')) limpio = reescribeGanchos(limpio, p, r, ganchosReescritos);
      fs.writeFileSync(destino, BOM + limpio, 'utf8');
    } else fs.copyFileSync(f, destino);
    resumen[p].ficheros++;
  }
}

// ---------------------------------------------------------------- 2b. nombres de las lenguas
// En el juego cada nombre es una clave ASCII con su texto (name_alphonse, Joao: "João"). Las
// partes escriben los nombres a pelo y con tildes (Bertrán). Cada nombre que no tenga texto
// en el mod ni sea una clave del juego pasa a gj_n_<ascii>, con el mismo texto en es y en.
const JUEGO = path.resolve(arg('--juego') ?? juegoPorDefecto());
const clavesLoc = (dir) => {
  const s = new Set();
  for (const f of listaFicheros(dir, (x) => x.endsWith('.yml'))) for (const m of leeTexto(f).texto.matchAll(/^ ([^\s:#]+):\d* "/gm)) s.add(m[1]);
  return s;
};
const locMod = clavesLoc(path.join(MOD, 'main_menu', 'localization'));
const nombresJuego = new Set();
for (const lg of ['spanish', 'english']) {
  const f = path.join(JUEGO, 'main_menu', 'localization', lg, `character_names_l_${lg}.yml`);
  if (fs.existsSync(f)) for (const m of leeTexto(f).texto.matchAll(/^ ([^\s:#]+):\d* "/gm)) nombresJuego.add(m[1]);
}
if (!nombresJuego.size) avisos.push(`no encuentro character_names_l_*.yml del juego en ${JUEGO}: no distingo los nombres del juego`);
const nombresGen = new Map(); // clave -> texto
const claveDeNombre = (n) => {
  const base = 'gj_n_' + n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  let k = base;
  for (let i = 2; nombresGen.has(k) && nombresGen.get(k) !== n; i++) k = `${base}_${i}`;
  return k;
};
let nombresCambiados = 0;
for (const f of listaFicheros(path.join(MOD, 'in_game', 'common', 'languages'), (x) => x.endsWith('.txt'))) {
  const t = leeTexto(f).texto;
  const u = t.replace(/\b(male_names|female_names|dynasty_names|ship_names|lowborn)(\s*=\s*\{)([^{}]*)\}/g, (todo, k, igual, cuerpo) =>
    k + igual + cuerpo.replace(/(#[^\n]*)|"([^"\n]*)"|([^\s"#{}]+)/g, (m, com, entre, suelto) => {
      if (com) return m;
      const n = entre !== undefined ? entre : suelto;
      if (locMod.has(n) || nombresJuego.has(n) || /^name_|\./.test(n)) return m;
      const clave = claveDeNombre(n);
      nombresGen.set(clave, n);
      nombresCambiados++;
      return clave;
    }) + '}');
  if (u !== t) fs.writeFileSync(f, BOM + u, 'utf8');
}
if (nombresGen.size) for (const lg of ['spanish', 'english']) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  escribeConBom(path.join(MOD, 'main_menu', 'localization', lg, `gj_integracion_nombres_l_${lg}.yml`),
    `l_${lg}:\n # GENERADO por funde-partes.mjs: los nombres de las lenguas de las partes, con clave ASCII.\n${[...nombresGen].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => ` ${k}: "${esc(v)}"`).join('\n')}\n`);
}

// ---------------------------------------------------------------- 2c. iconos de avance
// Un icon = X que no existe en gfx/interface/advance (juego, DLC o mod) sale en blanco: se
// cambia por un icono fijo del juego segun la categoria del avance, sacada de lo que toca.
const ICONO_POR_CATEGORIA = {
  naval: 'naval_doctrines_advance', militar: 'offensive_army', defensa: 'defensive_mentality',
  religion: 'church_councils', comercio: 'free_merchants', construccion: 'city_building_advance',
  poblacion: 'agriculture_advance', saber: 'scholasticism', administracion: 'administrative_leadership',
};
const PISTAS = [
  ['naval', /naval|ship|sailor|navy|fleet|galley|boat|maritime|port_/],
  ['militar', /army|infantry|cavalry|artillery|regiment|morale|discipline|combat|levy|manpower|mercenar|military|unit_/],
  ['defensa', /fort|siege|garrison|defensive|control_range/],
  ['religion', /religio|piety|holy|church|clergy|honor|karma|purity|devotion|faith|saint|canoniz|god|omen/],
  ['comercio', /trade|merchant|tariff|market|caravan|goods|burgher/],
  ['construccion', /construction|building|city|urban|prosperity|road|monument/],
  ['poblacion', /pop_|population|food|farm|agricult|migration|growth|peasant|life_expectancy/],
  ['saber', /literacy|research|institution|cultur|scholar|printing|advance_cost|innovat/],
];
const iconosJuego = new Set();
for (const d of [path.join(JUEGO, 'main_menu', 'gfx', 'interface', 'advance'), path.join(MOD, 'main_menu', 'gfx', 'interface', 'advance'),
  ...(fs.existsSync(path.join(JUEGO, 'dlc')) ? fs.readdirSync(path.join(JUEGO, 'dlc')).map((x) => path.join(JUEGO, 'dlc', x, 'main_menu', 'gfx', 'interface', 'advance')) : [])]) {
  if (fs.existsSync(d)) for (const x of fs.readdirSync(d)) if (/\.(dds|png)$/i.test(x)) iconosJuego.add(x.replace(/\.(dds|png)$/i, ''));
}
const iconosCambiados = []; // { parte, fichero, avance, antes, despues, categoria }
const claves = (b, out = []) => { if (esBloque(b)) for (const it of b.items) { if (it.k) out.push(it.k); if (typeof it.v === 'string') out.push(it.v); claves(it.v, out); } return out; };
if (iconosJuego.size) for (const f of listaFicheros(path.join(MOD, 'in_game', 'common', 'advances'), (x) => x.endsWith('.txt'))) {
  let arbol;
  try { arbol = analizaFichero(f).arbol; } catch { continue; } // un fichero roto lo denuncia el comprobador
  const lineas = leeTexto(f).texto.split('\n');
  let cambia = false;
  for (const it of arbol.items) {
    if (!it.k || !esBloque(it.v)) continue;
    for (const ic of it.v.items.filter((x) => x.k === 'icon' && typeof x.v === 'string')) {
      if (iconosJuego.has(ic.v)) continue;
      const texto = claves(it.v).join(' ');
      let mejor = 'administracion', max = 0;
      for (const [cat, re] of PISTAS) { const n = (texto.match(new RegExp(re.source, 'g')) || []).length; if (n > max) { max = n; mejor = cat; } }
      const nuevo = ICONO_POR_CATEGORIA[mejor];
      const i = ic.l - 1;
      const antes = lineas[i];
      lineas[i] = antes.replace(/\bicon(\s*=\s*)("?)([A-Za-z0-9_.\-]+)\2/, (m, igual) => `icon${igual}${nuevo}`);
      if (lineas[i] === antes) { avisos.push(`${origen.get(rel(MOD, f)) || '?'}: no pude cambiar el icono de ${it.k} en la linea ${ic.l}`); continue; }
      cambia = true;
      iconosCambiados.push({ parte: origen.get(rel(MOD, f)) || '?', avance: it.k, antes: ic.v, despues: nuevo, categoria: mejor });
    }
  }
  if (cambia) fs.writeFileSync(f, BOM + lineas.join('\n').replace(/^﻿/, ''), 'utf8');
} else avisos.push(`no encuentro los iconos de avance del juego en ${JUEGO}: no cambio ninguno`);

// ---------------------------------------------------------------- 3. lo que hay definido tras copiar
const definidas = (sub) => {
  const s = new Set();
  for (const f of listaFicheros(path.join(MOD, sub), (x) => x.endsWith('.txt'))) for (const m of leeTexto(f).texto.replace(/#[^\n]*/g, '').matchAll(reDef)) s.add(m[1]);
  return s;
};
const culturas = definidas('in_game/common/cultures');
const religiones = definidas('in_game/common/religions');
const escuelas = definidas('in_game/common/religious_schools');
const triggersPartes = definidas('in_game/common/scripted_triggers');

// referencias gj_es_* y gj_zona_* en las partes
const textosPartes = listaFicheros(MOD, (x) => x.endsWith('.txt')).map((f) => leeTexto(f).texto.replace(/#[^\n]*/g, '')).join('\n');
const usados = (re) => [...new Set([...textosPartes.matchAll(re)].map((m) => m[1]))].sort();
const esUsados = usados(/\b(gj_es_[a-z0-9_]+)\s*=/g);
// Zonas: en los scripts, en sus comentarios y en los .md de las partes (Kaivan las llama
// como gj_zona_$Z$ y solo nombra las cuatro en un comentario).
const zonasUsadas = [...new Set(listaFicheros(PARTES, (x) => /\.(txt|md)$/.test(x))
  .flatMap((f) => [...leeTexto(f).texto.matchAll(/\b(gj_zona_[a-z0-9_]*[a-z0-9])\b(?!\$)/g)].map((m) => m[1])))].sort();

// ---------------------------------------------------------------- 4. piezas de integracion
const I = (r) => path.join(MOD, r);
const hsv = (c) => `hsv360 { ${c[0]} ${c[1]} ${c[2]} }`;
const colorDe = (f) => (f.rgb ? `rgb { ${f.rgb[0]} ${f.rgb[1]} ${f.rgb[2]} }` : hsv(f.color));
const F = CONF.facciones;
const FUND = [];
const faltan = [];
for (const f of F) {
  const falta = [];
  if (!culturas.has(f.cultura)) falta.push(`cultura ${f.cultura}`);
  if (!religiones.has(f.religion)) falta.push(`religion ${f.religion}`);
  if (f.escuela && !escuelas.has(f.escuela)) falta.push(`escuela ${f.escuela}`);
  if (falta.length) faltan.push(`${f.clave}: falta ${falta.join(', ')}`);
  else FUND.push(f);
}

escribeConBom(I('in_game/common/religion_groups/gj_integracion_grupos_religion.txt'),
`# GJ Nuevo Mundo, integracion: los dos grupos de las fes propias (CONTRATO-PARTES §5).
${Object.keys(CONF.grupos_religion).map((g) => `\n${g} = {\n\tcolor = ${g}\n\tconvert_slaves_at_start = no\n\tmodifier = {\n\t}\n}\n`).join('')}`);

escribeConBom(I('main_menu/common/named_colors/gj_integracion_colores.txt'),
`# GJ Nuevo Mundo, integracion: colores de los paises y de los grupos de religion.
colors = {
${F.map((f) => `\tgj_pais_${f.clave} = ${colorDe(f)}`).join('\n')}
${Object.entries(CONF.grupos_religion).map(([g, d]) => `\t${g} = ${hsv(d.color)}`).join('\n')}
}
`);

// identidad: la variable que pone la fundacion, o la etiqueta de partida (por si una parte
// pregunta en on_game_start antes de que corra la fundacion)
const clavesEs = new Set(F.map((f) => `gj_es_${f.clave}`));
const esExtra = esUsados.filter((k) => !clavesEs.has(k) && !triggersPartes.has(k));
for (const k of esExtra) avisos.push(`${k} lo usa una parte, pero no es una faccion de facciones.json: queda como "always = no"`);
escribeConBom(I('in_game/common/scripted_triggers/gj_integracion_identidad.txt'),
`# GJ Nuevo Mundo, integracion: quien es cada faccion (CONTRATO-PARTES §4). GENERADO por funde-partes.mjs.
${F.map((f) => `\ngj_es_${f.clave} = {\n\tOR = {\n\t\thas_variable = gj_faccion_${f.clave}\n\t\tgj_${f.clave}_tag_inicial = yes\n\t}\n}\n`).join('')}${esExtra.map((k) => `\n${k} = {\n\talways = no\n}\n`).join('')}`);

const mundoTxt = VINC.mundo ? `${VINC.mundo.name} (${VINC.mundo.id})` : 'ninguno';
escribeConBom(I('in_game/common/scripted_triggers/gj_integracion_vinculo.txt'),
`# GJ Nuevo Mundo, integracion: el pais de partida de cada faccion. GENERADO por funde-partes.mjs
# desde vinculo.json (lo escribe asigna-facciones.mjs). Sin mundo, ninguna faccion se crea.
# mundo: ${mundoTxt}
${F.map((f) => { const t = VINC.paises[f.clave]; return `\ngj_${f.clave}_tag_inicial = {\n\t${t ? `tag = ${t}` : 'always = no'}\n}\n`; }).join('')}`);

const zonasDef = triggersPartes;
const zonas = zonasUsadas.filter((z) => !zonasDef.has(z));
// Cada zona: { ambito, lista } (una lista sola vale como ambito localizacion). Elementos:
// area = area:x, sub_continent = sub_continent:x o this = location:x. Ambitos: localizacion (la
// localizacion esta en la lista), pais_capital (la capital del pais) y pais_frontera (el pais
// tiene una localizacion en la lista o junto a ella).
const zonaDe = (z) => { const d = VINC.zonas?.[z]; return Array.isArray(d) ? { ambito: 'localizacion', lista: d } : d; };
const itemZona = (x) => (x.tipo === 'location' ? `this = location:${x.clave}` : `${x.tipo} = ${x.tipo}:${x.clave}`);
const orZona = (d, ind) => `${ind}OR = {\n${d.lista.map((x) => `${ind}\t${itemZona(x)}`).join('\n')}\n${ind}}`;
const cuerpoZona = (z) => {
  const d = zonaDe(z);
  if (!d || !d.lista?.length) return '\talways = no';
  if (d.ambito === 'pais_capital') return `\t# scope: pais (su capital)\n\tcapital = {\n${orZona(d, '\t\t')}\n\t}`;
  if (d.ambito === 'pais_frontera') return `\t# scope: pais (tiene tierra en la zona o junto a ella)\n\tany_owned_location = {\n\t\tOR = {\n${d.lista.map((x) => `\t\t\t${itemZona(x)}`).join('\n')}\n\t\t\tany_neighbor_location = {\n${orZona(d, '\t\t\t\t')}\n\t\t\t}\n\t\t}\n\t}`;
  return orZona(d, '\t');
};
for (const z of zonas) if (!zonaDe(z)?.lista?.length) avisos.push(`${z}: sin mundo vinculado queda como "always = no"`);
escribeConBom(I('in_game/common/scripted_triggers/gj_integracion_zonas.txt'),
`# GJ Nuevo Mundo, integracion: zonas del mapa que piden las partes (scope: localizacion, salvo las que dicen pais).
# GENERADO por funde-partes.mjs desde vinculo.json. Sin mundo vinculado, "always = no".
${zonas.map((z) => `\n${z} = {\n${cuerpoZona(z)}\n}\n`).join('')}`);

escribeConBom(I('in_game/common/scripted_effects/gj_integracion_fundacion.txt'),
`# GJ Nuevo Mundo, integracion: convierte un pais generado por RNW en una faccion (scope: pais).
# Pasa a la cultura y la fe de la faccion los pops y los personajes que tenian la cultura o la
# religion de partida del pais, y todos los de la tierra que gana al empezar (gj_tierra_nueva).
gj_fundar_faccion = {
\tset_variable = gj_faccion_$clave$

\tculture = { save_scope_as = gj_cultura_vieja }
\treligion = { save_scope_as = gj_religion_vieja }

\tevery_owned_location = {
\t\tif = {
\t\t\t# tierra que la faccion gana al empezar (gj_reparte_tierra): todos sus pops
\t\t\tlimit = { has_variable = gj_tierra_nueva }
\t\t\tevery_pop = {
\t\t\t\tchange_pop_culture = culture:$cultura$
\t\t\t\tchange_pop_religion = religion:$religion$
\t\t\t}
\t\t\tremove_variable = gj_tierra_nueva
\t\t}
\t\telse = {
\t\t\tevery_pop = {
\t\t\t\tlimit = { culture = scope:gj_cultura_vieja }
\t\t\t\tchange_pop_culture = culture:$cultura$
\t\t\t}
\t\t\tevery_pop = {
\t\t\t\tlimit = { religion = scope:gj_religion_vieja }
\t\t\t\tchange_pop_religion = religion:$religion$
\t\t\t}
\t\t}
\t}
\tevery_character = {
\t\tlimit = {
\t\t\towner = root
\t\t\tculture = scope:gj_cultura_vieja
\t\t}
\t\tchange_character_culture = culture:$cultura$
\t}
\tevery_character = {
\t\tlimit = {
\t\t\towner = root
\t\t\treligion = scope:gj_religion_vieja
\t\t}
\t\tchange_character_religion = religion:$religion$
\t}

\tchange_culture = culture:$cultura$
\tchange_religion = religion:$religion$
\tchange_country_name = $nombre$
\tchange_country_adjective = $nombre$_ADJ
\tchange_country_color = $color$
}
`);

const llamada = (f) => `\t\tevery_country = {\n\t\t\tlimit = { gj_${f.clave}_tag_inicial = yes }\n\t\t\tgj_fundar_faccion = { clave = ${f.clave} cultura = ${f.cultura} religion = ${f.religion} nombre = GJ_${f.clave.toUpperCase()} color = gj_pais_${f.clave} }${f.escuela ? `\n\t\t\tset_religious_school = religious_school:${f.escuela}` : ''}${f.gobierno ? `\n\t\t\tif = {\n\t\t\t\tlimit = { NOT = { government_type = government_type:${f.gobierno} } }\n\t\t\t\tchange_government_type = government_type:${f.gobierno}\n\t\t\t}` : ''}\n\t\t}`;
// on_actions gj_ de las partes que nadie llama: los pulsos anuales se enganchan solos al pulso
// anual del pais (BALANCE.md: lagunas, sorava, los menores...); el resto se avisa.
const onActionsPartes = [...definidas('in_game/common/on_action')].filter((k) => k.startsWith('gj_')).sort();
const enListas = new Set([...ganchosHijos.values()].flat());
const textoOnActions = listaFicheros(MOD, (x) => x.endsWith('.txt')).map((f) => leeTexto(f).texto.replace(/#[^\n]*/g, '')).join('\n');
const huerfanos = onActionsPartes.filter((k) => !enListas.has(k) && (textoOnActions.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length <= 1);
const enganchadosSolos = [];
// Lineas de comentario de los on_action de las partes («#   on_new_ruler -> gj_velathi_nuevo_rey»).
const comentariosOA = listaFicheros(path.join(MOD, 'in_game', 'common', 'on_action'), (x) => x.endsWith('.txt'))
  .flatMap((f) => leeTexto(f).texto.split('\n').filter((l) => /^\s*#/.test(l)));
for (const k of huerfanos) {
  let elegido = intencionGancho.get(k);
  if (!elegido && /_pulso_anual$|_anual$|_yearly_pulse$|_pulso$|_pulse$/.test(k)) elegido = { gancho: 'yearly_country_pulse', por: 'es un pulso' };
  if (!elegido) {
    const linea = comentariosOA.find((l) => new RegExp(`\\b${k}\\b`).test(l) && [...l.matchAll(/[a-z][a-z0-9_]+/g)].some((m) => ganchosDelJuego.has(m[0])));
    const g = linea && [...linea.matchAll(/[a-z][a-z0-9_]+/g)].map((m) => m[0]).find((x) => ganchosDelJuego.has(x));
    if (g) elegido = { gancho: g, por: 'lo dice el comentario de la parte' };
  }
  if (!elegido) { avisos.push(`on_action ${k} no lo llama nadie (ni lista, ni evento, ni efecto)`); continue; }
  if (!ganchosHijos.has(elegido.gancho)) ganchosHijos.set(elegido.gancho, []);
  ganchosHijos.get(elegido.gancho).push(k);
  enganchadosSolos.push(`\`${k}\` → \`${elegido.gancho}\` (${elegido.por})`);
}
const ganchosFinal = new Map([['on_game_start', ['gj_integracion_inicio', ...(ganchosHijos.get('on_game_start') || [])]], ...[...ganchosHijos].filter(([g]) => g !== 'on_game_start')]);
escribeConBom(I('in_game/common/on_action/gj_integracion_on_actions.txt'),
`# GJ Nuevo Mundo, integracion: los UNICOS ganchos del juego del mod. Cada uno, una vez, con la
# lista de todas las partes; el juego la suma a la suya (junta on_actions del mismo nombre).
# GENERADO por funde-partes.mjs.
${[...ganchosFinal].sort(([a], [b]) => (a === 'on_game_start' ? -1 : b === 'on_game_start' ? 1 : a.localeCompare(b))).map(([g, hs]) => `\n${g} = {\n\ton_actions = {\n${hs.map((h) => `\t\t${h}`).join('\n')}\n\t}\n}`).join('\n')}

# Cada faccion entra en su pais de partida. Las que no tienen todas sus piezas no se crean.
gj_integracion_inicio = {
\teffect = {
\t\tgj_asigna_recursos = yes
\t\tgj_reparte_tierra = yes
${FUND.map(llamada).join('\n')}
\t}
}
`);

// Tierra al empezar (reparte-tierra.mjs, via vinculo.json): reparte tierra libre entre las facciones
// y los demas paises del mundo; nadie absorbe a nadie. La tierra que pasa a una faccion lleva
// gj_tierra_nueva, y gj_fundar_faccion pasa todos sus pops a la cultura y la fe de la faccion; la
// que pasa a otro pais toma aqui mismo la cultura y la fe de ese pais. Sin mundo, no hace nada.
const TIERRA = VINC.tierra || { da: {} };
const tagsFaccion = new Set(Object.values(VINC.paises || {}));
const dadas = Object.entries(TIERRA.da || {}).sort(([a], [b]) => a.localeCompare(b));
const capitales = Object.entries(TIERRA.capital || {}).sort(([a], [b]) => a.localeCompare(b));
const popsDe = (dueno) => (tagsFaccion.has(dueno) ? 'gj_marca_tierra_nueva = yes' : `every_pop = { change_pop_culture = c:${dueno}.culture change_pop_religion = c:${dueno}.religion }`);
escribeConBom(I('in_game/common/scripted_effects/gj_integracion_tierra.txt'),
`# GJ Nuevo Mundo, integracion: tierra con dueno al empezar. GENERADO por funde-partes.mjs desde
# vinculo.json (lo calcula reparte-tierra.mjs). ${dadas.length ? `${dadas.length} localizaciones libres repartidas y ${capitales.length} capitales llevadas a su zona.` : 'Sin mundo vinculado: no cambia nada.'}

# Marca la tierra que una faccion gana al empezar: gj_fundar_faccion pasa todos sus pops (scope: localizacion).
gj_marca_tierra_nueva = {
	set_variable = gj_tierra_nueva
}

gj_reparte_tierra = {
${dadas.map(([l, dueno]) => `\tlocation:${l} = { change_location_owner = c:${dueno} change_location_controller = c:${dueno} add_core = c:${dueno} ${popsDe(dueno)} }`).join('\n')}
${capitales.map(([t2, c]) => `\t# ${t2}: su capital (${c.de}) estaba fuera de su zona; pasa a su localizacion mas cerca del centro\n\tc:${t2} = { set_capital = location:${c.a} }`).join('\n')}
}
`);

// Recursos por zonas (asigna-recursos.mjs, via vinculo.json). Sin mundo, el efecto no hace nada.
const recursos = Object.entries(VINC.recursos || {}).sort(([a], [b]) => a.localeCompare(b));
escribeConBom(I('in_game/common/scripted_effects/gj_integracion_recursos.txt'),
`# GJ Nuevo Mundo, integracion: recursos por zonas. GENERADO por funde-partes.mjs desde vinculo.json
# (lo calcula asigna-recursos.mjs). ${recursos.length ? `${recursos.length} localizaciones cambian de bien.` : 'Sin mundo vinculado: no cambia nada.'}

gj_asigna_recursos = {
${recursos.map(([l, b]) => `\tlocation:${l} = { change_raw_material = goods:${b} }`).join('\n')}
}
`);

// textos de integracion
const lineasLoc = (lg) => [
  ...F.flatMap((f) => [` GJ_${f.clave.toUpperCase()}: "${f.nombre[lg]}"`, ` GJ_${f.clave.toUpperCase()}_ADJ: "${f.adj[lg]}"`]),
  ...Object.entries(CONF.grupos_religion).flatMap(([g, d]) => [` ${g}: "${d[lg]}"`, ` ${g}_ADJ: "${d['adj_' + lg]}"`, ` ${g}_desc: "${d['desc_' + lg]}"`]),
];
for (const [lengua, lg] of [['spanish', 'es'], ['english', 'en']]) {
  escribeConBom(I(`main_menu/localization/${lengua}/gj_integracion_l_${lengua}.yml`), `l_${lengua}:\n # GENERADO por funde-partes.mjs desde facciones.json\n${lineasLoc(lg).join('\n')}\n`);
}

// ingles: si una parte no trae el fichero ingles, va el castellano (mejor que la clave en bruto)
let copiasEn = 0;
for (const f of listaFicheros(path.join(MOD, 'main_menu', 'localization', 'spanish'), (x) => x.endsWith('_l_spanish.yml') && !/[\\/]replace[\\/]/.test(x))) {
  const nombre = path.basename(f).replace(/_l_spanish\.yml$/, '_l_english.yml');
  const en = path.join(MOD, 'main_menu', 'localization', 'english', nombre);
  if (fs.existsSync(en)) continue;
  const t = leeTexto(f).texto.replace(/^l_spanish:/, 'l_english:\n # Copia del castellano: esta parte no trae textos en ingles.');
  escribeConBom(en, t);
  copiasEn++;
}

// ---------------------------------------------------------------- 4b. textos de los modificadores
// El juego nombra un modificador con STATIC_MODIFIER_NAME_<k> (y _DESC_), o AUTO_MODIFIER_*.
// Si una parte solo trae la clave pelada (<k>: "..." y <k>_desc), se generan las del juego
// con el mismo texto. Lo que ya trae la clave del juego no se toca.
const modsEstaticos = definidas('main_menu/common/static_modifiers');
const modsAuto = definidas('in_game/common/auto_modifiers');
let modsTextos = 0;
for (const lg of ['spanish', 'english']) {
  const dir = path.join(MOD, 'main_menu', 'localization', lg);
  const textos = new Map();
  for (const f of listaFicheros(dir, (x) => x.endsWith('.yml'))) for (const m of leeTexto(f).texto.matchAll(/^ ([^\s:#]+):\d* (".*")\s*$/gm)) if (!textos.has(m[1])) textos.set(m[1], m[2]);
  const nuevas = [];
  for (const [conjunto, pref] of [[modsEstaticos, 'STATIC_MODIFIER'], [modsAuto, 'AUTO_MODIFIER']]) for (const k of [...conjunto].sort()) {
    if (!textos.has(`${pref}_NAME_${k}`) && textos.has(k)) nuevas.push(` ${pref}_NAME_${k}: ${textos.get(k)}`);
    if (!textos.has(`${pref}_DESC_${k}`) && textos.has(`${k}_desc`)) nuevas.push(` ${pref}_DESC_${k}: ${textos.get(`${k}_desc`)}`);
  }
  if (nuevas.length) escribeConBom(path.join(dir, `gj_integracion_modificadores_l_${lg}.yml`),
    `l_${lg}:\n # GENERADO por funde-partes.mjs: claves del juego para modificadores que las partes nombran con la clave pelada.\n${nuevas.join('\n')}\n`);
  modsTextos = Math.max(modsTextos, nuevas.length);
}

// ---------------------------------------------------------------- 5. informe
const metaF = path.join(MOD, '.metadata', 'metadata.json');
if (!fs.existsSync(metaF)) errores.push('falta .metadata/metadata.json: corre prepara-mod.mjs');
const informe = `# Integracion de las partes

GENERADO por funde-partes.mjs. Mundo vinculado: ${mundoTxt}.

## Partes que han entrado
| Parte | Ficheros | Sin BOM (puesto) | Documentos |
|---|---|---|---|
${partes.map((p) => `| ${p} | ${resumen[p].ficheros} | ${resumen[p].sinBom} | ${resumen[p].md.join(', ') || '—'} |`).join('\n')}

## Facciones
- Se crean al empezar (${FUND.length}): ${FUND.map((f) => f.clave + (VINC.paises[f.clave] ? ` (${VINC.paises[f.clave]})` : ' (sin pais)')).join(', ') || 'ninguna'}.
- No se crean todavia (${faltan.length}): ${faltan.join('; ') || 'ninguna'}.

## Triggers que piden las partes
- \`gj_es_*\` usados: ${esUsados.join(', ') || 'ninguno'}.
- \`gj_zona_*\` usados: ${zonasUsadas.join(', ') || 'ninguno'}${zonas.length ? '' : ''}.

## Ganchos del juego: un solo fichero (${ganchosFinal.size} ganchos)
Ninguna parte declara ganchos del juego en el mod fundido. Todos están en \`gj_integracion_on_actions.txt\`, cada uno una vez y con la lista de todas las partes, y el juego la suma a la suya (vanilla define \`on_winning_war\` y \`on_royal_marriage\` en dos ficheros cada uno). Si una parte traía \`effect\`, \`events\` o \`INJECT:\`, su cuerpo queda en la parte como \`gj_<parte>_<gancho>\`, con el mismo efecto.
${[...ganchosFinal].sort(([a], [b]) => a.localeCompare(b)).map(([g, hs]) => `- \`${g}\` (${hs.length}): ${hs.map((h) => `\`${h}\``).join(', ')}`).join('\n')}

On_actions que no llamaba nadie, enganchados al gancho que pide la parte (por su nombre, por ser un pulso o por el comentario de su fichero) (${enganchadosSolos.length}):
${enganchadosSolos.map((h) => `- ${h}`).join('\n') || '- ninguno'}

On_actions propios sin \`gj_\` delante, renombrados en todos los ficheros de su parte (${renombrados.length}):
${renombrados.map((h) => `- ${h}`).join('\n') || '- ninguno'}

Cambios en los ficheros de las partes (${ganchosReescritos.length}):
${ganchosReescritos.map((c) => `- ${c}`).join('\n') || '- ninguno'}

## Iconos de avance cambiados (${iconosCambiados.length})
Un icono que no existe en el juego sale en blanco; se cambia por uno fijo del juego según la categoría del avance (la que más claves toca): ${Object.entries(ICONO_POR_CATEGORIA).map(([c, i]) => `${c} → \`${i}\``).join(', ')}.
${iconosCambiados.length ? `\n| Parte | Avance | Icono pedido | Categoría | Icono puesto |\n|---|---|---|---|---|\n${iconosCambiados.map((x) => `| ${x.parte} | \`${x.avance}\` | \`${x.antes}\` | ${x.categoria} | \`${x.despues}\` |`).join('\n')}\n` : '- ninguno\n'}
## Textos de modificadores
- ${modsTextos} claves \`STATIC_MODIFIER_*\`/\`AUTO_MODIFIER_*\` generadas desde la clave pelada que traían las partes (\`gj_integracion_modificadores_l_*.yml\`).

## Nombres de las lenguas
- ${nombresCambiados} nombres sin texto pasados a ${nombresGen.size} claves \`gj_n_*\` con su texto en \`gj_integracion_nombres_l_*.yml\` (como hace el juego con \`name_*\`).

## Ingles
- ${copiasEn} ficheros de texto en ingles son copia del castellano (la parte no traia ingles).

## Errores
${errores.map((e) => '- ' + e).join('\n') || '- ninguno'}

## Avisos
${avisos.map((e) => '- ' + e).join('\n') || '- ninguno'}
`;
fs.writeFileSync(INFORME, informe, 'utf8');
console.log(`funde-partes: ${partes.length} partes, ${origen.size} ficheros, ${FUND.length}/${F.length} facciones completas, ${copiasEn} copias en ingles, ${errores.length} errores, ${avisos.length} avisos. Informe: ${path.basename(INFORME)}`);
for (const e of errores) console.log('ERROR ' + e);
process.exit(errores.length ? 1 : 0);
