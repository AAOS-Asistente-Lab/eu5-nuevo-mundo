# VALIDACION: La Llama Profunda (parte `llama_profunda`)

Veredicto: **OK, sin cambios**. No hubo fallos mecánicos que arreglar. No se modificó ningún fichero (solo se añade este).
Sin ejecutar el juego. Comprobado con PowerShell contra los ficheros de la parte y contra `game/in_game` y `game/main_menu` del juego base (solo lectura).

## Comprobaciones
| # | Qué | Resultado |
|---|---|---|
| 1 | Llaves `{ }` en los 11 `.txt`, sin comentarios ni cadenas | Equilibradas en los 11 (auto 8/8, decisiones 47/47, dioses 13/13, lugares 6/6, on_action 6/6, religión 4/4, aspectos 8/8, efectos 25/25, eventos 125/125, colores 2/2, modificadores 22/22) |
| 2 | Localización | `.yml` con BOM (EF BB BF), empieza por `l_spanish:`, sin tabuladores, CRLF no hay, 122 claves, ninguna duplicada, todas con comillas. No falta ninguna clave visible: religión, 6 dioses (+desc), 4 aspectos, 2 lugares, 11 modificadores temporales (nombre+desc), 2 automáticos, 4 decisiones (title, desc, a), 11 eventos (title, desc y cada opción). Las 11 claves `.entry` y `gj_llama_profunda_ADJ` sobran pero son inocuas (el juego base usa `_ADJ`) |
| 3 | TAG, locations, rutas | Cero etiquetas de país, ids de location, letras de unidad ni `file:///`. Todos los ficheros bajo `partes/llama_profunda/`. Ningún `gj_es_*` ni `gj_zona_*` |
| 4 | Claves del motor | Se comprobaron unas 85 claves distintas contra el juego base y todas existen: 23 modificadores (con su categoría country/location/unit correcta para su uso), valores `purity_*`, `prestige_*`, `stability_*`, `legitimacy_*`, `estate_satisfaction_*`, `tiny_production_efficiency_bonus`, efectos (`add_purity`, `add_god`, `remove_god`, `add_estate_satisfaction`, `add_pop_size`, `trigger_event_silently`, `set_global_variable`...), iconos `god_folk_*` y `religious_aspect_folk_*`, `folk_european_gfx`, `pagan_gfx`, `religious_decisions`, `yearly_country_pulse`, `outcome`, `illustration_tags` (happy, angry, regular, interior, exterior). Formatos confrontados con el base: religión, dioses (`religion = <clave>`), aspectos, tipos de lugar sagrado (con `country_modifier`), automáticos (`potential_trigger`, `limit`, `scales_with`, como `high_purity`), decisiones (`option` con `effect`, `ai_will_do = { value = … }`), on_action (`events`, `random_events` con `chance_to_happen` dentro, sub on_action con `trigger`) y colores con nombre. Los `set_variable` con valor calculado en bloque existen en el base (61 ficheros) |
| 5 | Cifras de RESUMEN.md | Cuadran con lo contado: 20 bonificaciones núcleo (4 + 8 + 8), 55 líneas de modificador (20 + 4 + 8 + 23), 11 temporales, 12 eventos (11 visibles + 1 oculto), 26 opciones, 4 decisiones, 5 efectos, 6 dioses, 4 aspectos, 2 lugares, 122 claves, 14 ficheros |
| 6 | Vara de la sección 7 (religión) | Bonificaciones 20 (vara 15-20: en el tope), aspectos 4 (2-4), dioses sí, lugares sagrados 2 (1-2), eventos 12 (8-12: en el tope), `lee_presagio` sí, escuelas ninguna (la tabla 5 no le da). Sin edificios ni unidades: no los pide una religión. Cumple |
| 7 | Obras ajenas | Nombres y textos originales (Orgad, Thurn, Veshka, Ildra, Maruk, Zhurgan, Guardabrasas, Casa de Fuego). Sin rastro de Tolkien, Anbennar, Juego de Tronos ni Warcraft |

## Equilibrio (MECANICAS H y sección 7)
Los topes de H son para unidades y edificios, y la parte no tiene ninguno. Revisados los valores de los modificadores contra los del base:
- Todos están dentro del rango del juego base, salvo `army_artillery_power = 0.15` (base: máx. 0,10) y `monthly_purity = -0.3` (base: máx. 0,1 en positivo), ambos del dios Zhurgan. Es el pacto con el dragón, que MECANICAS A3 pide «enorme», y se paga con pureza cada mes, diezmo cada década y rencor al romperlo. Se deja como está.
- Si se aplicaran todos a la vez, `global_weaponry_output_modifier` sumaría bastante (definición 0,05 + Yunque Vivo 0,10 + Brasa limpia hasta 0,15 + Zhurgan 0,20 + temporales). En la práctica Zhurgan y Brasa limpia casi no coinciden, porque el pacto hunde la pureza. Es un modificador de producción de armas, no de combate. Queda como aviso para la prueba de 100 años de la IA.

## Arreglado
Nada. (Cero fallos mecánicos: llaves, BOM, localización, claves del motor y topes, todos correctos.)

## Pendiente (no mecánico)
1. **Prefijo.** Las claves propias usan `gj_llama_…` (por ejemplo `gj_llama_orgad_god`, `gj_llama_pacto_dragon`), no `gj_llama_profunda_…` como pide la sección 3. Solo las piezas de la sección 5 (`gj_llama_profunda_lee_presagio`) y las decisiones, efectos, eventos y religión llevan el prefijo largo. No se renombra porque `mundo_bestias` ya usa `gj_llama_pacto_dragon` (variable ofrecida en NECESITA.md) y no se puede tocar fuera de esta carpeta. Decide la integración: aceptar el prefijo corto (no hay colisión conocida) o renombrar las dos partes a la vez.
2. **`set_global_variable` con valor calculado** (`gj_llama_profunda_baja_inquietud`, `_sube_inquietud`, `_rompe_pacto`): el formato existe para `set_variable` en el base, pero ningún fichero del base lo usa con la variable global. A probar en el juego (ya figuraba en RESUMEN.md).
3. **`yearly_country_pulse` sumado o sustituido** por el motor: el base lo define con `on_actions = { … }`, así que se espera que se sume. Si no, copiar la línea en el bloque base (ver NECESITA.md).
4. **`potential` de un dios y reparto automático**, y que `gj_fe_norte` cuente como pagano: a probar en el juego; el evento oculto .20 cubre el segundo caso.
5. **Aviso para la parte `durnhal`** (fuera de esta carpeta, no tocado): usa `change_global_variable` y `clamp_global_variable`, que no aparecen en ningún fichero del juego base (sí `change_variable` y `clamp_variable`). Conviene que su validación lo mire. La escala que esta parte supone para `gj_inquietud_caldera` (puntos de 3 a 10 sobre 0-100) es compatible con su clamp de 0 a 100.
6. Los iconos propios de la religión, dioses y aspectos, y la asignación de lugares sagrados a locations: de la integración (ya en NECESITA.md).


## Ronda de reparación
- Comprobador de la integración al empezar: 0 errores (0 textos que faltan y 0 otros), 39 avisos (claves de localización sin uso directo: dioses, lugares sagrados, opciones y .entry; son inocuos).
- BALANCE: gj_llama_profunda_sube_inquietud y _baja_inquietud dejan de escribir gj_inquietud_caldera (su dueño es durnhal) y llaman a gj_durnhal_sube_inquietud = { PUNTOS = ± n }. Apuntado en NECESITA.md (durnhal aún no lo define).
- Nombres repetidos: ningún par de la sección 5 de BALANCE toca a esta parte, no hubo renombres.
- Prefijo gj_llama_: se mantiene (BALANCE: no se renombra). Zhurgan sobre el rango en artillería: se deja, vigilar.
- Ganchos (on_actions, pulso anual) y recortes del revisor: sin tocar.
- Comprobador al acabar: ver la salida final de la ronda (0 errores, código 0).
