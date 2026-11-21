# Resumen: minores_sur (los menores del sur)

Siete menores con nombre, en tres estilos, y un paquete compartido por estilo. Las cifras salen del recuento de los ficheros, no de lo que se pretendia.

## Los siete
| Menor | Estilo | Cultura | Grupo cultural |
|---|---|---|---|
| Concejo de Brazalmar | ciudad | gj_brazalmi | gj_grupo_sorava |
| Hermandad de Ondán | ciudad | gj_ondani | gj_grupo_talasio |
| Señorío de Cabo Halcor | marca | gj_halcori | gj_grupo_sorava |
| Santuario de Tirnauk | marca | gj_tirnauki | gj_grupo_solar |
| Marca de Sotolar | marca | gj_sotolari | gj_grupo_velathi |
| Jefatura del Yorumbe | selva | gj_yorumbi | gj_grupo_carmesi |
| Clanes de Pakhun | selva | gj_pakhuni | gj_grupo_carmesi |

## Cifras reales
- **Bonificaciones permanentes: 110** (cada linea de modificador cuenta como una).
  - 56 de cultura: 7 culturas con `country_modifier`, `location_modifier` y `character_modifier` (8 lineas cada una).
  - 42 de los 21 avances de cultura (3 por cultura, en las eras 1, 3 y 5; de 2 modificadores cada uno).
  - 12 de los 6 avances de estilo (2 por estilo, en las eras 2 y 4).
  - Aparte, 9 lineas de modificador en los 3 edificios y las estadisticas de las 18 unidades.
- **Avances: 27** (21 de cultura y 6 de estilo).
- **Edificios: 3**, uno por estilo, con 3 niveles al final de la partida (el tope sube con las eras): Lonja del Concejo, Palafito Mayor y Torre de Frontera. Cada uno con su fuerza, su debilidad y su limite de lugar.
- **Unidades: 18** (3 cadenas de 6 versiones, una por era, sobre las unidades base de cada era): Guardia del Muelle (infanteria pesada), Lancero del Vado (infanteria ligera) y Jinete de Frontera (caballeria ligera). Con cupo por familia que crece con su edificio. Ninguna pasa del +10 % en dos valores de combate base (el +15 % solo vale en su terreno, con una penalizacion igual o mayor fuera de el).
- **Eventos: 37** (72 opciones): 10 de ciudad, 10 de selva, 10 de marca y 7 de cultura (uno por cultura, de una sola vez). El `.20` lo lanza una decision; los otros 36 salen del pulso anual.
- **Decisiones: 6** (2 por estilo).
- **Situaciones, desastres y reformas: 0** (no los pide la fila de la tabla 6; las facciones mayores los llevan).
- **Modificadores temporales: 29** (de decisiones y eventos), con su texto.
- **Idioma: 7 lenguas y 3 familias.** Los dialectos van vacios y heredan los nombres de su lengua.
- **Ficheros del juego: 18** (17 de script y la localizacion; los de script son: cultura, lengua, familias, avances x2, triggers, edificios, producciones, script values x2, unidades, familias de unidad, decisiones, on_action, eventos, colores y modificadores). La localizacion va en castellano y con BOM (359 claves).

## Comprobaciones hechas
- Llaves `{` y `}` equilibradas en los 17 ficheros de script.
- Cada clave visible (cultura, lengua, avance, decision, evento y opciones, modificador, edificio, produccion, unidad y familias) tiene su texto: 0 faltan.
- 0 etiquetas de pais, 0 ids de location y 0 letras de unidad o rutas en los ficheros.
- Los 288 nombres de modificadores, triggers y efectos que no son mios existen en los ficheros del juego base (busqueda por nombre, no ejecucion).
- Las 6 bases de `a_age_N_*` de heavy_infantry, light_infantry y light_cavalry existen.

## Lo que no se probo (NOT_TESTED)
- Ni el juego ni el generador: nada se ha cargado. Los nombres existen, pero no se ha probado que todos los modificadores se acepten en cada ambito (por ejemplo `character_*` dentro de una cultura, `local_*` de las culturas).
- Que `on_actions` dentro de una on_action funcione como lista en esta version (el contrato de integracion dice que si).
- El equilibrio de las unidades y los edificios: hay que verlo en una partida de la IA sola.

## Para la integracion (ver NECESITA.md)
- Anadir `gj_minores_sur_pulso_anual` a la lista de `yearly_country_pulse`.
- Crear los 7 paises con su cultura y repartir sus locations.

## Ronda de reparacion
Cifras reales tras la ronda: 110 bonificaciones permanentes, 359 claves de localizacion, 18 ficheros, 37 eventos. Comprobador: 0 errores, salida 0. Unico cambio de nombre: el modificador Juramento renovado es ahora Voto de las Siete Rampas.
