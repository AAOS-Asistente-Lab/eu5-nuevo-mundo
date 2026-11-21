# NECESITA: lo que la Escarcha Silente usa sin definirlo

## De la integracion
- Grupo de religion `gj_fe_norte` (lo usa `religions/gj_escarcha_silente_religion.txt`).
- Los tags graficos `folk_european_gfx pagan_gfx` ya existen en el juego base. Conviene un icono propio de religion en `gfx/interface/icons/religion/`.
- Anadir `religion_flavor_pulse_gj_escarcha_silente` a `first_valid_on_action` de `religion_flavor_pulse` (el juego base lo reparte en un fichero propio, asi que lo hace la integracion al fundir los ficheros). Esta parte ya define esa on_action en `on_action/gj_escarcha_silente_on_actions.txt`.
- Geografia: la parte no usa ninguna zona `gj_zona_*`.
- Holy sites: los dos tipos (`gj_escarcha_silente_cumbre_callada`, `gj_escarcha_silente_tumba_del_primer_invierno`) no tienen locations. La integracion decide donde ponerlos en `holy_sites/` (por ejemplo, en el norte helado).

## De hrimval (dueno de la Noche Blanca)
- Efecto con scope pais: `gj_noche_blanca_comienza = yes`. Lo llama `gj_escarcha_silente_abre_noche` al abrirse la Noche. Si hrimval aun no lo ha definido, hace falta al menos un esqueleto vacio, porque un efecto sin definir da error de script.
- Esta parte no lee ningun trigger de hrimval. Controla su propia Noche con la variable `gj_escarcha_silente_noche_propia` (por pais, 4 anos).

## De mundo_bestias (quien llama a esta parte)
- `gj_escarcha_silente_lee_presagio = { ECLIPSE = yes }` para un eclipse y `{ ECLIPSE = no }` para un cometa, con root = pais. Solo actua si el pais sigue la Escarcha Silente: el filtro va dentro. Un eclipse suma `doom_extreme_penalty` (+20 de perdicion) y un cometa `doom_weak_penalty` (+5).

## Del juego base (hay que revisar que no falle en la 1.4.9)
- `on_max_doom_reached` esta definido en `_hardcoded.txt` del juego base (lanza `doom.1`). Esta parte lo redefine con `first_valid_on_action` (su Noche si la religion es la nuestra; `doom.1` en lo demas). Si el motor FUNDE las on_action con el mismo nombre en vez de reemplazarlas, `doom.1` saltaria tambien para la Escarcha Silente (sacrificar a la familia gobernante). Es lo primero que hay que mirar al probar. Si pasa, hay que renombrar la entrada del juego base o quitarla de `_hardcoded.txt` en el mod.
- Valores de script del juego base usados: `doom_weak_bonus`, `doom_weak_penalty`, `doom_mild_bonus`, `doom_mild_penalty`, `doom_severe_bonus`, `doom_extreme_penalty`, `prestige_*`, `stability_*`, `legitimacy_*`, `estate_satisfaction_*`, `army_tradition_mild_bonus` y el efecto `change_gold_effect`.
- Decision category `country_specific_decisions` (existe en el base).
- `always = $ECLIPSE$` (trigger `always`, parametro de scripted effect): estandar del motor, no comprobado en esta version.
