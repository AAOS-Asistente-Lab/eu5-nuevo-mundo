# VALIDACION: Liga de las Mil Lagunas (clave `lagunas`)

Veredicto: **ARREGLADO** (3 fallos mecánicos corregidos, 5 pendientes no mecánicos). Nada se ejecutó en el juego.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` por fichero (sin comentarios ni cadenas), 14 `.txt` | OK en los 14, ninguna profundidad negativa |
| 2 | `.yml` en UTF-8 con BOM, empieza por `l_spanish:` | OK. 252 claves, sin duplicados, sin líneas mal formadas |
| 2 | Localización de cada clave visible | OK. 251 claves necesarias (avances, reformas, edificios, unidades, cultura, grupo, 19 modificadores, 4 decisiones, 21 eventos con título, texto y opciones). Faltan 0. Solo salen sin texto 4 nombres de variable (no se muestran) |
| 3 | Etiquetas de país, ids de location, rutas con unidad | 0 de cada. Todo está dentro de `partes/lagunas/` |
| 3 | Prefijo de claves propias | Todas llevan `gj_`. Ver pendiente 1 |
| 4 | Claves del motor en el juego base | 314 identificadores no `gj_` cotejados contra todo `in_game` y `main_menu`: solo falta `map_gj_lagunero`, que se define aquí. Además, 24 claves de contexto (triggers, efectos, modificadores) localizadas en su fichero natural, 25 `requires` que son avances reales, las 6 claves de era, 18 unidades base de `copy_from` y el uso de `months` y `mode = add` en `add_country_modifier` y `trigger_event_silently` |
| 5 | Cifras de RESUMEN.md | Recontadas con un script: 46 + 6 + 10 + 4 + 3 = **69 bonificaciones**; 25 avances, 3 reformas, 5 edificios, 17 unidades, 21 eventos, 4 decisiones, 19 modificadores, 14 `.txt` + 1 `.yml` + 3 `.md`. Todo cuadra |
| 5 | Vara de la sección 7 | 69 está en 60-70. Edificios, unidades, eventos (18 temáticos + 3 de mecánica) y cultura/grupo cumplen. **Avances: 25, en el mínimo del rango 25-30**, y cada uno lleva 2-3 modificadores (cumple). No hay situación ni desastre, y MECANICAS C3 no lo exigía como obligatorio (ver pendiente 3) |
| 6 | Equilibrio (MECANICAS H, sección 7) | Un fallo corregido (barcazas, abajo). Resto en regla: ver más abajo |
| 7 | Tolkien, Anbennar, Juego de Tronos, Warcraft u otras | Un nombre dudoso corregido (Galdor). El resto de nombres y de textos, originales |

## Arreglado
1. **Barcazas de Asedio: bombardeo muy por encima del tope.** `bombard_efficiency = 0.15` es aditivo sobre la plantilla de la era (la base usa deltas en las unidades con `copy_from`, por ejemplo `hull_size = -1` en `n_dhow`). La plantilla da 0.125, 0.15, 0.20, 0.25 y 0.30, así que +0.15 era de +120 % en la era 2 y de +50 % en la 6. Ahora vale 0.02, 0.02, 0.03, 0.04 y 0.045 (de +13 % a +16 % en cada era). La debilidad (`movement_speed = -1`), el cupo de 8 y la exigencia de lago siguen igual.
2. **BOM en los 14 `.txt`.** No lo llevaban. El juego base lo lleva en los ficheros de ese tipo (avances, edificios, unidades, eventos, decisiones, reformas, cultura, grupo, lengua, `on_action`, `script_values`, `static_modifiers`), y los ficheros tienen `ñ`. Añadido sin tocar el contenido. Llaves y BOM comprobados de nuevo: 14 de 14 bien.
3. **Nombre `Galdor` en `languages/gj_lagunas_lengua.txt`** (coincide con un personaje de Tolkien). Cambiado a `Galdero`. No estaba en IDENTIDAD.md.

## Equilibrio, comprobado sin cambios
- **Patrulleros:** velocidad +1, +1, +2, +2, +2, +2 sobre 8, 10, 11, 12, 13 y 14 (de +10 % a +18 %). Debilidad: casco -1 y cañones de -1 a -4 sobre 4 a 25. Límite: tope de 16 y solo junto a un lago.
- **Ballesteros:** +15 % de daño de fuerza, +10 % de daño a la moral recibido, -10 % en colinas y montañas, tope de 24.
- **Edificios:** capacidad de mercado de 1.5 por nivel en el Mercado Flotante y de 0.5 en la Casa de Pesas, frente a 5 en los mercados del base. Todos con límite de lugar (lago, puerto, centro de mercado o capital) y uno solo en el caso del Salón. El máximo de nivel sube con la era.
- **Modificadores de avances y reformas:** ningún valor supera el máximo que ya usan los avances del base (`merchant_maintenance_efficiency` 0.25 con máximo 0.4, `global_trade_protection_factor` 0.10 con máximo 0.25, `global_cloth_output_modifier` 0.15 con máximo 0.33, `trade_income` 0.05-0.10 con máximo 0.1 por línea).

## Pendiente, no mecánico
1. **Prefijo.** La parte usa `gj_lag_` en vez de `gj_lagunas_` (contrato §3). Es único y no choca con otras partes; renombrar 250 claves es un cambio de diseño y queda para la integración si se quiere uniforme. Los ficheros, el namespace de eventos (`gj_lagunas`) y los nombres de cultura y grupo (`gj_lagunero`, `gj_grupo_lagunas`) sí siguen el contrato.
2. **Valores aditivos sin probar en el motor.** Que los deltas de unidad se sumen a la plantilla, `limit = 24` y `limit = 8` con número en vez de script value (la base usa `wagenburg_unit_limit`), `upgrades_to_only` en la cadena naval y `limit` en unidades navales. NOT_TESTED; el arreglo 1 asume la suma.
3. **La Asamblea no es una situación.** MECANICAS C3 la pide como «situación con votaciones». Va con eventos, variables con duración y decisiones. Cumple la vara, pero es una simplificación.
4. **Enganche del pulso anual.** Sin añadir `gj_lagunas_pulso_anual` a `yearly_country_pulse` solo saltan los eventos `.1` y `.3`, y por decisión (ya en NECESITA.md).
5. **Equilibrio de la IA sin medir.** Edificios con hasta 4 niveles frente a la cadena de mercados del base (que mejora por mejora de edificio, no por nivel) no se pueden comparar sin una partida de la IA sola de 100 años.

## Lo que sigue necesitando la integración
Ya está en `NECESITA.md`: `gj_es_lagunas`, culturas `gj_skarren`, `gj_soravi` y `gj_ostrevari`, religión `gj_espiritus_lago` con la escuela barqueros, el enganche anual y la plantilla de gobierno.


## Ronda de reparación
Comprobador de la integración (`node herramientas/comprueba-parte.mjs lagunas`): **PASA, 0 errores** (0 textos que faltan y 0 otros), salida con código 0, 66 avisos que no son errores. Corrido al empezar; no hizo falta tocar ningún fichero de contenido para llegar a 0, así que no se corrió de nuevo tras arreglos.

Hecho:
- Nombres repetidos: «Diques y Esclusas» (con thalassar) y «Escoltas de Caravana» y «Contrato de especias» (con sorava). En los tres pares, la clave de lagunas va antes en orden alfabético, así que el nombre se queda aquí y lo cambian thalassar y sorava. Esto sustituye al «renombrar» que figuraba en BALANCE.md para esta parte. Lagunas no tiene ningún nombre que cambiar.
- Recorte de `trade_income` (0.10 a 0.05 en el avance de la línea 279 y la reforma de la línea 31) del revisor: verificado en los ficheros y respetado. El Pacto de los Lagos lleva 0.05 y la cultura 0.03.
- Recuento de bonificaciones: el revisor cuenta 63 y este recuento por ficheros da 69 (46 + 6 + 10 + 4 + 3). La diferencia es de criterio (qué líneas cuentan); ambos caen dentro de 60-70 o a 3 de su borde. RESUMEN.md lo anota.

Queda, con su motivo:
- Prefijo `gj_lag_` en vez de `gj_lagunas_`: decisión del BALANCE, no se renombra.
- Enganche de `gj_lagunas_pulso_anual`: lo hace la integración (en NECESITA.md). No se tocó el formato de los ganchos.
- Deltas aditivos de unidad, `limit` con número literal y `upgrades_to_only` naval: solo se comprueban en el juego (NOT_TESTED).
- La Asamblea va con eventos, no con una situación (decisión del BALANCE).
- Equilibrio de la IA sin medir (partida de 100 años).
- «Liga» la usa también la escuela de hrimval; el nombre de aquí es «Liga de las Mil Lagunas», distinto en pantalla.