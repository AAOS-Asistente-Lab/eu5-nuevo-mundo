# NECESITA: pacto_balanza

Lo que se usa sin definirlo aquí.

- **Grupo de religión `gj_fe_sur`**: lo define la integración (la religión lo usa en `group`).
- **Icono de la religión** en `gfx/interface/icons/religion/` y su etiqueta gráfica propia: ahora lleva `folk_african_gfx pagan_gfx`, que son provisionales.
- **Lugares sagrados con location**: los dos tipos (`gj_pacto_balanza_lonja_sagrada`, `gj_pacto_balanza_casa_del_peso`) existen, pero no hay entradas en `holy_sites/`. La integración puede colocarlos en la capital de Sorava y en un puerto principal (con `religions = { gj_pacto_balanza }`).
- **Quién llama a `gj_pacto_balanza_lee_presagio`**: `mundo_bestias` (A4: cometas y eclipses). Se llama con el país como ámbito, sin parámetros.
- **Escuela, cultura y país**: los países de la fe (Sorava y los que la adopten) los pone la integración (`religion:gj_pacto_balanza` en el arranque).
- **Mecanismo de los `on_action`**: se asume que un `on_action` con el mismo nombre que uno del juego (`yearly_country_pulse`, `on_loan_repaid`, `on_truce_broken`, `on_royal_marriage`) suma sus entradas a las de la base. Es lo que ya hace `religious_order_conquest.txt` del juego con `on_winning_war`.
- No se usan `gj_es_*` ni `gj_zona_*`.
