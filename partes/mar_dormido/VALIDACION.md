# VALIDACION: El Mar Dormido (`gj_mar_dormido`)

Veredicto: **ARREGLADO** (1 fallo mecánico menor corregido; el resto pasa). Comprobado con scripts de Node sobre los ficheros y con búsqueda en el juego base (2.518 ficheros de `in_game`, más `main_menu` y `dlc`).

## Comprobaciones del encargo
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` equilibradas, sin comentarios ni cadenas | OK en los 12 `.txt` (por ejemplo decisiones 89/89, eventos 123/123, modificadores 44/44) |
| 2 | Localización completa, UTF-8 con BOM, empieza por `l_spanish:` | OK. BOM `EF BB BF`, 139 claves, sin duplicadas, sin líneas mal formadas. Faltan 0. Sobran 2 con texto (`gj_mar_dormido_group`, `gj_mar_dormido_mecanica`): inofensivas |
| 3 | Sin TAG ni ids de location; prefijos; nada fuera de la carpeta | OK. Ninguna etiqueta de país, ninguna ruta de disco. Todas las claves de nivel superior llevan `gj_mar_`, `gj_aspecto_`, `gj_escuela_marea_negra`, `gj_arrecife_`, `gj_faro_` o `gj_color_` (las del contrato). Nada escrito fuera de `partes/mar_dormido/` |
| 4 | Claves del motor existen en el juego base | OK. 70 claves distintas probadas (más que las 15-25 pedidas): 31 modificadores, efectos, triggers, valores con nombre, banderas de gfx, `scales_with`, `potential_trigger`, `add_and_extend`, `set_religious_school`, etc. Todas aparecen. Las de Poder de Rito (`monthly_rite_power`, `add_rite_power`, `rite_power`, `rite_power_*_bonus`) están en `main_menu/.../modifier_type_definitions`, `default_values.txt`, `effect_localization` y `trigger_localization`. La única que no aparece es `has_rite_power` (ver pendientes) |
| 5 | Cifras de RESUMEN.md | Cuadran: 19 bonificaciones de la vara (6 de definición + 13 de 4 aspectos), 89 líneas en total (6+13+3+9+6+52), 22 modificadores estáticos (52 líneas), 7 decisiones, 12 eventos con 27 opciones, 3 efectos, 6 triggers, 2 ganchos, 13 ficheros de juego y localización. Vara de la sección 7 para religión: 15-20 bonificaciones (19, llega), 2-4 aspectos (4), 1-2 lugares sagrados (2), 8-12 eventos (12), `lee_presagio` (sí), escuela de la tabla 5 (sí). Sin dioses ni focos porque la mecánica usa ritos |
| 6 | Equilibrio (MECANICAS H y sección 7) | OK. Sin unidades ni edificios. Los valores están dentro de los del base (pesca de +0,1 a +0,3; el base llega a +0,5; legitimidad mensual hasta +0,1, igual que el base). Los modificadores fuertes tienen coste o enfriamiento: Gran Vigilia 60 de Poder y 250 de oro cada 40 años; Pulso Rojo resta Poder de Rito; Sangrar la marea sube el desgaste. Costa Mansa y Pulso Rojo son excluyentes |
| 7 | Sin nombres ni textos de obras ajenas | OK. Sin coincidencias con Tolkien, Anbennar, Juego de Tronos, Warcraft y similares. Nombres propios originales (Arrecife de la Cuna, Faro de la Vigilia, Marea Negra, etc.) |

## Arreglado
- `in_game/common/decisions/gj_mar_dormido_decisiones.txt`: las 7 variables de enfriamiento (`gj_md_nana`, `gj_md_kraken`, `gj_md_ciudad`, `gj_md_flota`, `gj_md_corriente`, `gj_md_vigilia`, `gj_md_sangre`) se creaban con `set_variable = { name = … years = … }` sin `value`. El base siempre lo escribe con `value = yes years = N`. Añadido `value = yes` en las 7. Llaves siguen equilibradas (89/89).

## Pendiente (no mecánico; hay que probarlo en el juego)
1. `has_rite_power = yes` en la definición de la religión: no aparece en ningún script del juego base. Sale de FORMATO-EU5 §2.2 y del contrato, por eso se deja. Ya está anotada en `FALLOS-PARTES.md`. Si el motor la rechaza, la integración debe cambiar la mecánica.
2. Escala del Poder de Rito: se asume de 0 a 100 (umbrales 60, 25, 10 y 70 en `auto_modifiers`, decisiones, triggers y eventos). Los valores `rite_power_*_bonus` del base (de 5 a 50) son compatibles, pero no hay un máximo documentado.
3. `add_rite_power` con números sueltos en vez de los valores con nombre del base: probable que funcione; no probado.
4. Fusión de `yearly_country_pulse` con la del base.
5. Escala de `trade_sea_efficiency` y `ship_repair_at_sea`, tomada de ejemplos del base.
6. Piezas de la integración ya listadas en NECESITA.md: grupo `gj_fe_sur`, escuela inicial de la Marea Negra, lugares sagrados en `holy_sites/`, pops con la religión, Poder de Rito inicial (40 y 25) e icono.

Trazadora: NOT_TESTED (el juego no se ejecuta en esta fase).

## Ronda de reparación
- Comprobador al empezar: 5 errores (4 textos que faltan y 1 otros).
- Arreglado: las dos claves de `auto_modifiers` (`gj_mar_calma_honda`, `gj_mar_sueno_inquieto`) pedían `AUTO_MODIFIER_NAME_` y `AUTO_MODIFIER_DESC_` y la localización tenía `STATIC_MODIFIER_*`, que ningún script usaba. Renombradas las 4 claves en el .yml (UTF-8 con BOM, 139 claves; el inglés lo cubre el comprobador a partir del castellano).
- Nombres repetidos: «Marea roja» (mar_dormido y skarren). Se queda en esta parte (`gj_mar_dormido` va antes que `skarren` en orden alfabético); lo renombra skarren. Nada que cambiar aquí.
- Pendientes de BALANCE: `has_rite_power`, `add_rite_power`, la escala 0-100 y la escuela inicial de Marea Negra siguen sin probar en el juego; la escuela inicial va en NECESITA.md.
- No se tocan los ganchos ni los recortes de equilibrio.
- Comprobador al acabar: 1 error (`has_rite_power`: clave desconocida), salida 1, 29 avisos (claves de texto de decisiones, escuela y lugares que aún no usa ningún script porque los engancha la integración).
- Ese error restante depende de la integración: el contrato (§ tabla de mecánicas) exige `has_rite_power` y el juego base solo conoce el Poder de Rito por sus efectos y modificadores. Apuntado en NECESITA.md.
