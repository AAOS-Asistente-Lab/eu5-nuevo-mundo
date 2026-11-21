# senda_verde: La Senda Verde (religion de los velathi)

Mecanica: karma (`has_karma = yes`), la del motor: escala -100..+100, mejor entre -33 y 33. El motor ya cobra karma por declarar guerra; esta parte anade la capa propia (plantar sube, podar baja, tres franjas con modificadores propios).

## Cifras reales (contadas sobre los ficheros)
- Bonificaciones (lineas de modificador con valor):
  - de la religion segun el contrato (definition_modifier 7 + aspectos 11): **18**;
  - franjas de karma propias (auto_modifiers): 11;
  - tipos de lugar sagrado: 8;
  - modificadores con nombre de eventos y decisiones (static_modifiers, 12 modificadores): 28;
  - total de todo lo anterior: 65.
- Aspectos elegibles: 4 (la religion elige 2): Raiz, Copa, Savia y Musgo.
- Dioses y focos: ninguno (la mecanica es karma, no los usa).
- Tipos de lugar sagrado: 2 (`gj_senda_verde_claro_sagrado`, `gj_senda_verde_arbol_anillo`), sin locations.
- Eventos: 11 (`gj_senda_verde.1` a `.11`).
- Decisiones: 3 (categoria `religious_decisions`).
- Situaciones, edificios, unidades: 0 (no los pide una religion).
- Efecto de presagio: `gj_senda_verde_lee_presagio` (cometa o eclipse); la variable `gj_presagio_tipo` la fija quien lo llama (1 cometa, 2 eclipse).
- Escuelas: ninguna le toca.
- Ficheros: 11 del juego + RESUMEN.md + NECESITA.md. Claves de localizacion: 88, todas con texto (comprobado por script). Llaves equilibradas en todos los ficheros.

## No probado
- Nada se ha ejecutado en el juego. La sintaxis sale de ejemplos del juego base y los nombres de modificador se comprobaron contra su lista de tipos.
- `religion_modifier` de los tipos de lugar sagrado no se usa a proposito (duda de sintaxis).
- Falta el icono de la religion (`gfx/interface/icons/religion/`), que es arte.
- Los tags `folk_european_gfx pagan_gfx` se han tomado de religiones del juego base.
