// reparte-tierra.mjs: con el mapa final, cada faccion se queda con su zona del dibujo al empezar.
//   1. Absorbe los estados de RNW cuya capital cae en su zona (annex_country en on_game_start).
//   2. Rellena la tierra libre de su zona, creciendo desde su tierra (vecindad de locations.png),
//      hasta que el Nuevo Mundo con dueno quede en el objetivo (70-75 %).
// Los menores grandes hacen lo mismo con su zona, con la mitad de peso; los pequenos (menos de
// MENOR_MINIMO localizaciones en el dibujo) se quedan como ciudades-estado.
// Todo sale en listas ordenadas: el mismo mundo y el mismo dibujo dan los mismos bytes.

export const OBJETIVO = [0.70, 0.75];
export const PESO_MENOR = 0.5;
export const MENOR_MINIMO = 60;

export function reparteTierra({ liga, vec, paises, asignados, facciones, objetivo = OBJETIVO, pesoMenor = PESO_MENOR, menorMinimo = MENOR_MINIMO }) {
  const tierra = [...liga.tierra].sort();
  const esTierra = new Set(tierra);
  const zonaId = (l) => liga.zonaDe.get(l)?.id;
  const facZona = (f) => f.zona_mapa || f.clave.replace(/_/g, '-');
  const dueno = new Map();
  for (const p of paises) for (const l of p.locs) if (esTierra.has(l)) dueno.set(l, p.tag);
  const total = tierra.length, conDuenoAntes = dueno.size;
  const deFaccion = new Set(Object.values(asignados).map((p) => p.tag));

  // duenos de zona: la faccion en la suya; en cada menor grande, el estado con mas tierra en ella
  const duenoZona = new Map();
  for (const f of facciones) if (asignados[f.clave]) duenoZona.set(facZona(f), { tag: asignados[f.clave].tag, tipo: 'faccion', clave: f.clave });
  for (const z of liga.mapa.zonas) {
    if (duenoZona.has(z.id) || !z.id.startsWith('menor') || (z.localizaciones_aprox || 0) < menorMinimo) continue;
    const c = paises.filter((p) => !deFaccion.has(p.tag) && ![...duenoZona.values()].some((d) => d.tag === p.tag))
      .map((p) => [p, p.locs.filter((l) => zonaId(l) === z.id).length]).filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1] || a[0].tag.localeCompare(b[0].tag))[0];
    if (c) duenoZona.set(z.id, { tag: c[0].tag, tipo: 'menor', clave: z.id });
  }
  const duenosTags = new Set([...duenoZona.values()].map((d) => d.tag));

  // 1. absorciones: los estados con la capital en una zona con dueno
  const absorbe = {};
  for (const p of [...paises].sort((a, b) => a.tag.localeCompare(b.tag))) {
    if (duenosTags.has(p.tag)) continue;
    const d = duenoZona.get(zonaId(p.capital));
    if (!d) continue;
    (absorbe[d.tag] ??= []).push(p.tag);
    for (const l of p.locs) if (esTierra.has(l)) dueno.set(l, d.tag);
  }
  const conDuenoAbsorbido = dueno.size;

  // 2. relleno: cuotas proporcionales a la tierra libre de cada zona (por su peso), con tope
  const meta = Math.round(total * (objetivo[0] + objetivo[1]) / 2);
  const libres = new Map();
  for (const l of tierra) if (!dueno.has(l)) { const z = zonaId(l); if (z && duenoZona.has(z)) { if (!libres.has(z)) libres.set(z, []); libres.get(z).push(l); } }
  const peso = (z) => (duenoZona.get(z).tipo === 'faccion' ? 1 : pesoMenor);
  const cuota = new Map([...libres.keys()].sort().map((z) => [z, 0]));
  let restante = Math.max(0, meta - dueno.size);
  const abiertos = new Set(cuota.keys());
  while (restante > 0 && abiertos.size) {
    const W = [...abiertos].reduce((s, z) => s + peso(z) * libres.get(z).length, 0);
    let usado = 0;
    for (const z of [...abiertos].sort()) {
      const quiere = Math.max(1, Math.floor(restante * peso(z) * libres.get(z).length / W));
      const k = Math.min(quiere, libres.get(z).length - cuota.get(z), restante - usado);
      cuota.set(z, cuota.get(z) + k); usado += k;
      if (cuota.get(z) >= libres.get(z).length) abiertos.delete(z);
      if (usado >= restante) break;
    }
    if (!usado) break;
    restante -= usado;
  }
  // crecer desde la tierra del dueno en la zona (anchura primero); islas y huecos, desde el
  // libre mas cerca del centro de la zona
  const da = {};
  for (const [z, k] of cuota) {
    if (!k) continue;
    const tag = duenoZona.get(z).tag;
    const libreZ = new Set(libres.get(z));
    const iz = liga.mapa.zonas.findIndex((x) => x.id === z);
    const [cx, cy] = liga.mapa.centro[iz] || [0, 0];
    const dist = (l) => { const [x, y] = liga.xy.get(l); return Math.hypot(x - cx, y - cy); };
    const visto = new Set(), cola = [];
    const encola = (l) => { for (const v of [...(vec.get(l) || [])].sort()) if (libreZ.has(v) && !visto.has(v)) { visto.add(v); cola.push(v); } };
    for (const l of tierra) if (dueno.get(l) === tag && zonaId(l) === z) encola(l);
    let n = 0, i = 0;
    while (n < k) {
      if (i >= cola.length) {
        const s = [...libreZ].filter((l) => !visto.has(l)).sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
        if (!s) break;
        visto.add(s); cola.push(s);
      }
      const l = cola[i++];
      da[l] = tag; dueno.set(l, tag); n++;
      encola(l);
    }
  }

  // 3. una faccion sin ningun estado en su zona (se le dio el mas cercano) lleva la capital a su
  // zona: a la localizacion que gana mas cerca del centro de la zona
  const capital = {};
  for (const [z, d] of [...duenoZona].sort(([a], [b]) => a.localeCompare(b))) {
    if (d.tipo !== 'faccion') continue;
    const p = paises.find((x) => x.tag === d.tag);
    if (!p || zonaId(p.capital) === z) continue;
    const iz = liga.mapa.zonas.findIndex((x) => x.id === z);
    const [cx, cy] = liga.mapa.centro[iz] || [0, 0];
    const dist = (l) => { const [x, y] = liga.xy.get(l); return Math.hypot(x - cx, y - cy); };
    const s = tierra.filter((l) => dueno.get(l) === d.tag && zonaId(l) === z).sort((a, b) => dist(a) - dist(b) || a.localeCompare(b))[0];
    if (s) capital[d.tag] = { de: p.capital, a: s, clave: d.clave };
  }

  // informe
  const cuenta = (tag) => tierra.filter((l) => dueno.get(l) === tag).length;
  const filas = [...duenoZona].sort(([a], [b]) => a.localeCompare(b)).map(([z, d]) => {
    const p = paises.find((x) => x.tag === d.tag);
    const abs = absorbe[d.tag] || [];
    const locsAbs = abs.reduce((s, t) => s + paises.find((x) => x.tag === t).locs.filter((l) => esTierra.has(l)).length, 0);
    return { zona: z, ...d, inicial: p.locs.filter((l) => esTierra.has(l)).length, estados: abs.length, locsAbs, libre: Object.values(da).filter((t) => t === d.tag).length, final: cuenta(d.tag) };
  });
  return {
    absorbe: Object.fromEntries(Object.entries(absorbe).sort(([a], [b]) => a.localeCompare(b))),
    da: Object.fromEntries(Object.entries(da).sort(([a], [b]) => a.localeCompare(b))),
    capital,
    informe: { total, conDuenoAntes, conDuenoAbsorbido, conDuenoDespues: dueno.size, meta, objetivo, filas },
  };
}

export function textoTierra(r) {
  const pc = (n) => `${(100 * n / r.informe.total).toFixed(1)} %`;
  const i = r.informe;
  return `## Tierra con dueno al empezar (reparte-tierra.mjs)
Nuevo Mundo: ${i.total} localizaciones de tierra. Con dueno en el mundo de RNW: ${i.conDuenoAntes} (${pc(i.conDuenoAntes)}). Tras absorber: ${i.conDuenoAbsorbido} (${pc(i.conDuenoAbsorbido)}). Tras rellenar: **${i.conDuenoDespues} (${pc(i.conDuenoDespues)})**; objetivo ${i.objetivo.map((x) => `${x * 100} %`).join('-')} (${i.meta}).

| Zona | Quien | Pais | Inicial | Estados absorbidos (locs) | Tierra libre | Al empezar |
|---|---|---|---|---|---|---|
${i.filas.map((f) => `| ${f.zona} | ${f.tipo === 'faccion' ? f.clave : 'menor'} | ${f.tag} | ${f.inicial} | ${f.estados} (${f.locsAbs}) | ${f.libre} | ${f.final} |`).join('\n')}
${Object.keys(r.capital || {}).length ? `\nCapital llevada a su zona (no habia ningun estado dentro): ${Object.entries(r.capital).map(([t, c]) => `${c.clave} ${t} de ${c.de} a ${c.a}`).join('; ')}.\n` : ''}`;
}
