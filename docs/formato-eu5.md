# FORMATO-EU5: cómo se hacen en EU5 un mapa, las culturas, las religiones y los países con flavor

Investigado el 2026-11-20 entre las 21:41 y las 21:54 (horas sacadas con `Get-Date`). Todo ha sido en solo lectura: no se ha tocado nada en `<ruta>` ni en `Documents`, no se ha ejecutado el juego ni el generador y no se ha usado Python.
- **Juego:** Europa Universalis V **1.4.9**. La versión sale de `Documents/.../logs/debug.log`, en la línea «successfully matched game version 1.4.9». DLC activos: D000, D008 Fate of the Phoenix, D009 Across the Pillars, D015 y D017.
- **Notación:** `G/` es `<juego>/` y `DOC/` es `<documentos>/`.
- **Fuentes web:** [EU5 Wiki: Modding](http<ruta>), [Map modding](http<ruta>) (verificada por la wiki en la 1.1), [Mod structure](http<ruta>), [Mod](http<ruta>), [Terrain modding](http<ruta>), [Setup modding](http<ruta>), [Religion modding](http<ruta>), [Culture modding](http<ruta>), [Mission modding](http<ruta>) y [Arcanum](http<ruta>). Varias de estas páginas están marcadas como «verificada en 1.0/1.1». Donde la wiki y los ficheros de la 1.4.9 no coinciden, mandan los ficheros.

---

## 0. Resumen

1. **El mod que se han bajado es «Random New World (RNW)» 1.2.2.** Está en `<workshop>/3829217331/` y es un **programa generador** (`Random New World Generator.exe`, con un Python embebido), no un mod que se juegue tal cual.
   - **Qué rehace:** solo **el Nuevo Mundo (América)**: locations, provincias, costas, relieve, biomas, decals de terreno, agua, vegetación y sociedades nativas. **El Viejo Mundo se queda igual.** Lo dice la cabecera de `generator/site/rnw/eu5_nw_export.py`.
   - **Dónde deja lo generado:** escribe mods `rnw_exp_*` en `DOC/mod/`. Hoy esa carpeta no existe, así que todavía no se ha generado ningún mundo.
   - **Estado declarado:** está hecho para la 1.4.1, y su propio código lo marca «NOT GAME VALIDATED as a whole».
   - **Cómo se comparte un mundo:** cada mundo se reproduce con un «world code» (`RNW1-…`), que guarda la semilla, el preset y los ajustes cambiados.
2. **Hay un problema en la colección activa.** En `DOC/playsets.json`, «Colección inicial» tiene RNW **activado**, y su descripción dice expresamente «Do not enable this mod in a playset». Hay que quitarlo de la colección; eso lo hace el jugador A en el menú «DLC y mods».
3. **La geometría está en ficheros planos.** Son PNG de 16384×8192 más ficheros de texto en `G/in_game/map_data/`, y el relieve está en `G/in_game/gfx/terrain2/`.
   - Lo que es caro es lo derivado: decals y caché de terreno, locators, red de splines y `nodes.dat`.
   - El editor oficial (`-map_editor`) pide unos 32 GB de RAM, que es justo la RAM del PC.
4. **El clima va por location, no por latitud.** `location_templates.txt` fija `topography`, `vegetation` y `climate` para cada location, así que se pueden repartir climas a mano. Lagos, mares interiores y montañas infranqueables son listas en `default.map`.
5. **El flavor de un país tiene muchas piezas.** Son eventos dinámicos (DHE), avances propios (el equivalente a las ideas nacionales), reformas únicas, situaciones, desastres, edificios y unidades únicas, y paquetes de misiones.
   - Turquía e Inglaterra son el listón de «mucho contenido»: unos 220 eventos, entre 19 y 26 avances, entre 8 y 11 reformas y de 3 a 4 situaciones o desastres.
   - En el juego base, las culturas casi no tienen rasgos mecánicos: los modificadores de cultura están vacíos. Los rasgos se dan con avances de cultura, edificios y modificadores, y se pueden crear.
6. **En multijugador los dos necesitan lo mismo:** la misma versión, la misma colección (los mismos mods, en el mismo orden y con los mismos ficheros) y el mismo checksum.
   - Con un mundo generado, lo seguro es **copiar la carpeta `rnw_exp_*` generada** (o subirla al Workshop en privado, pero subirla es publicar y necesita el sí de el jugador A). Fiarse de que el mismo world code dé los mismos bytes en el otro PC es más arriesgado.

---

## 1. La geometría del mapa

### 1.1 Qué fichero define qué (juego base 1.4.9)

`G/in_game/map_data/default.map` es el índice:
```
provinces = "locations.png"
rivers = "rivers.png"
adjacencies = "adjacencies.csv"
setup = "definitions.txt"
ports = "ports.csv"
location_templates = "location_templates.txt"
equator_y = 3340
wrap_x = yes
```
Después vienen los bloques `sound_toll`, `volcanoes`, `earthquakes`, `sea_zones` (línea 391), `lakes` (1034), `impassable_mountains` (1203) y `non_ownable` (1595).

| Fichero | Formato real (medido) | Qué define |
|---|---|---|
| `map_data/locations.png` | 16384×8192, RGB de 8 bits, sin alfa | Cada color único es una *location* (la unidad mínima, unas 7 por cada provincia de EU4). La wiki pide compresión de nivel 7 y nada de antialias. |
| `map_data/named_locations/00_default.txt` | `stockholm = dda910` (36.411 líneas) | Asocia color e id. Un color que esté en el PNG y no aquí **cuelga el juego**. |
| `map_data/definitions.txt` | Jerarquía anidada | Continente > subcontinente > región > área > provincia > locations. El base tiene 9 raíces (5 continentes y 4 océanos), 82 regiones, 789 áreas y 4.153 provincias. Ejemplo: `uppland_province = { stockholm norrtalje … }`. |
| `map_data/location_templates.txt` | Una línea por location (28.573) | `topography`, `vegetation`, `climate`, `religion`, `culture`, `raw_material`, `natural_harbor_suitability`, `movement_assistance` (corrientes) y `modifier`. Ejemplos: `malaren = { topography = lakes climate = continental}` y `alands_hav = { topography = narrows … }`. |
| `map_data/rivers.png` | 16384×8192, indexado (paleta) | Ríos. `#ff0080` es agua, `#ffffff` es tierra, `#00ff00` es un nacimiento, `#ff0000` una unión y `#fffc00` una bifurcación. El ancho va de `#00e1ff` (mínimo) a `#18ce00` (máximo), pasando por azules y verdes. |
| `map_data/ports.csv` | `stockholm;stockholms_skargard;8532;6945;x` (4.421 filas) | Puertos entre tierra y mar. La **Y se cuenta desde abajo** (Y de EU5 = 8192 − Y del programa de dibujo). Toda location costera necesita al menos uno. |
| `map_data/adjacencies.csv` | `From;To;Type;Through;start_x;start_y;stop_x;stop_y;Comment` (186 filas) | Estrechos. En el base solo existe el tipo `sea`. |
| `map_data/nodes.dat` | Binario de 11 MB | **No está documentado** (no sale en la wiki). Parece un grafo o caché de navegación derivado del mapa. RNW lo deja como el del juego base y avisa: «nodes.dat and other derived caches are vanilla and may not match the new map». Es un riesgo abierto. |
| `map_data/location_templates` + `default.map: lakes/sea_zones` | Listas de ids | Un lago es una location con `topography = lakes` o `high_lakes` que además está en `lakes = {}`. Un mar es una location en `sea_zones = {}`, con `ocean`, `coastal_ocean`, `inland_sea`, `narrows` o `deep_ocean`. |
| `default.map: impassable_mountains` | Lista de ids | Yermo infranqueable (`mountain_wasteland`, `hills_wasteland`, `dune_wasteland` y demás). Corta el movimiento. |
| `default.map: non_ownable` | Lista de ids | Corredores (Sahara, Siberia) que se cruzan pero no se pueden poseer. |
| `gfx/terrain2/heightmap.png` | 8192×4096, gris de 16 bits | Relieve global de baja resolución. La resolución virtual del terreno es 65536×32768 (`terrain_properties.json`). |
| `gfx/terrain2/decals/heightmap_X_16/` | 25 carpetas que suman 0,93 GB | Cada una lleva una `*_height.png` de 8192×4096 y 16 bits, 16 máscaras de material de 8 bits (`*_mask_00..15.png`), `*_height.bin/.info` y `*_materials.bin/.info`. Es el relieve detallado y los materiales del suelo. |
| `gfx/terrain2/terrain_cache/` | `ingame_decals.json` y `checksum.json` | Lo horneado que lee el juego. Se genera con el editor. |
| `gfx/terrain2/materials.txt`, `biomes.png` (8191×4095, gris), `gfx/map/biome_definitions/biomes.txt` | | Materiales y biomas visuales. Cada combinación de clima, vegetación y topografía se traduce en un bioma. |
| `gfx/map/water/` (`flowmap.dds`, `watercolor_rgb_waterspec_a.dds` de 44 MB…), `gfx/map/rivers/` | DDS | El aspecto del agua y de los ríos. |
| `gfx/map/map_objects/*_generator_*.bin`, `generated_map_object_locators_*` | Binarios y texto generados | Árboles y vegetación, y las posiciones de ciudades, unidades, combates y puertos. |
| `gfx/map/spline_network/` (`.splnet`) | | Caminos y carreteras dibujados. |
| `gfx/map/flatmap/terra_incognita.dds` (89 MB), `flatmap_staticbackup.dds` (134 MB) | DDS | El mapa plano y la niebla de lo desconocido, horneados desde el mundo base. |
| `G/loading_screen/common/defines/00_defines.txt` | `WORLD_EXTENTS_X = 16384`, `WORLD_EXTENTS_Z = 8192` | Tamaño del mundo. El nivel del mar es `WATER_LEVEL_PERCENTAGE` = 8,34 %, que en RGB es (21,21,21). |
| `G/in_game/common/topography`, `vegetation`, `climates` | Bases de datos | Qué hace cada terreno: `movement_cost`, `defender`, `location_modifier`, `unit_modifier` y banderas como `is_lake`, `can_freeze_over`, `blocked_in_winter` y `has_sand`. El clima lleva `winter = none/mild/normal/severe` y `has_precipitation`. |

**Recuento de terrenos en el base** (sirve de referencia para la densidad y el reparto):
- Topografía: flatland 9.877, hills 4.648, plateau 2.766, mountains 2.420, wetlands 1.400, lakes 750, high_lakes 136, mountain_wasteland 909 e inland_sea 1.055.
- Vegetación: forest, grasslands, woods, sparse, jungle, desert y farmland.
- Climas: tropical, continental, subtropical, subpolar, oceanic, arid, cold_semi_arid, cold_arid, hot_semi_arid, mediterranean y arctic.
- **Lagos de Finlandia y Suecia ya en el base:** `saima`, `paijanne`, `oulujarvi`, `haukivesi`, `malaren`, `vanern`, `vattern` y más de 25 lagos-location en esa zona. Ese es el patrón a imitar: muchos lagos pequeños, cada uno su location, en tierra llana y boscosa.

### 1.2 Cómo encaja cada cosa que pide el jugador A

| Lo que pide | Cómo se hace en EU5 |
|---|---|
| Mares interiores | Locations `inland_sea` / `coastal_ocean` dentro de `sea_zones`, con puertos en `ports.csv` hacia cada costa y estrechos en `adjacencies.csv` si la boca es estrecha. |
| Sistemas de lagos como en Finlandia | Muchas locations `lakes` en `default.map: lakes`, entre `flatland/woods/forest` con `climate = subpolar/continental`. Encima del lago, el agua tiene que verse en el heightmap (por debajo del 8,34 %). |
| Circos de montañas | Un anillo de `mountain_wasteland` en `impassable_mountains`, con un borde de `mountains` y `hills` transitable y pasos en `hills`. El relieve se pone en el heightmap y en los decals. |
| Bordes sin ángulos rectos | `wrap_x = yes`: el mundo **da la vuelta en horizontal**, así que el borde izquierdo y el derecho tienen que casar. En vertical, el océano polar tiene que difuminarse con el ruido de la costa (RNW tiene `coast_margin_px` y `ocean_band_px`). |
| Climas que no vayan por cinturones | Se asignan por location en `location_templates`. El motor no impone cinturones; solo `equator_y` (no está documentado qué efecto tiene: NOT_TESTED). El bioma visual sale de la terna en `biomes.txt`. |
| Densidad de provincias | Referencia del base: unas 6,9 locations por provincia (28.573 entre 4.153). RNW la controla con `location_px`, `province_size`, `min_cell_px` y `sea_zone_px`. |

### 1.3 Herramientas que existen

- **Editor de mapas oficial:** se lanza con `-map_editor` (en Steam, `-map-editor`).
  - Hornea decals, materiales y la caché de terreno.
  - Pide **unos 32 GB de RAM**, que en este PC es toda la memoria: no puede ir a la vez que la GPU grande llena ni con el jugador A jugando.
  - Hay que corregir todas las alertas rojas antes de guardar, y la wiki recomienda hornear al directorio de usuario (`baked_streaming_data`).
- **Consola del juego**, para regenerar lo derivado:
  - `MapObjects.GenerateGameLocators` (city, vfx, combat, unit_stack). Lo que genera se copia a `gfx/map/map_objects/` con el prefijo `generated_map_object_locators_`.
  - `SplineNetwork.ClearAssets` y después `SplineNetwork.AppendAssets`. El `.splnet` se mueve de Documents a `gfx/map/spline_network/`.
- **Arcanum** (GitHub `The-Arcanum-Project/Arcanum`): valida mods sin interfaz (`headless`) y edita en bloque más de 40 tipos de objeto (pops, desarrollo…) sobre un mapa interactivo. **Todavía no es un editor de mapas completo.** Hay que ejecutar antes `script_docs` en la consola del juego.
- **EU5 Location Painter** (comunidad): pinta locations y las asigna a países, culturas y religiones, y genera ficheros. No hace el mod entero.
- **Otras herramientas que cita la wiki** (sin verificar): EU5 Map Maker, Location Definition Tool y GIMP Heightmap Filter.
- **RNW** (ya instalado): un generador procedural del Nuevo Mundo. Saca las locations, `named_locations`, `definitions`, `location_templates`, las listas de `default.map`, puertos, ríos, heightmap y decals compilados, agua, vegetación, locators, splines, el mapa plano y la terra incognita, y los nativos.
  - Ajustes que se pueden tocar (`generator/site/rnw/app/worldcode.py`, `CHANGE_FIELDS`): `land_permille`, `feature_px`, `octaves`, `persistence_permille`, `min_lake_px`/`max_lake_px`, `location_px`, `sea_zone_px`, `wasteland_permille`, `province_size`, `expand_oceans`, `natives.*` (población, estados, culturas, religiones, tribus, imperios) y `resources.*`.

### 1.4 Cuánto cuesta y qué riesgos tiene

**Opción A: usar RNW para la geometría (recomendada).**
- **Coste:** bajo en geometría. Se elige un world code, se genera, y la salida se **congela**: los ids de location son nuevos en cada generación, así que todo el contenido se escribe contra una salida concreta.
- **Riesgos declarados por el propio RNW** (lista `UNTESTED` de `eu5_nw_export.py`, líneas 375-410):
  - `nodes.dat` y otras cachés derivadas son las del juego base.
  - No se ha probado la colonización, la exploración, el movimiento, las rutas navales, los puertos, guardar y cargar, ni el tiempo de arranque.
  - Tampoco que el motor construya los ríos.
  - Ni el coste en memoria de las instancias de vegetación.
  - Las combinaciones raras de bioma pueden caer en una coincidencia parcial.
- **Versión:** está hecho para la 1.4.1 y el juego está en la 1.4.9 (NOT_TESTED).
- **Límite:** **solo rehace América.** Si se quiere un mundo entero nuevo, RNW no basta.

**Opción B: un continente propio hecho a mano o con un guion nuestro.**
- **Qué hay que generar, de forma coherente entre sí:**
  - `locations.png` y `00_default.txt`;
  - `definitions.txt` y `location_templates.txt`;
  - las listas de `default.map`;
  - `ports.csv` y `adjacencies.csv`;
  - `rivers.png`;
  - `heightmap.png` más los 16 decals de 8192×4096 (altura de 16 bits y 16 máscaras);
  - el horneado de la caché de terreno con el editor (32 GB);
  - los locators y splines con la consola;
  - la vegetación y el mapa plano;
  - y todo el *setup*: países, pops, personajes, mercados y carreteras.
- **Mínimo para que arranque** (según la wiki): 256 locations de tierra, 5 provincias, 1 mar y 1 puerto. Por debajo de eso se cuelga al iniciar.
- **Coste:** días o semanas.

**Riesgos conocidos** (de la wiki):
- Un color del PNG que no esté en `00_default.txt` cuelga el juego, y el pincel con antialias crea colores imposibles de rastrear.
- Un PNG con el formato equivocado (bits, alfa, capas) también lo cuelga.
- Exportar con ajustes distintos provoca un bucle de carga que se come toda la memoria.
- Una location de mar dentro de un área de tierra hace que toda el área se vea como mar.
- Una costa sin puerto rompe la presencia marítima.
- Con locators y splines viejos, `error.log` se llena.
- Y el riesgo propio: `nodes.dat` sin regenerar puede dar un *pathfinding* incoherente (no hay documentación pública sobre cómo regenerarlo).

---

## 2. Culturas, religiones y países con flavor

### 2.1 Culturas

- **`G/in_game/common/cultures/*.txt` (52 ficheros).** El formato está en `00_cultures.info`:
  ```
  my_culture = { language = my_language  color = map_ENG  tags = { … _gfx }
    country_modifier = {}  location_modifier = {}  character_modifier = {}
    opinions = { danish_gfx = enemy }   # enemy/negative/neutral/positive/kindred
    culture_groups = { polish_group slavic_group } }
  ```
  Ejemplo real: `swedish` en `scandinavian.txt` (con `opinions`, `culture_groups = { scandinavian_group }` y `use_patronym = yes`). En el base **solo 4 culturas tienen bloque de modificadores, y están vacíos**: los rasgos mecánicos se pueden crear, pero hay que hacerlos.
- **`common/culture_groups/00_culture_groups.txt`:** modificadores de país, de location y de personaje, y `goods_demand_modifier`. Por ejemplo, `andean_group` pide más `beer`, `potato` y `medicaments`.
- **`common/languages/*.txt` (53):** listas de nombres (`male_names`, `female_names`, `dynasty_names`, `ship_names`, `lowborn`), patronímicos, prefijos y sufijos de topónimos, y dialectos.
- **`common/ethnicities/*.txt` (54):** el aspecto de los personajes.
- **Dónde se dan los rasgos propios de una cultura:**
  - `common/advances/culture_*.txt` y `culture_group_*.txt`: avances de cultura, como `culture_irish` o `culture_group_german`;
  - `common/building_types/culture_buildings.txt` y `unique_buildings.txt`, con `location_potential = { dominant_culture ?= culture:… }` (ejemplo: `pounamou_carver` para `maori_culture`);
  - unidades especiales (`unit_types/`, con `is_special = yes` y `family`);
  - eventos de `events/culture/`.

### 2.2 Religiones

- **`G/in_game/common/religions/*.txt` (29 ficheros).** Campos: `color`, `group`, `religious_aspects = N` (cuántos aspectos se eligen), `definition_modifier`, `opinions`, `tags`, `religious_school`, `language`, `unique_names`, `enable = <fecha>`, `max_sects` y `reform_to_religion`.
- **Mecánicas propias**, que se activan con banderas que ya existen en el motor:
  - monedas o recursos: `has_religious_influence`, `has_karma`, `has_purity`, `has_honor`, `has_yanantin`, `has_doom` y `has_rite_power`;
  - santos: `has_canonization` y `saints_concept`;
  - `has_omens`;
  - avatares: `has_avatars`;
  - patriarcas: `has_patriarchs` y `has_autocephalous_patriarchates`;
  - cabeza y clero: `has_religious_head` y `has_cardinals`;
  - `needs_reform` y `culture_locked`.

  Un ejemplo que vale como plantilla de «religión nueva con sustancia» es `hellenism_religion` (`folk_european.txt`): `has_religious_influence`, `has_canonization`, `saints_concept = god_emperors`, `has_omens`, `enable = 9999.1.1` (la activa un evento) y modificadores de definición.
- **Bases de datos que cuelgan de una religión:**
  - `religious_aspects/` (doctrinas elegibles; ejemplos en `norse.txt`, `tengri.txt` y `hellenism.txt`);
  - `religious_schools/` (escuelas, como las suníes o chiíes);
  - `religious_focuses/` (son «como avances, pero de religión»: se investigan y dan modificadores; ejemplo, `nahuatl.txt`);
  - `religious_factions/` (`shinto.txt`);
  - `religious_figures/`;
  - `gods/` (con `potential`, `allow`, duración y efectos al activarse; ejemplos en `norse.txt`, `tengri.txt`, `hindu.txt` e `inti.txt`);
  - `avatars/`;
  - `holy_sites/` y `holy_site_types/`;
  - `religious_order_*`.
- **Relaciones entre escuelas al empezar:** `G/main_menu/setup/1337/02_core.txt` (`religion_manager`, con `kindred` o `enemy`).
- **Qué necesita una religión nueva:**
  - la entrada en `religions/` y su grupo;
  - el icono en `gfx/interface/icons/religion/`;
  - la localización `<clave>`, `<clave>_ADJ` y `<clave>_desc`;
  - y su color, porque pinta el modo de mapa.

  Una moneda religiosa **nueva** (que no sea una de las de arriba) necesitaría interfaz propia, así que no se recomienda: es mejor reutilizar una de las mecánicas que ya existen y darle sabor con dioses, aspectos y focos.

### 2.3 Países y su contenido

- **Definición del país:**
  - `G/in_game/setup/countries/<zona>.txt` (46): `TAG = { color = … color2 = … male_regnal_names female_regnal_names description_category difficulty }`. El formato está en `00_readme.info`.
  - El estado inicial, en `G/main_menu/setup/1337/10_countries.txt`: `own_control_core = { … }`, `own_control_colony`, `include = "catholic_monarchy"` (una plantilla de `setup/templates/`, que hay más de 200), `country_rank`, `starting_technology_level` y `government = { type heir_selection ruler consort ruler_term … }`. La plantilla `templates/test_template.txt` muestra los valores sociales, los privilegios y las leyes.
  - El resto del arranque está en `main_menu/setup/1337/`: `04_dynasties`, `05_characters` (2,4 MB), `06_pops` (5,2 MB; por ejemplo `define_pop = { type = peasants size = 18.908 culture = swedish religion = catholic }`), `03_markets`, `08_institutions`, `09_roads`, `12_diplomacy` y `22_situations`.
  - El 1658 hace `include = "setup/1337/10_countries"` y añade encima.
  - **Codificación:** los ficheros de países y plantillas van en UTF-8 **con** BOM; los del arranque, en UTF-8 **sin** BOM, según la wiki.
  - Banderas: `main_menu/common/coat_of_arms/`, `flag_definitions/`.
- **Estructuras de flavor, con un ejemplo real de cada una:**

| Estructura | Dónde | Ejemplo del base |
|---|---|---|
| Eventos históricos dinámicos (DHE) | `G/in_game/events/DHE/flavor_<TAG>.txt` (160 ficheros) | `flavor_swe.1`: `dynamic_historical_event = { tag = SWE from = 1530.1.1 to = 1550.1.1 monthly_chance = 5 }`, `fire_only_once`, opciones con `change_societal_value` y `add_casus_belli` sobre Gotland y Skåneland. El formato completo está en `events/readme.txt` (`country_event`, `location_event`, `age_event`…). |
| Avances propios (el equivalente a las ideas nacionales) | `common/advances/country_<tag>.txt` (unos 100 países) | `swedish_tradition` (`potential = { has_or_had_tag = SWE }`, `age = age_1_traditions`, `army_heavy_infantry_power = 0.2`) → `swedish_heritage` → `kung_och_riksdag` (`government_reform_slots = 1`). Cubren las seis eras. |
| Reformas de gobierno únicas | `common/government_reforms/country_specific.txt` (108 KB) | `swe_age_of_freedom` (`unique = yes`, `age = age_6_revolutions` y modificadores de parlamento). |
| Situaciones | `common/situations/` (23) | `rise_of_the_ottomans`, `hundred_years_war` e `italian_wars`. Tienen variables, votaciones y su propio color en el mapa (ver `readme.txt`). |
| Desastres | `common/disasters/` (39) | `english_civil_war`, `castilian_civil_war` y `time_of_troubles`. |
| Misiones | `common/missions/` | **En el base solo hay 11 paquetes genéricos** que se repiten (`generic_trade`, `generic_conquer_province`…), con `player_playstyle` y `chance`. Se puede limitar uno a un país con `visible = { tag = X }` (lo enseña la wiki). El formato está en `____Info.txt`. |
| Edificios únicos | `common/building_types/unique_buildings.txt`, `event_only_buildings.txt` | `pounamou_carver`, con `unique_production_methods`. |
| Unidades únicas | `common/unit_types/` | `3_janissaries.txt` (`copy_from = a_age_2_renaissance_heavy_infantry`, `is_special = yes`, `family = janissaries`, `upgrades_to_only`). |
| Otros | `decisions/`, `formable_countries/`, `estate_privileges/`, `laws/`, `international_organizations/`, `on_action/`, `scripted_effects/`, `scripted_triggers/`, `customizable_localization/` | |

- **País con mucho contenido en el base.** Recuento sobre los ficheros de la 1.4.9:

| TAG | Eventos DHE | Avances propios | Reformas únicas | Situaciones y desastres donde aparece |
|---|---|---|---|---|
| TUR | 217 | 26 | 11 | `rise_of_the_ottomans`, `byzantine_succession_crisis`, D008 |
| ENG | 222 | 19 | 8 | `hundred_years_war`, `war_of_the_roses`, `english_civil_war` |
| CAS | 206 | 48 | 7 | `castilian_civil_war` |
| SWE | 59 | 13 | 2 | `war_of_religions` |

  **Dimensionado sugerido** para una facción «que se note durante toda la partida»:
  - el piso es el de SWE: unos 60 eventos, de 10 a 15 avances que cubran las 6 eras, 2 reformas;
  - y además 1 edificio o 1 unidad, y 1 situación o 1 desastre propio;
  - con 1 o 2 paquetes de misiones atados a su TAG.

- **Localización:** va en `G/main_menu/localization/<idioma>/*_l_<idioma>.yml`, en UTF-8 **con BOM** (comprobado: `ef bb bf`) y empezando por `l_spanish:`. Idiomas: braz_por, english, french, german, japanese, korean, polish, russian, simp_chinese, spanish y turkish.

---

## 3. Cómo se carga un mod local y cómo se comparte

- **Dónde va:** `DOC/mod/<carpeta>/`. Hoy esa carpeta no existe; se puede crear a mano o desde la pantalla de crear mod del juego. Los mods del Workshop están en `<workshop>/<id>/`.
- **Estructura:** imita a `game/`, con `in_game/`, `main_menu/` y `loading_screen/` arriba (por ejemplo, `mod/X/in_game/events/…`). **Una carpeta mal escrita se ignora sin avisar.**
- **Metadatos obligatorios:** `.metadata/metadata.json`, más un `thumbnail.png` de menos de 1 MB (se recomienda 512×512). Ejemplo real, del Community Mod Framework instalado:
  ```json
  { "name": "Community Mod Framework", "id": "community_mod_framework", "version": "2.5.0",
    "game_id": "eu5", "supported_game_version": "1.4.*", "short_description": "…",
    "tags": ["Utilities"], "relationships": [], "game_custom_data": {} }
  ```
  Las dependencias van en `relationships`: `{ "rel_type": "dependency", "id", "display_name", "resource_type": "mod", "version" }`. En `game_custom_data` solo se admite `replace_paths`.
- **Cómo se sobrescribe:**
  - un fichero con el mismo nombre y la misma ruta sustituye al del juego, aunque esté vacío;
  - en `common/` se puede escribir `INJECT:clave`, `REPLACE:clave`, `TRY_*` o `*_OR_CREATE`;
  - `INJECT` no funciona con scripted effects ni triggers.
- **Cómo se activa:** en el menú principal, «DLC y mods» → colección (*playset*) → añadir el mod → «Aplicar». Queda guardado en `DOC/playsets.json`.
- **Estado actual del PC:**
  - la colección activa tiene CMF, REAI (dos), National Destinies y **RNW** activados; a RNW hay que quitarlo de ahí;
  - en `DOC/crashes` hay un volcado de hoy a las 19:54, que no se ha analizado y no se sabe si tiene relación;
  - existe `DOC/oos`: ya se ha jugado en multijugador alguna vez.
- **Multijugador con mods:**
  - lo que dice la wiki y la práctica común de Paradox: **la misma versión, la misma lista de mods, en el mismo orden y con los mismos ficheros**, y el mismo checksum en el menú o en la sala; el checksum del lanzador no es fiable;
  - el juego da el error «The host is running different mods»;
  - en otros títulos de Paradox, juntar varios mods en uno ha evitado fallos de sala. No se ha comprobado en EU5.
- **Cómo pasarle el mod a el jugador B**, de más seguro a más cómodo:
  1. **Copiar la carpeta.** Se comprime `DOC/mod/<mod>` (y la `rnw_exp_*` generada) y el jugador B la descomprime en su `DOC/mod/`, tras borrar cualquier versión anterior (la wiki insiste en esto). Los mods del Workshop (CMF, REAI…) los tiene que suscribir él, en las mismas versiones.
  2. **Workshop privado o solo para amigos.** Es lo más cómodo para las actualizaciones, pero **es subir a un servicio externo con la cuenta de el jugador A**: necesita su sí.
  3. **Pasarle solo el world code de RNW** y que genere él. Solo vale si la versión del generador y el juego son idénticos, y aun así hay que comparar el checksum. No se recomienda.

---

## 4. Arquitectura que recomiendo para el encargo

1. **Geometría:** RNW, con ajustes orientados a lo que pide el jugador A:
   - más lagos: `min_lake_px`/`max_lake_px` y `octaves`/`persistence` para costas más quebradas;
   - más yermo, para los circos: `wasteland_permille`;
   - `expand_oceans` y `land_permille`, para los mares interiores;
   - y nativos en `natives.*`.

   Se genera **una vez** y se congela la carpeta `rnw_exp_*`. Si hace falta un mundo entero, no solo América, eso es la opción B, de semanas.
2. **Contenido:** un segundo mod, `relationships: dependency` del generado, con:
   - las culturas, lenguas y grupos;
   - las religiones (reutilizando mecánicas que ya existen) con sus dioses, aspectos, focos y lugares santos;
   - los TAG con su setup;
   - y, por facción, DHE, `advances/country_<tag>`, reformas únicas, un edificio o unidad, y una situación o desastre.

   Se escribe contra los ids de location de la salida congelada y sustituye o ajusta a los nativos generados.
3. **Validación:**
   - Arcanum en modo `headless` y `error.log`;
   - y la prueba en el juego, que **no se puede hacer mientras el jugador A juega** (está la bandera `ESTOY`). Ver la sección 5.

---

## 5. Lo que no se ha probado (NOT_TESTED)

- Que la salida de RNW 1.2.2 cargue en la 1.4.9 y sea estable en multijugador. Para probarlo: generar, activar `rnw_exp_*` en una colección limpia, arrancar el juego y revisar `DOC/logs/error.log`.
- Qué es `nodes.dat` y cómo se regenera, y si deja el *pathfinding* bien en un mapa nuevo.
- El efecto de `equator_y` en un mapa nuevo (estaciones o sol).
- Si en EU5 el anfitrión impone sus DLC a los demás jugadores.
- La RAM real del editor de mapas en este PC (32 GB).
- El volcado de `DOC/crashes` de hoy a las 19:54.
