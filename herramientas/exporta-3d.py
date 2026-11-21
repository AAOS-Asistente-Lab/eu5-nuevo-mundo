"""exporta-3d.py: los arboles 3D y el suelo del mapa siguen nuestra vegetacion mezclada.

RNW precalcula los arboles (gfx/map/map_objects) y las bandas de material del suelo
(gfx/terrain2/decals/*_materials.*) con SU vegetacion. Este guion vuelve a correr la generacion
de RNW del mismo mundo, pero dandole la vegetacion de nuestro location_templates.txt en las dos
unicas funciones que la pasan al suelo y a los arboles (_slot_tables y _pixel_classes). Todo lo
demas sale igual. No toca la carpeta de RNW ni su biblioteca: trabaja en --datos.

Se lanza con el Python del propio RNW (lo hace exporta-3d.mjs, que tambien copia el resultado):
  <RNW>/generator/python/python.exe exporta-3d.py <location_templates.txt nuestro>
      <atlas.json del mundo> <world code> <mascara.png> <carpeta de datos> <carpeta de salida>

Usa funciones internas de RNW 1.2.2: con otra version hay que revisarlo.
"""

import dataclasses
import json
import re
import sys
from pathlib import Path

import rnw.eu5_nw_export as nw
from rnw import cli

plantillas, atlas, codigo, mascara, datos, salida = sys.argv[1:7]
nuestra = dict(
    re.findall(
        r"^\s*([\w\-.]+)\s*=\s*\{[^\n]*?\bvegetation\s*=\s*(\w+)",
        Path(plantillas).read_text("utf-8-sig"),
        re.M,
    )
)
_atlas = json.loads(Path(atlas).read_text("utf-8"))
claves = _atlas["locations"]["key"]
_voc = _atlas["vocabulary"]["vegetation"]
veg_atlas = [_voc[i] if i >= 0 else "" for i in _atlas["locations"]["vegetation"]]
cambiadas = 0


def con_nuestra(biomas):
    """Los mismos biomas con nuestra vegetacion en la tierra (el agua sigue en "")."""
    global cambiadas
    if len(claves) != len(biomas.vegetation):
        sys.exit(f"exporta-3d: el atlas tiene {len(claves)} celdas y el mundo {len(biomas.vegetation)}: no es el mismo mundo")
    distintas = sum(bool(v) and v != a for v, a in zip(biomas.vegetation, veg_atlas, strict=True))
    if distintas:
        sys.exit(f"exporta-3d: {distintas} celdas no coinciden con el atlas: las claves no casan, no sigo")
    nueva = []
    for clave, veg, topo in zip(claves, biomas.vegetation, biomas.topography, strict=True):
        v = nuestra.get(clave, veg) if veg else veg
        if v == "desert" and topo == "wetlands":  # el juego no tiene bioma de desierto en humedal
            v = veg
        nueva.append(v)
    cambiadas = sum(a != b for a, b in zip(nueva, biomas.vegetation, strict=True))
    return dataclasses.replace(biomas, vegetation=tuple(nueva))


_slot, _pixel = nw._slot_tables, nw._pixel_classes
nw._slot_tables = lambda mapa, atributos, biomas, *resto: _slot(mapa, atributos, con_nuestra(biomas), *resto)
nw._pixel_classes = lambda mapa, atributos, biomas, *resto: _pixel(mapa, atributos, con_nuestra(biomas), *resto)

Path(datos).mkdir(parents=True, exist_ok=True)
Path(salida).mkdir(parents=True, exist_ok=True)
sys.argv = ["rnw", "world", codigo, "--land-image", mascara, "--data-dir", datos, "--out", salida]
try:
    cli.app()
finally:
    print(f"exporta-3d: {cambiadas} localizaciones con nuestra vegetacion", file=sys.stderr)
