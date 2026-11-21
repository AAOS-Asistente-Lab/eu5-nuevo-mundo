# NECESITA: lo que la parte minores_norte usa sin definirlo

## Imprescindible (la parte no carga sin esto)
1. **Grupos culturales** (los define la integración o la parte de cada facción), usados en `culture_groups` de las 8 culturas:
   - `gj_grupo_ostrevari` (gj_tarnavi, gj_marismeno, gj_vigiano);
   - `gj_grupo_lagunas` (gj_nenvari);
   - `gj_grupo_fiordo` (gj_isbranti);
   - `gj_grupo_enano` (gj_hondarri);
   - `gj_grupo_estepa` (gj_aryuki);
   - `gj_grupo_insepulto` (gj_cenizario).
   Si un grupo todavía no existe, la integración lo crea con su bloque vacío en `culture_groups/` y su localización (`<grupo>` y `<grupo>_desc`).
2. **El enganche del pulso anual.** `in_game/common/on_action/gj_minores_norte_enganche.txt` redefine `yearly_country_pulse` con una sola línea (`on_actions = { gj_minores_norte_pulso_anual }`). **[a probar]** si el motor fusiona on_actions del mismo nombre de distintos ficheros. Si no los fusiona, la integración debe borrar ese fichero y añadir esa línea a mano en su propia copia de `yearly_country_pulse`, sin tocar lo demás. Sin enganche, los eventos 1-26 no se disparan solos (las decisiones, los avances, las misiones y el resto funcionan igual).
3. **Países con cultura.** Para que un país reciba un menor, su cultura primaria tiene que ser la de la tabla de `IDENTIDAD.md`. La integración (o la plantilla de arranque) lo hace al asignar identidades a los países que genera RNW.

## Piezas externas que no se usan (para que conste)
- No se usa ningún `gj_es_*`: los menores se reconocen por cultura, con triggers propios (`gj_minores_norte_menor_ciudad_estado`, `gj_minores_norte_menor_clan`, `gj_minores_norte_menor_marca`, `gj_minores_norte_menor_norte`, `gj_minores_norte_ubicacion_ciudad_estado` y `gj_minores_norte_ubicacion_marca`, definidos en esta parte).
- No se usa ningún `gj_zona_*`.
- No se usa ninguna pieza de otra parte (religiones, ruinas, bestias, contacto).

## Por si la integración quiere enlazar más (opcional, no hace falta para cargar)
- **Religión:** los menores no traen religión propia. Se recomienda asignarles la de su vecino: Tarnavia, Marisma Gris y Vigía Alto, `gj_luz_fundadores`; Nenvar e Isbrant, `gj_espiritus_lago`; Hondarr, `gj_llama_profunda`; Tres Pozos, `gj_cielo_clanes`; Capítulo de Ceniza, la que decida la parte de Hrímval (su rival).
- **Vasallaje:** Vigía Alto puede salir como vasallo de Ostrevar, y Tarnavia como asociada. Es opcional.
- **Casus belli y ruinas (mundo_ruinas):** los menores pueden usarse como destinatarios de las expediciones por afinidad de grupo, sin cambios.

## Ronda de reparación: lo que no depende de esta parte
- **Tareas de misión (9 errores del comprobador).** comprueba-parte.mjs / comprueba-mod.mjs dan «clave desconocida» en las 9 tareas de in_game/common/missions/gj_minores_norte_misiones.txt (gj_minores_norte_ce_tarea_gremios, _franquicias, _milicia, gj_minores_norte_cl_tarea_juramento, _fuego, _hijos, gj_minores_norte_ma_tarea_atalaya, _guardia, _relevo). Motivo: en el juego las tareas son bloques anidados dentro de la misión (como mission_create_cabinet en generic_capable_cabinet_mission_pack.txt), y el comprobador solo registra las definiciones de primer nivel; no tiene missions en su lista ANIDADAS. La parte sigue el formato del juego, así que la solución es de la integración: añadir ['missions', null, 'tareas_mision'] (hijos directos de la misión que empiecen por gj_) a ANIDADAS en comprueba-mod.mjs. Renombrar las tareas con claves del juego no sirve (chocarían con su localización). Ninguna otra parte define misiones.
