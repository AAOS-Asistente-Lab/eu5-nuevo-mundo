# RESUMEN: La Llama Profunda (religión de Durnhal)

Parte `llama_profunda`, religión de la sección 7. Todo lleva el prefijo `gj_llama_`. Texto solo en castellano. Cifras contadas en los ficheros, no previstas.

## Qué hay (ficheros)
12 ficheros: religión, color, dioses, aspectos, tipos de lugar sagrado, modificadores automáticos, modificadores temporales, efectos, decisiones, on_action, eventos y localización (con BOM).

## Cifras
| Pieza | Cuántas |
|---|---|
| Religión | 1 (`gj_llama_profunda`, grupo `gj_fe_norte`, `has_purity = yes`, `religious_aspects = 2`) |
| Bonificaciones núcleo (líneas de modificador) | **20** = 4 de definición + 8 de aspectos + 8 de dioses |
| Aspectos elegibles | 4 (se eligen 2): Yunque Vivo, Vigilia de la Brasa, Pacto de Piedra, Culto del Fondo |
| Dioses | 6: cinco del panteón de partida (Orgad, Thurn, Veshka, Ildra, Maruk) y la Brasa Mayor (Zhurgan, el dragón), que solo entra por el pacto |
| Tipos de lugar sagrado | 2: Pozo de la Llama y Forja Eterna (sin locations; las asigna la integración) |
| Modificadores automáticos por pureza | 2 (4 líneas): Brasa limpia (pureza > 70) y Brasa apagada (pureza < 30), que se suman a los de pureza alta y baja del juego base |
| Modificadores temporales (los dan decisiones y eventos) | 11, con 23 líneas (aparte de las 20) |
| Decisiones | 4: Rito de la Brasa, Vigilia del Fondo, El Pacto del Ala, Romper el Pacto |
| Eventos | 12 en el namespace `gj_llama_profunda`: 11 visibles (.1 a .11) y 1 oculto (.20); 26 opciones |
| Efectos programados | 5: `gj_llama_profunda_lee_presagio`, `_baja_inquietud`, `_sube_inquietud`, `_da_panteon`, `_rompe_pacto` |
| Situaciones | 0 |
| Escuelas | 0 (a esta fe no le toca ninguna de la tabla 5) |
| Claves de localización | 122 |

## Cómo funciona (lo que se nota al jugar)
- **Pureza** (moneda propia del motor). Fuentes: `monthly_purity` de la definición, del dios Ildra y del aspecto Vigilia; la acción genérica de ritual de purificación que el juego da a toda fe con pureza; la decisión Rito de la Brasa (+20 por 60 de oro, cada 5 años); la Vigilia del Fondo (+10, a costa de producción); y los eventos. Bajadas: el Culto del Fondo, el pacto con el dragón y cada evento en que se elige el atajo.
- **Consecuencias de la pureza:** el juego base ya da efectos de pureza alta y baja; encima, Brasa limpia suma hierro y armas hasta +15 % y +10 % a pureza 100, y Brasa apagada resta hasta −15 % de armas y −5 % de eficiencia a pureza 0. Además, los eventos cambian de opciones según la pureza (.2 con pureza baja, .3 con pureza alta).
- **Panteón y pacto con el dragón.** Cinco dioses de partida, uno por oficio. La decisión «El Pacto del Ala» (pureza ≥ 40 y el dragón al menos inquieto) mete a Zhurgan en el panteón: +15 % de artillería, +20 % de armas, pero −0,3 de pureza al mes. Cada diez años, el evento .4 pide el diezmo: población (8 % en tres locations), 250 de oro o romper el trato (con el rencor del dragón y el sube del estado del dragón).
- **Ligado a Durnhal y al dragón:** el Rito, la Vigilia y varios eventos bajan o suben la inquietud llamando al efecto `gj_durnhal_sube_inquietud` de durnhal (esta parte ya no escribe `gj_inquietud_caldera`); romper el pacto sube `gj_dragon_estado`.
- **Presagios:** `gj_llama_profunda_lee_presagio` lee un cometa o un eclipse como chispa del fuego de abajo: estabilidad, prestigio, modificador de forja de 5 años y pureza.

## Equilibrio
- El dragón es el único bono grande y se paga: pureza cada mes, diezmo y rencor si se rompe.
- Cada atajo (cavar, vender, abrir la veta) da oro o producción pero baja la pureza o sube la inquietud.
- Brasa limpia solo escala con pureza muy alta; sin cuidar la fe, no hay bono.

## Lo que no se probó (NOT_TESTED)
Nada se ha ejecutado en el juego. Quedan por comprobar:
1. Que el motor **sume** `yearly_country_pulse` en lugar de sustituirlo (ver NECESITA.md).
2. Que durnhal defina `gj_durnhal_sube_inquietud` con `PUNTOS` (también negativo). El cálculo con `set_global_variable` ya no está en esta parte (queda en `_rompe_pacto` solo para `gj_dragon_estado`).
3. Que `potential` de un dios filtre el reparto automático de dioses (si no, Zhurgan llegaría a todos los países de la fe al empezar; el pacto debería seguir funcionando igual).
4. Que el grupo `gj_fe_norte` cuente como pagano para el reparto automático de dioses; si no, el evento oculto .20 los da al año.
5. Las escalas de las dos variables compartidas (`gj_inquietud_caldera`, `gj_dragon_estado`); el evento .5 y la decisión del pacto dependen de que existan.
