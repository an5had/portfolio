# -*- coding: utf-8 -*-
"""Rasterise the red an5had mark (public/favicon.svg) into PNG/ICO favicons and the
1200x630 social share thumbnail (public/og.png). Run from app/: python tools/generate_favicon.py"""
from PIL import Image, ImageDraw

RED = (255, 0, 0, 255)
WHITE = (255, 255, 255, 255)
OG_BG = (10, 10, 11, 255)

# favicon.svg geometry (viewBox 262 x 261, rx 60) — every glyph piece is a straight-edged polygon
VB_W, VB_H, VB_R = 262, 261, 60
PIECES = [
    [(103.711, 54), (138.605, 54), (80.8947, 207), (46, 207)],
    [(91.6318, 147.947), (91.6318, 113.053), (199, 113.053), (199, 147.947)],
    [(108.632, 207), (121.784, 172.105), (199, 172.105), (199, 207)],
    [(199, 207), (163.211, 207), (163.211, 113.053), (199, 113.053)],
    [(166.342, 54), (153.18, 88.8945), (139.053, 88.8945), (139.053, 54)],
]
SS = 8  # supersample for smooth edges


def mark(n):
    """The rounded red tile with the white glyph, n x n px, transparent corners."""
    N = n * SS
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    sx, sy = N / VB_W, N / VB_H
    d.rounded_rectangle([0, 0, N - 1, N - 1], radius=VB_R * sx, fill=RED)
    for poly in PIECES:
        d.polygon([(x * sx, y * sy) for x, y in poly], fill=WHITE)
    return img.resize((n, n), Image.LANCZOS)


def og(w=1200, h=630, size=260):
    img = Image.new('RGBA', (w, h), OG_BG)
    tile = mark(size)
    img.alpha_composite(tile, ((w - size) // 2, (h - size) // 2))
    return img.convert('RGB')


mark(180).save('public/apple-touch-icon.png')
mark(32).save('public/favicon-32.png')
mark(16).save('public/favicon-16.png')
mark(256).save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
og().save('public/og.png', optimize=True)
print('Wrote favicons + og.png to public/')
