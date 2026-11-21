# NECESITA: El Mar Dormido

Lo que esta parte usa sin definirlo.

## Piezas de la integración
- **Grupo de religión `gj_fe_sur`:** la religión lo usa en `group`. Hace falta su definición en `religion_groups/` y su localización.
- **Escuela asignada al empezar:** `set_religious_school = religious_school:gj_escuela_marea_negra` para la Marea Negra (parte `marea_negra`). Thalassar sigue la religión sin escuela.
- **Lugares sagrados:** hay dos tipos (`gj_arrecife_cuna` y `gj_faro_vigilia`) y ninguna location. La integración elige dónde van en `holy_sites/`, con `religions = { gj_mar_dormido }`. Convienen un arrecife grande de Thalassar y un faro de la costa.
- **Cultura y pueblo:** `gj_talasio` y `gj_mareano` deberían seguir esta religión al empezar (`religion = gj_mar_dormido` en sus pops).
- **Icono de religión** en `gfx/interface/icons/religion/` (opcional: hay genérico).
- **Aspectos:** cada país jugable debería tener `religious_aspects = 2` activos.
- **Poder de Rito inicial:** conviene dar `add_rite_power = 40` al empezar a Thalassar y 25 a la Marea Negra (en el estado inicial del país).

## Piezas de otras partes
- **`mundo_bestias`:** llama a `gj_mar_dormido_lee_presagio = yes` desde el scope de país, sin argumentos, al caer un cometa o un eclipse. Puede usar `gj_mar_kraken_calmado_trigger` (trigger de país) para bajar la amenaza del kraken, o llamar a `gj_mar_calma_a_la_bestia = yes` para dar el rito de calma a un país.
- **`thalassar`:** puede mirar `rite_power` y `gj_mar_duerme_hondo` en su situación «Alzar la ciudad».
- **`marea_negra`:** puede usar `gj_mar_es_marea_negra` y la variable `gj_mar_agitacion` (país).

## Triggers y variables
- Triggers `gj_es_*` y `gj_zona_*`: ninguno.
- Variables propias que define esta parte: `gj_mar_ritos` y `gj_mar_marea_alta_vista` (país), `gj_mar_agitacion` (país, la sube la Marea Negra) y los enfriamientos `gj_md_nana`, `gj_md_kraken`, `gj_md_ciudad`, `gj_md_flota`, `gj_md_corriente`, `gj_md_vigilia` y `gj_md_sangre`.

## Lo que se da a otras partes
- `gj_escuela_marea_negra` (tabla 5).
- Efecto `gj_mar_dormido_lee_presagio` (tabla 5), más `gj_mar_calma_a_la_bestia` y `gj_mar_registra_rito`.
- Triggers de país: `gj_mar_es_creyente`, `gj_mar_es_marea_negra`, `gj_mar_duerme_hondo`, `gj_mar_se_agita`, `gj_mar_tiene_rito_activo` y `gj_mar_kraken_calmado_trigger`.

## Error que queda en el comprobador
- **`has_rite_power = yes`** en `religions/gj_mar_dormido_religion.txt` (línea 13): el comprobador la da por desconocida porque ninguna religión del juego base la usa. Es la mecánica que fija el contrato. Si la integración añade la clave al vocabulario del comprobador, pasa; si el motor la rechaza al cargar, hay que cambiar la mecánica.
