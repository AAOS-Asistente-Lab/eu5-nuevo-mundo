# VALIDACION: parte «ostrevar» (21-11)

Veredicto: ARREGLADO (1 fallo mecánico arreglado; el resto, correcto o pendiente no mecánico).

## Comprobaciones
| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` en los 15 `.txt`, sin comentarios ni cadenas | OK, todas equilibradas (p. ej. eventos 448/448, unidades 102/102, avances 84/84) |
| 2 | Localización | OK: 302 claves, sin duplicadas, sin líneas raras. Cada título, descripción, opción, avance, edificio, unidad, decisión, reforma, cultura, grupo, lengua y modificador estático tiene su clave. Las `desc` entre comillas propias (`GJ_OSTREVAR_*`) están en el .yml; las del motor (`BUILDING_LEVEL_*`, `SUBUNIT_LIMIT_BASE`) existen en el juego |
| 2b | Codificación | OK: los 16 ficheros llevan BOM (EF BB BF); el .yml empieza por `l_spanish:` |
| 3 | TAG, ids de location, rutas | 0 etiquetas de país, 0 `location:`/`province:`, 0 rutas ni letras de unidad. Ningún fichero fuera de `partes/ostrevar/` |
| 3b | Prefijo propio | Una incidencia, arreglada (ver abajo) |
| 4 | Claves del motor en G | OK. Los 379 identificadores no propios de los `.txt` existen en G, salvo `INJECT:` (sintaxis válida de FORMATO-EU5 §2: `INJECT:clave` en `common/`; `yearly_country_pulse` y `on_new_age` existen en `on_action/`), nombres propios de la lengua y los ids `a_gj_*`. Muestra verificada con su definición en G: las 18 plantillas `a_age_N_*_{light_infantry,heavy_infantry,artillery}`, `age_1_traditions` y `age_6_revolutions`, `burghers/nobles/peasants/clergy_estate`, `has_canonization` (religiones). Las 46 claves numéricas de modificador salvo `years` están definidas en `modifier_types` de G |
| 5 | Cifras de RESUMEN | Cuadran. Recontado por guion: avances de país 49, de cultura 6, reformas 9 (3 × 3), cultura 4, grupo 1: total 69 (vara 60-70: cumple). 5 edificios, 18 definiciones de unidad, 27 eventos, 4 decisiones |
| 6 | Equilibrio | OK. Unidades: máximo +10 % en un valor, con penalización (guardia: -15 % velocidad, -1 iniciativa; ballesteros: +10 % daño recibido; artillería: -25 % velocidad). Edificios: tope de nivel por avance de era y `allow` por población. Ningún valor de avance, reforma ni legado pasa de 0,15 |
| 7 | Obras ajenas | 0 coincidencias (Tolkien, Anbennar, Juego de Tronos, Warcraft y similares). Nombres propios genéricos |

## Arreglado
- **Variables sin el prefijo de la parte.** Las variables `gj_ost_corona`, `gj_ost_censo`, `gj_ost_santo`, `gj_ost_llamada`, `gj_ost_primera_piedra`, `gj_ost_legado_6`, `gj_ost_pop_prev`, `gj_ost_paz` y `gj_ost_conquista` no llevaban `gj_ostrevar_` (§3). Renombradas a `gj_ostrevar_*` en `events/` y `decisions/` (todas las apariciones, sin restos) y en `NECESITA.md`. Los ficheros conservan el BOM. Las variables y las decisiones son espacios de nombres distintos, así que `gj_ostrevar_primera_piedra` no choca con la decisión del mismo nombre.

## Pendiente (no mecánico)
- NOT_TESTED en el juego: `INJECT:` en `on_action` con `events = { ... delay = ... }`, `allow = { population >= 6 }` en edificios, `limit` de unidad por script value, `set_variable` con `years` (evento `.41`). Para probar: cargar el mod y mirar `error.log`.
- La Llamada de las Ciudades (`gj_ostrevar_llamada_ciudades`) da +25 % de atracción de migración y +20 % de velocidad de migración. Es una mecánica con coste (-5 % de crecimiento campesino, -10 % de satisfacción campesina, -1 de reputación diplomática), no un bonus de avance, pero es el valor más alto de la parte: vigilar en partida de IA. Es fija, no crece con prosperidad y tolerancia.
- `gj_ostrevar_cuenta_del_ejercito` definido y sin aplicar (lo aplica la integración).
- `gj_zona_estepa` solo lo usa el evento `.12`: si la integración no lo define, quitar ese evento.
- Los textos de las unidades 2 a 6 comparten la descripción de la primera.
- Equilibrio en partida sin medir: Cantería Real y Llamada de las Ciudades.


## Ronda de reparación
- Comprobador (comprueba-parte.mjs ostrevar) al empezar: PASA, 0 errores (0 textos que faltan y 0 otros), código de salida 0. Al acabar: PASA, 0 errores, salida 0, 117 avisos (claves de unidades, edificios y reformas que el motor lee por convención y ningún script nombra).
- Nombres repetidos: ostrevar no figura en ningún par de BALANCE §5 y ninguno de esos nombres aparece en su localización; no hay nada que renombrar.
- Textos propios de las unidades 2 a 6 (Guardia de la Ciudad, Ballesteros del Gremio, Artilleros de Muralla): añadidas 15 claves `a_gj_ostrevar_<unidad>_<2..6>_desc`. La localización pasa de 302 a 317 claves, con BOM.
- Sin tocar (no son de esta parte o lo manda el encargo): formato de INJECT en on_action, gj_ostrevar_cuenta_del_ejercito (lo aplica la integración), gj_zona_estepa (la define la integración; si no, quitar el evento .12; ya en NECESITA.md), equilibrio de la Llamada de las Ciudades y la Cantería Real (a vigilar en partida).
- Sin probar en el juego (NOT_TESTED): INJECT en on_action, llow con population, limit por script value.