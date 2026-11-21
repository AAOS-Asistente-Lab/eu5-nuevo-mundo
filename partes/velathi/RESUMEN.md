# RESUMEN: los velathi (cifras contadas con un script sobre los ficheros)

## Bonificaciones (líneas de modificador): 69
| Origen | Piezas | Líneas |
|---|---|---|
| Avances de país, de las 6 eras | 22 | 44 |
| Avances de cultura | 3 | 6 |
| Reformas de gobierno únicas | 3 | 9 |
| Cultura `gj_velathi` (país 3, location 2, personaje 2) | 1 | 7 |
| Grupo cultural `gj_grupo_velathi` (país, location, personaje) | 1 | 3 |

Los avances de país por era son 5, 4, 3, 3, 3 y 4. Cada avance de país lleva 2 líneas, y algunas son inconvenientes (construcción más lenta, menor alcance diplomático, crecimiento lento).

## Contenido aparte de las bonificaciones
- **Edificios: 5**, que suben de nivel con las eras (`gj_velathi_*_max_level`, +1 por era elegida): Arboleda Antigua, Salón de Raíces, Aserradero Vivo, Jardín de Sanación y Torre de Copas.
- **Unidades: 2 cadenas de 6 eras (12 entradas)**, con `copy_from` y `upgrades_to_only`. Los Arqueros del Umbral son ligeros y fuertes en bosque, y flojos en llano. La Guardia de la Raíz es pesada y lenta. Cada una tiene su familia con cupo por edificio.
- **Eventos: 20** (`gj_velathi.1` a `gj_velathi.20`).
- **Decisiones: 5**: Plantar el Bosque Antiguo, Convocar el concilio, Despertar al rey, Cerrar los caminos y Abrir los caminos.
- **Modificadores estáticos: 22** (temporales de la mecánica, de eventos y de decisiones; no cuentan como bonificaciones).
- **On_actions: 3**, **efectos con nombre: 4**, **valores de script: 7** (5 niveles de edificio y 2 cupos).
- **Cultura, grupo, lengua y familia de lengua**: 1 de cada una, con 15 apellidos de dinastía, 30 nombres masculinos y 25 femeninos.
- **Situaciones y desastres propios: 0**. La mecánica se resuelve con variables, eventos, decisiones y modificadores.
- **Claves de localización: 256**, todas en castellano. Los ficheros de localización van en UTF-8 con BOM.
- **Piezas de contenido propio, en total (avances 25, reformas 3, edificios 5, unidades 2, eventos 20, decisiones 5, cultura, grupo y lengua 3): 63.**

## La mecánica (MECANICAS D6)
1. **Reyes que viven siglos.** La cultura da +150 de esperanza de vida de personaje y menos fertilidad. La reforma Corona de Siglos suma legitimidad y baja el desgaste de estabilidad.
2. **Cansancio del trono.** Una variable cuenta los años del mismo rey (`gj_velathi_anyos_reinado`). Cada 25 años salta el evento `.2` y sube el cansancio, hasta tres niveles que bajan la investigación. La decisión Convocar el concilio lo quita a cambio de prestigio.
3. **El Sueño Largo (`.3`).** Desde los 75 años de reinado, el rey puede dormirse. El consejo gobierna 15 años, o se le despierta antes con un coste. El evento `.4` lo devuelve con el modificador «Rey renovado».
4. **Plantar el Bosque Antiguo.** Una decisión para locations con poco desarrollo: recupera antes población y control, desgasta al ejército enemigo y sube el karma. Después de 10 años llega el evento `.16`.
5. **Karma de la Senda Verde.** Conquistar baja el karma, plantar lo sube y talar en guerra lo baja. Los efectos solo actúan si el país sigue esa religión.
6. **Aislamiento.** Las decisiones de cerrar y abrir los caminos son temporales y excluyentes.

## Equilibrio
- Unidades: +10 % de daño y +1 o +2 de iniciativa en el arquero, y -10 % de daño recibido en la guardia. Cada una tiene una debilidad en llano y un cupo ligado a edificios. Los arqueros del Umbral reciben más daño de morale (+5 %), y la guardia se mueve un 10 % más despacio.
- Edificios: cada uno tiene una restricción (bosque, cultura velathi, mercado de madera, no megalópolis, solo localidades) y una desventaja (el aserradero resta prosperidad).
- Los avances de país mezclan bonificaciones con inconvenientes.

## Comprobaciones hechas (script en Node sobre los ficheros)
- Llaves `{` y `}` equilibradas en los 17 ficheros de script.
- Los 100 % de los modificadores existen en las definiciones del juego, y los de cultura, grupo y modificadores estáticos tienen la categoría correcta (país, location o personaje).
- Todas las claves `requires` y `copy_from` existen en el juego base.
- Cada clave visible tiene su texto, salvo el mantenimiento de la Torre de Copas, que usa uno del juego.
- No hay etiquetas de país, ids de location ni rutas de disco en los ficheros.

## No probado
Nada se ha ejecutado en el juego. Las dudas están en `NECESITA.md`.

## Ronda de reparación
- Ficheros de la parte: 22 (17 .txt, 1 .yml y 4 .md; el recuento anterior de 22 con 3 .md estaba mal por uno).
- Colores nombrados: 3, ahora dentro de colors = { } en main_menu/common/named_colors/.
- Comprobador de la integración: 2 errores, ambos de ganchos (ver NECESITA.md).
