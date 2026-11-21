# VALIDACION: pacto_balanza

Veredicto: ARREGLADO (1 fallo mecánico arreglado, 0 pendientes bloqueantes). Juego no ejecutado.

## Comprobaciones
1. Llaves: equilibradas en los 9 .txt (sin comentarios ni cadenas). Pares abiertas/cerradas: auto 11, decisiones 47, lugares 6, on_action 13, religión 5, aspectos 12, efectos 20, eventos 134, modificadores 24. OK.
2. Localización: .yml con BOM (EF BB BF), empieza por `l_spanish:`, 110 claves sin duplicados. Tienen texto: religión (nombre, ADJ, desc), 4 aspectos, 2 lugares sagrados, 3 `AUTO_MODIFIER_NAME_`, 12 `STATIC_MODIFIER_NAME_/DESC_`, 4 decisiones (`.title`, `.desc`, `.a`, el mismo formato que las del juego base) y los 12 eventos (título, descripción, opciones; el .10 con `desc.a` y `desc.b`). Nada falta. OK.
3. Identidad: ninguna etiqueta de país, ningún id de location, ninguna ruta de disco. Todas las claves propias llevan `gj_pacto_`/`gj_pacto_balanza`. Los 12 ficheros están dentro de `partes/pacto_balanza/`. OK.
4. Claves del motor: se compararon las 151 palabras distintas que no son nuestras (modificadores, efectos, triggers, constantes `honor_*`, `estate_type:*`, banderas) contra el juego base. Todas existen; `honoring_alliance_call_cost_modifier` y `war_breaking_truce_cost_modifier` están en `main_menu/common/modifier_type_definitions/00_modifier_types.txt`. Se miró además la categoría de 29 modificadores en esa definición: país, localización o unidad coinciden con donde se usan (`land_morale_modifier` es de unidad, pero los aspectos del juego base lo usan igual). `has_honor` existe (budista). OK.
5. Cifras de RESUMEN.md: religión 1, aspectos 4, lugares sagrados 2, auto-modificadores 3, modificadores de país 12, decisiones 4, eventos 12, efectos 3, on_action 4, claves 110. Todo cuadra. Vara de la sección 7 para religión: 18 bonificaciones de definición+aspectos (15-20), 4 aspectos (2-4), 2 lugares (1-2), 12 eventos (8-12), `lee_presagio` presente, sin escuelas (no le tocan). Cumple. Sin dioses ni focos: su mecánica (`has_honor`) no los usa.
6. Equilibrio: bonos pequeños (comercio +5 a +20 %, relaciones +10 a +15 %, crédito +10 a +20 %). Cada ventaja trae su coste (cuesta más romper treguas, perjurio de 10 años, enfriamiento por modificador, decisiones de pago). El automático de honor alto escala de 0 a ~1 con honor 70-100. Nada roto.
7. Obras ajenas: sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft ni otras. Pesadores, lonja y Cuenta son originales.

## Arreglado
- Los 9 ficheros de script `.txt` iban en UTF-8 sin BOM. Todos los del juego base de ese tipo llevan BOM (comprobado en religions, aspects, events, decisions, static_modifiers, on_action, scripted_effects, auto_modifiers y holy_site_types). Se les puso BOM, solo los 3 bytes, sin tocar el contenido.

## Pendiente (no mecánico, no se toca)
- NOT_TESTED: si los `on_action` con nombre repetido (`yearly_country_pulse`, `on_loan_repaid`, `on_truce_broken`, `on_royal_marriage`) suman a los del juego base o los pisan. Es el riesgo principal: comprobar en vivo, y si pisan, mover el pulso a un nombre propio.
- NOT_TESTED: escalas de `scales_with` de los 3 automáticos. En `gj_pacto_credito_roto` la escala crece si el honor baja de 0; si el honor puede ser negativo habría que acotarla.
- La integración debe aportar: grupo `gj_fe_sur`, icono y etiqueta gráfica (ahora provisional `folk_african_gfx pagan_gfx`), entradas de `holy_sites/`, y que `mundo_bestias` llame a `gj_pacto_balanza_lee_presagio` (todo en NECESITA.md).
- RESUMEN.md dice «10 ficheros de juego y localización» y 12 en total con RESUMEN y NECESITA: coincide con lo que hay (10 + 2). Su texto de «llaves en 9 ficheros» es correcto.

## Ronda de reparación
- Comprobador de la integración (comprueba-parte.mjs pacto_balanza): PASA, 0 errores (0 textos que faltan, 0 otros), 18 avisos y salida 0. Los 18 avisos son claves de localización que ningún script usa aún: 4 de los lugares sagrados (esperan sus entradas en holy_sites/), 12 de las 4 decisiones (	itle, desc, ; el juego las lee por convención) y las 2 variantes desc.a/desc.b del evento .10 (se eligen por código). Son correctas; no se tocan.
- Nombres repetidos: el par «Palabra de oro» (pacto_balanza y sorava) se resuelve por orden alfabético de clave (gj_pacto_… va antes que gj_sorava_…), así que mi parte lo conserva y renombra sorava. «Cuentas claras» no es de esta parte. Mi parte no tiene otro nombre repetido. No se cambió ningún texto.
- Sin cambios en el contenido de juego: esta parte ya estaba limpia. Ganchos de on_action y recortes de equilibrio, intactos.
- Pendientes que no dependen de mí (siguen NOT_TESTED, ver NECESITA.md): si los 4 on_action repetidos suman a los de la base; escala de gj_pacto_credito_roto si el honor baja de 0 (no se acota porque no consta una sintaxis de tope en el juego base); grupo gj_fe_sur, icono y entradas de holy_sites/.
