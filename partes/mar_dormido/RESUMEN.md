# RESUMEN: El Mar Dormido (`gj_mar_dormido`)

Religión de los ritos de marea. Mecánica del motor: `has_rite_power` (Poder de Rito). Una escuela: `gj_escuela_marea_negra`. Cifras contadas sobre los ficheros.

## Cifras
| Pieza | Cantidad |
|---|---|
| Bonificaciones de la vara del contrato (definición + aspectos) | **19** (6 de definición + 13 de 4 aspectos) |
| Aspectos elegibles (`religious_aspects = 2` de 4; Costa Mansa y El Pulso Rojo se excluyen) | 4 |
| Dioses y focos | 0 (la mecánica usa ritos, no dioses ni focos) |
| Escuelas (`gj_escuela_marea_negra`) | 1 (3 líneas de modificador) |
| Tipos de lugar sagrado (sin locations) | 2 (9 líneas de modificador) |
| Estados del mar por Poder de Rito (`auto_modifiers`) | 2 (6 líneas, escalan) |
| Decisiones (los ritos) | **7** |
| Modificadores estáticos (6 de ritos, 1 de location, 15 de eventos) | 22 (52 líneas) |
| Eventos | **12** (`gj_mar_dormido.1` a `.12`), 27 opciones |
| Efectos propios | 3 (`gj_mar_dormido_lee_presagio`, `gj_mar_registra_rito`, `gj_mar_calma_a_la_bestia`) |
| Triggers propios | 6 |
| Ganchos (`on_action`) | 2 (`yearly_country_pulse`, `gj_mar_pulso_anual`) |
| Líneas de modificador en total | 89 |
| Claves de localización | 139, todas con texto, sin duplicadas |
| Ficheros | 13 de juego y localización, más este resumen y NECESITA |

Situaciones: 0. Desastres: 0.

## Qué se nota al jugar
- **El Poder de Rito.** Sube solo cada mes (+0,2 por la fe, más los aspectos y los lugares sagrados) y se gasta en ritos. Por encima de 60 «el mar duerme hondo» (menos desgaste naval, más pesca, legitimidad). Por debajo de 25 «el sueño se agita» (más desgaste, moral naval baja, menos pesca), y con menos de 10 llega el evento .10.
- **Siete ritos (decisiones):** cantar la nana (barata, recupera Poder), calmar al kraken, levantar la ciudad (una costa prospera), bendecir la flota, ofrenda a la corriente (comercio), la Gran Vigilia (rito mayor, cada 40 años, con el reino en paz) y, solo para la Marea Negra, sangrar la marea (oro a cambio de Poder y saqueo, que despierta al mar).
- **La respiración de la marea (evento .1, cada año):** cantar con oro, dejar dormir o, para la Marea Negra, arrojar la décima del botín.
- **Sucesos del mar (.2 a .9):** un 30 % anual uno al azar. El kraken, la marea sin luna, la cantora, los peces de lo hondo, el naufragio, la cuna rota, los faroleros y la marea roja (solo Marea Negra). Casi todas las opciones cambian el Poder de Rito: bueno ahora puede ser malo a medio plazo.
- **El contador de ritos:** al quinto rito llega la marea alta del alma (.11, una vez).
- **Cometas y eclipses (.12):** lo dispara `gj_mar_dormido_lee_presagio`; calma, aviso o, para la Marea Negra, tormenta de botín.

## Equilibrio
- Los modificadores de eventos y ritos duran de 3 a 20 años y valen entre ±5 % y +25 %. Los mayores van con coste: el Pulso Rojo resta Poder de Rito; Sangrar la marea sube el desgaste; la Gran Vigilia cuesta 60 de Poder y 250 de oro y solo se repite a los 40 años.
- Los ritos no se encadenan: cada uno tiene su enfriamiento (5 a 40 años) y un coste en Poder de Rito.
- La Marea Negra gana botín y pierde Poder de Rito por mes (−0,05 de escuela, −0,1 con el Pulso Rojo): vive al borde de «el sueño se agita».

## Pendiente de comprobar en el juego (NOT_TESTED)
1. **Escala del Poder de Rito:** se asume de 0 a 100 (como la pureza) en los umbrales de `auto_modifiers`, decisiones y eventos. Si el motor usa otro rango, hay que reescalar 60/25/10/70.
2. **`has_rite_power = yes` en la definición de la religión:** el base no tiene ninguna religión que la use. La bandera sale de FORMATO §2.2; el efecto `add_rite_power`, el trigger `rite_power` y el modificador `monthly_rite_power` sí existen en el base.
3. **Valores numéricos en `add_rite_power`:** el base define `rite_power_*_bonus` (de 5 a 50); aquí se usan números sueltos (patrón de `add_manpower = 5`).
4. **Fusión de `yearly_country_pulse`** con la del base (igual que en las demás religiones).
5. **Iconos** de religión y de lugares sagrados: no hay gráficos; el motor usará el genérico.
6. **Valores de `trade_sea_efficiency` y `ship_repair_at_sea`:** la escala se ha tomado de ejemplos del base.

## Estado tras la ronda de reparación
Comprobador: 1 error (has_rite_power, depende de la integración), salida 1, 29 avisos. Localización: 139 claves (las de los dos estados del mar pasan a AUTO_MODIFIER_NAME_/AUTO_MODIFIER_DESC_). Las demás cifras de la tabla no cambian.
