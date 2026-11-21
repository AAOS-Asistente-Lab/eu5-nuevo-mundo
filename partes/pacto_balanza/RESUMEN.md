# RESUMEN: pacto_balanza (El Pacto de la Balanza)

Religión del sur, la de Sorava. Mecánica del motor: honor (`has_honor = yes`). El honor sube al cumplir pactos y contratos y baja al romperlos. Cifras contadas sobre los ficheros.

## Qué hay
| Pieza | Cantidad | Dónde |
|---|---|---|
| Religión `gj_pacto_balanza` (con `has_honor`, `religious_aspects = 2`) | 1 | `in_game/common/religions/` |
| Aspectos elegibles (dos son incompatibles entre sí) | 4 | `in_game/common/religious_aspects/` |
| Tipos de lugar sagrado (sin locations) | 2 | `in_game/common/holy_site_types/` |
| Modificadores automáticos por honor y por contratos en vigor | 3 | `in_game/common/auto_modifiers/` |
| Modificadores de país (los dan eventos y decisiones) | 12 | `main_menu/common/static_modifiers/` |
| Decisiones (categoría religiosa) | 4 | `in_game/common/decisions/` |
| Eventos (namespace `gj_pacto_balanza`, ids .1 a .12) | 12 | `in_game/events/` |
| Efectos con nombre (`contrato_cumplido`, `perjurio`, `lee_presagio`) | 3 | `in_game/common/scripted_effects/` |
| Ganchos de `on_action` (pulso anual propio, préstamo devuelto, tregua rota, boda real) | 4 | `in_game/common/on_action/` |
| Claves de localización en castellano (UTF-8 con BOM) | 110 | `main_menu/localization/spanish/` |
| Situaciones, desastres, religiones de foco o dioses | 0 | (la mecánica de honor no los usa) |

Ficheros: 10 de juego y localización, más este RESUMEN y NECESITA.

## Bonificaciones (cada línea de modificador cuenta como una)
- `definition_modifier`: 7
- Aspectos: 11 (3 + 2 + 3 + 3)
- **Subtotal que pide el contrato (definición + aspectos + focos): 18** (sin focos: la mecánica de honor no los usa)
- Lugares sagrados: 7 (4 de la lonja y 3 de la casa del peso, con las del país)
- Modificadores automáticos: 8 (3 de palabra de oro, 3 de crédito roto y 2 de contratos en vigor)
- Modificadores de país de eventos y decisiones: 26
- **Total de líneas de modificador: 59**

## Cómo se juega (mecánica de honor)
- **Sube** con: devolver un préstamo (`on_loan_repaid`), sellar una boda real (`on_royal_marriage`), la decisión «Sellar un contrato en la lonja», y las opciones honradas de los eventos. Cada cumplimiento suma un «contrato en vigor» (variable `gj_pacto_contratos`, hasta 10), que da un modificador automático proporcional.
- **Baja** con: romper una tregua (`on_truce_broken`, penalización fuerte y modificador «Perjurio» durante 10 años) y las opciones tramposas de los eventos.
- **Honor alto (más de 70):** «Palabra de Oro» (comercio, relaciones y crédito). Más los modificadores genéricos de `high_honor` del juego base.
- **Honor bajo (menos de 30):** «Crédito Roto» (crédito, comercio y lealtad de súbditos). Más los de `low_honor` del juego base. Los eventos de perjurio y crédito roto lo empujan a la «Penitencia pública» (decisión «Pesar la balanza», con enfriamiento de 15 años).
- **Límites y debilidades:** romper treguas cuesta más (`war_breaking_truce_cost_modifier`), el perjurio es largo, y las decisiones tienen enfriamiento por el propio modificador que conceden.
- **Presagio:** `gj_pacto_balanza_lee_presagio` lanza el evento .10: con honor alto el cometa o el eclipse es una promesa; con honor bajo, un aviso; también se puede ignorar a costa de honor.

## Eventos (12)
1. Dos casas y una balanza (arbitraje entre nobles y mercaderes)
2. La deuda del capitán
3. Sal en el umbral (hospitalidad)
4. Letra pequeña (tratado con una cláusula olvidada)
5. El perjurio (honor bajo)
6. La fiesta de los pesos
7. La balanza se inclina (honor muy alto: arbitraje internacional)
8. Falsos pesos
9. La tregua que se mantiene (tras la decisión de Tregua Sagrada)
10. El signo y la balanza (lo lanza el efecto de presagio)
11. Crédito roto (honor bajo)
12. La escuela de los fieles

Los ids .1 a .9, .11 y .12 salen del pulso anual propio (25 % cada año a un país de la fe, con el disparador de cada evento). El .10 solo lo lanza `gj_pacto_balanza_lee_presagio`.

## Sin probar (NOT_TESTED)
No se ha ejecutado el juego. Se ha comprobado: llaves equilibradas en los 9 ficheros, las 110 claves de localización cubren todos los títulos, descripciones y opciones, cada modificador existe en `modifier_types` del juego base, y no hay rutas de disco. Lo que habrá que ver en vivo:
- que las escalas de `scales_with` de los automáticos (valor de la variable `gj_pacto_contratos` y diferencia con el honor) se lean bien;
- que `on_action` con nombre repetido sume a las entradas del juego base (como hace el propio juego con `on_winning_war`);
- que el grupo `gj_fe_sur` y las etiquetas gráficas (`folk_african_gfx pagan_gfx`, provisionales) los dé la integración.
Falta el icono de la religión en `gfx/interface/icons/religion/` (lo hace la integración).

## Ronda de reparación
Comprobador de la integración: PASA, 0 errores, 18 avisos (claves aún sin uso en scripts: lugares sagrados, decisiones y variantes del evento .10), salida 0. Cifras sin cambios: 110 claves, 12 eventos, 4 decisiones, 3 automáticos, 12 modificadores, 4 on_action. Nombres repetidos: «Palabra de Oro» se queda aquí y se renombra en sorava.
