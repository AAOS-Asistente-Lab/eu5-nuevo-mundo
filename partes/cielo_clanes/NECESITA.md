# NECESITA: lo que esta parte usa sin definir

## Banderas e identidad
- Grupo de religión `gj_fe_norte` (lo define la integración). La religión lo usa en `group`.

## Piezas de otras partes
- Quien llame a `gj_cielo_clanes_lee_presagio = { tipo = cometa }` o `{ tipo = eclipse }` es `mundo_bestias`. El efecto ya existe aquí y solo actúa si el país sigue la religión.
- Variable `gj_dragon_estado`: no se usa en esta parte.

## Geografía
- Ninguna. Los Mástiles y los Cairns van como tipos de lugar sagrado y la integración los pone en locations (`holy_sites/`) cuando exista el mapa.

## Enganches con el juego base (a revisar por la integración)
- `in_game/common/on_action/gj_cielo_clanes_enganches.txt` cuelga `gj_cielo_clanes_anual` de `yearly_country_pulse` y `gj_cielo_clanes_nuevo_kan` de `on_new_ruler`. Si el motor no fusiona on_actions del mismo nombre, copiar esas dos líneas a mano en las on_actions del base y borrar el fichero.

## Cosas del juego que se usan
- Constantes del base: `prestige_weak_bonus`, `prestige_mild_bonus`, `prestige_weak_penalty`, `legitimacy_mild_bonus`, `legitimacy_weak_penalty`, `stability_weak_bonus`, `estate_satisfaction_mild_bonus`, `estate_satisfaction_mild_penalty`, `war_exhaustion_weak_bonus`, `modifier_duration_years_short`, `modifier_duration_years_normal`, `modifier_duration_years_long` y `monthly_food_productivity_weak_bonus`.
- Categoría de decisiones `country_specific_decisions`.
- Etiqueta gráfica `pagan_gfx`.
- Icono de religión en `gfx/interface/icons/religion/` para `gj_cielo_clanes` (no se ha creado ningún gráfico).
## Ronda de reparación
- Enganchar el dios del reinado al Círculo de kaivan y reescribir los ganchos (on_actions, INJECT, pulso anual): integración.
- Decidir si los dioses cuentan para la vara de 15-20 bonificaciones de religión (22 ahora): mesa/integración.
