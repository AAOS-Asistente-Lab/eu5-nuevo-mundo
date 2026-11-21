# NECESITA: Los Dioses Hambrientos

Lo que se usa sin definirlo aquí.

## De la integración
- **Grupo de religión `gj_fe_sur`** (en `religions/`: `group = gj_fe_sur`), con su localización y su entrada en `religion_groups`.
- **Gráfico del icono:** la religión usa `tags = { tonal_gfx }` (del juego base). Si hay icono propio, cambiar la etiqueta y poner el icono en `gfx/interface/icons/religion/`.
- **Que la religión esté activa al empezar** y asignada a la cultura `gj_orunmari` (y a la gente de Orunmar). No lleva `enable =`.
- **Enganches de `on_action`** que hay que comprobar en el motor y, si no se fusionan con los del base, copiar:
  - (A) en `yearly_country_pulse = { on_actions = { ... } }`: la línea `gj_dioses_hambrientos_pulso_anual`;
  - (B) en `on_took_location_in_peace_treaty = { effect = { ... } }`: el bloque `if` que llama a `gj_dioses_hambrientos_botin_de_cautivos`.

## De otras partes
- **mundo_bestias** debe llamar, con cada cometa o eclipse y por cada país que siga esta religión, a `gj_dioses_hambrientos_lee_presagio = yes` (con el país como root). Ya comprueba la religión por dentro.
- **orunmar (D5):** puede pedir `has_completed_religious_focus = gj_dioses_hambrientos_foco_hierro_del_alba` para abrir su casus belli de guerra ritual. Si el casus belli es de Orunmar, la condición va en su fichero.
- **orunmar (D5):** su desastre «El Gran Ayuno de los Dioses» puede leer la variable de país `gj_dioses_hambrientos_anos_de_paz` (la lleva esta religión; `has_variable` antes de leerla).
- **mundo_ruinas:** si las ruinas dan «vetas de poder», las locations con lugar sagrado de esta religión usan los tipos `gj_dioses_hambrientos_mesa_de_piedra` y `gj_dioses_hambrientos_pozo_de_la_cuenta`. Los lugares (`holy_sites/`) los asigna la integración a locations concretas.

## Del juego base (usado, no definido)
Valores y elementos que ya existen y que esta parte usa: `religious_influence_*_bonus` y `_penalty`, `stability_*`, `prestige_*`, `legitimacy_*`, `estate_satisfaction_*`, `monthly_food_productivity_*_bonus`, `add_religious_influence`, `pop_type:slaves`, `estate_type:clergy_estate`, `UI_action_religion_generic` y las etiquetas de ilustración `regular`, `happy`, `angry`, `armed`, `interior`, `exterior`.
