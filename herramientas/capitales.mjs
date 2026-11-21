// capitales.mjs: puntuacion de una localizacion como capital (criterio de los jugadores, 21-11:
// «que la capital este en un buen sitio»). Suma: costa (mas con puerto), llanura, cultivos o
// pradera, clima templado, gente y cultivos cerca, y cerca del centro de su tierra. Resta: montaña,
// desierto, pantano, selva y frio extremo. Rios de rivers.png (mundo.mjs: rios): +1,5 si es ancho, +0,75 si no.
// MALA: montaña, desierto, pantano o artico; una capital asi solo se queda si no hay otra cosa.
const TOPO = { flatland: 2, plateau: 0.5, hills: 0, mountains: -4, wetlands: -3 };
const VEG = { farmland: 2, grasslands: 1, woods: 0.5, sparse: 0, forest: -0.5, jungle: -2, desert: -3 };
const CLIMA = { oceanic: 1.5, continental: 1.5, mediterranean: 1.5, subtropical: 1.5, tropical: 0, hot_semi_arid: 0, cold_semi_arid: 0, arid: -1, cold_arid: -1, subpolar: -1.5, arctic: -4 };

export const esMala = (p) => !!p && (p.topo === 'mountains' || p.topo === 'wetlands' || p.veg === 'desert' || p.clima === 'arctic');

export const RIO_ANCHO = 11; // indice de rivers.png del rio mas ancho que pinta RNW (usa 4, 5 y 11)
export function puntuaCapital({ plant, costa, puertos = new Set(), vec, poblacion = new Map(), rio = new Map() }) {
  const vals = [...poblacion.values()].filter((x) => x > 0).sort((a, b) => a - b);
  const mediana = vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  return (l, centro = null, xy = null) => {
    const p = plant.get(l) || {};
    let s = (TOPO[p.topo] ?? 0) + (VEG[p.veg] ?? 0) + (CLIMA[p.clima || p.climate] ?? 0);
    if (costa.has(l)) s += 2;
    if (puertos.has(l)) s += 1;
    const r = rio.get(l); // rio: mas si es ancho; con menos de 8 pixeles solo roza la localizacion
    if (r && r[0] >= 8) s += r[1] >= RIO_ANCHO ? 1.5 : 0.75;
    const vs = [...(vec.get(l) || [])];
    s += 0.3 * vs.filter((w) => ['farmland', 'grasslands'].includes(plant.get(w)?.veg)).length;
    if (mediana) s += Math.min(2, (poblacion.get(l) || 0) / mediana - 1);
    if (centro && xy?.has(l)) { const [x, y] = xy.get(l); s -= 0.01 * Math.hypot(x - centro[0], y - centro[1]); } // ~0,45 por localizacion de distancia
    return Math.round(s * 100) / 100;
  };
}
