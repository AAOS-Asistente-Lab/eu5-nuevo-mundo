# VALIDACION: orunmar

Resultado: **ARREGLADO**. Seis arreglos mecanicos hechos; el resto de lo dudoso queda como pendiente.

## Comprobaciones (todas sobre los ficheros, con Node y PowerShell; el juego no se ha ejecutado)
1. Llaves: equilibradas en los 19 .txt (comentarios y cadenas quitados). Antes y despues de los arreglos.
2. Localizacion: 257 claves en los 3 .yml, sin duplicados ni lineas mal formadas. Las 167 claves visibles (titulos, descripciones y opciones de eventos, decisiones, avances, reformas, edificios con su _desc y su _maintenance, unidades, modificadores, desastre, casus belli, cultura, grupo y lengua): cero faltas. Los .yml van en UTF-8 con BOM y empiezan por `l_spanish:`; los 22 ficheros del juego, con BOM.
3. Identidad: cero etiquetas de pais, cero ids de locations, cero rutas de disco ni UUID. Nada queda fuera de `partes/orunmar/`.
4. Claves del motor: se leyeron los 3.413 .txt/.info de G y se comprobo que todo identificador no propio de los 19 ficheros existe en el juego base (cero desconocidos). Ademas, todas las claves de modificador usadas (unas 60) existen en `modifier_type_definitions` (3 ficheros). Muestra mirada a mano contra el base: eras `age_1_traditions` ... `age_6_revolutions`, unidades base `a_age_N_{heavy_infantry,light_infantry,auxiliary}`, `a_warriors_construction/maintenance`, `terraces_construction`, on_actions `yearly_country_pulse`, `on_war_declared` (scope:actor), `on_winning_war` (scope:winner, scope:war) y `on_new_age`, formato de desastre, casus belli, objetivo de guerra y decisiones (`religious_decisions`, `economy_decisions`, `country_specific_decisions`), `var:x >= n` en eventos, `has_building_with_at_least_one_level`, `total_effective_building_levels`, `max_levels` con valor de script y `limit` de unidad con valor de script.
5. Cifras de RESUMEN: cuadran con lo contado. 70 bonificaciones (48 + 4 + 9 + 6 + 3), 24 avances de pais (5, 4, 4, 4, 4, 3 por era) y 2 de cultura, 3 reformas, 5 edificios, 18 unidades (3 cadenas x 6), 20 eventos, 4 decisiones, 1 desastre, 17 modificadores temporales. Llegan a la vara de la seccion 7 (60-70 bonificaciones por pais y cultura, sin contar eventos). Quedan en el limite: 26 avances entre pais y cultura (la vara dice 25-30 a grosso modo) y 17 eventos tematicos mas los 3 del desastre.
6. Equilibrio: ver los arreglos. Unidades dentro del 15-20 % de la seccion 7 con debilidad y cupo.
7. Obras ajenas: cero coincidencias con Tolkien, Anbennar, Juego de Tronos, Warcraft ni nombres historicos calcados; tampoco nombres de personas ni de modelos.

## Arreglado
1. Prefijo: `cb_gj_cosecha` pasa a `cb_gj_orunmar_cosecha`, `gj_superiority_cosecha` a `gj_orunmar_superiority_cosecha` (y su `war_goal_..._desc`), los avances `gj_orunmari_costumbre_del_banquete` y `gj_orunmari_ojo_del_tintorero` a `gj_orunmar_cultura_costumbre_del_banquete` y `gj_orunmar_cultura_ojo_del_tintorero`, la lengua `gj_lengua_orunmari` a `gj_orunmar_lengua` y el color `gj_map_orunmari` a `gj_orunmar_color`. Cambiado en .txt, .yml, RESUMEN e IDENTIDAD. Se conservan `gj_orunmari` y `gj_grupo_carmesi` (los fija el contrato).
2. Equilibrio: el Cazador del Dosel (6 versiones) tenia 3 valores a favor (iniciativa +2, selva +20 %, montana +10 %); se quita el +10 % de montana para quedar en 2, como pide la seccion 7. Texto de la localizacion y RESUMEN alineados.
3. RESUMEN: referencia a los avances de cultura actualizada tras el cambio de nombre.

## Pendiente (no mecanico)
- Edificios: `max_levels` sube con las eras hasta 3 (Escalinata, Huerto, Taller, Atalaya) y 4 (Casa de los Cautivos), frente a 1 en los unicos del base (`calmecac`, `terraces`). RESUMEN afirma «un solo nivel mas», que no cuadra. La regla de MECANICAS H («como mucho un nivel mejor») admite dos lecturas; decide la mesa si se recorta el tope de niveles o el valor por nivel. Los valores por nivel son modestos (p. ej. `local_food_capacity` 50, `local_defensive` 0,1).
- Dudas del autor, sin probar en juego: comparaciones `var:gj_orunmar_cautivos >= n` y `gj_orunmar_anios_de_paz >= n` (la forma existe en el base), el campo `antagonism` del objetivo de guerra (existe en el base) y el `limit` de las unidades.
- Que el motor funda las on_actions anadidas con las del base: el base ya lo hace en `religious_order_conquest.txt` para `on_winning_war`; falta confirmarlo en carga.
- Dependencias de otras partes: `gj_es_orunmar`, `religion:gj_dioses_hambrientos` con `has_religious_influence` y `religion:gj_sol_blanco`.
- Tres modificadores temporales sin uso (`gj_orunmar_hambre_de_la_mesa`, `gj_orunmar_obra_de_los_esclavos`, `gj_orunmar_cosechador_de_hombres`): inofensivos; conviene engancharlos o quitarlos.
- Sin iconos propios ni `ai_weight` en los avances; las 18 unidades reutilizan `medium_tag`; imagen del desastre prestada. Equilibrio sin partidas de IA.
- Estetica: la tabla de MECANICAS H pide 2 edificios y 1-2 unidades; el contrato de la seccion 7 pide 5 y 2-3. Se sigue el contrato.

## Ronda de reparación
- Comprobador (comprueba-parte.mjs orunmar): al empezar ya daba 0 errores (0 textos que faltan, 0 otros); al acabar, igual: PASA, código de salida 0, 108 avisos.
- Quitados los 3 modificadores temporales sin uso (gj_orunmar_hambre_de_la_mesa, gj_orunmar_obra_de_los_esclavos, gj_orunmar_cosechador_de_hombres) con sus 6 claves de localización. Quedan 14 modificadores (12 de país y 2 de location); llaves equilibradas y BOM intacto. RESUMEN actualizado con esa cifra.
- Nombres repetidos: «Tiradores de la Niebla» (con skarren) y «Cazadores del dosel» (con minores_sur). Por el orden alfabético de la clave, orunmar va antes que skarren pero después de minores_sur: en el primer par renombra skarren y en el segundo, minores_sur. Orunmar conserva ambos nombres.
- Sin tocar: tope de niveles de edificios (decisión de la mesa), recortes del revisor y formato de los ganchos (lo reescribe la integración).
- Queda, sin depender de esta parte: pruebas en el juego (comparaciones ar:, ntagonism, limit de unidades, fusión de on_actions) y las dependencias de NECESITA.md.