# RESUMEN: minores_norte (cifras contadas sobre los ficheros)

Ocho menores con nombre y tres paquetes de estilo. Todo se activa por cultura; no hay etiquetas, ids de location ni `gj_es_*`.

## Cifras
| Pieza | Cuántas |
|---|---|
| Menores con nombre | 8 (3 ciudades-estado, 3 clanes, 2 marcas) |
| Culturas | 8, cada una con su modificador de país, de location y de personaje (7 líneas por cultura) |
| Lenguas y dialectos | 5 lenguas, 8 dialectos |
| Avances | 27: 11 de estilo (ciudad-estado 3, clan 3, marca 5, con la atalaya y la cadena de la Guardia) y 16 de cultura (2 por cultura, edades 2 y 4) |
| Edificios | 2 (Lonja de Pesas, Atalaya de Marca), de un solo nivel cada uno |
| Unidades | 4 (Guardia de Marca, una por era, de la 2 a la 5, encadenadas con `copy_from` y `upgrades_to_only`) |
| Eventos | 26: 6 de ciudad-estado, 7 de clan, 5 de marca y 8 propios (uno por menor, una sola vez por partida) |
| Decisiones | 6 (2 por estilo) |
| Misiones | 3 paquetes de 3 tareas |
| Modificadores de evento y decisión | 32 (30 de país y 2 de location) |
| Triggers propios | 6 |
| On_actions | 13 (el pulso anual, 3 de estilo, uno que reúne los propios y 8 propios) y un fichero de enganche |
| Ficheros | 18 (14 del juego y 4 de documentación) |
| Claves de localización | 303, todas con texto; sin sobrantes |

**Bonificaciones** (líneas de modificador contadas con una regex sobre los ficheros): 141 en avances (52), culturas (56), edificios (5) y unidades (28). Además hay 69 en los modificadores de evento y de decisión.

**Piezas por estilo** (paquete compartido):
- Ciudad-estado: 3 avances, 1 edificio, 6 eventos, 2 decisiones, 1 misión, 10 modificadores.
- Clan: 3 avances, 7 eventos, 2 decisiones, 1 misión, 11 modificadores.
- Marca: 5 avances (los 4 últimos desbloquean la unidad), 1 edificio, 4 unidades, 5 eventos, 2 decisiones, 1 misión, 9 modificadores.

## Equilibrio
- **Guardia de Marca:** -10 % de daño recibido en fuerza y en moral (por debajo del tope del 15-20 %). Frena: -10 % de daño causado, -10 % de velocidad, +25 % de tiempo de formación. Límite de lugar: solo se recluta en tierras de marca. Fuerte en colinas y montaña (+10 %).
- **Edificios:** un solo nivel, sin cadena, y solo en ciudades o mayores (la Lonja) o en pueblos y ciudades (la Atalaya), en tierras de su cultura dominante.
- **Culturas y avances:** valores del 5-15 % en cosas que el juego base ya da por avance. Las culturas no pasan de 3 líneas de país.
- **Eventos y decisiones:** cada opción cuesta algo (oro, estabilidad, legitimidad, prestigio o un modificador malo). Los modificadores buenos duran de 5 a 30 años y se extienden, no se suman sin límite. Las decisiones repetibles llevan enfriamiento.

## Comprobación hecha
- Llaves equilibradas en los 13 ficheros de script.
- Cada clave visible tiene su localización y no sobra ninguna (script de comprobación, resultado 303 de 303).
- Todos los identificadores de los ficheros, salvo los `gj_` y los nombres propios de las lenguas, existen en los ficheros del juego base (comprobado contra los ficheros de `in_game` y de `main_menu/common`).
- Sin etiquetas de país, sin ids de location, sin rutas ni nombres de personas ni de modelos.
- Codificación: UTF-8 con BOM en todos los ficheros.

## Lo que NO se ha podido comprobar (sin ejecutar el juego)
Hay que probarlo al integrar:
- **El enganche del pulso anual.** Depende de que el motor fusione on_actions del mismo nombre. Si no, hay una línea que meter a mano (ver `NECESITA.md`).
- **Un identificador que existe no es lo mismo que se use en el sitio correcto.** La comprobación fue por existencia, no por contexto. Los puntos con más riesgo:
  - las claves de modificador por ámbito (por ejemplo `trade_income` o `army_tradition_decay` como modificador de país);
  - `capital = { add_location_modifier = ... }` en eventos;
  - `set_variable = nombre` sin valor en las misiones;
  - los campos del edificio (`employment_size`, `category`, `estate`), copiados de `bardic_school`;
  - los iconos de las misiones (`generic_traditional_economy`, `glorious_arms`), reutilizados del juego base.
- **Lenguas sin `family`.** Se siguió el ejemplo de la lengua báltica del juego base, que tampoco la lleva.
- **Los grupos culturales `gj_grupo_*`.** Hacen falta antes de cargar (ver `NECESITA.md`).
- **Equilibrio en partida.** Falta la partida de la IA sola a 100 años que pide MECANICAS H.

## Lo que queda por hacer (si hay tiempo)
- Un avance de cultura de la era 6 por menor. Ahora tienen dos, de las edades 2 y 4.
- Un tercer evento temático por menor, o cadenas de dos eventos.
- Lo de las religiones de los menores (decisión de la integración; ver `NECESITA.md`).

## Ronda de reparación (21-11)
- El comprobador de la integración da 9 errores, todos de misiones (las 9 claves de tarea, que el comprobador no registra como definiciones anidadas; ver NECESITA.md). Textos que faltan: 0.
- Se renombró el avance de Vigía Alto «Pasos cerrados» (repetido con ankaru) a «Cerrojo de la Cañada».
