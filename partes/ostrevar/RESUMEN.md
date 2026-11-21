# RESUMEN: Alto Reino de Ostrevar (constructor «tall»)

Cifras contadas sobre los ficheros generados (20-11, 23:4x), no las pretendidas.

## Cifras
| Pieza | Cifra |
|---|---|
| Bonificaciones (cada línea de modificador cuenta como una; sin eventos) | **69** |
| · avances de país (26: 7 de la era 1, 5 de la 2, 4 de la 3, 4 de la 4, 3 de la 5, 3 de la 6) | 49 |
| · avances de cultura (3) | 6 |
| · reformas de gobierno únicas (3) | 9 |
| · cultura `gj_ostrevari` (país 2, location 1, personaje 1) | 4 |
| · grupo cultural `gj_grupo_ostrevari` | 1 |
| Edificios propios (con tope de nivel que sube por era) | **5** |
| Unidades propias (3 cadenas × 6 eras) | **3 cadenas, 18 definiciones** |
| Eventos | **27** (20 temáticos, 5 de legado de era, 2 ocultos de mecánica) |
| Decisiones | **4** |
| Reformas únicas | **3** |
| Situaciones o desastres | **0** (la mecánica va por legados, una política y variables) |
| Modificadores estáticos (mecánica y eventos) | 37 (24 legados, 1 Llamada, 2 castigos, 10 de evento) |
| Claves de localización (solo castellano) | 317 |

Suma: 49 + 6 + 9 + 4 + 1 = 69. Aparte quedan los 24 modificadores de legado, la Llamada de las Ciudades y los de evento, que son mecánica y no se cuentan en las 69.

## Qué hay
- **Avances** (`advances/gj_ostrevar_avances.txt`): 26 de país que cubren las 6 eras y 3 de cultura. Tres de la era 1 desbloquean las unidades (`unlock_unit`).
- **Reformas** (`government_reforms/`): La Carta de las Ciudades (era 2), El Consejo de Piedra (era 4) y La Mancomunidad de los Valles (era 6).
- **Cultura, grupo, lengua, familia lingüística y color**: ostrevarios, `gj_grupo_ostrevari`, `gj_ostrevari_language` (nombres propios en bruto), color de mapa propio.
- **Edificios**: Torre del Gremio, Barrio Alto, Acueducto de Piedra, Casa del Censo y Cantería Real. Cada avance de era suma 1 nivel de tope (`script_values/gj_ostrevar_valores_edificios.txt`), y solo se construyen donde hay población (`allow = population >= 6`). Un nivel como mucho más que el equivalente base, con el tope de nivel por población como límite.
- **Unidades** (`unit_types/`): Guardia de la Ciudad (infantería pesada: aguanta, pero lenta y sin iniciativa), Ballesteros del Gremio (infantería ligera: hacen daño, pero se rompen) y Artilleros de Muralla (artillería: +10 % de daño, -25 % de velocidad). Cada una con 6 versiones (`copy_from` de su era y `upgrades_to_only`), solo en locations de cultura ostrevaria que sean ciudad o metrópoli, con cupo ligado a los niveles de Torre del Gremio y Cantería Real. Ninguna pasa de +10 % en un valor ni +20 % en dos.
- **Mecánica de MECANICAS C1:**
  - **Legados por era**: 5 eventos (`gj_ostrevar.30` al `.34`) al cambiar de era, con 4 opciones cada uno (Graneros del Reino si creció la población, Escuela de Canteros siempre, Leyes del Río tras 20 años de paz, Ciudad de Mármol con ciudades grandes) y 24 modificadores permanentes; el sexto legado va por la decisión `gj_ostrevar_legado_final`. En seis eras se juntan seis legados.
  - **La Llamada de las Ciudades**: dos decisiones (abrir y cerrar). Mientras está abierta atrae migración a las ciudades y cuesta satisfacción del campesinado y buena fama exterior.
  - **Su precio**: el ejército sale caro (`gj_ostrevar_cuenta_del_ejercito`, a aplicar por la integración si se quiere permanente) y las guerras seguidas hacen perder legitimidad y poder burgués (evento `.41`, castigo de 6 años).
  - **Construir hacia arriba**: Torre del Gremio, Barrio Alto y Acueducto de Piedra.
- **Eventos** (`events/gj_ostrevar_eventos.txt`, namespace `gj_ostrevar`): `.1` La corona de los valles, `.2` El censo de los valles y `.3` el religioso (los tres de la bala trazadora); `.4` al `.20` temáticos de constructor; `.30` al `.34` legados; `.40` y `.41` ocultos. Se disparan por `yearly_country_pulse` (`on_action/`).
- **Localización**: `main_menu/localization/spanish/gj_ostrevar_l_spanish.yml`, UTF-8 con BOM.

## Comprobación propia
- Llaves `{` y `}` equilibradas en todos los ficheros: sí.
- Todos los identificadores de clave que usa la parte, y todos los nombres de modificador, existen en los ficheros del juego base (comprobado por guion contra G): sí, salvo los propios.
- Etiquetas de país e ids de location: ninguno.
- Textos sin rutas ni nombres de persona ni de modelo.

## Lo que no se ha probado (NOT_TESTED)
- Que cargue en el juego: no se ha ejecutado. Riesgos conocidos: la sintaxis de `INJECT:` en `on_action`; `allow = { population >= 6 }` en los edificios; `limit` de unidad por script value; las `desc` de los topes de nivel; `set_variable = { name = x years = n }` en `.41`.
- El equilibrio: ninguna partida de IA hecha. Vigilar la Cantería Real y la Llamada de las Ciudades.
- La condición «mayor prosperidad y tolerancia atraen más» de la Llamada de las Ciudades no está: es un modificador fijo.
- Un modificador estático `gj_ostrevar_cuenta_del_ejercito` queda definido pero sin aplicar (se aplica con la reforma inicial de la integración).
- Las 3 descripciones largas de edificios y unidades están en castellano; los textos de las unidades 2-6 comparten la descripción de la primera.
