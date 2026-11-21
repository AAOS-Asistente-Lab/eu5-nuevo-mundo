# luz_fundadores: lo que usa sin definirlo (lo pone la integracion)

## Piezas de otras partes
- Grupo de religion **`gj_fe_norte`** (contrato, tabla 5): la religion lo usa en `group`.

## Enganches que debe hacer la integracion
Los on_actions estan definidos en `in_game/common/on_action/gj_luz_fundadores_on_actions.txt`, root = pais. Hay que llamarlos desde los de base:
- `gj_luz_fundadores_pulso`: desde un pulso anual de pais (por ejemplo, `on_actions = { gj_luz_fundadores_pulso }` en `country_yearly`) o desde `religion_flavor_pulse` (`first_valid_on_action`). Hace la contabilidad de lumbres y lanza los eventos 1, 4 a 8, 10 y 12.
- `gj_luz_fundadores_al_canonizar`: desde `on_made_saint` (usa `scope:recipient`).
- `gj_luz_fundadores_al_morir_el_soberano`: desde `on_ruler_death_delayed` (usa `scope:old_ruler`).
Si el juego no admite sumar entradas a un on_action de base desde un mod sin pisarlo, hay que copiar su contenido a un fichero propio con la entrada anadida.

## Llamadas desde otras partes
- mundo_bestias: `gj_luz_fundadores_lee_presagio = yes` (root = pais). Tambien existen `gj_luz_fundadores_lee_presagio_cometa` y `_eclipse` para fijar el tipo.

## Arte y datos
- Icono de la religion: `gfx/interface/icons/religion/` (ahora usa los tags `folk_european_gfx pagan_gfx` de la base; falta un icono propio).
- Los tipos de lugar sagrado no tienen locations: falta un `holy_sites/` que los use con `religions = { gj_luz_fundadores }`.
- Ostrevar usa esta religion (`gj_luz_fundadores`); no escribe aqui su evento religioso .3 (es suyo).

## No usa
- Ninguna etiqueta de pais, ningun `gj_es_*` ni `gj_zona_*`, ningun id de location.

## Estado tras la ronda de reparacion (21-11)
- El comprobador da 3 errores 'on_action ... no lo llama nadie' (gj_luz_fundadores_pulso, _al_canonizar, _al_morir_el_soberano). Son los 3 ganchos que la integracion debe enlazar a country_yearly/eligion_flavor_pulse, on_made_saint y on_ruler_death_delayed; el formato de ganchos no es de esta parte y no se toco. Una pasada previa del mismo comprobador salio con 0 al coincidir con un fichero de integracion que mencionaba los nombres, y despues dejo de hacerlo cuando la fusion se reescribio: el resultado depende de esa integracion. No se simulo el enlace con comentarios.
- Nota para la integracion: unde-partes.mjs solo acepta on_actions propios terminados en _pulso_anual, _anual o _yearly_pulse; el pulso se llama gj_luz_fundadores_pulso y los otros dos no cumplen ese patron, asi que hay que enlazarlos a mano.
