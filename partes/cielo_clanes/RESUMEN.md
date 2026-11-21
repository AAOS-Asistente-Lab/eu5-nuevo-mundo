# RESUMEN: El Cielo de los Clanes (`gj_cielo_clanes`)

Religión de los Kaïvan (grupo `gj_fe_norte`). Mecánica: **dioses de duración limitada**, a la manera de tengri. Cada kan elige el dios de su reinado y el dios cae con él.

## Cifras reales (contadas con un guion sobre los ficheros)
- Bonificaciones de la religión: **22** líneas de modificador (4 `definition_modifier`, 8 en 4 aspectos, 10 en 6 dioses).
- Lugares sagrados: 2 tipos (8 líneas), sin locations.
- Modificadores estáticos propios: 18 (46 líneas): 6 de reinado, 2 de favor, 10 de sucesos.
- Total de líneas de modificador de la parte: **76**.
- Dioses: 6. Aspectos elegibles: 4 (se eligen 2). Eventos: 12 (11 visibles y 1 oculto).
- Decisiones: 2. Efectos con nombre: 7. On_actions propias: 4 (más 1 fichero de enganches).
- Situaciones, edificios y unidades: 0 (no los pide una religión).
- Localización: 114 claves, todas comprobadas contra lo que se usa.
- Llaves `{ }` equilibradas en los 11 ficheros de juego.

## Qué se nota al jugar
1. **El dios del reinado.** Al subir un kan (o al empezar, si no hay dios) sale el evento `.1`: seis opciones. Cada dios pone un modificador de reinado con una fuerza y un precio:
   - Aurak: ley y legitimidad, pero menos reclutas.
   - Ilsa: caballos y población, pero caballería pesada peor.
   - Korvun: caballería ligera y moral, pero estabilidad cara y legitimidad menor.
   - Halet: movimiento y alcance comercial, pero menos defensa.
   - Mura: comida y moral naval, pero caballería ligera peor.
   - Dzerek: desgaste al enemigo y botín, pero el prestigio mengua.
2. **Mudar de dios** a mitad de reinado: decisión de 150 de oro, 15 años de espera y una penalización de legitimidad y reclutas.
3. **El favor del Cielo** (variable de -6 a 6). Las buenas obras, los presagios bien leídos y la peregrinación lo suben. A 3 o más da un bonus permanente; a -3 o menos, un castigo.
4. **Presagios:** `gj_cielo_clanes_lee_presagio = { tipo = cometa | eclipse }`. Un cometa favorece a los dioses de guerra y viento. Un eclipse favorece a Korvun, Halet y Dzerek, y castiga a los demás.
5. **Cuatro reinados** seguidos (los que sean) abren el evento `.11` y un bonus permanente.

## Ficheros
- Religión, dioses, aspectos, lugares sagrados, color con nombre, modificadores estáticos, efectos, decisiones, on_actions, eventos y localización.

## Supuestos sin probar (NOT_TESTED)
- Que el motor acepte `add_god` / `remove_god` y `god:` en este contexto. Se dedujo del readme de `gods/` y de usos en el juego base.
- Que fusione `yearly_country_pulse` y `on_new_ruler` del fichero de enganches con los del base (ver NECESITA.md).
- El juego base añade **todos** los dioses al empezar a los países paganos. Por eso el peso de la mecánica va en `gj_reino_*`, no en el modificador del dios.
- Las aspectos tipo «worship_<dios>» del tengri no se han replicado, para no pasar de 4 aspectos.
## Ronda de reparación (cifras al 21-11)
- Comprobador: PASA, 0 errores, salida 0, 23 avisos (claves que solo el motor lee por convención).
- Sin cambios de cifras: 22 bonificaciones de religión, 76 líneas de modificador, 6 dioses, 4 aspectos, 12 eventos (1 oculto), 2 decisiones, 7 efectos, 114 claves de localización.
- Ningún nombre de esta parte está repetido con otra salvo «La tienda abierta» (mecánica compartida con kaivan, se queda).
