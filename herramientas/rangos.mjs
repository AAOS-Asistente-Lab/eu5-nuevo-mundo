// rangos.mjs: ciudades y pueblos de la tierra con dueno al empezar. RNW solo da rango a la capital
// de sus estados (49 localizaciones en todo el Nuevo Mundo del v4), y la tierra repartida queda
// toda rural. Aqui: la capital de cada pais pasa a ciudad, y cada pais tiene ademas un pueblo cada
// `cada` localizaciones, en las mejores (costa, cultivos o pradera), separados al menos
// `separacion` pasos de otra ciudad o pueblo. Determinista. Lo escribe funde-partes.mjs en
// gj_rangos_iniciales (change_location_rank). `veto`: localizaciones con un market_village del setup,
// que no cabe en una ciudad ni en un pueblo; se quedan rurales.
export const PUEBLO_CADA = 17; // la cifra la confirman los jugadores
export const SEPARACION = 3;

export function rangosIniciales({ dueno, capitales, vec, costa, veg, yaTienen = new Map(), cada = PUEBLO_CADA, separacion = SEPARACION, veto = new Set() }) {
  const por = new Map();
  for (const [l, t] of dueno) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  const rangos = {};
  const rangoDe = (l) => rangos[l] || yaTienen.get(l);
  const esCiudad = (r) => r === 'city' || r === 'megalopolis';
  const cerca = (l) => { // otra ciudad o pueblo a menos de `separacion` pasos
    const d = new Map([[l, 0]]), cola = [l];
    for (let i = 0; i < cola.length; i++) {
      const v = cola[i];
      if (v !== l && rangoDe(v)) return true;
      if (d.get(v) >= separacion - 1) continue;
      for (const w of vec.get(v) || []) if (!d.has(w)) { d.set(w, d.get(v) + 1); cola.push(w); }
    }
    return false;
  };
  const punt = (l) => (costa.has(l) ? 2 : 0) + (veg.get(l) === 'farmland' ? 2 : veg.get(l) === 'grasslands' ? 0.5 : 0)
    + 0.5 * [...(vec.get(l) || [])].filter((w) => veg.get(w) === 'farmland').length;
  // primero todas las capitales: si no, un pais anterior en el orden pondria un pueblo pegado a la
  // capital de uno posterior (la separacion no se cumpliria entre paises)
  for (const [t] of [...por].sort(([a], [b]) => a.localeCompare(b))) {
    const cap = capitales.get(t);
    if (cap && dueno.get(cap) === t && !veto.has(cap) && !esCiudad(rangoDe(cap))) rangos[cap] = 'city';
  }
  for (const [t, ls] of [...por].sort(([a], [b]) => a.localeCompare(b))) {
    const cap = capitales.get(t);
    const quiere = Math.floor(ls.length / cada);
    let tiene = ls.filter((l) => l !== cap && rangoDe(l)).length;
    for (const l of [...ls].filter((x) => !rangoDe(x) && !veto.has(x)).sort((a, b) => punt(b) - punt(a) || a.localeCompare(b))) {
      if (tiene >= quiere) break;
      if (cerca(l)) continue;
      rangos[l] = 'town'; tiene++;
    }
  }
  return Object.fromEntries(Object.entries(rangos).sort(([a], [b]) => a.localeCompare(b)));
}
