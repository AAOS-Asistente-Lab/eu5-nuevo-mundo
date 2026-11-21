# senda_verde: lo que se usa sin definirlo aqui

- **Grupo de religion `gj_fe_sur`**: la religion lo usa en `group`. Lo define la integracion.
- **Gancho del pulso de eventos**: la on_action `gj_senda_verde_pulse` esta definida, pero nada la llama. La integracion tiene que anadirla a un pulso anual de pais, con `on_actions = { gj_senda_verde_pulse }` en `yearly_country_pulse` (o en `religion_flavor_pulse`). No se ha redefinido el pulso del juego base aqui para no pisarlo.
- **Presagios (mundo_bestias)**: para que la religion lea un cometa o un eclipse, en cada pais que siga la Senda: `set_variable = { name = gj_presagio_tipo value = 1 }` (cometa) o `value = 2` (eclipse), y despues `gj_senda_verde_lee_presagio = yes`.
- **Lugares sagrados**: los tipos `gj_senda_verde_claro_sagrado` y `gj_senda_verde_arbol_anillo` existen, pero hace falta crear en `holy_sites/` las entradas con location, con `religions = { gj_senda_verde }`. Lo hace la integracion con el mapa.
- **Cultura velathi** (`gj_velathi`) y el trigger `gj_es_velathi`: no se usan aqui; la religion solo mira `religion:gj_senda_verde`.
- **Icono** de la religion en `gfx/interface/icons/religion/` (arte, sin hacer).
