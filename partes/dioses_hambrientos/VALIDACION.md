# Validación de dioses_hambrientos (21-11)

Veredicto: ARREGLADO. 1 hallazgo mecánico, arreglado. Sin pendientes mecánicos. El juego no se ha ejecutado (NOT_TESTED).

## Comprobaciones
1. **Llaves:** equilibradas en los 11 .txt (sin comentarios ni cadenas): acciones 38/38, lugares 6/6, on_action 13/13, precios 3/3, religión 4/4, aspectos 16/16, focos 37/37, efectos 40/40, eventos 146/146, colores 2/2, modificadores 20/20.
2. **Localización:** el .yml va en UTF-8 con BOM y empieza por `l_spanish:`; 98 claves, 0 líneas mal formadas. Toda clave visible (religión, aspectos, enfoques, lugares, modificadores, acciones, título, descripción y opciones de los 11 eventos, los `custom_tooltip`) tiene texto. No falta ninguna. Los .txt llevan BOM; RESUMEN.md y NECESITA.md no lo necesitan.
3. **Identidad:** sin etiquetas de país, sin ids de locations, sin rutas de disco ni nombres de personas o de modelos. Todo está bajo `partes/dioses_hambrientos/`. Nombres originales (Orrum, Vethkar, Daroh, Cribadores...), sin rastro de las obras vetadas.
4. **Claves del motor:** comprobadas por búsqueda en `game/` unas 75 claves distintas, y todas existen: modificadores (monthly_religious_influence, maximum_religious_influence, slave_raid_efficiency, local_slaves_goods_output_modifier, global_food_decay, local_max_control...), valores (`religious_influence_*_bonus/_penalty` están en `main_menu/common/script_values`), efectos y triggers (add_religious_influence, ordered_pop, clamp_variable, pop_type_population_in_country, has_religious_aspect, has_completed_religious_focus), banderas de religión (has_religious_influence, tonal_gfx), `on_took_location_in_peace_treaty` y `yearly_country_pulse`. El base ya define `on_took_location_in_peace_treaty` en dos ficheros (`_hardcoded.txt` y `religious_order_conquest.txt`), así que el motor fusiona bloques repetidos: el enganche (B) es seguro. Queda por probar en vivo el (A).
5. **Cifras de RESUMEN.md:** cuadran. 53 líneas de modificador = 19 de religión (5 + 8 + 6) + 9 de lugares + 25 de estáticos; 11 eventos; 2 lugares; 4 aspectos; 3 enfoques; 3 acciones; 3 precios; 98 claves. Vara de la sección 7 para una religión: 15-20 bonificaciones (19, llega), 2-4 aspectos (4), 8-12 eventos (11), 1-2 lugares (2), `lee_presagio` (hay). No hay relleno vacío. No se exigen escuelas a esta religión (tabla 5). Las exigencias de 60-70 bonificaciones, edificios y unidades son de las facciones y no se aplican aquí (0 y 0 es correcto).
6. **Equilibrio:** todos los valores caen dentro del rango que ya usa el base para religiones, aspectos, enfoques y avances: monthly_religious_influence 0,05-0,15 (base hasta 0,3), slave_raid_efficiency 0,15-0,25 (base hasta 0,33), amount_looted_modifier 0,25 (base hasta 0,5), global_war_score_efficiency 0,1 (hasta 0,4), land_morale_modifier ±0,05-0,1 (hasta 0,2), monthly_legitimacy ≤0,1 (hasta 0,15), global_garrison_size_modifier 0,1 (hasta 0,2). Cada ventaja lleva su coste: devoción que cae con la paz, ayuno que baja moral, enfoque con mantenimiento de ejército -0,1. Ningún valor pasa el tope.
7. **Obras ajenas:** nada.

## Arreglado
- **Prefijo (contrato §3):** las claves propias empezaban por `gj_dh_` y deben llevar `gj_dioses_hambrientos_`. Se renombraron las 187 apariciones en los 11 .txt, el .yml, RESUMEN.md y NECESITA.md (aspectos, enfoques, lugares, modificadores, acciones, precios, efectos, variables, on_action y localización), conservando BOM y saltos de línea. Se volvió a comprobar que no falta ninguna clave de localización ni se rompieron las llaves. Ojo a la integración: el enfoque que Orunmar puede pedir es ahora `has_completed_religious_focus = gj_dioses_hambrientos_foco_hierro_del_alba`, y la variable de años de paz es `gj_dioses_hambrientos_anos_de_paz`. Ninguna otra parte usaba los nombres viejos (solo `mundo_bestias` llama a `gj_dioses_hambrientos_lee_presagio`, que ya era correcto).

## Pendiente (no mecánico, para la integración o la sesión eu5-mundo)
- Todo lo de NECESITA.md: `gj_fe_sur`, asignar la religión a `gj_orunmari`, que `mundo_bestias` llame al presagio (ya lo hace), asignar los lugares sagrados a locations.
- Comprobar en vivo que el motor fusiona `yearly_country_pulse` del (A), y la macro con parámetro negativo (`FRACCION = -0.4`) del efecto `gj_dioses_hambrientos_consume_cautivos`. Si el motor la rechaza, pasar la fracción en positivo y restar dentro del efecto.
- `ordered_pop` con `order_by = pop_size` y `add_pop_size` en el efecto de ofrendas: sintaxis copiada del patrón del base, sin probar en vivo.
- Las referencias a `scope:loser.culture` en el botín de cautivos dependen de que ese scope exista en `on_took_location_in_peace_treaty`: no se pudo confirmar en el base. Probar en vivo.


## Ronda de reparación
- Comprobador (comprueba-parte.mjs dioses_hambrientos): PASA, 0 errores (0 textos que faltan, 0 otros), código de salida 0; 41 avisos, todos de claves de localización de elementos definidos en scripts (el comprobador no las ve como usadas).
- Nombres repetidos: esta parte no figura en ningún par de BALANCE.md. «El gran banquete» (con orunmar) es la misma mecánica compartida y se queda, como dice el propio balance. No se renombró nada.
- Equilibrio: no se tocó. Ganchos (on_action, pulso anual): no se tocaron.
- Orunmar debe usar los nombres gj_dioses_hambrientos_: es cosa de la parte orunmar (ya anotado en NECESITA.md).
- Queda, sin depender de esta parte: probar en vivo `scope:loser` en `on_took_location_in_peace_treaty`, la macro con FRACCION negativa y `ordered_pop` con `order_by = pop_size`.
