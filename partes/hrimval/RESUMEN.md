# Resumen: la Corte Insepulta de Hrímval (C6)

Cifras contadas sobre los ficheros, no previstas. Sintaxis tomada del juego base 1.4.9 y comprobada por búsqueda. **No se ha ejecutado el juego** (NOT_TESTED): ver NECESITA.md.

## Bonificaciones: 69 (la vara es 60-70, sin contar eventos)
| Origen | Líneas de modificador |
|---|---|
| 24 avances de país (4 por era, las 6 eras) | 47 |
| 2 avances de cultura (`gj_hrimval_cultura_insepulta_*`) y 1 de grupo (`gj_grupo_insepulto_vigilia`) | 6 |
| 3 reformas de gobierno únicas | 9 |
| Cultura `gj_insepulto` (país 2, location 1, personaje 1) | 4 |
| Grupo `gj_grupo_insepulto` (país 1, location 1, personaje 1) | 3 |
| **Total** | **69** |

Quedan fuera de la cuenta: los modificadores de los edificios (15 líneas), los 10 modificadores estáticos de la mecánica y los de la Liga.

## Piezas
- **Avances:** 27 (24 de país + 2 de cultura + 1 de grupo). Tres desbloquean las unidades.
- **Reformas de gobierno:** 3, únicas (`gj_hrimval_rey_bajo_el_hielo_reforma`, `..._registro_de_caidos_reforma`, `..._corte_despierta_reforma`).
- **Edificios:** 5, con el tope de niveles subiendo por era (de 1 a 4 niveles) y el modificador escalando con el nivel:
  - Relicario del Rey (solo capital, uno por país);
  - Túmulos del Hielo (solo en tierra helada);
  - Osario Mayor (exige caídos guardados);
  - Atalaya Helada (solo en tierra helada);
  - Cripta de los Cronistas (uno por país).
- **Unidades:** 3, con una versión por era: 18 entradas, con `copy_from` sobre la plantilla de su era y `upgrades_to_only`.
  - Huestes de Hueso (infantería pesada): moral que no se quiebra y sin hambre. Lentas, y pierden fuerza fuera del frío.
  - Gigantes de Escarcha (infantería pesada): +15 % de daño de fuerza y de moral. Lentos, frágiles fuera del hielo, de construcción lenta y con tope de 3.
  - Acechadores del Hielo (infantería ligera): rápidos y sin desgaste. Frágiles en combate cerrado.
- **Eventos:** 30, con 61 opciones.
  - 19 temáticos (ids 1 al 19), que salen del pulso anual de la Corte.
  - 4 de la Noche Blanca (20 al 23).
  - 2 de las Marchas de Escarcha (30 y 31).
  - 5 del Deshielo (40 al 44).
- **Decisiones:** 4.
  - Pagar el Diezmo de Huesos (vecinos).
  - Fundar la Liga de la Sal y la Llama (vecinos).
  - Alzar a los Caídos (Corte).
  - Devolver a los Caídos al Hielo (Corte).
- **Situaciones:** 1, La Noche Blanca.
- **Desastres:** 1, El Deshielo.
- **Organizaciones internacionales:** 1, la Liga de la Sal y la Llama (`gj_liga_sal_llama`).
- **Cultura y lengua:** 1 cultura, 1 grupo cultural, 1 lengua, 1 familia de lenguas.
- **Modificadores estáticos:** 10. **Efectos con nombre:** 4 (`gj_hrimval_recoge_caidos`, `gj_noche_blanca_adelanta`, `gj_noche_blanca_comienza` y `gj_hrimval_pulso_frontera`). **Triggers con nombre:** 2. **On_actions propias:** 4, más 3 que extienden las del juego base.
- **Total de piezas de contenido propio** (avances, reformas, edificios, unidades, eventos, decisiones, situación, desastre, IO, cultura, grupo, lengua): **78**, sin contar los 18 pasos de era de las unidades. La vara de Castilla son unas 80.

## Cómo funciona la mecánica C6
- **El frío como frontera:** cada año, la tierra de la Corte fuera del clima ártico o subpolar recibe `gj_hrimval_deshielo` (control y población bajan); la tierra helada recibe `gj_hrimval_frio_propio`.
- **La población se recoge:** la variable `gj_caidos` (0 a 100) sube con cada batalla ganada (+2), cada gran batalla (+6), las incursiones y los eventos. Cada recogida suma un poco de población a la capital. Se gasta con las decisiones.
- **La Noche Blanca:**
  - `gj_noche_blanca_comienza = yes` (efecto de esta parte, que llama `escarcha_silente`) lleva el reloj a 100 y abre la situación;
  - el reloj `gj_noche_reloj` sube 3 por año, más lo que añaden las grandes batallas y las demás partes;
  - al llegar a 100 empieza la situación;
  - 48 meses de invierno sobrenatural en el norte;
  - la Corte recibe un modificador de guerra: sin desgaste, más moral, más levas;
  - las Marchas de Escarcha caen sobre sus vecinos, salvo sobre los que han pagado el Diezmo;
  - al final el reloj vuelve a cero y la Corte duerme diez años con una penalización.
- **El Rey bajo el Hielo:** cada año, si la capital tiene el Relicario, el rey recibe un modificador de inmortalidad de 3 años. Si se pierde el Relicario, empieza el desastre El Deshielo: la Corte se rompe hasta que se entierre al rey (evento 44) o se vuelva a levantar el relicario.
- **Diplomacia:** los vecinos pueden pagar el Diezmo de Huesos (decisión o eventos 21 y 30) o fundar la Liga de la Sal y la Llama. Dos jugadores pueden repartirse los papeles.

## Equilibrio
- **Recortes del revisor (se mantienen):** disciplina de los avances y de la reforma a 0.10 en total; `global_manpower_modifier` del avance de la era 4 a 0.05. Hrímval queda poco expansiva.
- **Unidades:** como mucho +15 % en 2 valores frente a la plantilla de la era (el Gigante hace más daño, pero se mueve 25 % más lento y recibe 10 % más). Las tres pierden hasta un 25 % de combate fuera del frío.
- **Edificios:** como mucho un nivel más que sus equivalentes del juego base, siempre con un límite (clima helado, un edificio por país, o caídos guardados).
- **Economía:** la Corte pierde recaudación y ciencia en dos reformas, y sus avances de comercio son cero. Su poder es militar y estacional.

## Cosas honestas que no están
- Sin ejecutar el juego: nada probado en vivo (ver la lista de NECESITA.md).
- Sin iconos, banderas ni misiones propias.
- Sin pesos de IA para que no se expanda (propuesta en NECESITA.md).
- El `add_pop` y la extensión de las `on_actions` base son las dos apuestas más grandes de sintaxis.

## Ficheros (22)
Todos bajo `partes/hrimval/`, reproduciendo las rutas del juego, con nombres `gj_hrimval_*`. La localización va en UTF-8 con BOM. Contenido: avances, reformas, cultura, grupo, lengua, familia, edificios, unidades, situación, desastre, IO, decisiones, on_actions, efectos, triggers, eventos, colores, modificadores estáticos, localización, IDENTIDAD.md, NECESITA.md y este resumen.
