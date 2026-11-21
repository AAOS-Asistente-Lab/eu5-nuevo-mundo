# NECESITA: lo que Marea Negra usa sin definirlo

## Triggers y piezas que define la integración
- **`gj_es_marea_negra = yes`** (scripted trigger de país). Se usa en todas las partes: `potential` de avances y reformas, `country_potential` de edificios y unidades, `trigger` de eventos y decisiones y `trigger` del on_action. Es verdadero solo para el país que la integración reparta como la Hermandad.
- **Ninguno `gj_zona_*`.** Esta parte no usa geografía propia; los edificios piden `is_coastal` y las decisiones, `is_port`.

## Piezas de otras partes
- **Cultura y grupo:** la cultura `gj_mareano` (la define esta parte) se agrupa en `gj_grupo_sorava`. **El grupo lo define la parte de Sorava**, que lo comparte con nosotros: aquí no se escribe el bloque del grupo, para no duplicar claves. Si Sorava no lo define, la integración tiene que crearlo.
- **Religión:** `gj_mar_dormido` (la parte `mar_dormido`). Esta parte no escribe nada de ella.
- **Escuela:** `gj_escuela_marea_negra` (la define `mar_dormido`). No la usamos desde aquí.
- **Cometas y eclipses:** no llamamos a `gj_mar_dormido_lee_presagio`. El evento 9 («El eco del Mar Dormido») es nuestro y no depende de él.

## Del juego base (para comprobar al integrar, ya que no hemos podido ejecutar el juego)
- `heir_selection:gj_marea_negra_almirante` sustituye en la práctica a `pirate_elective`. La reforma `gj_marea_negra_codigo_reform` lo activa en `on_activate` con `change_heir_selection`.
- `government_reform:pirate_brethren_reform` es opcional: la plantilla de gobierno puede sumarla (está bloqueada en el base: `locked = { always = yes }`).
- Las claves de unidad llevan el prefijo del contrato (`gj_marea_negra_…`), no `n_`/`a_`. Si el motor exigiera esos prefijos, renombrar las 18 unidades y las 18 líneas `unlock_unit` de los avances.

## Cosas del motor que habría que verificar
1. **`yearly_country_pulse` en un fichero de mod.** `common/on_action/gj_marea_negra_on_actions.txt` repite el nombre y añade nuestro sub-on-action. Si el motor no fusiona on_actions repetidos y los pisa, mover la línea al propio fichero del juego base o llamar a `gj_marea_negra_pulso_anual` desde otro hook.
2. **`owner ?= { current_age_or_later = { age = … } }` dentro de un script value de edificio** (`main_menu/common/script_values/gj_marea_negra_niveles.txt`). Define el tope de niveles por era.
3. **`num_of_ports <= 2`** como trigger de comparación (usado como multiplicador en el base; no lo hemos visto como comparación).
4. **`has_building = building_type:…`** en una location (decisión «Fundar un Puerto Libre»).
5. **Patentes de corso**: las decisiones usan `is_rival_of = root` dentro de `any_known_country`, `random_known_country` y `every_known_country`. Si el rival no basta (hay que ser rival y estar en contacto), ajustar el `limit`.
6. **El grupo de unidades `gj_marea_negra_abordadores`** lleva su `limit` (script value en `main_menu/common/script_values/`). Las tres cadenas de unidad llevan `is_special = yes` y `country_potential = { gj_es_marea_negra = yes }`.
7. **Categorías de ley** (`socioeconomic`, `military`, `leadership`): las del base, pero las tres leyes de la Hermandad son `unique = yes` y solo se ven con la reforma del Código.
8. **Localización de las claves de variable** (`gj_marea_negra_patente_pagada`, `…_victima`, etc.): son variables internas y no llevan texto.
