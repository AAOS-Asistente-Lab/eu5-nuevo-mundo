# NECESITA: Espíritus del Lago

Lo que esta parte usa sin definirlo.

## Piezas de la integración
- **Grupo de religión `gj_fe_norte`:** la religión lo usa en `group`. Hace falta su definición en `religion_groups/` y su localización.
- **Escuelas asignadas al empezar:** `set_religious_school = religious_school:gj_escuela_barqueros` para la Liga de las Mil Lagunas (parte `lagunas`) y `religious_school:gj_escuela_sagas` para los Skarren (parte `skarren`). Las dos escuelas están definidas aquí (contrato, tabla 5).
- **Lugares sagrados:** hay dos tipos (`gj_espiritus_lago_sagrado` y `gj_espiritus_lago_isla_del_augurio`) y ninguna location. La integración elige dónde van, en `holy_sites/`, con `religions = { gj_espiritus_lago }`, `type` y `importance`. Convienen lagos grandes de la Liga y alguna isla.
- **Cultura y pueblo:** `gj_lagunero` y `gj_skarren` deberían seguir esta religión al empezar (`religion = gj_espiritus_lago` en sus pops).
- **Icono de religión** en `gfx/interface/icons/religion/` y los iconos de los cuatro espíritus (opcionales: hay genérico).
- **Aspecto de ejemplo para el reparto:** al elegir, cada pais jugable debería tener `religious_aspects = 2` activos.

## Piezas de otras partes
- **`mundo_bestias`:** llama a `gj_espiritus_lago_lee_presagio = yes` desde el scope de pais, sin argumentos, al caer un cometa o un eclipse. Si quiere distinguirlos, puede dejar una variable global `gj_presagio_tipo` (1 cometa, 2 eclipse); este evento hoy no la lee, pero queda el sitio.
- **`escarcha_silente`, `durnhal`, `llama_profunda` y las demás:** no se usan aquí.

## Triggers y variables
- Triggers `gj_es_*` y `gj_zona_*`: ninguno.
- Variables propias que define esta parte: `gj_espiritus_lago_has_omens` (en la religión), `gj_espiritus_lago_lecturas` y `gj_espiritus_lago_gran_presagio` (en el pais).

## Lo que se da a otras partes
- `gj_escuela_barqueros` y `gj_escuela_sagas` (tabla 5).
- Efecto `gj_espiritus_lago_lee_presagio` (tabla 5).
- Triggers de pais `gj_espiritus_lago_es_creyente`, `gj_espiritus_lago_es_barquero` y `gj_espiritus_lago_es_saga`: pueden usarlos `lagunas` y `skarren` en sus eventos.
