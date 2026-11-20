# Mecánicas de fantasía: elaboradas

**el jugador A, 20-11 (22:0x):**
- «todas suenan bien, elabóralas más»;
- Kaïvan cambia de capital con cada rey, como en un kurultai;
- hace falta una facción remota en el norte helado, de no-muertos o algo parecido, poco expansiva pero peligrosa.

**Cómo leer este documento.** Entre corchetes va la pieza del motor que lo sostiene (ver `FORMATO-EU5.md` §2). Lo que no tiene pieza directa se monta con eventos, decisiones, variables y modificadores, y lleva la marca **[a probar]**. Todos los nombres son nuestros.

---

## A. Para todo el nuevo mundo

### A1. Ruinas de los Antiguos
- **Cuántas y dónde:** de 12 a 16 ruinas, de tres tipos: atlantes, enanas y «de los que vinieron antes». Casi todas están tierra adentro, lejos de la costa, para premiar a quien extiende el control hacia el interior. [modificador de location y `event_only_buildings`]
- **Explorarlas:** con la decisión «Enviar una expedición», cuando la ruina queda en tierra propia con control suficiente. Cuesta oro y un personaje (explorador o general), que puede morir. [`decisions/` y una cadena de eventos]
- **Lo que sale**, por tirada con cuatro niveles:
  1. **Hallazgo menor:** oro y prestigio.
  2. **Artefacto:** un modificador de país, permanente y único, y quien lo tiene lo puede perder en una guerra. Por ejemplo:
     - el Astrolabio Azul (navegación);
     - las Tablillas del Riego (comida);
     - la Corona Partida (legitimidad);
     - el Martillo sin Mango (forja).
  3. **Saber perdido:** un avance de la era siguiente, antes de tiempo.
  4. **Despertar:**
     - guardianes que se alzan (rebeldes en la región);
     - o una plaga de bestias;
     - o una maldición temporal sobre la provincia.
- **Afinidad:** las facciones afines tiran mejor. Thalassar en las ruinas atlantes, Durnhal en las enanas.
- **Después:** la ruina explorada se queda como «Ruina restaurada» (estabilidad y prestigio local). Si la religión lo permite, puede pasar a ser lugar sagrado. [`holy_sites/`]

### A2. Vetas de poder
- **Cuántas y dónde:** de 5 a 7 vetas: dos o tres por continente y una en el mar interior. Se colocan a propósito en fronteras entre facciones, para que haya que pelearlas.
- **Cuatro tipos:**
  - Fuego: forja y armas;
  - Marea: comercio y flota;
  - Raíz: comida y crecimiento de la población;
  - Estrella: investigación.
- **El monumento**, en tres niveles caros y lentos: [edificio único por niveles]
  1. bonificación local;
  2. bonificación regional;
  3. bonificación de país y un efecto especial del tipo. Por ejemplo, la Raíz del nivel 3 da una cosecha doble cada década.
- **Si se conquista:** el conquistador hereda el monumento con un nivel menos («el monumento se resiente»). Tener una veta cerca da un casus belli contra quien la tiene. [`add_casus_belli` por evento]
- **Efecto secundario:** con una veta activa, la región tiene más eventos de magia y de bestias.

### A3. Bestias
- **El dragón de la caldera de Durnhal.** Tiene tres estados: dormido, inquieto y despierto. [variable global y eventos]
  - **Qué lo despierta:** la minería profunda de Durnhal (C2) y las guerras dentro de la caldera.
  - **Despierto:** es un desastre regional:
    - quema locations;
    - mata población;
    - desgasta a los ejércitos de la zona;
    - de vez en cuando cobra un tributo en oro a todos los países de la zona.
  - **Cazarlo:** con la decisión «La Gran Cacería», que pide un ejército grande y un general.
    - Si sale bien: prestigio enorme y un artefacto (Escamas de Brasa para el ejército o Corazón de Brasa para la forja).
    - Si sale mal: el general muere y el dragón se enfurece.
  - **Pactar con él:** solo con la Llama Profunda, donde el dragón pasa a ser un dios temporal. [`gods/`]
    - Da bonificaciones enormes.
    - Pero cada década pide un pago en población.
- **Los krakens del estrecho entre los dos continentes.**
  - Cada mes hay una probabilidad de perder barcos o de que caiga el comercio que pasa por allí. [modificador de zona marítima y eventos]
  - Baja si patrullas con flota o si haces el rito del Mar Dormido.
  - Matar al kraken es una decisión naval, con su propio premio.
  - **Para dos jugadores:** el estrecho une los dos continentes, así que cuidarlo o dejarlo infestado tiene consecuencias para los dos.
- **Plagas de bestias** (lobos gigantes en la estepa, wyverns en las montañas, enjambres en la selva): eventos regionales que bajan el control y la producción.
  - Se limpian con una «Batida»: un ejército en la zona durante unos meses, que gana experiencia y prestigio.
  - Algunas facciones domestican a sus bestias. Kaïvan monta a los lobos de la estepa (D5).

### A4. Cometas y eclipses
- **Cuántos:** de 2 a 3 por era, en fechas aleatorias, para todo el mundo a la vez. [`age_event` y `has_omens`]
- **Las opciones de todos:**
  - leerlo como buen augurio: más moral;
  - leerlo como mal augurio: se prepara la defensa.
- **Además, cada religión lo lee a su manera:**
  - **Llama Profunda:** una chispa del fuego de abajo: más forja y más estabilidad.
  - **Mar Dormido:** el mar se agita: bonificaciones navales, pero riesgo de mareas que inundan la costa.
  - **Sol Blanco:** el eclipse es una crisis de legitimidad, salvo que se celebre el rito, y entonces da una gran bonificación.
  - **Dioses Hambrientos:** los dioses tienen hambre: hay que hacer una guerra de cosecha en 5 años o se pierde devoción.
  - **Escarcha Silente:** cada eclipse adelanta la Noche Blanca (D10).

---

## B. Religiones: qué mecánica del motor usa cada una

| Religión | Quién la sigue | Mecánica propia [bandera del motor] | Sabor |
|---|---|---|---|
| La Llama Profunda | Durnhal | Pureza (`has_purity`) y dioses (`gods/`) | La pureza sube con las forjas y los ritos, y baja si se sella mal una mina o se pacta con el dragón. |
| El Mar Dormido | Thalassar | Ritos (`has_rite_power`) | Ritos de marea: calmar a los krakens, levantar la ciudad, bendecir la flota. |
| El Sol Blanco | Ankarú | Dualidad (`has_yanantin`) y focos (`religious_focuses/`) | El equilibrio entre la siembra y la cosecha y entre el sol y la luna marca el calendario (D4). |
| Los Dioses Hambrientos | Orunmar | Influencia religiosa (`has_religious_influence`) | La devoción sube con los cautivos ofrecidos y baja en los años de paz. |
| Los Espíritus del Lago | Liga y Skarren (como dos escuelas) | Presagios (`has_omens`) y lugares sagrados en lagos | Los presagios del hielo y del agua guían el comercio y las incursiones. |
| La Senda Verde | Velathi | Karma (`has_karma`) | El equilibrio con el bosque: talar o crecer deprisa lo baja, y plantar lo sube. |
| El Cielo de los Clanes (nueva) | Kaïvan | Dioses de duración limitada (`gods/`, como `tengri`) | Cada kan elige el dios de su reinado, y el dios cambia cuando cambia el kan (D5). |
| La Escarcha Silente (nueva) | Hrímval | Perdición (`has_doom`) | La perdición es el reloj de la Noche Blanca (D10). |
| Ostrevar, Sorava y la Marea Negra | — | Se decide en el plan: una religión propia o una escuela de las de arriba | — |

Cada religión lleva:
- su bonificación de definición;
- entre 2 y 3 aspectos elegibles [`religious_aspects/`];
- su lugar sagrado [`holy_sites/`];
- y entre 8 y 12 eventos propios.

---

## C. Por facción: el norte

### C1. Alto Reino de Ostrevar (constructor, «tall», hombres del oeste)
- **Legados por era.** Al cerrar cada era, se elige un legado permanente entre tres. Las tres opciones dependen de lo que hayas hecho en esa era. Por ejemplo: [`age_event` y modificadores permanentes]
  - si creció la población: Graneros del Reino;
  - si construiste mucho: la Escuela de Canteros;
  - si mantuviste la paz: las Leyes del Río;
  - si hiciste ciudades grandes: la Ciudad de Mármol.

  En seis eras se juntan seis legados.
- **La llamada de las ciudades.** Es una política que se activa y se apaga:
  - **Qué hace:** atrae población de los vecinos hacia tus ciudades y la mueve del campo a la ciudad. Atrae más cuanto mayores son tu prosperidad y tu tolerancia. [modificadores de migración] **[a probar]**
  - **Qué cuesta:** descontento entre los campesinos y peor opinión de los vecinos.
- **Construir hacia arriba.** Edificios propios que solo caben donde hay mucha población:
  - la Torre del Gremio;
  - el Barrio Alto;
  - el Acueducto de Piedra.

  Dan más producción y más huecos de edificio. [`unique_buildings`]
- **Reformas únicas:**
  - «La Carta de las Ciudades», en la era 2: los burgueses ganan peso y su población rinde más;
  - «El Consejo de Piedra», en la era 4.
- **Su precio:** el ejército le sale caro, y las guerras ofensivas seguidas le hacen perder legado.

### C2. Durnhal (enanos bajo la montaña, industria)
- **Cavar más hondo.** Es una decisión que se repite en cada mina.
  - Sube la mina de nivel, del 1 al 5, con más metal y más gemas en cada nivel.
  - Cada nivel suma «inquietud de la profundidad». [variables y `decisions/`]
- **Qué hace la inquietud:**
  - provoca derrumbes (se pierde población) y hallazgos (gemas raras o ruinas enanas);
  - pasado un umbral, se despierta el dragón (A3) o, peor, «Lo que duerme debajo», un desastre propio [`disasters/`];
  - se baja con los ritos de la Llama Profunda o sellando minas, que pierden su producción.
- **Edificios propios:**
  - la Gran Forja: mejora la calidad del ejército y de la artillería;
  - los Salones de los Ancestros: estabilidad y legitimidad.
- **Unidades propias:**
  - los Rompeescudos, una infantería pesada;
  - las Bombardas de Runa, una artillería que llega una era antes. [`unit_types`, `is_special`]
- **Población:** crece despacio, pero rinde mucho, con muchos artesanos.

### C3. Liga de las Mil Lagunas (comercio, distrito de lagos)
- **Caminos de hielo.**
  - En invierno, los lagos se hielan: los ejércitos y el comercio los cruzan, y el mercado de la Liga gana capacidad. **[a probar** si el motor deja hacer transitable un lago; si no, se hace con modificadores de invierno y eventos]
  - Al llegar la primavera, un ejército que se quede sobre el hielo puede hundirse.
- **La Asamblea de Lagunas.** Cada ciudad-laguna vota y elige al Barquero Mayor cada cierto tiempo. Los candidatos son mercaderes con rasgos distintos. [situación con votaciones]
- **Edificio propio:** los mercados flotantes, con más capacidad de mercado.
- **Rival natural:** los Skarren, que la saquean. La Liga puede contratar escoltas o pagar tributo.

### C4. Skarren (saqueadores de los fiordos)
- **Gloria y sagas.**
  - Cada saqueo o victoria suma gloria.
  - En cada umbral de gloria se escribe una saga:
    - el jefe de ese saqueo gana un rasgo de héroe permanente;
    - el país gana un modificador de saga, que se pierde a los 50 años si no se escribe otra.
- **La Piedra de la Asamblea.** El rey se elige entre los héroes con más gloria: es una monarquía electiva.
- **La incursión:** una decisión barata contra la costa ajena, que se lleva oro y algunos cautivos.
- **Unidad propia:** los Corredores del Fiordo, barcos rápidos de desembarco.
- **Su precio:** si pasan años sin saquear, los jarls se aburren y se rebelan.

### C5. Kaïvan (guerreros a caballo): la capital cambia con cada rey (cambio de el jugador A)
- **El Círculo de los Clanes**, nuestro kurultai.
  - Al morir el kan, se abre una situación con votación. [`situations/` con votaciones]
  - Entre 3 y 4 clanes presentan candidato, y cada clan está atado a su tierra.
  - Tú (o la IA) apoyas a uno con oro, caballos, prestigio o promesas, que son privilegios para su estamento.
- **La capital se muda a la tierra del ganador.**
  - La nueva capital gana control y desarrollo deprisa.
  - El control del juego sale de la capital, así que cada kan lleva el control a otra zona. Con los reinados, la horda va peinando toda la estepa.
- **Lo que queda atrás:** cada capital vieja deja un Campamento del Kan, un edificio propio que conserva parte del control y cría caballos. Con los siglos, la estepa queda tejida de campamentos.
- **Si la votación sale reñida:** los clanes que pierden pueden:
  - alzarse, con el desastre «La guerra de los hermanos»;
  - o marcharse, como un país independiente.
- **El dios del reinado:** cada kan elige el dios de su reinado (B: El Cielo de los Clanes).
- **La Gran Cabalgada:** se queda como ofensiva, una decisión que reúne a los clanes durante 10 años con más movimiento y más saqueo.
- **Unidades propias:**
  - los arqueros a caballo;
  - los Jinetes Lobo, una caballería ligera montada en lobos de la estepa (A3).

### C6. La Corte Insepulta de Hrímval (no-muertos del norte helado; nueva, pedida por el jugador A)
**La idea:** está lejos y crece poco, pero cuando despierta es temible. Es el enemigo que hace que el norte se una o se traicione.
- **El frío como frontera.**
  - Solo puede tener tierra sin penalización en clima ártico o subártico.
  - Fuera del hielo, su control y su población se deshacen solos: el deshielo.
  - Por eso hace incursiones y no conquistas. [modificadores por clima; pesos de la IA para que no se expanda]
- **La población no nace: se recoge.**
  - **De dónde sale:**
    - una parte de los caídos de cada batalla que gana;
    - las hambrunas y las plagas cercanas, que le suman población;
    - las incursiones, que le traen cuerpos.
  - **Lo que le ahorra:** no necesita comida y no tiene campesinos que se rebelen.
  - **Lo que no tiene:** apenas comercio ni investigación.
- **La Noche Blanca.** [la perdición, `has_doom`, como reloj, y una situación propia]
  - **Qué la adelanta:** la perdición sube con los años, con los eclipses (A4) y con cada batalla grande del norte.
  - **Qué pasa al llegar al máximo:**
    - empieza la Noche Blanca: de 3 a 5 años de invierno sobrenatural en todo el norte;
    - sus ejércitos no sufren desgaste y ganan mucha fuerza;
    - lanza las Marchas de Escarcha, incursiones que arrasan y se llevan cuerpos.
  - **Después:** la Corte se duerme y la perdición vuelve a cero.
  - **Cada cuánto:** una vez cada 30 a 40 años.
- **El Rey bajo el Hielo.**
  - Su gobernante no muere de viejo, porque su vida está atada a un relicario en la capital.
  - Si alguien toma la capital, el rey cae y la Corte se rompe en el desastre «El Deshielo». La única forma de acabar con ella es ir hasta allí.
- **Diplomacia.**
  - Nadie pacta con los muertos: no tiene alianzas normales.
  - Los vecinos pueden pagarle el Diezmo de Huesos (oro o población) para que las Marchas no pasen por su tierra.
- **La Liga de la Sal y la Llama.** Es una organización que pueden formar los países del norte para guardar la frontera, con bonificaciones de defensa contra la Corte. [`international_organizations/`]
  - **Para dos jugadores:** uno puede sostener la Liga y el otro pagar el Diezmo y dejar que las Marchas caigan sobre el vecino.
- **Unidades propias:**
  - las Huestes de Hueso: lentas, sin coste de comida y con moral que no se quiebra;
  - los Gigantes de Escarcha: pesados y escasos.
- **¿Se puede jugar?** Sí, como reto: mucho poder durante la Noche y nada de economía.

---

## D. Por facción: el sur

### D1. Thalassar (atlantes supervivientes)
- **Alzar la ciudad hundida.** Es una situación propia en 5 fases a lo largo de toda la partida. [`situations/`]
  - **Qué pide cada fase:**
    - oro y cristales de marea;
    - y además una condición: dominar el mar interior, explorar una ruina atlante (A1) o llegar a cierta era.
  - **Qué da cada fase:** la ciudad emerge por barrios, como edificios y desarrollo en una location costera.
  - **Al final:** capital nueva y el formable «Thalassar Restaurada». [`formable_countries/`]
- **Los cristales de marea.** Son un bien nuevo, que solo hay en sus costas y en las ruinas atlantes. Se gastan en sus edificios y se venden caros. **[a probar:** añadir un bien al mercado]
- **Unidades propias:**
  - las Naves de Marea: rápidas y sin desgaste en sus aguas;
  - la Galera de Cristal, en las eras finales. [`unit_types`]
- **Su peligro:** la decadencia. Si el proyecto se queda parado demasiado tiempo, llega el desastre «El peso de los siglos», con la nobleza antigua contra el rey.

### D2. Sorava (comercio)
- Se queda para el plan. Tendrá rutas de especias y perlas, y es la rival comercial de la Liga en el estrecho.

### D3. Hermandad de la Marea Negra (piratas)
- **El Código.**
  - No hay rey: los capitanes eligen al Almirante del Código cada cierto tiempo.
  - Los artículos del Código son leyes que se eligen: [`laws/`]
    - cómo se reparte el botín;
    - cómo se trata a los prisioneros;
    - quién puede ser capitán.
- **Patentes de corso.** Cualquier país puede pagar a la Hermandad para que hostigue a un rival.
  - **Qué hace:** el objetivo sufre bloqueos y pierde comercio.
  - **Cómo se para:** el objetivo puede pagar más para dar la vuelta a la patente.
  - **Para dos jugadores:** es una guerra fría con dinero.
- **Edificio propio:** los puertos libres, que atraen contrabando.
- **Su punto débil:** casi no tiene tierra, así que si le quitan los puertos, se disuelve.

### D4. Teocracia de Ankarú (constructor, «tall», altura solar)
- **El calendario solar.** Es una situación que gira en cuatro fases de unos 5 años cada una: [`situations/` y el Sol Blanco (B)]
  - siembra: comida;
  - cosecha: dinero;
  - festival: estabilidad;
  - ayuno: devoción y construcción.

  Si un eclipse coincide con el festival, la fase da una gran bonificación; si coincide con el ayuno, trae una crisis.
- **La Cuerda del Trabajo.** Es una decisión que llama a los campesinos de un área a construir durante unos años.
  - Las obras salen más baratas y se hacen más deprisa.
  - A cambio, hay descontento y menos producción.
- **Las terrazas.** Es un edificio propio que se hace en cadena en las colinas y las montañas.
  - Da más comida y más tope de población, así que hace habitable la montaña.
  - Es su forma de construir hacia arriba.
- **Los caminos de cuerda.** El control se propaga mejor en la montaña.
- **Colonos del Sol.** Es una decisión de migración interna: mueve gente de los valles llenos a los nuevos. **[a probar]**
- **Contra Orunmar:** la unidad Guardianes del Paso, defensiva en la montaña.

### D5. Hegemonía Carmesí de Orunmar (guerras de cosecha)
- Ya está en `PETICION.md`. Su devoción usa la influencia religiosa de los Dioses Hambrientos (B).
- **El Gran Ayuno de los Dioses.** Si pasan años sin guerra, es un desastre propio. [`disasters/`]

### D6. Velathi (pueblo del bosque, longevo)
- **Reyes que viven siglos.** Cada rey vive entre 150 y 300 años. [eventos y `character_modifier`]
  - Dan mucha estabilidad y legitimidad.
  - Por cada 25 años de un mismo rey, baja la investigación.
  - Y existe el riesgo del Sueño Largo: el rey se desentiende y gobierna el consejo como regente.
- **Plantar el Bosque Antiguo.** Es una decisión para las locations arrasadas o vacías.
  - Recupera antes la población y el control.
  - El bosque sagrado es terreno defensivo: los ejércitos enemigos sufren desgaste dentro.
- **Unidad propia:** los Arqueros del Umbral.
- **Su precio:** crecen despacio, tienden al aislamiento y el karma de la Senda Verde (B) les frena la expansión rápida.

---

## E. Pendiente para el plan
- **Las dos «tall» primero, Ostrevar y Ankarú**, más Orunmar como su rival, y A1-A4, que dan juego a todos.
- **La primera bala trazadora:**
  - una facción con su cultura, su religión y 3 eventos;
  - y una mecánica de las de arriba, probada en una partida.
- **Hay que cambiar la cuenta de contenido.** el jugador A calculaba unas 80 piezas para Castilla, pero en el juego base 1.4.9 tiene 206 eventos, 48 avances y 7 reformas (`FORMATO-EU5.md` §2.3).
  - **Lo que se recomienda:** el piso de Suecia: unos 60 eventos, de 10 a 15 avances, 2 reformas, 1 edificio o 1 unidad, 1 situación o 1 desastre y 1 o 2 paquetes de misiones.
  - **El resultado:** unas 80 piezas por país, más su cultura y su religión.

---

## F. Tamaños y riqueza: grandes, medianos y pequeños, ricos y pobres (el jugador A, 22:1x)
Como en el EU base: no todos los países son enormes. «Tall» quiere decir mediano y denso, no grande.

| Continente | Grande | Mediano | Pequeño | Muy pequeño |
|---|---|---|---|---|
| Norte | **Kaïvan** (mucha tierra, pobre por provincia) | **Ostrevar** (rico y denso), **Durnhal** (rico en metal y pobre en comida) | **Liga de las Mil Lagunas** (muy rica), **Skarren** (tierra pobre, rico por el botín), **Hrímval** (pobre, remoto y peligroso) | Menores |
| Sur | **Orunmar** (riqueza media, cautivos) | **Sorava** (rica), **Ankarú** (rica por desarrollo), **Velathi** (poca moneda, mucha madera) | **Thalassar** (rica y con poca gente) | **Marea Negra** (unos pocos puertos, rica a rachas), menores |

**Tres niveles de contenido:**
1. **Las 12 facciones de la tabla:** unas 80 piezas cada una, más su cultura y su religión.
2. **Menores con nombre:** de 6 a 8 por continente. Son ciudades-estado, clanes, jefaturas y vasallos de las grandes, con unas 15-20 piezas compartidas por cada grupo cultural (eventos, 1 o 2 avances y su misión).
3. **Lo que genera RNW:** el resto de los pueblos, con el contenido genérico del propio RNW.

Con esto el mapa se parece al del EU: unos pocos grandes, bastantes medianos y muchos pequeños. Así hay vasallos, alianzas y presas.

**Rivalidades escritas desde el arranque:**
- en el norte: la Liga contra los Skarren, y Kaïvan contra Ostrevar por la frontera de la estepa;
- en el sur: Ankarú contra Orunmar, y Sorava contra la Liga por el estrecho;
- para todos: Hrímval.

## G. Pulido pendiente
1. **Mundo fijo.** RNW es un generador externo que pinta cada mundo al azar (ver `RNW.md`). Para que las facciones caigan donde toca:
   - se dibuja el continente con su editor de tierras, en PNG, con los lagos de tipo Finlandia, los circos de montañas y las rías a mano;
   - se fija una semilla y se genera una sola vez;
   - nuestro mod va encima de ese mundo;
   - el jugador B recibe el mismo mundo, en `.rnworld` o con el World Code.
2. **La llegada del Viejo Mundo.** Hay que decidir si las facciones aguantan mejor que la América del juego base. Por ejemplo:
   - la cadena «Primer contacto»;
   - las plagas que llegan con los barcos;
   - la tecnología que se pone al día;
   - alianzas con los colonizadores.
3. **Una IA con carácter.** Cada facción de la IA juega a lo suyo:
   - Hrímval no se expande;
   - los Skarren saquean;
   - Ankarú y Ostrevar construyen.
4. **Equilibrio para dos jugadores.** Cada continente tiene un constructor, un guerrero, un comerciante, un saqueador o pirata y una facción fantástica.
5. **Compatibilidad:**
   - National Destinies choca con RNW: sustituye los 5 formables que RNW mueve, y 50 de sus ficheros nombran lugares que no existen;
   - el hub de RNW está activado en el playset, y su autor pide no hacerlo.
6. **Memoria.** Generar un mundo pide unos 8 GB de RAM libres. EU5 cayó a las 19:54 con 3,5 GB libres, así que hay que generar con el juego cerrado.
## H. Edificios y unidades especiales: buenos sí, rotísimos no (el jugador A, 22:1x)
**Regla de equilibrio, para todos:**
- **Cuántos:** cada facción mayor lleva 2 edificios y 1 o 2 unidades propias. Los menores, 0 o 1, compartido por grupo cultural.
- **Cada pieza tiene una fuerza clara, una debilidad clara y un límite**, que puede ser de número, de lugar o de era.
- **Tope de fuerza:**
  - una unidad, como mucho un +15-20 % en 1 o 2 valores frente a la del juego base de su misma era;
  - un edificio, como mucho un nivel mejor que su equivalente del juego base.
- **Prueba:** partidas de la IA sola, de 100 años. Si una facción se dispara siempre, se recorta.

| Facción | Edificios | Unidades | Lo que las frena |
|---|---|---|---|
| Ostrevar | Torre del Gremio, Barrio Alto | Guardia de la Ciudad (defensiva) | Solo donde hay mucha población. La Guardia es cara y rinde menos fuera de su tierra. |
| Durnhal | Gran Forja, Salones de los Ancestros | Rompeescudos (choque), Bombardas de Runa | Los Rompeescudos son lentos. Las Bombardas llegan una era antes, pero son caras. Una Gran Forja por área de montaña. |
| Liga de las Mil Lagunas | Mercado Flotante | Patrulleros de Laguna (barcos de lago y río) | Solo junto a lagos. Los Patrulleros son rápidos y débiles en mar abierto. |
| Skarren | Salón de las Sagas | Corredores del Fiordo (desembarco) | Desembarcan sin penalización, pero son flojos en batalla naval. |
| Kaïvan | Campamento del Kan | Arqueros a caballo, Jinetes Lobo | Los arqueros flojean en los asedios. Los Jinetes Lobo están limitados por el número de campamentos. |
| Hrímval | Relicario (solo en la capital), Túmulos del Hielo | Huestes de Hueso, Gigantes de Escarcha | Fuera del frío pierden la mitad. Las Huestes son lentas. Como mucho 3 regimientos de Gigantes. Si se pierde el Relicario, llega el Deshielo. |
| Thalassar | Faro de Marea, Barrio Emergido (por fases) | Naves de Marea, Galera de Cristal | Las Naves son caras y solo sin desgaste en sus aguas. La Galera llega en la era final y con cupo. |
| Sorava | Casa de las Especias | Escoltas de Caravana | Defensivas: protegen el comercio y no conquistan. |
| Marea Negra | Puerto Libre (contrabando) | Bergantines Corsarios | Son de papel en una batalla en línea. El Puerto Libre baja la estabilidad. |
| Ankarú | Terrazas, Observatorio Solar | Guardianes del Paso | Fuertes en montaña y malos en llanura. |
| Orunmar | Escalinata de las Ofrendas | Guerreros de la Captura | Hacen menos daño, pero toman más cautivos al ganar. |
| Velathi | Arboleda Antigua | Arqueros del Umbral | Fuertes en bosque y débiles en campo abierto. |
## I. La llegada del Viejo Mundo (decidido por el jugador A, 20-11, 22:2x)
**Lo que pide:** «no queremos la gran plaga, o al menos que no sea tan devastadora como en el juego base cuando los europeos llegan a América. Y la tecnología, que llegue de alguna forma: no queremos estar atrasados».

**La plaga.** En el juego base 1.4.9 hay tres piezas:
- `situations/great_pestilence`: la gran mortandad americana;
- `diseases/smallpox`: mientras no ha empezado `great_pestilence`, no aparece en América (su `spawn` excluye ese continente); tiene su propio R0;
- `situations/columbian_exchange`: el intercambio de bienes y cultivos.

Lo que cambia nuestro mod:
- **`great_pestilence`, apagada en el Nuevo Mundo.** Si no se puede apagar del todo, se cambia por «Fiebres de los barcos»: brotes locales en los puertos de contacto que matan como un brote normal del Viejo Mundo, no a un continente entero. **[a probar:** si basta con sobrescribir `can_start` o la mortalidad]
- **Viruela con R0 de población con defensas**, no de población sin ninguna. Además, las culturas nuevas ganan una «inmunidad parcial» que crece con los años de contacto.
- **El intercambio colombino se mantiene**, porque es bueno para los dos lados: cultivos y caballos para el Nuevo Mundo, y patata y cacao (o los bienes que toquen) para el Viejo.

**La tecnología.** Cada facción mayor empieza con un nivel de tecnología cercano al europeo (`starting_technology_level`), y sus avances propios cubren las seis eras. Además:
- **Cadena «Primer contacto».** Al encontrarse con un país del Viejo Mundo, se elige entre:
  - **comerciar:** llega la institución y entra dinero;
  - **aprender:** los avances que te faltan cuestan menos y llega una ola de saberes;
  - **cerrarse:** estabilidad y fe, sin difusión.
- **La difusión del saber.** Mientras vayas detrás de tus vecinos o socios comerciales en avances, los que te faltan te cuestan menos, como en un «ponerse al día». Las instituciones se propagan desde los puertos de contacto y las rutas comerciales. [`08_institutions` y modificadores de coste de avances] **[a probar]**
- **Saberes propios a cambio:** los europeos también pueden aprender de nosotros, por ejemplo la forja enana, las terrazas o la navegación atlante. Así el contacto da en las dos direcciones.
- **Límite:** nadie se adelanta a Europa por esta vía. Se trata de no ir atrasados, no de ir por delante.