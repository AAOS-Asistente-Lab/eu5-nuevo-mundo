# Validacion: minores_sur

Veredicto: ARREGLADO. 1 hallazgo mecanico, corregido. Los demas puntos pasan; quedan 5 pendientes no mecanicos. No se ejecuto el juego.

## Comprobaciones
1. **Llaves:** 17 ficheros de script, comentarios y cadenas fuera, abiertas = cerradas en todos (por ejemplo eventos 265/265, unidades 90/90, decisiones 73/73). OK.
2. **Localizacion:** el .yml empieza por `l_spanish:` y lleva BOM (EF BB BF). 359 claves, todas con forma `clave: "texto"`. Cobertura:
   - 29 modificadores temporales, cada uno con `STATIC_MODIFIER_NAME_` y `STATIC_MODIFIER_DESC_`;
   - 37 eventos, con titulo, descripcion y opciones (72 `option`); todos los `title`, `desc` y `name` usados existen;
   - cultura, lengua, avances, decisiones (titulo, descripcion, boton), edificios, unidades y niveles: 0 faltan.
   - Los ficheros de script van sin BOM, como los del juego base de su tipo (FORMATO 2.3). OK.
3. **Identidad y prefijos:** 0 TAG de pais, 0 ids de location o provincia, 0 letras de unidad o rutas. Todas las claves propias llevan `gj_minores_sur_`, o `gj_<cultura>` y `a_gj_minores_sur_` (cultura, lengua y avance, como pide la tabla 6). Ningun fichero fuera de `partes/minores_sur/`. OK.
4. **Claves del motor:** se extrajeron las 218 claves de izquierda (modificadores, efectos, triggers, bloques) y 109 valores (eras, iconos, `requires`, bases de unidad, bienes) y se compararon con todos los tokens de `in_game` y `main_menu` del juego base. 0 faltan. Las 18 bases `copy_from` existen en `00_age_templates_land.txt`. Es comprobacion por nombre, no por ambito. OK.
5. **Cifras de RESUMEN.md:** recuento propio. 27 avances (21+6), 42+12 lineas de modificador en avances, 56 de cultura (7x8), 29 modificadores temporales, 37 eventos y 72 opciones: cuadran. Total 110, por encima de la vara de 60-70 (la vara es de facciones; para menores solo pide "misma calidad"). Sin relleno vacio.
6. **Equilibrio:** ningun valor de unidad pasa de +-0.15 (la mayoria +-0.05/0.10); el tope de la seccion 7 es +15-20 %. Edificios con fuerza, debilidad y limite de lugar.
7. **Obras ajenas:** sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos ni Warcraft. Unico acierto de la busqueda: la palabra «Hordana» (nombre femenino inventado), falso positivo.

## Arreglado
- `gj_minores_sur_unidades.txt`: el Jinete de Frontera (6 versiones) tenia `flatland = -0.10` frente a `hills = 0.15`, contra lo que decia RESUMEN («el +15 % solo vale en su terreno, con una penalizacion igual o mayor fuera»). Subido a `-0.15` en las 6 lineas. Las 12 llaves de ese fichero siguen equilibradas.

## Pendiente (no mecanico)
1. MECANICAS H dice que los menores llevan 0 o 1 edificio y 0 o 1 unidad, compartidos por grupo cultural. Esta parte lleva 3 edificios y 3 cadenas de unidades por estilo. No lo recorto yo: decide la mesa.
2. Eventos: 37 para 7 menores (no hay vara numerica para menores). Revisar el tono y el equilibrio al integrar.
3. Ambito de los modificadores (`character_*`, `local_*` dentro de `cultures`) y `on_actions` anidado como lista: NOT_TESTED, hay que cargarlos en el juego.
4. El valor de los edificios frente a su equivalente del juego base (un nivel como maximo) no se pudo medir sin partida.
5. Dependencias de la integracion, ya en NECESITA.md: los 5 grupos culturales de otras partes, anadir `gj_minores_sur_pulso_anual` a `yearly_country_pulse` y crear los 7 paises con sus locations.

## Ronda de reparacion
- Comprobador (comprueba-parte.mjs minores_sur): al empezar, 17 errores (todos colores sin definir); al acabar, 0 errores, salida 0, 74 avisos (claves de texto que solo usa el motor, sin script que las nombre).
- Causa: el fichero de colores nombrados no llevaba el bloque envolvente colors = { }, asi que ninguno de los 17 colores (7 de cultura, 7 de lengua, 3 de familia) se registraba. Envuelto, sin cambiar valores.
- Nombres repetidos: el modificador Juramento renovado (kaivan, minores_sur, mundo_bestias; kaivan va antes en orden alfabetico) pasa a llamarse Voto de las Siete Rampas. Ceniza fertil (minores_sur va antes que mundo_bestias) y Cazadores del dosel (minores_sur va antes que orunmar) los conserva esta parte; renombran las otras. Pasos cerrados no es de esta parte.
- Pendientes de BALANCE y VALIDACION: los 5 puntos siguen igual. Vara de menores y 3 edificios y 3 unidades frente a 0-1 por grupo los decide el jugador A o la mesa; el resto necesita partida (NOT_TESTED) o la integracion (NECESITA.md). Sin recortes de equilibrio deshechos ni ganchos tocados.
