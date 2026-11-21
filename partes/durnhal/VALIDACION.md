# Durnhal: validación (21-11)

Veredicto: **ARREGLADO**. Un fallo mecánico, corregido; el resto pasa. No se ha ejecutado el juego.

## Comprobaciones
1. **Llaves:** 17 ficheros .txt, `{` y `}` iguales en todos (sin comentarios ni cadenas). OK.
2. **Localización:** el .yml va en UTF-8 con BOM (EF BB BF), empieza por `l_spanish:`, sin claves repetidas y con todas las líneas bien formadas. Los 26 eventos (109 claves título, descripción y 57 opciones), las 5 decisiones (.title/.desc/.a), los 20 modificadores estáticos (NAME y DESC), avances, reformas, cultura, grupo, lengua, edificios, unidades y el desastre tienen texto. **Fallo hallado:** faltaba `GJ_DURNHAL_NIVEL_ERA`, la etiqueta que muestra el desglose de nivel por era de la Gran Forja, el Salón y el Baluarte (`script_values`). **Arreglado:** añadida («Mejora por era»). Ahora son 278 claves; RESUMEN.md corregido.
3. **TAG, ids, prefijos y ficheros:** sin etiquetas de país ni ids de locations (ni `location:`/`c:`). Todas las claves propias llevan `gj_durnhal_` salvo las del contrato (`gj_durnhali`, `gj_grupo_enano`, `gj_es_durnhal`, `gj_inquietud_caldera`) y dos auxiliares sin colisión (`gj_enano_language_family`, `gj_nivel_mina`). Nada fuera de `partes/durnhal/`. Sin letras de unidad en los ficheros.
4. **Claves del motor en el juego base:** muestra de 70 claves (categorías de decisión, efectos, triggers, valores como `stability_weak_bonus` y `guild_max_level`, eras `age_1`…`age_6`, categorías de edificio, tags gráficos) y los 77 nombres de modificador usados: todas aparecen en el juego base. Los `requires` e `icon` de los 28 avances existen como avances del base. Los 18 `copy_from` de unidades existen. OK.
5. **Cifras de RESUMEN.md:** recontadas y cuadran: avances de país 25 (48 líneas), de cultura 3 (6), reformas 2 (5), cultura 7, grupo 3 = 69 bonificaciones (vara 60-70). Edificios 5, unidades 3 cadenas × 6 = 18, eventos 26 con 57 opciones, decisiones 5, desastre 1, estáticos 20. Llegan a la vara: avances 28 (25-30), 2 reformas, 5 edificios, 3 unidades, eventos 26 (15-20 temáticos: son 22).
6. **Equilibrio:** unidades dentro del tope: Rompeescudos -10 % daño y moral recibidos con -15 % velocidad y -10 % en llanura; Ballesteros +10 % daño con +10 % moral recibida; Bombardas +10 % daño con -20 % velocidad y +10 % daño recibido. Ningún valor pasa del +20 %. Edificios con límite: Gran Forja y Salón únicos por país (Salón solo en capital), Baluarte solo en montaña/colina y caro, recetas desbloqueadas por avances. Minas: el coste de inquietud frena la subida.
7. **Obras ajenas:** sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft u otras. Sin nombres de personas ni de modelos. («Llama» solo es la religión propia.)

## Arreglado
- Añadida la clave `GJ_DURNHAL_NIVEL_ERA` al .yml (1).

## Pendiente (no mecánico)
- **La Bombarda «una era antes» no lo es:** el juego base ya trae artillería de la era 1 (`a_age_1_traditions_artillery`), así que la ventaja anunciada en MECANICAS C2 no existe. Decidir: quitarla o retrasar la artillería base en esta facción.
- **Gran Forja hasta nivel 6** con +10 % por nivel en armas y cañones: comparar con el equivalente del base («como mucho un nivel mejor») cuando haya simulación de IA.
- **Enganche en `yearly_country_pulse`:** el bloque repite el nombre del base; hay que probar si el motor lo fusiona (ya en NECESITA.md).
- **Motor sin probar:** `change_global_variable`, `clamp_global_variable`, parámetros `$valor$`, `allow` dentro de `unique_production_methods`, `max_levels` por era y `order_by` (ya en NECESITA.md). Las palabras existen en el juego base, pero no se han ejecutado.
- **Sin iconos propios, TAG, bandera ni escudo;** equilibrio sin simular (de la integración).

## Ronda de reparación (21-11)
Comprobador: `node herramientas/comprueba-parte.mjs durnhal`. Al empezar: FALLA, 20 errores (18 textos y 2 claves). Al acabar: **PASA, 0 errores, salida 0** (69 avisos, todos de claves de texto que ningún script usa).

Arreglado:
1. **`gj_inquietud_caldera`:** `gj_durnhal_cambia_inquietud` ya no usa `change_global_variable` ni `clamp_global_variable` (no existen en el juego base). Usa `set_global_variable` con `value = { value = global_var:… add = $valor$ min = 0 max = 100 }`, la forma de llama_profunda, y crea la variable a 0 si falta. Nuevo efecto con nombre `gj_durnhal_sube_inquietud = { PUNTOS = n }` para otras partes (en RESUMEN.md y NECESITA.md).
2. **9 textos que faltaban** (nombres de los métodos de producción de los edificios): mantenimiento de la Gran Forja, del Salón de los Ancestros y del Baluarte, los tres hornos de la Fundición y las tres camas de las Hongueras. Localización: 287 claves, UTF-8 con BOM.
3. **Bombarda «una era antes»:** quitada la afirmación de los 6 textos de los avances de las Bombardas y de RESUMEN.md, porque el juego base ya trae artillería en la era 1. La ventaja queda en precisión y daño (+10 %), con sus límites. No se toca ninguna cifra de equilibrio.
4. **Nombres repetidos:** ninguno de los pares de BALANCE.md es de Durnhal; no hay nada que renombrar.

Queda:
- **Gran Forja hasta el nivel 6:** medir contra el equivalente del base con simulación de IA (de la integración); no se ha tocado.
- **Ganchos de `yearly_country_pulse`:** formato sin tocar, lo reescribe la integración.
- **TAG, bandera, escudo e iconos:** de la integración. Motor sin probar (ver NECESITA.md).