# Revisión de equilibrio y coherencia de las 27 partes (2026-11-21 01:12)

Revisión hecha sobre los ficheros de `partes/*/` con un recuento automático (líneas de modificador por avance, reforma, cultura y grupo; unidades; edificios; claves; ficheros; textos) y comparada con el juego base (sumas por fichero de `advances/`, plantillas de `unit_types/` y `unit_categories/`). Las copias de los ficheros tocados, antes del cambio, están fuera del mod (copias de la sesión de revisión).

## 1. La vara (el jugador A: «60 o 70 bonus por cultura y por país, sin contar eventos, eso aparte»)
Recuento propio (país + cultura + grupo, sin eventos): ankaru 64, durnhal 69, hrimval 69, kaivan 67, lagunas 63, marea_negra 67, orunmar 70, ostrevar 69, skarren 70, sorava 68, thalassar 68, velathi 69.
- **Las 12 facciones llegan a la vara de 60-70.**
- Lo propio de la cultura (cultura + 2-3 avances de cultura + grupo) son solo 10-17 por facción. Si el jugador A quería 60-70 **para cada una** (país por un lado y cultura por otro), no llega ninguna. Hay que preguntárselo en una línea.
- Avances propios: kaivan 23 y marea_negra 23 (la sección 7 pide 25-30). Los demás, entre 25 y 29.
- Menores: unos 15 por menor (minores_norte 108 en 8 culturas, minores_sur 110 en 7). No llegan si la vara se aplica también a los menores. Lo decide el jugador A; la recomendación es dejarlos así (en el juego base, los menores casi no tienen contenido propio).
- Religiones (vara de 15-20, contando definición, aspectos y dioses): cielo_clanes 25, llama_profunda 24, sol_blanco 24, espiritus_lago 22, luz_fundadores, mar_dormido y pacto_balanza 21, senda_verde 20, escarcha_silente 16 y dioses_hambrientos 14. Se pasan un poco si los dioses cuentan. Las cifras de los RESUMEN (76, 59, 53) usan otra forma de contar.

## 2. Recortes aplicados (solo números)
| Parte | Fichero:línea | Cambio | Por qué |
|---|---|---|---|
| thalassar | `unit_types/gj_thalassar_unidades.txt` (Nave de Marea y Galera de Cristal, 12 tipos) | Los valores absolutos pasan a ser diferencias sobre la plantilla de su era (por ejemplo, en la era 1, velocidad 9.2 → +1.2, casco 3 → -1 y cañones 3 → -1; en la galera, cañones 9 → +1) | Con `copy_from` los valores se **suman**: el juego base usa `hull_size = -1` (`n_dhow`) y `movement_speed = 1` con `cannons = 2` (`n_genoese_galley`), que solo tienen sentido como diferencias. Escritos como absolutos, los barcos casi doblaban la plantilla. El efecto que querían (+15 % de velocidad y menos casco) no cambia. |
| skarren | `unit_types/gj_skarren_unidades.txt` (Corredor del Fiordo, 6 tipos) | Lo mismo: velocidad +1, capacidad +0.05 a +0.3, cañones -2 y casco -1 en cada era | La validación de skarren había pasado los valores a absolutos; con suma, eso daba más del doble. Se vuelve a las diferencias del autor. |
| skarren | mismo fichero, líneas 228, 246, 264, 282, 300 y 317 | `initiative` de los Arponeros: 6 → 1 | Se suma a los 5 de la categoría de infantería ligera: con 6 quedaba en 11 (+120 %). Con +1 queda en 6, que es el +20 % que pretendía el RESUMEN. |
| skarren | `advances/gj_skarren_avances.txt`:15, 135, 175 y 225; `government_reforms/gj_skarren_reformas.txt`:36 | `amount_looted_modifier` 0.2/0.15/0.15/0.2 → 0.1 cada uno, y la reforma de 0.25 → 0.15 | Sumaban +1.0 de botín (+1.45 con la religión), y el máximo del juego base es 0.5 (la horda esteparia). Ahora suman 0.6 con el grupo. |
| espiritus_lago | `gods/gj_espiritus_lago_dioses.txt`:100 | presagio Costa sin Luz: botín de 0.25 → 0.15 | Era uno de los pendientes de la propia parte; se acumulaba con Skarren. |
| hrimval | `advances/gj_hrimval_avances.txt`:57, 178 y 218; `government_reforms/gj_hrimval_reformas.txt`:39 | `discipline` de 0.05/0.03/0.05/0.03 → 0.03/0.02/0.03/0.02 | La suma, 0.16, pasaba del máximo de un país del juego base (0.10). Ahora es 0.10. |
| hrimval | `advances/gj_hrimval_avances.txt`:243 | `global_manpower_modifier` de 0.15 → 0.05 | La suma pasa de 0.55 a 0.45, el máximo del juego base. Además, Hrímval tiene que ser poco expansiva. |
| lagunas | `advances/gj_lagunas_avances.txt`:279; `government_reforms/gj_lagunas_reformas.txt`:31 | `trade_income` de 0.10 → 0.05 en los dos | La suma, 0.43, era más del doble del máximo del juego base (0.20, Portugal). Ahora es 0.33. |
| kaivan | `advances/gj_kaivan_avances.txt`:255 | `army_light_cavalry_power` de 0.1 → 0.05 | Los avances pasan de 0.40 a 0.35, el máximo del juego base. |
| cielo_clanes | `religions/gj_cielo_clanes_religion.txt`:9 | `army_light_cavalry_power` de 0.1 → 0.05 | Kaïvan, con su religión, llegaba a +0.6 de caballería ligera. Ahora el máximo es +0.5. |
| velathi | `government_reforms/gj_velathi_reformas.txt`:38 | `global_hostile_attrition` de 1 → 0.5 | El grupo, el avance y la reforma sumaban 2.0, el máximo del juego base (un grupo cultural entero). Ahora es 1.5, sin contar los edificios. |

Quedan desfasados por estos recortes: el RESUMEN de skarren (líneas 23 y 25, que hablan de «absolutos» y de «iniciativa 6») y su VALIDACION (puntos 1 y 2). Si algún texto de localización cita las cifras viejas, hay que corregirlo. Lo de que los valores se sumen está deducido del juego base y no se ha probado en vivo: hay que comprobarlo al cargar (NOT_TESTED).

## 3. Hallazgos que no son números (para la integración)
1. **El pulso anual, de tres formas:** 17 partes declaran `yearly_country_pulse` como clave suelta, 3 (mundo_contacto, ostrevar y skarren) usan `INJECT:yearly_country_pulse`, y espiritus_lago y mundo_bestias declaran `on_game_start`. Si el motor no las funde, cada una pisa a las demás y al juego base. Recomendación: un solo fichero de integración que inyecte una lista con los pulsos de todas las partes, y quitar las claves sueltas.
2. **`gj_inquietud_caldera`:** llama_profunda la escribe con `set_global_variable` sin ser la dueña (lo es durnhal). Durnhal la cambia con `change_global_variable` y `clamp_global_variable`, que no aparecen en ningún fichero del juego base. Recomendación: que durnhal tenga un efecto `gj_durnhal_sube_inquietud` con la forma de llama_profunda (`set_global_variable` con `value = { value = global_var:… add = … }`) y que llama_profunda lo llame.
3. **`gj_noche_blanca_comienza`:** escarcha_silente la usa, pero hrimval (la dueña) no la define; solo tiene `gj_noche_blanca_adelanta`. Hay que definirla en hrimval o cambiar el evento .9 de escarcha_silente.
4. **Piezas de la sección 5:** el resto está bien. Las 10 religiones definen su `lee_presagio`. Solo mundo_bestias escribe `gj_dragon_estado`. Las escuelas las definen espiritus_lago y mar_dormido. Hrimval tiene la situación y la organización. Marea Negra tiene las patentes de corso. Mundo_ruinas tiene los casus belli y mundo_contacto, las enfermedades. Nadie define `gj_fe_norte` ni `gj_fe_sur`, como debe ser. Los 11 grupos culturales sí existen: el pendiente de minores_norte y minores_sur que decía «los pone la integración» ya está resuelto, porque los definen las facciones.
5. **Nombres de fichero repetidos:** `gj_minores_sur_familias.txt` y `gj_velathi_familias.txt` están a la vez en `language_families/` y en `unit_families/`. Como van en carpetas distintas no chocan, pero confunden: conviene renombrarlos al integrar. Entre partes no se repite ninguna clave de contenido ni de localización.
6. **Prefijos fuera del contrato:** gj_ank_, gj_lag_, gj_thal_, gj_mar_, gj_pacto_, gj_llama_, gj_marea_negra_ en las unidades, gj_ruina_/gj_veta_/gj_monumento_ y gj_contacto_/gj_ev_/gj_loc_. Además, mundo_ruinas define `gj_es_ruina` y `gj_es_veta`, que usan el prefijo reservado a «este país es la facción X». Recomendación: renombrar estos dos a `gj_mundo_ruinas_es_*` y dejar los demás prefijos como están, porque otras partes ya los usan.
7. **Velocidad de las unidades de tierra:** es un número fijo (de 2 a 3 según la categoría), no un porcentaje. Las partes que escribieron -0.10 o -0.15 pensando en un -10-15 % dejan una penalización menor de la que querían (entre -3 % y -7 %). No se corrige porque deja a las unidades del lado débil, pero conviene saberlo al revisar el equilibrio.
8. **Esperanza de vida de los personajes:** la cultura gj_velathi tiene +150 años (y hrimval, +20 e `is_immortal`). En el juego base los valores van de ±5 a ±10. Un buen gobernante que no muere nunca es fuerte, y uno malo es una condena. Es una decisión de diseño: la recomendación es dejarlo en +40 o +60.

## 4. Equilibrio entre facciones: lo más fuerte tras los recortes
- **Ankarú:** +0.35 de velocidad de construcción en los avances, +0.05 de la cultura y más de la fase de ayuno y de la decisión de la Cuerda. Ostrevar tiene +0.2, y en el juego base ningún país tiene esta bonificación propia. Es la tall del sur y la favorita de el jugador A, así que no se ha tocado; si en la prueba de IA a 100 años construye el doble que el resto, hay que bajar los avances a +0.25.
- **Thalassar:** +2 huecos de reforma (un avance y una reforma que da su propio hueco), +0.25 de investigación y +0.4 de bloqueo. En el juego base, los huecos extra solo los dan las eras. Es pequeña y rica, y por eso se acepta, pero hay que vigilarla.
- **Investigación al ir por detrás:** con mundo_contacto se suma hasta +55 %, y además Ankarú tiene +0.28 y Thalassar +0.25. La regla de «tecnología a la par» está bien, pero se puede pasar de largo.
- **Orunmar:** +0.45 de influencia religiosa mensual (en el juego base, el máximo es 0.3) y +0.4 de infantería ligera (como el máximo del juego base). Lo primero sostiene su mecánica (en la paz pierde devoción). Se deja.
- **Velathi:** +0.6 a la madera (+0.7 con la cultura); en el juego base, un país tiene como mucho +0.2. Es su estilo («mucha madera»), y la madera es un bien barato. Se deja.
- **Skarren:** `global_navy_levy_size_modifier = 0.5` en una reforma; no hay nada igual en los avances del juego base. Pendiente de la prueba de IA.
- **Ostrevar:** +0.35 a la cantería y +0.26 a la capacidad de población; en el juego base, los máximos son 0.15 y 0.10. Es la tall del norte. Se deja, pero hay que vigilar la Cantería Real y la Llamada de las Ciudades.
- Los edificios están dentro de las escalas del juego base (capacidad de comercio, alfabetización, crecimiento de instituciones, barcos a la vez). Lo que hay que medir son los topes por era, de 4 a 6 niveles (durnhal, skarren, velathi, lagunas y orunmar).

## 5. Nombres repetidos o poco originales
- **Repetidos entre partes:**
  - «Tiradores de la Niebla»: la unidad de era 6 de orunmar y la de skarren;
  - «Cazadores del dosel»: minores_sur y orunmar;
  - «Diques y esclusas»: lagunas y thalassar;
  - «Escoltas de caravana»: lagunas y sorava;
  - «Casa de las Cuerdas»: ankaru y marea_negra;
  - «Juramento renovado»: kaivan, minores_sur y mundo_bestias;
  - «Marea roja»: mar_dormido y skarren;
  - «Palabra de oro»: pacto_balanza y sorava;
  - «Cuentas claras»: ankaru y sorava;
  - «Ceniza fértil»: minores_sur y mundo_bestias;
  - «Pasos cerrados»: ankaru y minores_norte.

  Hay que renombrar uno de cada par. Los que comparten las partes de una misma mecánica son correctos y se quedan: la Noche Blanca, «La corte se duerme» y «La Vigilia Blanca» (hrimval y escarcha_silente), «El gran banquete» (orunmar y dioses_hambrientos) y «La tienda abierta» (kaivan y cielo_clanes).
- **Calcos:** skarren usa en sus textos «jarl», «jarls», «Jarlato» y «skald», 50 veces en total. Son títulos nórdicos reales, y el contrato (§2) prohíbe calcar a los vikingos. Hay que cambiarlos por títulos propios. «Velathi» está muy cerca de Velathri, el nombre etrusco de una ciudad real: es menor, pero hay que decidirlo. «Liga» la usan dos partes: la de Lagunas (escuela de los barqueros) y la de la Sal y la Llama (hrimval). Conviene que sus nombres no se confundan en pantalla.

## 6. PETICION.md, punto por punto
- **Tall en cada continente:** sí. Ostrevar (norte) tiene la Llamada de las Ciudades y la migración, y Ankarú (sur) tiene la decisión Colonos del Sol, que mueve población, y la Cuerda. Lo que falta es medirlas en partida.
- **Guerras de cosecha:** sí. Orunmar tiene su casus belli de cosecha y `war_no_cb_cost_modifier`. Los cautivos pasan a esclavos (`change_pop_type` y `add_pop` de dioses_hambrientos) y la devoción baja con los años de paz. Falta probar en vivo que el antagonismo del objetivo de guerra sea bajo.
- **Plaga suavizada:** sí, con `REPLACE:great_pestilence` y `smallpox` en mundo_contacto. Si `REPLACE:` no funciona en diseases ni en situations, habrá claves duplicadas. Es la prueba más importante al cargar.
- **Tecnología a la par:** sí, con la difusión del saber. Puede que se pase (ver la sección 4).
- **Kurultai de Kaïvan:** sí, con `set_capital` en los efectos y los edificios con `counts_as_capital`. Depende de que `on_ruler_death_delayed` se funda con el del juego base. Si no se funde, el Círculo no se reúne nunca. Hay que meterlo en el fichero de pulsos de la integración.
- **Hrímval, poco expansiva:** sí. Fuera del frío, la tierra recibe `gj_hrimval_deshielo` (-0.25 de control y pierde población). Con los recortes de disciplina y de levas, deja de ser la mejor tropa de la partida.

## 7. Pendientes por parte para la integración
(Además de definir `gj_es_<clave>` y los `gj_zona_*` de cada NECESITA.md, de los iconos y de la prueba de IA a 100 años, que son comunes a todas.)
- **ostrevar:** probar `INJECT` en on_action, `allow` con `population` y el `limit` por script value; aplicar `gj_ostrevar_cuenta_del_ejercito`; definir `gj_zona_estepa` o quitar el evento .12; textos propios de las unidades 2 a 6; vigilar la Llamada de las Ciudades (+25 % de atracción) y la Cantería Real.
- **ankaru:** decidir si los niveles altos del Fuerte del Paso y de la Casa de la Cuerda pasan de «un nivel mejor»; vigilar la velocidad de construcción (sección 4); renombrar «Casa de las Cuerdas», «Cuentas claras» y «Pasos cerrados»; probar `culture =` en el potential de los avances y varios `unlock_unit` por avance.
- **orunmar:** decidir el tope de niveles de los edificios (de 3 a 4 frente a 1); enganchar o quitar los 3 modificadores sin uso; probar el antagonismo del casus belli y la fusión de 4 on_actions; renombrar «Tiradores de la Niebla» y «Cazadores del dosel».
- **kaivan:** faltan 2 avances con contenido (23 de 25); el Círculo depende de `on_ruler_death_delayed`; los arqueros y los jinetes lobo tienen 3 mejoras cada uno (vigilar); 4 modificadores y 3 valores sin uso; probar `create_country_from_location` y `construct_building` con coste 0; renombrar «Juramento renovado».
- **durnhal:** reescribir `change_global_variable` y `clamp_global_variable` (no existen en el juego base) y ofrecer el efecto de subir la inquietud a llama_profunda; la Bombarda de runa no llega una era antes; Gran Forja hasta el nivel 6 (medir); faltan el TAG, la bandera y el escudo.
- **hrimval:** definir `gj_noche_blanca_comienza` para escarcha_silente; los Acechadores suben 3 valores (vigilar); probar `government_reform_slots` en la reforma, `is_immortal` y `add_pop`; disciplina y levas ya recortadas.
- **thalassar:** las unidades navales ya están en diferencias (hay que comprobar en vivo que se sumen); +2 huecos de reforma (vigilar); probar `max_ships_built_at_same_time` en el Faro, que no es un astillero; la situación formal sigue siendo una decisión de el jugador A; renombrar «Diques y esclusas».
- **lagunas:** el prefijo es gj_lag_ (no se renombra); probar los deltas, `limit` con número literal y `upgrades_to_only` naval; enganchar `gj_lagunas_pulso_anual`; los ingresos de comercio ya están recortados; renombrar «Escoltas de caravana» o «Contrato de especias»; la Asamblea va con eventos, no con una situación.
- **skarren:** quitar jarl, jarls, Jarlato y skald de los textos; corregir el RESUMEN y la VALIDACION según la sección 2; la reforma da +50 % de levas navales (vigilar); el botín, las unidades y la iniciativa ya están recortados; la mecánica C4 sigue recortada (el héroe es el gobernante y no hay cautivos).
- **sorava:** enganchar `gj_sorava_pulso_anual`; enlazar el honor de `gj_pacto_balanza`; Quirasa y Qirasa se parecen demasiado; renombrar «Palabra de oro» o «Cuentas claras».
- **marea_negra:** faltan 2 avances (23); quitar las menciones a Europa y al Norte; revisar la condición del evento 22; probar el prefijo de las unidades sin n_/a_ y `current_age_or_later` en el tope; renombrar «Casa de las Cuerdas».
- **velathi:** la esperanza de vida de +150 (recomendado +40 o +60); infantería ligera con 3 × +30 % más +10 % (vigilar); edificios hasta el nivel 5; el RESUMEN cuenta 22 ficheros y hay 21; el desgaste hostil ya está recortado a 1.5.
- **luz_fundadores:** enganchar sus 3 on_actions; holy_sites con locations; probar `saints_concept` y `num_location_rank`.
- **llama_profunda:** dejar de escribir `gj_inquietud_caldera` y llamar al efecto de durnhal; Zhurgan pasa del rango del juego base en artillería (vigilar); prefijo gj_llama_ (no se renombra).
- **espiritus_lago:** asignar las escuelas a Lagunas y a Skarren; `gj_presagio_tipo` no se lee en el evento .11; Costa sin Luz ya está recortada.
- **cielo_clanes:** 22 o 25 bonificaciones frente a 15-20 (decidir si los dioses cuentan); la caballería ligera ya está recortada; enganchar el dios del reinado al Círculo de kaivan; probar `add_god` y `remove_god`.
- **escarcha_silente:** depende de `gj_noche_blanca_comienza` (hrimval); `on_max_doom_reached` sustituye al del juego base (probar); la Noche cae cada ~55 años en paz (pedían 30-40) y la Vigilia puede contenerla para siempre; un modificador sin uso; `random_owned_location` sin `limit` en el evento .4.
- **mar_dormido:** `has_rite_power` y `add_rite_power` no se han probado; la escala de 0 a 100 está supuesta; dar la escuela inicial a Marea Negra.
- **pacto_balanza:** probar los 4 on_actions con nombre repetido y las escalas de `scales_with`; renombrar «Palabra de oro».
- **sol_blanco:** el eclipse celebrado da +0.25 de legitimidad mensual durante 10 años (alto); asignar la religión a Ankarú.
- **dioses_hambrientos:** Orunmar tiene que usar los nombres gj_dioses_hambrientos_; probar `scope:loser` en `on_took_location_in_peace_treaty` y la macro con FRACCION negativa; renombrar «El gran banquete» solo si no es la misma pieza.
- **senda_verde:** la opción .11.a promete colonos y no los da; el color va en rgb y no con nombre.
- **minores_norte / minores_sur:** la vara de 60-70 no se aplica a los menores (lo decide el jugador A); los grupos culturales ya existen; enganchar el pulso anual; minores_sur lleva 3 edificios y 3 cadenas de unidades frente a 0-1 por grupo (lo decide la mesa); probar `character_modifier` con claves de país en las culturas; renombrar «Pasos cerrados», «Cazadores del dosel», «Juramento renovado» y «Ceniza fértil».
- **mundo_ruinas:** renombrar `gj_es_ruina` y `gj_es_veta`; probar `add_location_modifier` sin `years` y `add_casus_belli` con province; los lugares sagrados sobre ruinas los ponen las religiones.
- **mundo_bestias:** llamar a los 10 `lee_presagio`; el `on_game_start` es compartido con espiritus_lago; probar `kill_character` y `damage_unit_percent`; renombrar «Ceniza fértil» o «Juramento renovado».
- **mundo_contacto:** probar `REPLACE:` en diseases y situations (lo primero que hay que mirar); la investigación al ir por detrás puede llegar a +55 % (medir); usa `gj_recoge_caidos`, pero hrimval lo renombró a `gj_hrimval_recoge_caidos`: cambiar la llamada en los eventos .7 y .9.
