# Estado: el mundo v3 (35CL)

`mod/gj_nuevo_mundo` es la copia instalada para jugar sobre el mundo «RNW: Custom world 35CL» (`rnw_exp_world_35clmr62cr`, de `mundo/mundo-35cl.rnworld`). Su huella de montaje es `a6d9b3756aa24429`: dos montajes seguidos, y en dos PC distintos, dan los mismos bytes. El comprobador pasa con 0 errores y **el juego lo carga hasta el menú sin ningún error del mod en `error.log`** (21-11, EU5 1.4.9). Cómo jugarlo está en `docs/como-jugar.md`.

## Qué cambia del v2 al v3 (21-11, rama `javier/pulido`)
- **Muchos más países y más pequeños.** Nadie absorbe a nadie: los 130 países de RNW siguen en el mapa. Antes las 12 facciones se quedaban su zona entera (72,5 % del mapa entre unos 70 países).
- **Los árboles 3D y el suelo siguen a la vegetación** (`herramientas/exporta-3d.mjs`, mod local aparte).
- **259 errores que el juego sacaba al cargar el mod, arreglados** en las partes (ver abajo).
- **Las herramientas funcionan en un clon limpio:** faltaba `mapa/png.mjs` en el repo; ahora es `herramientas/png.mjs`.

## El reparto de tierra
Un efecto de `on_game_start` (`gj_reparte_tierra`) reparte tierra libre de RNW. Lo calcula `herramientas/reparte-tierra.mjs`:

1. **Cada facción crece dentro de su zona del dibujo hasta el 25 % de ella** (mínimo 30 localizaciones), desde su tierra. Antes se asegura un pie de 5 localizaciones en cada sub-zona `gj_zona_*` de su zona, porque sus mecánicas la piden (los cuatro clanes de Kaïvan). Si se le acaba la tierra libre que toca, se queda con menos: no se siembran trozos sueltos (Thalassar y la Liga están rodeadas de estados de RNW).
2. **Los demás países crecen por turnos**, una localización cada uno, sobre la tierra libre que tocan, hasta una talla que sale de su tag: el 45 % de 8-18 localizaciones, el 40 % de 20-50 y el 15 % de 55-110.
3. La tierra que nadie alcanza queda **libre para colonizar**.
4. Los pops de la tierra que gana una facción pasan a su cultura y su fe (`gj_fundar_faccion`); los de la que gana otro país, a la cultura y la fe de ese país.

**Tierra con dueño al empezar: 48,5 %** del Nuevo Mundo (2.878 de 5.932 localizaciones; RNW deja un 22,0 %), entre **130 países**:

| Tamaño (localizaciones) | Países |
|---|---|
| 1-5 | 47 |
| 6-15 | 41 |
| 16-45 | 23 |
| 46-90 | 13 |
| 91 o más | 6 |

Los 47 de 1-5 son ciudades-estado de RNW encerradas entre vecinos: no tienen tierra libre que tocar.

| Facción | Localizaciones al empezar | En su zona | De su zona |
|---|---|---|---|
| Kaïvan | 272 | 228 | 25 % |
| Ankarú | 218 | 114 | 25 % |
| Orunmar | 146 | 146 | 25 % |
| Ostrevar | 119 | 119 | 25 % |
| Velathi | 98 | 98 | 25 % |
| Durnhal | 76 | 75 | 25 % |
| Liga de las Mil Lagunas | 74 | 64 | 18 % |
| Skarren | 72 | 71 | 25 % |
| Sorava | 57 | 51 | 25 % |
| Thalassar | 49 | 39 | 14 % |
| Marea Negra | 41 | 21 | 21 % |
| Hrímval | 40 | 39 | 25 % |

- **Capitales en su zona.** Una facción con la capital fuera de su zona la pasa (`set_capital`) a su localización de la zona más cercana al centro: Ankarú, Hrímval, Kaïvan y Marea Negra.
- **Mandos**, en `herramientas/reparte-tierra.mjs`: `FRACCION_FACCION` (0,25), `FACCION_MINIMO` (30), `MINIMO_SUBZONA` (5) y `TALLAS`. Sin tope de talla el reparto llegaría al 78,6 %, pero con pocos países enormes.

## Vegetación mezclada
Se reescribe la vegetación de cada localización en una copia de `in_game/map_data/location_templates.txt` del mundo (solo cambia el valor de `vegetation`). Es determinista: un ruido por posición, mezclado con lo que traía RNW y limitado por lo que el clima admite en el juego base. Hay cultivos alrededor de las capitales. Cambian 3.607 localizaciones.

| Tipo | Antes | Después | Mancha mayor antes | Después |
|---|---|---|---|---|
| grasslands | 36,5 % | 29,5 % | 327 | 29 |
| desert | 18,2 % | 6,1 % | 416 | 19 |
| woods | 15,3 % | 24,8 % | 121 | 28 |
| jungle | 12,5 % | 6,2 % | 179 | 25 |
| forest | 11,0 % | 14,8 % | 59 | 29 |
| sparse | 6,4 % | 17,7 % | 29 | 29 |
| farmland | 0,0 % | 1,0 % | 0 | 8 |
| arbolado junto | 38,9 % | 45,7 % | 197 | 50 |

En las zonas de las facciones del sur, el desierto baja del 30,4 % al 5,9 %. El terreno (topography) no se toca.

## Árboles 3D y suelo (`herramientas/exporta-3d.mjs`)
Los árboles (`gfx/map/map_objects`) y las bandas de material del suelo (`gfx/terrain2/decals/*_materials.*`) los precalcula RNW con su vegetación. `exporta-3d.mjs` vuelve a correr la generación de RNW del mismo mundo dándole la nuestra (opción (b) de `docs/estudio-3d.md`) y deja un mod local, **«GJ Nuevo Mundo: gráficos»** (`gj_nuevo_mundo_graficos`), solo con esos ficheros: 108 ficheros, unos 825 MB, que **no van a git**. Cada jugador lo genera en su PC (10-15 min, 8 GB de RAM libres, juego cerrado; usa el Python que trae RNW, no hay que instalar nada).

Comprobado el 21-11:
- Todo lo demás del mundo sale byte a byte igual; si no, el guion para sin instalar nada.
- Dos pasadas dan los mismos bytes. Huella de los gráficos: `12555ea8e1ff3c91`.
- RNW no adelgaza los árboles (`density_scale_permille` = 1000) y no queda ninguna localización sin bioma.
- El juego carga con el mod activo, sin errores suyos.

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

## Pendiente
1. **Probar en partida.** Nada de lo de abajo se ha visto todavía con una partida empezada.
2. **Afinar el reparto** si el mapa no es el buscado: con 130 países de RNW no se llena más sin hacerlos grandes. Para más países habría que crearlos (etiquetas nuevas), que es otro trabajo.
3. **La capital de Kaïvan** cae en la estepa baja y `partes/kaivan/IDENTIDAD.md` la quiere en la alta.
4. **Thalassar** empieza sin puertos en `gj_zona_mar_interior`: «dominar el mar» pasa a ser un objetivo de expansión.

## Lo que no se ha probado en partida
- `change_location_owner` (1.575 localizaciones) y `set_capital` (4) en `on_game_start`: tiempo de carga, control, estamentos. El cambio de cultura y fe de los pops de la tierra repartida.
- Cómo se ven la vegetación mezclada, los árboles y el suelo en el mapa.
- La suma de control entre dos PC, con y sin el mod de gráficos (RNW marca como no probado si esos ficheros entran en ella).
- Los eventos y mecánicas en marcha: el registro solo se ha mirado hasta el menú principal.
