# VALIDACION: mundo_ruinas (21-11)

Veredicto: ARREGLADO. 3 fallos mecánicos encontrados y corregidos; el resto cuadra. Nada probado en vivo.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` por fichero, sin comentarios ni cadenas | OK en los 10 .txt (avances 18/18, edificios 24/24, cb 5/5, decisiones 42/42, on_action 8/8, efectos 141/141, pulsos 109/109, triggers 28/28, eventos 305/305, modificadores 82/82) |
| 2 | Localización | OK: BOM `EF BB BF`, empieza por `l_spanish:`, 220 claves, 0 duplicadas. Las 109 claves visibles referidas (title, desc, name, tooltip) tienen texto. Los nombres y descripciones de modificadores usan `STATIC_MODIFIER_NAME_/DESC_`, el formato del juego base |
| 3 | TAG e ids de location | OK: 0 etiquetas, 0 ids, 0 rutas de disco |
| 4 | Claves del motor | OK: los 279 identificadores no propios (modificadores, efectos, triggers, eras, categorías, bienes, iconos) existen en G. Comprobados con una definición real: `age_2_renaissance`, `age_4_reformation`, `unlock_advance_effect`, `has_unlocked_advance_trigger`, `change_gold_effect`, `add_casus_belli`, `trigger_event_non_silently`, `prestige_weak_bonus`, `prestige_mild_bonus`, `expansion_decisions`, `religious_decisions`, `other_decisions`, `yearly_country_pulse`, `on_location_changed_owner`, `guild_construction`, `granary_employment`, `normal_noble_employment`, `government_build_time`, `infrastructure_category`, `government_category`, y los iconos `terraces` y `royal_society`. Los bienes `coal`, `pearls`, `fish`, `iron`, `salt`, `masonry`, `tools`, `stone`, `paper` y `glass` existen, así que valen `local_coal_output_modifier` y `local_pearls_output_modifier` |
| 5 | Cifras de RESUMEN | Cuadran: 126 + 18 + 13 = 157 líneas de modificador; 41 modificadores estáticos; 6 avances; 4 edificios de 3 niveles; 23 eventos con 44 opciones; 14 triggers; 9 + 10 = 19 efectos; 4 on_actions; 3 decisiones; 1 casus belli |
| 6 | Equilibrio | Corregido (ver abajo). Ningún valor positivo pasa ya el máximo que usa el juego base para su clave. Quedan 2 valores por encima, pero son penalizaciones temporales de despertar: `local_unrest` 0,3 y `local_monthly_prosperity` -0,02. Cada artefacto y cada nivel 3 de veta llevan su desventaja. Los edificios son monumentos de veta con un tope de 3 niveles y un límite de uno por veta |
| 7 | Obras ajenas | OK: sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft ni otras obras (búsqueda de términos, más lectura de los nombres) |
| - | Ficheros fuera de `partes/mundo_ruinas/` | Ninguno |

## Arreglado
1. **Codificación de los .txt.** Estaban sin BOM. Los ficheros del juego base de los mismos tipos (avances, edificios, decisiones, eventos, estáticos, efectos, casus belli y on_action) llevan todos BOM. Ahora los 10 .txt van en UTF-8 con BOM.
2. **`local_cultural_tradition`** valía 2 (`gj_ruina_atlante_intacta`) y 5 (`gj_ruina_atlante_restaurada`); el máximo del juego base es 1. Ahora 0,5 y 1.
3. **`global_production_efficiency` = 0,06**, por encima del máximo del juego base (0,05), en `gj_veta_fuego_n3` y `gj_art_martillo_mod`. Ahora 0,05 en ambos.

## Pendiente (no mecánico)
- **Prefijo.** La parte usa `gj_ruina_*`, `gj_veta_*`, `gj_monumento_*`, `gj_saber_*`, `gj_art_*`, `gj_afin_*`, `gj_expedicion_*` y `gj_hallazgo_botin`, no `gj_mundo_ruinas_`. Solo `gj_mundo_ruinas.N` (eventos), `gj_ruinas_*` (efectos y decisiones) y los nombres de fichero llevan el prefijo largo. El contrato (tabla 5) hace a esta parte dueña de las ruinas y las vetas, y otras partes usan `gj_ruina_es_restaurada`, así que renombrarlas rompería esas referencias. Lo decide la integración.
- **Vara de la sección 7.** Sus mínimos (60-70 bonificaciones, 5 edificios, 2-3 unidades) son de las facciones. Esta parte es de mundo y su fila de la tabla 6 pide A1 y A2. Aun así, supera con holgura la vara de bonificaciones (157) y no lleva unidades, como dice el contrato. No se ha rellenado nada.
- **Sin probar en vivo:** `add_location_modifier` permanente sin `years`, `add_casus_belli` con `province`, el umbral de `total_effective_building_levels` y `capital = { }` como scope de location desde un país.
- **Bonificación regional del nivel 2 de la veta.** Queda como modificador de país modesto (MECANICAS A2 pide regional). No hay un modificador regional fiable en el motor.
- **El que muere en la expedición** es un cortesano al azar, no un explorador (MECANICAS A1).
- **Lugares sagrados sobre ruinas (A1):** sin hacer. Es trabajo de las religiones, con `gj_ruina_es_restaurada`.
- **Ruinas y vetas:** dependen de los `gj_zona_*` y de los grupos culturales de NECESITA.md, que define la integración.
- **Balance de números de la veta de la Raíz.** `gj_veta_raiz_n3` junto con el evento de la cosecha doble (+0,15 de comida) es fuerte, pero lleva su coste (-0,02 de producción) y el freno del mantenimiento. Pendiente de la prueba de IA de 100 años (MECANICAS H).

## Ronda de reparación (21-11)
Comprobador: `node herramientas/comprueba-parte.mjs mundo_ruinas`. Al empezar, 16 errores (8 textos que faltan y 8 otros). Al acabar, **0 errores, salida 0** (41 avisos, que no bloquean).

Arreglado:
1. Los 6 avances `gj_saber_*` no tenían `potential`. Ahora llevan `potential = { has_unlocked_advance_trigger = { type = <el propio avance> } }`: solo se ven una vez desbloqueados por la expedición.
2. Los efectos `gj_ruinas_decada` y `gj_ruinas_flavor_veta` construían el id del evento como `gj_mundo_ruinas.$id$`. Ahora el parámetro `id` es el id completo y las 8 llamadas pasan `gj_mundo_ruinas.40` a `.43` y `.60` a `.63`. El comportamiento es el mismo.
3. Faltaban 4 textos de método de producción: `gj_monumento_{fuego,marea,raiz,estrella}_mantenimiento` (nombres propios: Brasas del Hogar Rojo, Cuidado del Cuenco Mudo, Riego de la Cepa, Vigilia de la Aguja). Claves de localización: 220 a 224.
4. Prefijo (BALANCE §6): `gj_es_ruina` y `gj_es_veta` pasan a `gj_mundo_ruinas_es_ruina` y `gj_mundo_ruinas_es_veta` en los 4 ficheros que los usan. Ninguna otra parte los usaba.
5. Nombres repetidos (BALANCE §5): ningún par incluye textos de esta parte, así que no hay nada que renombrar aquí.

Queda (no depende de esta parte): los `gj_zona_*` y los grupos culturales los define la integración (NECESITA.md); los lugares sagrados sobre ruinas, las religiones; y las pruebas en vivo ya listadas arriba (`add_location_modifier` sin `years`, `add_casus_belli` con `province`, `capital = { }` como scope de location). Los ganchos (on_actions y pulso anual) no se han tocado.