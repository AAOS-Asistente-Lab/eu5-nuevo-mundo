# Durnhal: resumen (cifras contadas sobre los ficheros)

## Bonificaciones: 69 (la vara es 60-70, sin contar eventos)
| Origen | Piezas | Líneas de modificador |
|---|---|---|
| Avances de país, 6 eras | 25 | 48 |
| Avances de cultura | 3 | 6 |
| Reformas de gobierno únicas | 2 | 5 |
| Cultura `gj_durnhali` (país 3, location 2, personaje 2) | 1 | 7 |
| Grupo cultural `gj_grupo_enano` (país 2, location 1) | 1 | 3 |
| **Total** | | **69** |

Los avances por era: era 1 con 5, era 2 con 5, era 3 con 4, era 4 con 4, era 5 con 3 y era 6 con 4. Los de cultura están en las eras 1, 3 y 5.

## Edificios: 5, todos con mejora por era
- **Gran Forja:** niveles 1 a 6 según la era; armas, cañones y herramientas. Una por país.
- **Salón de los Ancestros:** solo en la capital; niveles 1 a 3 (sube en las eras 3 y 5); legitimidad y coste de estabilidad.
- **Fundición de veta:** tres recetas de acero que se desbloquean con avances (era 1, era 3 y era 5).
- **Hongueras hondas:** tres recetas de comida (legumbres) que se desbloquean con avances; compensa la falta de tierra de labor.
- **Baluarte de roca:** niveles 1 a 3 (sube en las eras 3 y 5); solo en montaña o colina; caro.

## Unidades: 3 cadenas, 18 versiones
- **Rompeescudos** (infantería pesada), **Ballesteros de galería** (infantería ligera) y **Bombardas de runa** (artillería): una versión por era, cada una con `upgrades_to_only` a la siguiente.
- **Fuerza:** −10 % de daño recibido (Rompeescudos), +10 % de daño causado (Ballesteros y Bombardas), +10 % en montaña y colina.
- **Debilidad:** Rompeescudos y Bombardas, lentos (−15 % y −20 %) y de construcción más larga; Ballesteros, con más desgaste de moral; todos con −10 a −15 % en llanura; Bombardas, además, frágiles (+10 % de daño recibido).
- **Límite:** Rompeescudos y Ballesteros, tantos regimientos como provincias; Bombardas, 4. Ya no se anuncia «una era antes»: el juego base trae artillería desde la era 1; la ventaja de la Bombarda es solo su precisión y su daño (+10 %), con los límites de arriba.

## Mecánica de MECANICAS C2: «Cavar más hondo»
- **Decisión repetible** que sube una mina de nivel, del 1 al 5 (tope por era: 2 hasta la era 2, 3 en la era 3, 4 en la era 4 y 5 desde la era 5), con más metal y más gemas en cada nivel (modificadores `gj_durnhal_mina_nivel_1` a `_5`).
- **Variable global `gj_inquietud_caldera` (0-100), de Durnhal:** sube con cada nivel cavado, con los hallazgos ambiciosos y con los eventos de profundidad. Se cambia solo con `set_global_variable` y un valor calculado (`value = global_var:… add = … min = 0 max = 100`), porque `change_global_variable` y `clamp_global_variable` no existen en el juego base.
- **Efecto ofrecido a otras partes:** `gj_durnhal_sube_inquietud = { PUNTOS = n }` (llama_profunda y mundo_bestias lo llaman en vez de escribir la variable). Hace lo mismo que `gj_durnhal_cambia_inquietud = { valor = n }`, que acepta negativos y crea la variable si falta.
- **Se baja** con el «Rito de contención» (−15) y sellando galerías (−10), que pierde dos niveles de una mina.
- **Efectos:** derrumbes que cuestan población, hallazgos de cámaras antiguas, temblores de aviso y, a partir de 85, el **desastre `gj_durnhal_lo_que_duerme_debajo`** (se cura al bajar de 40).
- **Decisiones: 5** (cavar, sellar, rito, encender la Gran Forja y Cónclave extraordinario). **Desastres: 1.** **Situaciones: 0.**
- **Modificadores estáticos: 20** (niveles de mina, estados de los eventos y de las decisiones).

## Eventos: 26
- **22 temáticos** (hallazgos, política de las Casas, cultura, comida, comercio, frontera, religión, población y ciencia), en el pulso anual con pesos; 6 de ellos solo una vez.
- **4 del desastre** (ids 30 a 33), disparados desde el propio desastre.
- **Opciones de evento: 57.** En el mismo namespace `gj_durnhal`.

## Localización: 287 claves (castellano, UTF-8 con BOM)

## Piezas de contenido, para la comparación con el juego base
Eventos 26 + avances 28 + reformas 2 + decisiones 5 + desastre 1 + edificios 5 + cadenas de unidades 3 = **70 piezas**, más 18 versiones de unidad, 20 modificadores estáticos y los 7 + 3 modificadores de cultura y grupo.

## Ficheros (18)
Avances, reformas, cultura, grupo cultural, lengua, familia lingüística, colores, unidades, edificios, valores, triggers, efectos, decisiones, desastre, pulsos, eventos, modificadores estáticos y localización. Más IDENTIDAD.md, NECESITA.md y este fichero.

## Lo que falta o no se ha probado
- **No se ha ejecutado el juego.** Sintaxis y vocabulario comprobados contra el juego base: los modificadores (2.658 definiciones, todas las usadas existen), los triggers y los efectos (cada palabra aparece en los scripts del juego base) y las llaves. Los puntos dudosos están en NECESITA.md («Cosas del motor a probar»).
- **Sin misiones ni formable** de país (el base no los trae por país, y el mapa no existe todavía).
- **Sin iconos gráficos** propios de edificios, unidades ni modificadores.
- **Equilibrio sin simular:** la prueba de IA sola de 100 años es de la integración.
