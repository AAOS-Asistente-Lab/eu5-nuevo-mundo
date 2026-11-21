// reparte-tierra.mjs: con el mapa final, reparte la tierra libre del Nuevo Mundo entre MUCHOS paises.
//   1. Nadie absorbe a nadie: los estados de RNW siguen siendo paises.
//   2. Cada faccion crece dentro de su zona del dibujo hasta una fraccion de ella (FRACCION_FACCION),
//      desde su tierra (vecindad de locations.png). Asi hay algun pais grande, no doce imperios.
//      Antes se asegura un pie (MINIMO_SUBZONA) en cada sub-zona gj_zona_* que cae en su zona, porque
//      sus mecanicas la piden (los cuatro clanes de Kaivan); desde ese pie tambien crece.
//   3. Los demas paises crecen por turnos, una localizacion cada uno, sobre la tierra libre que
//      tocan, hasta su talla. La talla sale del tag (TALLAS): la mayoria pequenos, bastantes
//      medianos y unos pocos grandes. La tierra que nadie alcanza queda libre para colonizar.
// Todo sale en listas ordenadas y sin azar: el mismo mundo y el mismo dibujo dan los mismos bytes.

export const FRACCION_FACCION = 0.25; // parte de su zona que tiene cada faccion al empezar
export const FACCION_MINIMO = 30;     // ninguna faccion empieza con menos en su zona
export const MINIMO_SUBZONA = 5;      // localizaciones de la faccion en cada sub-zona de su zona
// [parte de los paises, talla minima, talla maxima]
export const TALLAS = [[0.45, 8, 18], [0.40, 20, 50], [0.15, 55, 110]];

// FNV-1a de 32 bits a [0, 1): el "azar" de cada pais sale de su tag
const fraccion = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export function tallaDe(tag, tallas = TALLAS) {
  let u = fraccion(tag + ':clase');
  for (const [parte, min, max] of tallas) { if (u < parte) return min + Math.floor(fraccion(tag + ':talla') * (max - min + 1)); u -= parte; }
  return tallas.at(-1)[2];
}

export function reparteTierra({ liga, vec, paises, asignados, facciones, subzonas = [], minimoSubzona = MINIMO_SUBZONA, fraccionFaccion = FRACCION_FACCION, faccionMinimo = FACCION_MINIMO, tallas = TALLAS }) {
  const tierra = [...liga.tierra].sort();
  const esTierra = new Set(tierra);
  const zonaId = (l) => liga.zonaDe.get(l)?.id;
  const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
  const dueno = new Map();
  for (const p of paises) for (const l of p.locs) if (esTierra.has(l)) dueno.set(l, p.tag);
  const total = tierra.length, conDuenoAntes = dueno.size;
  const vecinosDe = (l) => [...(vec.get(l) || [])].sort();
  const da = {};
  const toma = (l, tag) => { da[l] = tag; dueno.set(l, tag); };

  // 2. facciones: crecen en su zona desde su tierra (anchura primero); si no tienen ninguna
  // dentro, desde la localizacion libre mas cerca del centro de la zona
  const duenoZona = new Map();
  for (const f of facciones) if (asignados[f.clave]) duenoZona.set(facZona(f), { tag: asignados[f.clave].tag, clave: f.clave });
  const centroDe = (z) => liga.mapa.centro[liga.mapa.zonas.findIndex((x) => x.id === z)] || [0, 0];
  const distA = ([cx, cy]) => (l) => { const [x, y] = liga.xy.get(l); return Math.hypot(x - cx, y - cy); };
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const deZona = tierra.filter((l) => zonaId(l) === z);
    const suyas = deZona.filter((l) => dueno.get(l) === d.tag);
    let k = Math.max(faccionMinimo, Math.round(fraccionFaccion * deZona.length)) - suyas.length;
    const libreZ = new Set(deZona.filter((l) => !dueno.has(l)));
    const dist = distA(centroDe(z));
    const visto = new Set(), cola = [];
    const encola = (l) => { for (const v of vecinosDe(l)) if (libreZ.has(v) && !visto.has(v)) { visto.add(v); cola.push(v); } };
    // un pie en cada sub-zona que cae (mas de la mitad) en la zona: un trozo seguido, desde la
    // libre mas cerca del centro de la zona
    const pies = [];
    for (const sz of [...subzonas].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
      const ls = sz.locs.filter((l) => esTierra.has(l));
      if (!ls.length || ls.filter((l) => zonaId(l) === z).length * 2 <= ls.length) continue;
      let falta = minimoSubzona - ls.filter((l) => dueno.get(l) === d.tag).length;
      const libreS = new Set(ls.filter((l) => libreZ.has(l) && !dueno.has(l)));
      const semilla = [...libreS].sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
      const colaS = semilla ? [semilla] : [], vistoS = new Set(colaS);
      for (let i = 0; falta > 0 && k > 0 && i < colaS.length; i++, falta--, k--) {
        const l = colaS[i];
        toma(l, d.tag); pies.push(l); visto.add(l);
        for (const v of vecinosDe(l)) if (libreS.has(v) && !vistoS.has(v)) { vistoS.add(v); colaS.push(v); }
      }
    }
    for (const l of [...suyas, ...pies]) encola(l);
    // sin nada en la zona: una sola semilla, la libre mas cerca del centro
    if (!suyas.length && !pies.length) { const s = [...libreZ].sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0]; if (s) { visto.add(s); cola.push(s); } }
    // si se acaba la tierra libre que toca, se queda con menos: no se siembran trozos sueltos
    for (let n = 0, i = 0; n < k && i < cola.length; n++) {
      const l = cola[i++];
      if (dueno.has(l)) { n--; continue; }
      toma(l, d.tag); encola(l);
    }
  }
  const conDuenoFacciones = dueno.size;

  // 3. los demas: por turnos, una localizacion cada uno, hasta su talla
  const deFaccion = new Set([...duenoZona.values()].map((d) => d.tag));
  const otros = paises.filter((p) => !deFaccion.has(p.tag)).sort((a, b) => a.tag.localeCompare(b.tag)).map((p) => {
    const suyas = p.locs.filter((l) => esTierra.has(l)).sort();
    return { tag: p.tag, n: suyas.length, talla: tallaDe(p.tag, tallas), cola: [...suyas], i: 0, visto: new Set(suyas) };
  });
  for (let avanza = true; avanza;) {
    avanza = false;
    for (const o of otros) {
      if (o.n >= o.talla) continue;
      // la cola lleva la tierra propia y, detras, la libre que se va tocando
      while (o.i < o.cola.length) {
        const l = o.cola[o.i++];
        if (dueno.has(l) && dueno.get(l) !== o.tag) continue; // se la llevo otro
        for (const v of vecinosDe(l)) if (esTierra.has(v) && !o.visto.has(v)) { o.visto.add(v); o.cola.push(v); }
        if (dueno.has(l)) continue; // ya era suya
        toma(l, o.tag); o.n++; avanza = true;
        break;
      }
    }
  }

  // una faccion con la capital fuera de su zona la lleva a su localizacion de la zona mas cerca del centro
  const capital = {};
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    const p = paises.find((x) => x.tag === d.tag);
    if (!p || zonaId(p.capital) === z) continue;
    const dist = distA(centroDe(z));
    const s = tierra.filter((l) => dueno.get(l) === d.tag && zonaId(l) === z).sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
    if (s) capital[d.tag] = { de: p.capital, a: s, clave: d.clave };
  }

  // informe
  const tam = new Map();
  for (const t of dueno.values()) tam.set(t, (tam.get(t) || 0) + 1);
  const filas = [...duenoZona].sort(([a], [b]) => a.localeCompare(b)).map(([z, d]) => {
    const p = paises.find((x) => x.tag === d.tag);
    return { zona: z, ...d, inicial: p.locs.filter((l) => esTierra.has(l)).length, final: tam.get(d.tag) || 0, enZona: tierra.filter((l) => dueno.get(l) === d.tag && zonaId(l) === z).length, zonaLocs: tierra.filter((l) => zonaId(l) === z).length };
  });
  const TRAMOS = [[1, 5], [6, 15], [16, 45], [46, 90], [91, Infinity]];
  const tramos = TRAMOS.map(([a, b]) => ({ de: a, a: b, paises: [...tam.values()].filter((n) => n >= a && n <= b).length }));
  return {
    da: Object.fromEntries(Object.entries(da).sort(([a], [b]) => a.localeCompare(b))),
    capital,
    informe: { total, conDuenoAntes, conDuenoFacciones, conDuenoDespues: dueno.size, paises: tam.size, mayor: Math.max(...tam.values()), filas, tramos },
  };
}

export function textoTierra(r) {
  const pc = (n) => `${(100 * n / r.informe.total).toFixed(1)} %`;
  const i = r.informe;
  return `## Tierra con dueno al empezar (reparte-tierra.mjs)
Nuevo Mundo: ${i.total} localizaciones de tierra. Con dueno en el mundo de RNW: ${i.conDuenoAntes} (${pc(i.conDuenoAntes)}). Tras crecer las facciones: ${i.conDuenoFacciones} (${pc(i.conDuenoFacciones)}). Tras crecer los demas: **${i.conDuenoDespues} (${pc(i.conDuenoDespues)})**, repartidas entre **${i.paises} paises**; el resto queda libre para colonizar. Nadie absorbe a nadie.

| Tamano (localizaciones) | Paises |
|---|---|
${i.tramos.map((t) => `| ${t.a === Infinity ? `${t.de} o mas` : `${t.de}-${t.a}`} | ${t.paises} |`).join('\n')}

| Zona | Faccion | Pais | En el mundo de RNW | Al empezar | De ellas, en su zona | De su zona |
|---|---|---|---|---|---|---|
${i.filas.map((f) => `| ${f.zona} | ${f.clave} | ${f.tag} | ${f.inicial} | ${f.final} | ${f.enZona} | ${(100 * f.enZona / f.zonaLocs).toFixed(0)} % |`).join('\n')}
${Object.keys(r.capital || {}).length ? `\nCapital llevada a su zona: ${Object.entries(r.capital).map(([t, c]) => `${c.clave} ${t} de ${c.de} a ${c.a}`).join('; ')}.\n` : ''}`;
}
