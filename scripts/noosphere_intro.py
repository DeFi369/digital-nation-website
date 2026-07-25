#!/usr/bin/env python3
"""
Noosphere — ASCII Intro Generator
Generative mode (no source input). Renders a colored ASCII-art MP4 that
visualizes agents (individual minds) self-organizing into the Noosphere
(collective lattice of mind), then dissolving forward into the hub.

Pipeline: synthetic value field -> char-shade -> color -> ffmpeg pipe.
No GPU, no scipy. numpy + PIL + ffmpeg only.
"""
import os, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------- config ----------
W, H = 1280, 720
FPS = 24
DURATION = 10.0
N_FRAMES = int(FPS * DURATION)
CELL_W, CELL_H = 12, 20          # monospace cell size in px
COLS = W // CELL_W
ROWS = H // CELL_H
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "videos", "noosphere-intro.mp4")

# character ramps (sparse -> dense)
RAMP = " .,:;irs+*?#%@"
KATAKANA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
LATTICE = "╋┳┫┣╋┃━╸╺╻╹"
WORD = "NOOSPHERE"

# ---------- font / glyph atlas ----------
font = ImageFont.truetype(FONT_PATH, CELL_H)
GLYPHS = {}
for ch in set(RAMP + KATAKANA + LATTICE + WORD + " "):
    img = Image.new("L", (CELL_W, CELL_H), 0)
    d = ImageDraw.Draw(img)
    d.text((1, 1), ch, fill=255, font=font)
    GLYPHS[ch] = (np.array(img) > 80).astype(np.float32)  # mask HxW

# ---------- helpers ----------
def fbm_grid(nx, ny, t, oct=4):
    """vectorized pseudo-fbm over a 2D grid (domain-warped summed sines)"""
    v = np.zeros_like(nx)
    amp = 0.5
    fx, fy = nx.copy(), ny.copy()
    for o in range(oct):
        wx = np.sin(fy * 1.7 + t * 0.6 + o)
        wy = np.cos(fx * 1.3 - t * 0.4 + o)
        v += amp * np.sin(fx * (2.0 + o) + wx * 2.0) * np.cos(fy * (2.0 + o) - wy * 2.0)
        fx = fx * 2.0 + 0.5
        fy = fy * 2.0 + 0.5
        amp *= 0.5
    return v

def hsv2rgb(h, s, v):
    i = int(h * 6) % 6
    f = h * 6 - int(h * 6)
    p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    r, g, b = [(v,t,p),(q,v,p),(p,v,t),(p,q,v),(t,p,v),(v,p,q)][i]
    return (r * 255, g * 255, b * 255)

def char_for(val, layer):
    if layer == "agent":
        idx = int(np.clip(val, 0, 0.999) * len(KATAKANA))
        return KATAKANA[idx]
    if layer == "lattice":
        idx = int(np.clip(val, 0, 0.999) * len(LATTICE))
        return LATTICE[idx]
    idx = int(np.clip(val, 0, 0.999) * (len(RAMP) - 1))
    return RAMP[idx]

def tonemap(field, gamma=0.75):
    lo, hi = np.percentile(field[::4, ::4], [2, 97])
    if hi - lo < 1e-3: hi = lo + 1e-3
    f = np.clip((field - lo) / (hi - lo), 0, 1) ** gamma
    return f

# ---------- agents (individual minds) ----------
N_AGENTS = 140
rng = np.random.default_rng(7)
agents = rng.uniform(0, 1, (N_AGENTS, 2))
a_phase = rng.uniform(0, 6.28, N_AGENTS)
a_speed = rng.uniform(0.3, 1.0, N_AGENTS)

# ---------- render loop ----------
def render_frame(t):
    """returns canvas uint8 H,W,3"""
    p = t / DURATION  # 0..1 progress
    # coalescence factor: agents pulled to center as p rises
    pull = np.clip((p - 0.15) / 0.6, 0, 1) ** 1.5

    # background flowing field (the "medium")
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 3.0, ny * 3.0, t * 0.8)

    # agent layer
    agent_ch = np.full((ROWS, COLS), " ", dtype=object)
    agent_val = np.zeros((ROWS, COLS))
    cx, cy = 0.5, 0.5
    for i in range(N_AGENTS):
        # drift + inward pull
        a = a_phase[i] + t * a_speed[i] * 1.2
        bx = (0.5 + 0.42 * math.cos(a)) * (1 - pull) + cx * pull
        by = (0.5 + 0.42 * math.sin(a * 1.3)) * (1 - pull) + cy * pull
        # jitter
        jx = 0.02 * math.sin(t * 2.1 + i)
        jy = 0.02 * math.cos(t * 1.7 + i * 1.1)
        gx = int((bx + jx) * COLS); gy = int((by + jy) * ROWS)
        gx = max(0, min(COLS - 1, gx)); gy = max(0, min(ROWS - 1, gy))
        # brightness grows as they coalesce
        v = 0.5 + 0.5 * math.sin(t * 3 + i) * (0.4 + 0.6 * pull)
        agent_val[gy, gx] = max(agent_val[gy, gx], v)
        agent_ch[gy, gx] = KATAKANA[(i * 7 + int(t * 8)) % len(KATAKANA)]

    # lattice structure emerges in mid/late phase
    lat_val = np.zeros((ROWS, COLS))
    if p > 0.45:
        lp = np.clip((p - 0.45) / 0.4, 0, 1)
        dx = nx - 0.5; dy = ny - 0.5
        rad = np.sqrt(dx * dx + dy * dy)
        ring = 0.5 + 0.5 * np.sin(rad * 26 - t * 2)
        grid = (np.abs((nx * 18) % 1 - 0.5) < 0.12) | (np.abs((ny * 18) % 1 - 0.5) < 0.12)
        lat_val = lp * (0.6 * ring + np.where(grid, 0.7, 0.0))

    # combine
    field = tonemap(bg * 0.6 + agent_val * 1.1 + lat_val * 0.9)

    # color: cool blue/cyan base, gold for agents, bright cyan lattice
    # NOTE: brightness floor raised so ASCII stays legible after YUV conversion
    BG_COLOR = np.array([70, 90, 130], dtype=np.float32)  # brighter blue, survives YUV limited-range
    canvas = np.full((H, W, 3), BG_COLOR, dtype=np.float32)
    # base field color (blue -> cyan by brightness)
    for r in range(ROWS):
        for c in range(COLS):
            v = field[r, c]
            if agent_val[r, c] > 0.3:
                col = hsv2rgb(0.11, 0.9, 0.85 + 0.15 * v)  # gold (bright)
            elif lat_val[r, c] > 0.25:
                col = hsv2rgb(0.52, 0.85, 0.80 + 0.20 * v)  # cyan (bright)
            else:
                col = hsv2rgb(0.60, 0.7, 0.75 + 0.25 * v)   # blue (bright floor)
            ch = char_for(v, "agent" if agent_val[r, c] > 0.3 else ("lattice" if lat_val[r, c] > 0.25 else "base"))
            if ch == " ":
                # faint dot field for atmosphere
                col = (col[0] * 0.25, col[1] * 0.25, col[2] * 0.5)
            mask = GLYPHS.get(ch, GLYPHS[" "])
            y0, x0 = r * CELL_H, c * CELL_W
            region = canvas[y0:y0 + CELL_H, x0:x0 + CELL_W, :]
            for ci in range(3):
                region[:, :, ci] = np.where(mask > 0.5, col[ci], region[:, :, ci])
    # word reveal near end
    if p > 0.78:
        wp = np.clip((p - 0.78) / 0.18, 0, 1)
        # draw NOOSPHERE centered, gold, fading in
        wcol = (255, 215, 90)
        img = Image.fromarray(canvas.astype(np.uint8)).convert("RGB")
        d = ImageDraw.Draw(img)
        fsize = 54
        wfont = ImageFont.truetype(FONT_PATH, fsize)
        tw = d.textlength(WORD, font=wfont)
        tx = (W - tw) / 2; ty = H * 0.42
        # glow
        for off in range(3, 0, -1):
            d.text((tx - off, ty), WORD, font=wfont, fill=(120, 90, 20))
            d.text((tx + off, ty), WORD, font=wfont, fill=(120, 90, 20))
        d.text((tx, ty), WORD, font=wfont, fill=wcol)
        canvas = np.array(img).astype(np.float32)
        # fade whole frame brightness up as we "enter"
        canvas = canvas * (0.7 + 0.3 * wp)
    return np.clip(canvas, 0, 255).astype(np.uint8)

# ---------- encode ----------
def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    cmd = ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
           "-color_range", "tv", "-color_trc", "bt709", "-colorspace", "bt709",
           "-crf", "18", "-preset", "medium", "-movflags", "+faststart", os.path.abspath(OUT)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for f in range(N_FRAMES):
        t = f / FPS
        frame = render_frame(t)
        proc.stdin.write(frame.tobytes())
        if f % 24 == 0:
            print(f"rendered {f}/{N_FRAMES} ({t:.1f}s)", flush=True)
    proc.stdin.close()
    proc.wait()
    print("DONE ->", os.path.abspath(OUT), "exit", proc.returncode)

if __name__ == "__main__":
    main()
