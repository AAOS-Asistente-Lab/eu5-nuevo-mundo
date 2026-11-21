# RESUMEN: Liga de las Mil Lagunas (clave `lagunas`)

Facción comerciante, pequeña y muy rica del norte. Cifras contadas sobre los ficheros, no previstas.

## Cifras
| Pieza | Cantidad |
|---|---|
| **Bonificaciones (líneas de modificador)** | **69** (63 en el recuento del revisor, otro criterio) |
| · avances propios del país (22, de la era 1 a la 6) | 46 |
| · avances de cultura (3) | 6 |
| · reformas de gobierno únicas (3) | 10 |
| · cultura `gj_lagunero` (país 2, location 1, personaje 1) | 4 |
| · grupo `gj_grupo_lagunas` (país 2, location 1) | 3 |
| Avances en total | 25 (22 + 3 de cultura) |
| Reformas | 3 |
| Edificios propios (con nivel máximo que sube por era) | 5 |
| Unidades (cadenas con una versión por era) | 3 cadenas, 17 versiones |
| Eventos | 21 (2 de la Asamblea, 1 del hielo, 18 temáticos) |
| Decisiones | 4 |
| Modificadores de país (`static_modifiers`) | 19 |
| Situaciones | 0 |
| Desastres | 0 |
| Ficheros | 15 (más IDENTIDAD, NECESITA y este) |

Sin contar la localización: 17 entradas de unidad, 25 avances, 3 reformas, 5 edificios, 19 modificadores, 4 decisiones y 21 eventos, todos con su texto en castellano.

## Qué hay
- **Cultura, grupo y lengua:** `gj_lagunero`, `gj_grupo_lagunas`, `gj_lagunas_language` (nombres originales), colores de mapa.
- **Avances:** 4 por era en las eras 1 a 3, 4 en la 4 y 3 en las 5 y 6; cada uno con 2-3 modificadores, y los que desbloquean edificios y unidades.
- **Reformas:** El Barquero Mayor (era 1), El Pacto de los Lagos (era 3) y La Liga de Hielo y Agua (era 5), de república.
- **Edificios:** Mercado Flotante (solo junto a lago), Muelle de los Barqueros, Casa de las Pesas y Medidas (solo en centro de mercado), Salón de la Asamblea (solo uno, en la capital) y Astillero de Barcazas (puerto de lago). El nivel máximo de cada uno crece con la edad (script_values). Cada uno queda un nivel por debajo o a la par de su equivalente del base.
- **Unidades:**
  - Patrulleros de Laguna (barco ligero, 6 versiones): +1/+2 de velocidad, menos casco y cañones; solo junto a un lago y con tope de 16.
  - Ballesteros del Dique (infantería ligera, 6 versiones): +15 % de daño a la fuerza, más frágiles de moral y -10 % en colinas y montañas; tope de 24.
  - Barcazas de Asedio (artillería, 5 versiones, desde la era 2): +15 % de bombardeo, -1 de velocidad; solo junto a un lago, tope de 8.
- **Mecánica C3:**
  - caminos de hielo (`land_cost_on_frozen_water`) con deshielo traicionero;
  - la Asamblea de Lagunas con elección del Barquero Mayor cada 8 años entre cuatro candidatos, cada uno con su modificador;
  - escoltas o tributo frente a los Skarren;
  - la Gran Subasta del Estrecho frente a Sorava.
- **Eventos:** 21, con pulso anual `gj_lagunas_pulso_anual` (40 % por año, con trigger propio en cada uno).
- **Localización:** `main_menu/localization/spanish/gj_lagunas_l_spanish.yml`, UTF-8 con BOM.
- **IDENTIDAD.md:** nombre, adjetivo, colores, nombres, 15 topónimos, tamaño, rivales y gobierno.

## Comprobación propia hecha
- Llaves equilibradas en los 14 ficheros de script: sí.
- Cada identificador del motor que usan los ficheros aparece en el juego base (215.000 identificadores comprobados): sí, sin ninguno desconocido salvo nombres propios de personas y `map_gj_lagunero` (se define aquí).
- Los 25 `requires` de avances existen en el base: sí.
- Cada clave visible (avances, reformas, edificios, unidades, modificadores, decisiones, eventos, cultura) tiene su texto: sí.
- Sin etiquetas de país, ni ids de location, ni rutas de disco: sí.

## Lo que falta o no se ha probado
- Nada se ha ejecutado en el juego: NOT_TESTED (ver `NECESITA.md`, apartado «Cosas a comprobar»).
- Faltan iconos propios (se reutilizan los del base).
- No hay situación ni desastre propios: las votaciones de la Asamblea van con eventos, variables con duración y decisiones. Si se quiere una situación de verdad, queda para una segunda pasada.
- Las cifras de equilibrio (capacidad de mercado de los edificios, deltas de unidades) no tienen prueba de partida de la IA sola.
- Los avances llevan 2-3 modificadores y suman 25, algo por debajo de los 25-30 que pedía el contrato en su cuenta más alta; la cifra de bonificaciones (69) cae dentro de 60-70.

## Ronda de reparación
- Comprobador de la integración: PASA, 0 errores, código 0. Sin cambios en los ficheros de contenido; las cifras de arriba siguen siendo las reales (recontadas: 46 + 6 + 10 + 4 + 3 = 69 bonificaciones, 25 avances, 3 reformas, 5 edificios, 17 unidades, 21 eventos, 4 decisiones, 19 modificadores).
- Nombres repetidos: lagunas conserva los suyos (va antes en orden alfabético que thalassar y sorava).
