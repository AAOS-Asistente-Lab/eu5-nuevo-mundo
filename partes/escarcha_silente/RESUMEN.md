# RESUMEN: escarcha_silente (La Escarcha Silente)

Religion del norte helado, la de la Corte Insepulta de Hrimval. Mecanica: la **perdicion** (`doom`) del motor es el reloj de la Noche Blanca.

## Como funciona
- La bandera del motor es `enable_doom = yes` en `definition_modifier` (la misma que usa la religion nahua del juego base; `has_doom` es el trigger).
- La perdicion sube sola (+0,15 al mes), mas deprisa en guerra (+0,12 al mes, modificador automatico `gj_escarcha_silente_guerra`), con cada eclipse (+20), cada cometa (+5) y algunas opciones de eventos. Se baja con la decision «Vigilia de la cuenta», con los aspectos y focos de aliento y con opciones de evento. En paz, una Noche cada 50 anos, mas o menos; en guerra, cada 30.
- Al llegar a 100 salta `on_max_doom_reached`, que lanza el evento de la Noche Blanca (`.9`). Opcion A: la Noche empieza para el pais (perdicion a 0, modificadores muy fuertes y costosos durante 4 anos, y llama al efecto global de hrimval). Opcion B: romper la cuerda: la perdicion queda a 50 y se paga con legitimidad, prestigio y el clero. A los 4 anos, el evento `.10` apaga la Noche y deja 5 anos de la Corte dormida, con penalizaciones.
- El modificador automatico `gj_escarcha_silente_aliento` crece con la perdicion: mas moral, defensa y desgaste al enemigo cuanto mas cerca de la Noche. La contrapartida la pone el propio motor (la perdicion baja la lealtad de los sujetos y la estabilidad).
- Los focos religiosos avanzan mas deprisa cuanto mas alta es la perdicion. El ultimo («El Ultimo Invierno») exige los otros cuatro y lanza el evento `.12`.

## Cifras (contadas con script sobre los ficheros)
- **Bonificaciones (definicion + aspectos + focos): 20**
  - `definition_modifier`: 5 (sin contar la bandera `enable_doom`),
  - 4 aspectos × 2 = 8 (se eligen 2),
  - 5 focos: 7 al completarse (los otros 5 son modificadores mientras se investiga, penalizaciones).
- Extras fuera de esa cuenta:
  - modificadores automaticos: 2 (5 lineas),
  - tipos de lugar sagrado: 2 (8 lineas; la tumba usa `country_modifier`, no `religion_modifier`),
  - modificadores estaticos para eventos y decisiones: 10 (27 lineas).
- Aspectos: 4. Focos: 5. Dioses: 0 (la mecanica no los usa).
- Eventos: **12** (`gj_escarcha_silente.1` a `.12`), con 24 opciones; 9 salen del pulso de la religion, uno del maximo de perdicion (`.9`), uno programado (`.10`) y uno del foco final (`.12`).
- Decisiones: **3** (Vigilia de la cuenta, Convocar la Noche Blanca, Erguir la Cumbre Callada).
- Situaciones y desastres: 0 (la Noche Blanca global es de hrimval).
- Efectos: `gj_escarcha_silente_lee_presagio` (para mundo_bestias) y `gj_escarcha_silente_abre_noche`.
- Escuelas: ninguna (esta religion no tiene).
- Localizacion: 100 claves en `spanish`, todas las visibles cubiertas; 0 etiquetas de pais; 0 ids de locations; llaves equilibradas en los 11 ficheros de script.

## Ficheros
- `in_game/common/`: `religions`, `religious_aspects`, `religious_focuses`, `holy_site_types`, `auto_modifiers`, `scripted_effects`, `on_action`, `decisions`.
- `in_game/events/`, `main_menu/common/named_colors`, `main_menu/common/static_modifiers` y `main_menu/localization/spanish`.
- Todos en UTF-8 con BOM (como los del juego base del mismo tipo).

## Lo que no se ha comprobado (NOT_TESTED, porque no se ejecuta el juego)
- Todos los modificadores se han cotejado con `modifier_type_definitions` del juego base, y las claves de script con ejemplos reales. Pero no se ha cargado nada en el juego.
- Que `on_max_doom_reached` se reemplace en lugar de fundirse con el del juego base (ver `NECESITA.md`).
- Que el escalado de `scales_with = doom` en el modificador automatico sea por punto de perdicion (0-100). Si fuera por fraccion, el efecto seria despreciable, nunca roto.
- Que los focos religiosos funcionen sin el modificador de reforma nahua (se ha prescindido de el). Por la misma razon no hay `num_religious_focuses_needed_for_reform`.
- `gj_noche_blanca_comienza` lo define hrimval.
- El tono: el nombre de la mecanica en pantalla sera «Perdicion» (el del motor). Los textos hablan de la cuenta y de los nudos de la cuerda.

## Equilibrio
- Bueno sí: moral +5, defensa +10, desgaste de enemigos +0,5, y hasta +8 de moral y +15 de defensa extra a perdicion maxima.
- Roto, no: la perdicion tira de la estabilidad y de los sujetos (efectos del motor), la guerra la acelera, la Noche cuesta -30 % de eficiencia de estabilidad y prosperidad, y despues llegan 5 anos de la Corte dormida con -10 de moral, legitimidad y prestigio.
