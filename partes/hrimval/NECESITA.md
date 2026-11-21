# Lo que la parte «hrimval» usa sin definirlo

## Triggers que define la integración
| Nombre | Alcance | Para qué lo uso |
|---|---|---|
| `gj_es_hrimval` | país | `potential` de avances, reformas, unidades, edificios, decisiones y on_actions: verdadero solo para la Corte. |
| `gj_zona_norte` | país | Verdadero si la capital del país está en el continente del norte. Lo usan la situación (`visible`, `on_start`, `on_ended`), la Liga (`create_visible_trigger`, `can_join_trigger`) y las decisiones de los vecinos. |

## Piezas de otras partes
- `religion:gj_escarcha_silente`: la define la parte `escarcha_silente`. Se usa en `add_pop` (`gj_hrimval_recoge_caidos`, eventos 3 y 12).
- `culture:gj_insepulto` y `culture_group:gj_grupo_insepulto`: son míos.

## Lo que esta parte ofrece a las demás
- **Efecto `gj_noche_blanca_comienza = yes`:** pone el reloj de la Noche Blanca de la Corte a 100 y la situación arranca sola. Lo llama `escarcha_silente` (`gj_escarcha_silente_abre_noche`). Actúa en cualquier país; solo afecta a la Corte.
- **Efecto `gj_noche_blanca_adelanta = { VALOR = n }`:** suma `n` al reloj de la Noche Blanca. Lo llaman `escarcha_silente` (presagios) y `mundo_bestias` (eclipses y cometas). En esta parte lo llaman el evento 17 y las grandes batallas.
- **Efecto `gj_hrimval_recoge_caidos = { N = n }`:** suma `n` caídos a la Corte (actúa en cualquier país, pero solo la afecta a ella). Lo pueden llamar plagas y hambrunas de `mundo_contacto` y `mundo_bestias`.
- **Organización internacional `gj_liga_sal_llama`:** la usan `escarcha_silente` y `mundo_bestias`.
- **Situación `gj_hrimval_noche_blanca`:** la usan `escarcha_silente` y `mundo_bestias`. Es el trigger `gj_hrimval_noche_activa` (en `scripted_triggers`).
- **Variables de la Corte:** `gj_caidos` (0 a 100) y `gj_noche_reloj` (0 a 100).

## Arranque (setup) que hace la integración
1. Dar a la Corte `gj_caidos` = 10 y `gj_noche_reloj` entre 10 y 30.
2. Construir el `gj_hrimval_relicario` en su capital. Sin él, el Deshielo no se activa (el desastre exige haber visto el relicario una vez), pero el rey envejece y se pierden bonificaciones.
3. Dar la reforma `gj_hrimval_rey_bajo_el_hielo_reforma` y la religión `gj_escarcha_silente`.

## A probar en el juego (NOT_TESTED: no se ha ejecutado el juego)
- **`on_actions` que extienden las del juego base:** `yearly_country_pulse`, `on_battle_won` y `on_great_battle_won`. Si el motor no las fusiona y sobrescribe, hay que llamar a `yearly_gj_hrimval_pulse`, `gj_hrimval_batalla_ganada` y `gj_hrimval_gran_batalla` desde las originales.
- **`add_pop`** dentro de `capital ?= { ... }`: si el alcance es otro, mover el bloque a una location propia.
- **`is_immortal`** como modificador de personaje: si no basta, usar `character_life_expectancy` alto.
- **Unidades:** `food_consumption_per_strength = -0.5` (la escala exacta), `limit = 3` (un valor fijo en vez de script) y `build_time_modifier = 1.0`.
- **Edificios:** `max_levels` en bloque con `current_age_or_later`, y `climate = arctic` o `subpolar` como condición de `allow`.
- **IO:** las leyes `possible_defense_policy` vienen del juego base (la Liga defensiva); si no existe `mutual_defense_law` así, quitar el bloque `laws`.
- **Situación:** `var:gj_noche_reloj >= 100` dentro de `any_country`, y `var:gj_noche_meses` en el `outcome` (alcance de la situación).

## Pendiente (no hecho)
- **Iconos** de avances, edificios y unidades, y **bandera** (`coat_of_arms`): no se ha dibujado nada.
- **Peso de la IA** para que la Corte no se expanda: no escrito. Se propone un `ai_will_do` negativo en las decisiones de conquista fuera del hielo, y que el deshielo haga el resto.
- **Misiones propias atadas a la Corte:** no escritas (el juego base solo tiene paquetes genéricos).
