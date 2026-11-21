# NECESITA: lo que usa La Llama Profunda y define otro

## Piezas compartidas de otras partes
- `gj_durnhal_sube_inquietud` (efecto de ámbito país con parámetro `PUNTOS`, lo define durnhal; todavía no existe en su parte a fecha de esta ronda). Esta parte ya no escribe `gj_inquietud_caldera` (su dueño es durnhal): `gj_llama_profunda_sube_inquietud` lo llama con `PUNTOS = n` y `_baja_inquietud` con `PUNTOS = -n`. Hace falta que durnhal lo defina, admita negativos y mantenga el suelo en 0. El evento .5 solo lee la variable (`has_global_variable`).
- `gj_dragon_estado` (variable global, 0 dormido, 1 inquieto, 2 despierto; la define mundo_bestias). La decisión del pacto exige ≥ 1 (y que exista). Romper el pacto la sube un punto, sin pasar de 2.
- `gj_fe_norte`: grupo de religión al que pertenece la fe (la integración). Para que el motor reparta el panteón de partida solo, el grupo debería contar como pagano; si no, lo hace el evento oculto .20.

## Lo que esta parte ofrece a otras
- `gj_llama_profunda_lee_presagio` (efecto de ámbito país, sin parámetros): lo llama mundo_bestias para cometas y eclipses.
- Variable de país `gj_llama_pacto_dragon`: existe mientras el país tiene el pacto. mundo_bestias puede usarla para librar de la ira del dragón a quien lo tenga.

## De la integración
- El grupo de religión `gj_fe_norte` (definición en `religion_groups`) y su entrada en la lista de religiones paganas.
- El icono de la religión y los iconos de los dioses y aspectos si se quieren propios (se usan los genéricos de dioses y aspectos populares del juego base).
- Los lugares sagrados: asignar a locations los tipos `gj_llama_pozo_de_la_llama` y `gj_llama_forja_eterna` en `holy_sites/`. Esta parte no escribe locations.
- Relaciones iniciales entre religiones (`religion_manager`) si se quiere.
- Ninguna etiqueta de país, `gj_es_*` ni `gj_zona_*`: esta parte no los usa.

## Riesgo a vigilar en la integración
El fichero de on_action redefine `yearly_country_pulse` solo con la línea `on_actions = { gj_llama_profunda_pulso_anual }`. Si el motor sustituye en vez de sumar, hay que copiar esa línea dentro del bloque original del juego base y quitar la redefinición.
