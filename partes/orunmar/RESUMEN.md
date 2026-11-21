# RESUMEN: Hegemonía Carmesí de Orunmar (clave `orunmar`)

Contado sobre los ficheros, no sobre lo previsto.

## Bonificaciones: 70 líneas de modificador (sin eventos)
| Origen | Líneas |
|---|---|
| 24 avances propios de país (5, 4, 4, 4, 4 y 3 por era), 2 modificadores cada uno | 48 |
| 2 avances de cultura (`gj_orunmar_cultura_*`) | 4 |
| 3 reformas de gobierno únicas | 9 |
| Cultura `gj_orunmari`: país 2, location 2, personaje 2 | 6 |
| Grupo `gj_grupo_carmesi`: país 2, location 1 | 3 |
| **Total** | **70** |

Aparte (no cuentan): 3 modificadores de `goods_demand` del grupo, los 14 modificadores temporales de eventos y decisiones, los modificadores de los edificios y del desastre.

## Piezas
- **Edificios: 5**, todos con niveles que crecen por era (script_values `gj_orunmar_*_niveles`): Escalinata de las Ofrendas (1 a 3 niveles, solo en la capital), Casa de los Cautivos (1 a 4), Huerto de Niebla (1 a 3, solo en colinas, mesetas y montañas), Taller del Tinte Rojo (1 a 3, solo ciudades), Atalaya de la Niebla (1 a 3).
- **Unidades: 3 cadenas × 6 versiones = 18 definiciones**, con `copy_from` y `upgrades_to_only` sobre la unidad base de cada era. Cada avance de era que las desbloquea lleva su `unlock_unit`.
  - Guerreros de la Captura (infantería pesada): +15 % de daño de moral y −10 % de daño recibido; −15 % de daño causado. Cupo: 6 más los niveles de Escalinata y Casa de los Cautivos.
  - Cazadores del Dosel (infantería ligera): +2 de iniciativa y +20 % en selva; +10 % de daño recibido. Cupo: 6 más los niveles de Atalaya.
  - Porteadores Rojos (auxiliares): −15 % de desgaste, +5 % de velocidad; +15 % de daño recibido. Cupo: 4 más los niveles de Casa de los Cautivos.
- **Mecánica de MECANICAS D5 (guerras de cosecha):**
  - un casus belli `cb_gj_orunmar_cosecha` con su objetivo de guerra `gj_orunmar_superiority_cosecha` (antagonismo ×0,25, sin subyugación);
  - 2 variables propias: `gj_orunmar_cautivos` (los cautivos, que se ganan al vencer una marcha) y `gj_orunmar_anio_guerra` (el año de la última guerra);
  - **1 desastre**, el Gran Ayuno de los Dioses: aparece tras 10 años sin guerra y acaba en cuanto hay guerra;
  - 4 decisiones: convocar la Marcha, ofrecer cautivos, llenar las vetas y los campos (convierte población en esclava con `change_pop_type`) y ayuno voluntario;
  - la devoción baja un poco cada año sin guerra a partir del tercero (`religious_influence_tiny_penalty`).
- **Eventos: 20** en el espacio `gj_orunmar`, de los cuales 4 los lanza la mecánica (`.3` cautivos, `.13`, `.14` y `.15` del Gran Ayuno), 1 sigue a otro (`.20`), 1 sale en cada era nueva (`.19`), 1 al arrancar (`.1`) y 13 salen del pulso anual aleatorio. 44 opciones en total.
- **Situaciones: 0.**
- **Culturas: 1; grupos culturales: 1; lenguas: 1** (con 40 nombres masculinos, 40 femeninos, 20 de linaje y 16 de baja cuna).
- **Modificadores temporales (static_modifiers): 14** (12 de país y 2 de location; se quitaron 3 sin uso en la ronda de reparación).
- **Textos en castellano:** 257 claves, en 3 ficheros `l_spanish` con BOM.

Piezas de contenido propio, en el sentido de PETICION (eventos, avances, reformas, decisiones, desastre, casus belli, edificios y cadenas de unidades): 20 + 26 + 3 + 4 + 1 + 1 + 5 + 3 = **63**, más las bonificaciones de cultura y de grupo, que van aparte.

## Ficheros
Bajo `in_game/common/`: `advances` (2), `government_reforms`, `cultures`, `culture_groups`, `languages`, `building_types`, `unit_types`, `casus_belli`, `wargoals`, `disasters`, `decisions`, `on_action`, `script_values` (2). Bajo `in_game/events/`: 1. Bajo `main_menu/common/`: `static_modifiers`, `script_values` (cupos de las unidades), `named_colors`. Bajo `main_menu/localization/spanish/`: 3. Más `IDENTIDAD.md`, `NECESITA.md` y este fichero.

## Comprobaciones hechas
- Llaves `{` y `}` equilibradas en los 19 ficheros del juego.
- Las 230 claves visibles tienen texto (cero faltas).
- Las claves de modificador de países, culturas, grupos, edificios, reformas y desastre existen en `modifier_type_definitions` del juego base; las de unidad, en el `readme` de `unit_types`.
- Cero etiquetas de país, cero ids de locations, cero rutas de disco.
- Los ficheros del juego llevan UTF-8 con BOM, como los del base.

## Lo que falta o no está comprobado
- No se ha ejecutado el juego: la sintaxis sale de los ficheros de ejemplo, no de una carga.
- Los avances no llevan icono ni `ai_weight` (el base los pone en algunos).
- Las reformas no se desbloquean solas: la integración decide cuándo ofrecerlas (ver NECESITA).
- Las unidades usan las etiquetas gráficas de la América del juego base, a cambiar si se quiere un aspecto propio.
- No hay misiones propias ni situación: el contrato no las pedía para esta facción, y el Gran Ayuno hace de desastre.
- Equilibrio: sin partidas de IA todavía. Las unidades quedan dentro del tope del +15 % en dos valores, cada una con su debilidad y su cupo; los edificios tienen un solo nivel más que sus equivalentes del base, con su límite de lugar.
