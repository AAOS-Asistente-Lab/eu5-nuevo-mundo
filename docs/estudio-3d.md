# Estudio de RNW: desierto y 3D (21-11)

1. Por qué sale tanto desierto

RNW no simula el clima. Copia el clima y la vegetación del Viejo Mundo vanilla con un voto de los 32 vecinos más parecidos. Los rasgos son latitud, lluvia, altura y distancia al mar, con pesos 50, 30, 25 y 10, así que la latitud es la que más pesa (`rnw/eu5_biomes.py:73,76`, `:221-237`, `:493-525`; `rnw/` es `<workshop>/3829217331/generator/site/rnw`).

- **Latitud.** Sale de la fila del mapa (`eu5_biomes.py:64-67`, `:157-168`), y el dibujo se estira a toda la altura del mapa, 8.192 filas (`eu5_canvas.py:407-408`, `landmask.py:413-417`, `eu5_nw_export.py:2892-2894`). Medí `locations.png` (16384x8192) y `land_mask.png` (2520x2048): una fila del dibujo son 4 del mapa. Por eso el cuerpo del continente sur (filas ~1460-1800 del dibujo) cae entre ~18°S y ~41°S, la franja seca del Viejo Mundo.
- **Lluvia.** Solo el mar recarga humedad; los lagos cuentan como tierra (`eu5_nw_export.py:3745-3751`).
- **Sin sorteo.** Gana siempre la clase mayoritaria (`eu5_biomes.py:452-469`), y eso exagera la mayoría: con clima arid sale desierto el 83,9 %, frente al 57,8 % en vanilla (dato de un lector).
- **Sin ajuste.** No hay ningún ajuste de clima ni de vegetación: grep sin coincidencias en `settings.py`.

Medido (en el v3, mundo 35CL): el mundo de RNW tiene 1.081 de 5.932 localizaciones en desierto (18,2 %). Nuestro `gj_nuevo_mundo` ya lo baja a 332 (5,6 %): grasslands 1782, woods 1461, sparse 1013, forest 794, jungle 386, desert 332 y farmland 164.

2. Opciones, de mejor a peor

**1. (b) Volver a correr la exportación de RNW con nuestra vegetación, solo para el suelo y los árboles (recomendada).**

Las dos únicas llamadas que pasan la vegetación al suelo y a los árboles son `_slot_tables` (`eu5_nw_export.py:3073-3076`, `:3827-3900`) y `_pixel_classes` (`:3136-3138`, `:3903-3933`). Ambas van después de identities y de los textos. Se resuelven por nombre del módulo y las etapas corren en hilos, no en procesos (`parallel.py:23,344`), así que se pueden sustituir desde un guion propio sin tocar S:. `CellBiomes` es una dataclass congelada, así que vale `dataclasses.replace` (`eu5_biomes.py:308-315`). El índice de celda es el de `plan.cells`, el mismo que usan las plantillas y el atlas (`eu5_nw_export.py:583`, `eu5_atlas.py:112`).

- **En el juego:** los árboles 3D y las bandas de material siguen nuestras manchas, de 30 localizaciones como mucho, con las densidades que RNW calibra en el Viejo Mundo y su presupuesto de objetos (`eu5_objects.py:312-351`).
  - Sigue habiendo naranja: el clima sigue siendo arid, y en arid la pradera usa sedimento naranja (`materials.txt:1535-1551`), mientras que el desierto usa arena (`:1304-1322`).
  - Pasar arid a hot_semi_arid no cambia nada a la vista, porque comparten biomas (`biomes.txt:354-355`).
- **Coste:** un guion de ~100 líneas. La exportación tarda ~9 min (522 s) y pide 8 GiB de RAM libres y ~1,4 GB temporales en W:. Hace falta un CPython 3.12 por uv, porque los módulos son cp312; si uv no lo tiene en caché, es una descarga y necesita el sí de el jugador A.
- **Tamaño:** al repo solo va el guion (unos KB). En local salen ~830 MB: `map_objects` 667,6 MB y los `*_materials` 163,1 MB.
  - No deben ir a git: son ~830 MB por versión y `jungle_dense_generator_high.txt` mide 73,5 MB (GitHub avisa a partir de 50 MB).
  - Además, son ficheros completos que llevan dentro registros vanilla.
- **Multijugador:** cada jugador corre el mismo guion sobre RNW 1.2.2 y la misma build del juego. Es determinista: la semilla sale de `derive_seed` (`eu5_objects.py:334`) y las densidades van en punto fijo (`:44`). La lógica de juego sigue solo en `location_templates`, que ya va por git.
- **Riesgos:**
  - Usa API privada de RNW: una actualización del Workshop lo rompe.
  - Hay que impedir que se escriban `.pyc` en S: (con `PYTHONPYCACHEPREFIX` en W:).
  - Más árboles pueden adelgazar todo por igual: hoy se añaden 4.524.610 instancias y el tope es 5.450.335, el 99 % de las 5.505.389 que se quitan (report.json, `density_scale_permille`=1000).

**2. (c) Escribir nosotros los .bin, en versión poda, con Node.**

Quitar los registros de árboles en las localizaciones que nuestra mezcla dejó sin bosque o selva. El formato son float32 LE, 10 por registro, y la localización sale de x y z (`eu5_objects.py:41`, `:359-361`, `:124-132`).

- **En el juego:** las manchas grandes se recortan, pero el antiguo desierto queda sin árboles ni hierba.
- **Suelo:** como en (d).
- **Coste y tamaño:** medio día y 150-250 líneas. Al repo va solo el guion; en local, ~300-450 MB.
- **Multijugador:** determinista, porque solo filtra.
- **Riesgo:** bajo. Nunca sube el número de objetos, pero los bordes pueden verse cortados en las fronteras.

Hacer un muestreo propio completo (añadir árboles o reescribir los `*_materials.bin` con LZAV) cuesta 2-4 días y es arriesgado. Además, RNW ya lo hace mejor en (b).

**3. (d) Dejarlo como está.**

- **En el juego:** según RNW, el juego resuelve el bioma de cada localización a partir de su clima, vegetación y topografía (`eu5_slots.py:3-7`, `biomes.txt:3-10`), así que el suelo ya debería pasar de arena a pradera naranja con nuestra mezcla. A cambio:
  - las bandas de borde (hueco 8) se quedan en las fronteras viejas;
  - puede salir hierba muerta en los huecos 13-15 (`eu5_slots.py:15-19`, marcado INFERRED);
  - los árboles 3D se quedan en las manchas viejas, y no hay ninguno en el antiguo desierto.
- **Coste:** 0; el mod sigue en ~7,4 MB.
- **Multijugador:** bien.

**4. (a) Bajar el desierto en origen y volver a generar.**

- No hay ningún ajuste ni clave de `world.json` que toque el clima.
- Bajar el dibujo no es posible, porque la tierra ya llega a la fila ~2020 de 2047. Subirlo mete el sur en 0-15°S, donde sale selva.
- Lo único que queda es repintar el relieve o convertir lagos en mar interior.
- **En el juego:** todo coherente y menos desierto, pero no está medido y no llegaría al nivel del Viejo Mundo.
- **Coste:** cambia el id del dibujo (`landmask.py:350-370`), así que sale un mundo nuevo con otras claves. Habría que rehacer todo `gj_nuevo_mundo` (facciones, partes, mezcla) y varias generaciones de ~9 min y 1,3 GB.
- **Tamaño en git:** igual que hoy.
- **Multijugador:** bien.
- **Riesgo:** ensayo y error.

3. Recomendación y pasos

Recomiendo (b), con (c-poda) de reserva si no hay CPython 3.12 o el jugador A dice que no a la descarga. Cambiar el clima para que se vea verde es una decisión de juego nueva: le toca a el jugador A.

1. Carga la partida y mira el sur para separar lo que es suelo de lo que son árboles, y para comprobar si el desierto que ve el jugador está en el juego o en la vista previa de RNW.
2. Comprueba la bandera `ESTOY`, que haya 8 GiB o más de RAM libres y que uv tenga CPython 3.12 (si no, pide el sí para la descarga).
3. Prepara `<ruta>`:
   - un entorno uv propio, con `UV_CACHE_DIR` y `PYTHONPYCACHEPREFIX` en W:;
   - `<ruta>` en `sys.path`, solo para leer;
   - copias de `world.json` y `land_mask.png`, desde `<carpeta del mundo>/.metadata/rnw-library` (o del `.rnworld` de `mundo/`);
   - una copia de la entrada de `cache/land`.
4. Escribe el guion:
   - lee nuestra vegetación por clave de `gj_nuevo_mundo/in_game/map_data/location_templates.txt` y las claves por celda de `atlas.json`;
   - comprueba que la vegetación del atlas coincide celda a celda con `biomes.vegetation`; si no coincide, aborta;
   - sustituye `_slot_tables` y `_pixel_classes` por envoltorios que llamen a la original con `replace(biomes, vegetation=nueva)`, dejando "" en el agua y sin desierto sobre wetlands (`eu5_biomes.py:83-85`);
   - llama a `rnw.eu5_world_export.export_world` con la semilla, los ajustes y el código de `world.json`, `land_mask`, `cache_dir` en W: y la salida en `<ruta>`.
   - Lánzalo oculto por WMI, con tope de tiempo y la salida a un log (`RNW_THREADS` bajo si existe `ESTOY`).
5. Verifica:
   - con un guion de Node, que todo lo que no sea `gfx/map/map_objects` ni `gfx/terrain2/decals/*_materials.*` sale idéntico por sha256 frente al mundo actual;
   - en `report.json`: `default_biome_locations`=0, `instances_added` por debajo de `instances_removed`, y anota `density_scale_permille`.
6. Copia solo esos ficheros de gfx a un mod local aparte (por ejemplo `gj_nuevo_mundo_graficos`, que depende de RNW y carga después), fuera de git. Haz copia antes, porque escribe en Documents.
7. Prueba en el juego: `error.log`, árboles y suelo del sur, y que no falten localizadores de combate ni de pilas de unidades.
8. Sube al repo el guion y sus instrucciones para el otro jugador, que puede usar el Python del propio RNW. Congela RNW 1.2.2 y la build del juego, y apunta en `entregas/revision-legal-pendiente.md` que el guion usa la API privada de RNW.

4. Lo que no se pudo comprobar

- En el juego, que el suelo ya siga nuestro `location_templates` (lo dice RNW, no lo he visto) y si el jugador vio el desierto en el juego o en la vista previa.
- Que el gancho funcione: no ejecuté nada. Tampoco que `_native.pyd` cargue con el CPython 3.12 de uv, si uv lo tiene en caché, ni que el resto salga byte a byte igual (es una deducción).
- Cuántas instancias pedirá nuestra mezcla. El margen hasta el tope es de 925.725; si se pasa, se adelgaza todo por igual.
- Si los ficheros gfx entran en el checksum multijugador: RNW lo marca como no probado (`eu5_export.py:83-92`, `eu5_nw_export.py:375-384`).
- Si nuestra mezcla pone desierto sobre wetlands.
- Que el desierto se concentre en el sur: lo sostienen el orden de `rnw_loc_` (inferido) y el reparto del atlas.
- El formato de los .bin byte a byte (nadie volcó bytes), el viento y la sombra de lluvia de `climate.py` (no lo releí) y la amplificación que atribuyo al argmax.
