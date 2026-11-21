# NECESITA: lo que la parte «ostrevar» usa sin definirlo

## Triggers que define la integración
- `gj_es_ostrevar = yes`: es el país facción Ostrevar. Se usa en todos los `potential`, `trigger` y `country_potential` de la parte.
- `gj_zona_estepa = yes`: el país tiene frontera con la estepa de Kaïvan. Solo en el evento `gj_ostrevar.12`. Si no se define, hay que quitar ese evento (única dependencia geográfica).

## Piezas de otras partes
- `religion:gj_luz_fundadores` (la define la parte de la religión): lo usan los eventos `.3`, `.9` y `.16`. Los eventos esperan una religión con santos (`has_canonization`) pero no llaman a ningún efecto suyo.
- `culture:gj_ostrevari` (la define esta misma parte, en `cultures/`).
- Nada de `gj_inquietud_caldera`, `gj_dragon_estado` ni los `gj_<religion>_lee_presagio`: Ostrevar no los usa.

## Del juego base (existen en G, para quien integre)
- Avances de los que cuelgan los nuestros: `city_building_advance`, `guilds`, `agriculture_advance`, `feudalism_advance`, `iron_working`, `aqueduct_system`, `renaissance_city_rights`, `construction_speed_renaissance`, `banking_advance`, `chancery_records`, `renaissance_urbanisation`, `construction_speed_discovery`, `town_rights_aod_advance`, `printing_press_advance`, `trade_through_owned_disc_advance`, `town_rights_ref_advance`, `confessionalism_advance`, `scientific_experimentation`, `pharmacology_advance`, `manufactories_advance`, `sanitation_advance`, `absolutist_court`, `urbanization`, `industrialization_advance`, `modern_bureaucracy`.
- Plantillas de unidad por era (`a_age_N_heavy_infantry`, `..._light_infantry`, `..._artillery`).
- Las `INJECT:` de `on_action` (`yearly_country_pulse`, `on_new_age`) dependen de que el motor acepte `INJECT` en `on_action` (FORMATO §3).

## Datos de partida (para el setup que escriba la integración)
- Variables que arranca la parte sola, sin setup: `gj_ostrevar_paz`, `gj_ostrevar_pop_prev` (las crea el pulso anual la primera vez).

