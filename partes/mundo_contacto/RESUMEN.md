# mundo_contacto: RESUMEN

Parte de MUNDO (MECANICAS I): la llegada del Viejo Mundo sin la gran plaga y con la tecnología a la par. Las cifras son las contadas en los ficheros, no las pretendidas.

## Cifras
| Pieza | Cuántas |
|---|---|
| Ficheros del juego | 8 `.txt` + 2 `.yml` (10 en total) |
| Eventos (namespace `gj_mundo_contacto`, `.1` a `.21`) | 21, con 47 opciones. Además, 4 de ellos (`.7` a `.10`) los lanza la situación cada mes |
| Decisiones | 5 |
| Situaciones | 1 reescrita (`great_pestilence`, «Fiebres de los barcos»); ninguna nueva |
| Enfermedades | 2 reescritas (`great_pestilence`, `smallpox`) |
| Modificadores estáticos | 28 (24 de país y 4 de location), con 75 líneas de bonificación |
| Triggers propios | 9 |
| Efectos propios | 15 |
| on_actions | 1 (pulso anual, colgado de `yearly_country_pulse` con `INJECT:`) |
| Textos en castellano | 148 claves (más 9 de sustitución en `replace/`) |

No hay edificios, unidades, avances ni reformas: esta parte no es una facción.

## Qué hace
**1. La plaga suavizada.** `REPLACE:great_pestilence` (enfermedad y situación):
- mortalidad del 12-30 % (antes 75-90 %), parecida a la viruela del Viejo Mundo;
- R0 más bajo, umbral de contagio más alto, intervalos más largos y efectos de location a la mitad;
- la situación se queda con la misma clave (acciones genéricas y eventos del juego siguen enganchados), pero se lee «Fiebres de los barcos»;
- los eventos mensuales son los nuestros (`.7` a `.10`) y el de entrada y salida también (`.6`, `.11`); acaba cuando el brote se apaga, sin exigir las tres regiones de la América del juego base;
- los países con puertos cerrados o con cuarentena local frenan el contagio.

`REPLACE:smallpox`: R0 de población con defensas (2-4, 3-7 y 6-10 en lugar de 3-6, 5-10 y 10-15) y mortalidad 4-22 %.

**2. Inmunidad parcial.** Crece con los años de contacto: a los 10, 25 y 50 años el país recibe `gj_inmunidad_1/2/3` (resistencia nacional a las dos enfermedades y resistencia global). El R0 de las dos enfermedades se multiplica por 0,7 / 0,5 / 0,3 (gran peste) y 0,8 / 0,6 / 0,4 (viruela). Aviso con el evento `.12`.

**3. Primer contacto.** Un país del Nuevo Mundo con gobernante lo vive cuando ya hay alguien del Viejo Mundo con una location poblada en América y, o bien es vecino de uno, o bien conoce a uno con colonias allí. Pulso anual con un retraso al azar de 1 a 24 meses. Evento `.1`, con tres vías:
- **comerciar:** `gj_contacto_via_comercio` (20 años), puerto de los saberes en la capital, la institución del visitante que nos falte (gran empujón en capital y ciudades) y dinero. Seguimiento a los 2 años: `.3`;
- **aprender:** `gj_contacto_via_aprender` (15 años), avances (progreso de investigación), puerto de los saberes y empujón pequeño a la institución. Seguimiento: `.4`;
- **cerrarse:** estabilidad, legitimidad y clero a cambio de investigación y comercio (`gj_contacto_via_cerrado`, permanente hasta que se reabra). Seguimiento: `.5`. Decisión de reabrir tras 5 años.

**4. Saberes de ida y vuelta.** El visitante recibe un modificador pequeño de 20 años según la facción contactada (forja de Durnhal, terrazas de Ankarú, navegación de Thalassar, la Liga, Sorava, los Skarren y la Marea Negra, hierbas de los Velathi, caballos de Kaïvan, genérico para el resto). Con tope: ningún pasa del +5 % en lo suyo ni de +2 % de investigación.

**5. Difusión del saber.** Cada año, un país con contacto y puertos abiertos compara sus avances con los de los países del Viejo Mundo que conoce. Si va 1, 6 o 12 avances por detrás, recibe `gj_difusion_1/2/3` (investigación +10/20/30 %, crecimiento de instituciones +10/20/30 %, coste de adoptarlas -5/-10/-15 %). Se refresca cada año mientras vaya por detrás y desaparece al alcanzarlos: no hay vía de adelantarse. La cerrazón lo apaga.

**6. Intercambio y flavor.** Caballos, cultivos, intérpretes, imprenta, maestros de ultramar, el intérprete que se quedó, el mapa del capitán y los hijos del cierre: 8 eventos anuales con `chance_to_happen = 14`, cada uno limitado por país con su propia variable.

**7. Decisiones.** Cerrar y reabrir los puertos, embajada al otro lado del mar (cada 10 años de contacto), Casa de los Saberes (una vez, capital con puerto de los saberes durante un siglo) y cuarentena general durante las fiebres.

## Lo que no se probó (NOT_TESTED)
- Que `REPLACE:` funcione sobre `diseases/` y `situations/`, y que la carpeta `localization/spanish/replace/` pise las claves del juego base. Si no, las claves de `replace/` se pasan al fichero normal y la clave de la situación se queda con el nombre de la gran peste.
- Que los valores de `national_*_resistance_modifier` (0,15 a 0,50) y `global_disease_resistance` sean la escala buena: el juego base no da ejemplos. Hay que medir en una partida con el brote en marcha.
- Que `any_known_country` incluya al Viejo Mundo desde el arranque cuando se activa «Nuevo Mundo revelado». Si lo incluye, el primer contacto lo marca solo la presencia colonial (`gj_viejo_mundo_en_america`), con el retraso al azar.
- Que `set_variable` con `value = num_of_advances_researched` y las comparaciones `> root.var:...` acepten esa forma.
- `random_institutions_embraced` y `any_institutions_embraced` con `prev` están copiados del juego base (misiones genéricas), pero no se han ejercitado con un país nuestro.
- Los eventos `.6`, `.9` y `.10` no usan nombres de location por si el brote no deja ninguna a mano.

## Equilibrio
- La vía de aprender da +15 % de investigación 15 años; la de comerciar, +5 % y +10 % de poder de mercaderes 20 años. El cierre cuesta -10 % de investigación y -10 % de poder de mercaderes.
- La difusión máxima (+30 %) solo existe si vas 12 o más avances por detrás, y se pierde al ponerte al día. Lo de Europa a la par que nuestras facciones, que empiezan cerca por `starting_technology_level`, se queda en un empujón corto.
- Los países con inmunidad plena (50 años) reducen el contagio de la gran peste a menos de un tercio.
