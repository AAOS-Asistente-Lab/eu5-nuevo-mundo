# VALIDACION: marea_negra (21-11, 00:34)

Veredicto: **ARREGLADO**. La parte pasa las siete comprobaciones; solo hubo un fallo mecánico (dos nombres) y está corregido. Quedan pendientes los puntos que dependen del motor y los que no son mecánicos.

Todo se comprobó con Node sobre los ficheros y con grep en el juego base (1.4.9), en solo lectura. No se cargó nada en el juego y no se tocó nada fuera de `partes/marea_negra/`. Los guiones de comprobación están en el scratchpad de la sesión, fuera de `partes/`.

## 1. Llaves
Las 19 `.txt` de script, contadas sin comentarios ni cadenas: abiertas = cerradas y profundidad nunca negativa. Los totales van de 2 a 128 por fichero (eventos 128, decisiones 84, niveles 80). La `.yml` no lleva llaves. **OK.**

## 2. Localización
- La `.yml` va en UTF-8 con BOM (`EF BB BF`), empieza por `l_spanish:` y tiene 292 claves, ninguna repetida. Todas las líneas tienen el formato ` clave: "texto"` con 2 comillas, sin tabuladores. **OK.**
- Cobertura de claves visibles:
  - los 23 avances, los 3 de cultura, los 5 edificios, la cultura, las 6 decisiones, las 3 reformas, las 3 leyes, la lengua con su dialecto y su familia, la familia de unidades y las 17 modificadores estáticos tienen nombre y descripción;
  - las 18 unidades tienen nombre y descripción;
  - las 9 políticas de ley tienen nombre y descripción;
  - los 22 eventos tienen título, descripción y todas sus opciones, y el `custom_tooltip` del evento 24 tiene texto;
  - los 5 métodos de mantenimiento y los 5 `_price` están;
  - `GJ_MAREA_NEGRA_NIVEL_POR_ERA` y `GJ_MAREA_NEGRA_LIMITE_PUERTOS` están.
- Sin texto, y es correcto: los 5 `..._max_niveles`, el `limite_abordadores`, el on_action y las 5 variables internas (`..._enfriamiento`, `patente_pagada`, `patente_victima`). `BUILDING_LEVEL_BASE` y `SUBUNIT_LIMIT_BASE` son del juego base.
- Sin claves de loc huérfanas.

## 3. Identidad y prefijos
- Sin etiquetas de país: las únicas palabras de tres mayúsculas son `NOT`. Sin ids de location ni de provincia, sin letras de unidad, sin rutas, sin nombres de modelos. **OK.**
- Todas las claves propias llevan `gj_marea_negra_`, salvo las del contrato (`gj_mareano`, `gj_es_marea_negra`) y la ampliación de `yearly_country_pulse` (clave del motor).
- Los 23 ficheros están dentro de `partes/marea_negra/` (20 del juego, 3 documentos), todos los del juego con BOM y CRLF.

## 4. Claves del motor
- **Todas las palabras de script** de los 19 `.txt`, contra los 845.805 identificadores de `G`: 0 desconocidas. Las únicas que no están son nombres propios de la lengua (nombres de personas inventados y apellidos de casas).
- **Modificadores:** todas las líneas `clave = número` de avances, edificios, reformas, leyes, cultura y modificadores estáticos están definidas en `main_menu/common/modifier_type_definitions` (2.709 modificadores). Ejemplos: `can_hire_privateers`, `ship_capture_chance`, `hire_privateer_cost_modifier`, `privateer_durability`, `local_hostile_attrition`, `local_navy_attrition`, `scaled_gold_to_building_owner`, `merchant_capacity_from_building`, `local_max_control`, `global_monthly_control`, `amount_looted_modifier`, `navy_maintenance_efficiency`.
- **Avances:** los 26 `requires` son avances reales, de su misma era (los dos de cultura que usan `cultural_acceptance_advance` lo toman de la era 1, que es anterior: correcto).
- **Efectos, triggers y constantes, con uso en el base** (muestra de 30 de 80 comprobadas): `change_gold_effect`, `add_navy_tradition = navy_tradition_weak_bonus`, `add_political_influence = political_influence_weak_bonus`, `add_stability = stability_severe_penalty`, `add_prestige = prestige_weak_penalty`, `legitimacy_mild_bonus`, `trigger_event_non_silently`, `construct_building`, `cost_multiplier_reason`, `random_known_country`, `every_known_country`, `remove_country_modifier`, `mode = add_and_extend`, `current_age_or_later = { age = ... }` (claves de era `age_1_traditions` a `age_6_revolutions`), `has_reform = government_reform:`, `change_heir_selection = heir_selection:`, `heir_is_allowed`, `max_possible_candidates`, `use_election`, `term_duration`, `is_admiral`, `total_effective_building_levels:`, las categorías de decisión `country_specific_decisions`, `government_decisions` y `economy_decisions`, y las categorías de edificio y de ley.
- **Unidades:** `copy_from` apunta a las 18 plantillas reales (`n_age_N_light_ship`, `n_age_N_transport`, `a_age_N_light_infantry`, con N de 1 a 6). `upgrades_to_only`, `family`, `combat = { coastal inland }`, `is_special`, `country_potential` y `gfx_tags` están en el readme o en unidades del base. Las cifras son deltas que se suman a la plantilla, como en `n_iberian_galleon`.
- Resuelto con el base: `num_of_ports` se usa como comparación (`> 1`, `>= 1`, `>= 10`), así que la duda 3 de NECESITA queda cerrada. `is_rival_of = root` dentro de `any_*` del base también existe. La forma de `yearly_country_pulse` con sub-on-actions es la del propio base.
- Los edificios copian la forma de `smuggler_cove` y `black_market` (`pirate_building_employment`, `pirate_build_time`, `trade_category`), con menos efecto (capacidad mercante 1 frente a 2).

## 5. Cifras de RESUMEN.md
Recontadas sobre los ficheros:

| Pieza | RESUMEN | Real | Vara (sección 7) |
|---|---|---|---|
| Bonificaciones | 64 | 64 (46 + 6 + 6 + 6) | 60-70: cumple |
| Avances propios | 23 | 23 (4+4+4+4+4+3 por era) | «más o menos 25-30»: **2 por debajo** |
| Avances de cultura | 3 | 3 (eras 1, 3 y 5) | 2-3: cumple |
| Reformas | 3 | 3 | 2-3: cumple |
| Modificadores de cultura | 6 | 6 (2+2+2) | cumple |
| Edificios | 5 | 5 | 5: cumple |
| Unidades | 3 cadenas, 18 | 3 cadenas, 18 (cada `unlock_unit` tiene su unidad y al revés) | 2-3 con una versión por era: cumple |
| Eventos | 22 (16 + 6), 43 opciones | 22, 43 opciones | 15-20 de sabor más los de mecánica: cumple |
| Decisiones | 6 | 6 | cumple |
| Leyes del Código | 3 (9 políticas) | 3 (9) | cumple |
| Estáticos | 17 | 17 | — |
| Localización | 292 | 292 | — |

- Se llega a 64 sin relleno, pero con 2 avances menos de los que pide la vara; no se han añadido avances vacíos para igualar. Queda anotado como pendiente.
- Sin bloque del grupo cultural: el grupo `gj_grupo_sorava` lo define Sorava, así que no suma aquí.
- RESUMEN dice 4 candidatos al Almirante; el evento 20 ofrece 3 estilos. No es contradicción mecánica (el tope de candidatos es 4).

## 6. Equilibrio (MECANICAS H y sección 7)
- **Unidades navales:** recalculadas contra la plantilla de cada era: +15 % en velocidad y bloqueo, y -15 % de casco y -20 % de cañones (Bergantín); +15 % de capacidad y velocidad, -15 % de casco y -30 % de cañones (Contrabandista). No pasan el +15-20 % y cada una tiene debilidad (casco, cañones, +10 % de daño de moral recibido) y límite (`gj_es_marea_negra`). **OK.**
- **Abordadores:** +10 % de daño a la fuerza y +15 % de daño en la costa, con -15 % tierra adentro y +10 % de moral recibida; la familia tiene tope (2 más los niveles de Puerto Libre). **OK.**
- **Edificios:** el techo del Puerto Libre es 5, igual que el de `smuggler_cove` del base, así que no pasa el «un nivel mejor». Los otros cuatro tienen techo 3 o 4 y suben un nivel por era. Cada uno exige costa y el Puerto Libre sube `local_unrest`. **OK.**
- **Modificadores de avances, reformas, leyes, decisiones y eventos:** valores en el rango del juego base (avances de 0,03 a 0,25; el más alto es `prestige_from_naval_battle = 0,25`). No hay tope fijado para ellos en H. Las decisiones llevan enfriamiento (10-15 años) y coste.
- La prueba de 100 años de IA sola sigue pendiente (no se pudo ejecutar el juego).
- Ningún valor pasa el tope, así que no se cambió ninguna cifra.

## 7. Obras ajenas
Sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft u otras obras en ficheros ni en localización, salvo dos nombres de la lista de nombres masculinos.

## Arreglado
1. **`Lorien`** (nombre masculino; evoca un lugar de Tolkien) cambiado por `Lurcan`, y **`Teodar`** (cercano a un nombre de la misma saga) por `Tebar`, en `in_game/common/languages/gj_marea_negra_lengua.txt` e `IDENTIDAD.md`. Se comprobó después que el BOM, el CRLF y las llaves siguen bien.

No se encontraron fallos de llaves, de BOM, de localización, de claves del motor ni de valores sobre el tope.

## Pendiente (no mecánico, o que depende del motor)
1. **Avances propios: 23 frente a 25-30.** Faltan 2-7 avances (sobre todo uno por era 1 a 5) para llegar a la vara. Es una decisión de contenido, no de formato.
2. **Fusión del `yearly_country_pulse` repetido en un mod.** El patrón es el del base, pero solo se puede ver al cargar. Plan B en NECESITA, punto 1.
3. **`owner ?= { current_age_or_later }` en el script value del tope de niveles.** El base usa `current_age_or_later` en `building_caps.txt` con otro ámbito; confirmar al cargar.
4. **`has_building = building_type:` sobre una location** y **`is_rival_of = root`** dentro de `random_known_country` y `every_known_country`: ambos patrones existen en el base (otros contextos); confirmar al cargar. Si el rival exige contacto, ajustar el `limit`.
5. **Prefijo `gj_marea_negra_` en las unidades.** El `readme` de unidades no exige `n_` ni `a_`; confirmar al cargar. Si lo exigiera, renombrar 18 unidades y 18 `unlock_unit`.
6. **Textos de ambientación** que mencionan «Europa», «el Norte» y «reinos de media costa»: encajan con el Viejo Mundo (sección I de MECANICAS) pero hay que decidir si el nombre se usa tal cual. Y el evento 22 dice «con el último puerto perdido» cuando salta con 1 puerto o menos.
7. **Iconos** de avance y de edificio: faltan (se reutilizan los de `black_market`, `smuggler_cove` y `pirate_tavern` en los mantenimientos).
8. **`gj_es_marea_negra`, el grupo `gj_grupo_sorava`, la religión `gj_mar_dormido` y la escuela `gj_escuela_marea_negra`** los define la integración u otras partes (ver NECESITA.md). Si Sorava no define el grupo, la cultura no carga.
9. **Prueba de equilibrio** con IA de 100 años y la carga en el juego.

## Ronda de reparaciÃ³n (21-11)
Comprobador de la integraciÃ³n (comprueba-parte.mjs marea_negra): **0 errores, salida 0** al empezar y al acabar (135 avisos de Â«no lo usa ningÃºn scriptÂ», que son de claves que el motor lee solo).

Hecho:
1. **Avances: 23 a 25.** Nuevos gj_marea_negra_fondeaderos_de_ceniza (era 2, velocidad y alcance naval) y gj_marea_negra_llaves_del_cofre_grande (era 5, aranceles y protecciÃ³n comercial), cada uno con 2 modificadores, nombre y descripciÃ³n. Bonificaciones: 64 a 68 (dentro de 60-70). LocalizaciÃ³n: 292 a 296 claves.
2. **Nombre repetido Â«Casa de las CuerdasÂ»** (par ankaru / marea_negra; cambia la que va despuÃ©s en orden alfabÃ©tico): ahora **Â«Sala de los Siete NudosÂ»** en todos los textos. Las claves no cambian.
3. **Menciones al mundo real:** Â«media EuropaÂ» pasa a Â«medio mundoÂ», Â«astilleros del NorteÂ» a Â«astilleros lejanosÂ», Â«costa del NorteÂ» a Â«una costa lejanaÂ» y Â«reinos de media costaÂ» a Â«reinos ribereÃ±osÂ».
4. **Evento 22:** el disparador pasa de 
um_of_ports <= 1 a 
um_of_ports < 1, para que Â«con todos los puertos perdidosÂ» sea cierto (el evento 21 sigue saltando con 2 o menos). Texto ajustado.
5. Se restaurÃ³ la .yml de localizaciÃ³n (desapareciÃ³ de la carpeta durante la ronda; se rehÃ­zo desde la copia del mod integrado, byte a byte con CRLF y BOM) y se aplicaron encima los cambios anteriores.

Queda, y no depende de esta parte: la fusiÃ³n del yearly_country_pulse, current_age_or_later en el tope de niveles, el prefijo de las unidades sin 
_/_, los iconos y la carga en el juego (ver NECESITA.md). No se tocaron los ganchos ni los recortes de equilibrio.
