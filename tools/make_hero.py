"""照片去背 → 合成到深色科技背景，輸出 Flex 第一張卡的主圖 img/hero.jpg（4:5）。
用法：python tools/make_hero.py <照片路徑>
"""
import random
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove

W, H = 960, 1200
ROOT = Path(__file__).resolve().parent.parent


def background():
    bg = Image.new("RGB", (W, H), (5, 11, 26))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse((W * 0.05, H * 0.05, W * 0.95, H * 0.75), fill=(30, 90, 220))
    d.ellipse((W * 0.2, H * 0.55, W * 1.1, H * 1.25), fill=(90, 50, 200))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    bg = Image.blend(bg, glow, 0.55)

    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(grid)
    for x in range(0, W, 48):
        g.line((x, 0, x, H), fill=(79, 216, 255, 16))
    for y in range(0, H, 48):
        g.line((0, y, W, y), fill=(79, 216, 255, 16))
    rnd = random.Random(7)
    for _ in range(140):
        x, y, r = rnd.randrange(W), rnd.randrange(H), rnd.choice([1, 1, 2])
        g.ellipse((x - r, y - r, x + r, y + r), fill=(140, 225, 255, rnd.randrange(60, 200)))
    # HUD 角框
    c, L = (79, 216, 255, 170), 56
    for (x, y, sx, sy) in [(28, 28, 1, 1), (W - 28, 28, -1, 1), (28, H - 28, 1, -1), (W - 28, H - 28, -1, -1)]:
        g.line((x, y, x + sx * L, y), fill=c, width=3)
        g.line((x, y, x, y + sy * L), fill=c, width=3)
    return Image.alpha_composite(bg.convert("RGBA"), grid)


def main(src):
    photo = Image.open(src).convert("RGB")
    cut = remove(photo, session=new_session("isnet-general-use"))
    bbox = cut.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox()
    top = max(0, bbox[1] - 20)
    person = cut.crop((0, top, cut.width, cut.height))

    scale = (H - 130) / person.height
    person = person.resize((round(person.width * scale), round(person.height * scale)), Image.LANCZOS)
    x, y = (W - person.width) // 2, H - person.height

    canvas = background()
    # 人物外圍青色光暈（rim glow）
    a = person.getchannel("A")
    rim = Image.new("RGBA", person.size, (79, 216, 255, 0))
    rim.putalpha(a.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: v * 0.7))
    canvas.alpha_composite(rim, (x, y))
    canvas.alpha_composite(person, (x, y))

    out = ROOT / "img" / "hero.jpg"
    canvas.convert("RGB").save(out, quality=86, optimize=True, progressive=True)
    cut.save(ROOT / "img" / "cutout.png")
    print(out, canvas.size)


if __name__ == "__main__":
    main(sys.argv[1])
