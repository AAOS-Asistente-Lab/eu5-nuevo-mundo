# Estado: el mundo v4 (SBMN)

`mod/gj_nuevo_mundo` es la copia instalada para jugar sobre el mundo «RNW: Custom world SBMN» (`rnw_exp_world_sbmnl6s3sw`, de `mundo/mundo-sbmn.rnworld`). Su huella de montaje es `dc3d90eec16205e9`: dos montajes seguidos dan los mismos bytes. El comprobador pasa con 0 errores. Cómo jugarlo está en `docs/como-jugar.md`. Lo visto en partida está más abajo.

## Qué cambia del v3 al v4 (21-11, rama `javier/pulido`; lo pidió Javier tras ver el v3 en partida)
- **La tierra es más ancha y los mares interiores, más pequeños.** El dibujo se ensancha con `herramientas/ensancha-tierra.mjs` (`docs/mapa.md` §7): la tierra pasa del 16,0 % al 20,3 % de la hoja y el mar entre Durnhal y Ostrevar se queda en el 42 % de lo que era, con penínsulas. La forma de los continentes es la misma. **El mundo es otro** (SBMN en vez de 35CL): hay que volver a generarlo y cambiarlo en la colección.
- **Más tierra y más países:** 7.533 localizaciones de tierra (antes 5.932) y 194 países (antes 130).
- **Los 15 menores con nombre ya están en el mapa**, cada uno en su zona del dibujo, con su nombre, color, cultura y fe (antes tenían contenido pero ningún país). Lista en `docs/vinculo-mundo.md`.
- **Queda libre el 39,4 % de la tierra** (antes el 60,8 %): Javier pidió alrededor del 40 %.

## Qué cambia del v2 al v3 (21-11, rama `javier/pulido`)
- **Muchos más países, más pequeños y cada uno de una pieza.** Nadie absorbe a nadie: los 130 países de RNW siguen en el mapa. Antes las 12 facciones se quedaban su zona entera (72,5 % del mapa entre unos 70 países). RNW trae 31 países partidos en varios trozos; ahora no queda ninguno.
- **Los árboles 3D y el suelo siguen a la vegetación** (`herramientas/exporta-3d.mjs`, mod local aparte).
- **259 errores que el juego sacaba al cargar el mod, arreglados** en las partes (ver abajo).
- **Las herramientas funcionan en un clon limpio:** faltaba `mapa/png.mjs` en el repo; ahora es `herramientas/png.mjs`.

## El reparto de tierra
El arranque va en dos tiempos. En `on_game_start` (`gj_integracion_arranque`) entran los bienes y el nombre y el color de cada facción, y la pantalla de selección ya los enseña; las ciudades y los pueblos van en la copia de `main_menu/setup/1337/07_cities_and_buildings.txt`, con su `town_setup`. Después del lobby (`gj_integracion_inicio`, una sola vez por partida) entran la tierra (`gj_reparte_tierra`) y la cultura y la fe: antes no hay pops del setup, y la tierra cambiada se quedaría con pops de otro dueño (error.log, `country_manager.cpp:375`). Lo calcula `herramientas/reparte-tierra.mjs`. Regla de los jugadores (21-11): **un país no puede estar partido en trozos sueltos por el continente.**

1. **Cada país se queda solo con su núcleo.** La facción, su trozo con más tierra en su zona del dibujo; los demás, el trozo de su capital.
2. **Los 15 menores con nombre crecen primero**, alrededor de su capital, hasta una talla de 22 a 40 localizaciones (`TALLA_MENOR`). El que no tiene tierra en su zona del dibujo, o está encerrado, se muda a ella: empieza en la tierra libre de su zona (6 de los 15). No toman tierra de la zona de una facción que no sea su vecina, y ninguna facción les quita la suya.
2b. **Cada facción crece desde su núcleo, dentro de su zona, hasta el 25 % de ella** (mínimo 30 localizaciones), tomando siempre la localización que toca más cerca del centro de la zona: sale una mancha compacta. Primero la tierra sin dueño; si no le llega, la de los estados de RNW de su zona, nunca su capital. Si la zona viene en varios trozos (lagos, estrechos, islas) y en el del núcleo no cabe, la facción se muda al trozo más grande (la Liga y Sorava).
3. **Los demás países crecen por turnos**, una localización cada uno, la libre que tocan más cerca de su capital, hasta una talla que sale de su tag: el 45 % de 8-18 localizaciones, el 40 % de 20-50 y el 15 % de 55-110. Si con eso no se llega al 60 % de la tierra con dueño (`CON_DUENO`), siguen creciendo todos en la misma proporción, hasta 3 veces su talla (`ESTIRON_MAXIMO`); en este mundo no ha hecho falta.
4. **Kaïvan saca un pasillo hasta cada cuarto de su zona** (las cuatro sub-zonas de los clanes: un clan solo vota si Kaïvan tiene tierra en la suya), con 8 localizaciones como mínimo en cada una (`MINIMO_SUBZONA`). El pasillo va por el camino de tierra más corto, sin soltarse del país. Si a una sub-zona solo se llega por un istmo donde está la capital de un estado de RNW, el pasillo la cruza y ese estado vuelve a empezar en la tierra libre de al lado, con capital nueva (pasaba en el v3; en el SBMN no hace falta). Durnhal hace lo mismo con su caldera.
5. **Los trozos sueltos que nadie ha tomado se abandonan** (`abandon_location`: quedan sin dueño), igual que la tierra que nadie alcanza: es **tierra libre para colonizar**.
6. Los pops de la tierra que gana una facción pasan a su cultura y su fe (`gj_fundar_faccion`); los de la que gana otro país, a la cultura y la fe de ese país.

**Tierra con dueño al empezar: 60,6 %** del Nuevo Mundo (4.566 de 7.533 localizaciones; RNW deja un 27,8 %), entre **194 países, ninguno partido** (`node herramientas/comprueba-trozos.mjs --mundo <carpeta>` lo cuenta):

| Tamaño (localizaciones) | Países |
|---|---|
| 1-5 | 56 |
| 6-15 | 52 |
| 16-45 | 67 |
| 46-90 | 9 |
| 91 o más | 10 |

Los de 1-5 son ciudades-estado de RNW encerradas entre vecinos o dentro de una facción: no tienen tierra libre que tocar.

| Facción | Localizaciones al empezar | En su zona | De su zona |
|---|---|---|---|
| Kaïvan | 283 | 283 | 25 % |
| Ostrevar | 197 | 193 | 25 % |
| Orunmar | 162 | 151 | 25 % |
| Velathi | 152 | 152 | 25 % |
| Ankarú | 135 | 135 | 25 % |
| Durnhal | 131 | 131 | 25 % |
| Liga de las Mil Lagunas | 105 | 101 | 25 % |
| Skarren | 104 | 104 | 25 % |
| Thalassar | 93 | 81 | 25 % |
| Sorava | 57 | 57 | 25 % |
| Hrímval | 40 | 40 | 25 % |
| Marea Negra | 25 | 25 | 25 % |

| Menor con nombre | Localizaciones al empezar | En su zona |
|---|---|---|
| Hansa de Isbrant | 39 | 39 |
| Concejo de Brazalmar | 38 | 31 |
| Clanes de Pakhun | 38 | 36 |
| Marca del Vigía Alto | 34 | 34 |
| Santuario de Tirnauk | 33 | 9 |
| Hermandad de Ondán | 33 | 33 |
| Marca de Sotolar | 32 | 32 |
| Clan de Hondarr | 30 | 27 |
| Capítulo de la Última Ceniza | 30 | 30 |
| Horda de los Tres Pozos | 29 | 29 |
| Señorío de Cabo Halcor | 28 | 28 |
| Clanes de la Marisma Gris | 28 | 28 |
| Cofradía de Nenvar | 27 | 27 |
| Jefatura del Yorumbe | 20 | 20 |
| Ciudad Libre de Tarnavia | 11 | 11 |

Tarnavia se queda en ciudad-estado: su zona del dibujo (el cabo de Ostrevar) viene en trozos y el mayor es una isla de 11. A Yorumbe le faltan 2 para la talla mínima: no toca más tierra libre.

- **Kaïvan en los cuatro cuartos:** estepa alta 97, estepa baja 170, marca occidental 8, valles orientales 8.
- **Capitales en su zona.** Una facción que pierde su capital o la tiene fuera de su zona la pasa (`set_capital`) a su localización más cercana al centro de la zona. Son 4 de las 12 (Hrímval, Kaïvan, la Liga y Marea Negra), más los 6 menores que se mudan lejos de su capital. La capital nueva va a la localización con más gente del país (la lista está en `docs/vinculo-mundo.md`).
- **Marea Negra** se queda en 25: su zona son islas y el trozo mayor no da más.
- **Mandos**, en `herramientas/reparte-tierra.mjs`: `FRACCION_FACCION` (0,25), `FACCION_MINIMO` (30), `TALLAS`, `TALLA_MENOR` (22-40), `CON_DUENO` (0,60) y `ESTIRON_MAXIMO` (3). Bajar `CON_DUENO` deja más tierra libre.

## Vegetación mezclada
Se reescribe la vegetación de cada localización en una copia de `in_game/map_data/location_templates.txt` del mundo (solo cambia el valor de `vegetation`). Es determinista: un ruido por posición, mezclado con lo que traía RNW y limitado por lo que el clima admite en el juego base. Hay cultivos alrededor de las capitales. Cambian 4.640 localizaciones.

| Tipo | Antes | Después | Mancha mayor antes | Después |
|---|---|---|---|---|
| grasslands | 34,0 % | 29,2 % | 359 | 28 |
| desert | 21,0 % | 7,5 % | 421 | 20 |
| woods | 15,3 % | 22,8 % | 141 | 29 |
| jungle | 11,6 % | 5,6 % | 198 | 25 |
| forest | 11,5 % | 13,5 % | 123 | 26 |
| sparse | 6,6 % | 20,5 % | 26 | 30 |
| farmland | 0,0 % | 0,9 % | 0 | 9 |

En las zonas de las facciones del sur, el desierto baja del 29,1 % al 6,3 %. El terreno (topography) no se toca.

## Árboles 3D y suelo (`herramientas/exporta-3d.mjs`)
Los árboles (`gfx/map/map_objects`) y las bandas de material del suelo (`gfx/terrain2/decals/*_materials.*`) los precalcula RNW con su vegetación. `exporta-3d.mjs` vuelve a correr la generación de RNW del mismo mundo dándole la nuestra (opción (b) de `docs/estudio-3d.md`) y deja un mod local, **«GJ Nuevo Mundo: gráficos»** (`gj_nuevo_mundo_graficos`), solo con esos ficheros: 108 ficheros, unos 876 MB, que **no van a git**. Cada jugador lo genera en su PC (10-15 min, 8 GB de RAM libres, juego cerrado; usa el Python que trae RNW, no hay que instalar nada).

Comprobado el 21-11:
- Todo lo demás del mundo sale byte a byte igual; si no, el guion para sin instalar nada.
- Huella de los gráficos del mundo SBMN: `584dd1da4dda6f8d`. Dos pasadas dan los mismos bytes, y todo lo demás del mundo sale igual que el instalado.
- RNW no adelgaza los árboles (`density_scale_permille` = 1000) y no queda ninguna localización sin bioma.
- En partida se ven los bosques en manchas pequeñas y mezcladas.

Usa funciones internas de RNW 1.2.2 (`_slot_tables` y `_pixel_classes`): una actualización de RNW puede romperlo.

## Errores del juego arreglados en las partes
La primera carga real del mod dejó 259 líneas `gj_` en `error.log` que el comprobador no veía. Arregladas en `partes/` (22 partes) y vueltas a cargar hasta dejarlo en 0:
- eventos y efectos mal cerrados (`else` dentro del `if`, llaves) en Hrímval y Cielo de los Clanes;
- efectos y triggers en el ámbito equivocado o en la carpeta equivocada (`current_age_or_later` en `main_menu/`, `add_cultural_tradition` sobre país, `has_ports`, `assault` en unidades);
- unos 110 avances que pedían un requisito de otra era (el juego lo rechaza): ahora piden uno de su misma era o ninguno;
- familias de unidades, sesgos de organización, listas de IA, tipos de mensaje, tipos e iconos de modificador y etiquetas gráficas de cultura que faltaban;
- métodos de producción ajustados al 20 % de beneficio que pide el juego;
- textos que faltaban y eventos ocultos sin título.

El comprobador (`comprueba-mod.mjs`) ya no da por malos los ficheros de `gui/`, los tipos de modificador que define el propio mod ni los textos que ya trae el juego.

## Visto en partida en el v4 (21-11, mundo SBMN, Durnhal, abril-julio de 1337)
- El juego carga el mundo y el mod; la selección de país enseña el Nuevo Mundo con el reparto (capturas: `docs/img/v4-norte.jpg` y `docs/img/v4-sur.jpg`): las facciones y los menores con su nombre y su color (Sorava, Concejo de Brazalmar, Cabo Halcor, Pakhun, Hansa de Isbrant, Hondarr…).
- Durnhal sale con 131 localizaciones, cultura durnhalí y fe de la Llama Profunda, como dice el reparto.
- La partida arranca y corre a velocidad alta de abril a julio de 1337 sin colgarse.
- `error.log` solo trae avisos de los tipos ya conocidos (abajo) y uno nuevo, inofensivo: 15 líneas «Variable 'gj_faccion_menor_…' is set but is never used» (la marca que deja `gj_fundar_faccion` en cada menor).
- **Para que el Nuevo Mundo se vea al elegir país**, el mundo tiene que hacerse con la opción de RNW «Show the New World before it is played» encendida. `genera-mundo.py` la enciende; quien lo rehaga desde la ventana de RNW tiene que tenerla marcada en los ajustes (si no, salen otros ficheros y otra suma de control).

## Visto en partida en el v3 (21-11, mundo 35CL, Durnhal, abril-julio de 1337)
- La selección de país ya enseña el reparto: Durnhal con 75 localizaciones, su nombre, cultura y fe.
- La partida arranca y corre a velocidad 5; sale el evento «Un eclipse» con título, texto y opciones en español.
- En tierra vieja de Durnhal la fe pasa al 100 %, pero la cultura solo cambia en los pops que tenían la cultura principal del país de RNW (0,7 % en la localización mirada): es lo que hace `gj_fundar_faccion` con la tierra que ya era suya.

## Avisos que el juego saca al empezar la partida (sin arreglar)
Están en `docs/avisos-partida.txt`. Salen al empezar, no al cargar el menú:
- **Edificios:** eficiencia de reclutas o marineros por encima del tope del juego (0,0125) y modificadores de mercader en edificios que no son extranjeros.
- **Culturas:** `gj_tarnavi`, `gj_isbranti` y `gj_aryuki` tienen dos etiquetas gráficas con la misma prioridad.
- **Modificadores definidos y sin usar** (7).
- «El país no tiene pops de su cultura principal»: el juego lo mira antes de que corra `gj_fundar_faccion`. Para quitarlo habría que poner la cultura y la fe en los ficheros de inicio del mundo en vez de cambiarlas al empezar.

## Pendiente
1. **Cuánto se llena el mapa: Javier (21-11, mediodía) pidió dejar libre alrededor del 40 %; queda libre el 39,4 %.** Es un mando (`CON_DUENO`), y hay 56 ciudades-estado de 1-5 localizaciones.
2. **Thalassar** puede empezar sin puertos en `gj_zona_mar_interior`: «dominar el mar» pasa a ser un objetivo de expansión.
3. **Nombres con el rango delante:** la selección de país enseña «County of Kaïvan» o «Theocracy of High Kingdom of Ostrevar».

4. **Tarnavia (11 localizaciones) y Yorumbe (20) quedan por debajo de la talla mínima de un menor (22).** La zona de Tarnavia en el dibujo (el cabo de Ostrevar, `menor-n4`) sale en trozos y el mayor es una isla de 11: o se queda en ciudad-estado, o se agranda esa zona en el dibujo.
5. **Kaïvan tiene casi el mismo color que un vecino suyo de RNW (TDS)**: en el mapa político parecen un solo país. Los colores de los estados de RNW cambian con cada mundo; el de Kaïvan es de `facciones.json`.
6. **Las capitales mudadas** van ahora a la localización con más gente del país, pero la ciudad vieja de una facción que estaba fuera de su zona (Kaïvan, la Liga) se la queda un vecino o queda libre.

## Lo que no se ha probado
- Con el mundo v4: más de cuatro meses de partida, otra facción que Durnhal, un menor jugado, los eventos de los menores.
- La suma de control entre dos PC, con y sin el mod de gráficos (RNW marca como no probado si esos ficheros entran en ella).
- Qué pasa con los pops y los edificios de la tierra abandonada.
