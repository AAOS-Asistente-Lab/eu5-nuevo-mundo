# Validacion de luz_fundadores (21-11)

Veredicto: OK. No hubo fallos mecanicos y no se ha cambiado ningun fichero de la parte.

## Comprobaciones
1. Llaves: equilibradas en los 9 .txt (sin comentarios ni cadenas). Pares abre/cierra: lugares sagrados 6/6, on_actions 16/16, religion 5/5, aspectos 8/8, efectos 37/37, triggers 3/3, eventos 125/125, conceptos 2/2, modificadores 28/28.
2. Localizacion: el .yml empieza por `l_spanish:` y lleva BOM (EF BB BF); los 10 ficheros .txt/.yml llevan BOM. 97 claves, todas con texto. Cubren titulos, descripciones y opciones de los 12 eventos, el tooltip `gj_luz_fundadores_canonizar_tt`, los 14 modificadores (`STATIC_MODIFIER_NAME_/DESC_`), los 4 aspectos, los 2 lugares sagrados, la religion y los 2 conceptos (`game_concept_`). Las `_desc` de los aspectos y `gj_luz_fundadores_ADJ/_desc` no se referencian desde el codigo, pero son las que usa el motor por convencion.
3. Sin etiquetas de pais, sin ids de location, sin rutas ni letras de unidad. Todas las claves propias llevan `gj_luz_fundadores_` o son del contrato (`gj_fundadores`, `gj_fundador`, `gj_aspecto_*`, `gj_fundadores_*`, `gj_ciudad_del_fundador_modifier`, etc.). Nada fuera de `partes/luz_fundadores/`.
4. Claves del motor: se contrastaron 83 distintas contra `in_game` y `main_menu` del juego base (modificadores, efectos, triggers, escalas `*_bonus/_penalty`, `age_2_renaissance`, `current_age_or_later`, `on_made_saint`, `on_ruler_death_delayed`, `religion_flavor_pulse`, iconos de aspecto, tags de grafico `folk_european_gfx`/`pagan_gfx`, `clergy_estate`). Las 83 existen.
5. Cifras de RESUMEN.md: cuadran. 19 bonificaciones (7 de `definition_modifier` + 4 aspectos x 3), dentro de 15-20; 4 aspectos (rango 2-4); 2 tipos de lugar sagrado (rango 1-2); 12 eventos (rango 8-12); `gj_luz_fundadores_lee_presagio` presente, con `_cometa` y `_eclipse`; sin escuelas, porque la tabla 5 no le asigna ninguna. Sin dioses ni focos: su mecanica (canonizacion) no los usa.
6. Equilibrio: el mayor premio es -25 % al coste de canonizar; los aspectos se eligen 2 de 4 y su tope es +10 %; la ciudad del Fundador da +15 % de capacidad de poblacion en una sola location. Hay debilidades (sin ciudades nuevas no hay Fundador; lumbre apagada). Dentro de la regla de MECANICAS H y la seccion 7.
7. Sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft u otras obras (busqueda de terminos y lectura de los textos).

## Arreglado
Nada: no se encontro ningun fallo mecanico.

## Pendiente (no mecanico, ya en NECESITA.md)
- Grupo `gj_fe_norte` (lo define la integracion).
- Enganchar `gj_luz_fundadores_pulso`, `_al_canonizar` y `_al_morir_el_soberano` a `country_yearly`/`religion_flavor_pulse`, `on_made_saint` y `on_ruler_death_delayed`.
- mundo_bestias debe llamar a `gj_luz_fundadores_lee_presagio`.
- Icono propio de la religion y fichero `holy_sites/` con locations reales.
- NOT_TESTED (hace falta el juego): `saints_concept = gj_fundadores`, `num_location_rank:city` dentro de `set_variable`, `scope:recipient`/`scope:old_ruler` en los eventos, y enganchar on_actions nuevos sin pisar los de base.

## Ronda de reparacion

- Comprobador (
ode herramientas/comprueba-parte.mjs luz_fundadores): 0 errores de texto o de claves; 3 errores 'on_action no lo llama nadie' que dependen de la integracion (ver NECESITA.md), codigo de salida 1. Una primera pasada dio PASA con 0 al coincidir con un fichero de integracion que ya mencionaba esos nombres. Quedan 11 avisos, todos de claves de localizacion sin uso en scripts (conceptos game_concept_gj_fundadores*, tipos de lugar sagrado y dos descripciones de evento .11.desc.cometa/eclipse, mas el tooltip de canonizar); son los textos que el motor o la integracion usan por convencion, no errores.
- Arreglado: nada que arreglar en el codigo; la parte ya pasaba al empezar la ronda.
- Nombres repetidos: ninguno de los pares de BALANCE.md (seccion 5) afecta a esta parte (busqueda de los 11 nombres en su localizacion: 0 coincidencias), asi que no se renombro nada.
- Pendientes de BALANCE.md: enganchar los 3 on_actions, holy_sites con locations y probar saints_concept y 
um_location_rank. Dependen de la integracion y del juego (no se ejecuta); siguen en NECESITA.md.
- No se tocaron ganchos ni recortes de equilibrio.
