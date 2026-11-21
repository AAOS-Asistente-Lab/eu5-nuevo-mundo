# VALIDACION: minores_norte (21-11)

Veredicto: ARREGLADO. Se encontraron 3 fallos mecánicos (prefijo, lenguas sin nombre, un nombre ajeno) y se corrigieron. Quedan pendientes los riesgos que solo se ven ejecutando el juego.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` por fichero, sin comentarios ni cadenas | Equilibradas en los 13 .txt (por ejemplo, eventos 258/258) y nunca negativas |
| 2 | Localización | 303 claves tras el arreglo. Cada clave visible tiene texto: avances, edificios, unidades, misiones y tareas (nombre y `_desc`), eventos (título, descripción y opciones), decisiones (`.title`, `.desc`, `.a`, `.b`, como en el juego base), modificadores (`STATIC_MODIFIER_NAME/DESC_`), culturas y dialectos. Sin sobrantes. .yml en UTF-8 con BOM (EF BB BF), empieza por `l_spanish:` y no tiene líneas raras |
| 2b | Codificación | Los 13 .txt y el .yml, con BOM |
| 3 | TAG, ids de location, rutas | Cero `country:`, `location:`, `province:`, `tag =` ni letras de unidad. Todo fuera de `partes/minores_norte/`: nada tocado |
| 3b | Prefijos | Tras el arreglo, todo lo propio lleva `gj_minores_norte_`. Excepciones permitidas por el contrato: las 8 culturas (`gj_tarnavi`, `gj_nenvari`, `gj_isbranti`, `gj_hondarri`, `gj_aryuki`, `gj_marismeno`, `gj_vigiano`, `gj_cenizario`) y los 6 grupos `gj_grupo_*` que pide NECESITA.md |
| 4 | Claves del motor | Los ~250.000 identificadores del juego base se cruzaron con los de la parte: todos existen salvo `gj_` y los nombres propios de las lenguas. Además, por definición (no solo por aparecer): los 4 `copy_from` (`a_age_N_..._heavy_infantry`, en `00_age_templates_land.txt`), las 6 eras (`age_1_traditions`..`age_6_revolutions`), los campos de unidad (`strength_damage_taken`, `morale_damage_taken`, `build_time_modifier`, `is_special`, `location_potential`, `gfx_tags`, `combat`), 13 efectos y triggers (`add_army_tradition`, `add_cultural_influence`, `add_research_progress`, `add_legitimacy`, `add_location_modifier`, `add_country_modifier`, `add_estate_satisfaction`, `event_illustration_estate_effect`, `current_age_or_later`, `has_advance`, `is_foreign`) y los valores de guion (`*_weak_*`, `*_mild_*`, de `default_values.txt`). Los 141+69 modificadores numéricos existen en `modifier_type_definitions` (2.710 definiciones) |
| 5 | Cifras de RESUMEN.md | Cuadran: 52 líneas en avances, 56 en culturas, 5 en edificios, 28 en unidades (campos de la unidad, cuentan como en el RESUMEN) y 69 en los 32 modificadores de evento y decisión. 27 avances, 2 edificios, 4 unidades, 8 culturas, 5 lenguas, 6 triggers, 13 on_actions, 6 decisiones, 3 misiones con 9 tareas, 17 ficheros |
| 6 | Equilibrio | La Guardia de Marca cumple MECANICAS H: -10 % de daño recibido (tope 15-20 %), con -10 % de daño causado y de velocidad, +25 % de formación, y solo en tierras de marca. Los dos edificios tienen un solo nivel. Sin valores de país por encima del 20 % (el máximo es `exploration_mission_speed` 0,2). Los modificadores de evento y decisión duran de 5 a 30 años |
| 7 | Nombres ajenos | Sin Tolkien, Anbennar, Juego de Tronos ni Warcraft. Se cambió un nombre de la lista de nombres (ver abajo) |

## Arreglado
1. **Prefijo.** Las claves usaban `gj_mn_`, `gj_menor_`, `gj_ubicacion_` y `gj_map_` (unas 520 apariciones), y el contrato pide `gj_<clave>_`. Se renombraron a `gj_minores_norte_`, `gj_minores_norte_menor_`, `gj_minores_norte_ubicacion_` y `gj_minores_norte_map_`. Se aplicó en los 13 .txt, el .yml, `IDENTIDAD.md` y `NECESITA.md`, incluidas las variables, las on_actions (`gj_minores_norte_pulso_anual`) y los triggers. Evita choques con `minores_sur` (por ejemplo, un `gj_menor_*` repetido).
2. **Lenguas sin nombre.** Las 5 lenguas no tenían texto de localización (el juego base lo pone: `haida_language: "Haida"`). Se añadieron `gj_minores_norte_lengua_del_vado`, `_del_agua`, `_de_la_piedra`, `_del_viento` y `_de_la_ceniza`. Antes se decía 298 de 298; ahora son 303.
3. **Nombre ajeno.** «Hollin», de la lista de apellidos de la lengua de la ceniza, es una región de Tolkien. Ahora es «Hollen».

## Pendiente (no mecánico)
- **No se ha ejecutado el juego.** Lo que sigue es riesgo de contexto, no de existencia:
  - El enganche del pulso anual (`yearly_country_pulse` con `on_actions`), si el motor fusiona o no. Sin él, los 26 eventos no se disparan solos.
  - `character_modifier` de las culturas lleva claves de categoría país (`monthly_legitimacy`, `court_spending_efficiency`, `monthly_prestige`) y de categoría unidad (`discipline`, `military_tactics`). El juego base usa `monthly_prestige` y `land_morale_modifier` en `character_modifier` de órdenes, pero no hay ejemplo de cultura con valores. Si da error, moverlas a `country_modifier` o quitarlas.
  - Claves de unidad en `country_modifier` (`army_light_cavalry_power`, `army_movement_speed`): comprobar en la integración.
  - `local_unrest = -0.5` (cultura cenizaria): la escala es la del juego; ajustar si resulta fuerte.
  - Misiones (`set_variable` sin valor, iconos reutilizados, `duration = 0`), campos del edificio copiados de `bardic_school`, y lenguas sin `family`.
  - Los grupos culturales `gj_grupo_*`, las culturas y la cultura primaria de cada país generado dependen de la integración (NECESITA.md).
- **La vara de el jugador A (60-70 bonificaciones por país, sin contar eventos).** Es la de las facciones (sección 7). Los menores no la alcanzan por menor ni se ha rellenado: 141 líneas en total para 8 menores, unas 17 por menor entre su cultura (7 líneas) y sus 2 avances, más el paquete de estilo compartido (52+5+28 líneas repartidas en 3 estilos). Si el jugador A la quiere también para los menores, hay que añadir un avance de cultura de la era 6 por menor (ya anotado en RESUMEN.md) y más reformas o avances de estilo. Es decisión de contenido, no un fallo mecánico.
- **Partida de la IA sola a 100 años** (MECANICAS H): sin hacer.

## Ronda de reparación (21-11)
- Comprobador (
ode herramientas/comprueba-parte.mjs minores_norte) al empezar: 9 errores (0 textos que faltan, 9 de clave desconocida), código 1. Al acabar: igual, 9 errores, código 1.
- Los 9 errores son las tareas de las 3 misiones: el comprobador no reconoce las tareas anidadas de una misión como definiciones. El formato es el del juego, así que no es un fallo de la parte; queda apuntado en NECESITA.md con la corrección propuesta.
- Nombres repetidos: el avance de Vigía Alto «Pasos cerrados» (compartido con ankaru, cuya clave va antes por orden alfabético) pasa a «Cerrojo de la Cañada». Solo cambia el texto; la clave no cambia. Ninguno de los otros pares de BALANCE.md afecta a esta parte.
- Pendientes de BALANCE.md y de esta validación que no son míos o solo se ven ejecutando el juego, sin tocar: el enganche del pulso anual (lo reescribe la integración), la vara de 60-70 bonificaciones (decisión de el jugador A), la prueba de character_modifier con claves de país en las culturas y la partida de 100 años.
- Localización: 303 claves, UTF-8 con BOM tras el cambio. Los recortes de equilibrio no se tocaron.
