# VALIDACION: velathi

Veredicto: **ARREGLADO**. Se encontraron 6 fallos, todos mecánicos o de nombres, y están corregidos. Quedan 6 pendientes que no son mecánicos. Nada se ha probado en el juego.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{` `}` en los 17 `.txt`, sin comentarios ni cadenas | Todas equilibradas, antes y después de los arreglos |
| 2 | Localización: `.yml` en UTF-8 con BOM (EF BB BF) y primera línea `l_spanish:` | Bien. 256 claves, sin duplicadas |
| 2b | Cada clave visible tiene texto: nombres y `_desc` de definiciones, título y descripción de eventos y decisiones, opciones, mantenimientos y descripciones de cupos | 243 claves necesarias, 0 faltan |
| 3 | Etiquetas de país, ids de location, letras de unidad, rutas | Ninguna |
| 3b | Prefijo `gj_velathi_` (o `gj_es_velathi`, `gj_grupo_velathi`, `gj_map_velathi`) en todo lo propio | Bien. Ningún fichero fuera de `partes/velathi/` |
| 4 | Claves del motor en el juego base | Todos los identificadores no propios de los 17 `.txt` existen en el juego. Además, 98 claves y efectos comprobados una a una: efectos, triggers, `current_age_or_later`, `has_advance`, `add_karma` y sus valores `karma_*`, constantes de bonus (`prestige_*`, `legitimacy_*`, `stability_*`, `research_progress_*`, `development_weak_bonus`), las 6 claves de era, categorías y demandas de edificio, `gfx_tags`, `copy_from` de unidades, `requires` de avances, `years = -1` y `mode = add` |
| 4b | Categoría de cada modificador (país, location, personaje) contra las definiciones del juego | Todas correctas |
| 5 | Cifras de RESUMEN.md | Cuadran: 69 líneas de bonificación (avances de país 22 con 44, de cultura 3 con 6, reformas 9, cultura 7, grupo 3), 5 edificios, 12 unidades (2 cadenas de 6), 20 eventos, 5 decisiones, 22 modificadores estáticos |
| 5b | Vara de la sección 7 | Llega: 60-70 bonificaciones, 25 avances (mínimo del rango 25-30), 3 reformas, 5 edificios, 2 cadenas de unidades, 20 eventos, 5 decisiones. `IDENTIDAD.md` trae 15 topónimos |
| 6 | Equilibrio (MECANICAS H y sección 7) | Pasa tras los arreglos. Ver pendientes por lo que queda |
| 7 | Nombres y textos de otras obras | Se cambiaron 3 nombres demasiado cercanos. Nada más. Sin nombres de personas ni de modelos |

## Arreglado
1. **`local_max_control = 3` en la Torre de Copas.** Es un modificador en porcentaje: 3 serían +300 %. El máximo del juego base en edificios es 0,2. Ahora vale 0,10.
2. **`global_medicaments_output_modifier = 0.15`** en `gj_velathi_herbolarios_longevos`. Pasaba el máximo del juego base en avances y reformas (0,10). Ahora vale 0,10. Las 69 líneas siguen siendo 69.
3. **BOM en los 17 `.txt`.** No lo tenía ninguno. Los ficheros del juego base de los mismos tipos lo llevan casi todos, y el contrato (sección 3) pide imitarlos. Ahora todos llevan EF BB BF.
4. **`Quendar`** (nombre de rey, lengua e IDENTIDAD): recuerda demasiado a un término de Tolkien. Ahora es `Quevaren`.
5. **`Galoriel`** (nombre de reina): demasiado cercano a un nombre de Tolkien. Ahora es `Galhivane`.
6. **`Nimrael`** (nombre de rey): ídem. Ahora es `Nimvaren`.

## Pendiente (no mecánico)
1. **Acumulación de desgaste enemigo.** `global_hostile_attrition` suma 0,5 del grupo, 0,5 del avance Paso del Cazador y 1,0 de la reforma Juramento del Bosque, un total de 2,0. Cada línea respeta el tope del juego base, pero la suma es fuerte. Decidir en el equilibrado final.
2. **Poder de infantería ligera.** Tres avances suman +30 % a `army_light_infantry_power`, y los Arqueros del Umbral llevan además +10 % de daño. Supera el +15-20 % de la regla si se acumula todo. Conviene revisar en juego.
3. **Niveles de los edificios.** Los `max_level` llegan a 5 en la Arboleda Antigua (base 1, tres eras y ciudad) y la regla dice «como mucho un nivel mejor que el equivalente del juego base». Falta decidir la comparación con el edificio equivalente.
4. **Pruebas que solo se hacen en vivo** (están en `NECESITA.md`): `years = -1` en `add_location_modifier` (en el juego base se usa en modificadores de personaje; en location no está comprobado), `character_life_expectancy = 150` (el máximo del juego base es 40; es la meta de la mecánica de reyes de 150 a 300 años y hay que ver si suma años o una fracción) y `total_effective_building_levels` con edificios propios.
5. **Piezas de otras partes** sin definir: `gj_es_velathi`, la religión `gj_senda_verde` con `has_karma`, los 3 enlaces a on_actions y los iconos gráficos. Están en `NECESITA.md`.
6. **Cifra de ficheros.** El autor contó 22. Hay 21: 17 `.txt`, 1 `.yml` y 3 `.md`. La diferencia no afecta a nada.

Nada se tocó fuera de `partes/velathi/`.

## Ronda de reparación
1. Comprobador (comprueba-parte.mjs velathi) al empezar: 3 errores, todos de colores. gj_map_velathi, gj_map_velathi_language y gj_map_velathi_language_family no existían para el comprobador porque el fichero de colores no tenía el envoltorio colors = { }. Se lo puse, con BOM.
2. Tras el arreglo quedan 2 errores: los on_actions gj_velathi_nuevo_rey y gj_velathi_conquista sin quien los llame. Es el formato de ganchos, que reescribe la integración; apuntado en NECESITA.md. Textos que faltan: 0.
3. Nombres repetidos: velathi no está en ningún par de la lista de BALANCE.md, así que no se renombró nada.
4. Pendientes de BALANCE.md (esperanza de vida +150, infantería ligera, niveles de edificio 5) son decisiones de equilibrio del revisor; no se tocaron. El desgaste hostil ya estaba recortado a 1.5 y se respeta. La cifra de ficheros de RESUMEN.md queda corregida a 22 (17 .txt, 1 .yml, 4 .md).
5. Salida final del comprobador: 2 errores, código de salida 1.
