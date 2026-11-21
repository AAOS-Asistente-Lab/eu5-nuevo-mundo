# Lo que la parte «lagunas» usa sin definirlo

## Triggers
- `gj_es_lagunas = yes` (scope país): lo define la integracion. Se usa en `potential`, `country_potential` y en los eventos y decisiones. Debe ser cierto solo para el país de la Liga.

## Piezas de otras partes
- Culturas citadas en las `opinions` de `gj_lagunero`: `gj_skarren` (parte skarren), `gj_soravi` (parte sorava), `gj_ostrevari` (parte ostrevar). Si alguna no existe al integrar, se quita su linea.
- Religion `gj_espiritus_lago` con la escuela barqueros (la parte espiritus_lago). Esta parte no la nombra en ningun fichero, pero el pais la usa.
- Escuela `gj_escuela_barqueros`: la define espiritus_lago.

## Enganches que hace la integracion
- Anadir `gj_lagunas_pulso_anual` a las `on_actions` de `yearly_country_pulse` (fichero `in_game/common/on_action/gj_lagunas_on_action.txt`). No se redefine `yearly_country_pulse` aqui para no pisar el del juego base. Sin este enganche, los eventos `gj_lagunas.2` y del `.4` al `.21` no saltan solos (el `.1` y el `.3` si, por las decisiones).
- Asignar el pais, su cultura primaria `gj_lagunero` y su gobierno (republica con `gj_lag_barquero_mayor`) en la plantilla del pais.
- Crear los topónimos de `IDENTIDAD.md` en la plantilla de nombres de RNW, si se desea.

## Geografia
- Ningún trigger `gj_zona_*`: los lagos se detectan con `is_adjacent_to_lake` y el puerto con `is_port` del propio juego.

## Cosas a comprobar en el juego (NOT_TESTED, no se ha ejecutado nada)
- `add_country_modifier = { ... months = 5 }`: el base usa `years`; `months` se asume valido por analogia con `set_variable` y los eventos diferidos.
- `limit = gj_lag_patrulleros_limit` en unidades navales (el base usa `limit = wagenburg_unit_limit` en una de tierra).
- `upgrades_to_only` en la cadena naval (el base solo lo usa en la de tierra de los jenizaros).
- Los deltas de las unidades (`movement_speed = 2`, `cannons = -2`, etc.) se suman a la plantilla de la era, segun se ve en `n_long_fada`. Si el motor los toma como valores absolutos, hay que reajustarlos.
- Las capacidades de los edificios son valores por nivel; la prueba de equilibrio (IA sola, 100 años) esta pendiente.
- Los iconos de avances, edificios y unidades reutilizan los del juego base (hol_sailors, commerce_center, etc.): no hay iconos propios.
