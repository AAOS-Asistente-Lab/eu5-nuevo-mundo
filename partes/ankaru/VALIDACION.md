# Validación de la parte Ankarú

Las comprobaciones salen de scripts de Node y de búsquedas con Grep sobre el juego base (solo lectura). No se ha cargado nada en el juego.

## Veredicto
OK, sin arreglos. No se ha encontrado ningún fallo mecánico, así que no se ha tocado ningún fichero de la parte. Quedan 5 puntos pendientes que no son mecánicos (abajo).

## 1. Llaves
Los 15 ficheros `.txt` tienen las llaves `{ }` equilibradas (profundidad final 0 y nunca negativa), quitando comentarios y cadenas.

## 2. Localización
- El `.yml` empieza por `l_spanish:` y va en UTF-8 con BOM (EF BB BF).
- Hay 273 claves, sin duplicados, sin líneas raras, sin comillas internas sin escapar ni espacios sobrantes.
- Se calcularon las claves visibles a partir de los ficheros de script: avances, reformas, edificios (nombre, descripción y mantenimiento), unidades, familias, modificadores con nombre, decisiones (título, descripción y opción), cultura, grupo, lengua, eventos (título, descripción, variantes de descripción y opciones), tooltips de tope, descripciones del cupo de unidades y razón de coste. Son 273 y las 273 están. Faltan 0 y sobran 0.

## 3. Etiquetas, ids, prefijos y rutas
- 0 etiquetas de país, 0 `c:`, 0 `location:` y 0 ids de location. Las únicas palabras de tres letras en mayúscula son operadores (`NOT`) y un comentario.
- 0 letras de unidad, 0 rutas y 0 `fil<ruta>` en ningún fichero.
- 0 nombres de personas ni de modelos.
- Todas las claves propias llevan `gj_ank_` o `gj_ankaru_`, o son las del contrato (`gj_ankaruno`, `gj_grupo_solar`, `gj_lengua_ankaruna`, `gj_es_*`). Los ficheros llevan el prefijo `gj_ankaru_`.
- Los 19 ficheros están dentro de `partes/ankaru/`. No hay nada fuera.

## 4. Claves del motor contra el juego base
Todas existen.
- **Modificadores:** cada modificador usado (avances, reformas, cultura, grupo, edificios y modificadores con nombre) está en la definición de modificadores del juego base. 0 desconocidos entre todos los nombres de modificador usados.
- **Valores con nombre:** las 38 comprobadas existen. Son `monthly_food_productivity_*_bonus` y `_penalty`, `*_permanent_target_satisfaction`, `prestige_*`, `stability_*`, `*_influence_*`, `*_employment`, `*_build_time` y `small_production_efficiency_bonus`.
- **Eras:** las 6 (`age_1_traditions` a `age_6_revolutions`) están en `age/00_default.txt`.
- **Avances base usados en `requires`:** los 8 existen (`written_alphabet`, `agriculture_advance` y los 6 `unlock_*_advance`).
- **Iconos de avances:** los 5 existen (`swedish_royal_post_office`, `swedish_tradition`, `swedish_heritage`, `swedish_steel`, `terraces_advance`).
- **Plantillas de `copy_from`:** las 18 existen (`a_age_N_*_heavy_infantry`, `_light_infantry` y `_auxiliary`).
- **Terrenos:** `mountains`, `hills`, `plateau` y `flatland` están en `topography/00_default.txt`.
- **Etiquetas gráficas de unidad:** `medium_tag`, `musket_tag` y `light_tag` existen.
- **Claves de unidad:** `buildable`, `movement_speed`, `attrition_loss`, `supply_weight`, `strength_damage_done` y los bloques `combat` están en `unit_types/` del juego base.
- **Edificios:** existen las categorías, los costes de construcción (`terraces_`, `university_`, `tambo_`, `pukara_`, `guild_construction`), los empleos y los tiempos. La forma de un edificio propio coincide con `pukara_building`, `terraces` y `tambo`.
- **Efectos y triggers:** existen `add_migration`, `construct_building`, `trigger_event_non_silently`, `change_prosperity`, `change_development`, `add_estate_satisfaction`, `has_building`, `any_neighbor_country`, `current_age_or_later`, `total_effective_building_levels`, `total_building_levels_including_construction` (con la misma sintaxis que `capital_buildings`), `has_advance` y `province_definition`.
- **Banderas de religión:** esta parte no define ninguna. `gj_sol_blanco` es de otra parte.
- **`yearly_country_pulse`:** el juego base lo define en dos ficheros, el normal y el de un DLC (`d009_country_yearly.txt`). Hay precedente de que se funden. La duda de NECESITA.md punto 1 queda cubierta con esa evidencia, aunque sin probar en vivo.
- **Familias:** el formato `limit = <script value>` coincide con `janissaries` y `qizilbash`.

## 5. Cifras de RESUMEN.md contra los ficheros
Se recontaron con script y coinciden todas:

| Pieza | Contado |
|---|---|
| Bonificaciones | 68 (avances 50, reformas 9, cultura 7, grupo 2) |
| Avances | 25 (22 de país y 3 de cultura) |
| Reformas | 3 |
| Edificios | 15, con 39 líneas de modificador |
| Unidades | 18 |
| Eventos | 21 |
| Decisiones | 4 |
| Modificadores con nombre | 19, con 41 líneas |
| Localización | 273 |
| Piezas de la medida del encargo | 62 (25 + 3 + 5 + 3 + 21 + 4 + 1) |

Contra la vara de la sección 7 del contrato:
- **Bonificaciones:** 68, dentro de 60-70.
- **Avances:** 25, en el mínimo del rango de 25-30. Cubren las 6 eras, con 2 modificadores cada uno.
- **Reformas:** 3 (rango 2-3).
- **Edificios:** 5 cadenas, que mejoran en las eras 1, 3 y 5.
- **Unidades:** 3 líneas con una versión por era, encadenadas con `copy_from` y `upgrades_to_only`.
- **Eventos:** 21, cuando se piden 15-20 más los de la mecánica.
- **IDENTIDAD.md:** tiene todos los apartados, con 14 topónimos (rango 10-15).
- Los 15 edificios y las 18 unidades se desbloquean por avance, sin huérfanos.
- Los 21 eventos están definidos: del .9 al .19 por el pulso, los .1-.8 por el calendario, el .20 por el cambio de era y el .21 por la decisión de la Cuerda.

## 6. Equilibrio (MECANICAS H y sección 7)
- **Unidades.** Ningún valor pasa del 20 %: Guardianes -10 % de daño recibido y -5 % de moral recibida, y +15 % en montaña; Honderos +10 %; Porteadores -20 % de desgaste y -15 % de peso. Todas llevan debilidad (llanura, daño recibido o no combatir) y cupo por familia ligado a sus edificios.
- **Edificios.** Todos llevan límite: terreno, caminos, cupo por país, coste de mantenimiento o las tres cosas. Las terrazas al máximo dan +16,5 % de comida local, frente al +25 % de las terrazas del juego base. El Observatorio queda por debajo de la universidad.
- Ningún valor pasa un tope escrito, así que no se ha recortado nada. Los puntos en los que la regla admite lectura estricta van a pendientes.

## 7. Obras ajenas
Sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft u otras obras. Se buscaron esos nombres y los de los pueblos históricos del arquetipo (aztecas, incas, mongoles, vikingos y sus palabras) en todos los ficheros y no aparece ninguno. Los nombres propios (`Ankar`, `Ilmu`, `Altasol`…) son inventados. Las claves `tambo` y `pukara_building` son identificadores de iconos del juego base, no texto del mod.

## Arreglado
Nada. 0 fallos mecánicos encontrados, 0 ficheros modificados.

## Pendiente (no es mecánico)
1. **Situación o variables.** MECANICAS D4 dice que el calendario es «una situación». La parte lo hace con variables de país y 0 situaciones, y la sección 7 del contrato lo permite («situación, desastre, decisiones, variables…»). Si el jugador A quiere la situación, con mapa de color y votaciones, hay que rehacerlo.
2. **Guardianes del Paso.** Tienen tres valores a favor: daño recibido, moral recibida y el terreno de montaña. La regla dice «1 o 2 valores». Ninguno pasa del 20 %. Si se quiere la lectura estricta, se quita `morale_damage_taken` en las 6 versiones. Es un cambio de diseño, no de formato.
3. **Cadenas de edificios y «un nivel mejor».** Los niveles altos quedan lejos del edificio base equivalente:
   - Fuerte del Paso 3: defensa local 0,40 y guarnición 0,20, frente a 0,25 y 0,10 de `pukara_building`.
   - Casa de la Cuerda 3: control máximo 0,12, frente a 0,05 de `tambo`.

   Lo frenan el cupo por país (3, 5 y 7 para el fuerte), el coste de mantenimiento y que llegan en la era 5. Hay que decidir si cuenta como «un nivel mejor» o si se recorta. Lo ajusta la prueba de 100 años de IA sola.
4. **Acumulación de velocidad de construcción.** Los avances, la reforma, la cultura, el modificador de la fase de ayuno y la decisión de la Cuerda del Trabajo (+25 % temporal) pueden sumar mucho a la vez. Va con el estilo constructor, pero conviene vigilarlo en la prueba de IA.
5. **Pruebas en el juego**, las de NECESITA.md y dos más:
   - `culture = culture:gj_ankaruno` dentro de `potential` de un avance. El juego base usa `has_culture_group`. La forma `culture ?= culture:…` de los edificios sí tiene precedente.
   - Que los avances con tres `unlock_unit` desbloqueen las tres líneas.

   Faltan también iconos propios, bandera, misiones y formables, como ya dice RESUMEN.md.

## Ronda de reparación
- Comprobador (`comprueba-parte.mjs ankaru`) al empezar: PASA, 0 errores (0 textos que faltan y 0 otros), código de salida 0. 102 avisos, que no bloquean.
- Pendiente 3 (niveles altos): se recortan los dos niveles que se alejaban de «un nivel mejor». Fuerte del Paso 3: defensa local 0,40 a 0,30 y guarnición 0,20 a 0,15 (el nivel 2 queda en 0,15 de guarnición, como estaba). Casa de la Cuerda 3: control máximo 0,12 a 0,10 (nivel 1: 0,05; nivel 2: 0,08). Siguen con cupo por país, mantenimiento y era 5.
- Pendiente 4 (velocidad de construcción) y pendientes 1, 2 y 5 (situación, Guardianes, pruebas en el juego): no son mecánicos ni dependen de esta parte. Quedan para la prueba de IA y para la integración, tal como están en NECESITA.md.
- Nombres repetidos: «Casa de las Cuerdas» (marea_negra), «Cuentas claras» (sorava) y «Pasos cerrados» (minores_norte). La clave `ankaru` va antes en el orden alfabético que las tres, así que, por la regla de la ronda, renombran las otras partes y Ankarú conserva los suyos.
- Comprobador tras los cambios: PASA, 0 errores, salida 0. No se tocaron ganchos (on_action, INJECT, pulso anual) ni los recortes del revisor.