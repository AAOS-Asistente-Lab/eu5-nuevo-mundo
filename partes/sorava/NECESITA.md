# NECESITA: lo que usa Sorava sin definirlo aquí

## Triggers que define la integración
| Nombre | Alcance | Dónde se usa | Qué significa |
|---|---|---|---|
| `gj_es_sorava` | país | en casi todo: `potential` de avances, reformas, edificios, decisiones, desastre y eventos | `yes` si el país es la facción Sorava |
| `gj_es_lagunas` | país | evento `gj_sorava.5`, decisión «Disputar el estrecho» | `yes` si el país es la Liga de las Mil Lagunas |
| `gj_zona_estrecho` | location | decisión `gj_sorava_disputar_estrecho` (dentro de `any_owned_location`) | `yes` en las locations del estrecho entre Sorava y la Liga |

## Ganchos que añade la integración
- **`yearly_country_pulse`:** añadir `gj_sorava_pulso_anual` a su lista `on_actions`. Sin eso, los eventos de sabor (`gj_sorava.1` a `.19`) no salen. Los de contrato (`.21` a `.23`), el de la Liga (`.30`) y los de la quiebra (`.40` a `.43`) salen solos: los dispara una decisión o el desastre.
- **Pasar la comprobación de claves del motor** en el primer arranque: `gj_sorava_nivel_*`, `gj_sorava_cupo_*` y las familias de unidades van enlazadas por nombre.

## Piezas de otras partes
- **`gj_pacto_balanza` (religión de la parte `pacto_balanza`):** usa `has_honor`. Sugerencia de enlace: que su honor suba cuando Sorava cierra un contrato con `gj_sorava_cambiar_palabra = { valor = N }` positivo, y baje al romperlo. Hoy la mecánica de Sorava es independiente: usa su propia variable `gj_sorava_palabra` y funciona sin la religión.
- **Grupo cultural `gj_grupo_sorava`:** lo define esta parte (`culture_groups/gj_sorava_grupo.txt`). La parte `marea_negra` lo **usa** (su cultura `gj_mareano` está en él), así que **no debe redefinirlo**. Los modificadores del grupo son solo de gente de mar y de lonja.
- **Cultura `gj_soravi` y su religión `gj_pacto_balanza`:** la cultura está en esta parte. La religión no.
- **Mundo (parte `mundo_contacto`):** si define la difusión del saber, sus eventos de primer contacto pueden fijarse en `gj_es_sorava = yes`. No hay dependencia dura.

## Imágenes e iconos
- Los avances sin `icon` usan el genérico del motor; los que llevan `icon` reutilizan iconos que ya trae el juego base.
- El desastre `gj_sorava_quiebra_de_las_casas` reutiliza la ilustración del golpe de Estado del juego base. Falta una propia.
- Las unidades y los edificios tampoco traen gráficos propios: usan los del juego base (`gfx_tags`).

## Pendiente de probar (NOT_TESTED, ver RESUMEN.md)
Nada se ha ejecutado: ni el juego ni el generador. Las claves de modificadores, de efectos y de triggers se han comprobado contra los ficheros del juego base (ver RESUMEN.md, «Comprobación propia»).
