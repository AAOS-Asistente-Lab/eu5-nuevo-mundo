// reparte-tierra.mjs: con el mapa final, deja el Nuevo Mundo repartido entre MUCHOS paises, cada uno
// de UNA pieza de tierra seguida (dos localizaciones estan seguidas si se tocan en locations.png).
//   1. Nadie absorbe a nadie: los estados de RNW siguen siendo paises.
//   2. Cada pais se queda solo con su nucleo: la faccion, su trozo con mas tierra en su zona del
//      dibujo; los demas, el trozo de su capital. Los otros trozos que traia de RNW se sueltan.
//   3. Cada faccion crece desde su nucleo, dentro de su zona, hasta una fraccion de ella
//      (FRACCION_FACCION), tomando siempre la localizacion libre que toca mas cerca del centro de la
//      zona: sale una mancha compacta. Asi hay algun pais grande, no doce imperios. Si la tierra
//      libre no le llega, toma tambien la de los estados de RNW de su zona (nunca su capital).
//   4. Los demas paises crecen por turnos, una localizacion cada uno, la libre que tocan mas cerca
//      de su capital, hasta su talla. La talla sale del tag (TALLAS): la mayoria pequenos, bastantes
//      medianos y unos pocos grandes.
//   5. La tierra suelta que nadie ha tomado se abandona (queda sin dueno, para colonizar), igual que
//      la que nadie alcanza.
// Todo sale en listas ordenadas y sin azar: el mismo mundo y el mismo dibujo dan los mismos bytes.

export const FRACCION_FACCION = 0.25; // parte de su zona que tiene cada faccion al empezar
export const FACCION_MINIMO = 30;     // ninguna faccion empieza con menos en su zona
// [parte de los paises, talla minima, talla maxima]
export const TALLAS = [[0.45, 8, 18], [0.40, 20, 50], [0.15, 55, 110]];

// FNV-1a de 32 bits a [0, 1): el "azar" de cada pais sale de su tag
const fraccion = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export function tallaDe(tag, tallas = TALLAS) {
  let u = fraccion(tag + ':clase');
  for (const [parte, min, max] of tallas) { if (u < parte) return min + Math.floor(fraccion(tag + ':talla') * (max - min + 1)); u -= parte; }
  return tallas.at(-1)[2];
}

// Trozos de tierra seguida de una lista de localizaciones: [[loc, ...], ...], cada uno ordenado.
export function trozosDe(locs, vec) {
  const mias = new Set(locs), visto = new Set(), r = [];
  for (const l of [...locs].sort()) {
    if (visto.has(l)) continue;
    const t = [], cola = [l]; visto.add(l);
    while (cola.length) { const x = cola.pop(); t.push(x); for (const y of vec.get(x) || []) if (mias.has(y) && !visto.has(y)) { visto.add(y); cola.push(y); } }
    r.push(t.sort());
  }
  return r;
}

export function reparteTierra({ liga, vec, paises, asignados, facciones, fraccionFaccion = FRACCION_FACCION, faccionMinimo = FACCION_MINIMO, tallas = TALLAS }) {
  const tierra = [...liga.tierra].sort();
  const esTierra = new Set(tierra);
  const zonaId = (l) => liga.zonaDe.get(l)?.id;
  const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
  const antes = new Map();
  for (const p of paises) for (const l of p.locs) if (esTierra.has(l)) antes.set(l, p.tag);
  const dueno = new Map(antes);
  const total = tierra.length, conDuenoAntes = dueno.size;
  const duenoZona = new Map();
  for (const f of facciones) if (asignados[f.clave]) duenoZona.set(facZona(f), { tag: asignados[f.clave].tag, clave: f.clave });
  const zonaDeTag = new Map([...duenoZona].map(([z, d]) => [d.tag, z]));
  const centroDe = (z) => liga.mapa.centro[liga.mapa.zonas.findIndex((x) => x.id === z)] || [0, 0];
  const distA = ([cx, cy]) => (l) => { const [x, y] = liga.xy.get(l); return Math.hypot(x - cx, y - cy); };

  // 2. el nucleo de cada pais; lo demas se suelta. Primero las facciones; los demas, cuando las
  // facciones ya han crecido (pueden haberles quitado tierra y haberlos partido)
  const partidosAntes = paises.filter((p) => trozosDe(p.locs.filter((l) => esTierra.has(l)), vec).length > 1).length;
  const capitales = new Set(paises.map((p) => p.capital));
  const dejaNucleo = (p) => {
    const ts = trozosDe(tierra.filter((l) => dueno.get(l) === p.tag), vec);
    const z = zonaDeTag.get(p.tag);
    const enZ = (t) => t.filter((l) => zonaId(l) === z).length;
    const nucleo = z
      ? [...ts].sort((a, b) => enZ(b) - enZ(a) || b.length - a.length || a[0].localeCompare(b[0])).find((t) => enZ(t) > 0)
      : ts.find((t) => t.includes(p.capital)) || [...ts].sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))[0];
    for (const t of ts) if (t !== nucleo) for (const l of t) dueno.delete(l);
  };
  const porTag = [...paises].sort((a, b) => a.tag.localeCompare(b.tag));
  for (const p of porTag) if (zonaDeTag.has(p.tag)) dejaNucleo(p);

  // crecimiento compacto: de la tierra libre que toca la del pais, la mas cerca de un punto
  const crecedor = (tag, punto, libre) => {
    const dist = distA(punto);
    const borde = new Map(); // libre que toca -> distancia
    const mira = (l) => { for (const v of [...(vec.get(l) || [])].sort()) if (esTierra.has(v) && !borde.has(v) && libre(v)) borde.set(v, dist(v)); };
    for (const l of tierra) if (dueno.get(l) === tag) mira(l);
    return {
      siembra: (l) => { borde.set(l, dist(l)); },
      toma: () => {
        let mejor = null, dm = Infinity, ocupada = true;
        for (const [l, d] of borde) {
          if (!libre(l)) { borde.delete(l); continue; }
          const o = dueno.has(l); // antes la tierra sin dueno que la de otro pais
          if ((ocupada && !o) || (o === ocupada && (d < dm || (d === dm && l < mejor)))) { mejor = l; dm = d; ocupada = o; }
        }
        if (mejor === null) return false;
        borde.delete(mejor); dueno.set(mejor, tag); mira(mejor);
        return true;
      },
    };
  };

  // 3. facciones: dentro de su zona, hacia el centro de la zona
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const deZona = tierra.filter((l) => zonaId(l) === z);
    const meta = Math.max(faccionMinimo, Math.round(fraccionFaccion * deZona.length));
    // de su zona: la tierra sin dueno y la de los estados que no son faccion, salvo sus capitales
    const tomable = (l) => zonaId(l) === z && (!dueno.has(l) || (!zonaDeTag.has(dueno.get(l)) && !capitales.has(l)));
    // la zona puede venir en varios trozos (lagos, estrechos, islas): si en el del nucleo no cabe
    // la meta, la faccion se muda al trozo mas grande, a la localizacion mas cerca del centro
    const dist = distA(centroDe(z));
    const mias = () => tierra.filter((l) => dueno.get(l) === d.tag);
    const trozosZ = trozosDe(deZona.filter((l) => tomable(l) || dueno.get(l) === d.tag), vec).sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]));
    const suyo = trozosZ.find((tz) => tz.some((l) => dueno.get(l) === d.tag));
    let semilla = null;
    if (trozosZ.length && (!suyo || (suyo.length < meta && trozosZ[0].length > suyo.length))) {
      for (const l of mias()) dueno.delete(l);
      semilla = [...trozosZ[0]].sort((a, b) => (dueno.has(a) - dueno.has(b)) || dist(a) - dist(b) || a.localeCompare(b))[0];
    }
    const c = crecedor(d.tag, centroDe(z), tomable);
    if (semilla) c.siembra(semilla);
    for (let n = mias().filter((l) => zonaId(l) === z).length; n < meta && c.toma(); n++);
  }
  for (const p of porTag) if (!zonaDeTag.has(p.tag)) dejaNucleo(p);
  const conDuenoFacciones = dueno.size;

  // 4. los demas: por turnos, hacia su capital
  const otros = paises.filter((p) => !zonaDeTag.has(p.tag) && liga.xy.has(p.capital)).sort((a, b) => a.tag.localeCompare(b.tag))
    .map((p) => ({ tag: p.tag, talla: tallaDe(p.tag, tallas), n: tierra.filter((l) => dueno.get(l) === p.tag).length, c: crecedor(p.tag, liga.xy.get(p.capital), (l) => !dueno.has(l)) }));
  for (let avanza = true; avanza;) {
    avanza = false;
    for (const o of otros) if (o.n < o.talla && o.c.toma()) { o.n++; avanza = true; }
  }

  // 5. lo que cambia de manos, lo que se abandona y las capitales
  const da = {}, suelta = {};
  for (const l of tierra) {
    const t = dueno.get(l), a = antes.get(l);
    if (t && t !== a) da[l] = t;
    else if (!t && a) suelta[l] = a;
  }
  const capital = {};
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const p = paises.find((x) => x.tag === d.tag);
    if (!p || (dueno.get(p.capital) === d.tag && zonaId(p.capital) === z)) continue;
    const dist = distA(centroDe(z));
    const s = tierra.filter((l) => dueno.get(l) === d.tag && zonaId(l) === z).sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
    if (s) capital[d.tag] = { de: p.capital, a: s, clave: d.clave };
  }

  // informe
  const por = new Map();
  for (const [l, t] of dueno) { if (!por.has(t)) por.set(t, []); por.get(t).push(l); }
  const partidos = [...por].filter(([, ls]) => trozosDe(ls, vec).length > 1).map(([t]) => t).sort();
  const sinTierra = paises.filter((p) => !por.has(p.tag)).map((p) => p.tag).sort();
  const filas = [...duenoZona].sort(([a], [b]) => a.localeCompare(b)).map(([z, d]) => {
    const p = paises.find((x) => x.tag === d.tag);
    const ls = por.get(d.tag) || [];
    return { zona: z, ...d, inicial: p.locs.filter((l) => esTierra.has(l)).length, final: ls.length, enZona: ls.filter((l) => zonaId(l) === z).length, zonaLocs: tierra.filter((l) => zonaId(l) === z).length };
  });
  const TRAMOS = [[1, 5], [6, 15], [16, 45], [46, 90], [91, Infinity]];
  const tramos = TRAMOS.map(([a, b]) => ({ de: a, a: b, paises: [...por.values()].filter((ls) => ls.length >= a && ls.length <= b).length }));
  return {
    da, suelta, capital,
    informe: { total, conDuenoAntes, conDuenoFacciones, conDuenoDespues: dueno.size, paises: por.size, partidosAntes, partidos, sinTierra, abandonadas: Object.keys(suelta).length, filas, tramos },
  };
}

export function textoTierra(r) {
  const pc = (n) => `${(100 * n / r.informe.total).toFixed(1)} %`;
  const i = r.informe;
  return `## Tierra con dueno al empezar (reparte-tierra.mjs)
Nuevo Mundo: ${i.total} localizaciones de tierra. Con dueno en el mundo de RNW: ${i.conDuenoAntes} (${pc(i.conDuenoAntes)}), con ${i.partidosAntes} paises partidos en varios trozos. Tras crecer las facciones y dejar a cada pais en su nucleo: ${i.conDuenoFacciones} (${pc(i.conDuenoFacciones)}). Tras crecer los demas: **${i.conDuenoDespues} (${pc(i.conDuenoDespues)})**, repartidas entre **${i.paises} paises**; el resto queda libre para colonizar (${i.abandonadas} localizaciones de trozos sueltos se abandonan). Nadie absorbe a nadie.

**Paises partidos en varios trozos: ${i.partidos.length}**${i.partidos.length ? ` (${i.partidos.join(', ')})` : ''}.${i.sinTierra.length ? ` Paises sin tierra: ${i.sinTierra.join(', ')}.` : ''}

| Tamano (localizaciones) | Paises |
|---|---|
${i.tramos.map((t) => `| ${t.a === Infinity ? `${t.de} o mas` : `${t.de}-${t.a}`} | ${t.paises} |`).join('\n')}

| Zona | Faccion | Pais | En el mundo de RNW | Al empezar | De ellas, en su zona | De su zona |
|---|---|---|---|---|---|---|
${i.filas.map((f) => `| ${f.zona} | ${f.clave} | ${f.tag} | ${f.inicial} | ${f.final} | ${f.enZona} | ${(100 * f.enZona / f.zonaLocs).toFixed(0)} % |`).join('\n')}
${Object.keys(r.capital || {}).length ? `\nCapital llevada a su zona: ${Object.entries(r.capital).map(([t, c]) => `${c.clave} ${t} de ${c.de} a ${c.a}`).join('; ')}.\n` : ''}`;
}
