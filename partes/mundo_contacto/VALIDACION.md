# mundo_contacto: VALIDACION

Veredicto: ARREGLADO (1 fallo mecánico menor, ya corregido). Quedan pendientes solo cosas que no se pueden probar sin el juego.

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` en los 8 `.txt`, sin comentarios ni cadenas | OK: balance 0 en todos, ningún cierre de más |
| 2 | Localización | OK: los 2 `.yml` con BOM (EF BB BF), sin CRLF, empiezan por `l_spanish:`; 148 claves + 9 de `replace/`, sin duplicados ni líneas rotas |
| 2b | Claves visibles con texto | OK: título, descripción, `historical_info` y opciones de los 21 eventos, nombre y descripción de las 5 decisiones y su opción, y `STATIC_MODIFIER_NAME_` de los 28 modificadores. Ninguna clave de texto sin uso. Los `STATIC_MODIFIER_DESC_` (15) son opcionales |
| 3 | Etiquetas de país, ids de location, letras de unidad, rutas | OK: ninguna. No hay `c:`, `country:` ni `location:` con id |
| 3b | Prefijo | OK: toda clave propia lleva `gj_`. Las únicas sin prefijo son `REPLACE:great_pestilence` (enfermedad y situación) y `REPLACE:smallpox`, que lo exige el diseño (misma clave que el juego base), y `INJECT:yearly_country_pulse`. Nada fuera de `partes/mundo_contacto/` |
| 3c | Prefijo `gj_mundo_contacto_` | Las claves de modificadores, decisiones y efectos usan `gj_contacto_*`, `gj_ev_*`, `gj_loc_*`, `gj_inmunidad_*`, `gj_difusion_*` y `gj_saber_ultramar_*`. Cumplen el prefijo `gj_` del contrato §3; no el `gj_mundo_contacto_` literal de este encargo. Los eventos sí usan el namespace `gj_mundo_contacto`. Se deja como está (renombrar toca ~100 referencias y la integración ya cuenta con estos nombres); anotado como observación |
| 4 | Claves del motor en el juego base | OK. Se comprobaron las 299 palabras no propias de los 8 `.txt` contra todo `in_game` y `main_menu`: solo faltan variables y scopes propios (`var:gj_*`, `scope:gj_*`). Aparte, con definición: los 31 tipos de modificador (están en `modifier_icons` o `modifier_type_definitions`), los valores de `script_values/default_values.txt` (`modifier_duration_years_*`, `*_weak/mild/severe/extreme_bonus`, `stability_*`, `estate_satisfaction_*`, `societal_value_minor_move_*`, `monthly_spawn_chance_unique`), eras `age_2_renaissance` y `age_3_discovery`, `spiritualist_vs_humanist`, `other_decisions`, `owner_from_old_world`, `smallpox_trait`, `hint_great_pestilence`, regiones `caribbean/mesoamerica/andes_region`, y la imagen `great_pestilence.dds`. Formatos (decisión con `option` y `effect`, `game_data = { category }`, `mode = add`, `illustration_tags`, `outcome`) iguales a los del juego base |
| 5 | Cifras de RESUMEN.md | OK, todas cuadran: 10 ficheros, 21 eventos, 47 opciones, 5 decisiones, 28 modificadores (24 país y 4 location), 75 líneas de bonificación, 9 triggers, 15 efectos, 148 + 9 claves. Todo evento definido tiene lanzador y todo referido existe; todo modificador definido se usa |
| 6 | Equilibrio (MECANICAS H, §7) | La vara de facción (60-70 bonificaciones, edificios, unidades, 15-20 eventos) no aplica: es una parte de mundo y no lleva edificios ni unidades. Tiene 75 líneas de bonificación y 21 eventos, y llega igualmente. Tope de MECANICAS I («nadie se adelanta a Europa»): ver abajo |
| 7 | Obras ajenas | OK: sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft ni otras |
| 7b | Dependencias | NECESITA.md las lista todas: 9 `gj_es_*`, `gj_recoge_caidos`, los ganchos y las regiones. No hay ninguna otra sin definir |

## Arreglado
1. **Valores por encima del tope propio** (RESUMEN dice que ningún saber del visitante pasa de +5 % en lo suyo ni de +2 % de investigación). En `gj_mundo_contacto_modificadores.txt`:
   - `gj_saber_ultramar_generico`: `research_speed_modifier` 0,04 a 0,02.
   - `gj_saber_ultramar_estepa`: `global_horses_output_modifier` 0,10 a 0,05.
   Las líneas siguen siendo 75 (no se quitó ninguna). RESUMEN no cambia.

## Pendiente (no mecánico, o no se puede probar sin el juego)
- **Acumulación de investigación.** Con la vía de aprender (+15 %), la difusión máxima (+30 %, solo si se va 12 o más avances por detrás) y la «ola de maestros» (+10 %) a la vez, un país puede llegar a +55 % de velocidad de investigación mientras va por detrás. Desaparece al alcanzar al Viejo Mundo (la difusión) y las otras duran años; no hay forma de adelantarse por aquí, pero conviene medirlo en una partida de IA. Decisión de equilibrio: no se tocó.
- **Renombrado a `gj_mundo_contacto_`** de los modificadores y decisiones (ver 3c), si el jugador A o la integración lo piden.
- **No probado en juego** (igual que dice el autor): que `REPLACE:` funcione sobre `diseases/` y `situations/`; que la carpeta `localization/spanish/replace/` pise las 9 claves; la escala de los modificadores de resistencia (0,15 a 0,50), sin ejemplo en el juego base; que `any_known_country` incluya el Viejo Mundo desde el arranque; que `set_variable` con `value = num_of_advances_researched` y las comparaciones con `root.var:` se acepten; `any_institutions_embraced` con `prev` en un país nuestro.
- **Lo que pide a otros** (de NECESITA.md): los 9 triggers `gj_es_*` y el efecto `gj_recoge_caidos` (hrimval); si este no llega, quitar la línea en los eventos `.7` y `.9`.
- Sin misión ni situación nueva de contacto (lo dice el autor: quedó fuera por tiempo).

## Ronda de reparación
- Comprobador (comprueba-parte.mjs mundo_contacto): de 6 errores a 2, salida 1. Los 2 que quedan son la carpeta eplace/ de localización (ruta no válida para el juego según el comprobador) y dependen de la integración; ver NECESITA.md.
- Arreglado: llamada gj_recoge_caidos a gj_hrimval_recoge_caidos en los eventos .7 y .9 (2 líneas).
- Arreglado: sponsor_spiritual_protection_bonus (modificador real del juego base) marcado como falso valor de script; ahora va entre comillas en has_ y emove_country_modifier (2 líneas).
- Probado y descartado: mover las 9 claves de eplace/ a un .yml normal (da 9 errores por falta del prefijo gj_); se dejó en eplace/.
- Nombres repetidos: ningún par de BALANCE.md afecta a esta parte.
- Sin tocar: ganchos (INJECT:yearly_country_pulse, REPLACE:), recortes de equilibrio. La acumulación de investigación (+55 %) sigue pendiente de medir en juego.
- Cifras de RESUMEN.md sin cambios (mismas piezas y claves).