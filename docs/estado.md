# Estado: el mundo v3 (35CL)

`mod/gj_nuevo_mundo` es la copia instalada para jugar sobre el mundo «RNW: Custom world 35CL» (`rnw_exp_world_35clmr62cr`, de `mundo/mundo-35cl.rnworld`). Su huella de montaje es `929ee71d517fa233`: dos montajes seguidos, y en dos PC distintos, dan los mismos bytes. El comprobador pasa con 0 errores, **el juego lo carga sin ningún error del mod en `error.log`** y **una partida empieza y corre** (21-11, EU5 1.4.9, Durnhal, de abril a julio de 1337). Cómo jugarlo está en `docs/como-jugar.md`.

## Qué cambia del v2 al v3 (21-11, rama `javier/pulido`)
- **Muchos más países, más pequeños y cada uno de una pieza.** Nadie absorbe a nadie: los 130 países de RNW siguen en el mapa. Antes las 12 facciones se quedaban su zona entera (72,5 % del mapa entre unos 70 países). RNW trae 31 países partidos en varios trozos; ahora no queda ninguno.
- **Los árboles 3D y el suelo siguen a la vegetación** (`herramientas/exporta-3d.mjs`, mod local aparte).
- **259 errores que el juego sacaba al cargar el mod, arreglados** en las partes (ver abajo).
- **Las herramientas funcionan en un clon limpio:** faltaba `mapa/png.mjs` en el repo; ahora es `herramientas/png.mjs`.

## El reparto de tierra
Un efecto de `on_game_start` (`gj_reparte_tierra`) deja el mapa repartido antes de elegir país (la pantalla de selección ya lo enseña). Lo calcula `herramientas/reparte-tierra.mjs`. Regla de Javier (21-11): **un país no puede estar partido en trozos sueltos por el continente.**

1. **Cada país se queda solo con su núcleo.** La facción, su trozo con más tierra en su zona del dibujo; los demás, el trozo de su capital.
2. **Cada facción crece desde su núcleo, dentro de su zona, hasta el 25 % de ella** (mínimo 30 localizaciones), tomando siempre la localización que toca más cerca del centro de la zona: sale una mancha compacta. Primero la tierra sin dueño; si no le llega, la de los estados de RNW de su zona, nunca su capital. Si la zona viene en varios trozos (lagos, estrechos, islas) y en el del núcleo no cabe, la facción se muda al trozo más grande (la Liga y Sorava).
3. **Los demás países crecen por turnos**, una localización cada uno, la libre que tocan más cerca de su capital, hasta una talla que sale de su tag: el 45 % de 8-18 localizaciones, el 40 % de 20-50 y el 15 % de 55-110.
4. **Los trozos sueltos que nadie ha tomado se abandonan** (`abandon_location`: quedan sin dueño), igual que la tierra que nadie alcanza: es **tierra libre para colonizar**.
5. Los pops de la tierra que gana una facción pasan a su cultura y su fe (`gj_fundar_faccion`); los de la que gana otro país, a la cultura y la fe de ese país.

**Tierra con dueño al empezar: 40,9 %** del Nuevo Mundo (2.426 de 5.932 localizaciones; RNW deja un 22,0 %), entre **130 países, ninguno partido** (`node herramientas/comprueba-trozos.mjs --mundo <carpeta>` lo cuenta):

| Tamaño (localizaciones) | Países |
|---|---|
| 1-5 | 56 |
| 6-15 | 33 |
| 16-45 | 26 |
| 46-90 | 10 |
| 91 o más | 5 |

Los de 1-5 son ciudades-estado de RNW encerradas entre vecinos o dentro de una facción: no tienen tierra libre que tocar.

| Facción | Localizaciones al empezar | En su zona | De su zona |
|---|---|---|---|
| Kaïvan | 253 | 228 | 25 % |
| Orunmar | 146 | 146 | 25 % |
| Ostrevar | 119 | 119 | 25 % |
| Ankarú | 114 | 114 | 25 % |
| Velathi | 98 | 98 | 25 % |
| Liga de las Mil Lagunas | 88 | 88 | 25 % |
| Thalassar | 78 | 68 | 25 % |
| Durnhal | 75 | 75 | 25 % |
| Skarren | 71 | 71 | 25 % |
| Sorava | 51 | 51 | 25 % |
| Hrímval | 39 | 39 | 25 % |
| Marea Negra | 21 | 21 | 21 % |

- **Capitales en su zona.** Una facción que pierde su capital o la tiene fuera de su zona la pasa (`set_capital`) a su localización más cercana al centro de la zona. Son 9 de las 12 (la lista está en `docs/vinculo-mundo.md`).
- **Marea Negra** se queda en 21: su zona son islas y el trozo mayor no da más.
- **Mandos**, en `herramientas/reparte-tierra.mjs`: `FRACCION_FACCION` (0,25), `FACCION_MINIMO` (30) y `TALLAS`. Subir `TALLAS` llena más el mapa a costa de países más grandes.

## Vegetación mezclada
Se reescribe la vegetación de cada localización en una copia de `in_game/map_data/location_templates.txt` del mundo (solo cambia el valor de `vegetation`). Es determinista: un ruido por posición, mezclado con lo que traía RNW y limitado por lo que el clima admite en el juego base. Hay cultivos alrededor de las capitales. Cambian 3.593 localizaciones.

| Tipo | Antes | Después | Mancha mayor antes | Después |
|---|---|---|---|---|
| grasslands | 36,5 % | 28,9 % | 327 | 29 |
| desert | 18,2 % | 6,3 % | 416 | 20 |
| woods | 15,3 % | 25,2 % | 121 | 28 |
| jungle | 12,5 % | 6,3 % | 179 | 25 |
| forest | 11,0 % | 14,8 % | 59 | 29 |
| sparse | 6,4 % | 17,6 % | 29 | 29 |
| farmland | 0,0 % | 1,0 % | 0 | 8 |

En las zonas de las facciones del sur, el desierto baja del 30,4 % al 6,1 %. El terreno (topography) no se toca.

## Árboles 3D y suelo (`herramientas/exporta-3d.mjs`)
Los árboles (`gfx/map/map_objects`) y las bandas de material del suelo (`gfx/terrain2/decals/*_materials.*`) los precalcula RNW con su vegetación. `exporta-3d.mjs` vuelve a correr la generación de RNW del mismo mundo dándole la nuestra (opción (b) de `docs/estudio-3d.md`) y deja un mod local, **«GJ Nuevo Mundo: gráficos»** (`gj_nuevo_mundo_graficos`), solo con esos ficheros: 108 ficheros, unos 825 MB, que **no van a git**. Cada jugador lo genera en su PC (10-15 min, 8 GB de RAM libres, juego cerrado; usa el Python que trae RNW, no hay que instalar nada).

Comprobado el 21-11:
- Todo lo demás del mundo sale byte a byte igual; si no, el guion para sin instalar nada.
- Dos pasadas dan los mismos bytes. Huella de los gráficos: `fc42a7df0ea4b950`.
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

## Visto en partida (21-11, Durnhal, abril-julio de 1337)
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
1. **Decidir cuánto se llena el mapa.** Con países de una pieza queda el 40,9 % con dueño. Es un mando (`TALLAS`), y hay 56 ciudades-estado de 1-5 localizaciones.
2. **Los cuatro clanes de Kaïvan** piden tierra de la facción en cada cuarto de su zona; con la mancha compacta puede faltarle alguno al empezar (antes tenía la zona entera). Hay que mirarlo en `partes/kaivan`.
3. **Thalassar** puede empezar sin puertos en `gj_zona_mar_interior`: «dominar el mar» pasa a ser un objetivo de expansión.
4. **Nombres con el rango delante:** la selección de país enseña «County of Kaïvan» o «Theocracy of High Kingdom of Ostrevar».

## Lo que no se ha probado
- Más de cuatro meses de partida, ni otra facción que Durnhal.
- La suma de control entre dos PC, con y sin el mod de gráficos (RNW marca como no probado si esos ficheros entran en ella).
- Qué pasa con los pops y los edificios de la tierra abandonada.
