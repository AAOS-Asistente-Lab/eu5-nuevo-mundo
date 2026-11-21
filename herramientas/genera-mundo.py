"""genera-mundo.py: genera un mundo de RNW con otro dibujo, conservando la semilla y los ajustes de otro.

Se lanza con el Python del propio RNW (generator/python/python.exe), con el juego cerrado u 8 GB libres:
  python.exe genera-mundo.py <world code de partida> <mascara.png> <carpeta de datos> <carpeta de salida>
      [seccion.ajuste=valor ...]        p. ej. new_world.location_px=46 natives.state_locations=8
  --solo-codigo en vez de las carpetas: solo imprime el codigo nuevo y sus cambios.

Deja el mod rnw_exp_world_<id> en la carpeta de salida (no toca la biblioteca de RNW ni Documents).
Usa funciones de RNW 1.2.2 (rnw.app.worldcode, rnw.landmask): con otra version hay que revisarlo.
"""

import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(sys.executable).resolve().parent.parent / "site"))

from rnw import cli, landmask  # noqa: E402
from rnw.app import worldcode  # noqa: E402

args = [a for a in sys.argv[1:] if a != "--solo-codigo"]
solo = "--solo-codigo" in sys.argv
resto = args[2:] if solo else args[4:]
if len(args) < (2 if solo else 4) or any(p.count("=") != 1 or p.split("=")[0].count(".") != 1 for p in resto):
    sys.exit(__doc__)
base, mascara = args[0], args[1]
viejo = worldcode.decode(base)
cambios = copy.deepcopy(viejo.changes)
cambios["mask"] = {"id": landmask.read(Path(mascara)).id}
for par in resto:
    clave, valor = par.split("=")
    seccion, ajuste = clave.split(".")
    cambios.setdefault(seccion, {})[ajuste] = int(valor)
nuevo = worldcode.new_code(viejo.preset, viejo.seed, cambios)  # valida los ajustes
nuevo = worldcode.WorldCode(nuevo.preset, nuevo.seed, nuevo.generator, nuevo.changes, viejo.origin)
codigo = worldcode.encode(nuevo)
print(f"codigo: {codigo}")
print(f"cambios: {nuevo.changes}")
sys.stdout.flush()
if not solo:
    datos, salida = args[2], args[3]
    Path(datos).mkdir(parents=True, exist_ok=True)
    Path(salida).mkdir(parents=True, exist_ok=True)
    # Sin esto RNW tapa el Nuevo Mundo en la seleccion de pais (su opcion «Show the New World
    # before it is played» viene apagada en una carpeta de datos nueva) y el mod sale con otros ficheros.
    (Path(datos) / "preferences.json").write_text('{"show_new_world": true}', encoding="utf-8")
    sys.argv = ["rnw", "world", codigo, "--land-image", mascara, "--data-dir", datos, "--out", salida]
    cli.app()
