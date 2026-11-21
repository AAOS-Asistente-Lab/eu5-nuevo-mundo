# RESUMEN: mundo_bestias (A3 y A4)

Parte de MUNDO. No lleva cultura, religión, avances, edificios ni unidades: no son de esta fila. Lo suyo son las bestias (el dragón, los krakens, las plagas) y los presagios (cometas y eclipses).

## Cifras reales (contadas sobre los ficheros)
| Pieza | Cuántas |
|---|---|
| Ficheros del juego | 8 (decisiones, on_action, efectos, triggers, valores, eventos, modificadores, localización) |
| Eventos | 30 (28 visibles y 2 ocultos), con 61 opciones |
| Decisiones | 5 |
| Modificadores con nombre | 27 (14 de país por el dragón y los krakens, 5 de presagios y bestias de país, 8 de location) |
| Líneas de modificador (bonificaciones) | 72 |
| Efectos programados | 12 |
| Triggers programados | 16 |
| Valores de script | 8 |
| Pulsos (on_action) | 5 enganchados al pulso anual de país, más el arranque (`on_game_start`) |
| Claves de localización | 193 (todas usadas, ninguna sin texto) |
| Situaciones y desastres | 0 (ver «Decisiones de diseño») |

Comprobación: llaves equilibradas en los 7 ficheros de script, 0 claves de texto que falten, 0 modificadores sin definir, 0 eventos sin definir, 0 rutas de disco, 0 etiquetas de país, 0 ids de location. El comprobador del mod fundido da «PASA»: 0 errores y 78 avisos, todos del tipo «clave de texto que ningún script cita» (nombres de modificadores y de decisiones, que el juego usa por su clave).

## El dragón: Kharuun, la Durmiente de la Caldera (A3)
- Estado global `gj_dragon_estado`: 0 dormido, 1 inquieto, 2 despierto. Si lo matan, aparece la variable global `gj_dragon_muerto` y no vuelve a haber dragón. Lo crea `on_game_start` (a 0).
- **Despierta** (0 a 1, evento .1): con la profundidad de Durnhal en 35 o más (`gj_inquietud_caldera`), con un dueño de la caldera en guerra o, aunque nadie la toque, desde la era de la Reforma. De 1 a 2 (evento .4): inquietud en 70 o más, guerra en la caldera desde el Descubrimiento, o sin más a partir del Absolutismo.
- **Despierto** es regional: el tributo de brasa (.5), la bajada por el valle (.6: location quemada con 12 % menos de población, pérdida de prosperidad, tropas chamuscadas y 10 años de «Tierra calcinada»; los muertos van a la Corte Insepulta con `gj_hrimval_recoge_caidos`), la ceniza fértil (.9) y el regreso al sueño (.8).
- **Quien tenga el pacto de la Llama Profunda** (variable de país `gj_llama_pacto_dragon`) se libra del tributo y del fuego y recibe «El nido protegido» (.7), con un pulso propio.
- **Cazarlo:** decisión «La Gran Cacería». Pide 25 regimientos, un general, 400 de oro, estar en paz y 15 años sin otro intento. 55 % de éxito con la Durmiente inquieta y 40 % con ella despierta. Éxito (.11): prestigio enorme y a elegir entre Escamas de Brasa (ejército), Corazón de Brasa (forjas) o la fama del cazador; los pactos de la Llama Profunda se rompen. Fracaso (.12): muere un general, el ejército sale malparado y la Durmiente queda furiosa (los dueños de la caldera sin pacto pagan 5 años de ira).
- **Aplacarla:** decisión «Aplacar a la Durmiente» (solo inquieta), con 50 % de que vuelva a dormir.

## Los krakens del estrecho (A3)
- Pulso anual solo para países con puerto en `gj_zona_estrecho`. Eventos: algo bajo el casco (.20, pierden una flota o pagan un cebo o cantan el rito del Mar Dormido, `gj_mar_calma_a_la_bestia`), mástiles en el agua (.21), las redes vacías (.22), el naufragio del «Cormorán Gris» (.23), la sombra bajo la quilla (.24).
- La probabilidad de .20 y .21 (peso 4) baja con la patrulla (-2) y con el rito del Mar Dormido (-2), y sube con la furia del kraken (+2).
- **Patrullar el estrecho** (decisión, 100 de oro, 8 años) y **Cazar al Coloso** (decisión, exige patrulla, 300 de oro y 12 años de espera): 40 % de éxito, o 60 % si el rito del Mar Dormido está en vigor. Éxito (.25): «Señor del Estrecho» 30 años. Fracaso (.26): se pierden dos flotas y el coloso queda furioso (más furia global y 6 años de modificador).

## Plagas de bestias (A3)
- Lobos grandes en la estepa (.30), wyverns en las cumbres (.31) y nubes de insectos en selva y humedales (.32). Cada una busca su terreno con triggers del juego (`vegetation`, `topography`); no hace falta zona propia.
- **La Batida** (decisión): un ejército propio sobre la location con plaga, 60 de oro. Limpia la plaga, deja «Comarca batida» 8 años, da tradición militar y el evento .34.
- Los pueblos de la estepa pueden domesticar lobos (.33, solo cultura `gj_kaivani`): 15 años de moral y caballería ligera.

## Cometas y eclipses (A4)
- **Cadena de presagios:** `on_game_start` arma un evento oculto (.46) a 5, 10 o 15 años; cada vez que salta, arma el siguiente de 25 a 37 años y llama a .40, que respeta un cerrojo global de 14 años. Sale una media de 2,7 presagios por era. Un pulso de respaldo muy raro (0,5 % por país y año) retoma la cadena si el país elegido desaparece.
- .40 elige cometa (60 %) o eclipse (40 %), fija `gj_presagio_tipo` (1 cometa, 2 eclipse) y lanza .41 o .42 a todos los países reales a la vez.
- **Opciones de todos:** buen augurio (moral y prestigio) o mal augurio (defensa), con seis nombres de cometa, uno por era, y tres descripciones de eclipse. Seguimiento a cuatro años (.44 y .45).
- **Cada religión lo lee a su manera:** tras la elección, `gj_mundo_bestias_lee_presagio_cometa` o `_eclipse` llama a las diez lecturas de religión (ver NECESITA.md). La Escarcha Silente adelanta la Noche Blanca con su propia lectura, así que esta parte no llama a `gj_noche_blanca_adelanta`.

## Decisiones de diseño (y lo que se aparta de MECANICAS.md)
- **Sin situación ni desastre propios.** El dragón y los krakens son del mundo, no de un país, y los desastres del juego son de un país. Se hicieron con variables globales, pulsos y eventos.
- **Los krakens, anuales y no mensuales:** un pulso mensual sobre todos los países con puerto cuesta más de lo que aporta. El efecto es el mismo (peso y probabilidad anuales).
- **Los cometas no usan `age_event`:** ese tipo de evento es la ventana de elección de era del juego. La cadena oculta hace de reloj.
- **Las Escamas y el Corazón de Brasa** no se pierden en guerra (MECANICAS lo dejaba abierto): son un modificador de 40 años.
- **Equilibrio:** ningún modificador pasa del +10 % en un valor, la Gran Cacería cuesta 400 de oro, 25 regimientos y 15 años de espera, y fallar duele más que acertar premia.

## Por probar (NOT_TESTED, no se ha ejecutado el juego)
- Que `kill_character` con `reason = battle` y el ámbito `leader` de un ejército funcionen como se escriben en `gj_mundo_bestias_pierde_un_general` (evento .12): el juego base usa las dos piezas por separado.
- Que `set_variable` con `years` acepte el vencimiento en variables de país (se usa para los enfriamientos).
- Que `random_navy` con `damage_unit_percent` hunda de verdad un navío (el base usa `random_navy` solo con `destroy_unit`).
- Que `weight_multiplier` con varios `modifier = { add = ... }` en los eventos .20 y .21 se combine como en el resto del juego.
- Que `yearly_country_pulse` de una parte se añada al del juego en lugar de sustituirlo (Durnhal usa el mismo patrón).
- Que el tamaño del mundo (número de países reales) no cambie la frecuencia de los pulsos: están hechos con probabilidades por país bajas.
- Partida de 100 años solo con la IA para ver cuánto dura el dragón dormido y con qué frecuencia caen los presagios.
