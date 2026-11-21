# NECESITA: lo que la parte velathi usa sin definir

## Triggers y efectos de la integración
- `gj_es_velathi = yes`: scripted trigger de país. Es verdadero solo para el país que la integración marca como la facción velathi. Lo usan avances, reformas, edificios, unidades, decisiones, on_actions y eventos.
- Ninguna `gj_zona_*`: la parte no depende de geografía propia. Solo pide una capital en bosque o selva.

## Ganchos a on_actions del juego
Enlazar estas on_actions propias (en `in_game/common/on_action/gj_velathi_on_actions.txt`) dentro de las del juego base:
- `on_new_ruler` debe llamar a `gj_velathi_nuevo_rey`. Reinicia los años de reinado y el cansancio, y lanza el evento `gj_velathi.1`.
- `yearly_country_pulse` debe llamar a `gj_velathi_yearly_pulse`. Suma un año de reinado, comprueba los hitos de 25 años y reparte los eventos de sabor.
- `on_took_location_in_peace_treaty` debe llamar a `gj_velathi_conquista`. Cuenta conquistas y baja el karma.

No se redefinen en esta parte porque una on_action con el mismo nombre podría reemplazar la del juego.

## Piezas de otras partes
- Religión `gj_senda_verde`, con la bandera `has_karma`. La parte velathi solo llama a `add_karma` si el país la sigue (`religion = religion:gj_senda_verde`). Sin ella, esos efectos no hacen nada.
- Cultura y grupo cultural: están definidos en esta parte (`gj_velathi`, `gj_grupo_velathi`). El país debe empezar con `culture:gj_velathi` y la religión de arriba.

## Gráficos (sin ellos el juego usa el icono por defecto)
- Iconos de los 25 avances (`icon = gj_velathi_*`), de las 3 reformas y de los 5 edificios.
- Iconos de las unidades y de las dos familias.
- Si la integración tiene arte, `gfx_tags` de los velathi: ahora usa los del juego base (`longbow_tag`, `archer_tag`, `light_tag`, `musket_tag`, `heavy_tag`, `medium_tag`).

## A comprobar al integrar (no probado en el juego)
- `add_location_modifier = { ... years = -1 mode = add }` en la decisión de plantar el Bosque Antiguo. Si el motor no admite `-1` en locations, poner `years = 300`.
- El valor `character_life_expectancy = 150` de la cultura: comprobar que suma años de vida y no una fracción. Meta: reyes de 150 a 300 años.
- La localización de `gj_velathi_umbral` y `gj_velathi_raiz` como nombres de familia de unidad.
- Que `total_effective_building_levels:<edificio>` acepte los edificios propios dentro del cupo de las unidades.

## Ronda de reparación: lo que queda en el comprobador
- gj_velathi_nuevo_rey y gj_velathi_conquista salen como «no lo llama nadie». Es el formato de ganchos (on_actions), que la integración reescribe y que esta ronda no toca. Hay que enlazarlos a on_new_ruler y a on_took_location_in_peace_treaty; gj_velathi_yearly_pulse ya se detecta.
