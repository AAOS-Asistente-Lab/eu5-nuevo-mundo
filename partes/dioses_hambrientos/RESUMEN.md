# RESUMEN: Los Dioses Hambrientos (`gj_dioses_hambrientos`)

Religión del sur (grupo `gj_fe_sur`). La siguen los Orunmari (Hegemonía Carmesí). Mecánica: **influencia religiosa** (`has_religious_influence`).

## La mecánica en una frase
La devoción (influencia religiosa) sube con los cautivos ofrecidos en la Mesa y baja con los años de paz. Los cautivos son población esclava real (`pop_type:slaves`): se crean al tomar locations en un tratado de paz y se gastan en la acción «Ofrenda de cautivos».

- **Años de paz** (`gj_dioses_hambrientos_anos_de_paz`): sube 1 cada año sin guerra y se pone a 0 con guerra, con una location tomada o con una ofrenda. A partir de 3 años, la devoción pierde 5 al año; a partir de 6, 10; con el aspecto «El Guardián de los Silos», solo 2,5.
- **Ofrenda de cautivos:** gasta el 40 % de la mayor población esclava, da +15 de devoción y pone a 0 los años de paz. Enfriamiento de 1 año.
- **El hambre del cielo** (`gj_dioses_hambrientos_lee_presagio`, que llama mundo_bestias con cada cometa o eclipse): cinco años para tomar una location en guerra. Si se cumple: +15 de devoción, prestigio y 10 años de bonificaciones. Si no: -15 de devoción, estabilidad y 5 años de «Dioses airados».
- **Límite de lo bueno:** el banquete cuesta 30 de devoción y 8 años de enfriamiento; el ayuno, estabilidad y moral.

## Cifras reales (contadas con script sobre los ficheros)
| Pieza | Cantidad |
|---|---|
| Bonificaciones de la religión (`definition_modifier` 5 + aspectos 8 + enfoques 6) | **19** |
| Bonificaciones de los 2 lugares sagrados (ubicación y país) | 9 |
| Bonificaciones de los 10 modificadores estáticos | 25 |
| **Total de líneas de modificador** | **53** |
| Aspectos elegibles (se eligen 2) | 4 |
| Enfoques religiosos | 3 |
| Tipos de lugar sagrado (sin locations) | 2 |
| Acciones religiosas | 3 |
| Modificadores estáticos (9 de país, 1 de ubicación) | 10 |
| Precios | 3 |
| Efectos programados | 5 (el de presagio, la actualización de la paz, el botín de cautivos y 2 auxiliares) |
| Enganches (`on_action`) | 3 (el pulso anual propio y los dos que cuelgan del pulso anual del juego y de la toma de locations) |
| Eventos (`gj_dioses_hambrientos.1` a `.11`) | **11** |
| Claves de localización (castellano) | 98 |
| Ficheros | 12 de juego + RESUMEN y NECESITA |

Decisiones, situaciones y dioses (`gods/`): 0. La mecánica usa acciones religiosas, no decisiones; los dioses no se usan porque la bandera es la de influencia religiosa.

## Los eventos
1. Los dioses murmuran (3 años de paz). 2. El cántaro vacío (6 años de paz). 3. Las filas de cautivos (al tomar una location). 4. El cielo tiene hambre (presagio). 5. La Cuenta se cierra (a los 5 años). 6. El pozo que habla. 7. Hijos de cautivos. 8. Los Cribadores piden la Cuenta (devoción < 10). 9. La Mesa desborda (devoción > 80 y guerra). 10. El silo de Daroh (aspecto Guardián). 11. La Gran Paz del Plato (devoción > 90 y paz).

## Panteón original
Los Siete Hambres: Orrum (la Boca Primera), Ammé (Madre de las Cribas), Vethkar (el Cobrador), Sulé (la Sed Dulce), Ishquen (el Pozo), Daroh (guardián de los silos) y Nerrimba (la Lengua de Sal). Sacerdotes: los Cribadores. Rito central: la Mesa y la Cuenta (una piedra al pozo por cada cautivo).

## Ficheros
- `in_game/common/religions/gj_dioses_hambrientos_religion.txt`
- `in_game/common/religious_aspects/gj_dioses_hambrientos_aspectos.txt`
- `in_game/common/religious_focuses/gj_dioses_hambrientos_focos.txt`
- `in_game/common/holy_site_types/gj_dioses_hambrientos_lugares.txt`
- `in_game/common/generic_actions/gj_dioses_hambrientos_acciones.txt`
- `in_game/common/prices/gj_dioses_hambrientos_precios.txt`
- `in_game/common/scripted_effects/gj_dioses_hambrientos_efectos.txt`
- `in_game/common/on_action/gj_dioses_hambrientos_on_action.txt`
- `in_game/events/gj_dioses_hambrientos_eventos.txt`
- `main_menu/common/static_modifiers/gj_dioses_hambrientos_modificadores.txt`
- `main_menu/common/named_colors/gj_dioses_hambrientos_colores.txt`
- `main_menu/localization/spanish/gj_dioses_hambrientos_l_spanish.yml`

Todos con BOM UTF-8 como los del juego base.

## Comprobación hecha
- Llaves equilibradas en los 11 ficheros.
- Todos los modificadores del motor que se usan existen en `modifier_type_definitions` del juego (comprobado por script).
- Cada clave visible tiene su texto (0 faltan).
- Sin etiquetas de país, sin ids de locations y sin rutas de disco.

## Lo que NO se ha podido probar (NOT_TESTED)
- El juego no se ha ejecutado: la sintaxis está comprobada contra ejemplos del base (`tonal.txt`, `generic_actions/mayan.txt` y `nahuatl.txt`, `events/religion/nahuatl_events.txt`, `on_action/_hardcoded.txt`), no con el motor.
- No se sabe si el motor fusiona los `on_action` repetidos (`yearly_country_pulse`, `on_took_location_in_peace_treaty`) con los del juego base. Si no, la integración copia esas dos líneas (ver NECESITA).
- La macro `gj_dioses_hambrientos_consume_cautivos = { FRACCION = -0.4 }` es la forma de los efectos con parámetros del juego, pero el signo negativo dentro de un parámetro no se ha visto en el base.
- El icono de la religión usa el `tonal_gfx` del base.


## Ronda de reparación (21-11)
Comprobador: PASA, 0 errores, salida 0. Cifras sin cambios (11 eventos, 98 claves de localización, 53 líneas de modificador). Sin nombres repetidos propios.
