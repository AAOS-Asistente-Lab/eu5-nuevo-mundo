# NECESITA: sol_blanco

Lo que se usa sin definirlo aquí.

## De la integración
- **`gj_fe_sur`**: grupo de religión (`religions/gj_sol_blanco_religion.txt`, campo `group`). Hay que definirlo en `religion_groups/`.
- **Icono y etiquetas gráficas** de la religión: `gfx/interface/icons/religion/gj_sol_blanco.dds`. No se añadió `tags = { ... }` porque no existe un conjunto gráfico propio.
- **Lugares sagrados con locations**: los tipos `gj_sol_blanco_cumbre_sagrada` y `gj_sol_blanco_terraza_sagrada` están definidos (`holy_site_types/`). Falta el fichero de `holy_sites/` que les ponga location (`type =`, `importance`, `religions = { gj_sol_blanco }`, y `god =` con uno de los 4 dioses propios).
- **Que Ankarú siga la religión**: la asignación de religión al país es de la integración.
- **Gancho de la on_action**: `common/on_action/gj_sol_blanco_on_actions.txt` añade `gj_sol_blanco_pulse` a `yearly_country_pulse`. Si al probar el juego la on_action del mismo nombre reemplaza en vez de sumar, mover la línea `on_actions = { gj_sol_blanco_pulse }` al `yearly_country_pulse` de la versión que se integre.
- **Aspectos** `worship_gj_sol_blanco_<dios>`: siguen la convención del juego base `worship_<clave del dios>`, así que su clave empieza por `worship_` y no por `gj_`. Es la única excepción al prefijo.

## De otras partes
- **mundo_bestias** (cometas y eclipses): llamar con root = país, `gj_sol_blanco_lee_presagio = { TIPO = eclipse }` o `{ TIPO = cometa }`. Solo actúa si el país sigue el Sol Blanco.
- Ninguna variable de durnhal ni de hrimval. Sin triggers `gj_zona_*` ni `gj_es_*`. Sin etiquetas de país ni ids de locations.

## Del juego base (existen; solo se citan)
- Precios `price:cleansing_ritual_yanantin` y `price:inti_ceremonial_festivals`.
- Auto-modificadores `positive_yanantin`, `balanced_yanantin`, `negative_yanantin`.
- Las claves de modificador, de valores (`prestige_weak_bonus`, `legitimacy_*`, `stability_*`, `estate_satisfaction_*`, `army_tradition_weak_bonus`) y de localización de acciones (`choose_religion`, `favor_god_choose_god`, `favor_god_no_gods`).
