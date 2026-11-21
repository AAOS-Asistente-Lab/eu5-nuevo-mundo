# RESUMEN: Sorava (comerciante, sur, mediana y rica)

Cifras **contadas sobre los ficheros** (script de comprobación propio), no las que se pretendían.

## Cifras
| Pieza | Cantidad |
|---|---|
| **Bonificaciones** (cada línea de modificador, sin eventos) | **68** |
| ... de 28 avances de país (6 eras: 6+5+5+5+4+3) | 46 |
| ... de 3 avances de cultura | 6 |
| ... de 3 reformas de gobierno únicas | 6 |
| ... de la cultura `gj_soravi` (3 de país, 2 de location, 2 de personaje) | 7 |
| ... del grupo cultural `gj_grupo_sorava` | 3 |
| Edificios propios | 5 |
| Unidades | 2 cadenas de 6 versiones (12 tipos) y 2 familias |
| Eventos | 27 (19 de sabor, 3 de cierre de contrato, 1 para la Liga, 4 de la quiebra) |
| Decisiones | 7 |
| Desastres | 1 |
| Situaciones | 0 (la mecánica se monta con variable, decisiones, eventos y desastre) |
| Modificadores nombrados | 22 |
| Efectos reutilizables | 3 |
| Valores de script | 7 (5 topes de edificio, 2 cupos) |
| Claves de localización | 298 (solo castellano; 5 añadidas en la validación: nombres de los métodos de mantenimiento de los edificios) |
| Piezas de contenido propias, para la vara de ~50-60 | 86 (31 avances, 3 reformas, 5 edificios, 12 unidades, 27 eventos, 7 decisiones, 1 desastre) |

Las bonificaciones de los edificios, de las unidades, de los modificadores de eventos y del desastre **no** entran en las 68.

## Qué hay
- **Avances** (`in_game/common/advances/gj_sorava_avances.txt`): 28 de país, de las 6 eras; en cada era, uno de ellos desbloquea las dos unidades de esa era. `requires` solo cuelga de avances del juego base de la misma era o anterior (comprobados en `0_age_of_*.txt`). 3 de cultura.
- **Reformas** (`government_reforms/`): Concejo de las Balanzas (era 1), Libro Mayor de las Casas (era 3), Concordato del Estrecho (era 5).
- **Edificios** (`building_types/`), todos con tope de niveles que sube con la era (`script_values`) y un límite claro:
  - Casa de las Especias: solo centros de mercado; sube de 1 a 4 niveles.
  - Banco de Perlas: solo puertos con perlas o pesca; de 1 a 4.
  - Atalaya del Estrecho: solo puertos, de 1 a 3, caro (+75 % por nivel).
  - Sala de las Balanzas: solo ciudades; en la capital da un bono de país (`capital_country_modifier`).
  - Posta de Caravanas: solo lejos de la costa; ayuda a propagar el control tierra adentro.
- **Unidades** (`unit_types/`, `unit_families/`): Guarda de Recua (infantería pesada: -15 % de bajas, -10 % de moral perdida, pero -10 % de daño y -10 % de velocidad; fuerte en costa y ríos) y Tirador de Rada (infantería ligera: +15 % de daño, pero +15 % de bajas; flojo tierra adentro). Cada una, una versión por era sobre la unidad base de su era (`copy_from` y `upgrades_to_only`). Cupo por familia, solo se reclutan donde domina la cultura soravi.
- **Cultura, grupo y lengua:** `gj_soravi`, `gj_grupo_sorava` (compartido con la Marea Negra), `gj_sorava_language` y su dialecto.
- **Mecánica «La palabra de las Casas»** (variable `gj_sorava_palabra`, 0-100):
  - La palabra da un modificador de país según tramos: de oro (80 o más), firme (55 o más), sin nada, o manchada (menos de 20).
  - Tres **contratos** (especias, perlas, escolta), cada uno por decisión: ventaja y obligación durante 5 años. Al cierre, un evento deja cumplir de sobra, cumplir lo justo o romper el contrato (más oro ahora, -20 de palabra).
  - **Disputar el estrecho** a la Liga, con evento que recibe la Liga.
  - **Auditar las Casas** y **Puerto Franco** (con coste en palabra) y la **Lonja Mayor** (única, pide la Sala de las Balanzas en la capital).
  - Desastre **La Quiebra de las Casas**: si la palabra baja de 20, salta; termina al llegar a 45.
- **Eventos:** 27, en `gj_sorava` desde el `.1`. Los de sabor (`.1`-`.19`): juramento de la Lonja, temporada de perlas, especias mojadas, corsarios, rebaja de la Liga, el tasador honrado, pesas falsas, el hijo de la Casa, tormenta, enviados del interior, ruta nueva, tintes, cofradía de pilotos, moneda falsa, incendio, fiesta de la Balanza y tres hitos de era (3, 5 y 6).

## Comprobación propia
- **Llaves** `{` y `}` equilibradas en los 16 ficheros de código y de datos (OK en cada uno).
- **BOM:** todos los ficheros llevan UTF-8 con BOM. La localización empieza por `l_spanish:`.
- **Localización:** las 298 claves necesarias están (avances, reformas, edificios, unidades, decisiones, desastre, modificadores, cultura, grupo, lengua y los 27 eventos con sus opciones). Faltan: ninguna.
- **Modificadores:** cada modificador usado (avances, reformas, cultura, grupo, edificios, modificadores nombrados y desastre) existe en `modifier_type_definitions` del juego base. Desconocidos: ninguno.
- **Sin etiquetas** de país, **sin ids** de location y **sin rutas** en los ficheros.
- **Efectos y triggers** (`change_gold_effect`, `add_country_modifier`, `has_country_modifier`, `every_country`, `random_events`, `current_age_or_later`, `trigger_event_non_silently` con `months`) comprobados contra ejemplos del juego base.

## No probado (NOT_TESTED)
Nada se ha ejecutado: ni el juego ni el generador. Lo que sigue necesita arranque:
1. Que el motor acepte las **unidades con `family`, `limit` por familia y `combat = { coastal inland river }`** tal como están.
2. Que los **edificios con `max_levels` por era** (script values con `current_age_or_later`) y `capital_country_modifier` carguen sin error.
3. Que `on_action` anidado en `yearly_country_pulse` (ver NECESITA) dispare el pulso.
4. La **escala de los valores** (oro, `change_gold_effect`, `gold > monthly_income...`) frente a una economía real: pueden pedir ajuste tras una partida de IA sola.
5. Las **ilustraciones** de eventos y del desastre reutilizan las del juego base.
6. **Equilibrio:** las unidades no pasan de +15 % en 1 o 2 valores y llevan debilidad y cupo; los edificios llegan a 4 niveles como mucho con la era. Hay que verlo con partidas de la IA sola, de 100 años.

Comando de comprobación previsto cuando el juego cargue el mod: arrancar con el mod activo y revisar `error.log` del juego buscando `gj_sorava`.

## Ficheros
Ver `NECESITA.md` (dependencias) e `IDENTIDAD.md` (nombre, color, nombres, topónimos, tamaño, rivales y gobierno).
