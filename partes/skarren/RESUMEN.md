# RESUMEN: parte skarren (saqueadores de los fiordos)

Cifras contadas sobre los ficheros escritos (no las pretendidas). Entregado a las 23:5x del 20-11 y reparado en la ronda de reparación del 21-11 (sin cargar el juego).

## Bonificaciones: 69 líneas de modificador (vara de el jugador A: 60-70, sin contar eventos)
| Origen | Piezas | Líneas |
|---|---|---|
| Avances propios de país, 6 eras | 24 | 47 |
| Avances de cultura (`culture:gj_skarren`) | 3 | 6 |
| Reformas de gobierno únicas | 3 | 9 |
| Cultura `gj_skarren` (país 2, location 1, personaje 2) | 1 | 5 |
| Grupo cultural `gj_grupo_fiordo` (país 1, location 1) | 1 | 2 |
| **Total** | 32 | **69** |

Aparte, sin contarlo en las 69: la demanda de bienes del grupo (3 líneas), los 9 modificadores estáticos de la mecánica (19 líneas: 4 sagas, señores del fiordo inquietos, señores del fiordo en armas, banquete, costa saqueada, tregua) y los modificadores de los 5 edificios (15 líneas, por nivel).

Avances por era (país): era 1 = 5, era 2 = 6, era 3 = 3, era 4 = 4, era 5 = 3, era 6 = 3. Los de cultura están en las eras 1, 3 y 5.

## Edificios: 5, con tope de niveles que sube en cada era
Salón de las sagas, Astillero de fiordo, Lonja del botín, Atalaya de hogueras, Casa de remeros. Cada uno nace con 1 nivel y gana 1 más al entrar en las eras 2, 3, 4, 5 y 6 (hasta 6), con `max_levels` por script value copiado de `janissary_barracks_size`. Cada uno se desbloquea con un avance propio y exige ese avance (`has_advance`). Límite: un nivel por era, y el astillero, la atalaya y la casa de remeros solo en costa. Fuerza máxima de cada edificio: un nivel por encima de su equivalente del base (a revisar en pruebas de IA).

## Unidades: 3 líneas × 6 eras = 18 definiciones, y 18 avances que las desbloquean
- **Corredor del Fiordo** (transporte naval): +1 de velocidad (entre +11 % y +20 % según la era) y +20 % de capacidad de transporte; a cambio, 2 cañones menos, 1 de casco menos y 15 % más de daño recibido. Cupo: 12, 14, 16, 18, 20, 22. Todos los valores van como suma sobre la plantilla de cada era (el motor suma en `movement_speed`, `transport_capacity`, `cannons` y `hull_size`): velocidad +1, capacidad +0.05 a +0.3 según la era, cañones -2 y casco -1. Se vuelve a las diferencias del autor tras el recorte del revisor.
- **Hacheros de saga** (infantería pesada): +10 % de daño a la moral; 10 % más de daño recibido; sin iniciativa propia (la categoría ya la trae). Cupo: 15, 18, 21, 24, 27, 30.
- **Arponeros del fiordo** (infantería ligera): iniciativa +1, que se suma a los 5 de la categoría de infantería ligera (queda en 6, +20 %) y +5 % de daño; 15 % más de daño recibido. Cupo: 13, 16, 19, 22, 25, 28.
Cadena de cada una con `copy_from` sobre la plantilla de su era y `upgrades_to_only` a la siguiente; solo para `gj_es_skarren`.

## Mecánica (MECANICAS C4: gloria y sagas, la Piedra de la Asamblea, la incursión y su precio)
No hay situación ni desastre: la mecánica va con variables, decisiones, eventos y modificadores.
- **Gloria** (`gj_skarren_gloria`): +1 por batalla ganada, +2 por localidad ocupada, y lo que den las decisiones y los eventos.
- **Sagas**: al llegar a 15, 40, 80, 130 y 200 de gloria salta el evento `gj_skarren.10`, que da un modificador de saga durante 50 años y un rasgo de héroe a quien gobierna. Cuatro sagas (mar, hierro, sangre, fama). Si se escribe otra, se renueva.
- **Piedra de la Asamblea**: en cada nuevo gobernante salta `gj_skarren.12` (elección). Con mucha gloria, más legitimidad.
- **Incursión**: dos decisiones (la de primavera y la gran incursión, esta con 25 de gloria y cupo de 8 años), el banquete largo y el encargo de una saga.
- **Su precio**: cada incursión marca «botín reciente» 6 años. Si se acaba, salta `gj_skarren.20` (señor del fiordo aburrido) y después `gj_skarren.21` (señores del fiordo en armas).
- Decisiones: **4**. Situaciones: **0**. Desastres: **0**. Scripted effects: 2.

## Eventos: 23 definiciones (22 visibles y 1 oculta), 51 opciones
- **18 temáticos** (`.1` a `.9`, `.11`, `.13` a `.19`, `.22`): hambre, casco a la deriva, ballena varada, cantor de sagas ciego, hacha de otro mundo, tributo de la Liga, boda, fuego en la grada, señor del fiordo perdido en la niebla, templo del lago, mercader asustado, cautivo que sabía leer, lobos de hielo, aguas bermejas, hijos que no vuelven, tregua del hielo.
- **4 de mecánica**: `.10` (saga), `.12` (la Piedra elige), `.20` y `.21` (el precio).
- **1 oculta** (`.40`), que comprueba el precio cada año.
Lo temático cumple los 15-20 del contrato aparte de los de mecánica.

## Cultura y lengua
Cultura `gj_skarren`, grupo `gj_grupo_fiordo`, lengua `gj_lengua_skarren` (familia `gj_familia_fiordo`): 30 nombres de hombre, 20 de mujer, 18 dinastías y 16 apellidos de linaje bajo. Colores propios en `named_colors`.

## Ficheros: 20 (17 de juego + 3 .md) y 310 claves de localización en castellano
Todos los de juego van en UTF-8 con BOM, como los del base. Llaves equilibradas en los 17. Sin letras de unidad, rutas, etiquetas de país ni ids de location.

## Comprobaciones hechas
- Llaves `{` `}` equilibradas en todos los ficheros.
- Cada identificador de los ficheros existe en el juego base (comprobado con un barrido de vocabulario sobre `in_game` y `main_menu/common`) o empieza por `gj_`; la única excepción es `INJECT`, que el propio juego usa en una DLC.
- Cada `requires` es un avance real (comprobado contra los 1.424 avances del base) y cada plantilla `copy_from` existe.
- Cada modificador de los avances existe en `modifier_type_definitions`.
- Cada clave visible tiene su localización.

## Lo que NO se ha comprobado
- Nada se ha cargado en el motor. La sintaxis de edificios con script values por era, la cadena naval con `upgrades_to_only`, el `character_modifier` y los `INJECT` están copiados de patrones del base pero no probados en vivo.
- El equilibrio no se ha medido: hace falta la prueba de IA de 100 años de MECANICAS H.
- `Trazadora: NOT_TESTED` (la cadena entera necesita el juego y un país con `gj_es_skarren`).

## Lo que falta o queda recortado
- Sin misiones ni formables propios (el contrato no los pide para facciones; la vara de 50-60 piezas por país se cumple con avances, reformas, edificios, unidades, decisiones y eventos, sin contar misiones).
- Los `icon` de avances apuntan a un icono del base; los iconos propios los pone la integración.
- Sin imágenes de eventos propias: usan las etiquetas genéricas del base.
