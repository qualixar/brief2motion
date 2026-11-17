#!/usr/bin/env python3
"""make-lottie.py: writes the three small Lottie animations this example plays (assets/*.json).

They are written by hand as Lottie JSON (the Bodymovin format): no After Effects, no downloaded files.
Run from the repo root:  python3 examples/sprout/tools/make-lottie.py
Colours are 0..1 RGBA. Times are frames at 30 fps. Every file is 120 x 120 and 90 frames (3 seconds), and loops.
"""
import json
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
INK = [0.118, 0.165, 0.110, 1]
LEAF = [0.184, 0.420, 0.184, 1]
WATER = [0.165, 0.365, 0.741, 1]
SUN = [0.878, 0.451, 0.098, 1]
EASE = {'i': {'x': [0.3], 'y': [1]}, 'o': {'x': [0.6], 'y': [0]}}


def still(v):
    return {'a': 0, 'k': v}


def keys(frames):
    """frames: [(t, value), ...] -> an animated property with eased keyframes."""
    out = []
    for i, (t, v) in enumerate(frames):
        k = {'t': t, 's': v if isinstance(v, list) else [v]}
        if i < len(frames) - 1:
            k.update(EASE)
        out.append(k)
    return {'a': 1, 'k': out}


def transform(p=(0, 0), s=(100, 100), r=0, o=100, a=(0, 0)):
    val = lambda v: v if isinstance(v, dict) else still(list(v) if isinstance(v, tuple) else v)
    return {'ty': 'tr', 'p': val(p), 'a': val(a), 's': val(s), 'r': val(r), 'o': val(o), 'sk': still(0), 'sa': still(0)}


def fill(c):
    return {'ty': 'fl', 'c': still(c), 'o': still(100), 'r': 1}


def stroke(c, w, cap=2):
    return {'ty': 'st', 'c': still(c), 'o': still(100), 'w': still(w), 'lc': cap, 'lj': 2}


def ellipse(size, pos=(0, 0)):
    return {'ty': 'el', 'p': still(list(pos)), 's': size if isinstance(size, dict) else still(list(size))}


def rect(size, pos=(0, 0), radius=0):
    return {'ty': 'rc', 'p': still(list(pos)), 's': still(list(size)), 'r': still(radius)}


def path(points, closed=False, curves=None):
    """points: [(x, y)]. curves: optional [(in_dx, in_dy, out_dx, out_dy)] per point for bezier handles."""
    curves = curves or [(0, 0, 0, 0)] * len(points)
    return {'ty': 'sh', 'ks': still({'c': closed, 'v': [list(p) for p in points], 'i': [[c[0], c[1]] for c in curves], 'o': [[c[2], c[3]] for c in curves]})}


def trim(end):
    return {'ty': 'tm', 's': still(0), 'e': end, 'o': still(0), 'm': 1}


def group(*items, **tr):
    return {'ty': 'gr', 'it': list(items) + [transform(**tr)]}


def layer(ind, name, shapes, p=(60, 60), s=(100, 100), r=0, o=100, a=(0, 0)):
    val = lambda v, d3=False: v if isinstance(v, dict) else still(list(v) + ([0] if d3 and len(v) == 2 else []) if isinstance(v, tuple) else v)
    return {'ddd': 0, 'ind': ind, 'ty': 4, 'nm': name, 'sr': 1, 'ao': 0, 'ip': 0, 'op': 90, 'st': 0, 'bm': 0,
            'ks': {'o': val(o), 'r': val(r), 'p': val(p, True), 'a': val(a, True), 's': val(s, True)}, 'shapes': shapes}


def comp(name, layers):
    return {'v': '5.7.4', 'fr': 30, 'ip': 0, 'op': 90, 'w': 120, 'h': 120, 'nm': name, 'ddd': 0, 'assets': [], 'layers': layers}


# 1. water: a drop falls, lands, and two ripples spread
drop_shape = path([(0, -14), (9, 4), (0, 13), (-9, 4)], closed=True, curves=[(0, 0, 0, 0), (0, -6, 0, 6), (5, 0, -5, 0), (0, 6, 0, -6)])
water = comp('water', [
    layer(1, 'drop', [group(drop_shape, fill(WATER))],
          p=keys([(0, [60, 14, 0]), (34, [60, 78, 0]), (35, [60, 78, 0]), (89, [60, 78, 0])]),
          s=keys([(0, [60, 60, 100]), (20, [100, 100, 100]), (34, [100, 100, 100]), (40, [130, 30, 100]), (46, [0, 0, 100]), (89, [0, 0, 100])])),
    layer(2, 'ripple 1', [group(ellipse(keys([(34, [6, 2]), (74, [84, 26])])), stroke(WATER, 4))], p=(60, 92),
          o=keys([(0, 0), (34, 0), (38, 100), (74, 0), (89, 0)])),
    layer(3, 'ripple 2', [group(ellipse(keys([(44, [6, 2]), (86, [64, 20])])), stroke(WATER, 3))], p=(60, 92),
          o=keys([(0, 0), (44, 0), (48, 80), (86, 0), (89, 0)])),
])

# 2. sun: the disc breathes, eight rays turn an eighth of a turn (so the loop is seamless)
rays = [group(rect((6, 16), (0, -44), 3), fill(SUN), r=i * 45) for i in range(8)]
sun = comp('sun', [
    layer(1, 'disc', [group(ellipse((44, 44)), fill(SUN))], s=keys([(0, [100, 100, 100]), (45, [112, 112, 100]), (89, [100, 100, 100])])),
    layer(2, 'rays', rays, r={'a': 1, 'k': [{'t': 0, 's': [0], 'i': {'x': [1], 'y': [1]}, 'o': {'x': [0], 'y': [0]}}, {'t': 90, 's': [45]}]}),
])

# 3. reminder: a calendar page; the tick draws itself, holds, and clears
tick = path([(-16, 4), (-5, 15), (17, -9)])
reminder = comp('reminder', [
    layer(1, 'tick', [group(tick, trim(keys([(18, 0), (44, 100), (74, 100), (88, 0)])), stroke(LEAF, 8))], p=(60, 68)),
    layer(2, 'rings', [group(rect((6, 16), (-18, -40), 3), fill(INK)), group(rect((6, 16), (18, -40), 3), fill(INK))]),
    layer(3, 'page', [group(rect((76, 72), (0, 4), 12), stroke(INK, 6))],
          s=keys([(0, [100, 100, 100]), (44, [100, 100, 100]), (50, [106, 106, 100]), (58, [100, 100, 100]), (89, [100, 100, 100])])),
])

os.makedirs(OUT, exist_ok=True)
for name, data in (('water', water), ('sun', sun), ('reminder', reminder)):
    with open(os.path.join(OUT, name + '.json'), 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    print('%s.json  %d bytes' % (name, os.path.getsize(os.path.join(OUT, name + '.json'))))
