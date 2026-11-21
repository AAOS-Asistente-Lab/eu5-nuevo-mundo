# Resumen de la parte kaivan (contado sobre los ficheros, no pretendido)

## Cifras
| Pieza | Cantidad | Detalle |
|---|---|---|
| **Bonificaciones** (líneas de modificador, sin eventos) | **70** | 51 en avances (45 de país en 22 avances + 6 en 3 avances de cultura y de grupo), 9 en 3 reformas, 7 de la cultura (3 de país, 2 de location, 2 de personaje) y 3 del grupo cultural |
| Avances | 25 | 22 de país repartidos por eras (4, 4, 4, 3, 4, 3) + 2 de cultura kaivani + 1 de grupo cultural |
| Reformas de gobierno únicas | 3 | Círculo de Clanes (era 1), Ley de la Hierba (era 3), Gran Hogar de los Nueve (era 5) |
| Edificios | 5 | Campamento del Kan, Feria de las Yeguadas, Fragua de la Estepa, Atalaya de las Hogueras, Gran Tienda del Círculo; 13 métodos de producción, los avanzados abiertos por era, y el tope de niveles sube en las eras 2, 4 y 6 |
| Unidades | 2 (11 versiones) | Arqueros del Círculo (era 1 a 6) y Jinetes Lobo (era 2 a 6), con `copy_from` sobre la caballería ligera de cada era y `upgrades_to_only` |
| Familia de unidad | 1 | Cupo de los Jinetes Lobo: 1 más 1 por nivel de Campamento del Kan |
| Eventos | 26 | 7 de la mecánica (1-3 el Círculo, 20-23 la guerra de los hermanos) y 19 temáticos (30-47 por el pulso anual y el 48 tras la Gran Cabalgada) |
| Decisiones | 4 | Gran Cabalgada, Ganar el favor de un clan, Convocar el Círculo, Feria de Verano |
| Desastres | 1 | La guerra de los hermanos |
| Situaciones | 0 | El Círculo va con variables, eventos, decisiones y desastre, no con una situación del motor |
| Modificadores con nombre | 16 | todos los usan decisiones, eventos y desastre (se retiraron 4 sin uso); no cuentan como bonificaciones |
| Efectos y valores | 11 efectos, 6 valores | `gj_kaivan_*` en `scripted_effects/` y `script_values/` |
| Cultura, grupo, lengua, familia lingüística | 1 de cada | `gj_kaivani`, `gj_grupo_estepa`, `gj_kaivani_language`, `gj_estepa_language_family` |
| Localización | 271 claves | todas en castellano, UTF-8 con BOM |
| Piezas de flavor en total | 68 | 25 avances + 3 reformas + 5 edificios + 2 unidades + 1 desastre + 4 decisiones + 26 eventos, sin contar las bonificaciones de cultura y religión |

## La mecánica: el Círculo de los Clanes
1. **Cuatro clanes**, cada uno atado a una zona (`gj_zona_*`): Uzhar (estepa alta), Tarkhen (marca occidental), Ilbari (valles orientales) y Merghan (estepa baja). Sin tierra en su zona, un clan no puede ganar.
2. **Antes de la muerte del kan:** la decisión «Ganar el favor de un clan» suma favor a uno, con oro y cada 5 años.
3. **Al morir el kan** (`on_ruler_death_delayed`): el evento 1 deja apoyar a un clan. El resultado suma el favor, un empujón al azar de 0 a 16 y descarta a los clanes sin tierra.
4. **Resultado (evento 2):** la capital salta a la location más poblada de la zona del ganador, se levanta la Gran Tienda del Círculo allí, la capital vieja se queda con un Campamento del Kan gratuito, y la nueva recibe 25 años de «Sede del kan». El clan que reina da su modificador durante el reinado.
5. **Si queda reñido** (otro clan a menos de 8 puntos) salta el evento 3: pagar privilegios, dejar que el clan se marche con su zona (efecto `create_country_from_location`) o dejar que lo decidan las armas, que abre el desastre «La guerra de los hermanos» (a los 24 meses el Círculo exige la paz).
6. **Después:** el favor se reparte de nuevo, con el clan que reinó en mínimos, para que el poder rote por la estepa.
7. **La Gran Cabalgada:** decisión de 10 años con velocidad y saqueo, un cuarto más de mantenimiento de caballería y, a los diez años, una sequía de pastos.

## Equilibrio (MECANICAS H)
- **Arqueros del Círculo:** +15 % de daño a la moral y +1 de iniciativa, sobre la caballería ligera de su era. Debilidades: no asaltan fortalezas, +10 % de daño recibido, −15 % en costa y −10 % en sierra, y solo se reclutan donde domina la cultura kaivani.
- **Jinetes Lobo:** +0,25 de flanqueo, +1 de iniciativa y velocidad. Debilidades: +10 % de daño de moral recibido, −15 % en sierra y selva. Límite: 1 + 1 por nivel de Campamento del Kan.
- **Edificios:** ninguno pasa de un nivel respecto a su equivalente del juego base. El Campamento del Kan es más débil que el kurultai (menos reclutamiento, pero cría caballos), la Atalaya tiene tope de 4 niveles y la Tienda es única y solo existe en la capital.

## Comprobaciones propias hechas
- Llaves `{` y `}` equilibradas en los 16 ficheros de juego.
- Los 70 modificadores usados existen en `main_menu/common/modifier_type_definitions/` del juego base, contrastados con un volcado de 2.710 claves. Los bienes de los edificios existen en `common/goods/`.
- Todas las claves visibles (271) tienen localización y no sobra ninguna.
- Sin etiquetas de país, sin ids de location, sin letras de unidad ni rutas en los ficheros.
- Todos los ficheros `.txt` y `.yml` con BOM.

## NOT_TESTED (no se ha ejecutado el juego)
- Los `on_action` se suponen fusionables con los del juego base (ver NECESITA.md).
- El flujo del Círculo, el cambio de capital y la construcción del Campamento y de la Tienda con `cost_multiplier = 0`: la sintaxis sale de ejemplos del juego base, pero no se ha corrido.
- `create_country_from_location` para la secesión de un clan: es el efecto más arriesgado.
- `assault = no` en los Arqueros y las claves `local_*` de los edificios: salen de la documentación del juego, sin ejemplo directo.
- Los valores numéricos no se han probado en partidas de IA a 100 años; los topes son los de MECANICAS H, pero hay que recortar si Kaïvan se dispara.

## Lo que falta o queda para la integración
- Los 4 triggers `gj_zona_*` y `gj_es_kaivan`.
- El «dios del reinado» de la religión cielo_clanes no está enganchado al Círculo (lo define la parte de la religión).
- Sin iconos propios: los avances reutilizan iconos del juego base.
