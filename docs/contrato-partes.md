# Contrato de las partes: el contenido en paralelo (20-11, 22:2x)

el jugador A pidió un agente por país y otro por religión, en paralelo y en alrededor de una hora. Cada agente escribe **su parte** en `partes/<clave>/`. La sesión eu5-mundo las integra después en el mod. Este contrato es lo que permite fundirlas sin choques.

## 1. Lo que hay que leer
- `eu5-mundo/PETICION.md`: lo que piden los dos jugadores. Manda sobre todo lo demás.
- `eu5-mundo/MECANICAS.md`: la sección de tu clave (ver la tabla 6), más F (tamaños), H (edificios y unidades) e I (el Viejo Mundo).
- `eu5-mundo/FORMATO-EU5.md` §2: los formatos y los ficheros de ejemplo del juego base.
- El juego base, **solo en lectura**, en `G = <juego>`. Busca con Grep o Glob y lee por ventanas: los ficheros grandes no se leen enteros. Ejemplos útiles:
  - `G/in_game/common/advances/country_swe.txt`;
  - `G/in_game/common/building_types/unique_buildings.txt`;
  - `G/in_game/common/unit_types/` (`3_janissaries.txt`, y las de cada era con `copy_from` y `upgrades_to_only`);
  - `G/in_game/events/DHE/flavor_swe.txt` y `G/in_game/events/readme.txt`;
  - `G/in_game/common/religions/folk_european.txt` (`hellenism_religion`);
  - `G/in_game/common/gods/tengri.txt`;
  - `G/in_game/common/government_reforms/country_specific.txt`: búscalo con grep, porque pesa 108 KB;
  - `G/in_game/common/situations/readme.txt` y `G/in_game/common/disasters/`;
  - `G/in_game/common/cultures/00_cultures.info`, `culture_groups/` y `languages/`;
  - `G/in_game/common/age/`: las claves exactas de las 6 eras. Compruébalas: no las supongas.

## 2. Lo que no se hace
- No se escribe nada fuera de tu carpeta `partes/<clave>/`. Nada en S:, en Documents ni en las carpetas de las demás partes.
- No se ejecuta el juego, el generador de RNW ni python. Para contar o comprobar, usa PowerShell o Node.
- Todos los nombres, historias y textos son originales. Nada de Tolkien, de Anbennar, de Juego de Tronos, de Warcraft ni de otras obras. En los nombres propios tampoco vale calcar los históricos (aztecas, incas, mongoles, vikingos): se toma el arquetipo y nada más.
- En los ficheros no hay rutas de disco, nombres de personas ni nombres de modelos.

## 3. Claves y ficheros
- **Prefijo de todo lo nuestro:** `gj_`. Las claves de tu parte llevan `gj_<clave>_…` (por ejemplo, `gj_ostrevar_torre_gremio`).
- **Ficheros:** reproducen las rutas del juego dentro de tu carpeta, con nombres que empiezan por `gj_<clave>_`. Por ejemplo:
  - `partes/ostrevar/in_game/common/advances/gj_ostrevar_avances.txt`;
  - `partes/ostrevar/in_game/events/gj_ostrevar_eventos.txt`;
  - `partes/ostrevar/main_menu/localization/spanish/gj_ostrevar_l_spanish.yml`.
- **Codificación:** la que diga FORMATO §2.3. La localización va en UTF-8 **con** BOM y empieza por `l_spanish:`. Los ficheros de países y de plantillas, con BOM. Los demás, como los del juego base del mismo tipo.
- **Localización solo en castellano.** Cada clave que se muestra en pantalla tiene su texto: nombres, descripciones, títulos y opciones de eventos.
- **Eventos:** un namespace por parte, `gj_<clave>`, con los ids desde el `.1`. En Ostrevar, del `.1` al `.3` van los tres eventos de la bala trazadora (PLAN.md, fase 1):
  - `.1`: «La corona de los valles»;
  - `.2`: «El censo de los valles»;
  - `.3`: el evento religioso.

## 4. Identidad y geografía
Los países los genera RNW, con etiquetas al azar, y el mapa todavía no existe. Por eso:
- **Nunca escribas una etiqueta de país (TAG) ni el id de una location o provincia.**
- **Para saber si un país es la facción,** usa el trigger `gj_es_<clave> = yes`. Lo define la integración, no tú.
- **Para cultura y religión,** usa tus claves: `culture:gj_…` y `religion:gj_…`.
- **Para la geografía,** usa triggers con nombre `gj_zona_<nombre>` (por ejemplo, `gj_zona_estrecho` o `gj_zona_caldera`) y apúntalos en `NECESITA.md`: los define la integración. Para el clima o el terreno, usa los triggers del juego.
- **Para las locations,** dentro de un evento, usa `capital`, `random_owned_location` con `limit`, y similares.

## 5. Piezas compartidas: de quién es cada una
| Pieza | Dueño | La usan |
|---|---|---|
| Variable global `gj_inquietud_caldera` (sube con «Cavar más hondo») | durnhal | mundo_bestias (el dragón) |
| Variable global `gj_dragon_estado` (0 dormido, 1 inquieto, 2 despierto) y sus eventos | mundo_bestias | durnhal, llama_profunda (el pacto con el dragón) |
| Efecto `gj_<religion>_lee_presagio`, cómo lee esa religión un cometa o un eclipse | cada religión | mundo_bestias (cometas y eclipses) |
| La Noche Blanca (situación) y la Liga de la Sal y la Llama (organización internacional) | hrimval | escarcha_silente, mundo_bestias |
| Patentes de corso (decisión de otros países) | marea_negra | — |
| Ruinas, vetas de poder y sus casus belli | mundo_ruinas | todas, por afinidad de grupo cultural |
| Primer contacto, plaga suavizada y difusión del saber | mundo_contacto | todas |
| Grupos de religión `gj_fe_norte` y `gj_fe_sur` | integración | las religiones, en su `group` |
| Escuelas `gj_escuela_barqueros` (la Liga) y `gj_escuela_sagas` (Skarren) | espiritus_lago | lagunas, skarren |
| Escuela `gj_escuela_marea_negra` | mar_dormido | marea_negra |

Si necesitas una pieza de otra parte, úsala por su nombre y apúntala en `NECESITA.md`. No la escribas tú.

## 6. Las 27 partes
**Facciones.** Cada una lleva su cultura, su grupo cultural, su lengua y su contenido.

| Clave | Continente y tamaño | Estilo | Cultura · grupo | Religión | MECANICAS |
|---|---|---|---|---|---|
| ostrevar | norte · mediana y rica | constructor «tall» | gj_ostrevari · gj_grupo_ostrevari | gj_luz_fundadores | C1 |
| durnhal | norte · mediana (rica en metal, pobre en comida) | enanos, industria | gj_durnhali · gj_grupo_enano | gj_llama_profunda | C2 |
| lagunas | norte · pequeña y muy rica | comerciante | gj_lagunero · gj_grupo_lagunas | gj_espiritus_lago (escuela barqueros) | C3 |
| skarren | norte · pequeña (pobre, rica por el botín) | saqueador | gj_skarren · gj_grupo_fiordo | gj_espiritus_lago (escuela sagas) | C4 |
| kaivan | norte · grande y pobre por provincia | guerrero | gj_kaivani · gj_grupo_estepa | gj_cielo_clanes | C5 (kurultai) |
| hrimval | norte · pequeña, remota y peligrosa | no-muertos | gj_insepulto · gj_grupo_insepulto | gj_escarcha_silente | C6 |
| thalassar | sur · pequeña y rica | atlantes | gj_talasio · gj_grupo_talasio | gj_mar_dormido | D1 |
| sorava | sur · mediana y rica | comerciante (especias y perlas, rival de la Liga en el estrecho) | gj_soravi · gj_grupo_sorava | gj_pacto_balanza | D2 y F |
| marea_negra | sur · muy pequeña (unos pocos puertos) | piratas | gj_mareano · gj_grupo_sorava | gj_mar_dormido (escuela marea_negra) | D3 |
| ankaru | sur · mediana y rica por desarrollo | constructor «tall» | gj_ankaruno · gj_grupo_solar | gj_sol_blanco | D4 |
| orunmar | sur · grande, de riqueza media | guerras de cosecha | gj_orunmari · gj_grupo_carmesi | gj_dioses_hambrientos | D5 y PETICION |
| velathi | sur · mediana (poca moneda, mucha madera) | pueblo del bosque, longevo | gj_velathi · gj_grupo_velathi | gj_senda_verde | D6 |

**Religiones.** La mecánica de cada una se activa con una bandera que ya existe en el motor (FORMATO §2.2).

| Clave | Religión | Mecánica |
|---|---|---|
| luz_fundadores | La Luz de los Fundadores | `has_canonization`: los santos son fundadores de ciudades |
| llama_profunda | La Llama Profunda | `has_purity` y `gods/` (el pacto con el dragón) |
| espiritus_lago | Los Espíritus del Lago | `has_omens`, con las escuelas barqueros y sagas |
| cielo_clanes | El Cielo de los Clanes | `gods/` a la manera de tengri: cada kan elige el dios de su reinado |
| escarcha_silente | La Escarcha Silente | `has_doom`: el reloj de la Noche Blanca |
| mar_dormido | El Mar Dormido | `has_rite_power`, con la escuela marea_negra |
| pacto_balanza | El Pacto de la Balanza | `has_honor`: el honor sube al cumplir pactos y contratos |
| sol_blanco | El Sol Blanco | `has_yanantin` y `religious_focuses/` |
| dioses_hambrientos | Los Dioses Hambrientos | `has_religious_influence`: la devoción por cautivos baja en la paz |
| senda_verde | La Senda Verde | `has_karma`: el equilibrio con el bosque |

**Menores y mundo:**

| Clave | Qué hace |
|---|---|
| minores_norte | De 6 a 8 menores con nombre: ciudades-estado, clanes, jefaturas y vasallos. Cada uno con su cultura, dentro de los grupos del norte. Más un paquete compartido por estilo de 15-20 piezas. |
| minores_sur | Lo mismo, en el sur. |
| mundo_ruinas | A1 (ruinas de los Antiguos) y A2 (vetas de poder). |
| mundo_bestias | A3 (el dragón, los krakens y las plagas de bestias) y A4 (cometas y eclipses, llamando a los `gj_<religion>_lee_presagio`). |
| mundo_contacto | I: primer contacto, la plaga suavizada (`great_pestilence` y `smallpox`) y la difusión del saber. |

## 7. Lo que tiene que llevar cada parte
**Facción.** Esta es la vara de el jugador A (22:1x): «en los países, 60 o 70 me refería a bonus por cultura y por país, sin contar eventos, eso aparte».
- **De 60 a 70 bonificaciones.** Cada línea de modificador cuenta como una. Salen de:
  - **avances propios** que cubren las 6 eras: más o menos 25-30 avances, de 2 a 3 modificadores cada uno;
  - **2 o 3 reformas** de gobierno únicas;
  - **los modificadores de su cultura**: `country_modifier`, `location_modifier` y `character_modifier`, más 2-3 avances de cultura;
  - **el grupo cultural**.
- **5 edificios propios que mejoran en cada era:** con niveles, o con métodos de producción que se desbloquean por era.
- **2 o 3 unidades propias, con una versión en cada era:** una cadena de `copy_from` y `upgrades_to_only` sobre la unidad base de esa era.
- **Su mecánica de MECANICAS:** una situación, un desastre, decisiones, variables o una organización internacional, según el caso.
- **Eventos, aparte de las bonificaciones:** de 15 a 20 eventos temáticos, más los que pida la mecánica.
- **`IDENTIDAD.md`:**
  - nombre y adjetivo;
  - color;
  - nombres de reyes;
  - de 10 a 15 topónimos propios;
  - tamaño objetivo (número de locations);
  - rivales;
  - plantilla de gobierno sugerida.
- **Equilibrio (MECANICAS H):**
  - una unidad, como mucho un +15-20 % en 1 o 2 valores frente a la del juego base de su era, y siempre con una debilidad y un límite;
  - un edificio, como mucho un nivel mejor que su equivalente del juego base, con un límite.
  - Bueno sí; roto, no.

**Religión:**
- su definición, con la bandera de su mecánica;
- de 15 a 20 bonificaciones en total, entre `definition_modifier`, aspectos y focos;
- de 2 a 4 aspectos elegibles;
- dioses o focos, si su mecánica los usa;
- 1 o 2 tipos de lugar sagrado, sin locations;
- de 8 a 12 eventos;
- su `gj_<religion>_lee_presagio`;
- las escuelas que le toquen (tabla 5).

**Mundo y menores:** lo que diga su fila de la tabla 6, con la misma calidad y las mismas reglas.

## 8. Entregables de cada parte
- Los ficheros del juego, bajo `partes/<clave>/`.
- **`RESUMEN.md`:** qué hay, con las cifras: bonificaciones, edificios, unidades, eventos, decisiones y situaciones.
- **`NECESITA.md`:** todo lo que se usa sin definirlo aquí (`gj_es_*`, `gj_zona_*` y las piezas de otras partes).
- **Antes de entregar, la comprobación propia:**
  - las llaves `{` y `}` equilibradas en cada fichero;
  - cada clave visible tiene su localización;
  - no hay etiquetas de país ni ids de locations;
  - las claves del motor que usas existen en G; si dudas, grep.
