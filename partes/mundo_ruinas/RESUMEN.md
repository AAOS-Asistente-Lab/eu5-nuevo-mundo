# RESUMEN: mundo_ruinas (A1 ruinas de los Antiguos y A2 vetas de poder)

## Cifras reales (contadas con script sobre los ficheros)
| Pieza | Cuántas |
|---|---|
| Modificadores estáticos | 41: 15 de location (9 de ruinas, 4 marcas de veta, guarnición y veta disputada) y 26 de país (8 niveles de veta, 4 efectos de década, el rito, 5 de expedición y eco, 8 artefactos) |
| Líneas de bonificación (modificadores) | 157 en total: 126 en modificadores, 18 en avances, 13 en edificios |
| Avances (saberes perdidos) | 6 (2 por tipo de ruina: era 2 y era 4; cada uno con `potential` que solo lo muestra una vez desbloqueado) |
| Edificios | 4 monumentos de veta, de 3 niveles cada uno |
| Decisiones | 3 (expedición, sellar una ruina despierta, rito de la veta) |
| Casus belli | 1 (`gj_cb_reclamar_veta`) |
| Eventos | 23, con 44 opciones, namespace `gj_mundo_ruinas` |
| Scripted triggers | 14 |
| Scripted effects | 19 |
| on_actions | 4 (dos enganches a `yearly_country_pulse` y `on_location_changed_owner`, más sus hijos) |
| Claves de localización | 224 (castellano, UTF-8 con BOM) |
| Ficheros | 11 |

## Qué hay
**Ruinas (A1).** Tres tipos: atlantes (de los Sumergidos), enanas (de los Cantores de Piedra) y de los Anteriores. Las pone la integración con `gj_zona_ruina_*`; el mod les pone una marca de localización cada año a las que ya tienen dueño.
- La decisión `gj_ruinas_expedicion` cuesta oro, se puede lanzar cada dos años y elige una ruina intacta de tierra propia con control.
- El evento .1 pide el enfoque: prudente, audaz o con escolta (cuesta más). Cada enfoque cambia los pesos de una tirada de cuatro niveles más la muerte del que la dirige:
  - hallazgo menor (.2): oro o prestigio y el modificador temporal del botín;
  - artefacto (.3): uno de 8 artefactos que solo existen una vez en el mundo; la afinidad cultural sube la probabilidad;
  - saber perdido (.4): un avance de la era siguiente según la edad (6 avances propios) más un impulso de investigación; o venderlo;
  - despertar (.5, .6, .7): guardianes, plaga de bestias o maldición; temporales, se pueden sellar con la decisión `gj_ruinas_sellar` o se calman solos;
  - la expedición no regresa (.8): muere un cortesano y se puede pagar una segunda.
- Los 8 artefactos son modificadores de país que viven en una location (variable), así que el que la conquista lo hereda y el que la pierde lo pierde. Al recibir uno se elige entre dejarlo en la ruina o llevarlo a la capital (se pierde si cae la capital). Lo calcula un pulso anual y el on_action de cambio de dueño. Cada artefacto lleva una desventaja: bueno sí, roto no.
- Tras explorar, la ruina queda «restaurada» (bonificaciones locales de desarrollo, defensa o saber según el tipo) y da pie a eventos de eco (.80 peregrinos, .81 contrabandistas).

**Vetas (A2).** Cuatro tipos (fuego, marea, raíz, estrella) en `gj_zona_veta_*`.
- Marca local permanente en la location (bonificaciones pequeñas) aunque no se construya.
- Monumento de 3 niveles por tipo (`gj_monumento_*`), caro y lento: `max_levels = 3`, `expensive`, coste creciente por nivel, mantenimiento en bienes, solo donde hay veta, indestructible a mano.
- Nivel 2: modificador de país modesto. Nivel 3: modificador de país mayor con su desventaja y un evento de la década propio del tipo (.40 la Gran Colada, .41 la Pleamar, .42 la doble cosecha de la Raíz, .43 la Conjunción).
- Conquista: el monumento pierde un nivel; el que gana y el que pierde reciben eventos (.30 y .31). El que pierde puede jurar recuperarla y recibe el casus belli `gj_cb_reclamar_veta`.
- Una veta cerca de la frontera da una reclamación al vecino (.50, cada ~15 años).
- Con una veta activa (nivel 2 o 3): eventos de magia y de bestias (.60 a .63), poca probabilidad, uno cada ~6 años por veta.
- Decisión `gj_ruinas_rito_veta`: ofrenda decenal con prestigio y legitimidad.

## Desviaciones y puntos [a probar] (de MECANICAS A1 y A2)
- «Bonificación regional» del nivel 2 de la veta: queda como bonificación de país modesta. No hay un modificador de región fiable en el motor.
- Las ruinas no son edificios `event_only`: son modificadores de location. Lo que hace de «ruina explorada» es una variable en la location.
- El «personaje que puede morir» es un cortesano elegido al azar (no el jefe real de la expedición): no hay un modo claro de asignarle un explorador sin crear personajes.
- `total_effective_building_levels` depende del acceso a bienes: si el mantenimiento no se cubre, el nivel efectivo puede bajar de 2,5 y el país perder el nivel 3. Es intencionado y es el freno de las vetas.
- El modificador de localización permanente (`add_location_modifier` sin `years`) y el `add_casus_belli` con `province` se han copiado de patrones del juego base, pero no se han probado en vivo.
- Nada se ha probado ejecutando el juego (norma del encargo). Las comprobaciones hechas: llaves equilibradas en los 11 ficheros, todas las claves visibles tienen texto, 0 etiquetas de país, 0 ids de location y 0 rutas; y todas las claves de modificador, de bien y de efecto que uso aparecen en los ficheros del juego base.

## Qué no hay
- Lugares sagrados sobre las ruinas (A1): lo harán las religiones con `gj_ruina_es_restaurada`.
- Mapa de ubicaciones: lo da la integración (ver NECESITA.md).
