// Comprobador del mod gj_nuevo_mundo contra los ficheros de EU5 1.4.9, sin lanzar el juego.
// Uso: node comprueba-mod.mjs [--mod <carpeta>] [--juego <carpeta game>] [--mundo <mod rnw_exp_*>] [--rehaz-cache]
// Sale con 1 si hay algun ERROR. Los AVISOS no paran.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analizaFichero, leeTexto, esBloque, hijos, hijo, valoresSueltos, recorre, listaFicheros, juegoPorDefecto, LOCAL } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const MOD = path.resolve(arg('--mod', path.join(AQUI, '..', 'mod', 'gj_nuevo_mundo')));
const JUEGO = path.resolve(arg('--juego') ?? juegoPorDefecto());
const MUNDO = arg('--mundo', null);
const LENGUAS = ['spanish', 'english'];

const errores = [];
const avisos = [];
const rel = (f) => path.relative(MOD, f).split(path.sep).join('/');
const err = (f, l, m) => errores.push(`ERROR ${f}${l ? ':' + l : ''}: ${m}`);
const aviso = (f, l, m) => avisos.push(`AVISO ${f}${l ? ':' + l : ''}: ${m}`);

// ---------------------------------------------------------------- lo que sabe el juego
function buildDelJuego() {
  const acf = path.join(JUEGO, '..', '..', '..', 'appmanifest_3450310.acf');
  try { return (fs.readFileSync(acf, 'utf8').match(/"buildid"\s+"(\d+)"/) || [])[1] || 'desconocido'; } catch { return 'desconocido'; }
}

// Todo por expresiones regulares sobre el texto: analizar el juego entero con el
// lector completo es demasiado lento en los E-cores con prioridad Idle.
const sinComentarios = (t) => t.replace(/#[^\n]*/g, '');
const textoDe = (f) => sinComentarios(leeTexto(f).texto);
const reDef = /^(?:(?:REPLACE|INJECT|TRY_INJECT|TRY_REPLACE|REPLACE_OR_CREATE|INJECT_OR_CREATE):)?([A-Za-z0-9_\-.]+)\s*=\s*\{/gm;
const reDefEscalar = /^([A-Za-z0-9_\-.]+)\s*=/gm;
function clavesRapidas(dir) {
  const s = new Set();
  const re = /script_values/.test(dir) ? reDefEscalar : reDef;
  for (const f of listaFicheros(dir, (r) => r.endsWith('.txt'))) for (const m of textoDe(f).matchAll(re)) s.add(m[1]);
  return s;
}

function construyeConocimiento() {
  const G = (...p) => path.join(JUEGO, ...p);
  const dlcs = fs.existsSync(G('dlc')) ? fs.readdirSync(G('dlc')).map((d) => G('dlc', d)) : [];
  const raices = [JUEGO, ...dlcs];
  const deTodas = (sub) => raices.map((r) => path.join(r, sub));
  const claves = (sub) => { const s = new Set(); for (const d of deTodas(sub)) for (const k of clavesRapidas(d)) s.add(k); return [...s]; };
  const bd = {};
  for (const sub of ['cultures', 'culture_groups', 'languages', 'language_families', 'religions', 'religion_groups', 'religious_aspects',
    'advances', 'pop_types', 'estates', 'age', 'building_types', 'casus_belli', 'situations', 'scripted_triggers', 'scripted_effects',
    'on_action', 'script_values', 'auto_modifiers', 'gods', 'disasters', 'government_reforms', 'decisions', 'unit_types']) {
    bd[sub] = claves(path.join('in_game', 'common', sub));
  }
  bd.static_modifiers = claves(path.join('main_menu', 'common', 'static_modifiers'));
  bd.modifier_types = claves(path.join('main_menu', 'common', 'modifier_type_definitions'));
  bd.script_values = [...new Set([...bd.script_values, ...claves(path.join('main_menu', 'common', 'script_values'))])];
  const colores = new Set();
  for (const d of deTodas(path.join('main_menu', 'common', 'named_colors'))) {
    for (const f of listaFicheros(d, (r) => r.endsWith('.txt'))) for (const m of textoDe(f).matchAll(/^\s+([A-Za-z0-9_]+)\s*=\s*(?:rgb|hsv360|hsv)\b/gm)) colores.add(m[1]);
  }
  bd.named_colors = [...colores];
  // Vocabulario: toda clave a la izquierda de un operador en los scripts del juego.
  const vocab = new Set(); const scopes = new Set(); const gfx = new Set(); const claveAvance = new Set();
  const reClave = /([A-Za-z_][A-Za-z0-9_]*)\s*(?:>=|<=|!=|\?=|==|=|>|<)/g;
  for (const raiz of raices) {
    for (const sub of [path.join('in_game', 'events'), path.join('in_game', 'common'), path.join('main_menu', 'common')]) {
      for (const f of listaFicheros(path.join(raiz, sub), (r) => r.endsWith('.txt'))) {
        const t = textoDe(f);
        for (const m of t.matchAll(reClave)) vocab.add(m[1]);
        for (const m of t.matchAll(/save_scope_as\s*=\s*([A-Za-z0-9_]+)|scope:([A-Za-z0-9_]+)/g)) scopes.add(m[1] || m[2]);
      }
    }
    for (const f of listaFicheros(path.join(raiz, 'in_game', 'common', 'cultures'), (r) => r.endsWith('.txt'))) {
      for (const m of textoDe(f).matchAll(/\btags\s*=\s*\{([^}]*)\}/g)) for (const v of m[1].split(/\s+/)) if (v) gfx.add(v);
    }
    for (const f of listaFicheros(path.join(raiz, 'in_game', 'common', 'advances'), (r) => r.endsWith('.txt'))) {
      for (const m of textoDe(f).matchAll(/^\t([A-Za-z_][A-Za-z0-9_]*)\s*=/gm)) claveAvance.add(m[1]);
    }
  }
  const dds = (sub) => [...new Set(raices.flatMap((r) => listaFicheros(path.join(r, sub), (x) => x.endsWith('.dds')).map((x) => path.basename(x, '.dds'))))];
  const modSet = new Set(bd.modifier_types);
  return {
    build: buildDelJuego(), bd, vocab: [...vocab], scopes: [...scopes], gfx: [...gfx],
    clavesAvanceNoModificador: [...claveAvance].filter((k) => !modSet.has(k)),
    iconosAvance: dds(path.join('main_menu', 'gfx', 'interface', 'advance')),
    iconosAspecto: dds(path.join('main_menu', 'gfx', 'interface', 'icons', 'religious_aspects')),
  };
}

// localization/<lengua>/replace/ es una carpeta del motor para pisar textos del juego.
const carpetaDelJuego = (dir) => (/^main_menu\/localization\/[a-z_]+\/replace$/.test(dir) && fs.existsSync(path.join(JUEGO, path.posix.dirname(dir)))) || fs.existsSync(path.join(JUEGO, dir))
  || (fs.existsSync(path.join(JUEGO, 'dlc')) && fs.readdirSync(path.join(JUEGO, 'dlc')).some((d) => fs.existsSync(path.join(JUEGO, 'dlc', d, dir))));

function conocimiento() {
  const build = buildDelJuego();
  const ruta = path.join(AQUI, 'cache', `juego-${build}.json`);
  if (!args.includes('--rehaz-cache') && build !== 'desconocido' && fs.existsSync(ruta)) return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const c = construyeConocimiento();
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, JSON.stringify(c));
  return c;
}

if (!fs.existsSync(path.join(JUEGO, 'in_game'))) { console.error(`No encuentro el juego en ${JUEGO}`); process.exit(2); }
if (!fs.existsSync(MOD)) { console.error(`No encuentro el mod en ${MOD}`); process.exit(2); }
const C = conocimiento();
const S = (xs) => new Set(xs);
const J = Object.fromEntries(Object.entries(C.bd).map(([k, v]) => [k, S(v)]));
// Bases de datos que no estaban en la cache: se leen la primera vez que hacen falta y se
// guardan en la cache para las siguientes pasadas.
const EXTRA = ['religious_schools', 'holy_site_types', 'religious_focuses', 'international_organizations', 'generic_actions',
  'goods', 'traits', 'religious_figures', 'religious_factions', 'formable_countries', 'production_methods', 'unit_categories', 'subject_types', 'laws', 'policies', 'estate_privileges'];
let cacheCambia = false;
for (const sub of EXTRA) {
  if (C.bd[sub]) { J[sub] = S(C.bd[sub]); continue; }
  const s = new Set();
  const raices = [JUEGO, ...(fs.existsSync(path.join(JUEGO, 'dlc')) ? fs.readdirSync(path.join(JUEGO, 'dlc')).map((d) => path.join(JUEGO, 'dlc', d)) : [])];
  for (const r of raices) for (const k of clavesRapidas(path.join(r, 'in_game', 'common', sub))) s.add(k);
  C.bd[sub] = [...s]; J[sub] = s; cacheCambia = true;
}
if (cacheCambia && C.build !== 'desconocido') fs.writeFileSync(path.join(AQUI, 'cache', `juego-${C.build}.json`), JSON.stringify(C));
// Claves documentadas en los .info y readme del juego (con comentarios incluidos): son pocas
// y pequenas, asi que se leen en cada pasada en vez de guardarlas en la cache.
for (const sub of [path.join('in_game', 'common'), path.join('in_game', 'events'), path.join('main_menu', 'common')]) {
  for (const f of listaFicheros(path.join(JUEGO, sub), (r) => /\.info$|readme[^/\\]*\.txt$/i.test(r))) {
    for (const m of leeTexto(f).texto.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*(?:>=|<=|!=|\?=|==|=|>|<)/g)) C.vocab.push(m[1]);
  }
}
const VOCAB = S(C.vocab), SCOPES_JUEGO = S(C.scopes), GFX = S(C.gfx), ICON_AV = S(C.iconosAvance), ICON_ASP = S(C.iconosAspecto);
// Campos que el motor conoce y ningun script del juego usa (salen en eu5.exe entre los de su
// base de datos): has_rite_power va junto a has_avatars, el campo de religion que si se usa.
for (const k of ['has_rite_power']) VOCAB.add(k);
// religion_definition solo sale en el setup de paises del juego (in_game/setup/countries), que el
// vocabulario no lee; culture_definition, su pareja, si sale en scripts
VOCAB.add('religion_definition');
const RESERVADAS_AVANCE = S(C.clavesAvanceNoModificador);

// ---------------------------------------------------------------- ficheros del mod
// Ficheros del mundo que la copia vinculada reescribe a proposito (asigna-facciones.mjs: la
// vegetacion mezclada, los rangos y los paises nuevos). No son scripts nuestros: solo se mira que el mundo traiga el mismo fichero.
const COPIAS_MUNDO = ['in_game/map_data/location_templates.txt', 'main_menu/setup/1337/07_cities_and_buildings.txt', 'main_menu/setup/1337/10_countries.txt'];
const todos = listaFicheros(MOD).filter((f) => {
  const r = rel(f);
  if (!COPIAS_MUNDO.includes(r)) return true;
  if (MUNDO && fs.existsSync(path.join(MUNDO, r))) aviso(r, 0, 'sustituye al del mundo a proposito (vegetacion, rangos o paises nuevos)');
  else err(r, 0, 'es la copia de un fichero del mundo, pero el mundo no lo trae');
  return false;
});
// Paises que crea el propio mod (in_game/setup/countries, asigna-facciones.mjs): su nombre y su
// adjetivo van sin prefijo, como los del juego. El tag no puede ser uno del juego ni del mundo.
const tagsMod = new Map();
for (const f of todos.filter((x) => rel(x).startsWith('in_game/setup/countries/'))) leeTexto(f).texto.split('\n').forEach((ln, i) => { const m = ln.match(/^\uFEFF?([A-Z][A-Z0-9]{2})\s*=\s*\{/); if (m) tagsMod.set(m[1], [rel(f), i + 1]); });
if (tagsMod.size) for (const dir of [JUEGO, MUNDO].filter(Boolean)) {
  const d = path.join(dir, 'in_game', 'setup', 'countries');
  if (fs.existsSync(d)) for (const x of fs.readdirSync(d).filter((y) => y.endsWith('.txt'))) for (const m of leeTexto(path.join(d, x)).texto.matchAll(/^\uFEFF?([A-Z][A-Z0-9]{2})\s*=\s*\{/gm)) if (tagsMod.has(m[1])) err(...tagsMod.get(m[1]), `el tag ${m[1]} ya lo usa ${dir === JUEGO ? 'el juego' : 'el mundo'} (${x})`);
}
// gui/ no son scripts (tipos de mensaje, ventanas): el juego los lee con otro formato
const txts = todos.filter((f) => f.endsWith('.txt') && !rel(f).split('/').includes('gui'));
// tipos de modificador que define el propio mod
for (const f of txts) if (rel(f).startsWith('main_menu/common/modifier_type_definitions/')) for (const m of leeTexto(f).texto.matchAll(/^([A-Za-z0-9_]+)\s*=\s*\{/gm)) J.modifier_types.add(m[1]);
const ymls = todos.filter((f) => f.endsWith('.yml'));
const arboles = new Map();

for (const f of todos) {
  const r = rel(f);
  if (r.startsWith('.metadata/')) {
    if (!['.metadata/metadata.json', '.metadata/thumbnail.png'].includes(r)) aviso(r, 0, 'fichero inesperado en .metadata');
    continue;
  }
  const dir = path.posix.dirname(r);
  if (!carpetaDelJuego(dir)) err(r, 0, `la carpeta '${dir}' no existe en el juego: el juego no la leeria`);
  if (fs.existsSync(path.join(JUEGO, r))) err(r, 0, 'tiene la misma ruta que un fichero del juego y lo sustituiria entero');
  if (!/\.(txt|yml)$/.test(r)) aviso(r, 0, 'tipo de fichero inesperado');
  if (!/^(zz_)?gj_/.test(path.basename(r))) err(r, 0, 'el nombre no empieza por gj_ (puede chocar con el juego o el mundo RNW)');
}

for (const f of [...txts, ...ymls, path.join(MOD, '.metadata', 'metadata.json')]) {
  if (!fs.existsSync(f)) continue;
  const { tieneBom } = leeTexto(f);
  if (!tieneBom) err(rel(f), 0, 'falta el BOM UTF-8 (EF BB BF)');
  const crudo = fs.readFileSync(f);
  if (!crudo.toString('utf8').length || Buffer.compare(Buffer.from(crudo.toString('utf8'), 'utf8'), crudo) !== 0) err(rel(f), 0, 'no es UTF-8 valido');
}

for (const f of txts) {
  try { arboles.set(f, analizaFichero(f).arbol); } catch (e) { err(rel(f), e.linea, e.message.replace(/^linea \d+: /, '')); }
}

// ---------------------------------------------------------------- definiciones del mod
const M = {}; // carpeta -> Map(clave -> {f, item})
const carpetaDe = (f) => {
  const r = rel(f);
  let m = r.match(/^in_game\/common\/([^/]+)\//); if (m) return m[1];
  m = r.match(/^main_menu\/common\/([^/]+)\//); if (m) return 'mm_' + m[1];
  if (r.startsWith('in_game/events/')) return 'events';
  return null;
};
for (const [f, a] of arboles) {
  const c = carpetaDe(f); if (!c) continue;
  M[c] ??= new Map();
  for (const it of a.items) {
    if (!it.k || it.k === 'namespace') continue;
    if (c === 'mm_named_colors' && it.k === 'colors') { for (const x of it.v.items || []) if (x.k) { M.colores ??= new Map(); M.colores.set(x.k, { f, item: x }); } continue; }
    // Un gancho del juego (on_game_start, yearly_country_pulse...) puede salir en varios
    // ficheros como lista on_actions: el motor junta las listas, como entre mods.
    const ganchoRepetible = c === 'on_action' && J.on_action.has(it.k);
    if (M[c].has(it.k) && !ganchoRepetible) err(rel(f), it.l, `'${it.k}' definido dos veces en el mod (tambien en ${rel(M[c].get(it.k).f)})`);
    if (ganchoRepetible && M[c].has(it.k)) { (M[c].get(it.k).otros ??= []).push({ f, item: it }); continue; }
    M[c].set(it.k, { f, item: it });
  }
}
// Definiciones anidadas, como en el juego: los presagios dentro de cada dios (omens), los
// dialectos dentro de cada lengua (valen como lenguas) y los metodos de produccion propios
// de cada edificio (unique_production_methods).
const ANIDADAS = [['gods', 'omens', 'omens'], ['languages', 'dialects', 'languages'], ['building_types', 'unique_production_methods', 'production_methods'], ['laws', null, 'policies'], ['missions', null, 'mission_tasks']];
for (const [c, contenedor, destino] of ANIDADAS) for (const [, { f, item }] of [...(M[c] || new Map())]) {
  if (!esBloque(item.v)) continue;
  // contenedor null: los hijos directos del bloque (las politicas de una ley, como en el juego)
  const conts = contenedor ? hijos(item.v, contenedor) : [{ v: { tipo: 'bloque', items: item.v.items.filter((x) => x.k && x.k.startsWith('gj_') && esBloque(x.v)) } }];
  for (const cont of conts) for (const x of (esBloque(cont.v) ? cont.v.items : [])) {
    if (!x.k) continue;
    M[destino] ??= new Map();
    if (M[destino].has(x.k)) err(rel(f), x.l, `'${x.k}' definido dos veces en el mod (tambien en ${rel(M[destino].get(x.k).f)})`);
    else M[destino].set(x.k, { f, item: x, anidada: item.k });
  }
}
const def = (c) => M[c] || new Map();
const existe = (bdJuego, carpetaMod, k) => (J[bdJuego] && J[bdJuego].has(k)) || def(carpetaMod).has(k);

const BD_PREFIJO = { culture: 'cultures', religion: 'religions', pop_type: 'pop_types', estate_type: 'estates', building_type: 'building_types',
  culture_group: 'culture_groups', religion_group: 'religion_groups', language: 'languages', advance: 'advances', situation: 'situations',
  casus_belli: 'casus_belli', religious_aspect: 'religious_aspects', god: 'gods', disaster: 'disasters', government_reform: 'government_reforms',
  religious_school: 'religious_schools', holy_site_type: 'holy_site_types', religious_focus: 'religious_focuses', unit_type: 'unit_types',
  international_organization: 'international_organizations', trait: 'traits', law: 'laws', policy: 'policies', estate_privilege: 'estate_privileges', goods: 'goods' };

const clavesMod = new Set(); for (const m of Object.values(M)) for (const k of m.keys()) clavesMod.add(k);
// Parametros de los scripted_effects/triggers del mod ($clave$): valen como claves en sus llamadas.
for (const c of ['scripted_effects', 'scripted_triggers']) for (const { f } of def(c).values()) for (const m of leeTexto(f).texto.matchAll(/\$([A-Za-z0-9_]+)\$/g)) clavesMod.add(m[1]);
const variablesPuestas = new Set(); const scopesMod = new Set(); const usosVariable = []; const usosScope = []; const locNecesaria = new Map();
const pideLoc = (k, f, l) => { if (!locNecesaria.has(k)) locNecesaria.set(k, { f: rel(f), l }); };
// Textos que el juego no exige (de 2.843 modificadores estaticos del juego, solo 606 tienen _DESC_).
const locOpcional = new Set();

// ---------------------------------------------------------------- recorrido general
const esNumero = (v) => /^-?\d+(\.\d+)?$/.test(v);
for (const [f, a] of arboles) {
  const r = rel(f);
  recorre(a, (it, pila) => {
    if (it.k === 'save_scope_as' && typeof it.v === 'string') scopesMod.add(it.v);
    if (it.k === 'set_variable') {
      if (typeof it.v === 'string') variablesPuestas.add(it.v);
      else if (esBloque(it.v)) { const n = hijo(it.v, 'name'); if (n) variablesPuestas.add(n.v); }
    }
    if (it.k === 'has_variable' && typeof it.v === 'string') usosVariable.push({ v: it.v, r, l: it.l });
    // valores con nombre tipo honor_weak_bonus: tienen que ser valores de script del juego
    if (typeof it.v === 'string' && !it.cad && /^[a-z][a-z0-9_]*_(bonus|penalty|satisfaction|move(_to_(left|right))?)$/.test(it.v) && !J.script_values.has(it.v)) {
      err(r, it.l, `valor de script '${it.v}' no existe en script_values`);
    }
    // vocabulario: la clave tiene que existir en el juego o en el mod
    const k = it.k;
    if (k && !k.includes('$') && !esNumero(k) && !k.includes(':') && !k.includes('.') && !/^[A-Z][A-Z0-9]{2}$/.test(k) && !VOCAB.has(k) && !clavesMod.has(k) && !J.modifier_types.has(k)) {
      const enColores = pila[0] === 'colors';
      if (!enColores) err(r, it.l, `clave '${k}' desconocida: no sale en ningun script del juego ni se define en el mod`);
    }
    // referencias tipo bd:clave, en claves y en valores
    for (const tok of [it.k, typeof it.v === 'string' ? it.v : null]) {
      if (!tok || tok.includes('$')) continue; // $param$: se resuelve en la llamada
      for (const m of tok.matchAll(/(?:^|[^A-Za-z0-9_.])([a-z_]+):([A-Za-z0-9_]+)/g)) {
        const [, pref, clave] = m;
        if (pref === 'scope') { usosScope.push({ v: clave, r, l: it.l }); continue; }
        const bdk = BD_PREFIJO[pref];
        if (bdk && !existe(bdk, bdk, clave)) err(r, it.l, `${pref}:${clave} no existe en el juego ni en el mod`);
      }
    }
  });
}

// ---------------------------------------------------------------- modificadores
function compruebaModificadores(f, bloque, reservadas = new Set()) {
  if (!esBloque(bloque)) return;
  for (const it of bloque.items) {
    if (!it.k || reservadas.has(it.k)) continue;
    if (!J.modifier_types.has(it.k)) { err(rel(f), it.l, `modificador '${it.k}' no existe en modifier_type_definitions`); continue; }
    if (typeof it.v !== 'string') { err(rel(f), it.l, `el modificador '${it.k}' necesita un valor, no un bloque`); continue; }
    if (!esNumero(it.v) && !['yes', 'no'].includes(it.v) && !J.script_values.has(it.v)) err(rel(f), it.l, `valor '${it.v}' de '${it.k}' no es un numero ni un valor de script del juego`);
  }
}
for (const [c, mapa] of Object.entries(M)) {
  for (const [k, { f, item }] of mapa) {
    const b = item.v;
    if (!esBloque(b)) continue;
    if (c === 'cultures' || c === 'culture_groups') for (const s of ['country_modifier', 'location_modifier', 'character_modifier']) for (const h of hijos(b, s)) compruebaModificadores(f, h.v);
    if (c === 'religions') for (const h of hijos(b, 'definition_modifier')) compruebaModificadores(f, h.v);
    if (c === 'religion_groups' || c === 'religious_aspects') for (const h of hijos(b, 'modifier')) compruebaModificadores(f, h.v);
    if (c === 'mm_static_modifiers') compruebaModificadores(f, b, S(['game_data']));
    if (c === 'auto_modifiers') compruebaModificadores(f, b, S(['potential_trigger', 'limit', 'scales_with', 'category', 'type', 'icon', 'requires_real', 'hide_effects', 'alert']));
    if (c === 'advances') compruebaModificadores(f, b, RESERVADAS_AVANCE);
  }
}

// ---------------------------------------------------------------- referencias por tipo
const necesita = (f, it, cond, msg) => { if (!cond) err(rel(f), it.l, msg); };
for (const [k, { f, item }] of def('cultures')) {
  pideLoc(k, f, item.l);
  const b = item.v;
  const lang = hijo(b, 'language'); necesita(f, item, lang, `la cultura ${k} no tiene language`);
  if (lang) necesita(f, lang, existe('languages', 'languages', lang.v), `language '${lang.v}' no existe`);
  const col = hijo(b, 'color'); if (col && typeof col.v === 'string') necesita(f, col, J.named_colors.has(col.v) || def('colores').has(col.v), `color '${col.v}' no existe`);
  for (const t of hijos(b, 'tags')) for (const v of valoresSueltos(t.v)) necesita(f, t, GFX.has(v), `etiqueta grafica '${v}' no la usa ninguna cultura del juego`);
  for (const g of hijos(b, 'culture_groups')) for (const v of valoresSueltos(g.v)) necesita(f, g, existe('culture_groups', 'culture_groups', v), `grupo de cultura '${v}' no existe`);
}
// Dos etiquetas graficas de una cultura con la misma prioridad: el juego avisa «has graphical cultures
// with conflicting priorities» (error.log, graphical_culturetype.cpp:522). Prioridades: las de
// in_game/gfx/graphical_culture_types del juego, sus DLC y el mod (ninguna cultura del juego empata).
{
  const prio = new Map();
  for (const raiz of [JUEGO, ...(fs.existsSync(path.join(JUEGO, 'dlc')) ? fs.readdirSync(path.join(JUEGO, 'dlc')).sort().map((d) => path.join(JUEGO, 'dlc', d)) : []), MOD]) {
    for (const f of listaFicheros(path.join(raiz, 'in_game', 'gfx', 'graphical_culture_types'), (r) => r.endsWith('.txt')).sort()) {
      for (const it of analizaFichero(f).arbol.items) { const p = it.k && hijo(it.v, 'priority'); if (p) prio.set(it.k, Number(p.v)); }
    }
  }
  if (!prio.size) aviso('in_game/common/cultures', 0, 'no encuentro las prioridades graficas del juego (in_game/gfx/graphical_culture_types): no compruebo empates');
  for (const [k, { f, item }] of def('cultures')) {
    const vistas = new Map();
    for (const t of hijos(item.v, 'tags')) for (const v of valoresSueltos(t.v)) {
      if (!prio.has(v)) continue;
      const otra = vistas.get(prio.get(v));
      if (otra && otra !== v) err(rel(f), t.l, `la cultura ${k} tiene dos etiquetas graficas con la misma prioridad ${prio.get(v)}: ${otra} y ${v} (el juego avisa: graphical_culturetype.cpp:522)`);
      vistas.set(prio.get(v), v);
    }
  }
}
for (const [k, { f, item }] of def('culture_groups')) pideLoc(k, f, item.l);
for (const [k, { f, item }] of def('language_families')) { pideLoc(k, f, item.l); const col = hijo(item.v, 'color'); if (col && typeof col.v === 'string') necesita(f, col, J.named_colors.has(col.v) || def('colores').has(col.v), `color '${col.v}' no existe`); }
// Presagios y metodos de produccion propios llevan nombre en pantalla, como en el juego.
for (const c of ['omens', 'production_methods', 'policies']) for (const [k, { f, item }] of def(c)) pideLoc(k, f, item.l);
// Las tareas de una mision (hijos gj_ del bloque, como en ____Info.txt) llevan nombre; descripcion y consejo, opcionales.
for (const [k, { f, item }] of def('mission_tasks')) { pideLoc(k, f, item.l); locOpcional.add(k + '_desc'); locOpcional.add(k + '_tip'); }
// Los nombres que ya tienen texto en el juego (character_names) no hace falta traducirlos.
const NOMBRES_JUEGO = new Set();
for (const lg of ['spanish', 'english']) {
  const fn = path.join(JUEGO, 'main_menu', 'localization', lg, `character_names_l_${lg}.yml`);
  if (fs.existsSync(fn)) for (const m of leeTexto(fn).texto.matchAll(/^ ([^\s:#]+):\d* "/gm)) NOMBRES_JUEGO.add(m[1]);
}
const pideNombre = (v, f, l) => { if (!NOMBRES_JUEGO.has(v) && !/^name_|\./.test(v)) pideLoc(v, f, l); };
for (const [k, { f, item, anidada }] of def('languages')) {
  pideLoc(k, f, item.l);
  for (const s of ['male_names', 'female_names', 'dynasty_names', 'ship_names', 'lowborn']) for (const h of hijos(item.v, s)) for (const v of valoresSueltos(h.v)) pideNombre(v, f, h.l);
  if (anidada) continue; // dialecto: hereda familia y color de su lengua
  const fam = hijo(item.v, 'family'); if (fam) necesita(f, fam, existe('language_families', 'language_families', fam.v), `familia '${fam.v}' no existe`);
  const col = hijo(item.v, 'color'); if (col && typeof col.v === 'string') necesita(f, col, J.named_colors.has(col.v) || def('colores').has(col.v), `color '${col.v}' no existe`);
  if (!hijo(item.v, 'lowborn')) aviso(rel(f), item.l, `la lengua ${k} no tiene lowborn = { } (436 de 446 lenguas del juego lo traen)`);
  for (const s of ['male_names', 'female_names', 'dynasty_names', 'ship_names']) {
    const h = hijo(item.v, s);
    if (!h) { if (s !== 'ship_names') aviso(rel(f), item.l, `la lengua ${k} no tiene ${s}`); continue; }
    const vs = valoresSueltos(h.v);
    if (vs.length < 10 && s !== 'ship_names') aviso(rel(f), h.l, `${s} con solo ${vs.length} nombres`);
  }
}
for (const [k, { f, item }] of def('religion_groups')) pideLoc(k, f, item.l);
for (const [k, { f, item }] of def('religions')) {
  for (const s of ['', '_ADJ', '_desc']) pideLoc(k + s, f, item.l);
  const g = hijo(item.v, 'group'); necesita(f, item, g, `la religion ${k} no tiene group`);
  if (g) necesita(f, g, existe('religion_groups', 'religion_groups', g.v), `grupo de religion '${g.v}' no existe`);
  const lang = hijo(item.v, 'language'); if (lang) necesita(f, lang, existe('languages', 'languages', lang.v), `language '${lang.v}' no existe`);
  const col = hijo(item.v, 'color'); if (col && typeof col.v === 'string') necesita(f, col, J.named_colors.has(col.v) || def('colores').has(col.v), `color '${col.v}' no existe`);
  const mecanicas = item.v.items.filter((x) => /^has_[a-z_]+$/.test(x.k || '') && x.v === 'yes').map((x) => x.k);
  if (!mecanicas.length) aviso(rel(f), item.l, `la religion ${k} no activa ninguna mecanica del motor (has_*)`);
  const nasp = [...def('religious_aspects').values()].filter((a) => hijos(a.item.v, 'religion').some((x) => x.v === k)).length;
  const pide = Number((hijo(item.v, 'religious_aspects') || {}).v || 0);
  if (pide > nasp) err(rel(f), item.l, `la religion ${k} pide ${pide} aspectos y solo hay ${nasp}`);
}
for (const [k, { f, item }] of def('religious_aspects')) {
  pideLoc(k, f, item.l); pideLoc(k + '_desc', f, item.l);
  for (const x of hijos(item.v, 'religion')) necesita(f, x, existe('religions', 'religions', x.v), `religion '${x.v}' no existe`);
  const ic = hijo(item.v, 'icon'); if (ic) necesita(f, ic, ICON_ASP.has(ic.v), `icono de aspecto '${ic.v}' no existe en gfx/interface/icons/religious_aspects`);
}
for (const [k, { f, item }] of def('advances')) {
  pideLoc(k, f, item.l); pideLoc(k + '_desc', f, item.l);
  const age = hijo(item.v, 'age'); necesita(f, item, age, `el avance ${k} no tiene age`);
  if (age) necesita(f, age, J.age.has(age.v), `edad '${age.v}' no existe`);
  for (const rq of hijos(item.v, 'requires')) necesita(f, rq, existe('advances', 'advances', rq.v), `requires '${rq.v}' no existe`);
  const ic = hijo(item.v, 'icon'); if (ic) necesita(f, ic, ICON_AV.has(ic.v), `icono de avance '${ic.v}' no existe en gfx/interface/advance`);
  necesita(f, item, hijo(item.v, 'potential'), `el avance ${k} no tiene potential: lo veria todo el mundo`);
}
for (const [k, { f, item }] of def('mm_static_modifiers')) { pideLoc('STATIC_MODIFIER_NAME_' + k, f, item.l); locOpcional.add('STATIC_MODIFIER_DESC_' + k); }
for (const [k, { f, item }] of def('auto_modifiers')) { pideLoc('AUTO_MODIFIER_NAME_' + k, f, item.l); locOpcional.add('AUTO_MODIFIER_DESC_' + k); }

// on_actions: los ganchos del juego van en lista, y cada sub-on_action existe.
const ganchosJuego = J.on_action;
// Cada definicion cuenta, tambien las repetidas de un gancho del juego (van en .otros).
const definicionesOnAction = [...def('on_action')].flatMap(([k, e]) => [[k, e], ...(e.otros || []).map((o) => [k, o])]);
for (const [k, { f, item }] of definicionesOnAction) {
  const esGancho = ganchosJuego.has(k);
  if (esGancho) {
    for (const x of item.v.items) if (x.k !== 'on_actions') err(rel(f), x.l, `en el gancho del juego '${k}' solo se admite on_actions (un '${x.k}' directo pisaria el de vanilla)`);
  } else if (!/^gj_/.test(k)) err(rel(f), item.l, `on_action '${k}' no existe en el juego y no es nuestro (gj_)`);
  for (const lista of hijos(item.v, 'on_actions')) for (const v of valoresSueltos(lista.v)) necesita(f, lista, ganchosJuego.has(v) || def('on_action').has(v), `sub-on_action '${v}' no existe`);
  for (const tipo of ['events', 'random_events']) for (const ev of hijos(item.v, tipo)) {
    for (const x of ev.v.items) {
      const id = x.k === null ? x.v : (esNumero(x.k) ? x.v : null);
      if (id && /\./.test(id)) necesita(f, x, def('events').has(id) || !/^gj_/.test(id), `evento '${id}' no existe en el mod`);
    }
  }
}
// Un on_action propio que nadie llama (ni una lista on_actions, ni un evento, ni un efecto) es
// contenido muerto. Los ganchos del juego solo pueden estar en el fichero de la integracion.
{
  const textoMod = [...arboles.keys()].map((f) => leeTexto(f).texto.replace(/#[^\n]*/g, '')).join('\n');
  for (const [k, { f, item }] of def('on_action')) {
    if (/^gj_/.test(k) && (textoMod.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length <= 1) err(rel(f), item.l, `on_action '${k}' no lo llama nadie: engánchalo a un gancho del juego (lista on_actions), a un evento o a un efecto`);
  }
  for (const [k, { f, item }] of definicionesOnAction) if (ganchosJuego.has(k) && !/gj_integracion_on_actions\.txt$/.test(rel(f))) err(rel(f), item.l, `el gancho del juego '${k}' va solo en gj_integracion_on_actions.txt (lo genera funde-partes.mjs)`);
}

// eventos
const eventos = def('events');
for (const [f, a] of arboles) {
  if (carpetaDe(f) !== 'events') continue;
  const ns = hijo(a, 'namespace');
  if (!ns) { err(rel(f), 1, 'falta namespace'); continue; }
  for (const it of a.items) {
    if (!it.k || it.k === 'namespace') continue;
    if (!it.k.startsWith(ns.v + '.')) err(rel(f), it.l, `el evento '${it.k}' no usa el namespace '${ns.v}'`);
    const n = Number(it.k.split('.')[1]);
    if (!(n >= 1 && n <= 9999)) err(rel(f), it.l, `numero de evento fuera de 1-9999 en '${it.k}'`);
    const b = it.v;
    const tipo = hijo(b, 'type');
    necesita(f, it, tipo && ['country_event', 'location_event', 'unit_event', 'exploration_event', 'age_event'].includes(tipo.v), `tipo de evento invalido en ${it.k}`);
    const oculto = (hijo(b, 'hidden') || {}).v === 'yes';
    for (const s of ['title', 'desc']) {
      const x = hijo(b, s);
      if (!x && !oculto) err(rel(f), it.l, `${it.k} sin ${s}`);
      if (x && typeof x.v === 'string') pideLoc(x.v, f, x.l);
    }
    const opciones = hijos(b, 'option');
    if (!oculto && !opciones.length) err(rel(f), it.l, `${it.k} sin opciones`);
    for (const o of opciones) {
      const nm = hijo(o.v, 'name');
      if (!nm) err(rel(f), o.l, `opcion sin name en ${it.k}`); else pideLoc(nm.v, f, nm.l);
    }
    // scopes que nombra el texto: tienen que guardarse en el propio evento
    const guardados = new Set(); recorre(b, (x) => { if (x.k === 'save_scope_as') guardados.add(x.v); });
    eventos.get(it.k).guardados = guardados;
  }
}
// trigger_event_*: el id existe
for (const [f, a] of arboles) recorre(a, (it) => {
  if (/^trigger_event/.test(it.k || '')) {
    const id = esBloque(it.v) ? (hijo(it.v, 'id') || {}).v : it.v;
    if (id && id.startsWith('gj_') && !eventos.has(id)) err(rel(f), it.l, `trigger de evento a '${id}', que no existe`);
  }
  if (it.k === 'change_country_name' && typeof it.v === 'string' && !/^[A-Z]{3}$/.test(it.v) && !it.v.includes('$')) { pideLoc(it.v, f, it.l); pideLoc(it.v + '_ADJ', f, it.l); }
  if (it.k === 'nombre' && /^GJ_[A-Z0-9_]+$/.test(it.v || '')) { pideLoc(it.v, f, it.l); pideLoc(it.v + '_ADJ', f, it.l); }
  if (it.k === 'modifier' && typeof it.v === 'string' && !it.v.includes('$') && !/opinion/.test(it.v)) {
    necesita(f, it, J.static_modifiers.has(it.v) || def('mm_static_modifiers').has(it.v), `modificador estatico '${it.v}' no existe`);
  }
  if (/^change_country_color$/.test(it.k || '') && typeof it.v === 'string' && !it.v.includes('$')) necesita(f, it, J.named_colors.has(it.v) || def('colores').has(it.v), `color '${it.v}' no existe`);
});
// scripted triggers/effects llamados con "= yes"
for (const [f, a] of arboles) recorre(a, (it) => {
  if (it.k && it.k.startsWith('gj_') && !it.k.includes('$') && (it.v === 'yes' || it.v === 'no')) {
    if (!def('scripted_triggers').has(it.k) && !def('scripted_effects').has(it.k)) err(rel(f), it.l, `'${it.k}' no es un scripted_trigger ni un scripted_effect del mod`);
  }
});
const patronesVariable = [...variablesPuestas].filter((v) => v.includes('$')).map((v) => new RegExp('^' + v.replace(/\$[A-Za-z0-9_]+\$/g, '[A-Za-z0-9_]+') + '$'));
for (const u of usosVariable) if (!variablesPuestas.has(u.v) && !patronesVariable.some((re) => re.test(u.v)) && u.v.startsWith('gj_')) err(u.r, u.l, `has_variable = ${u.v}, pero ningun set_variable la pone`);
for (const u of usosScope) if (!scopesMod.has(u.v) && !SCOPES_JUEGO.has(u.v)) err(u.r, u.l, `scope:${u.v} no se guarda en el mod (save_scope_as) ni es un scope del motor`);

// ---------------------------------------------------------------- localizacion
const loc = Object.fromEntries(LENGUAS.map((l) => [l, new Map()]));
const reLinea = /^ ([A-Za-z0-9_.\-']+):\d* "(.*)"\s*(#.*)?$/;
// Claves de texto del juego, por lengua: solo hacen falta si el mod trae replace/.
const locReplace = new Set(); const locJuegoCache = {};
const locJuego = (lg) => locJuegoCache[lg] ??= new Set(listaFicheros(path.join(JUEGO, 'main_menu', 'localization', lg), (x) => x.endsWith('.yml')).flatMap((x) => [...leeTexto(x).texto.matchAll(/^ ([A-Za-z0-9_.\-']+):/gm)].map((mm) => mm[1])));
// y las del mundo (--mundo): en replace/ tambien vale pisar una clave de RNW (rnw_loc_*)
const locMundoCache = {}, replacePor = {};
const locMundo = (lg) => locMundoCache[lg] ??= new Set(MUNDO ? listaFicheros(path.join(MUNDO, 'main_menu', 'localization', lg), (x) => x.endsWith('.yml')).flatMap((x) => [...leeTexto(x).texto.matchAll(/^ ([A-Za-z0-9_.\-']+):/gm)].map((mm) => mm[1])) : []);
for (const f of ymls) {
  const r = rel(f);
  const esReplace = /^main_menu\/localization\/[a-z_]+\/replace\//.test(r);
  const m = r.match(/^main_menu\/localization\/([a-z_]+)\/(?:replace\/)?[^/]+_l_([a-z_]+)\.yml$/);
  if (!m) { err(r, 0, 'ruta de localizacion invalida (main_menu/localization/<lengua>/<nombre>_l_<lengua>.yml)'); continue; }
  if (m[1] !== m[2]) err(r, 0, `carpeta '${m[1]}' y sufijo '_l_${m[2]}' no coinciden`);
  if (!LENGUAS.includes(m[1])) { aviso(r, 0, `lengua ${m[1]} no comprobada`); continue; }
  const lineas = leeTexto(f).texto.split(/\r?\n/);
  if (lineas[0].trim() !== `l_${m[1]}:`) err(r, 1, `la primera linea tiene que ser 'l_${m[1]}:'`);
  lineas.slice(1).forEach((ln, i) => {
    const l = i + 2;
    if (/^\s*(#.*)?$/.test(ln)) return;
    if (ln.includes('\t')) err(r, l, 'tabulador en la localizacion');
    const mm = ln.match(reLinea);
    if (!mm) { err(r, l, 'linea de localizacion mal formada'); return; }
    const [, k, val] = mm;
    if (loc[m[1]].has(k)) err(r, l, `clave '${k}' repetida`);
    loc[m[1]].set(k, { val, r, l });
    if (esReplace) { locReplace.add(k); ((replacePor[path.basename(r).replace(/_l_[a-z_]+\.yml$/, '')] ??= {})[m[1]] ??= new Set()).add(k); if (!locJuego(m[1]).has(k) && !locMundo(m[1]).has(k)) err(r, l, `clave '${k}' en replace/ que no existe en el juego${MUNDO ? ' ni en el mundo' : ' (sin --mundo no miro las del mundo)'}: no pisa nada`); }
    else if (!/gj_|GJ_/.test(k) && !tagsMod.has(k.replace(/_ADJ$/, ''))) err(r, l, `clave '${k}' sin prefijo gj_: puede pisar una del juego`);
    for (const s of val.matchAll(/SCOPE\.s[A-Za-z]+\('([a-z_0-9]+)'\)/g)) if (!scopesMod.has(s[1])) err(r, l, `el texto usa el scope '${s[1]}', que no se guarda en ningun evento`);
    const abre = (val.match(/\[/g) || []).length, cierra = (val.match(/\]/g) || []).length;
    if (abre !== cierra) err(r, l, 'corchetes [ ] desequilibrados');
    for (const d of val.matchAll(/\$([A-Za-z0-9_]+)\$/g)) if (!loc[m[1]].has(d[1])) aviso(r, l, `$${d[1]}$ no esta en el mod (puede ser del juego)`);
  });
}
for (const [k, o] of locNecesaria) for (const lg of LENGUAS) if (!loc[lg].has(k) && !locJuego(lg).has(k)) err(o.f, o.l, `falta la localizacion '${k}' en ${lg}`);
for (const k of loc.spanish.keys()) if (!loc.english.has(k) && !locReplace.has(k)) err(loc.spanish.get(k).r, loc.spanish.get(k).l, `'${k}' esta en spanish y no en english`);
for (const k of loc.english.keys()) if (!loc.spanish.has(k) && !locReplace.has(k)) err(loc.english.get(k).r, loc.english.get(k).l, `'${k}' esta en english y no en spanish`);
// un fichero de replace/ que va en las dos lenguas pisa las mismas claves en las dos (si no, un nombre cambiaria con el idioma)
for (const [base, por] of Object.entries(replacePor)) for (const [a, b] of [['spanish', 'english'], ['english', 'spanish']]) {
  if (!por[a] || !por[b]) continue;
  const faltanR = [...por[a]].filter((k) => !por[b].has(k));
  if (faltanR.length) err(`main_menu/localization/${b}/replace/${base}_l_${b}.yml`, 0, `${faltanR.length} claves de ${base}_l_${a}.yml que no estan en ${b} (p. ej. ${faltanR.slice(0, 3).join(' ')})`);
}
for (const k of loc.spanish.keys()) if (!locNecesaria.has(k) && !locOpcional.has(k) && !locReplace.has(k)) aviso(loc.spanish.get(k).r, loc.spanish.get(k).l, `'${k}' no lo usa ningun script del mod`);

// ---------------------------------------------------------------- descriptor
const rutaMeta = path.join(MOD, '.metadata', 'metadata.json');
let meta = null;
if (!fs.existsSync(rutaMeta)) err('.metadata/metadata.json', 0, 'no existe');
else {
  try { meta = JSON.parse(leeTexto(rutaMeta).texto); } catch (e) { err('.metadata/metadata.json', 0, 'JSON invalido: ' + e.message); }
  if (meta) {
    for (const k of ['name', 'id', 'version', 'game_id', 'supported_game_version', 'short_description', 'tags', 'relationships', 'game_custom_data']) if (!(k in meta)) err('.metadata/metadata.json', 0, `falta '${k}'`);
    if (meta.game_id !== 'eu5') err('.metadata/metadata.json', 0, "game_id tiene que ser 'eu5'");
    if (meta.supported_game_version && !'1.4.9'.startsWith(meta.supported_game_version.replace('*', ''))) err('.metadata/metadata.json', 0, `supported_game_version '${meta.supported_game_version}' no cubre la 1.4.9`);
    if (meta.id !== path.basename(MOD)) aviso('.metadata/metadata.json', 0, `id '${meta.id}' distinto del nombre de la carpeta`);
    if (/^rnw_exp_/.test(path.basename(MOD))) err('.metadata/metadata.json', 0, 'la carpeta no puede empezar por rnw_exp_ (el instalador de RNW la retiraria)');
    for (const r of meta.relationships || []) for (const k of ['rel_type', 'id', 'display_name', 'resource_type', 'version']) if (!(k in r)) err('.metadata/metadata.json', 0, `relationship sin '${k}'`);
    if (meta.game_custom_data && Object.keys(meta.game_custom_data).some((k) => k !== 'replace_paths')) err('.metadata/metadata.json', 0, 'game_custom_data solo admite replace_paths');
  }
}
const rutaMini = path.join(MOD, '.metadata', 'thumbnail.png');
if (!fs.existsSync(rutaMini)) err('.metadata/thumbnail.png', 0, 'no existe');
else {
  const b = fs.readFileSync(rutaMini);
  if (b.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') err('.metadata/thumbnail.png', 0, 'no es un PNG');
  if (b.length >= 1024 * 1024) err('.metadata/thumbnail.png', 0, 'pesa 1 MB o mas');
}

// ---------------------------------------------------------------- privacidad
const PRIV = [[/\b[A-Za-z]:[\\/]/, 'ruta con letra de unidad'], [/file:\/\//i, 'file://'], [/[\\/]Users[\\/]/i, 'carpeta de usuario'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/, 'correo'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, 'UUID'], [/S-1-5-21-/, 'SID']];
// Los nombres de personas que no pueden salir son de esta maquina (local.json o GJ_NOMBRES_PRIVADOS), no del repo
const NOMBRES = [...(LOCAL.nombres_privados || []), ...(process.env.GJ_NOMBRES_PRIVADOS || '').split(',')].map((s) => s.trim()).filter(Boolean);
if (NOMBRES.length) PRIV.push([new RegExp(`\\b(${NOMBRES.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i'), 'nombre de persona']);
for (const f of [...txts, ...ymls, rutaMeta]) {
  if (!fs.existsSync(f)) continue;
  leeTexto(f).texto.split('\n').forEach((ln, i) => { for (const [re, q] of PRIV) if (re.test(ln)) err(rel(f), i + 1, `privacidad: ${q}`); });
}

// ---------------------------------------------------------------- vinculo con el mundo
const vincs = [...def('scripted_triggers').entries()].filter(([k]) => /^gj_[a-z0-9_]+_tag_inicial$/.test(k));
const tagsVinculo = new Map();
if (!vincs.length) err('in_game/common/scripted_triggers', 0, 'no hay ningun gj_<clave>_tag_inicial (lo escribe funde-partes.mjs)');
for (const [k, { f, item }] of vincs) {
  const t = hijo(item.v, 'tag'); const no = hijo(item.v, 'always');
  if (t) {
    if ([...tagsVinculo.values()].includes(t.v)) err(rel(f), item.l, `la etiqueta ${t.v} esta asignada a dos facciones`);
    tagsVinculo.set(k, t.v);
  } else if (!(no && no.v === 'no')) err(rel(f), item.l, `${k} tiene que ser { tag = XXX } o { always = no }`);
}
if (!tagsVinculo.size) aviso('in_game/common/scripted_triggers', 0, 'sin mundo vinculado: el mod se carga pero no crea ninguna faccion (corre asigna-facciones.mjs)');
if (MUNDO && tagsVinculo.size) {
  const paises = path.join(MUNDO, 'main_menu', 'setup', '1337', '10_countries.txt');
  if (!fs.existsSync(paises)) err('--mundo', 0, `no encuentro el 10_countries.txt del mundo`);
  else {
    const lista = hijo(hijo(analizaFichero(paises).arbol, 'countries')?.v, 'countries');
    for (const [k, t] of tagsVinculo) if (!lista || !hijo(lista.v, t)) err('in_game/common/scripted_triggers', 0, `${k}: la etiqueta ${t} no esta en el 10_countries.txt del mundo`);
  }
}
const tagVinculo = tagsVinculo.size ? [...tagsVinculo].map(([k, t]) => `${k.replace(/^gj_|_tag_inicial$/g, '')}=${t}`).join(' ') : null;

// ---------------------------------------------------------------- informe
const cuenta = (c) => def(c).size;
console.log(`comprueba-mod: juego build ${C.build}; mod ${path.basename(MOD)}; ${txts.length} scripts, ${ymls.length} ficheros de texto.`);
console.log(`  definido: ${cuenta('cultures')} cultura, ${cuenta('languages')} lengua, ${cuenta('religions')} religion, ${cuenta('religious_aspects')} aspectos, ${cuenta('advances')} avances, ${eventos.size} eventos, ${cuenta('mm_static_modifiers')} modificadores, ${cuenta('on_action')} on_actions; ${loc.spanish.size} textos es / ${loc.english.size} en.`);
console.log(`  vinculo: ${tagVinculo || 'ninguno'}${MUNDO ? ' (mundo comprobado)' : ''}`);
for (const a of avisos) console.log(a);
for (const e of errores) console.log(e);
console.log(`RESULTADO: ${errores.length ? 'FALLA' : 'PASA'} (${errores.length} errores, ${avisos.length} avisos)`);
process.exit(errores.length ? 1 : 0);
