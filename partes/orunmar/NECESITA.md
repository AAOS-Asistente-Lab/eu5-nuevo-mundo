# Lo que usa Orunmar sin definirlo aquí

## Triggers y claves de la integración
- `gj_es_orunmar = yes`: trigger de país; lo define la integración (el país que es la Hegemonía). Se usa en todos los `potential`, `trigger`, `country_potential` y `can_start`.
- `religion:gj_dioses_hambrientos`: la religión de esta facción (otra parte). Orunmar no la nombra en el código, pero **depende** de que tenga `has_religious_influence`: `add_religious_influence` y `monthly_religious_influence` solo funcionan con una religión que tenga esa bandera.
- `religion:gj_sol_blanco`: la religión de Ankarú (otra parte), usada en el evento `gj_orunmar.11`.
- Ningún `gj_zona_*`: la parte no usa geografía propia. Los edificios usan `topography` del motor.

## A cablear en la integración
- **Etiqueta de país, bandera, escudo y retratos:** no hay. Se usan las etiquetas gráficas del base en la cultura (`aztec_gfx`, `native_american_tag`, `south_american_gfx`, `american_gfx`, `aztec_coa_gfx`); la integración puede cambiarlas por las propias.
- **Estado inicial:** cultura, religión y reforma `gj_orunmar_mesa_roja` en el arranque; la integración decide si la reforma se pone al empezar o se deja elegir.
- **Acciones del motor ampliadas por esta parte:** `yearly_country_pulse`, `on_war_declared`, `on_winning_war` y `on_new_age`. Se han escrito como **añadidos** (`on_actions = { ... }`), como hace el propio juego base en `religious_order_conquest.txt` con `on_winning_war`. Si el motor no las funde con las del base, hay que mover las líneas a esos ficheros.
- **Iconos:** los avances, edificios y unidades no tienen icono propio; los edificios reutilizan los de `calmecac`, `tambo`, `terraces`, `pounamou_carver` y `telpochcalli`.
- **Imagen del desastre:** reutiliza la ilustración de `decline_of_mali`; puede cambiarse por una propia.

## No probado en el juego
Todo el contenido está escrito contra los ficheros del juego base, pero no se ha ejecutado el juego. Lo que más conviene vigilar en la primera carga: `var:gj_orunmar_cautivos >= n` y `gj_orunmar_anios_de_paz >= n` como comparaciones, el campo `antagonism` del objetivo de guerra y el `limit` de las unidades.
