# VALIDACION: sol_blanco

Veredicto: ARREGLADO (un único arreglo cosmético; nada mecánico roto).

## Comprobaciones
1. Llaves: equilibradas en los 10 .txt (sin comentarios ni cadenas): acciones 56/56, dioses 12/12, lugares 6/6, on_actions 5/5, religión 5/5, aspectos 8/8, focos 109/109, efectos 7/7, eventos 107/107, modificadores 28/28.
2. Localización: .yml en UTF-8 con BOM, primera línea `l_spanish:`, 123 claves, 0 duplicadas. Todos los títulos, descripciones y opciones de eventos (26 opciones), nombres de dioses, aspectos, focos, lugares, modificadores (`STATIC_MODIFIER_NAME_*`), acciones y los 5 `*_tt` de `custom_tooltip` tienen texto. Los 10 .txt también llevan BOM.
3. Sin etiquetas de país ni ids de locations; sin rutas ni letras de unidad. Todas las claves propias llevan `gj_sol_blanco_` o `worship_gj_sol_blanco_` (esta última por convención del juego, ya anotada en NECESITA.md). Todo queda dentro de `partes/sol_blanco/`.
4. Claves del motor en el juego base (más de 60 distintas, por grep): los 23 modificadores usados existen en `modifier_type_definitions`; `has_yanantin`, `add_yanantin`, `yanantin`, `has_completed_religious_focus`, `modifier_while_progressing`, `modifier_on_completion`, `effect_on_completion`, `monthly_progress`, `price:cleansing_ritual_yanantin`, `price:inti_ceremonial_festivals`, `monthly_food_productivity_weak_bonus`, `legitimacy_severe_bonus`, `prestige_extreme_bonus`, `army_tradition_weak_bonus`, `estate_satisfaction_*`, `trigger_event_non_silently`, `any_current_gods`, `currency_utility`, `yearly_country_pulse`, `religious_aspects`, `definition_modifier`, etc. Todas existen. No se tocan eras ni `copy_from` (la parte no tiene unidades).
5. Cifras de RESUMEN.md: cuadran (4 dioses, 4 aspectos, 8 focos, 2 lugares, 2 acciones, 3 efectos, 12 eventos, 123 claves). Vara de la sección 7 para religión: 20 bonificaciones (15-20), 4 aspectos (2-4), 12 eventos (8-12), 2 lugares sagrados, `lee_presagio` presente; sin escuelas (el Sol Blanco no tiene). Cumple.
6. Equilibrio: sin edificios ni unidades. Los valores copian la escala del juego base (dioses idénticos a los de inti). Observación no mecánica: `gj_sol_blanco_eclipse_celebrado` da +0,25 de legitimidad mensual durante 10 años, por encima de lo habitual en religiones (0,1), aunque es un premio temporal por un evento raro; decisión de diseño para la mesa.
7. Sin nombres ni textos de obras ajenas (grep de nombres de Tolkien, Anbennar, Juego de Tronos, Warcraft y de los pueblos andinos históricos: 0 aciertos).

## Arreglado
- `religious_focuses/gj_sol_blanco_focos.txt`: sangrado de los bloques `effect_on_completion` de Vigilia y Concordia (un tabulador de más). Sin cambio de significado; BOM conservado y llaves intactas.

## Pendiente (no mecánico, ya en NECESITA.md)
- Todo lo marcado NOT_TESTED: se necesita ejecutar el juego (acciones religiosas calcadas de inti, enlace aspecto-dios por nombre `worship_<dios>`, suma de `yearly_country_pulse`, focos sin tipo de modificador de avance propio).
- Falta el icono, `holy_sites/`, el grupo `gj_fe_sur` y la asignación de la religión a Ankarú (integración).
- Revisar el nivel de `gj_sol_blanco_eclipse_celebrado` (ver punto 6).


## Ronda de reparación
- El comprobador de la integración (comprueba-parte.mjs sol_blanco) ya daba PASA al empezar: 0 errores (0 textos que faltan y 0 otros), 52 avisos, código de salida 0. No hubo que añadir textos ni claves.
- Pendiente de BALANCE.md y del punto 6 de esta validación: gj_sol_blanco_eclipse_celebrado bajado de +0,25 a +0,1 de legitimidad mensual (la medida habitual en religiones). Los demás valores del modificador no se han tocado.
- Nombres repetidos: sol_blanco no aparece en ningún par de la sección 5 de BALANCE.md; no había nada que renombrar.
- Sin tocar: ganchos (on_action y pulso anual) y recortes del revisor.
- Sigue pendiente, en NECESITA.md: icono, holy_sites/, grupo gj_fe_sur y asignación de la religión a Ankarú (integración); todo lo NOT_TESTED, que exige ejecutar el juego.