# VALIDACION: espiritus_lago (21-11)

Veredicto: ARREGLADO. Un fallo mecánico (prefijo de claves) corregido; el resto pasa.

## Comprobaciones
| # | Punto | Resultado |
|---|---|---|
| 1 | Llaves equilibradas (sin comentarios ni cadenas) | OK en los 13 .txt (abren = cierran en todos) |
| 2 | Localización | OK: 127 claves, sin duplicadas; cada religión, espíritu, presagio, aspecto, escuela, lugar sagrado, acción, modificador estático (STATIC_MODIFIER_NAME_) y evento (título, descripción y opciones) tiene texto. BOM EF BB BF y primera línea `l_spanish:` |
| 3 | Etiquetas de país e ids de location | Ninguno. Ningún fichero fuera de `partes/espiritus_lago/` |
| 3b | Prefijo de claves | FALLABA (ver abajo); arreglado |
| 4 | Claves del motor en el juego base | OK. Los 34 nombres de modificador están en `modifier_type_definitions`; los 21 valores de guion (`*_mild_bonus`, `*_weak_penalty`, etc.) en `script_values`; efectos, triggers y banderas comprobados con grep (add_omen, add_omen_god, any_omen_in_*, is_invoking_omen, is_selected_omen_god, set_religious_school, change_gold_effect, add_estate_satisfaction, trigger_event_non_silently, has_religious_aspect, has_omens, add_and_extend, folk_european_gfx, pagan_gfx, religiousdoctrines, select_omen_god_is_active_tt...). Las dos acciones son copia fiel de `generic_actions/invoke_omen.txt`; la estructura de religión, dioses y escuelas sigue la del base |
| 5 | Cifras de RESUMEN.md | Cuadran todas, recontadas: 18 bonificaciones de la vara (6 + 4x3), 21 líneas en 12 presagios, 4 en escuelas, 8 en lugares, 29 en 15 modificadores de eventos, total 80; 11 eventos con 29 opciones; 4 aspectos; 4 espíritus; 2 escuelas; 2 lugares |
| 5b | Vara de la sección 7 (religión) | Se cumple: 18 (rango 15-20), 4 aspectos (2-4), 11 eventos (8-12), 2 lugares sagrados (1-2), `lee_presagio` presente, escuelas de la tabla 5 presentes |
| 6 | Equilibrio (MECANICAS H, sección 7) | N/A en edificios y unidades (0, no los pide una religión). Los modificadores son pequeños (0,05-0,25) y temporales; los fuertes llevan coste: presagio de 40 de oro, Ola Larga con -1 de reputación, excluyentes entre aspectos |
| 7 | Obras ajenas | Sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft ni otras |

## Arreglado
- **Prefijo.** 31 claves propias no llevaban `gj_espiritus_lago_` (`gj_lago_*`, `gj_omen_*`, `gj_aspecto_*`, `gj_color_espiritus_lago`, los cuatro `gj_*_god`, `gj_isla_del_augurio`). Se renombraron de forma consistente en los .txt, el .yml, RESUMEN.md y NECESITA.md; después se repitió la cruz de localización (0 faltas) y las llaves. Se dejan tal cual las claves del contrato: `gj_escuela_barqueros`, `gj_escuela_sagas`, `gj_fe_norte`, el namespace `gj_espiritus_lago` y `gj_espiritus_lago_lee_presagio`.
- Codificación sin cambios: los .txt siguen en ASCII sin BOM y el .yml con BOM.

## Pendiente (no mecánico)
- `NOT_TESTED` en el juego, ya apuntado en RESUMEN.md: fusión de `on_game_start` y `yearly_country_pulse` con los del base, aceptación de las dos acciones con `show_in_gui_list = yes`, iconos de espíritus y religión, y modificadores de categoría unidad usados como de país.
- Lo que debe poner la integración (NECESITA.md): grupo `gj_fe_norte`, asignar las escuelas, ubicar los lugares sagrados, pops con la religión, y la llamada de mundo_bestias a `gj_espiritus_lago_lee_presagio`.
- La variable global `gj_presagio_tipo` solo aparece en un comentario; no se usa en el código. Si mundo_bestias la define, el evento .11 no la lee todavía.
- RESUMEN.md y NECESITA.md siguen citando varios nombres con el prefijo nuevo, pero su texto de balance («Costa sin Luz +25 %») es una nota del autor: decidir si se acepta tal cual.
- Se apunta, sin rellenar: sin edificios, unidades, decisiones ni situaciones (el contrato no los pide a una religión).


## Ronda de reparación (21-11)
- Comprobador (comprueba-parte.mjs espiritus_lago): PASA, 0 errores (0 textos que faltan y 0 otros), código de salida 0. Quedan 38 avisos, todos de claves de localización que el motor lee por convención (escuelas, espíritus, presagios, lugares sagrados, acción de elegir presagio) y no un script del mod: no son fallos.
- Nombres repetidos: esta parte no figura en ningún par de BALANCE.md (sección 5); no se renombró nada.
- BALANCE.md: el recorte de Costa sin Luz (botín 0.25 a 0.15) está aplicado y se respeta. RESUMEN.md decía +25 %; corregido a +15 %.
- Cifras de RESUMEN.md recontadas: 127 claves de localización (BOM correcto), 11 eventos; el resto no cambió.
- Sin tocar: ganchos (on_game_start, yearly_country_pulse, pulso anual), que reescribe la integración.
- Queda, con motivo: la variable global gj_presagio_tipo no la lee el evento .11 (depende de que mundo_bestias la defina; sin probar en el juego no se arriesga sintaxis nueva); asignar las escuelas a Lagunas y Skarren y ubicar los lugares sagrados, que es de la integración (NECESITA.md).