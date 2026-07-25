#!/usr/bin/env python3
"""
Portal Video Generator — produces themed ASCII-art MP4 clips for each hub portal.
Each clip is 4 seconds, 1280x720, 24fps, matching the main intro's aesthetic.

Usage:
  python3 portal_videos.py              # generate all 8
  python3 portal_videos.py --portal lattice  # generate one
"""
import os, math, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------- config ----------
W, H = 1280, 720
FPS = 24
DURATION = 4.0
N_FRAMES = int(FPS * DURATION)
CELL_W, CELL_H = 12, 20
COLS = W // CELL_W
ROWS = H // CELL_H
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "videos", "portals")

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
    GLYPHS[ch] = (np.array(img) > 80).astype(np.float32)

# ---------- helpers ----------
def fbm_grid(nx, ny, t, oct=4):
    v = np.zeros_like(nx)
    amp = 0.5
    fx, fy = nx.copy(), ny.copy()
    for o in range(oct):
        wx = np.sin(fy * 1.7 + t * 0.6 + o)
        wy = np.cos(fx * 1.3 - t * 0.4 + o)
        v += amp * np.sin(fx * (2.0 + o) + wx * 2.0) * np.cos(fy * (2.0 + o) - wy * 2.0)
        fx = fx * 2.0 + 0.5; fy = fy * 2.0 + 0.5; amp *= 0.5
    return v

def hsv2rgb(h, s, v):
    i = int(h * 6) % 6
    f = h * 6 - int(h * 6)
    p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    r, g, b = [(v,t,p),(q,v,p),(p,v,t),(p,q,v),(t,p,v),(v,p,q)][i]
    return (r * 255, g * 255, b * 255)

def char_for(val, layer):
    if layer == "agent":
        return KATAKANA[int(np.clip(val, 0, 0.999) * len(KATAKANA))]
    if layer == "lattice":
        return LATTICE[int(np.clip(val, 0, 0.999) * len(LATTICE))]
    return RAMP[int(np.clip(val, 0, 0.999) * (len(RAMP) - 1))]

def tonemap(field, gamma=0.75):
    lo, hi = np.percentile(field[::4, ::4], [2, 97])
    if hi - lo < 1e-3: hi = lo + 1e-3
    return np.clip((field - lo) / (hi - lo), 0, 1) ** gamma

def render_canvas(field, agent_val, lat_val, bg_color=(0.55, 0.65, 0.85)):
    """Render field + agents + lattice to a canvas. Returns uint8 H,W,3."""
    bg255 = tuple(int(c * 255) for c in bg_color)  # brighter blue, survives YUV limited-range
    canvas = np.full((H, W, 3), bg255, dtype=np.float32)
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    for r in range(ROWS):
        for c in range(COLS):
            v = field[r, c]
            if agent_val[r, c] > 0.3:
                col = hsv2rgb(0.11, 0.9, 0.75 + 0.25 * v)  # gold
            elif lat_val[r, c] > 0.25:
                col = hsv2rgb(0.52, 0.85, 0.65 + 0.35 * v)  # cyan
            else:
                col = hsv2rgb(0.60, 0.7, 0.55 + 0.30 * v)  # blue
            ch = char_for(v, "agent" if agent_val[r, c] > 0.3 else ("lattice" if lat_val[r, c] > 0.25 else "base"))
            if ch == " ":
                col = (col[0] * 0.25, col[1] * 0.25, col[2] * 0.5)
            mask = GLYPHS.get(ch, GLYPHS[" "])
            y0, x0 = r * CELL_H, c * CELL_W
            region = canvas[y0:y0 + CELL_H, x0:x0 + CELL_W, :]
            for ci in range(3):
                region[:, :, ci] = np.where(mask > 0.5, col[ci], region[:, :, ci])
            if ch == " ":
                region[:, :] = region[:, :] * 0.0 + np.array([int(bg_color[0]*255), int(bg_color[1]*255), int(bg_color[2]*255)], dtype=np.float32)
    return canvas

# ---------- portal scene functions ----------
# Each returns (canvas uint8 H,W,3)

def scene_lattice(t):
    """Quantum Lattice: neural pulse — particles converge into a lattice"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 3.0, ny * 3.0, t * 0.8)
    # particles spiral inward
    agent_val = np.zeros((ROWS, COLS))
    n = 80
    for i in range(n):
        a = i * 0.314 + t * 1.5
        r = 0.4 * (1 - p * 0.7)
        bx = 0.5 + r * math.cos(a); by = 0.5 + r * math.sin(a)
        gx = int(bx * COLS); gy = int(by * ROWS)
        if 0 <= gx < COLS and 0 <= gy < ROWS:
            v = 0.7 + 0.3 * math.sin(t * 4 + i)
            agent_val[gy, gx] = max(agent_val[gy, gx], v)
    # lattice emerges
    lat_val = np.zeros((ROWS, COLS))
    if p > 0.3:
        lp = np.clip((p - 0.3) / 0.5, 0, 1)
        dx = nx - 0.5; dy = ny - 0.5
        rad = np.sqrt(dx * dx + dy * dy)
        ring = 0.5 + 0.5 * np.sin(rad * 26 - t * 2)
        grid = (np.abs((nx * 18) % 1 - 0.5) < 0.12) | (np.abs((ny * 18) % 1 - 0.5) < 0.12)
        lat_val = lp * (0.6 * ring + np.where(grid, 0.7, 0.0))
    field = tonemap(bg * 0.6 + agent_val * 1.1 + lat_val * 0.9)
    canvas = render_canvas(field, agent_val, lat_val)
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_trading(t):
    """Trading Desk: candlestick chart drawing upward"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.0, ny * 2.0, t * 0.5)
    agent_val = np.zeros((ROWS, COLS))
    # candlesticks rising from bottom
    n_sticks = 12
    for i in range(n_sticks):
        x = int((i + 0.5) / n_sticks * COLS)
        height = int(p * (ROWS * 0.6))
        wick = int(height * (0.7 + 0.3 * math.sin(t * 3 + i)))
        body_h = int(wick * 0.4)
        for y in range(ROWS - 1, ROWS - 1 - wick, -1):
            if 0 <= y < ROWS and 0 <= x < COLS:
                v = 0.8 - (ROWS - 1 - y) / wick * 0.4
                agent_val[y, x] = max(agent_val[y, x], v)
        # body
        body_top = ROWS - 1 - body_h
        for y in range(body_top, ROWS - 1, 1):
            if 0 <= y < ROWS and 0 <= x < COLS:
                agent_val[y, x] = max(agent_val[y, x], 0.9)
    field = tonemap(bg * 0.6 + agent_val * 1.1)
    canvas = render_canvas(field, agent_val, np.zeros((ROWS, COLS)))
    # green tint for trading
    canvas = canvas.astype(np.float32)
    canvas[:, :, 1] = np.minimum(255, canvas[:, :, 1] * 1.1)  # boost green
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_governance(t):
    """Governance: institutional grid with seal-stamp pulse"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.0, ny * 2.0, t * 0.3)
    lat_val = np.zeros((ROWS, COLS))
    # grid lines
    grid = (np.abs((nx * 12) % 1 - 0.5) < 0.08) | (np.abs((ny * 8) % 1 - 0.5) < 0.08)
    lp = p * 0.8
    lat_val = lp * np.where(grid, 0.8, 0.0)
    # seal stamp in center
    dx = nx - 0.5; dy = ny - 0.5
    rad = np.sqrt(dx * dx + dy * dy)
    stamp = (rad < 0.15 * (0.5 + 0.5 * math.sin(t * 5))) * 0.9
    lat_val = np.maximum(lat_val, stamp)
    field = tonemap(bg * 0.4 + lat_val * 1.2)
    canvas = render_canvas(field, np.zeros((ROWS, COLS)), lat_val)
    # purple tint for governance
    canvas = canvas.astype(np.float32)
    canvas[:, :, 0] = np.minimum(255, canvas[:, :, 0] * 0.8)  # reduce red
    canvas[:, :, 2] = np.minimum(255, canvas[:, :, 2] * 1.2)  # boost blue
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_roadmap(t):
    """Roadmap: path drawing across terrain"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 3.0, ny * 3.0, t * 0.4)
    agent_val = np.zeros((ROWS, COLS))
    # winding path
    path_len = int(p * COLS * 0.8)
    for x in range(path_len):
        y = int(ROWS * 0.5 + ROWS * 0.15 * math.sin(x * 0.1 + t * 2))
        if 0 <= y < ROWS:
            for dy in range(-1, 2):
                yy_pos = y + dy
                if 0 <= yy_pos < ROWS:
                    agent_val[yy_pos, x] = 0.9
    # milestones
    for m in range(1, 6):
        mx = int(m * COLS * 0.15)
        if mx < path_len:
            my = int(ROWS * 0.5 + ROWS * 0.15 * math.sin(mx * 0.1 + t * 2))
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    if 0 <= my+dy < ROWS and 0 <= mx+dx < COLS:
                        agent_val[my+dy, mx+dx] = 0.95
    field = tonemap(bg * 0.5 + agent_val * 1.0)
    canvas = render_canvas(field, agent_val, np.zeros((ROWS, COLS)))
    # gold tint for roadmap
    canvas = canvas.astype(np.float32)
    canvas[:, :, 0] = np.minimum(255, canvas[:, :, 0] * 1.1)
    canvas[:, :, 1] = np.minimum(255, canvas[:, :, 1] * 0.9)
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_mcp(t):
    """HL MCP: chain-link cascade"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.5, ny * 2.5, t * 0.6)
    lat_val = np.zeros((ROWS, COLS))
    # chain links forming
    n_links = 10
    for i in range(n_links):
        cx = (i + 0.5) / n_links
        cy = 0.3 + 0.4 * math.sin(t * 2 + i)
        link_p = np.clip((p - i * 0.08) / 0.5, 0, 1)
        if link_p > 0.1:
            dx = nx - cx; dy = ny - cy
            rad = np.sqrt(dx * dx + dy * dy)
            link = (rad < 0.06 * link_p) * 0.9
            lat_val = np.maximum(lat_val, link)
    # connecting lines
    for i in range(n_links - 1):
        if p > i * 0.08:
            x1 = (i + 0.5) / n_links; x2 = (i + 1.5) / n_links
            y1 = 0.3 + 0.4 * math.sin(t * 2 + i); y2 = 0.3 + 0.4 * math.sin(t * 2 + i + 1)
            for x in np.linspace(x1, x2, 20):
                y = y1 + (y2 - y1) * (x - x1) / (x2 - x1) if x2 != x1 else y1
                gx = int(x * COLS); gy = int(y * ROWS)
                if 0 <= gx < COLS and 0 <= gy < ROWS:
                    lat_val[gy, gx] = max(lat_val[gy, gx], 0.7)
    field = tonemap(bg * 0.5 + lat_val * 1.0)
    canvas = render_canvas(field, np.zeros((ROWS, COLS)), lat_val)
    # cyan tint for MCP
    canvas = canvas.astype(np.float32)
    canvas[:, :, 2] = np.minimum(255, canvas[:, :, 2] * 1.1)
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_archive(t):
    """Archive: scroll unfurling"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.0, ny * 2.0, t * 0.3)
    agent_val = np.zeros((ROWS, COLS))
    # scroll unfurling from center
    unfold = p * 0.5
    for r in range(ROWS):
        for c in range(COLS):
            if abs(ny[r, c] - 0.5) < unfold:
                v = 0.6 + 0.3 * math.sin(c * 0.3 + t * 2)
                agent_val[r, c] = max(agent_val[r, c], v)
    field = tonemap(bg * 0.4 + agent_val * 1.0)
    canvas = render_canvas(field, agent_val, np.zeros((ROWS, COLS)))
    # warm tint for archive
    canvas = canvas.astype(np.float32)
    canvas[:, :, 0] = np.minimum(255, canvas[:, :, 0] * 1.1)
    canvas[:, :, 2] = np.minimum(255, canvas[:, :, 2] * 0.8)
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_structure(t):
    """Structure: blueprint grid build"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.0, ny * 2.0, t * 0.4)
    lat_val = np.zeros((ROWS, COLS))
    # grid expanding from center
    grid = (np.abs((nx * 16) % 1 - 0.5) < 0.06) | (np.abs((ny * 12) % 1 - 0.5) < 0.06)
    build_radius = p * 0.5
    dx = nx - 0.5; dy = ny - 0.5
    rad = np.sqrt(dx * dx + dy * dy)
    lat_val = np.where(rad < build_radius, grid * 0.8, 0.0)
    field = tonemap(bg * 0.5 + lat_val * 1.0)
    canvas = render_canvas(field, np.zeros((ROWS, COLS)), lat_val)
    # blue tint for structure
    canvas = canvas.astype(np.float32)
    canvas[:, :, 2] = np.minimum(255, canvas[:, :, 2] * 1.1)
    return np.clip(canvas, 0, 255).astype(np.uint8)

def scene_ecosystem(t):
    """Ecosystem: orbit expansion"""
    p = t / DURATION
    yy, xx = np.mgrid[0:ROWS, 0:COLS]
    nx = xx / COLS; ny = yy / ROWS
    bg = fbm_grid(nx * 2.5, ny * 2.5, t * 0.5)
    agent_val = np.zeros((ROWS, COLS))
    # nodes orbiting
    n_nodes = 8
    for i in range(n_nodes):
        angle = i * 0.785 + t * 1.5
        r = 0.2 + 0.25 * p
        bx = 0.5 + r * math.cos(angle); by = 0.5 + r * math.sin(angle)
        gx = int(bx * COLS); gy = int(by * ROWS)
        if 0 <= gx < COLS and 0 <= gy < ROWS:
            agent_val[gy, gx] = 0.9
            # trail
            for trail in range(5):
                ta = angle - 0.2 * trail
                tx = 0.5 + (r - 0.03 * trail) * math.cos(ta)
                ty = 0.5 + (r - 0.03 * trail) * math.sin(ta)
                txg = int(tx * COLS); tyg = int(ty * ROWS)
                if 0 <= txg < COLS and 0 <= tyg < ROWS:
                    agent_val[tyg, txg] = max(agent_val[tyg, txg], 0.6 - 0.1 * trail)
    field = tonemap(bg * 0.6 + agent_val * 1.0)
    canvas = render_canvas(field, agent_val, np.zeros((ROWS, COLS)))
    # green tint for ecosystem
    canvas = canvas.astype(np.float32)
    canvas[:, :, 1] = np.minimum(255, canvas[:, :, 1] * 1.1)
    return np.clip(canvas, 0, 255).astype(np.uint8)

SCENES = {
    "lattice":   scene_lattice,
    "trading":   scene_trading,
    "governance": scene_governance,
    "roadmap":   scene_roadmap,
    "mcp":       scene_mcp,
    "archive":   scene_archive,
    "structure": scene_structure,
    "ecosystem": scene_ecosystem,
}

def render_portal(name, scene_fn):
    out = os.path.join(OUT_DIR, f"{name}.mp4")
    os.makedirs(OUT_DIR, exist_ok=True)
    cmd = ["ffmpeg", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
           "-color_range", "tv", "-color_trc", "bt709", "-colorspace", "bt709",
           "-crf", "18", "-preset", "medium", "-movflags", "+faststart", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for f in range(N_FRAMES):
        t = f / FPS
        frame = scene_fn(t)
        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    proc.wait()
    print(f"  {name}: {os.path.getsize(out)//1024}KB")

if __name__ == "__main__":
    import sys
    os.makedirs(OUT_DIR, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == "--portal":
        name = sys.argv[2]
        if name in SCENES:
            render_portal(name, SCENES[name])
        else:
            print(f"Unknown portal: {name}. Available: {list(SCENES.keys())}")
    else:
        print("Generating all 8 portal videos...")
        for name, fn in SCENES.items():
            render_portal(name, fn)
        print("Done!")
