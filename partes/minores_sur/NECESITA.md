# Lo que usa minores_sur sin definirlo

## Grupos culturales (los definen las facciones mayores; mis culturas cuelgan de ellos)
- `gj_grupo_sorava` (sorava): brazalmi y halcori.
- `gj_grupo_talasio` (thalassar): ondani.
- `gj_grupo_solar` (ankaru): tirnauki.
- `gj_grupo_velathi` (velathi): sotolari.
- `gj_grupo_carmesi` (orunmar): yorumbi y pakhuni.

## Gancho del pulso anual (lo cablea la integracion)
- `gj_minores_sur_pulso_anual` (en `common/on_action/gj_minores_sur_on_actions.txt`) debe quedar en la lista de on_actions de `yearly_country_pulse`. Sin eso, los 36 eventos del sorteo no salen. El evento `.20` solo lo lanza la decision de la crecida.

## Etiquetas y geografia
- No uso etiquetas de pais, `gj_es_*`, `gj_zona_*` ni ids de locations: los estilos se reconocen por la cultura del pais (`gj_minores_sur_estilo_ciudad|selva|marca`, definidos aqui en `scripted_triggers`).
- La integracion debe crear los 7 paises menores con su cultura (ver IDENTIDAD.md) y repartir sus locations. Los tres edificios y las tres unidades solo se ven donde domina la cultura de su estilo.

## Del juego base (verificado por busqueda en G)
- Advances base usados en `requires` (trade_caravans, banking_advance, global_trade_advance, mapmaking, ship_building_techniques_discovery, maritime_advance_age_5, anti_piracy_warfare, agriculture_advance, construction_speed_renaissance, scientific_revolution_advance, ranching, lumber_improvements_discovery, national_sovereignty, ship_building_advance, new_world_crops, absolutist_court, plantation_buildings_advance, guilds, rgo_size_advance_renaissance, food_advance_reformation, renaissance_subject_opinions_advance, artillery_institution_advance).
- Unidades base copiadas: heavy_infantry, light_infantry y light_cavalry de las 6 eras (`a_age_N_*`).
- Categorias, empleos y tiempos de edificio, y los valores `*_bonus` y `*_penalty` de `default_values.txt`.
- Los textos de eventos y decisiones usan las ilustraciones `regular`, `exterior` e `interior`.

## No hace falta de otras partes
- Ninguna pieza compartida de la tabla 5 del contrato: los menores no llaman a `gj_<religion>_lee_presagio`, a las ruinas ni al contacto. Si la integracion quiere que los menores lean cometas, basta con que sus religiones (las de cada pais) lo hagan.
