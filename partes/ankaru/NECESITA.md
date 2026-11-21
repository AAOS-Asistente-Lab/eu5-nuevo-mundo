# Lo que Ankarú usa sin definirlo aquí

## Triggers de identidad (los define la integración)
- `gj_es_ankaru = yes`: país facción Ankarú. Se usa en avances, reformas, decisiones, eventos y en el pulso anual.
- `gj_es_orunmar = yes`: país facción Orunmar. Solo en los eventos `gj_ankaru.14` y `gj_ankaru.15` (frontera carmesí).

## Piezas de otras partes
- **Cultura `gj_orunmari`** (parte orunmar) y **cultura `gj_soravi`** (parte sorava): solo en el bloque `opinions` de la cultura `gj_ankaruno`. Si una no existe, hay que quitar la línea.
- **Religión `gj_sol_blanco`** (parte de la religión): su `gj_sol_blanco_lee_presagio` (y la parte de cometas y eclipses, `mundo_bestias`) puede llamar, en ámbito de país, a `gj_ankaru_eclipse_effect = yes`. Lo define Ankarú (`scripted_effects/gj_ankaru_efectos.txt`) y deja un eclipse pendiente en el Calendario Solar, que lo resuelve en su siguiente pulso anual con el evento que toque según la fase. Si nadie lo llama, el calendario genera sus propios eclipses (3 % anual).

## Geografía
- No se usa ningún `gj_zona_*`. Todo va por la topografía del juego (`mountains`, `hills`, `plateau`) y por `num_roads`.
- **Petición al mapa:** Ankarú necesita muchas colinas, mesetas y montañas en su zona y un solo país vecino de la facción Orunmar a través de la cordillera (para que salten los eventos de la frontera).

## Integración del país
- Cultura primaria `gj_ankaruno` y religión `gj_sol_blanco`. Con eso entran en juego los avances de cultura, los edificios y las unidades.
- Reforma de gobierno de arranque: `gj_ank_gobierno_del_cordel` (ver IDENTIDAD.md).

## Pruebas pendientes en el juego (nada de esto se ha podido ejecutar)
1. **`yearly_country_pulse` duplicado.** `on_action/gj_ankaru_on_action.txt` redefine `yearly_country_pulse` con una sola línea (`on_actions = { gj_ank_pulso_anual }`). Si el motor no funde las definiciones de un mismo nombre y deja solo la última, hay que mover esa línea al `yearly_country_pulse` del juego base (o a un on_action propio llamado desde una de las pulsaciones que el mod ya use).
2. **Unidades.** Se comprueba que `buildable = yes` más `family` con límite por script value (`gj_ank_limite_*`) cargan sin errores, y que los avances con tres `unlock_unit` los desbloquean.
3. **Edificios.** Se comprueba el `allow` con `scope:actor` dentro de `custom_tooltip` (el tope por país de Observatorio, Fuerte del Paso y Cantería), `obsolete` entre niveles y `location_potential = { num_roads > 0 }` en la Casa de la Cuerda.
4. **Migración.** `add_migration` en la decisión `gj_ank_colonos_del_sol` y en el evento `gj_ankaru.16`: orígenes y destinos salen de `random_owned_location` con `province_definition`.
5. **`construct_building`** en la decisión `gj_ank_consagrar_gnomon`, sobre la capital.
6. **Iconos.** Los avances reutilizan iconos del juego base (`swedish_*`, `terraces_advance`) y los edificios reutilizan el icono de otro edificio base (`terraces`, `library`, `tambo`, `pukara_building`, `early_council_hall`). Para el acabado hacen falta iconos propios en `gfx/interface/icons/`.
7. **Gráficos de cultura.** Se usa `south_american_gfx`; se puede cambiar por un `*_gfx` propio de la integración.
