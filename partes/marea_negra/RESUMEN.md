# RESUMEN: Hermandad de la Marea Negra (facción pirata, sur)

Cifras contadas sobre los ficheros entregados, no las previstas. Todo en castellano; sin etiquetas de país ni ids de locations.

## Bonificaciones: 68 (la vara de el jugador A: 60-70, sin contar eventos)
| Origen | Piezas | Líneas de modificador |
|---|---|---|
| Avances propios (6 eras) | 25 | 50 |
| Avances de cultura (`gj_mareano`) | 3 | 6 |
| Reformas de gobierno únicas | 3 | 6 |
| Modificadores de la cultura (`country_modifier` 2, `location_modifier` 2, `character_modifier` 2) | 1 cultura | 6 |
| **Total** | | **68** |

- Avances por era: 4 en la 1, 5 en la 2, 4 en la 3, 4 en la 4, 5 en la 5 y 3 en la 6. Cada uno con 2 modificadores y, casi todos, el desbloqueo de una unidad (18 líneas `unlock_unit`, una por versión de unidad).
- Los 3 avances de cultura son de las eras 1, 3 y 5.
- El grupo cultural `gj_grupo_sorava` es compartido con Sorava y lo define esa parte, así que aquí no suma bonificaciones (ver NECESITA.md).
- **Aparte, sin contar entre las 68:** 18 líneas de las 9 políticas de las 3 leyes del Código, 11 líneas de los 5 edificios y 36 líneas de los 17 modificadores estáticos de decisiones y eventos.

## Mecánica (MECANICAS D3)
- **El Código:** 3 leyes únicas, visibles con la reforma `gj_marea_negra_codigo_reform`, con 3 políticas cada una (9 en total):
  - cómo se reparte el botín (partes iguales, parte del capitán, fondo común);
  - cómo se trata a los cautivos (rescate, leva de bordo, sin cuartel);
  - quién puede ser capitán (abierta, por hazañas, casas de mar).
- **Almirante del Código:** `heir_selection:gj_marea_negra_almirante`, elección entre 4 candidatos cada 10 años (120 meses); los que fueron almirantes puntúan 100 más. El evento 20 deja elegir entre un estilo cauto, audaz o tratante, con un modificador de 10 años.
- **Patentes de corso:** 2 decisiones para los demás países (`contratar_patente`, `pagar_contrapatente`) y los eventos 23, 24 y 25. El que paga hostiga a un rival durante 5 años (-15 % de ingreso comercial y -10 % de eficiencia de exportación). El rival puede pagar el doble y dar la vuelta a la patente, que cae entonces sobre quien la contrató. La Hermandad cobra las dos veces.
- **Disolución:** los eventos 21 (aviso con 2 puertos o menos) y 22 (la Hermandad se deshace con 1 puerto o menos, con un modificador de 10 años de debilidad) sobre la comprobación anual. El Puerto Libre sube la inestabilidad local (`local_unrest`), que es su freno.
- **Decisiones propias** (4): izar la bandera negra, fundar un Puerto Libre, convocar el Cónclave de capitanes y abrir el contrabando.
- **Situaciones: 0. Desastres: 0.** La disolución se resuelve con eventos y modificadores, no con un desastre.

## Edificios: 5, con nivel máximo que crece con la era
Todos exigen `gj_es_marea_negra` y costa. El tope de nivel sube 1 por era hasta su techo.
| Edificio | Techo | Qué hace | Freno |
|---|---|---|---|
| Puerto Libre | 5 (era 5) | oro para el dueño, capacidad mercante | `local_unrest`: baja el orden |
| Astillero Corsario | 4 (era 4) | velocidad de construcción naval, marineros | solo costa |
| Sala de los Siete Nudos | 3 (era 3) | marineros y control local | techo bajo |
| Almacén del Botín | 4 (era 4) | capacidad mercante, protección del comercio | solo costa |
| Faro Falso | 3 (era 3) | desgaste a los enemigos que atacan | techo bajo |

## Unidades: 3 cadenas, 18 versiones (6 por cadena, 1 por era)
Cada versión copia la plantilla de su era (`copy_from`) y mejora con `upgrades_to_only`. Los números son los de cada era: +15 % en 1 o 2 valores y debilidad del 15-30 % o más.
| Cadena | Tipo | Fuerza | Debilidad | Límite |
|---|---|---|---|---|
| Bergantín Corsario: Falúa de Abordaje, Balandra Negra, Bergantín de Presa, Bergantín Corsario, Goleta Corsaria, Corbeta del Código | barco ligero | +15 % de velocidad y de bloqueo | -20 % de cañones, -15 % de casco, +10 % de daño de moral recibido | solo `gj_es_marea_negra` |
| Abordadores: Cuchilleros de Borda, Abordadores, Arcabuceros de Cubierta, Fusileros de Presa, Infantes de Cubierta, Tiradores del Código | infantería ligera | +15 % de daño en la costa y +10 % de daño a la fuerza | -15 % de daño tierra adentro, +10 % de daño de moral recibido | familia con cupo de 2 más los niveles de Puerto Libre |
| Contrabandista: Chalupa de Contrabando, Balandra Contrabandista, Balandra de Doble Fondo, Flauta Contrabandista, Goleta de Sombra, Clíper de Sombra | transporte | +15 % de capacidad y de velocidad | -15 % de casco, -30 % de cañones | solo `gj_es_marea_negra` |

## Eventos: 22 (16 de sabor y 6 de mecánica), 43 opciones
- **De sabor (1-16):** el nudo de las siete cuerdas, marea muerta, las cartas robadas, un capitán sin barco, el tributo del faro, la noche de las luces falsas, las cuentas del cofre de tres llaves, la ciudad que no quiso pagar, el eco del Mar Dormido, los hijos del botín, la taberna de las mil lenguas, el navío fantasma, la flota mercante que cambió de bandera, el rescate de un heredero, la ley de la plancha y el arsenal flotante.
- **De mecánica (20-25):** elección del Almirante, aviso de disolución, disolución, bolsa de patente, patente sobre nosotros y patente dada la vuelta.
- Los 16 de sabor salen del on_action `gj_marea_negra_pulso_anual` (45 % de salto al año y un peso 100 para cada uno, más un hueco vacío). Los 3 de control (20, 21 y 22) se miran todos los años.

## Resto
- 1 cultura (`gj_mareano`), 1 lengua con su dialecto y su familia (`gj_marea_negra_lengua`).
- 17 modificadores estáticos, 5 métodos de producción de mantenimiento, 6 valores de script (el cupo de abordadores y 5 de nivel por era), 1 familia de unidades.
- Localización: 292 claves en castellano, UTF-8 con BOM (todos los ficheros de la parte llevan BOM, como los del juego base).
- 23 ficheros: 20 del juego y 3 documentos (`IDENTIDAD.md`, `NECESITA.md` y este).

## Comprobaciones hechas
- Llaves `{` y `}` equilibradas en los 19 ficheros de script.
- Todos los identificadores de script y de modificador que usa la parte existen en el juego base 1.4.9 (se comprobaron contra todos los ficheros de `common`, `events` y `main_menu/common`: 0 desconocidos aparte de lo propio y de `gj_es_marea_negra`).
- Cada título, descripción y opción visible tiene su clave de localización; las únicas claves sin texto son variables internas.
- Sin etiquetas de país ni ids de location; sin rutas de disco, nombres de personas reales ni nombres de modelos.

## Lo que no se ha probado (NOT_TESTED)
- Nada se ha cargado en el juego (no se ejecuta). La lista de dudas del motor está en `NECESITA.md`.
- El equilibrio es de papel: las cifras de unidad están al 15 % del valor de su era y los edificios, un nivel por era con techo. Hay que mirarlo en partidas de IA de 100 años.
- No hay bloque de bonificaciones del grupo cultural: depende de Sorava.
- Faltan los iconos de avance y de edificio (se reutilizan los de `black_market`, `smuggler_cove` y `pirate_tavern` solo en los métodos de mantenimiento).
