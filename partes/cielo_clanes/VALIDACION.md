# VALIDACION: cielo_clanes (21-11)

Veredicto: ARREGLADO. 2 fallos mecánicos corregidos; el resto, pendiente o sin objeción.

## Comprobaciones
1. Llaves: equilibradas en los 11 .txt (contadas sin comentarios ni cadenas; eventos 130/130, efectos 75/75, decisiones 25/25, modificadores 36/36, on_actions 15/15, dioses 18/18, aspectos 8/8, religión 4/4, lugares 6/6, enganches 4/4, color 2/2). Se repitió el recuento tras los arreglos.
2. Localización: .yml en UTF-8 con BOM y empieza por `l_spanish:`. Están todas las claves visibles: religión (nombre, ADJ, desc), 6 dioses (nombre y desc), 4 aspectos, 2 lugares, 18 modificadores (NAME y DESC), 2 decisiones (title, desc, a), 11 eventos visibles (title, desc y opciones). El evento .12 es oculto y no necesita texto. Convención de claves igual que el base.
3. Identidad: sin TAG, sin ids de locations, sin letras de unidad ni rutas. Todas las claves propias llevan `gj_cielo_clanes_` o `gj_` (reinos, favor, dioses, aspectos, lugares, `gj_cd_*`, `gj_dios_reinado`). Nada fuera de `partes/cielo_clanes/`.
4. Claves del motor (muestra de 60, todas halladas en el juego base): 
   - modificadores: monthly_legitimacy, army_light_cavalry_power, land_unit_attrition, movement_speed_if_no_road, stability_cost_efficiency, global_population_growth, global_horses_output_modifier, discipline, army_movement_speed, trade_range_modifier, global_monthly_food_modifier, naval_morale_modifier, global_hostile_attrition, tolerance_heathen, tolerance_own, prestige_from_land_battle, capital_movement_cost_modifier, local_clergy_desired_pop, local_monthly_prosperity, local_max_control, local_max_literacy, local_unrest, global_max_literacy, global_manpower_modifier, army_heavy_cavalry_power, land_morale_modifier, global_defensive, amount_looted_modifier, global_monthly_prosperity, monthly_prestige;
   - efectos y triggers: add_god, remove_god, has_country_modifier, remove_country_modifier, clamp_variable, change_gold_effect, add_war_exhaustion, add_estate_satisfaction, trigger_event_non_silently, ruler_or_regent;
   - constantes: monthly_food_productivity_weak_bonus, prestige_weak_bonus, prestige_mild_bonus, prestige_weak_penalty, legitimacy_weak_penalty, legitimacy_mild_bonus, stability_weak_bonus, estate_satisfaction_mild_bonus/penalty, war_exhaustion_weak_bonus, modifier_duration_years_short/normal/long;
   - estructura: country_specific_decisions, pagan_gfx, religious_aspects, yearly_country_pulse, on_new_ruler, mode add_and_extend, years = -1, nobles_estate, clergy_estate.
   `add_god`/`remove_god` solo aparecen en el base dentro de una organización internacional (hindu_branch), con la sintaxis `god:<clave>` que usa esta parte. El formato de dioses y de religión copia el de tengri.
5. Cifras de RESUMEN.md: cuadran (6 dioses, 4 aspectos, 12 eventos con 1 oculto, 2 decisiones, 7 efectos, 2 lugares sagrados, 18 estáticos, 114 claves de localización según el autor). Contra la vara de religión (sección 7, de 15 a 20 entre definition_modifier, aspectos y focos): definition_modifier 4 + aspectos 8 = 12; con los dioses, 22; con lugares y estáticos, 76. No se rellenó nada. Ver pendientes.
6. Equilibrio: no hay unidades ni edificios, así que el tope de MECANICAS H (+15-20 % por unidad, un nivel por edificio) no se aplica. Cada reinado lleva fuerza y precio. Ningún valor suelto pasa los del base (la religión da legitimidad 0,05 y caballería ligera 0,1, el base de tengri 0,1 y 0,1; global_population_growth 0,0001 igual que umay).
7. Obras ajenas: sin coincidencias con Tolkien, Anbennar, Juego de Tronos, Warcraft u otras. Los nombres (Aurak, Ilsa, Korvun, Halet, Mura, Dzerek) son originales.

## Arreglado
1. Variables de enfriamiento sin `value`: las 10 `set_variable` con `years` (`gj_cd_pabellon`, `lunas`, `cometa`, `viejo`, `eclipse`, `potros`, `ritos`, `lobos`, `mudanza`, `peregrinacion`) no llevaban `value`; el base siempre pone `value` junto a `years`. Se añadió `value = 1` en cada una (8 en eventos, 2 en decisiones).
2. Codificación: los .txt iban sin BOM y los del base del mismo tipo (eventos, religiones, decisiones) llevan BOM (EF BB BF). Se añadió el BOM a los 11 .txt, como pide la sección 3.

## Pendiente (no mecánico)
- Religión con 22 bonificaciones estrictas frente a la vara de 15-20: se pasa por 2 por los dioses. Decidir si los modificadores de dios cuentan o no, o recortar uno por dios.
- Acumulación de caballería ligera: definición 0,10 + dios Korvun 0,05 + reinado 0,15 + aspecto 0,05 + cometa 0,05 + potros 0,05 = hasta 0,45 en el mejor caso. No hay tope de unidad aquí, pero conviene probarlo con IA sola 100 años (MECANICAS H).
- Por probar con el juego: `add_god`/`remove_god`/`god:` en este contexto; que el motor fusione las on_actions de enganches (si no, copiarlas a mano); que `gj_cielo_clanes_presagio_$tipo$` se resuelva con el parámetro.
- Integración: grupo `gj_fe_norte`, llamada desde mundo_bestias, icono de religión y locations de los lugares sagrados (ya en NECESITA.md).
- Vara de 76 líneas frente a «60-70 por país»: es una religión y las cuenta el país, no esta parte.


## Ronda de reparación

- Comprobador (comprueba-parte.mjs cielo_clanes): PASA, 0 errores (0 textos que faltan y 0 otros), código de salida 0, 23 avisos. Los avisos son claves de localización que ningún script de la parte usa directamente (dioses, lugares sagrados y 2 decisiones, que el motor lee por convención de nombre); no son errores.
- Textos que faltan y claves o eventos inexistentes: ninguno; no hizo falta tocar ficheros de juego ni de localización (siguen en UTF-8 con BOM).
- Nombres repetidos: esta parte no figura en ninguno de los pares de BALANCE.md salvo «La tienda abierta» (compartido con kaivan, correcto por ser la misma mecánica), que se queda. Ninguno de los otros 11 nombres repetidos aparece en esta parte.
- Recorte de caballería ligera de la religión (0,1 a 0,05) y formato de los ganchos: sin tocar, como se pedía.
- Pendiente que no depende de esta parte: decidir si los dioses cuentan para la vara de 15-20 bonificaciones (22 contados); probar en el juego add_god, remove_god y god:; enganchar el dios del reinado al Círculo de kaivan (integración).
