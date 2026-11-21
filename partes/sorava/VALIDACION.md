# VALIDACION: Sorava

Veredicto: **ARREGLADO**. 2 fallos mecánicos encontrados y corregidos; el resto cuadra. Nada ejecutado en el juego (NOT_TESTED).

## Comprobaciones
| # | Qué | Resultado |
|---|---|---|
| 1 | Llaves `{ }` por fichero, sin comentarios ni cadenas | OK en los 16 `.txt`: avances 62/62, edificios 36/36, cultura 6/6, grupo 5/5, decisiones 89/89, desastre 17/17, reformas 9/9, lengua 9/9, on_action 5/5, efectos 29/29, valores 73/73, familias 2/2, unidades 48/48, eventos 247/247, colores 3/3, modificadores 44/44 |
| 2 | BOM y cabecera | OK: los 18 ficheros de datos llevan BOM (EF BB BF); los dos `.yml` empiezan por `l_spanish:` y no tienen líneas mal formadas ni claves duplicadas |
| 2 | Localización | **Faltaban 5 claves** (arreglado): los nombres de los métodos de mantenimiento de los 5 edificios. Tras añadirlas: 298 claves, todas las necesarias presentes (avances, reformas, edificios, unidades, familias, decisiones, desastre, modificadores, cultura, grupo, 27 eventos con título, texto y opciones). Sin texto sobrante salvo `gj_sorava_language`, `_desc`, `gj_soravi_dialect` y `map_gj_soravi`, que son inocuos |
| 3 | TAG, ids de location, rutas, modelos | 0 hallazgos (los avisos eran `NOT`, `RGB`, `BOM` y el verbo «llama») |
| 3 | Prefijos | Toda clave propia lleva `gj_sorava_`, `gj_soravi`, `gj_grupo_sorava` o las del contrato; dependencias externas solo `gj_es_sorava`, `gj_es_lagunas`, `gj_zona_estrecho`, `culture:gj_soravi` |
| 3 | Ficheros | Todo bajo `partes/sorava/`; ninguno fuera |
| 4 | Claves del motor | Se comprobaron **todos** los identificadores de los `.txt` (no una muestra) contra `in_game`, `main_menu/common` y `dlc` del juego base: únicas no presentes, nombres propios, el parámetro `valor` y los dos colores propios. Entre ellos: 62 modificadores contra `modifier_type_definitions` (todos existen); efectos y triggers (`change_gold_effect`, `add_country_modifier` con `years = -1` y `mode = add / add_and_extend`, `trigger_event_non_silently`, `has_any_active_disaster`, `current_age_or_later`, `any_owned_location`, `is_market_center`, `is_core_of`); claves de era (`age_1_traditions` a `age_6_revolutions`); las 12 unidades base de `copy_from`; categorías de decisión; constantes de estados y prestigio; construcción y mantenimiento de edificios; etiquetas gráficas. Estructura comparada con ejemplos del juego base: decisión (`manila_galleon_charter`), desastre (`coup_attempt`), edificio único (`fondaco`, `venetian_arsenal`), unidades (`3_janissaries`), tope de nivel (`building_caps`) y `gold > { value = monthly_income_trade_and_tax multiply = N }` |
| 4 | Cadenas `requires` | Los 31 avances cuelgan de un avance de la misma era o anterior (script de comprobación) |
| 5 | Cifras | Recontadas con script: 68 bonificaciones (46 + 6 + 6 + 7 + 3), 28 avances de país (6+5+5+5+4+3), 3 de cultura, 3 reformas, 5 edificios, 12 unidades en 2 cadenas, 27 eventos (19 de sabor), 7 decisiones, 1 desastre, 22 modificadores nombrados, 3 efectos, 7 valores. Coinciden con RESUMEN.md y cumplen la vara de la sección 7 (60-70 bonificaciones, 25-30 avances, 15-20 eventos de sabor). Sin relleno vacío |
| 6 | Equilibrio | Unidades: Escolta -15 % de bajas y -10 % de moral perdida, con -10 % de daño, -10 % de velocidad y cupo; Tirador +15 % de daño con +15 % de bajas y -10 % tierra adentro, con cupo. Cada una, ventaja en 1-2 valores y debilidad y límite. Edificios: topes de 3 a 4 niveles frente a los topes por desarrollo del juego base (que pasan de 6), con lugar restringido. Bonos de avances, reformas y cultura en la escala del base (p. ej. `global_max_literacy`, `bank_interest`, `stability_decay` con valores del base). Dentro de lo dicho en MECANICAS H |
| 7 | Obras ajenas | 0 coincidencias con Tolkien, Anbennar, Juego de Tronos, Warcraft u otras; nombres inventados |

## Arreglado
1. **Localización:** añadidas 5 claves (`gj_sorava_casa_especias_mantenimiento`, `gj_sorava_banco_de_perlas_mantenimiento`, `gj_sorava_atalaya_mantenimiento`, `gj_sorava_sala_de_balanzas_mantenimiento`, `gj_sorava_posta_mantenimiento`). Sin ellas el juego habría mostrado la clave en bruto al ver el edificio. El BOM sigue intacto.
2. **on_action:** quitada la entrada `150 = 0` de `random_events`. Ningún on_action del juego base la usa y ya hay `chance_to_happen = 45`. Efecto: los eventos de sabor salen con una probabilidad algo mayor (los pesos relativos no cambian).
3. `RESUMEN.md`: cifra de claves de localización (293 a 298).

## Pendiente (no mecánico, para quien decida)
- **Integración:** definir `gj_es_sorava`, `gj_es_lagunas`, `gj_zona_estrecho` y añadir `gj_sorava_pulso_anual` a `yearly_country_pulse` (ver NECESITA.md). Sin lo último no salen los eventos de sabor.
- **NOT_TESTED, necesitan arranque:** unidades con `family` y cupo por script value (`num_provinces`); topes de nivel por era; `capital_country_modifier` del edificio; `dominant_culture ?= culture:gj_soravi` en `location_potential` (el base usa `=`; `?=` es válido en el motor y no falla si no hay cultura dominante, pero conviene verlo cargar); escala de oro de decisiones y eventos (`change_gold_effect` de -1 a -8 y de 1 a 5) tras una partida de la IA sola; que la palabra no se quede clavada por debajo de 20 sin recuperación; el desastre arranca con `monthly_spawn_chance_low` y termina en 45.
- **Criterio de diseño:** las claves de localización de los modificadores de los contratos (`gj_sorava_contrato_*`) comparten nombre con las decisiones; son espacios distintos (`STATIC_MODIFIER_NAME_...` frente a `.title`) y no chocan, pero si la integración quiere nombres distintos, es cosmético.
- **Ilustraciones e iconos propios:** reutilizan los del juego base (ya dicho en NECESITA.md).
- **Nombres parecidos:** la casa «Quirasa» y el topónimo «Qirasa» (IDENTIDAD.md) suenan casi igual; es cosmético.
- **Religión `gj_pacto_balanza`:** el enlace del honor con `gj_sorava_cambiar_palabra` queda para la otra parte.


## Ronda de reparación
- Comprobador (comprueba-parte.mjs sorava) al empezar y al acabar: PASA, 0 errores (0 textos que faltan y 0 otros), código de salida 0; 70 avisos sin tocar.
- Nombres repetidos: «Escoltas de caravana» (compartido con lagunas) pasa a «Guardas de Recua» (unidad, avance y textos); «Palabra de oro» (compartido con pacto_balanza) pasa a «Fe de plaza». «Cuentas claras» lo renombra ankaru, que va antes en orden alfabético. Solo cambia el texto visible; las claves siguen igual.
- Nombres parecidos: el topónimo «Qirasa» pasa a «Zirasal» en IDENTIDAD.md (la casa «Quirasa» se queda).
- RESUMEN.md: 298 claves de localización, y los nombres nuevos.
- Sin tocar: ganchos (on_actions, INJECT y pulso anual) y recortes del revisor. Siguen en NECESITA.md el pulso anual y el enlace del honor con gj_pacto_balanza (dependen de la integración y de pacto_balanza).
