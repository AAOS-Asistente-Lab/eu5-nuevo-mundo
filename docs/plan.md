# PLAN: el Nuevo Mundo de RNW con facciones propias, para la partida de los dos jugadores

Escrito el 2026-11-20 (22:07:16, hora comprobada con Get-Date). Este plan no ha ejecutado nada: ni el juego ni el generador, ni Python ni el MCP de el asistente. Todo lo que se cita del juego y del mod se ha leído en solo lectura.
- **Fuentes:** `RNW.md`, `FORMATO-EU5.md` y `PETICION.md`, de esta misma carpeta.
- **Comprobaciones nuevas.** Abreviaturas: `G/` = `<juego>/`; `rnw/` = `<workshop>/3829217331/generator/site/rnw/`.
  - **Castilla, contada:** 206 eventos en `G/in_game/events/DHE/flavor_CAS.txt`, 48 avances en `G/in_game/common/advances/country_cas.txt`, 7 reformas únicas y 1 desastre. No tiene misiones propias.
  - **Recursos:** RNW los sortea casilla a casilla con las frecuencias de la América vanilla, no por zonas. Ha quitado a propósito los bienes del Viejo Mundo, como caballos, trigo, vino o seda (`rnw/eu5_biomes.py:603-625`, nota C116).
  - **Clima y ríos:** son constantes del generador, sin ningún ajuste en la ventana. La latitud pesa 50 frente a 30 de la lluvia, 25 de la altura y 10 de la distancia al mar (`rnw/eu5_biomes.py:75-80`). Los ríos son `RIVER_PERMILLE = 16` (`rnw/rivers.py:52`) y los lagos `RATE_PERMILLE = 11_200` (`rnw/lakes.py:47`).
  - **Plantillas:** si otro mod trae un `location_templates.txt`, borra las plantillas de todas las localizaciones generadas (`rnw/app/playset.py:3-7`). Clima, vegetación y recursos no se pueden corregir con un fichero nuestro encima.
  - **Efectos que existen en el juego** (`G/in_game/common/effect_localization/location_effects.txt` y `pop_effects.txt`): `change_raw_material`, que se usa en `decisions/coal_prospecting.txt:57`, y además `add_pop`, `add_pop_size`, `change_pop_type`, `change_pop_culture`, `change_development` y `rename_location`.
  - **Más piezas del juego:** el casus belli `cb_flower_wars` (`G/in_game/common/casus_belli/flower_wars.txt`), con su foco `institute_flower_wars` (`religious_focuses/nahuatl.txt:258`), y variables de script (`set_variable` y `change_variable`, en `events/situations/little_ice_age.txt`).
- **Dos fuentes que no coinciden.** `FORMATO-EU5.md` dice que RNW está hecho para la 1.4.1 y propone copiar la carpeta del mundo. `RNW.md`, que se escribió después y a partir del código, dice que la 1.2.2 ya reconoce la 1.4.9 y propone el `.rnworld`. Sigo a `RNW.md`.

---

## 1. Qué se puede lograr

| Lo que piden | ¿Se logra? | Cómo |
|---|---|---|
| Un nuevo mundo del norte y otro del sur, los dos jugables | **Sí** | Con un dibujo nuestro, en PNG, que el jugador A importa en el editor de tierras de RNW |
| Mares interiores | **Sí** | Agua cerrada sin pintar como lago: RNW la convierte en mar y le abre un estrecho (`rnw/newworld.py:512-549`) |
| Lagos como los de Finlandia y Suecia | **Sí** | Se pintan cientos de lagos pequeños, de 80 px o más y rodeados de tierra. Un lago pintado se conserva (`rnw/newworld.py:535-570`). Cada lago gasta una localización del presupuesto |
| Anillos de montañas en circo | **Sí** | Se pintan anillos de montaña con flancos de tierras altas y uno o dos pasos |
| Bordes sin ángulos rectos y costas recortadas (rías, penínsulas, islas) | **Sí** | Ruido deformado en el dibujo, que además se queda lejos del margen rayado |
| Buena densidad de provincias | **Sí, con techo** | Unas 7.000-7.500 localizaciones de tierra en total (con `location_px` 45 y un 22-25 % de tierra), frente a las ~5.300 de la América vanilla |
| Climas repartidos, sin parches enormes de un terreno | **Parcial sin tocar el generador; sí tocándolo** | Sin tocarlo: el relieve dibujado (cordilleras de norte a sur, mesetas, mares interiores) rompe las franjas, pero la latitud sigue mandando. Del todo, solo bajando el peso de la latitud y el suavizado en el generador (camino B). El aspecto visual se hornea con el clima, así que no se puede arreglar después |
| Muchos ríos | **Solo con el camino B** | La densidad es una constante (`RIVER_PERMILLE`). Sin tocarla, salen tantos ríos por superficie de tierra como en la América vanilla |
| Recursos con identidad por regiones, mezclados y con bienes del Viejo Mundo | **Sí** | Nuestro mod los reasigna al empezar la partida con `change_raw_material`, a partir de una lista fija que calculamos sobre el mundo congelado. No toca `location_templates.txt` |
| Facciones con flavor y bonificaciones por era, cultura y religión | **Sí** | Con un mod de contenido nuestro, cargado después del mundo (sección 5) |
| Religiones con mecánicas propias | **Sí, reutilizando motores del juego** | Mecánicas existentes (influencia religiosa, honor, karma, presagios, dioses, focos, aspectos) más variables propias. Una moneda religiosa nueva con interfaz propia no se recomienda |
| Guerras de cosecha (Orunmar) | **Sí** | Un casus belli propio con la misma estructura que `cb_flower_wars`; `change_pop_type` para convertir cautivos en esclavos; una variable de devoción que baja cada año sin guerra |
| Nación «tall» que mueve a su gente y construye hacia arriba | **Sí** | Decisiones de migración interna (`add_pop_size` negativo en el origen y `add_pop` en el destino), edificios únicos con niveles y reformas propias |
| Unas 50-60 piezas por país (sobre Castilla ≈ 80) | **Hay que decidir la vara** | Castilla contada suma unas 262 piezas, no 80. El 60-75 % serían 160-200 piezas por país. Ver la decisión D1 |

---

## 2. Tres caminos

Lo común a los tres: el contenido (facciones, culturas, religiones, eventos) va siempre en **un mod nuestro aparte**.
- **Carpeta:** `mod/gj_nuevo_mundo`, que no puede empezar por `rnw_exp_`.
- **Ficheros:** `zz_gj_*`, con `relationships: dependency` hacia el mundo.
- **Facciones:** se escriben contra el mundo congelado. Un guion de Node lee en solo lectura `rnw_natives.txt`, `10_countries.txt`, `definitions.txt` y `location_templates.txt`, y elige las etiquetas y claves por región y área, nunca a mano. Si cambia el mundo, se vuelve a correr el guion y el contenido se recoloca solo.
- **Culturas y religiones:** se redefinen con `REPLACE:` las claves vanilla americanas que RNW haya puesto en cada zona. Así, el reparto de RNW sigue valiendo y el jugador solo ve lo nuestro.

### Camino A: RNW tal cual, con dibujo nuestro, recursos por zonas y mod de contenido
- **Cómo:** generamos en Node un PNG de máscara a la medida exacta del lienzo. Lleva dos continentes, mares interiores, un distrito de lagos, dos o tres circos, rías y cordilleras de norte a sur. Lo validamos con las reglas de `rnw/landmask.py` y `rnw/newworld.py` (proporción, cuota de tierra, lagos cerrados, margen). el jugador A lo importa y genera. Después, nuestro guion calcula los recursos por zonas y escribe el mod.
- **Coste en horas de agente:**
  - mapa: 8-12 h;
  - recursos: 4-6 h;
  - lector del mundo y generador del mod: 6-8 h;
  - contenido: en la sección 4.
- **Tiempo de el jugador A:** dos o tres generaciones de 10-20 min cada una, y las pruebas.
- **Riesgo: medio.** Lo pone RNW 1.2.2 sobre la 1.4.9, que está sin probar en partida. Nuestro código no añade riesgo al mapa.
- **Lo que se pierde:**
  - el clima sigue pesando la latitud (se rompe en parte con el relieve);
  - puede haber parches de vegetación;
  - ríos con la densidad vanilla.
- **el jugador B:** reproduce el mundo exacto con el `.rnworld`, que lleva el dibujo dentro, y recibe nuestro mod en un zip.

### Camino B: A más una copia parcheada del generador de RNW
- **Cómo:** se copia `generator/` a W: (nunca se toca el Workshop) y se cambian unas pocas constantes:
  - el peso de la latitud y el suavizado del clima (`eu5_biomes.py:75-80`);
  - `RIVER_PERMILLE` (`rivers.py:52`);
  - `RATE_PERMILLE`, si hiciera falta (`lakes.py:47`);
  - el reparto de recursos (`eu5_biomes.py:603-650`): bienes del Viejo Mundo y agrupación por zonas.

  el jugador A lanza el ejecutable desde esa copia.
- **Coste en horas de agente:** A más 12-18 h (parche, diff documentado y estadísticas de cada salida).
- **Tiempo de el jugador A:** de 2 a 4 generaciones de prueba más.
- **Riesgo: medio-alto.**
  - Los validadores de RNW pueden rechazar los valores nuevos.
  - Los ríos los construye el motor, y RNW marca eso como «sin probar».
  - Cada cambio cambia el mundo entero.
  - el jugador B ya no puede rehacer el mundo con el RNW del Workshop: necesita nuestra copia parcheada o la carpeta del mundo (~1 GB). Pasarle cualquiera de las dos está **pendiente de revisión legal**: no se ha encontrado la licencia del propio RNW, y su autor reserva los mundos «for local use».
- **Lo que se gana:** clima mezclado de verdad, más ríos y menos parches, con el aspecto visual coherente porque se hornea con el clima nuevo.

### Camino C: un continente propio, sin RNW
- **Cómo:** nuestro generador en Node escribe todos los ficheros del mapa:
  - `locations.png`, `00_default.txt`, `definitions`, `location_templates`, `default.map`, `ports`, `adjacencies` y `rivers.png`;
  - el heightmap y los 25 decals;
  - el horneado con el editor oficial (`-map_editor`, unos 32 GB: toda la RAM del PC);
  - locators y splines por consola;
  - y el arranque entero: países, pops, mercados y carreteras.
- **Coste en horas de agente:** 150-300 h solo de mapa, más el contenido. el jugador A tendría que dejar el PC entero (sin la GPU grande ni el juego) para hornear, varias veces.
- **Riesgo: muy alto.** `nodes.dat` no tiene documentación pública. Un color mal puesto cuelga el juego. El horneado puede no caber en 32 GB.
- **Lo que se pierde:** semanas, la simulación de pueblos de RNW (los 300 años de prehistoria, los estados y las tribus) y la vía cómoda para el jugador B. Solo merece la pena si un día se quiere un mundo entero nuevo, no solo América.

## 3. Recomendación

**El camino A, empezando ya, con el camino B como fase opcional.** El B se decide después de ver el primer mundo dibujado, y solo para el clima y los ríos.

Razones:
- El A da casi todo lo que piden (mapa, recursos y todo el contenido) con el menor riesgo y deja a el jugador B la vía limpia del `.rnworld`.
- Lo que el A no da (ríos y clima del todo mezclado) solo se juzga bien viendo un mundo real.
- El C no compensa.

El grueso del trabajo y del valor está en el mod de contenido, que es el mismo en los tres caminos.

---

## 4. Fases

Cada fase termina con una prueba de el jugador A en el juego, porque nosotros no podemos lanzarlo. Nada se ejecuta mientras juegue: el generador pide unos 8 GB de RAM libres, el juego cerrado y la GPU grande en pausa, y eso lo coordina la coordinación.

### Fase 0: preparación (1-2 h de agente; 15 min de el jugador A)
- **el jugador A:**
  - desactiva el hub de RNW en la colección;
  - decide National Destinies (D2);
  - define `RNW_DATA` en W: para no llenar C:, que tiene 11,9 GB libres;
  - en el editor de tierras usa «Save the drawing…» para darnos la hoja con las medidas exactas.
- **Nosotros:** el esqueleto del mod (`.metadata/metadata.json` y `thumbnail`) y un validador en Node. El validador comprueba:
  - las llaves equilibradas;
  - la localización en UTF-8 con BOM y empezando por `l_spanish:`;
  - que las claves citadas existan en el mundo;
  - que no haya rutas ni datos personales.

### Fase 1: bala trazadora (5-7 h de agente; 45 min de el jugador A y 20 min de el jugador B)
**Caso fino de punta a punta:** el Alto Reino de Ostrevar, la nación tall del norte, con su cultura, su religión y 3 eventos, jugable en una partida.
1. el jugador A genera **un mundo de serie** (preset «continentes», valores por defecto, `reveal_at_start=1`). Así, si algo falla, se sabe que es RNW sobre la 1.4.9 y no nuestro dibujo.
2. El guion lee el mundo y elige un país generado de tamaño medio en el norte templado. Le pone nombre, adjetivo y color de Ostrevar.
3. **Cultura «ostrevari»:** `REPLACE:` de la clave vanilla que RNW haya puesto allí, con 2 o 3 modificadores propios.
4. **Religión:** `REPLACE:` de la folk americana de esa zona, con una mecánica existente y un aspecto propio.
5. **Tres eventos:**
   - **(1)** Al empezar: «La corona de los valles», que elige la vía del reino.
   - **(2)** Cada año, con una probabilidad dada: «El censo de los valles», migración interna con `add_pop_size` y `add_pop` entre localizaciones propias. Es la mecánica tall en pequeño.
   - **(3)** Un evento religioso con efecto en la mecánica.
6. **Localización:** solo en castellano, porque los dos juegan en castellano. Así se ahorra la mitad del coste.
7. **Prueba de el jugador A:**
   - carga la partida y elige Ostrevar;
   - comprueba el nombre, la cultura y la religión;
   - lanza `event gj_ostrevar.1`, `.2` y `.3` desde la consola;
   - juega 5 años.

   Nosotros leemos `logs/error.log` en solo lectura.
8. **Prueba con el jugador B:** una sala multijugador para comprobar que el checksum es igual y jugar 2 años sin desincronizarse.

**Hecho** = `Trazadora: PASS`. Se cumple con todo lo del paso 7, el `error.log` sin líneas `gj_` y la sala con el jugador B sin desincronización.

### Fase 2: el mapa (12-18 h de agente; 2-3 generaciones de el jugador A)
- **Dibujo en PNG:**
  - **Norte:** templado y subpolar.
    - Un distrito de lagos tipo Finlandia en las llanuras boscosas del noreste.
    - Un circo de montañas con su cuenca interior, el hogar de los enanos, en la zona de metales.
    - Un mar interior al estilo del Báltico.
    - Costas de fiordos al noroeste para los Skarren.
  - **Sur:** ecuatorial de altura.
    - Ankarú en una meseta cerrada por un anillo de montañas, con un gran lago.
    - Orunmar en las selvas de altura vecinas.
    - Una costa mercante con archipiélago y perlas en un mar interior poco profundo.
    - Una cadena de islas para los atlantes.
  - **Entre los dos:** un estrecho con islas, para que cada jugador pueda empezar en cualquiera.
  - **Para el clima:** cordilleras de norte a sur, que dejan un lado húmedo y otro seco, y mesetas.
- **Ajustes:** `location_px` 45, un 22-25 % de tierra, `province_size` 5-6 y `centre_permille` > 0.
- **Recursos por zonas:** el guion de Node asigna a cada área una identidad económica que cuadre con su clima y su terreno (metales, joyas, cultivos, ganado, madera y pesca).
  - **Regla de mezcla:** el bien dominante no pasa del 50-60 % del área, y nunca hay más de 4 casillas iguales seguidas.
  - **Resultado:** un fichero de efectos fijo con `change_raw_material`, que corre en `on_game_start` como sub-on_action. Sin azar, para que no haya desincronización.
- **Estadísticas de cada salida, leídas de los ficheros:**
  - localizaciones de tierra, de lago y de mar;
  - reparto de climas por banda de latitud;
  - tamaño de las manchas de vegetación;
  - ríos por superficie.

  Con ellas decide el jugador A si hace falta el camino B (D3).
- **Recolocación:** el guion recoloca Ostrevar en el mundo nuevo. Eso prueba que el contenido no depende de la tirada.

### Fase 3: el núcleo, primera entrega (unas 75-95 h de agente con la vara de 50-60 piezas)
- **Ostrevar completo (norte) y la Teocracia de Ankarú (sur):** las dos naciones tall prioritarias.
- **La Hegemonía Carmesí de Orunmar:** las guerras de cosecha, rival de Ankarú.
- **Por país:**
  - avances propios en las 6 eras, que son las bonificaciones de cada era;
  - 2 o 3 reformas únicas;
  - 1 edificio único con niveles y 1 unidad;
  - 1 situación o desastre;
  - 1 o 2 paquetes de misiones atados a la etiqueta;
  - eventos temáticos hasta llegar a la vara.
- **Por cultura:** sus modificadores, avances de cultura, un edificio y su lengua (nombres y topónimos originales).
- **Por religión:** su mecánica, dioses, aspectos, focos y lugares santos.
- **Prueba de el jugador A:** una sesión de unas 2 h con cada nación. Después, una re-auditoría única.

### Fase 4: el resto de facciones y los grupos temáticos (unas 90-130 h de agente)
- **Facciones:**
  - los Skarren, saqueadores por mar;
  - los enanos bajo las montañas del circo;
  - un reino de hombres del oeste;
  - una liga de comerciantes;
  - los atlantes supervivientes.
- **Paquetes por estilo:** cada estilo (constructores, comerciantes, saqueadores, guerreros, fantásticos) lleva un paquete de eventos y mecánicas compartido, de 15-20 piezas. Así cada país solo necesita sus 30-40 piezas únicas, y baja el coste.
- **Nombres:** los nombres nuevos son provisionales y originales. Antes de fijarlos se comprueba que no salen de Tolkien, de Anbennar ni de otras obras.

### Fase 5: pulido y la campaña
- Reequilibrio tras jugar.
- Se congelan las versiones: el juego, los mods y el mundo.
- El paquete final para el jugador B.
- Una partida de 10-20 años en multijugador.

**Total con la vara de 50-60 piezas:** unas 200-260 h de agente. Con la vara de Castilla contada (160-200 piezas por país), unas 450-550 h. El contenido es casi todo texto de salida, la parte más cara.

---

## 5. Diseño de contenido (resumen)

**Grupos temáticos y facciones.** Los nombres de Ostrevar, Ankarú, Orunmar y Skarren los eligió el jugador A; el resto se fijan en la fase 4.

| Estilo | Norte | Sur |
|---|---|---|
| Constructores (tall) | **Alto Reino de Ostrevar** | **Teocracia de Ankarú** |
| Guerreros | Reino de hombres del oeste | **Hegemonía Carmesí de Orunmar** (guerras de cosecha) |
| Saqueadores | **Skarren** (botín por mar) | — |
| Comerciantes | — | Liga mercante de las perlas y las especias |
| Fantásticos | Enanos bajo el circo (metales) | Atlantes supervivientes (islas) |

**Mecánicas clave, todas con piezas que existen en el motor:**
- **Tall:**
  - una decisión de «Llamar colonos al valle», que mueve población propia de las localizaciones llenas a las vacías;
  - edificios únicos de varios niveles («construir hacia arriba»);
  - una reforma que premia el desarrollo y castiga la expansión.
- **Guerras de cosecha:**
  - un casus belli `cb_gj_cosecha` copiado de la estructura de `cb_flower_wars`, barato y sin la penalización normal por agresión;
  - al ganar, `change_pop_type` a esclavos en minas y campos, o una ofrenda que da devoción;
  - una variable de devoción con pulso anual, que baja si pasan años sin guerra.
- **Saqueadores:** incursiones costeras con botín, con eventos y modificadores temporales.
- **Comerciantes:** la regla de recursos coloca perlas y especias a su lado; llevan privilegios y edificios de mercado.
- **Enanos:** su cuenca del circo es la zona de metales; llevan una unidad y un edificio de forja.
- **Recursos:** cuadran con quien vive allí: enanos con metales, comerciantes con perlas y especias, y las naciones tall con cultivos variados.

---

## 6. Qué tiene que hacer el jugador A

Siempre con el juego cerrado, sin estar jugando y con unos 8 GB de RAM libres. El horario lo coordina la coordinación.
1. **Fase 0:** desactivar el hub de RNW, decidir lo de National Destinies, definir `RNW_DATA` en W: y guardar la hoja en blanco del editor de tierras.
2. **Generar mundos:** en la fase 1, uno de serie; en la fase 2, el de nuestro dibujo. Hacerlo con 10-20 min de margen cada vez y dejarlos en la biblioteca, que nosotros leemos sin tocar.
3. **Pruebas en el juego:** en la fase 1 (45 min), en la fase 2 (30 min por mundo) y en la fase 3 (unas 2 h por nación). Hay que contar lo que se ve y, si sale algo raro, hacer una captura.
4. **Decidir** lo de la sección 8, todo de una vez.
5. **Enviar a el jugador B** el `.rnworld` y el zip del mod. Lo envía él: no enviamos nada en su nombre. Subirlo al Workshop, aunque sea en privado, es publicar y necesita su sí.

## 7. Qué necesita el jugador B

- **El mismo juego:** EU5 1.4.9 (build 26655995) y los mismos DLC (D000, D008, D009, D015 y D017). Uno de más o de menos cambia el mundo. Primero hay que mirar su lista.
- **Los mismos mods, en las mismas versiones y en el mismo orden:**
  - CMF 2.5.0, AAMO 1.4.1, REAI 1.4.2 y ND 1.4.4 (si se queda);
  - RNW 1.2.2 suscrito, para rehacer el mundo;
  - y nuestro mod, en `Documents/.../mod/`.
- **Para rehacer el mundo:** unos 8 GB de RAM libres y unos 2 GB de disco, con «Import» del `.rnworld` y `verify-world` para confirmar que sale idéntico. En el camino B, además, la copia parcheada o la carpeta del mundo, pendiente de revisión legal.
- **Antes de cada sesión:** comprobar que Steam no ha actualizado el juego ni los mods, y comparar el checksum en la sala.

## 8. Decisiones que esperan a el jugador A (respondibles con un «sí»)

- **D1, la vara de contenido.** Castilla tiene unas 262 piezas, no 80. **Recomiendo** 50-60 piezas por país en la primera entrega, que cubran las 6 eras, y crecer en las naciones que más jueguen.
- **D2, National Destinies.** **Recomiendo** quitarlo de la colección de esta campaña: choca con 5 formables y 50 ficheros americanos.
- **D3, el camino B** (clima y ríos). **Recomiendo** decidirlo después de ver el mundo de la fase 2.
- **D4, `reveal_at_start`.** **Recomiendo** activarlo, porque los dos empiezan en el Nuevo Mundo.
- **D5, el paso a el jugador B.** **Recomiendo** el `.rnworld` y el zip del mod, sin Workshop.

## 9. Riesgos y lo no probado

- **NOT_TESTED, del mundo:**
  - que RNW 1.2.2 genere y cargue sobre la 1.4.9;
  - `nodes.dat`, que es el de vanilla;
  - el checksum entre dos PC;
  - si `.metadata` entra en el checksum.
- **NOT_TESTED, de nuestro mod:**
  - la semántica de `REPLACE:` sobre las culturas y religiones americanas que coloca RNW;
  - `change_raw_material` en `on_game_start`, y cómo encaja con los trabajadores de cada recurso del arranque;
  - el casus belli copiado.
- **Si Steam actualiza el juego o un mod a mitad de campaña,** el mundo puede quedar inválido. No se ha comprobado si Paradox ofrece una rama para volver a la 1.4.9.
- **El juego cayó hoy a las 19:54** con 3,5 GB de RAM libres. Generar con poca RAM es arriesgado.

