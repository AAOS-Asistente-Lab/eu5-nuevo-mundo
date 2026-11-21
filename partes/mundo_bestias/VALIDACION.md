# VALIDACION: mundo_bestias

Veredicto: ARREGLADO (2 fallos mecánicos corregidos, 0 pendientes mecánicos). El juego no se ha ejecutado.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` equilibradas (sin comentarios ni cadenas) | OK en los 7 .txt (decisiones 93/93, pulsos 21/21, efectos 65/65, triggers 28/28, eventos 380/380, modificadores 54/54, valores 0/0); profundidad nunca negativa |
| 2 | Localización: UTF-8 con BOM (`EF BB BF`), empieza por `l_spanish:` | OK. 193 claves; los 27 modificadores, las 5 decisiones (nombre y `_desc`) y cada título, descripción y opción de los 28 eventos visibles tienen texto. 0 faltan |
| 3 | Sin TAG, sin ids de location, sin rutas de disco, nada fuera de la carpeta | OK. Solo hay `capital`/`random_owned_location`, triggers `gj_zona_*` y `culture:gj_kaivani`. 0 coincidencias de letra de unidad o `file:///` |
| 3b | Prefijo propio `gj_mundo_bestias_` | FALLABA, arreglado (ver abajo) |
| 4 | Claves del motor en el juego base | OK. Los 127 identificadores no `gj_` usados antes de `=` existen en `in_game/common`, `in_game/events` o `main_menu/common`; la única excepción es `tipo`, que es el argumento propio de un efecto. Comprobados además los valores: `topography` (hills, mountains, plateau, wetlands), `vegetation` (forest, grasslands, jungle), eras `age_1_traditions` a `age_5_absolutism`, `government_decisions`, `outcome`, `mode = add_and_extend`, `reason = battle`, `damage_unit_percent`, `damage_unit_morale_percent`, `add_pop_size`, `change_prosperity`, `kill_character`, `on_game_start`, `yearly_country_pulse` |
| 5 | Cifras de RESUMEN.md | Cuadran: 30 eventos (28 visibles + 2 ocultos), 61 opciones, 5 decisiones, 27 modificadores con 72 líneas, 12 efectos, 16 triggers, 8 valores, 193 claves, 8 ficheros de juego + 2 md |
| 6 | Equilibrio | OK tras un arreglo: ningún bonus pasa de +10 % en un valor. Los números mayores son malus de plaga y de bestia (comida -30 %, pesca -30 %, atrición local 1), que son costes, no premios. `global_hostile_attrition = 0.5` está en la escala del juego base (hindu, reformas, dioses) |
| 7 | Nombres u obras ajenas | OK. 0 coincidencias (Tolkien, Anbennar, Juego de Tronos, Warcraft, etc.). Nombres propios originales (Kharuun, «Cormorán Gris») |

## Arreglado
1. **Prefijo.** Todo lo propio usaba `gj_bestias_` y el namespace `gj_bestias`, y el contrato (sección 3) pide `gj_<clave>_` con la clave `mundo_bestias`. Se renombró de forma mecánica en los 8 ficheros y en los 2 md:
   - `gj_bestias_*` pasa a `gj_mundo_bestias_*` (modificadores, decisiones, efectos, triggers, valores, pulsos, variables de enfriamiento);
   - namespace y eventos: `gj_bestias.N` pasa a `gj_mundo_bestias.N`, con sus claves de localización;
   - los 7 ficheros de juego y el .yml se renombraron igual (`gj_mundo_bestias_eventos.txt`, etc.);
   - variables globales propias: `gj_kraken_furia`, `gj_kraken_muerto` y `gj_presagio_lock` pasan a `gj_mundo_bestias_kraken_furia`, `..._kraken_muerto` y `..._presagio_lock`.
   - Tras el cambio, 0 restos de `gj_bestias`, llaves y localización siguen cuadrando, el .yml conserva el BOM.
2. **Tope.** `gj_mundo_bestias_ceniza_fertil` daba `local_food_capacity_modifier = 0.20` (8 años, en una location). Se bajó a 0.10, el tope que declara la parte.

## Se dejan tal cual (son interfaz con otras partes)
`gj_dragon_estado`, `gj_dragon_muerto`, `gj_inquietud_caldera`, `gj_llama_pacto_dragon`, `gj_recoge_caidos`, `gj_mar_*` y `gj_<religion>_lee_presagio*` son nombres del contrato o de otras partes. `gj_presagio_tipo` (1 cometa, 2 eclipse) también se queda sin prefijo: luz_fundadores, senda_verde y espiritus_lago ya lo leen o lo fijan con ese nombre.

## Pendiente (no mecánico)
- **Vara de la sección 7:** no aplica el listado de facción (60-70 bonificaciones, edificios, unidades, avances): es una parte de mundo y su fila dice A3 y A4. Tiene 72 líneas de modificador y 30 eventos (sobre los 15-20), así que sobra en eventos y bonificaciones.
- **Desvíos de MECANICAS A3/A4, ya justificados en RESUMEN:** sin situación ni desastre propios; krakens con pulso anual y no mensual; cometas sin `age_event`. El «pago en población cada década» del pacto con el dragón no está aquí (es de llama_profunda).
- **Dependencias que deben existir al fundir** (de NECESITA.md): `gj_zona_caldera`, `gj_zona_estrecho`, `gj_mar_kraken_calmado_trigger`, `gj_mar_calma_a_la_bestia`, `gj_llama_profunda_rompe_pacto`, `gj_recoge_caidos`, `culture:gj_kaivani` y las 10 lecturas de religión. `gj_dioses_hambrientos_lee_presagio` y `gj_senda_verde_lee_presagio` pueden faltar si esas partes no los traen: error de efecto desconocido.
- **Sin probar (el juego no se ha ejecutado):** `kill_character` con `leader` de un ejército (evento .12), `set_variable` con `years`, `random_navy` con `damage_unit_percent`, la mezcla de `weight_multiplier` y que `yearly_country_pulse` se sume al del juego. Los identificadores existen en el base, pero su uso combinado no está verificado.

## Ronda de reparación
- Comprobador: 1 error al empezar (gj_recoge_caidos desconocida), 0 al acabar (PASA, 78 avisos de claves de texto sin cita, salida 0).
- Corregido: el efecto de hrimval se llama gj_hrimval_recoge_caidos (el nombre anterior no existe en ninguna parte). Ajustados NECESITA.md y RESUMEN.md. La nota de «interfaz» de arriba que lo cita como gj_recoge_caidos queda superada por esta.
- Nombres repetidos (mundo_bestias va después en orden alfabético en ambos pares): «Juramento renovado» pasa a «Voto del astro devuelto» y «Ceniza fértil» pasa a «Surco de ceniza dulce». Solo cambia el texto; las claves no varían.
- Sin tocar: ganchos (on_game_start y pulso anual) y recortes de equilibrio.
- Fuera de esta parte: mundo_contacto llama también a gj_recoge_caidos (eventos, líneas 312 y 384) y le falla igual; debe cambiarlo a gj_hrimval_recoge_caidos.
