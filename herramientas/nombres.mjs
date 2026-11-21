// Nombres inventados por tabla de silabas (estilos-nombres.json): lugares, paises, culturas y
// personas. Determinista: la semilla de cada nombre es un SHA-256 de su clave y su estilo, sin
// Date ni Math.random; dos PC con el mismo mundo dan los mismos bytes.
//   vinculoNombres(...)   lo que asigna-facciones.mjs mete en vinculo.json (estilo de cada
//                         localizacion, cultura y nombre de cada pais de relleno)
//   lugares(...)          nombre unico de cada localizacion (funde-partes.mjs)
//   ficherosCulturas(...) grupos, culturas, lenguas, colores y textos de los grupos nuevos
// Prueba: node nombres.mjs  (comprueba la tabla y saca 10 nombres por estilo)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------- mandos (calibrar en partida)
export const MANDOS = {
  NUCLEOS: [0, 1, 1, 2],     // silabas de nucleo entre inicio y coda (una al azar de la lista)
  NUCLEOS_PERSONA: [0, 0, 1], // lo mismo en nombres de persona
  P_SUFIJO: 0.3,             // probabilidad de sufijo en un toponimo (el estilo puede dar p_sufijo)
  P_PREFIJO: 0.08,           // probabilidad de palabra delante, si el estilo trae prefijos (o p_prefijo)
  LARGO: [4, 12],          // letras de un nombre, sin la palabra de delante
  INTENTOS: 400,             // intentos por nombre antes de rendirse
  PERSONAS: { m: 30, f: 30, d: 20 }, // varones, mujeres y dinastias de cada lengua nueva
};
// city_data del juego (main_menu/gfx/map/city_data/*.txt, culture_data = { graphical_culture = X }):
// la malla de ciudad de cada etiqueta base
export const MALLAS = { european_gfx: 'northgerman', east_asian_gfx: 'chinese', indian_gfx: 'indian', middle_east_gfx: 'syrian',
  african_gfx: 'ashanti', north_american_gfx: 'iroquois', south_american_gfx: 'mesoamerican' };

const AQUI = path.dirname(fileURLToPath(import.meta.url));

export function cargaEstilos(ruta = path.join(AQUI, 'estilos-nombres.json')) {
  const t = JSON.parse(fs.readFileSync(ruta, 'utf8'));
  const resuelve = (id, vistos = []) => {
    const e = t.estilos[id];
    if (!e) throw new Error(`nombres: el estilo '${id}' no existe en estilos-nombres.json`);
    if (vistos.includes(id)) throw new Error(`nombres: herencia en circulo: ${[...vistos, id].join(' -> ')}`);
    return e.hereda ? { ...resuelve(e.hereda, [...vistos, id]), ...e } : e;
  };
  t.E = Object.fromEntries(Object.keys(t.estilos).map((k) => [k, resuelve(k)]));
  for (const [k, e] of Object.entries(t.E)) for (const c of ['inicio', 'coda']) if (!e[c]?.length) throw new Error(`nombres: el estilo '${k}' no tiene ${c}`);
  t.re = new RegExp(t.prohibido, 'i');
  for (const g of t.grupos) {
    if (!t.E[g.id]) throw new Error(`nombres: el grupo '${g.id}' no tiene estilo`);
    g.grupo = `gj_grupo_${g.id}`; g.lengua = `gj_lengua_${g.id}`;
  }
  return t;
}

// ---------------------------------------------------------------- azar con semilla
function azar(...partes) {
  let h = crypto.createHash('sha256').update(partes.join('|')).digest(), i = 0;
  return () => { if (i + 4 > h.length) { h = crypto.createHash('sha256').update(h).digest(); i = 0; } const v = h.readUInt32BE(i); i += 4; return v / 2 ** 32; };
}
const elige = (r, xs) => xs[Math.floor(r() * xs.length)];
const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const pule = (s) => { s = s.toLowerCase().replace(/(.)\1\1+/g, '$1$1'); return s.charAt(0).toUpperCase() + s.slice(1); };
// largo, nada prohibido, sin silabas repetidas, sin 3 vocales ni 4 consonantes seguidas y sin
// vocal doble (salvo en los estilos que la piden: fines)
const vale = (T, s, e = {}) => {
  const letras = s.replace(/[^\p{L}]/gu, '').length, b = sinTildes(s).toLowerCase();
  return letras >= MANDOS.LARGO[0] && letras <= MANDOS.LARGO[1] && !T.re.test(b) && !/(.{3,})\1/.test(b)
    && !/[aeiouy]{3}/.test(b) && !/[^aeiouy\s]{4}/.test(b) && (e.vocales_dobles || !/([aeiou])\1/.test(b));
};
const raiz = (e, r, nucleos) => { let s = elige(r, e.inicio); const n = elige(r, nucleos); for (let i = 0; i < n && e.nucleo?.length; i++) s += elige(r, e.nucleo); return s; };

// Un candidato (o null si no vale). tipo: lugar, pais, m, f, d, adj, cultura, grupo, lengua.
export function candidato(T, tipo, estilo, semilla, k) {
  const e = T.E[estilo];
  if (!e) throw new Error(`nombres: el estilo '${estilo}' no existe`);
  const r = azar(tipo, estilo, semilla, k);
  let s;
  if (tipo === 'lugar' || tipo === 'pais') {
    // la terminacion: un sufijo (Torre-alta, Skarr-holm) o una coda
    const suf = e.sufijos?.length && r() < (e.p_sufijo ?? MANDOS.P_SUFIJO);
    s = pule(raiz(e, r, e.nucleos || MANDOS.NUCLEOS) + elige(r, suf ? e.sufijos : e.coda));
    if (!vale(T, s, e)) return null;
    if (tipo === 'lugar' && e.prefijos?.length && r() < (e.p_prefijo ?? MANDOS.P_PREFIJO)) s = `${elige(r, e.prefijos)} ${s}`;
    return s;
  }
  const persona = ['m', 'f', 'd'].includes(tipo);
  const fin = { m: e.masc, f: e.fem, d: e.dinastia }[tipo] || e.adj || e.coda;
  // cultura, grupo y lengua: con al menos un nucleo (inicio + adj solo da palabras de verdad: «Polish»)
  s = pule(raiz(e, r, persona ? MANDOS.NUCLEOS_PERSONA : [1, 1, 2]) + elige(r, fin));
  return vale(T, s, e) ? s : null;
}
// El primer candidato valido que no este en usados (comparando sin mayusculas ni tildes).
export function unico(T, tipo, estilo, semilla, usados = new Set()) {
  for (let k = 0; k < MANDOS.INTENTOS; k++) {
    const s = candidato(T, tipo, estilo, semilla, k);
    const clave = s && sinTildes(s).toLowerCase();
    if (s && !usados.has(clave)) { usados.add(clave); return s; }
  }
  throw new Error(`nombres: el estilo '${estilo}' no da un ${tipo} nuevo para ${semilla} en ${MANDOS.INTENTOS} intentos (amplia su silabario)`);
}
// Adjetivo de un nombre: el nombre sin su vocal final mas una terminacion adj del estilo.
export const adjetivo = (T, estilo, nombre) => {
  const e = T.E[estilo], r = azar('adj', estilo, nombre);
  return pule(nombre.replace(/[aeiouy]+$/i, '') + elige(r, e.adj || ['i']));
};

// ---------------------------------------------------------------- nombres de las localizaciones
// estiloLoc: { loc: estilo }. Unicos en todo el Nuevo Mundo; en orden de clave.
export function lugares(T, estiloLoc) {
  const usados = new Set(), out = new Map();
  for (const l of Object.keys(estiloLoc).sort()) out.set(l, unico(T, 'lugar', estiloLoc[l], l, usados));
  return out;
}

// ---------------------------------------------------------------- lo que va en vinculo.json
// liga: la del mapa (zonas-mapa.mjs); dueno: Map(loc -> tag) final; paises/menores: { clave: tag };
// nuevos: los paises de relleno (reparte-paises.mjs, { tag, capital }); fe: Map(loc -> Map(fe -> gente));
// zonaFaccion: Map(zona del dibujo -> clave de faccion); vec: Map(loc -> vecinos).
export function vinculoNombres({ T = cargaEstilos(), liga, dueno, paises, menores, nuevos, fe, zonaFaccion, vec }) {
  for (const z of liga.mapa.zonas) if (!T.zonas[z.id]) throw new Error(`nombres: la zona ${z.id} del dibujo no tiene grupo en estilos-nombres.json`);
  const grupoDe = Object.fromEntries(T.grupos.map((g) => [g.id, g]));
  for (const [z, g] of Object.entries(T.zonas)) if (!grupoDe[g]) throw new Error(`nombres: la zona ${z} pide el grupo ${g}, que no existe`);
  const estiloTag = new Map();
  for (const [k, t] of [...Object.entries(paises), ...Object.entries(menores)]) {
    if (!T.E[k]) throw new Error(`nombres: la faccion o el menor '${k}' no tiene estilo en estilos-nombres.json`);
    estiloTag.set(t, k);
  }
  // paises de relleno: el grupo de la zona de su capital; dentro del grupo, las culturas en franjas de oeste a este
  const suyas = new Map(); for (const [l, t] of dueno) { if (!suyas.has(t)) suyas.set(t, []); suyas.get(t).push(l); }
  const porGrupo = new Map();
  for (const nv of nuevos) {
    const z = liga.zonaDe.get(nv.capital)?.id;
    if (!z) throw new Error(`nombres: la capital ${nv.capital} de ${nv.tag} no cae en ninguna zona del dibujo`);
    const g = T.zonas[z];
    if (!porGrupo.has(g)) porGrupo.set(g, []);
    porGrupo.get(g).push({ ...nv, zona: z, xy: liga.xy.get(nv.capital) || [0, 0] });
  }
  const rellenos = {}, usadosPais = new Set();
  for (const [g, lista] of [...porGrupo].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    lista.sort((a, b) => a.xy[0] - b.xy[0] || a.xy[1] - b.xy[1] || (a.tag < b.tag ? -1 : 1));
    const cs = grupoDe[g].culturas, k = Math.min(cs.length, lista.length);
    lista.forEach((nv, i) => {
      const nombre = unico(T, 'pais', g, nv.tag, usadosPais);
      // fe de la mayoria de sus pops (la del setup: religion_definition)
      const c = new Map(); for (const l of suyas.get(nv.tag) || []) for (const [f, n] of fe.get(l) || []) c.set(f, (c.get(f) || 0) + n);
      const religion = [...c].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0] || null;
      rellenos[nv.tag] = { zona: nv.zona, grupo: grupoDe[g].grupo, cultura: cs[Math.floor((i * k) / lista.length)].id, religion, nombre, adj: adjetivo(T, g, nombre) };
      estiloTag.set(nv.tag, g);
    });
  }
  const estiloZona = (z) => zonaFaccion.get(z) || T.zonas[z];
  const estiloLoc = {}, cuenta = { dueno: 0, zona: 0, vecino: 0 };
  for (const l of [...liga.tierra].filter((x) => /^rnw_loc_\d+$/.test(x)).sort()) {
    const st = estiloTag.get(dueno.get(l));
    if (st) { estiloLoc[l] = st; cuenta.dueno++; continue; }
    let z = liga.zonaDe.get(l)?.id;
    if (z) cuenta.zona++;
    else { z = [...(vec?.get(l) || [])].sort().map((w) => liga.zonaDe.get(w)?.id).find(Boolean); cuenta.vecino++; }
    estiloLoc[l] = estiloZona(z) || T.zonas[liga.mapa.zonas[0].id];
  }
  return { rellenos, estiloLoc, cuenta };
}

// ---------------------------------------------------------------- grupos, culturas y lenguas nuevas
// Devuelve { ruta del mod: texto } (sin BOM: lo pone quien escribe) y la tabla del informe.
export function ficherosCulturas(T = cargaEstilos()) {
  const color = (k) => { const h = crypto.createHash('sha256').update(`gj-cultura-${k}`).digest(); return `rgb { ${40 + (h[0] % 176)} ${40 + (h[1] % 176)} ${40 + (h[2] % 176)} }`; };
  const usados = new Set(), texto = [], colores = [], grupos = [], culturas = [], lenguas = [];
  for (const g of T.grupos) {
    const nomG = unico(T, 'grupo', g.id, g.grupo, usados);
    // el juego pide <grupo>_desc (localization_util.cpp:103 "TODO : Write a desc"): el nombre vale
    texto.push([g.grupo, nomG], [`${g.grupo}_desc`, nomG], [g.lengua, unico(T, 'lengua', g.id, g.lengua, usados)]);
    grupos.push(`${g.grupo} = {\n}\n`);
    colores.push(`\t${g.lengua} = ${color(g.lengua)}`);
    const lista = (tipo, n) => { const u = new Set(); return Array.from({ length: n }, (_, i) => unico(T, tipo, g.id, `${g.lengua}-${i}`, u)); };
    const bloque = (xs) => xs.map((x) => (/\s/.test(x) ? `"${x}"` : x)).reduce((a, x, i) => a + (i % 10 ? ' ' : '\n\t\t') + x, '');
    lenguas.push(`${g.lengua} = {\n\tcolor = ${g.lengua}\n\n\tmale_names = {${bloque(lista('m', MANDOS.PERSONAS.m))}\n\t}\n\tfemale_names = {${bloque(lista('f', MANDOS.PERSONAS.f))}\n\t}\n\tdynasty_names = {${bloque(lista('d', MANDOS.PERSONAS.d))}\n\t}\n\tlowborn = {\n\t}\n}\n`);
    for (const c of g.culturas) {
      texto.push([c.id, unico(T, 'cultura', g.id, c.id, usados)]);
      colores.push(`\t${c.id} = ${color(c.id)}`);
      culturas.push(`${c.id} = {\n\tlanguage = ${g.lengua}\n\tcolor = ${c.id}\n\ttags = { ${c.tags.join(' ')} }\n\topinions = {\n\t}\n\tculture_groups = {\n\t\t${g.grupo}\n\t}\n}\n`);
    }
  }
  const cab = '# GJ Nuevo Mundo: grupos nuevos de los paises de relleno. GENERADO por funde-partes.mjs con nombres.mjs\n# desde herramientas/estilos-nombres.json (no se edita a mano).\n';
  const loc = (lg) => `l_${lg}:\n # GENERADO por funde-partes.mjs (nombres.mjs): grupos, culturas y lenguas nuevas\n${texto.map(([k, v]) => ` ${k}: "${v}"`).join('\n')}\n`;
  return {
    'in_game/common/culture_groups/gj_nombres_grupos.txt': cab + grupos.join('\n'),
    'in_game/common/cultures/gj_nombres_culturas.txt': cab + culturas.join('\n'),
    'in_game/common/languages/gj_nombres_lenguas.txt': cab + lenguas.join('\n'),
    'main_menu/common/named_colors/gj_nombres_colores.txt': cab + `colors = {\n${colores.join('\n')}\n}\n`,
    'main_menu/localization/spanish/gj_nombres_culturas_l_spanish.yml': loc('spanish'),
    'main_menu/localization/english/gj_nombres_culturas_l_english.yml': loc('english'),
  };
}
// Tabla zona -> grupo -> culturas -> etiquetas -> malla (para los informes)
export function tablaGrupos(T = cargaEstilos()) {
  const zonas = (g) => Object.entries(T.zonas).filter(([, x]) => x === g).map(([z]) => z).sort().join(', ');
  return ['| Zonas | Grupo | Cultura | Etiquetas gfx | Malla de ciudad |', '|---|---|---|---|---|',
    ...T.grupos.flatMap((g) => g.culturas.map((c) => `| ${zonas(g.id)} | ${g.grupo} | ${c.id} | ${c.tags.join(' ')} | ${c.tags.map((t) => MALLAS[t]).filter(Boolean)[0] || 'northgerman (reserva)'} |`))].join('\n');
}

// ---------------------------------------------------------------- prueba
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const assert = (await import('node:assert')).strict;
  const T = cargaEstilos();
  for (const id of Object.keys(T.E)) {
    const u = new Set(), xs = Array.from({ length: 10 }, (_, i) => unico(T, 'lugar', id, `prueba-${i}`, u));
    console.log(`${id}: ${xs.join(', ')}`);
    for (const x of xs) assert.ok(!T.re.test(sinTildes(x)), `${id}: ${x} suena americano`);
  }
  // determinista, unico y sin lo prohibido en 3000 lugares de varios estilos
  const est = Object.fromEntries(Array.from({ length: 3000 }, (_, i) => [`rnw_loc_${String(i).padStart(5, '0')}`, Object.keys(T.E)[i % Object.keys(T.E).length]]));
  const a = lugares(T, est), b = lugares(T, est);
  assert.deepEqual([...a], [...b]);
  assert.equal(new Set([...a.values()].map((x) => sinTildes(x).toLowerCase())).size, a.size);
  assert.ok(!/tl|tz/i.test([...a.values()].join(' ')));
  assert.ok(!T.re.test('Ostrevar') && T.re.test('Tlaxcala') && T.re.test('Huallaga') && T.re.test('Qosqo'));
  const f = ficherosCulturas(T);
  assert.equal(f['in_game/common/cultures/gj_nombres_culturas.txt'], ficherosCulturas(T)['in_game/common/cultures/gj_nombres_culturas.txt']);
  console.log(tablaGrupos(T));
  console.log('nombres: PASA');
}
