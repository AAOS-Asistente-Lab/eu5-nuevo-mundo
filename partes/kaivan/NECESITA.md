# Lo que usa la parte kaivan sin definirlo

## Triggers que define la integración
- `gj_es_kaivan = yes` (trigger de país): lo usan avances, reformas, edificios, decisiones, desastre y eventos.
- Triggers de location (geografía, uno por clan; hay que repartirlos de modo que existan en el mapa generado):
  - `gj_zona_estepa_alta` (clan Uzhar)
  - `gj_zona_marca_occidental` (clan Tarkhen, frontera con Ostrevar)
  - `gj_zona_valles_orientales` (clan Ilbari)
  - `gj_zona_estepa_baja` (clan Merghan)

## Cosas del motor que habría que revisar al integrar
- **Los dos `on_action`** (`on_ruler_death_delayed` y `yearly_country_pulse`) están en `gj_kaivan_on_actions.txt` y suponen que el motor fusiona las listas con las del juego base. Si no las fusiona, hay que añadir `gj_kaivan.1` al `events` de `on_ruler_death_delayed` y `gj_kaivan_pulso_anual` a `on_actions` de `yearly_country_pulse` en el fichero del juego base copiado.
- `has_advance` en el evento 37: depende de la clave de avance `gj_kaivan_jinetes_de_lobo` de esta parte.
- Gobierno de horda y estamento de tribus (`tribes_estate`): se suponen. Si Kaïvan arranca con otro gobierno, `add_estate_satisfaction` sobre `tribes_estate` no tendrá efecto.
- El desastre reutiliza la ilustración del desastre de horda del juego base.
- La separación de un clan (`gj_kaivan_secesion_de_clan`) usa `create_country_from_location`: no está probada, es el único efecto que crea un país.

## Piezas de otras partes (todas opcionales)
- **cielo_clanes** (religión): el «dios del reinado» (cada kan elige su dios, `gods/` a la manera de tengri) vive en esa parte; el Círculo no lo llama. Cuando exista, conviene que el evento `gj_kaivan.2` ofrezca elegirlo en la misma pantalla.
- **mundo_bestias**: los Jinetes Lobo son jinetes sobre lobos de la estepa. No necesitan nada de A3, pero si A3 define lobos blancos, el evento `gj_kaivan.37` puede enlazar con ellos.
- **mundo_contacto**: nada. La difusión del saber le llega a Kaïvan por sus avances, no por esta parte.
- **hrimval**: el evento `gj_kaivan.44` (exploradores del norte blanco) es un guiño, sin dependencia.

## Cosas que la integración tiene que fijar
- Cultura primaria `gj_kaivani`, religión `gj_cielo_clanes`, grupo `gj_grupo_estepa`.
- Gobierno de arranque y plantilla (ver IDENTIDAD.md).
- Tamaño: unas 140 locations; con los 4 clanes representados en el territorio. Si algún clan no tiene tierra, no puede ganar el Círculo (el sistema lo tiene en cuenta).
