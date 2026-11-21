# RESUMEN: Thalassar (atlantes supervivientes, sur)

Parte de facción completa, escrita contra los formatos del juego base 1.4.9. **No se ha ejecutado el juego ni el generador**: todo lo de abajo es `NOT_TESTED` en vivo. La comprobación propia fue estática (ver el final).

## Cifras reales (contadas con script sobre los ficheros)
| Pieza | Cifra |
|---|---|
| **Bonificaciones de país y cultura** | **70 líneas de modificador** (vara de el jugador A: 60-70; ajustado en la validación) |
| · avances de país (24, seis eras: 4 por era) | 46 |
| · avances de cultura talasia (3: eras 1, 3 y 5) | 6 |
| · reformas únicas de gobierno (3) | 12 |
| · cultura `gj_talasio` (país, location y personaje) | 4 |
| · grupo cultural `gj_grupo_talasio` | 2 (y 5 de demanda de bienes, no contadas) |
| **Edificios** | 5 propios × 3 niveles de era = **15 tipos** |
| **Unidades** | 3 propias × 6 eras = **18 tipos** (más 3 familias con cupo) |
| **Eventos** | **30** en el namespace `gj_thalassar` (20 temáticos, 5 de fase, 4 del desastre y 1 de aviso) |
| **Decisiones** | **8** (5 fases de la Ciudad Hundida + 3 de apoyo) |
| **Desastres** | **1** («El peso de los siglos») |
| **Situaciones** | **0** (ver «Desviaciones») |
| Modificadores con nombre (fases y eventos) | 29 |
| Ficheros | 21 (incluidos estos 3 `.md`) |

Piezas de contenido propio contables (a la manera de Castilla): 24 + 3 avances, 3 reformas, 15 edificios, 18 unidades, 30 eventos, 8 decisiones, 1 desastre = **102 piezas**, más la cultura, el grupo, la lengua y la mecánica.

## Qué hay
- **Avances (`advances/`):** 24 de país con `potential = { gj_es_thalassar = yes }`, en cadena (`requires`) y cubriendo las seis eras (claves comprobadas: `age_1_traditions` a `age_6_revolutions`), y 3 de cultura con `culture = culture:gj_talasio`. 18 de ellos desbloquean (`unlock_unit`) una versión de las 3 unidades.
- **Reformas (`government_reforms/`):** «Consejo de las Mareas» (desde el principio), «Custodios del Arrecife» (se desbloquea en la fase 2) y «La Corona Emergida» (se desbloquea en la fase 5).
- **Cultura (`cultures/`, `culture_groups/`, `languages/`, `language_families/`, colores):** talasios, lengua con 30 nombres de hombre, 30 de mujer, 18 de dinastía y 10 de baja cuna, todos originales.
- **Edificios (`building_types/`):** cada uno en 3 niveles que se hacen obsoletos (`obsolete`), como `dock` a `shipyard`:
  - **Faro de Marea** (puerto): +puerto, marineros, menos desgaste, protección del comercio; da 1, 2 o 3 cristales al año según nivel.
  - **Barrio Emergido** (puerto): cultura, migración, instituciones; exige la fase de la Ciudad Hundida (1, 3 y 5).
  - **Jardín de Perlas** (solo en perlas o pesca): rendimiento de perlas y pesca.
  - **Academia de las Mareas** (solo en la capital): alfabetización e instituciones; fases 0, 2 y 4.
  - **Arsenal Sumergido** (solo con Faro en el mismo puerto): construcción naval.
  Todos cuestan **cristales de marea** al construir (efecto `on_built`) y piden mantenimiento de bienes del juego base.
- **Unidades (`unit_types/`, `unit_families/`):**
  - **Nave de Marea** (barco ligero): +15 % de velocidad; casco y artillería menores (-25 % al principio) y más tripulación (+20 %). Cupo de familia: 12.
  - **Galera de Cristal** (galera): +15 % de artillería; más lenta (-0,25) y +30 % de tripulación. Cupo de familia: 4.
  - **Guardia de Marea** (infantería pesada): -10 % de daño recibido a fuerza y a moral, -5 % de daño hecho; +10 % de combate en costa y -10 % tierra adentro. Cupo de familia: 10.
  Respetan la regla de MECANICAS H: como mucho +15 % en 1-2 valores, con debilidad y límite.
- **Mecánica D1, «Alzar la ciudad hundida»:**
  - Variables de país: `gj_cristales_marea` (la moneda), `gj_alzar_fase` (0-5) y `gj_decadencia` (años de estancamiento).
  - Cinco decisiones encadenadas piden oro, cristales y una condición cada una: fase 1 sin condición, fase 2 era 2 y paz, fase 3 era 3 y dominar el mar interior o una ruina atlante, fase 4 era 4 y estabilidad, fase 5 era 5 y estabilidad. Cada fase pone un modificador permanente al país y otro a la capital (ahí «emerge» el barrio), da desarrollo y lanza un evento de fase.
  - Cristales: 1 al año de base, más 1/2/3 por cada Faro de Marea (nivel), más la decisión «Cosecha de cristales».
  - Peligro: la decadencia sube 1 al año mientras la ciudad no haya emergido; a los 20 avisa (evento) y a los 30 puede saltar «El peso de los siglos» (nobleza contra la corona). Se corta con la decisión «Concilio de las Mareas» (-15 de decadencia, cada 10 años) o subiendo de fase.
  - «Jubileo de las Mareas»: decisión de una sola vez desde la fase 3.
- **Eventos:** 20 temáticos repartidos por `on_action` en dos pulsos (anual y bienal) con peso y filtro por era; los de fase (21-25), los del desastre (26-29) y el aviso (30). Con sabor: el Canto de las Conchas, la Perla Negra, la sirena del faro, la marea muerta, la procesión del reflujo, etc.
- **Localización:** `main_menu/localization/spanish/gj_thalassar_l_spanish.yml`, UTF-8 con BOM, 323 claves, solo castellano.

## Desviaciones del encargo, a conciencia
1. **Sin situación formal.** MECANICAS pedía «una situación en 5 fases». Una situación en EU5 es un objeto global con variables, resoluciones y `visible`, y no hay ninguna de un solo país para copiar con seguridad. Se hizo con cinco decisiones, tres variables de país y un desastre, que es el patrón de los países del juego base (`mll_*`). Si el jugador A quiere el panel de situación, se envuelve encima sin cambiar nada.
2. **Cristales de marea como variable, no como bien.** Añadir un bien nuevo exige tipo de RGO, precios, demanda e interfaz. Queda como la opción «a probar» de MECANICAS D1. Mientras tanto, los cristales no se venden en el mercado (la decisión de cosecha y el evento 2 dan oro directo).
3. **«Sin desgaste en sus aguas» de las Naves de Marea no está.** El motor no tiene un modificador de unidad condicionado a «mis aguas». Lo que queda: son más rápidas y el Faro de Marea baja el desgaste de la costa.
4. **El formable «Thalassar Restaurada» lo escribe la integración** (necesita tag, bandera y geografía). La condición está lista: `gj_thalassar_ciudad_alzada`.
5. **Bonificaciones: 70.** La primera versión llegó a 73; la validación quitó las tres líneas previstas (`global_nobles_estate_power` de «La Corona Emergida», `naval_damage_taken` de «Bastiones de Coral» y `global_population_growth` de «Medicina del Agua»). Ver VALIDACION.md.
6. **Sin misiones.** El encargo no las pedía; las decisiones de fase hacen su papel.

## Comprobación propia (hecha)
- Llaves `{` y `}` equilibradas en los 17 ficheros de script.
- Todos los identificadores que no empiezan por `gj_` aparecen en los ficheros de `common` y `events` del juego base o en las definiciones de modificadores (script de comparación sobre 212.000 tokens): 0 desconocidos, salvo nombres propios de la lengua y los 4 colores `map_gj_*` que se definen en esta parte.
- Localización: 106 definiciones con su texto; 30 eventos con título, descripción y todas sus opciones; 0 claves sin localizar; todo modificador con nombre usado está definido y todo definido se usa.
- Sin etiquetas de país, sin ids de location, sin rutas de disco, sin nombres de personas ni de modelos.
- **No comprobado en vivo** (lo que puede fallar): que el motor acepte la clave `on_action` repetida del juego base para engancharse; que `unlock_unit` admita más de uno por avance; la sintaxis exacta de `limit = N` en las familias de unidades; los efectos `capital = { change_development = ... }` y los triggers de ámbito de location en `location_potential`; el uso de `$N$` en los scripted triggers con `var:...`; que el desastre acepte la imagen reusada. Cada uno de ellos tiene un ejemplo en el juego base del mismo tipo, pero ninguno se ha ejecutado.


## Ronda de reparación
Comprobador: 0 errores. Avance `gj_thalassar_diques_y_esclusas` renombrado a «Malecones del Reflujo». La variable `gj_ruina_atlante_explorada` la fija ahora el evento `gj_thalassar.3` (opción a). Cifras: 70 bonificaciones, 30 eventos, 323 claves de localización.
