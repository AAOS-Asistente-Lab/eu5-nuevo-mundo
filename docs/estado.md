# Estado: el mundo v2 (35CL)

`mod/gj_nuevo_mundo` es la copia instalada para jugar sobre el mundo «RNW: Custom world 35CL» (`rnw_exp_world_35clmr62cr`, de `mundo/mundo-35cl.rnworld`). Su huella de montaje es `2576e62ea46bef92`: dos montajes seguidos dan los mismos bytes. El comprobador pasa con 0 errores. Cómo jugarlo está en `docs/como-jugar.md`.

## Qué hace el v2
- **Facciones en su zona.** Las 12 facciones toman cada una un país de RNW dentro de su zona del dibujo (`mundo/zonas.png`); el mapa encaja con el dibujo en un 99,4 %.
- **Tierra con dueño al empezar: 72,5 %** del Nuevo Mundo (4.301 de 5.932 localizaciones; RNW deja un 22,0 %). Un efecto de `on_game_start` (`gj_reparte_tierra`) hace que cada facción absorba los estados de RNW con la capital en su zona y le da la tierra libre de la zona, creciendo desde la suya. Los menores grandes crecen a la mitad y los pequeños siguen como ciudades-estado. Los pops de la tierra nueva pasan a la cultura y la fe de la facción.

  | Facción | Localizaciones al empezar |
  |---|---|
  | Kaïvan | 866 |
  | Orunmar | 510 |
  | Ankarú | 443 |
  | Ostrevar | 408 |
  | Velathi | 398 |
  | Liga de las Mil Lagunas | 290 |
  | Durnhal | 266 |
  | Skarren | 256 |
  | Thalassar | 226 |
  | Sorava | 185 |
  | Hrímval | 137 |
  | Marea Negra | 105 |

- **Capitales en su zona.** Una facción con la capital fuera de su zona la pasa (`set_capital`) a su localización de la zona más cercana al centro. En el v2 son Ankarú, Hrímval, Kaïvan y Marea Negra.
- **Vegetación mezclada.** Se reescribe la vegetación de cada localización en una copia de `in_game/map_data/location_templates.txt` del mundo (solo cambia el valor de `vegetation`). Es determinista: un ruido por posición, mezclado con lo que traía RNW y limitado por lo que el clima admite en el juego base. Ninguna mancha de un tipo pasa de 30 localizaciones seguidas (el desierto, de 20); lo arbolado junto (bosque claro, bosque y selva), de 50. Hay cultivos alrededor de las capitales. Cambian 3.589 localizaciones.

  | Tipo | Antes | Después | Mancha mayor antes | Después |
  |---|---|---|---|---|
  | grasslands | 36,5 % | 30,0 % | 327 | 30 |
  | desert | 18,2 % | 5,6 % | 416 | 20 |
  | woods | 15,3 % | 24,6 % | 121 | 28 |
  | jungle | 12,5 % | 6,5 % | 179 | 25 |
  | forest | 11,0 % | 13,4 % | 59 | 30 |
  | sparse | 6,4 % | 17,1 % | 29 | 28 |
  | farmland | 0,0 % | 2,8 % | 0 | 9 |
  | arbolado junto | 38,9 % | 44,5 % | 197 | 50 |

  En las zonas de las facciones del sur, el desierto baja del 30,4 % al 5,6 %. El terreno (topography) no se toca, porque sale del relieve.

## Pendiente
1. **Pocos países y demasiado grandes.** Al empezar, casi todo el Nuevo Mundo es de las facciones y de unos pocos menores, y varias facciones arrancan ya como imperios. Se busca un mapa poblado por muchos más países, la mayoría medianos y pequeños, con algún país grande. Las vías probables, en `herramientas/reparte-tierra.mjs`: bajar la absorción y el relleno (`OBJETIVO`, `PESO_MENOR`, `MENOR_MINIMO`) o repartir la tierra libre entre más países de RNW en vez de dársela a la facción.
2. **El 3D no sigue a la vegetación.** El juego usa la vegetación nueva, pero los árboles en 3D (`gfx/map/map_objects/*.bin`) y las bandas de material del suelo (`gfx/terrain2/decals/*_materials.bin`) son ficheros que RNW precalcula al generar el mundo. En el mapa siguen viéndose las manchas viejas (grandes selvas y desiertos). El estudio completo está en `docs/estudio-3d.md`.

### Plan del 3D (resumen de `docs/estudio-3d.md`)
- **Recomendado: volver a correr la exportación de RNW con nuestra vegetación**, solo para el suelo y los árboles. Un guion de unas 100 líneas sustituye las dos funciones de RNW que pasan la vegetación al suelo y a los árboles, y llama a su exportación con la misma semilla y ajustes del mundo. Tarda unos 9 minutos, pide 8 GiB de RAM libres y un CPython 3.12 (o el Python del propio RNW).
  - Sale determinista: la semilla y las densidades son las de RNW, así que cada jugador corre el mismo guion y obtiene los mismos bytes.
  - Los ficheros que salen ocupan unos 830 MB por versión (uno de 73,5 MB), así que **no van a git**: al repo va solo el guion y sus instrucciones, y cada jugador genera los ficheros en un mod local aparte que carga detrás de GJ Nuevo Mundo.
  - Riesgos: usa la API interna de RNW (una actualización del Workshop puede romperlo, así que hay que congelar RNW 1.2.2 y la build del juego); el número de árboles tiene un tope y, si se pasa, RNW adelgaza todos por igual; no está probado si esos ficheros entran en la suma de control.
- **De reserva: podar nosotros los árboles** de los `.bin` en las localizaciones que la mezcla dejó sin bosque ni selva (medio día, guion en Node, determinista). Recorta las manchas grandes, pero no añade árboles nuevos.
- **Sin hacer nada,** según RNW el suelo ya debería seguir en parte a la vegetación nueva, pero los árboles no.

## Lo que no se ha probado en partida
- La absorción, `change_location_owner` y `set_capital` en `on_game_start` con unos 3.000 cambios (tiempo de carga, control, estamentos).
- Cómo se ve la vegetación mezclada en el mapa (el suelo y los árboles van aparte, ver arriba).
- La suma de control entre dos PC con el v2.
