# Random New World (RNW) 1.2.2: qué es, qué permite y cómo usarlo para la partida con el jugador B

Escrito el 2026-11-20 (última hora comprobada con `date`: 21:55:44). Solo lectura: no se ha tocado nada del juego, de los mods ni de Documents, no se ha ejecutado el generador.

Abreviaturas de rutas:
- `RNW/` = `<workshop>/3829217331/`
- `rnw/` = `RNW/generator/site/rnw/` (el código Python del generador, legible)
- `ND/` = `.../3450310/3668193813/` (National Destinies 1.4.4), `CMF/` = `.../3692202776/` (Community Mod Framework 2.5.0), `REAI/` = `.../3721031562/` (REAI: Rational Empire AI 1.4.2), `AAMO/` = `.../3723654962/` (REAI: Armies, Armadas & Manpower 1.4.1)
- `DOCS/` = `<documentos>/`
- `GAME/` = `<juego>/`

## Lo esencial

1. **RNW no es un mod que se juega: es un programa externo.** El ítem del Workshop es un "hub" con un generador para Windows (Python 3.12 embebido, un núcleo en Rust y una ventana Tauri o Qt). Escribe un mod estático y aparte, `mod/rnw_exp_world_…`, en el perfil del juego. Ese mod es el que se activa en el playset. El hub no se activa (`RNW/.metadata/metadata.json:6`; `METADATA:147`, `:176`).
2. **Se aleatoriza la geometría entera del Nuevo Mundo, y solo la del Nuevo Mundo.** Cambia costas, mares interiores, lagos, montañas, ríos, clima, biomas, recursos, localizaciones, provincias, pueblos y países. El Viejo Mundo queda como en vanilla (`METADATA:49`, `:51`; `rnw/eu5_nw_export.py:1-7`).
3. **Hay semilla.** Es un número de 64 bits que va en un «World Code» (`RNW1-…`) junto con el tipo de mundo, los ajustes cambiados y la versión del generador. El mismo código, el mismo juego y la misma época del generador dan los mismos ficheros, byte a byte (`rnw/app/worldcode.py:1-14`; `rnw/rng.py:22-23`, `:39-43`; `rnw/epoch.py:1-6`).
4. **Se puede dibujar el continente.** El editor de tierras pinta mar, tierra, montañas, tierras altas, llanuras y lagos, y también importa un PNG. Es la vía para lo que pide el jugador A (mares interiores, un distrito de lagos tipo Finlandia, circos de montañas). Los lagos y los mares interiores automáticos siguen las estadísticas vanilla y no forman distritos de lagos (`rnw/landmask.py:1-20`, `:78-85`; `rnw/lakes.py:4-6`, `:47`).
5. **Culturas y religiones: el generador no inventa ninguna.** Reutiliza las culturas y religiones americanas vanilla, colocadas por afinidad de clima y relieve. Los países llevan etiquetas nuevas de tres letras al azar, y los nombres salen de cadenas de Markov entrenadas con topónimos americanos vanilla (`rnw/eu5_natives.py:1-10`, `:1114-1162`, `:1385-1421`). El contenido que añade es genérico: 12 historias, unas 13 familias de formables con misiones «Road to X» y una crónica. Las facciones con sabor propio hay que hacerlas en un mod nuestro, encima del mundo.
6. **La compatibilidad tiene un conflicto real con National Destinies.** ND sustituye `AZT_f`, `INC_f` e `IRO_f` (`REPLACE:`) e inyecta `MAY_f` y `PUE_f` (`INJECT:`), que son justo los cinco formables que RNW reubica. Además, 50 ficheros de ND nombran localizaciones y provincias americanas que en un mundo RNW no existen. CMF, REAI y AAMO no chocan.
7. **Multijugador.** el jugador B necesita el mismo build de EU5 (1.4.9, build 26655995), los mismos DLC instalados, el mismo RNW (1.2.2 o la misma época), los mismos mods en el mismo orden y el mismo mundo. La vía prevista: el jugador A le pasa el `.rnworld` (unos MB, se puede compartir) o el World Code, y el jugador B genera en su PC.
8. **Estado del PC.** No se ha generado aún ningún mundo. El hub está activado en el playset aunque su autor dice que no se active. El juego cayó a las 19:54 con solo 3,5 GB de RAM libre, y generar pide unos 8 GB. En C: quedan 11,9 GB.

## 0. Estado actual (hechos comprobados)

| Hecho | Evidencia |
|---|---|
| Juego instalado: EU5 **1.4.9**, build **26655995**, rama pública | `<steam>/appmanifest_3450310.acf:13`; `DOCS/crashes/Europa Universalis V20261120_185447/meta.yml:3` |
| RNW 1.2.2 reconoce ese build: «EU5 1.4.9 public release, Steam build 26655995» | `rnw/eu5_export.py:56-69` (`KNOWN_BUILDS`) y `:156-163` (si el build es desconocido, falla salvo con `--accept-build`) |
| El README empaquetado aún dice que lo último compatible es la 1.4.7. Está desfasado: el código de 1.2.2 ya lista la 1.4.9 | `METADATA:58` frente a `rnw/eu5_export.py:66-67` |
| Ningún mundo generado: no existen `<appdata-local>/RandomNewWorld` ni `DOCS/mod/` | comprobado con `Test-Path` y un listado de `DOCS/` |
| El hub RNW está activado en el playset activo (orden: CMF, AAMO, REAI, ND, RNW; sin orden automático) | `DOCS/playsets.json:6`, `:20` |
| El autor pide no activar el hub | `RNW/.metadata/metadata.json:6` |
| Caída de EU5 a las 19:54 (hora local) con 3.574 MB de RAM disponible y los 5 mods cargados. No consta que la causara RNW | `meta.yml:11`, `:22`, `:43` |
| Generar pide unos 8 GB de RAM libre y unos minutos | `METADATA:175`, `:196` |
| Espacio libre: C: 11,9 GB, W: 40,9 GB y S: 49,3 GB. Cada mundo ocupa alrededor de 1 GB en la biblioteca y otro tanto como mod | `rnw/worldfile.py:9-11`. La biblioteca va por defecto a `<appdata-local>\RandomNewWorld` (C:), salvo que se defina `RNW_DATA`: `rnw/app/paths.py:38-56` |

## 1. Qué se aleatoriza y cómo

**Herramienta externa, no un script ni una regla de partida.** El motor compila la topología, las mallas y las curvas del mapa al cargar los mods, así que ningún script de partida puede crear relieve, ríos ni materiales (`METADATA:147`). RNW lee la instalación sin modificarla y escribe un mod normal (`METADATA:147-158`). No añade reglas de partida: en las rutas que escribe no hay `game_rules`. Lo único que se ejecuta en partida son ganchos de on_action para las historias y para revelar el mapa (sección 4).

**Qué cambia:**
- **Lienzo:** es la zona de `america` más una franja de océano. Por defecto (`expand_oceans=1`) se amplía un 65 %, a 62,5 Mpx, por el Pacífico y el Atlántico (`rnw/settings.py:95-96`; `rnw/eu5_canvas.py:1-8`, `:32-46`; `METADATA:67`). El borde del lienzo se traza solo con contornos redondos, para que ningún continente herede una costa recta (`rnw/eu5_pacific.py:6-7`).
- **Tierra:** es la parte más alta de un campo de densidad de ruido fractal. Se controla con escala, octavas, persistencia y cuota de tierra (`rnw/settings.py:75-92`). Hay siete tipos: Omerika (con la silueta general de las Américas), The Wall (una barrera de norte a sur), supercontinente, continentes, continentes pequeños, archipiélago e islas sueltas (`rnw/settings.py:356-550`; `rnw/wall.py:1-6`; `rnw/omerika.py:1-10`). Hay además un modo Caos, que sortea los ajustes (`rnw/app/worldcode.py:12`, `:130`), y uno que conserva las Américas reales y genera solo los pueblos (`keep_geography`: `rnw/settings.py:115-118`; `rnw/vanilla_world.py:1-8`).
- **Mares interiores, golfos y lagunas:** se tallan cuencas con un estrecho hacia el océano, a la manera del Báltico, el Negro o el de Azov. Su número va por superficie y no es un ajuste: `SEAS_PER_SQUARE` (`rnw/gulfs.py:1-17`, `:45`).
- **Lagos:** su tamaño y frecuencia imitan el mapa vanilla, con 11,2 lagos por millón de píxeles de tierra (el 0,78 % de la tierra) y una cola larga de tamaños. Las formas son lobuladas, con brazos e islas. La frecuencia es una constante (`RATE_PERMILLE`), no un ajuste; `max_lake_px` y `min_lake_px` sí se ajustan (`rnw/lakes.py:1-18`, `:47`).
- **Montañas:** salen de un relieve continuo y llevan los sellos de erosión de las montañas vanilla, girados a lo largo de cada cordillera (`rnw/eu5_mountains.py:1-12`). Según `METADATA:68`, hay cordilleras ramificadas con pasos.
- **Clima:** la lluvia sigue vientos zonales (alisios, ponientes y vientos polares), con sombra de lluvia tras las cordilleras (`rnw/climate.py:1-9`). El clima y la vegetación de cada localización salen de un voto entre vecinos de localizaciones del Viejo Mundo con estos pesos: latitud 50, lluvia 30, altura 25 y distancia al mar 10. Después se suaviza por adyacencia (`rnw/eu5_biomes.py:1-12`, `:75-79`). Pesa sobre todo la latitud, aunque el relieve y la continentalidad lo rompen algo. No hay ningún ajuste de clima: los parámetros de lluvia son constantes (`rnw/eu5_biomes.py:68-70`).
- **Jerarquía:** se conservan las claves vanilla de subcontinentes, regiones y áreas, colocadas por posición y parecido. Las provincias y las localizaciones son nuevas (`rnw/eu5_newworld.py:3-12`; `rnw/eu5_regionkeys.py:1-13`).
- **Pueblos:** se simulan 300 años de prehistoria (1037-1337) que dejan estados, tribus, alianzas, vasallos y opiniones (`METADATA:71`). La sociedad se forma por focos agrícolas y coste de viaje (`rnw/societies.py:1-10`). Hay arquetipos excepcionales: grandes imperios, ligas marítimas, confederaciones de montaña, reinos fracturados y centros sagrados (`rnw/archetypes.py:1-26`; `rnw/eu5_empires.py:1-22`).

**Semilla y capas:** la semilla es de 64 bits, en el rango [0, 2^64) (`rnw/rng.py:22-23`, `:39-43`). Si no se da, se sortea con una fuente segura (`rnw/app/worldcode.py:173-175`). Un mundo tiene tres capas, tierra, recursos y pueblos, cada una con su semilla. Los recursos y los pueblos se pueden volver a tirar sin tocar la tierra (`rolls`: `rnw/layers.py:1-16`; `rnw/settings.py:191-195`).

**Reproducibilidad:** dos versiones de la misma época del algoritmo dan mods idénticos byte a byte con los mismos ajustes, semilla y ficheros del juego; solo cambia `.metadata` (`rnw/epoch.py:1-6`). Se registran como entradas todos los ficheros del juego que el proceso abre, con su hash (`rnw/inputs.py:1-15`). Además se toma una huella de los 10 ficheros del «contrato del mapa» (`rnw/contract.py:12-23`).

## 2. Qué se puede configurar y con qué límites

Todo son enteros (en tantos por mil o en píxeles) que viajan en el World Code (`rnw/app/worldcode.py:44-122`). Los límites duros están en `rnw/settings.py:297-355`. Los de la ventana, que el autor considera jugables, están en `rnw/app/controls.py:107-169`.

| Grupo | Ajuste (ventana) | Rango en la ventana | Notas |
|---|---|---|---|
| Tierra | `land_permille` (cuota de tierra) | 15-60 % | por defecto 34 % en continentes y 46 % en supercontinente |
| Tierra | `feature_px` (escala de los continentes) | 250-4000 px | cuanto más grande, menos masas y más gruesas |
| Tierra | `min_island_px`, `octaves`, `persistence` | 100-8000 px; 5-8; 0,40-0,65 | detalle de costa e islas |
| Tierra | `centre_permille` | 0-100 % | aleja la tierra de las costas del Viejo Mundo y la concentra en el centro (`rnw/newworld.py:61-65`) |
| Tierra | `max_lake_px` | 1000-60000 px | tamaño máximo de un lago; la frecuencia no se toca |
| Tierra | `wasteland_permille` | 0-20 % | tierra yerma |
| Mapa | `location_px` (tamaño de localización) | 40-90 px | la densidad: menos px, más localizaciones |
| Mapa | `province_size` (localizaciones por provincia) | 3-10 | |
| Mapa | `sea_zone_px` | 80-240 px | |
| Mapa | `expand_oceans`, `reveal_at_start`, `keep_geography` | sí o no | |
| The Wall | ancho, posición, costa, cresta, huecos | (`rnw/app/controls.py:108-120`) | no se combina con un dibujo ni con Omerika (`rnw/settings.py:638-649`) |
| Pueblos | población ×0,25-3; % de estados; dispersión; tamaño medio de estado 2-10; focos 2-12 por 10.000; cultura cada 5-40 localizaciones; religión cada 20-200; tribu cada 4-15; turbulencia; imperios 0-100 %; pico de campesinos 30-80 % | (`rnw/app/controls.py:140-161`) | `religion_locations` y `culture_locations` regulan la diversidad |
| Recursos | 34 materias primas ×0-3 cada una, y metales preciosos ×0-3 | (`rnw/app/controls.py:162-168`) | |
| Dibujo | `mask.id` (huella de 48 bits de la imagen) | | la imagen no cabe en el código: va en la carpeta del mundo y en el `.rnworld` (`rnw/settings.py:202-207`; `rnw/landmask.py:13-16`) |

**El tope que manda es el número de localizaciones.** El motor rechaza más de unas 32.000 (`rnw/eu5_nw_export.py:347`, `:2756-2760`) y la ventana se queda por debajo de 31.200 (`rnw/app/controls.py:22-34`). Fuera del Nuevo Mundo ya hay 21.975 (`:26`), y el juego vanilla tiene 27.312 en total (`:185`). Así que **el Nuevo Mundo dispone de unas 9.200 localizaciones** entre tierra, mar y lagos, frente a las ~5.300 de las Américas vanilla. La estimación es `tierra ≈ 58.800 × cuota‰ / location_px²` (`:211-228`). Con los valores por defecto de continentes (34 %, 53 px, 120 px de mar) salen ~30.600: ya va casi al tope. Para más densidad hay que bajar `location_px` y la cuota de tierra a la vez. Por ejemplo, 45 px con un 25 % de tierra dan ~7.260 localizaciones de tierra y ~30.950 en total. El techo práctico queda en unas 7.300-7.500 localizaciones de tierra, sea cual sea la combinación.

**Dibujo propio (editor o PNG):**
- Los colores son exactos: mar `0,0,0`; tierra `255,255,255`; montañas `160,82,45`; tierras altas `218,165,32`; llanuras `124,205,124`; lago `30,144,255` (`rnw/landmask.py:71-85`). Un píxel de color dudoso cuenta como tierra o como mar (`:88-91`).
- La imagen debe tener las proporciones del lienzo, con un 10 % de margen, entre el 3 % y el 90 % de tierra y, como mucho, 64 Mpx (`rnw/landmask.py:47-54`). El error de proporción da la anchura y la altura que se esperan (`fit`).
- Se suaviza antes de estirarse para que las costas no salgan en escalera (`rnw/landmask.py:56-62`).
- La tierra que se dibuja dentro del margen de costa del borde se recorta. El editor enseña ese margen rayado (`rnw/newworld.py:589-605`; `rnw/gui/text.py:374`). Si un continente toca el borde del área, el recorte deja una costa recta: hay que dibujar dentro.
- Un lago pintado se queda como lago sea cual sea su tamaño, pero tiene que estar rodeado de tierra; si toca el mar, el dibujo se rechaza (`rnw/newworld.py:535-570`). Un agua cerrada sin pintar como lago y mayor que unas cuatro zonas de mar se vuelve mar interior navegable. Si el dibujo la deja aislada del océano, el generador le abre un estrecho (`rnw/newworld.py:512-549`, `:607-615`).
- El editor tiene puntos de partida: supercontinente, dos o tres continentes, archipiélago, cadena de islas, **anillo de tierra alrededor de un mar**, media luna y dispersión (`rnw/landeditor.py:8-9`, `:60-88`). Tiene también «Add terrain», que añade cordilleras, tierras altas y lagos (como mucho 10, uno cada 14.000 px de hoja: `rnw/landeditor.py:94-116`). Trae además cuatro siluetas conocidas: Poniente, Tamriel, Kalimdor y Ansalon (`rnw/lands/lands.toml`). Tiene «Import a picture…» y «Save the drawing…» (`rnw/gui/text.py:468-469`).

## 3. Cómo crea culturas, religiones y países

- **Religiones:** cada zona religiosa toma la **religión americana vanilla no usada** cuyo «hogar» se le parezca más: clima, vegetación, relieve, latitud y costa, ponderados por población (`rnw/eu5_natives.py:1-10`, `:1114-1149`). El catálogo son las religiones folk americanas vanilla: 8 ficheros, 65 entradas de primer nivel en `GAME/in_game/common/religions/folk_*`. No se crea ninguna.
- **Culturas:** cada zona cultural crece dentro de su zona religiosa y toma una cultura vanilla de esa religión (`rnw/eu5_natives.py:7-8`; `rnw/societies.py:9-10`). Las definiciones se leen y no se escriben: RNW no genera ficheros `common/cultures` ni `common/religions` propios (ver la lista de rutas de la sección 4).
- **Países:** etiquetas nuevas de 3 letras sacadas de una semilla («natives», «tags»), sin chocar con las vanilla (`rnw/eu5_natives.py:1152-1162`). Escudo, el del motor. Se definen en `in_game/setup/countries/rnw_natives.txt` y en los ficheros reescritos de `main_menu/setup/1337/*` (`rnw/eu5_natives.py:148`; `rnw/eu5_nw_export.py:417-453`).
- **Nombres:** salen de cadenas de Markov por idioma, familia o religión, entrenadas con los topónimos americanos vanilla. Con menos de 40 nombres en el corpus se pasa al nivel siguiente (`rnw/eu5_natives.py:144-147`, `:1385-1421`). Se transliteran a las 11 lenguas del juego (`rnw/translit.py:1-14`; `rnw/wording.py:1-12`). Las colonias se llaman «Nueva X» (`rnw/colonial_names.py:1-13`).
- **Contenido que añade:**
  - **12 historias procedurales:** centro fluvial, centro sagrado, cosecha, ruta, alianza, imperio, contacto, colonia, decadencia, consejo, señorío y fundación de nación (`rnw/stories.py:406-419`). Son prosa inglesa fija con portador y lugar elegidos del mundo (`rnw/content.py:1-22`; `rnw/eu5_story.py:1-15`).
  - **Formables por niveles:** unión fluvial, confederación de montaña, liga marítima, commonwealth cultural, reino regional, federación poscolonial, imperio del Nuevo Mundo (nivel 5), restauración y otras (`rnw/formations.py:1-21`, `:175-392`).
  - **Misiones «Road to X»** para cada formable (`rnw/eu5_missions.py:1-11`).
  - **Elección de nombre** al formar (`rnw/eu5_naming.py:1-12`).
  - **Crónica «Our History»** (`rnw/eu5_history_text.py:1-5`).
  - **Leyes, tecnología y personalidades de IA** coherentes con cada sociedad (`rnw/eu5_technology.py:1-17`; `rnw/eu5_ai.py:14-16`).
- **Contenido vanilla de América:** lo que nombra lugares o personas americanas se **neutraliza** cerrándole el disparador. Los formables `AZT_f`, `INC_f`, `IRO_f`, `MAY_f` y `PUE_f` se **reubican** donde vive su cultura (`rnw/eu5_content.py:1-20`). Las referencias a localizaciones borradas se remapean a la celda generada más parecida, tanto en los ficheros del juego base como en los de los DLC (`rnw/eu5_remap.py:1-18`, `:333-353`). Los eventos históricos de etiquetas que desaparecen se quitan (`rnw/eu5_events.py:1-10`).

**Lo que falta para lo que pide el jugador A:** culturas con rasgos propios, religiones nuevas y facciones con sabor para toda la partida. El generador da sociedades verosímiles y contenido genérico, pero con culturas, religiones y nombres reciclados de las Américas.

## 4. Enganches para contenido propio y compatibilidad

### 4.1 Qué escribe un mundo (las rutas que puede pisar otro mod)
Sale de las rutas que hay en el código; todavía no hay ningún mundo generado para confirmarlo:
- **Mapa:** `in_game/map_data/*` (`locations.png`, `rivers.png`, `definitions.txt`, `default.map`, `adjacencies.csv`, `ports.csv`, `named_locations/00_default.txt`, `location_templates.txt`) y `in_game/gfx/terrain2/*`, `in_game/gfx/map/*` (agua, objetos, `spline_network.splnet`, `locators_override`).
- **Arranque:** `main_menu/setup/1337/{03_markets,07_cities_and_buildings,09_roads,10_countries,12_diplomacy,14_development,15_international_organizations,18_opinions,20_rivals,26_ai_personalities}.txt` y `in_game/setup/countries/rnw_natives.txt`.
- **Contenido propio, con nombres `rnw_*`:**
  - `in_game/common/{formable_countries,missions,scripted_geography,scripted_country_names,town_setups,estate_privileges,government_reforms,biases,decisions,scripted_triggers,ai_scripted_expansion_*}/rnw_*.txt`;
  - `in_game/events/rnw_*.txt`;
  - `in_game/common/on_action/rnw_stories.txt` y `rnw_reveal.txt`;
  - `main_menu/common/{static_modifiers,named_colors,flag_definitions,coat_of_arms}/rnw_*.txt`;
  - `main_menu/localization/<idioma>/rnw_*_l_<idioma>.yml`.
- **Copias de ficheros vanilla y DLC reescritos:** solo los que nombran lugares o etiquetas americanas, bajo `in_game/common`, `in_game/events`, `main_menu/common` y algunos gráficos (`rnw/eu5_remap.py:46-53`).
- **Portada del lobby:** shaders en `main_menu/gfx/FX/*.shader` y `in_game/gui/map_markers.gui` (`rnw/eu5_lobby.py:1-30`; `rnw/eu5_lobby_gui.py:15-16`).

El generador comprueba él mismo el playset. Avisa si un mod cargado después del mundo tiene ficheros en las mismas rutas, o si hay otro mundo activo. No detecta las mismas claves definidas en ficheros de otro nombre (`rnw/app/playset.py:1-12`).

### 4.2 Choques con los mods de el jugador A

Hay dos métodos. El primero compara rutas: los 4 mods sobrescriben solo 5 ficheros vanilla en total. El segundo busca en sus scripts las 7.280 claves de `america` de `GAME/in_game/map_data/definitions.txt:5880-9124` y las 544 etiquetas de los 11 ficheros americanos de `GAME/in_game/setup/countries/`.

| Mod | Hallazgo | Riesgo |
|---|---|---|
| **National Destinies** | `REPLACE:AZT_f` (`ND/in_game/common/formable_countries/99_nd_azt.txt:1`), `REPLACE:INC_f` (`99_nd_inc.txt:1`), `REPLACE:IRO_f` (`99_nd_iro.txt:1`), `INJECT:MAY_f` (`99_nd_may.txt:1`) e `INJECT:PUE_f` (`99_nd_pue.txt:1`). Son justo los cinco que RNW reubica (`rnw/eu5_content.py:11-14`) | **Alto.** La versión de ND tapa la reubicación de RNW. `AZT_f` usa `mesoamerica_region` y `INC_f` usa `acamama_area` y `puna_area`: esas claves existen en el mundo RNW, pero caen donde RNW las haya puesto, no donde vivan los nahuas o los quechuas. `IRO_f` usa 5 provincias (`onondowaga_province`, …) **que no existen** en un mundo RNW. Sin probar en partida |
| National Destinies | 50 ficheros nombran localizaciones o provincias americanas borradas. Ejemplos: `in_game/common/scripted_effects/nd_bzl_effects.txt` (goana_para, 19 veces), `in_game/common/advances/99_nd_{azt,inc,may,iro,mex,usa,can,num,mca,pue,bzl,ibr,map,nwd,cda,spa,eur}.txt`, `in_game/common/bureaucracies/99_nd_{azt,may,can}.txt`, `in_game/events/nd_bzl.txt`, `in_game/common/scripted_diplomatic_objectives/nd_ai_aims_objectives.txt` | **Medio.** RNW solo remapea los ficheros del juego y de los DLC, no los de otros mods (`rnw/eu5_remap.py:12-13`, `:333-353`). Lo esperable es que el registro de errores se llene de «localización inválida» y que ese contenido americano quede muerto. En 1.4.1, una localización borrada en un lugar santo tumbó el juego (`rnw/eu5_remap.py:4-5`); ND no toca lugares santos. Hay que probar una carga y leer `DOCS/logs/error.log` |
| National Destinies | Sobrescribe 3 ficheros vanilla (`in_game/events/DHE/flavor_flo.txt`, `flavor_GEN.txt` y `in_game/common/scripted_triggers/international_organization_triggers.txt`). Ni el original vanilla ni el de ND nombran claves o etiquetas americanas | Bajo: RNW no debería reescribirlos |
| National Destinies | `monthly_country_pulse` con un `effect` propio (`ND/in_game/common/on_action/99_nd_on_actions.txt:87`) | Ninguno para RNW, que usa `yearly_country_pulse` con una lista `on_actions` (`rnw/storymodel.py:268-271`) |
| **CMF** | Su país almacén `CMF` va en Estocolmo (`CMF/main_menu/setup/1337/10z_cmf_storage_country.txt`). Sobrescribe `in_game/gui/multiplayer_lobby.gui` y `loading_screen/input_profile/default.profile`. Pone un `effect` propio en `on_game_started_after_lobby` (`CMF/in_game/common/on_action/cmf_on_actions.txt:162-173`) | Bajo. RNW no toca `multiplayer_lobby.gui`. La revelación de RNW cuelga de ese mismo gancho, pero como sub-on_action, que según sus notas sigue corriendo junto al `effect` de otro mod (`rnw/eu5_reveal.py:5-9`, `:71`). Sin probar con CMF |
| CMF | `in_game/gui/vanilla/cmf_map_markers_vanilla_types.gui` copia tipos de `map_markers.gui`, pero no los widgets `market_marker` ni `raw_goods_marker` que RNW edita | Bajo. Lo peor sería que se vieran marcadores en la pantalla de selección, un spoiler sin más |
| **REAI** | 0 referencias americanas. `on_game_start` como lista (`REAI/in_game/common/on_action/REAI_on_actions.txt:1-6`). Personalidades con `TRY_INJECT` (`REAI/in_game/common/ai_personalities/REAI_ai_personalities.txt`). Defines `NAI`, `NCharacter`, `NDiplomacy` y `NCombat` (`REAI/loading_screen/common/defines/zzz_REAI_defines.txt`) | Ninguno detectado. Los países nativos de RNW reciben personalidades vanilla en `26_ai_personalities.txt`, y REAI asigna las suyas a otras etiquetas |
| **AAMO** | 0 referencias americanas. Pulsos anual y mensual como listas. Depende de CMF | Ninguno detectado |
| **Hub RNW activado** | No tiene carpetas de juego (solo `generator/`, `licenses/` y el exe) | Seguramente inofensivo, pero va contra su instrucción (`RNW/.metadata/metadata.json:6`). Conviene desactivarlo |

### 4.3 Dónde enganchar facciones, culturas, religiones y eventos propios sin romper RNW
1. **Un mod aparte, cargado después del mundo**, con ficheros de nombre propio (`zz_gj_*.txt`). Su carpeta **no** puede empezar por `rnw_exp_`, porque el instalador de RNW reemplaza o retira esas carpetas (`rnw/app/install.py:3-5`, `:31`). Tampoco debe sobrescribir rutas del mundo (`location_templates.txt`, `main_menu/setup/1337/*`): el aviso de `rnw/app/playset.py:3-7` explica que se rompen las plantillas.
2. **Culturas y religiones: redefinir por clave las vanilla americanas que RNW coloca.** Se hace con `REPLACE:`/`INJECT:`, como hace ND. Así se les da otro nombre (localización), otros grupos, otras opiniones y, en las religiones, otros dogmas y mecánicas. RNW guarda solo las claves, así que el reparto geográfico sigue siendo válido. Para **religiones nuevas con clave propia**, la alternativa es un `on_game_start` en forma de lista `on_actions` que convierta las localizaciones de la religión vanilla X a la nueva. Esto último está por comprobar en el motor.
3. **Facciones y países:** las etiquetas son aleatorias pero deterministas para cada mundo. El contenido por país (eventos, misiones, decisiones, modificadores, nombres, colores) **se escribe después de generar**, leyendo `rnw_natives.txt`, `10_countries.txt` y los `.yml` del mundo en solo lectura. Si se repite la tirada de pueblos, cambian las etiquetas y hay que rehacer esta capa (`rnw/layers.py:8-16`). Para no depender de la etiqueta, los disparadores pueden ir por cultura, religión, área o región.
4. **Ganchos seguros:** sub-on_actions en `on_game_start`, `on_game_started_after_lobby`, `yearly_country_pulse` y `monthly_country_pulse`, como hacen CMF, REAI y RNW. Nunca con un `effect` directo en un gancho que ya tiene uno, porque eso apaga el vanilla (`rnw/eu5_reveal.py:7-9`).
5. **Formables y misiones propios:** van en ficheros nuevos y con claves nuevas. Se apoyan en las regiones y áreas vanilla que RNW conserva, o en los `scripted_geography` `rnw_*` del mundo.
6. **Para que ND no rompa nada:** o se quita ND del playset de esta partida, o nuestro mod vuelve a sustituir `AZT_f`, `INC_f` e `IRO_f`, y quizá desactiva los árboles de ND de naciones americanas que en este mundo no existen. Esto hay que decidirlo tras una carga de prueba.

## 5. Multijugador: qué necesita el jugador B

1. **El mismo EU5:** 1.4.9, build 26655995, el que RNW conoce (`rnw/eu5_export.py:66-67`). El autor pide no cambiar de versión a mitad de campaña: «Keep each generated map and its campaign on the exact EU5 version» (`METADATA:58`). Si Steam actualiza el juego, el mundo puede quedar inválido.
2. **Los mismos DLC instalados:** `D000_shared`, `D008_fate_of_the_phoenix`, `D009_across_the_pillars`, `D015_ancient_monuments_pack` y `D017_sacred_sites_pack` (`GAME/dlc/`). El generador reescribe los scripts de cada DLC presente (`rnw/eu5_remap.py:333-353`) y cuenta como entrada cada fichero que lee (`rnw/inputs.py:1-15`). Con otros DLC, el mundo de el jugador B saldría distinto.
3. **El mismo generador:** 1.2.2, o una versión de la misma época del algoritmo. Las épocas antiguas siguen disponibles como experimentales desde la 61 (`rnw/epoch.py:1-6`, `:115`).
4. **El mismo mundo.** Hay tres vías:
   - **a. World Code:** el jugador B lo pega en su generador y genera, lo que le pide unos 8 GB de RAM y unos minutos. Sirve si el mundo no es dibujado, porque el código lleva solo la huella de la imagen.
   - **b. `.rnworld` (recomendada):** es un ZIP de unos MB con el registro del mundo, el código, el atlas y, si lo hay, el dibujo. El autor dice que se puede compartir (`rnw/worldfile.py:5-8`; `rnw/app/exchange.py:1-5`). el jugador B lo importa y su generador lo rehace byte a byte con su juego. Después, `verify-world` o la comprobación de la biblioteca dice si el resultado es idéntico (`rnw/cli.py:434-449`).
   - **c. `.rnworld-mod` o copiar la carpeta del mod:** pesa alrededor de 1 GB y lleva rásteres derivados del juego. El autor la reserva para las máquinas de un mismo jugador, y en el destino se rechaza si los ficheros del juego no coinciden (`rnw/worldfile.py:9-13`; `rnw/app/transfer.py:1-8`, `:120-138`). Los mundos generados son «for local use, not public upload» (`METADATA:269`). Queda **pendiente de revisión legal**, y la coordinación debe apuntarlo en `entregas/revision-legal-pendiente.md`.
5. **Los mismos mods y versiones, en el mismo orden:** CMF 2.5.0, AAMO 1.4.1, REAI 1.4.2, ND 1.4.4, el mundo `rnw_exp_world_…` y, si se hace, nuestro mod de contenido. El hub, mejor fuera. Solo puede haber **un** mundo RNW activo (`METADATA:176`). Ojo con las actualizaciones automáticas del Workshop antes de la sesión.
6. **Checksum:** debe coincidir en el lobby. Que sea idéntico byte a byte salvo `.metadata` lo garantiza el autor (`rnw/epoch.py:4-6`). Si el motor incluye `.metadata` en el checksum: **NOT_TESTED**. Se comprueba mirando el checksum en el lobby multijugador.
7. **Opcional:** `reveal_at_start=1` hace que todos los países humanos descubran el Nuevo Mundo al empezar, vía `on_game_started_after_lobby` y `discover_area` (`rnw/eu5_reveal.py:1-22`). Si no se activa, se explora como en el juego, y en la selección de país el Nuevo Mundo sale tapado (`rnw/eu5_lobby.py:1-30`, «NOT GAME VALIDATED»).
8. **Al cambiar de mundo RNW hay que reiniciar EU5:** recargar mapas en el mismo proceso ha mezclado datos y tumbado el juego (`METADATA:184`).

## 6. Encaje con lo que pide el jugador A y propuesta

| Deseo | Qué da RNW | Cómo conseguirlo |
|---|---|---|
| Mares interiores | Los talla por sí solo (`rnw/gulfs.py`) | Para controlarlos: agua cerrada sin pintar como lago, que se vuelve mar con estrecho |
| Lagos tipo Finlandia y Suecia | No: la frecuencia es la de vanilla | Dibujar un distrito de lagos en color de lago, todos rodeados de tierra, de 80 px o más y dentro del presupuesto de localizaciones |
| Circos de montañas | Cordilleras ramificadas, sin anillos | Pintar anillos de montañas con flancos de tierras altas; el punto de partida «Ring» sirve de base |
| Sin ángulos rectos | El lienzo ya es redondo; las costas dibujadas se suavizan | Dibujar lejos del margen; `centre_permille` > 0 |
| Buena densidad de provincias | Hasta unas 7.300-7.500 localizaciones de tierra | `location_px` 40-45 con un 20-25 % de tierra; `province_size` a gusto (3-10) |
| Climas repartidos, no en franjas | El clima sale del modelo, con la latitud como peso principal | Cordilleras de norte a sur (sombras de lluvia), interiores grandes y mares interiores. No hay ningún ajuste de clima |
| Facciones con sabor, culturas con rasgos, religiones propias, eventos para toda la partida | Contenido genérico, con culturas y religiones vanilla recicladas | Un mod nuestro tras generar (4.3), con contenido original y sin ficheros del juego, que sí se puede pasar a el jugador B |

**Propuesta de pasos.** Necesita el sí de el jugador A: él ejecuta el generador y nosotros escribimos el mod. Nada mientras juegue.
1. el jugador A desactiva el hub en el playset y abre «Random New World Generator». Si quiere ahorrar C:, puede lanzarlo con `RNW_DATA` apuntando a W:. En el editor de tierras usa **Save the drawing…** para obtener una hoja con las proporciones exactas.
2. Con Node (sin Python), generamos un PNG de máscara a esa medida: continentes con ruido deformado, un distrito de lagos, dos o tres circos, mares interiores y cordilleras de norte a sur. Lo validamos con las reglas de `rnw/landmask.py` y `rnw/newworld.py`: proporción, cuota de tierra, lagos cerrados y margen. el jugador A lo importa con **Import a picture…**, lo revisa y genera con unos 8 GB libres, sin juego ni cargas pesadas de RAM.
3. Leemos el mundo generado, en solo lectura, y escribimos el mod de contenido con facciones, culturas redefinidas, religiones, eventos, misiones y decisiones. Probamos una carga y miramos `error.log`. Decidimos qué hacer con ND (4.2).
4. el jugador A pasa a el jugador B el `.rnworld` y nuestro mod. el jugador B genera e iguala build, DLC y mods, y se comprueba el checksum en el lobby.

**Decisiones que esperan a el jugador A:** dibujo propio o tipo de mundo con ajustes; si ND sigue en esta partida; `reveal_at_start`; y si se usa el `.rnworld` (recomendado) o se copia el mod (pendiente de revisión legal).

## 7. Lo que no se probó

- No se ejecutó el generador: es Python embebido con ejecutables sin firmar, y las reglas lo impiden. No se ha visto ningún mundo real; las rutas de 4.1 salen del código. NOT_TESTED: `"RNW/Random New World Generator.exe"`, a lanzar por el jugador A.
- Que RNW 1.2.2 termine sin fallos sobre la 1.4.9 de el jugador A: la huella del mapa está en la lista, pero sus validadores paran en seco ante cualquier referencia vanilla que no conozcan. NOT_TESTED.
- Una carga del mundo con ND, CMF, REAI y AAMO, y el `error.log` resultante. NOT_TESTED.
- El checksum multijugador entre dos PC. NOT_TESTED.
- La semántica exacta de `REPLACE:`/`INJECT:` frente al fichero `00_formable_countries.txt` reescrito por RNW. Se infiere que gana la versión de ND. NOT_TESTED.
- La causa de la caída de las 19:54: sin analizar (el minidump pesa 77 MB).
