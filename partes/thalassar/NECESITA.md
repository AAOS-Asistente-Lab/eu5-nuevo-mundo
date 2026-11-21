# NECESITA: lo que Thalassar usa sin definirlo

## Triggers que define la integración
| Clave | Ámbito | Para qué |
|---|---|---|
| `gj_es_thalassar` | país | Identifica a la facción. Lo usan avances (`potential`), reformas, unidades, edificios, decisiones, desastre, on_actions y eventos. |
| `gj_zona_mar_interior` | location | «Esta location está en la costa del mar interior». Lo usa `gj_thalassar_domina_el_mar` (fase 3 de la Ciudad Hundida: tres puertos propios en el mar interior). |

## Claves de otras partes
| Clave | De quién | Dónde se usa |
|---|---|---|
| `culture:gj_talasio` | esta parte (ya definida) | avances de cultura |
| `religion:gj_mar_dormido` | la religión `mar_dormido` | opción del evento `gj_thalassar.15` (trigger de la opción; la segunda opción siempre está) |
| variable de país `gj_ruina_atlante_explorada` | esta parte (la fija `gj_thalassar.3.a`; `mundo_ruinas` puede fijarla también) | alternativa de la fase 3: se pide que la fije el evento de exploración de una ruina atlante. Si nadie la fija, la fase 3 solo sale por el mar interior. |

## Estado inicial (lo pone el setup del país)
- Variables del país: `gj_cristales_marea = 6`, `gj_alzar_fase = 0`, `gj_decadencia = 0`. (Si faltan, los efectos y triggers de esta parte las crean o las leen con `has_variable`, así que no rompe, pero conviene sembrarlas.)
- Reforma inicial: `gj_thalassar_consejo_de_las_mareas` (unique; `potential = { gj_es_thalassar = yes }`).

## Formable «Thalassar Restaurada»
El formable necesita un tag, un nombre, una bandera y una geografía, así que lo escribe la integración. La condición ya está lista: `gj_thalassar_ciudad_alzada = yes` (fase 5 completada). Al cumplirse se ha desbloqueado además la reforma `gj_thalassar_corona_emergida`.

## Ganchos de on_action
`on_action/gj_thalassar_on_action.txt` añade `gj_thalassar_pulso_anual` y `gj_thalassar_pulso_bienal` a `yearly_country_pulse` y `biyearly_country_pulse` del juego base. Si el motor no fusiona esas claves con las del base, la integración debe llamar a esos dos on_actions desde su propio gancho. Todos los eventos temáticos salen de ahí.

## Gráficos y textos que quedan para la integración
- `gfx_tags` de las unidades: se reusan `medium_tag`, `musket_tag` y `mediterranean_galley_tag` del juego base; los barcos ligeros no llevan etiqueta propia.
- Iconos de avances, de edificios y de modificadores: no se han hecho (los avances sin `icon` usan el genérico; los edificios reusan `dock`, `library` y `shipyard` en sus métodos de producción).
- Imagen del desastre: reusa la de «La caída de Mali» del juego base (`decline_of_mali_disaster.dds`).
- Bandera, escudo y nombre del país (TAG): los define la integración. `gj_thalassar_nombre` en la localización es solo un nombre de trabajo.
- Nombres de grupos de religión y de escuelas: no se usan aquí.

## Del juego base (existen y se comprobaron en G)
Constantes como `small_trade_sea_efficiency_bonus`, `small_tax_income_efficiency_bonus`, `small_production_efficiency_bonus`, `diplomatic_reputation_mild_bonus`, `small_permanent_target_satisfaction`, `small_permanent_target_satisfaction_penalty` (comprobada solo por nombre), y los scripted effects `unlock_government_reform_effect` y `an_event_occurs_tt`/`no_event_occurs_tt`.
