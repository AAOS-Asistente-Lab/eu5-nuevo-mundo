# NECESITA: lo que la parte skarren usa sin definirlo

## Triggers de identidad (los define la integración)
- `gj_es_skarren = yes`: es el país de esta facción. Se usa en `potential`, `country_potential`, decisiones, eventos, avances, reformas y en los enganches de `on_action`.
- `gj_es_lagunas = yes`: lo usa el evento `gj_skarren.7` (tributo de las Mil Lagunas) y su opción de saqueo. Lo define la parte `lagunas` o la integración.

## Claves de otras partes
- `culture:gj_lagunero` y `culture:gj_ostrevari`: aparecen en `opinions` de la cultura `gj_skarren` (`cultures/gj_skarren_cultura.txt`) como `enemy` y `negative`. Si alguna de esas culturas no existe, hay que quitar la línea.
- `gj_espiritus_lago` y su escuela `gj_escuela_sagas` (de la parte espiritus_lago): no se nombran en ningún fichero de esta parte. La integración tiene que poner a la cultura `gj_skarren` esa religión como religión de partida.
- Grupo cultural `gj_grupo_fiordo`: lo define esta parte (`culture_groups/gj_skarren_grupo.txt`). Lo usarán las ruinas y las vetas de mundo_ruinas por afinidad de grupo.

## Geografía
- Ningún trigger `gj_zona_*`: esta parte no los necesita. Para la incursión usa `any_neighbor_country` y `random_neighbor_country` (vecinos del motor, que incluyen los marítimos si el motor los cuenta como vecinos).

## Enganches a las acciones del juego base (a revisar por la integración)
`on_action/gj_skarren_acciones.txt` usa `INJECT:` (la forma que usa el propio juego base en sus DLC) sobre cuatro acciones:
- `yearly_country_pulse` (engancha `gj_skarren_pulso_anual`, que lanza los eventos temáticos y las comprobaciones del precio);
- `on_battle_won` (suma 1 de gloria al país que gana);
- `on_location_occupied` (suma 2 de gloria, 1 de oro y marca «botín reciente»);
- `on_new_ruler` (lanza `gj_skarren.12`, la elección en la Piedra).

Si el cargador no admite `INJECT:` sobre esas claves, hay que pasar esas líneas a un fichero único de enganches de la integración. No hay que cambiar nada más.

## Piezas que crea esta parte y que otras pueden leer
- Variable de país `gj_skarren_gloria` y contador `gj_skarren_sagas`.
- Efecto `gj_skarren_suma_gloria = { N = <entero> }`.
- Escuela `gj_escuela_sagas`: NO la crea esta parte (es de espiritus_lago).

## No comprobado en el motor
Todo lo de esta parte se ha comprobado solo contra los ficheros del juego base (que las claves y la sintaxis existen), sin cargarlo. Los puntos más dudosos:
1. `unique_production_methods` de los 5 edificios, con bienes reales como mantenimiento.
2. `max_levels` por era con `current_age_or_later` (copiado de `janissary_barracks_size`).
3. `upgrades_to_only` en la cadena naval (el base lo usa en tierra).
4. `character_modifier` de la cultura (`mil`, `character_life_expectancy`).
5. Los enganches `INJECT:` descritos arriba.
