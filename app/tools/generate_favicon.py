# -*- coding: utf-8 -*-
"""Generate PNG/ICO favicons (camera-lens mark) from the same design as favicon.svg."""
from PIL import Image, ImageDraw

BG = (14, 14, 18, 255)
WHITE = (244, 244, 242, 255)
GLASS = (21, 22, 28, 255)
ACCENT = (255, 86, 48, 255)


def draw(n):
    s = 4  # supersample for smooth edges
    N = n * s
    img = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, N - 1, N - 1], radius=int(0.22 * N), fill=BG)
    cx = cy = N / 2
    # outer lens ring
    R = 0.297 * N
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=WHITE, width=max(1, int(0.053 * N)))
    # glass element
    g = 0.164 * N
    d.ellipse([cx - g, cy - g, cx + g, cy + g], fill=GLASS, outline=WHITE, width=max(1, int(0.022 * N)))
    # accent coating reflection
    a = 0.047 * N
    ax, ay = cx - 0.165 * N, cy - 0.165 * N
    d.ellipse([ax - a, ay - a, ax + a, ay + a], fill=ACCENT)
    return img.resize((n, n), Image.LANCZOS)


draw(180).save('public/apple-touch-icon.png')
draw(32).save('public/favicon-32.png')
draw(16).save('public/favicon-16.png')
draw(64).save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('Wrote favicons to public/')
