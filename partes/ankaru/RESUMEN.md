# Resumen de la parte Ankarú (facción, constructor «tall», sur)

Todas las cifras de abajo salen de contar los ficheros con un script (llaves, claves del motor, localización y modificadores), no de lo que se pretendía.

## Cifras
| Pieza | Cantidad |
|---|---|
| **Bonificaciones (líneas de modificador de país y de cultura, sin eventos)** | **68** |
| · de avances propios (22 de país + 3 de cultura = 25 avances) | 50 |
| · de reformas de gobierno (3 reformas) | 9 |
| · de la cultura `gj_ankaruno` (país 3, location 2, personaje 2) | 7 |
| · del grupo `gj_grupo_solar` (país 1, location 1; además 3 bienes en `goods_demand_modifier`) | 2 |
| Avances propios | 25 (4, 4, 4, 4, 3 y 3 por era, más 3 de cultura) |
| Reformas de gobierno | 3 (eras 1, 2 y 4) |
| Edificios (cadenas) | 5, de 3 niveles cada una |
| Edificios (definiciones) | 15, con 39 líneas de modificador propias |
| Unidades (líneas) | 3, con una versión en cada una de las 6 eras |
| Unidades (definiciones) | 18, en 3 familias con cupo |
| Eventos | 21 (`gj_ankaru.1` a `.21`) |
| Decisiones | 4 |
| Situaciones | 0 (ver la mecánica) |
| Desastres | 0 |
| Modificadores con nombre | 19 (con 41 líneas de modificador: fases, eclipses, decisiones y eventos) |
| Cultura, grupo cultural y lengua | 1 + 1 + 1 |
| Líneas de localización (solo castellano) | 273 |
| Piezas de contenido de la medida del encargo (avances 25 + reformas 3 + cadenas de edificios 5 + líneas de unidades 3 + eventos 21 + decisiones 4 + calendario 1) | 62 |

Las bonificaciones de cultura y de religión van aparte: aquí solo se cuentan las de cultura y de grupo, no las de la religión `gj_sol_blanco`, que es de otra parte.

## La mecánica: el Calendario Solar
Es de variables de país (no una situación: es estado propio de cada país, no compartido). Cuatro fases de 5 años, cada una con un modificador propio (`gj_ank_fase_*`) y un evento que la anuncia:
- **Siembra** (.2): comida y crecimiento.
- **Cosecha** (.3): impuestos y precio de venta.
- **Festival** (.4): legitimidad y satisfacción de los estamentos.
- **Ayuno** (.5): influencia religiosa y velocidad de construcción, con un pequeño coste en impuestos.

El pulso anual (`gj_ank_pulso_anual`) hace avanzar el calendario, celebra el cambio de era (`.20`, uno por era) y lee los eclipses. Un eclipse en el festival es una gran bendición (`.6`, «El Sol Coronado»), en el ayuno es una crisis (`.7`, «La Noche del Ayuno») y fuera de fase es un presagio neutro (`.8`). Otras partes pueden provocar uno con `gj_ankaru_eclipse_effect = yes`; si nadie lo hace, el calendario genera los suyos (3 % anual).

Las demás piezas de la sección D4 de MECANICAS:
- **La Cuerda del Trabajo**: decisión `gj_ank_cuerda_del_trabajo`. Obras un 25 % más rápidas y mejoras de ciudad un 15 % más baratas durante 8 años, a cambio de menos producción rural y descontento del campesinado; después, 20 años de descanso.
- **Las terrazas**: cadena `gj_ank_terraza_1..3` (colinas, mesetas y montañas), más comida y más tope de población.
- **Los caminos de cuerda**: cadena `gj_ank_cuerda_1..3`, más control máximo y más suministros, y los avances de propagación.
- **Colonos del Sol**: decisión `gj_ank_colonos_del_sol` y evento `.16`, con migración interna de ciudades llenas a asentamientos rurales.
- **Contra Orunmar**: los Guardianes del Paso y los eventos `.14` y `.15`.

## Edificios (5 cadenas, niveles en las eras 1, 3 y 5; cada nivel deja obsoleto al anterior)
| Cadena | Para qué | Límite |
|---|---|---|
| Terrazas (`gj_ank_terraza_*`) | Comida (+7,5 / +10 / +16,5 % local) y tope de población. El nivel 3 sigue por debajo de las terrazas andinas del juego base (+25 %). | Solo colinas, mesetas y montañas. Consume piedra y herramientas. |
| Observatorio (`gj_ank_observatorio_*`) | Alfabetización, influencia cultural y crecimiento de instituciones (hasta +25 %, por debajo de la universidad del juego base, +33 %). | Tope por país de 2, 3 y 4 según el nivel. Solo en ciudades. Caro de mantener (papel, libros y cristal). |
| Casa de la Cuerda (`gj_ank_cuerda_*`) | Control máximo, suministros y migración. | Solo donde hay caminos (control máximo +0,05, +0,08 y +0,10 por nivel). Sube el cupo de Honderos y de Porteadores. |
| Fuerte del Paso (`gj_ank_paso_*`) | Defensa local y guarnición; el nivel 3 desgasta al enemigo. Sube el cupo de Guardianes. | Solo montaña. Tope por país de 3, 5 y 7. Caro (armas y piedra). Nivel 3 recortado en la ronda de reparación: defensa local 0,30 y guarnición 0,15. |
| Cantería (`gj_ank_canteria_*`) | Eficiencia de construcción y piedra (el nivel 3 también mármol). | Tope por país de 2, 3 y 4. |

## Unidades (3 líneas × 6 eras, sobre la plantilla de cada era)
| Línea | Fuerza | Debilidad y límite |
|---|---|---|
| Guardianes del Paso (infantería pesada) | -10 % de daño recibido en fuerza, -5 % en moral, +15 % de combate en montaña (+10 % colinas y mesetas) | -15 % en llanura y -5 % de velocidad. Cupo: 3 + niveles de Fuerte del Paso. |
| Honderos del Sol (infantería ligera) | +10 % de daño causado, +10 % de combate en montaña y colinas | +10 % de daño recibido y -10 % en llanura. Cupo: 4 + niveles de Casa de la Cuerda. |
| Porteadores de la Cuerda (auxiliar) | -20 % de desgaste, -15 % de peso de suministro | +20 % de daño recibido (no combaten). Cupo: 2 + niveles de Casa de la Cuerda. |

Ninguna pasa del +15-20 % en 1 o 2 valores frente a la del juego base de su era, y todas llevan debilidad y cupo.

## Ficheros (bajo `in_game/` y `main_menu/`)
- `common/advances/gj_ankaru_avances.txt`
- `common/government_reforms/gj_ankaru_reformas.txt`
- `common/cultures/gj_ankaru_cultura.txt`, `common/culture_groups/gj_ankaru_grupo.txt`, `common/languages/gj_ankaru_lengua.txt`
- `common/building_types/gj_ankaru_edificios.txt`
- `common/unit_types/gj_ankaru_unidades.txt`, `common/unit_families/gj_ankaru_familias.txt`, `common/script_values/gj_ankaru_valores.txt`
- `common/decisions/gj_ankaru_decisiones.txt`
- `common/scripted_effects/gj_ankaru_efectos.txt`, `common/on_action/gj_ankaru_on_action.txt`
- `events/gj_ankaru_eventos.txt`
- `common/static_modifiers/gj_ankaru_modificadores.txt`, `common/named_colors/gj_ankaru_colores.txt`
- `localization/spanish/gj_ankaru_l_spanish.yml` (UTF-8 con BOM)
- `IDENTIDAD.md`, `NECESITA.md`, `RESUMEN.md`

## Comprobaciones hechas
- Llaves equilibradas en los 15 ficheros de script: sí.
- Todos los modificadores usados existen en la definición de modificadores del juego base: sí (0 desconocidos). Los valores con nombre (`*_bonus`, `*_penalty`, `*_employment`, tiempos de construcción) existen en los valores base; los 5 `*_construction` están en los costes de construcción del juego base.
- Cada clave visible tiene su localización (avances, reformas, edificios con su mantenimiento, unidades, familias, modificadores, decisiones, cultura, grupo, lengua, eventos y opciones, tooltips y razones): 0 faltan.
- No hay etiquetas de país, ids de location ni rutas de disco.
- Todos los ficheros de script y la localización van en UTF-8 con BOM, como el juego base.

## Lo que falta o no se ha podido probar
- Nada de esto se ha cargado en el juego (el encargo prohíbe ejecutarlo). La lista de pruebas pendientes está en `NECESITA.md`.
- No hay situación ni desastre propios: el calendario es estado de país. Se puede añadir una situación después si se quiere un mapa de color o votaciones.
- Faltan los iconos propios (los de avances y edificios reutilizan los del juego base) y la bandera.
- Faltan misiones y formables propios: el piso de «Suecia» pide 1 o 2 paquetes de misiones atados al país, y el juego base no tiene un formato de misión por país, así que quedan para la integración.
