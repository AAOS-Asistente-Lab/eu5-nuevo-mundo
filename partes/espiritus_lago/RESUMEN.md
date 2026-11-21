# RESUMEN: Espíritus del Lago (`gj_espiritus_lago`)

Religión de los presagios del hielo y del agua. Mecánica del motor: `has_omens`. Dos escuelas: barqueros (Liga de las Mil Lagunas, comercio) y sagas (Skarren, incursión). Cifras contadas sobre los ficheros.

## Cifras
| Pieza | Cantidad |
|---|---|
| Bonificaciones de la vara del contrato (definición + aspectos) | **18** (6 de definición + 4 aspectos × 3) |
| Aspectos elegibles (`religious_aspects = 2` de 4; Remo y Red y La Ola Larga se excluyen) | 4 |
| Espíritus (`gods/`) | 4 |
| Presagios (omens) con su modificador | 12 (21 líneas de modificador) |
| Escuelas | 2 (4 líneas de modificador) |
| Tipos de lugar sagrado (sin locations) | 2 (8 líneas de modificador) |
| Modificadores estáticos de los eventos | 15 (29 líneas) |
| Acciones genéricas (invocar presagio) | 2 |
| Eventos | **11** (`gj_espiritus_lago.1` a `.11`), 29 opciones |
| Efectos propios | `gj_espiritus_lago_registra_lectura` y `gj_espiritus_lago_lee_presagio` |
| Triggers propios | 4 (`gj_espiritus_lago_es_creyente`, `_es_barquero`, `_es_saga`, `_tiene_lectura_activa`) |
| Ganchos (on_action) | 3 (`on_game_start`, `yearly_country_pulse`, `gj_espiritus_lago_pulso_anual`) |
| Líneas de modificador en total (todo lo anterior) | 80 |
| Claves de localización | 127 (todas con texto; sin duplicadas) |
| Ficheros | 16 (13 de juego, 1 de localización, más este resumen y NECESITA) |

Decisiones: 0. Situaciones: 0. Focos religiosos: 0 (la mecánica usa espíritus, no focos).

## Qué se nota al jugar
- **La lectura del hielo (cada año, evento .1):** el gobernante elige cómo leer el presagio del año: mercaderes, incursión o prudencia. Cada lectura da un modificador de pais; el de **la escuela propia dura el doble** (8 años frente a 4). Mientras haya una lectura en vigor no se pide otra.
- **Invocar presagios:** cuatro espíritus (Madre Ahogada, Anciano del Hielo, Viento de la Orilla, Señora de la Niebla) con tres presagios cada uno. Se pagan en oro, no en influencia religiosa, porque la religión no usa esa moneda.
- **Sucesos del lago (eventos .2 a .9):** con un 30 % anual, uno al azar. Varias opciones solo las ven los barqueros o las sagas, así que no se juega igual con la Liga que con los Skarren.
- **El contador de lecturas:** cada lectura suma una. A la quinta llega el **Gran Presagio** (evento .10, una sola vez): modificador de 50 años y más presagios ofrecidos.
- **La disputa de los lectores (.9):** se puede cambiar de escuela (`set_religious_school`) y pagarlo con la nobleza o los burgueses.
- **Cometas y eclipses (.11):** lo dispara `gj_espiritus_lago_lee_presagio`. Tres lecturas: propicia, funesta o la que dicte la escuela.

## Equilibrio
- Los modificadores de evento son de 5 a 10 años y entre +5 % y +20 %. Los mayores (botín +20 %, Costa sin Luz, botín +15 % tras el recorte del revisor) vienen con coste: Ola Larga resta reputación diplomática; incursión y mercaderes se excluyen entre sí en el mismo año.
- Los presagios cuestan 40 de oro y no se acumulan por espíritu (el mismo espíritu no se invoca dos veces a la vez).
- Los eventos con riesgo real: .6 (naufragio, 40 %), .2 (aguas sin hielo, pierde pesca y legitimidad).

## Pendiente de comprobar en el juego (NOT_TESTED)
1. **Fusión de ganchos:** que el motor una `on_game_start` y `yearly_country_pulse` de este mod con las del base. El base ya reparte `on_game_start` en dos ficheros. Si no los une, copiar las entradas a un mod de ganchos propio.
2. **Acciones de presagio:** `show_in_gui_list = yes` en las dos acciones copiadas del base. Si la pantalla de presagios solo llama a `select_omen` por su nombre, hará falta que la integración las enlace.
3. **Iconos de los espíritus** (`icon`): no se han definido (no hay gráficos). El motor usará el genérico.
4. **Tags gráficos** `folk_european_gfx pagan_gfx` de la religión: son los del base; el icono propio de religión queda para la integración.
5. **Modificadores de categoría «unit»** (`amount_looted_modifier`, `naval_damage_done`, `land_unit_attrition`, `naval_morale_modifier`…) usados como modificadores de pais: el base ya usa `naval_damage_done` en avances de pais, el resto se asume igual.
6. **Color** de la religión: `gj_espiritus_lago_color` en `named_colors/`, formato copiado del base.
7. **Escuela de cada pais:** nadie la asigna al empezar. La integración debe ponerla (`set_religious_school`) a la Liga (barqueros) y a los Skarren (sagas).

## Comprobaciones hechas
- Llaves `{` y `}` equilibradas en los 13 ficheros de juego.
- Los 6 ficheros con modificadores usan solo nombres que existen en `modifier_type_definitions` del juego base (comprobado contra los 2.658 nombres).
- Todas las claves visibles tienen su texto (127 de 127), y la localización va en UTF-8 con BOM y empieza por `l_spanish:`.
- Sin etiquetas de país, sin ids de location, sin rutas ni nombres propios de personas. Los ficheros de juego son ASCII puro.
- Los valores de guion (`..._mild_bonus` y similares) existen todos en `default_values.txt`.
