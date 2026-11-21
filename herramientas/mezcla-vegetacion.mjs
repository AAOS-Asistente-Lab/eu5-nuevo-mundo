// mezcla-vegetacion.mjs: rompe las manchas enormes de vegetacion del Nuevo Mundo de RNW.
// La vegetacion de cada localizacion esta en in_game/map_data/location_templates.txt; el juego no
// tiene ningun efecto que la cambie en partida, asi que la copia vinculada trae ese fichero
// reescrito (solo cambia el valor de vegetation; el resto, byte a byte como el del mundo).
// Lo que NO cambia: los arboles y las texturas del mapa en 3D (gfx/map/map_objects/*.bin y
// gfx/terrain2/decals/*_materials.bin), que RNW precalcula desde su clima.
//
// Reglas, todas deterministas (ruido por hash de la posicion, sin azar):
//   - lo que admite cada clima y en que proporcion sale de la America... del mundo entero del
//     juego base: P(vegetacion | clima), suavizada para que ninguna domine;
//   - se elige por un ruido de unas pocas localizaciones, mezclado con la vegetacion que traia
//     RNW (para no perder el caracter de cada region), en orden de humedad:
//     desierto < matorral (sparse) < pradera (grasslands) < bosque claro (woods) < bosque < selva;
//   - el desierto, fuera de la costa y a la sombra de un monte (a 3 o menos pasos) o mas adentro
//     (a 2 o mas pasos de la costa); en la costa, solo en el clima arid y a medio peso; y a la
//     mitad en las zonas de las facciones del sur; sus bordes caen solos en matorral y pradera,
//     que son los siguientes en humedad;
//   - cultivos (farmland) en la capital y las ciudades de las facciones y a su lado, y pradera a
//     dos pasos, si el clima los admite;
//   - ninguna mancha de un mismo tipo pasa de TOPE localizaciones (el desierto, de TOPE_DESIERTO).
export const ORDEN = ['desert', 'sparse', 'grasslands', 'woods', 'forest', 'jungle'];
export const TOPE = 30, TOPE_DESIERTO = 20, TOPE_CULTIVO = 12, TOPE_ARBOLADO = 50;
const ESCALA = 135; // px de locations.png: unas 3 localizaciones (location_px 45)

const hash = (i, j, s) => { let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
const suave = (t) => t * t * (3 - 2 * t);
function ruido(x, y, s) {
  const i = Math.floor(x), j = Math.floor(y), fx = suave(x - i), fy = suave(y - j);
  const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

// P(vegetacion | clima) del fichero del juego base
export function tablaDelJuego(textoPlantillas) {
  const J = {};
  for (const m of textoPlantillas.matchAll(/vegetation = ([a-z_]+)[^}\n]*climate = ([a-z_]+)/g)) { J[m[2]] ??= {}; J[m[2]][m[1]] = (J[m[2]][m[1]] || 0) + 1; }
  for (const o of Object.values(J)) { const s = Object.values(o).reduce((a, b) => a + b, 0); for (const k in o) o[k] /= s; }
  return J;
}

function manchas(tierra, veg, vec) {
  const visto = new Set(), mayor = {}, comps = [];
  for (const l of tierra) {
    if (visto.has(l)) continue;
    const v = veg.get(l), comp = [l]; visto.add(l);
    for (let i = 0; i < comp.length; i++) for (const w of vec.get(comp[i]) || []) if (!visto.has(w) && veg.get(w) === v) { visto.add(w); comp.push(w); }
    mayor[v] = Math.max(mayor[v] || 0, comp.length); comps.push({ v, comp });
  }
  return { mayor, comps };
}
// mancha mayor de un grupo de tipos (p. ej. todo lo arbolado junto)
const mayorGrupo = (tierra, veg, vec, grupo) => { const visto = new Set(); let m = 0; for (const l of tierra) { if (visto.has(l) || !grupo.includes(veg.get(l))) continue; const c = [l]; visto.add(l); for (let i = 0; i < c.length; i++) for (const w of vec.get(c[i]) || []) if (!visto.has(w) && grupo.includes(veg.get(w))) { visto.add(w); c.push(w); } m = Math.max(m, c.length); } return m; };
export const ARBOLADO = ['woods', 'forest', 'jungle'];
const reparto = (tierra, veg) => { const c = {}; for (const l of tierra) c[veg.get(l)] = (c[veg.get(l)] || 0) + 1; return Object.fromEntries(Object.entries(c).map(([k, n]) => [k, n / tierra.length])); };

export function mezclaVegetacion({ tierra: t0, plant, vec, cen, costa, ciudades = [], capitales = ciudades, zonaSurFaccion = new Set(), tabla }) {
  const tierra = t0.filter((l) => plant.get(l)?.veg && cen.has(l)).sort();
  const esTierra = new Set(tierra);
  const original = new Map(tierra.map((l) => [l, plant.get(l).veg]));
  const vecT = new Map(tierra.map((l) => [l, [...(vec.get(l) || [])].filter((v) => esTierra.has(v)).sort()]));
  const pasos = (semillas) => { const d = new Map(); const cola = [...semillas].filter((l) => esTierra.has(l)).sort(); for (const l of cola) d.set(l, 0); for (let i = 0; i < cola.length; i++) for (const w of vecT.get(cola[i])) if (!d.has(w)) { d.set(w, d.get(cola[i]) + 1); cola.push(w); } return d; };
  const dCosta = pasos(tierra.filter((l) => costa.has(l) || (vec.get(l) || new Set()).size > vecT.get(l).length));
  const dMonte = pasos(tierra.filter((l) => plant.get(l).topo === 'mountains'));
  const clima = (l) => plant.get(l).climate || plant.get(l).clima;
  const pesos = (l) => {
    const P = tabla[clima(l)] || {};
    const w = {};
    // selva y bosques, solo donde el juego base los tiene de verdad (5 %): nada de selva en el norte ni de bosque en el desierto
    for (const v of ORDEN) if ((P[v] || 0) >= (["jungle", "forest", "woods"].includes(v) ? 0.05 : 0.02)) w[v] = (P[v]) ** 0.6;
    if (!Object.keys(w).length) w[original.get(l)] = 1;
    if (w.desert) {
      const dc = dCosta.get(l) ?? 99, dm = dMonte.get(l) ?? 99;
      const seco = dc >= 1 && (dm <= 3 || dc >= 2); // fuera de la costa, a la sombra de un monte o mas adentro
      // en la costa, solo en el clima arido de verdad y a medio peso: sin un tercer tipo, el matorral
      // y la pradera solos formarian una mancha seguida (en un mapa, uno de dos tipos siempre se une)
      const costero = !seco && clima(l) === "arid";
      if (!seco && !costero) delete w.desert; else { w.desert = P.desert ** 0.75 * (costero ? 0.5 : 1); if (zonaSurFaccion.has(l)) w.desert *= 0.5; }
    }
    const s = Object.values(w).reduce((a, b) => a + b, 0);
    for (const k in w) w[k] /= s;
    return w;
  };
  const W = new Map(tierra.map((l) => [l, pesos(l)]));
  const humedad = (v) => (ORDEN.indexOf(v) < 0 ? 2 : ORDEN.indexOf(v));
  const veg = new Map();
  for (const l of tierra) {
    const [x, y] = cen.get(l);
    const n = 0.65 * ruido(x / ESCALA, y / ESCALA, 11) + 0.35 * ruido(x / (ESCALA * 2.2) + 17, y / (ESCALA * 2.2) + 5, 23);
    const u = Math.min(0.999, Math.max(0, 0.6 * n + 0.4 * (humedad(original.get(l)) + 0.5) / ORDEN.length));
    let ac = 0, elegido = null;
    for (const v of ORDEN) if (W.get(l)[v]) { ac += W.get(l)[v]; if (u < ac) { elegido = v; break; } }
    veg.set(l, elegido || Object.keys(W.get(l)).pop());
  }
  // cultivos en las capitales de las facciones y a su lado, y en cada ciudad; pradera a dos pasos
  const dCiudad = pasos(ciudades), dCapital = pasos(capitales);
  for (const l of tierra) {
    const d = dCiudad.get(l); if (d === undefined || d > 2) continue;
    const P = tabla[clima(l)] || {};
    if ((d === 0 || (dCapital.get(l) ?? 99) <= 1) && (P.farmland || 0) >= 0.01) veg.set(l, 'farmland');
    else if ((P.grasslands || 0) >= 0.03 && ['forest', 'jungle', 'desert'].includes(veg.get(l))) veg.set(l, 'grasslands');
  }
  // tope de mancha: se corta por una reticula (abajo), cambiando a otro tipo que admita el clima
  const tope = (v) => (v === 'desert' ? TOPE_DESIERTO : v === 'farmland' ? TOPE_CULTIVO : TOPE);
  // el sustituto: el que menos vecinos iguales tiene (para no unir otra mancha) y, a igualdad, el
  // mas cercano en humedad
  const otro = (l, v) => {
    const cands = Object.keys(W.get(l)).filter((x) => x !== v);
    if (!cands.length) return null;
    const iguales = (x) => vecT.get(l).filter((w) => veg.get(w) === x).length;
    return cands.sort((a, b) => iguales(a) - iguales(b) || Math.abs(humedad(a) - humedad(v)) - Math.abs(humedad(b) - humedad(v)) || W.get(l)[b] - W.get(l)[a] || a.localeCompare(b))[0];
  };
  for (let pasada = 0; pasada < 40; pasada++) {
    const grandes = manchas(tierra, veg, vecT).comps.filter((c) => c.comp.length > tope(c.v));
    let cambios = 0;
    // corte por una reticula torcida por ruido: lineas de una localizacion de ancho que dejan
    // celdas de unas TOPE localizaciones; cada pasada la mueve un tercio
    for (const { v, comp } of grandes) {
      const L = Math.round(45 * 1.2 * Math.sqrt(tope(v))), ancho = 46, des = (pasada % 3) * L / 3;
      for (const l of comp) {
        const [x, y] = cen.get(l);
        const X = x + 90 * (ruido(x / 300, y / 300, 41) - 0.5) + des, Y = y + 90 * (ruido(x / 300, y / 300, 43) - 0.5) + des;
        if (((X % L) + L) % L < ancho || ((Y % L) + L) % L < ancho) { const o = otro(l, v); if (o) { veg.set(l, o); cambios++; } }
      }
    }
    // lo arbolado junto (bosque claro, bosque y selva) tampoco pasa de TOPE_ARBOLADO: se corta con
    // claros (pradera, matorral) donde el clima los admite
    const visto = new Set();
    for (const l0 of tierra) {
      if (visto.has(l0) || !ARBOLADO.includes(veg.get(l0))) continue;
      const comp = [l0]; visto.add(l0);
      for (let i = 0; i < comp.length; i++) for (const w of vecT.get(comp[i])) if (!visto.has(w) && ARBOLADO.includes(veg.get(w))) { visto.add(w); comp.push(w); }
      if (comp.length <= TOPE_ARBOLADO) continue;
      const L = Math.round(45 * 1.2 * Math.sqrt(TOPE_ARBOLADO)), ancho = 46, des = (pasada % 3) * L / 3;
      for (const l of comp) {
        const [x, y] = cen.get(l);
        const X = x + 90 * (ruido(x / 300, y / 300, 47) - 0.5) + des, Y = y + 90 * (ruido(x / 300, y / 300, 53) - 0.5) + des;
        if (((X % L) + L) % L < ancho || ((Y % L) + L) % L < ancho) {
          const claros = Object.keys(W.get(l)).filter((v) => !ARBOLADO.includes(v) && v !== 'desert');
          if (!claros.length) continue;
          const iguales = (v) => vecT.get(l).filter((w) => veg.get(w) === v).length;
          veg.set(l, claros.sort((a, b) => iguales(a) - iguales(b) || W.get(l)[b] - W.get(l)[a] || a.localeCompare(b))[0]); cambios++;
        }
      }
    }
    if (!cambios) break;
  }
  const antes = { pct: reparto(tierra, original), mayor: manchas(tierra, original, vecT).mayor, arbolado: mayorGrupo(tierra, original, vecT, ARBOLADO) };
  const despues = { pct: reparto(tierra, veg), mayor: manchas(tierra, veg, vecT).mayor, arbolado: mayorGrupo(tierra, veg, vecT, ARBOLADO) };
  // el terreno (topography) no se toca: sale del relieve del mapa en 3D
  const topo = reparto(tierra, new Map(tierra.map((l) => [l, plant.get(l).topo || '?'])));
  const cambia = new Map([...veg].filter(([l, v]) => v !== original.get(l)));
  const sur = tierra.filter((l) => zonaSurFaccion.has(l));
  const desiertoSur = { n: sur.length, antes: sur.filter((l) => original.get(l) === 'desert').length / (sur.length || 1), despues: sur.filter((l) => veg.get(l) === 'desert').length / (sur.length || 1) };
  return { veg, cambia, antes, despues, total: tierra.length, desiertoSur, topo };
}

export function textoVegetacion(r) {
  const tipos = [...new Set([...Object.keys(r.antes.pct), ...Object.keys(r.despues.pct)])].sort((a, b) => (r.antes.pct[b] || 0) - (r.antes.pct[a] || 0));
  const pc = (x) => `${((x || 0) * 100).toFixed(1)} %`;
  return `## Vegetacion del Nuevo Mundo (mezcla-vegetacion.mjs)
${r.total} localizaciones de tierra; cambian ${r.cambia.size}. Mancha mas grande: localizaciones seguidas del mismo tipo. Desierto en las zonas de las facciones del sur (${r.desiertoSur.n} localizaciones): ${pc(r.desiertoSur.antes)} antes, ${pc(r.desiertoSur.despues)} despues.

| Tipo | Antes | Despues | Mancha mayor antes | Despues |
|---|---|---|---|---|
${tipos.map((v) => `| ${v} | ${pc(r.antes.pct[v])} | ${pc(r.despues.pct[v])} | ${r.antes.mayor[v] || 0} | ${r.despues.mayor[v] || 0} |`).join('\n')}
| arbolado (woods+forest+jungle juntos) | ${pc(ARBOLADO.reduce((a, v) => a + (r.antes.pct[v] || 0), 0))} | ${pc(ARBOLADO.reduce((a, v) => a + (r.despues.pct[v] || 0), 0))} | ${r.antes.arbolado} | ${r.despues.arbolado} |

Terreno (topography), sin cambios: ${Object.entries(r.topo).sort((a, b) => b[1] - a[1]).map(([k, x]) => `${k} ${pc(x)}`).join(', ')}.
`;
}
