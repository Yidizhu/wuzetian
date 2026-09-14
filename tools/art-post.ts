/**
 * AI 生成图的后处理（E11，D-095）。零依赖：像素活全在无头 Chrome 的 canvas 里做，webp 也由它编码。
 *
 *   npm run art:post -- portrait wuze_default [--v 2] [--eye 312] [--src 文件]   立绘：抠底 → 同一把尺子 → 全身 + 膝上
 *                                                                        原件取 assets/portraits/<asset>_v<N>.png，不给 --v 取最新一版
 *   npm run art:post -- scene zhaoyang_gold [--v 1] [--src 文件]         背景：缩到长边 1920（不放大）→ webp；原件 assets/scenes/<key>_v<N>.png
 *   npm run art:post -- cg adi_1_buxiu [--v 1]                            事件图（E19）：同背景，原件 assets/cg/<key>_v<N>.png → public/cg/<key>.webp
 *   npm run art:post -- lineup                                           已出的全身立绘脚底对齐排一排（门槛 5：身材有没有差别）
 *   npm run art:post -- faces <图>:<cx>,<cy>,<h> …                         门槛 3②：几张脸缩到同样大、椭圆遮掉头发冠帽衣领并排——遮着名字认得出谁是谁（E18，D-136）
 *                                                                        cx,cy 是脸中心（原件像素），h 是发际到下巴的高
 *   npm run art:post -- silhouette <图…> [--h 120]                         门槛 1：抠底涂黑、缩到 120px 高并排——剪影不像唐代、认不出是谁，细节再好也打回（D-103）
 *                                                                        图可以是生成的 png（白/灰底）、public 下的 webp、或旧 SVG（拿来比）
 *   以上都可加 `--out <目录>`：产物不写 public/ 而写到那里（试跑用）
 *
 * 读：`assets/portraits/<asset>_v<N>.png`（名字见 src/char/portraits.ts）、`assets/scenes/<key>_v<N>.png`（原件，生成原样，不改）。
 * 写：`public/char/full/<file>.webp`、`public/char/knee/<file>.webp`、`public/scene/<key>.webp`；
 *     另出一张给人看的检查图到 `Claude outputs/art-post/`（不进版本库）。
 * 规格与理由见 art-style `references/raster-pipeline.md`。
 *
 * **机器只做机械的事，只报数，不判「像不像唐朝」。** art-style 那七道门槛是人看的（剪影那一道机器出图、人来指）。
 * 机器报的几件都是生成端的常见坏法、而且后处理救不回来的：背景不是纯色、人出画、要放大才够尺寸。
 * 另外量一样人眼判了三版都没判准的：头顶透光——眼睛行以上挖成透明的孔各多大（E14，门槛 1a）。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { CANVAS, EYE_RATIO, PORTRAITS } from "../src/char/portraits.ts";
import { launch } from "./cdp.ts";

const ROOT = join(import.meta.dirname, "..");

/**
 * 底色规格（D-149，E20）。底色是为了抠得干净：**底色和衣服主色越近，抠底越会把衣服一起抠掉。**
 * - 穿绿的人（沈衡深绿、唐简浅绿，将来任何主色落在绿里的）**一律不许绿底**——绿幕抠绿衣会把人抠没
 * - 两层检查，都是报错不是警告：
 *   ① 清单（portraits.ts）写的 bg 就犯规 → 任何命令都不跑
 *   ② 原件量出来的底色和这一套的主色相近 → 这一张不出图
 * 「相近」两条满足一条就算：逐通道最大差 < 48（E18 实测：灰青、月白一类落在中灰上就是这个距离）；
 * 或者两者都有颜色（饱和度 > 0.18）且色相差 < 40°（绿底配绿衣）
 */
const rgbOf = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function hueSat([r, g, b]: number[]): [number, number] {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!mx || !d) return [0, 0];
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return [h, d / mx];
}
const BG_RGB = { white: [254, 254, 254], gray: [128, 128, 128], green: [0, 177, 64] } as const;
export function bgClash(bg: number[], robeHex: string): string | null {
  const robe = rgbOf(robeHex);
  const maxDiff = Math.max(...bg.map((v, i) => Math.abs(v - robe[i]!)));
  if (maxDiff < 48) return `底色和主色逐通道最多只差 ${maxDiff}`;
  const [h1, s1] = hueSat(bg), [h2, s2] = hueSat(robe);
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  if (s1 > 0.18 && s2 > 0.18 && dh < 40) return `底色和主色是同一个色相（差 ${Math.round(dh)}°）`;
  return null;
}
{
  const bad = PORTRAITS.filter((p) => bgClash([...BG_RGB[p.bg]], p.hex)).map((p) => `${p.file}（${p.robe} ${p.hex} 配 ${p.bg} 底：${bgClash([...BG_RGB[p.bg]], p.hex)}）`);
  if (bad.length) {
    console.error("✗ 底色规格（D-149）：src/char/portraits.ts 里这几套的底色和主色相近，抠底会把衣服抠掉——");
    for (const b of bad) console.error(`  ${b}`);
    process.exit(1);
  }
}

const CHECK = join(ROOT, "Claude outputs", "art-post");

const argv = process.argv.slice(2);
const [cmd, key] = argv;
const opt = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

/** 抠底的两个阈值：离背景色（逐通道最大差）≤ IN 算背景；IN 到 OUT 之间是半透明的边 */
const TOL_IN = 24;
const TOL_OUT = 90;
/** 被身体围住的背景色空洞（帔帛和手臂之间那种），大于这个面积才挖掉；小的多半是衣服上的高光 */
const HOLE_MIN = 800;
/**
 * 小空洞（E13）：双鬟望仙髻的环心只有几百像素，按上面那条挖不掉，抠完两个白点留在头顶（B17 手机截图）。
 * 小的也挖，但要**几乎就是底色**：八成以上的像素离底色 ≤ 10。白中单领口、衣服高光有明暗，过不了这一条
 */
const HOLE_SMALL = 120;
const HOLE_STRICT = 10;
/**
 * 「环里透光」的尺寸线（原件像素）。
 * E14 先按推算定 45×60；E15 用实物校了一次：v2–v4 宽 16–20 的是缝，120px 剪影里看不出孔；
 * v5 宽 32–33、高 60–61，120px 剪影里两个孔清清楚楚。线划在两者之间：宽 ≥ 28、高 ≥ 50。
 * **这条线是看过 v5 之后改的**，写在 art-cc3-e15.md 里交 Cowork 判，不是悄悄放行
 */
const RING_W = 28;
const RING_H = 50;
const WEBP_Q = 0.82;
/** 产物根目录。默认 public/；试跑时 `--out 别处`，免得测试图进了构建 */
const PUB = opt("out") ? join(ROOT, opt("out")!) : join(ROOT, "public");
const SCENE_LONG = 1920;

function usage(): never {
  console.error("用法：art:post -- portrait <file> [--eye 行] [--src png] | scene <key> [--src png] | cg <key> | lineup | faces <图>:<cx>,<cy>,<h>… | silhouette <图…> [--h 120]");
  process.exit(1);
}

const dataUrl = (p: string) => `data:image/png;base64,${readFileSync(p).toString("base64")}`;
const save = (p: string, url: string) => {
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, Buffer.from(url.slice(url.indexOf(",") + 1), "base64"));
  return Math.round(readFileSync(p).length / 1024);
};

/** 页面里用的工具函数，一次注入 */
const PAGE_LIB = `
window.loadImg = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('图读不出来')); i.src = src; });
window.canvasOf = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/** 抠底。返回带透明的 canvas 和几个数 */
window.cutout = (img, IN, OUT, HOLE_MIN, HOLE_SMALL = 1e9, HOLE_STRICT = 0, GREEN = false) => {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = canvasOf(w, h), g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const im = g.getImageData(0, 0, w, h), d = im.data;
  // 背景色：外圈两像素的中位数
  const ring = [];
  for (let x = 0; x < w; x++) for (const y of [0, 1, h - 2, h - 1]) ring.push((y * w + x) * 4);
  for (let y = 2; y < h - 2; y++) for (const x of [0, 1, w - 2, w - 1]) ring.push((y * w + x) * 4);
  const med = (k) => { const a = ring.map((o) => d[o + k]).sort((p, q) => p - q); return a[a.length >> 1]; };
  const bg = [med(0), med(1), med(2)];
  const dist = (o) => Math.max(Math.abs(d[o] - bg[0]), Math.abs(d[o + 1] - bg[1]), Math.abs(d[o + 2] - bg[2]));
  const ringOk = ring.filter((o) => dist(o) <= IN).length / ring.length;
  // 从外圈灌水
  const BG = 1, HOLE = 2;
  const m = new Uint8Array(w * h);
  const near = new Uint8Array(w * h);
  // 绿幕（E22）：按底色规格，绿幕底的人身上没有绿（D-149），所以「明显偏绿」的像素一律当底——
  // 被身体围住的小块绿幕带着阴影和溢色，离中位绿不够近，按距离判会留下一块块绿（温荞发髻边、许静和簿子和手臂之间）
  const greenish = (o) => d[o + 1] - Math.max(d[o], d[o + 2]) > 50;
  for (let i = 0; i < w * h; i++) near[i] = (dist(i * 4) <= IN || (GREEN && greenish(i * 4))) ? 1 : 0;
  const fill = (seeds, mark) => {
    const st = [...seeds]; let n = 0;
    while (st.length) {
      const i = st.pop();
      if (m[i] || !near[i]) continue;
      m[i] = mark; n++;
      const x = i % w;
      if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1);
      if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w);
    }
    return n;
  };
  fill(ring.map((o) => o / 4), BG);
  // 围住的空洞：够大的才挖
  let holes = 0, holeArea = 0;
  const holeList = [];
  for (let i = 0; i < w * h; i++) {
    if (m[i] || !near[i]) continue;
    // 先量面积（标 3），够大再改标 BG
    const st = [i]; const pix = [];
    while (st.length) {
      const j = st.pop();
      if (m[j] || !near[j]) continue;
      m[j] = 3; pix.push(j);
      const x = j % w;
      if (x > 0) st.push(j - 1); if (x < w - 1) st.push(j + 1);
      if (j >= w) st.push(j - w); if (j < w * (h - 1)) st.push(j + w);
    }
    const pure = (GREEN && pix.length >= 30) || (pix.length >= HOLE_SMALL && pix.filter((j) => dist(j * 4) <= HOLE_STRICT).length >= pix.length * 0.8);
    if (pix.length >= HOLE_MIN || pure) {
      holes++; holeArea += pix.length;
      let hx0 = w, hy0 = h, hx1 = 0, hy1 = 0;
      for (const j of pix) { m[j] = HOLE; const x = j % w, y = (j / w) | 0; if (x < hx0) hx0 = x; if (x > hx1) hx1 = x; if (y < hy0) hy0 = y; if (y > hy1) hy1 = y; }
      holeList.push({ x0: hx0, y0: hy0, x1: hx1, y1: hy1, area: pix.length });
    }
  }
  // 透明度：背景 0；紧挨背景的两圈按离背景色的远近给半透明，并把混进来的背景色减掉
  const edge = new Uint8Array(w * h);
  const isBg = (i) => m[i] === BG || m[i] === HOLE;
  for (let pass = 0; pass < 2; pass++) {
    const prev = edge.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (isBg(i) || prev[i]) continue;
      const nb = [i - 1, i + 1, i - w, i + w];
      if (nb.some((j) => (pass === 0 ? isBg(j) : prev[j]))) edge[i] = 1;
    }
  }
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (isBg(i)) { d[o + 3] = 0; continue; }
    if (edge[i]) {
      const a = Math.min(1, Math.max(0, (dist(o) - IN) / (OUT - IN)));
      if (a < 1 && a > 0) for (let k = 0; k < 3; k++) d[o + k] = Math.min(255, Math.max(0, Math.round((d[o + k] - (1 - a) * bg[k]) / a)));
      d[o + 3] = Math.round(a * 255);
    }
    if (d[o + 3] > 127) { const x = i % w, y = (i / w) | 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  // 去绿溢色（E22）：绿光反到衣服边上，留在人身上的像素绿通道不许高过红蓝里大的那个——绿幕底的人身上本来没有绿（D-149）
  if (GREEN) for (let i = 0; i < w * h; i++) {
    const o = i * 4; if (d[o + 3] === 0) continue;
    const cap = Math.max(d[o], d[o + 2]); if (d[o + 1] > cap) d[o + 1] = cap;
  }
  // 险边（E17，许静和那套要看）：留在人身上、离底色只差 IN 到 2×IN 的像素占多少。
  // 浅色衣服的暗面、灰色的布最容易落在这一档：再暗一点就被当成底抠掉了
  let fgN = 0, risky = 0;
  for (let i = 0; i < w * h; i++) {
    if (isBg(i) || d[i * 4 + 3] < 128) continue;
    fgN++;
    const dd = dist(i * 4);
    if (dd > IN && dd <= IN * 2) risky++;
  }
  g.putImageData(im, 0, 0);
  return { c, w, h, bg, ringOk, holes, holeArea, holeList, risky: fgN ? risky / fgN : 0, box: { minX, minY, maxX, maxY } };
};

/** 从眼睛那一行到脚底之间、按不透明度加权的横向重心。帔帛、剑、袖子会把外框拉偏，重心不会 */
window.centroidX = (c, y0, y1) => {
  const g = c.getContext('2d', { willReadFrequently: true });
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let s = 0, n = 0;
  for (let y = Math.max(0, y0); y <= Math.min(c.height - 1, y1); y += 2) for (let x = 0; x < c.width; x += 2) {
    const a = d[(y * c.width + x) * 4 + 3]; s += a * x; n += a;
  }
  return n ? s / n : c.width / 2;
};
`;

async function portrait(file: string) {
  const entry = PORTRAITS.find((p) => p.file === file);
  if (!entry) { console.error(`${file} 不在 src/char/portraits.ts 的清单里`); process.exit(1); }
  if (entry.derivedFrom) console.log(`注意：${file} 规定从 ${entry.derivedFrom} 修出来，不另生成。这里只做抠底与缩放`);
  const dir = join(ROOT, "assets", "portraits");
  const versions = existsSync(dir) ? readdirSync(dir)
    .map((f) => (f.startsWith(`${entry.asset}_v`) ? f.slice(entry.asset.length).match(/^_v(\d+)\.png$/) : null)).filter(Boolean).map((m) => Number(m![1])).sort((a, b) => a - b) : [];
  const v = opt("v") ?? String(versions.at(-1) ?? "");
  const src = opt("src") ?? join(dir, `${entry.asset}_v${v}.png`);
  if (!existsSync(src)) { console.error(`没有原件：${src}`); process.exit(1); }
  const eyeArg = opt("eye");
  const b = await launch();
  try {
    await b.cdp.evaluate(PAGE_LIB);
    const r = await b.cdp.evaluate<{
      w: number; h: number; bg: number[]; ringOk: number; holes: number; holeArea: number;
      holeList: { x0: number; y0: number; x1: number; y1: number; area: number }[]; risky: number;
      box: { minX: number; minY: number; maxX: number; maxY: number };
      scale: number; stature: number; eyeUsed: boolean; clipX: boolean;
      full: string; knee: string; check: string;
    }>(`(async () => {
      const C = ${JSON.stringify(CANVAS)}, H = ${entry.height}, EYE = ${EYE_RATIO};
      const img = await loadImg(${JSON.stringify(dataUrl(src))});
      const k = cutout(img, ${TOL_IN}, ${TOL_OUT}, ${HOLE_MIN}, ${HOLE_SMALL}, ${HOLE_STRICT}, ${entry.bg === "green"});
      const feet = k.box.maxY;
      const eyeArg = ${eyeArg === undefined ? "null" : Number(eyeArg)};
      // 身高：给了眼睛那一行就用眼睛推（不受发髻冠子影响），没给就用外框
      const stature = eyeArg !== null ? (feet - eyeArg) / EYE : (feet - k.box.minY);
      const scale = C.stature * H / stature;
      const cx = centroidX(k.c, eyeArg !== null ? eyeArg : k.box.minY, feet);
      const full = canvasOf(C.width, C.height), fg = full.getContext('2d');
      fg.imageSmoothingQuality = 'high';
      const dx = C.width / 2 - cx * scale, dy = C.feetY - feet * scale;
      fg.drawImage(k.c, dx, dy, k.w * scale, k.h * scale);
      const clipX = (k.box.minX * scale + dx) < 0 || (k.box.maxX * scale + dx) > C.width || (k.box.minY * scale + dy) < 0;
      const knee = canvasOf(C.width, C.kneeCropY);
      knee.getContext('2d').drawImage(full, 0, 0);

      // 检查图：① 原件 + 每八分之一画面高一道线（脸从头顶到下巴要跨满一格）② 纸底 ③ 墨底 ④ 品红底（看白边）⑤ 膝上裁切
      const S = 0.36, pw = Math.round(C.width * S), ph = Math.round(C.height * S), gap = 12;
      const chk = canvasOf(pw * 5 + gap * 6, ph + gap * 2 + 22), cg = chk.getContext('2d');
      cg.fillStyle = '#ffffff'; cg.fillRect(0, 0, chk.width, chk.height);
      cg.font = '14px sans-serif'; cg.fillStyle = '#333';
      const cols = ['原件 · 八分之一格', '纸底', '墨底', '品红底（白边）', '膝上裁切'];
      cols.forEach((t, i) => cg.fillText(t, gap + i * (pw + gap), 16));
      const top = 22 + gap;
      cg.drawImage(img, gap, top, img.naturalWidth * pw / img.naturalWidth, img.naturalHeight * pw / img.naturalWidth);
      cg.strokeStyle = 'rgba(220,0,120,0.7)'; cg.lineWidth = 1;
      const oh = img.naturalHeight * pw / img.naturalWidth;
      for (let i = 1; i < 8; i++) { const y = top + oh * i / 8; cg.beginPath(); cg.moveTo(gap, y); cg.lineTo(gap + pw, y); cg.stroke(); }
      ['#EDE7DA', '#1A1815', '#FF00C8'].forEach((bgc, i) => {
        const x = gap + (i + 1) * (pw + gap);
        cg.fillStyle = bgc; cg.fillRect(x, top, pw, ph);
        cg.drawImage(full, x, top, pw, ph);
        cg.strokeStyle = 'rgba(0,160,255,0.9)';
        for (const [yy, dash] of [[C.feetY, []], [C.kneeCropY, [6, 4]], [C.feetY - C.stature * H * EYE, [2, 3]]]) {
          cg.setLineDash(dash); cg.beginPath(); cg.moveTo(x, top + yy * S); cg.lineTo(x + pw, top + yy * S); cg.stroke();
        }
        cg.setLineDash([]);
      });
      const kx = gap + 4 * (pw + gap);
      cg.fillStyle = '#EDE7DA'; cg.fillRect(kx, top, pw, C.kneeCropY * S);
      cg.drawImage(knee, kx, top, pw, C.kneeCropY * S);

      return { w: k.w, h: k.h, bg: k.bg, ringOk: k.ringOk, holes: k.holes, holeArea: k.holeArea, holeList: k.holeList, risky: k.risky, box: k.box,
        scale, stature, eyeUsed: eyeArg !== null, clipX,
        full: full.toDataURL('image/webp', ${WEBP_Q}), knee: knee.toDataURL('image/webp', ${WEBP_Q}),
        check: chk.toDataURL('image/png') };
    })()`);

    const clash = bgClash(r.bg, entry.hex);
    if (clash) {
      console.error(`✗ ${file}：原件底色 ${"#" + r.bg.map((v) => v.toString(16).padStart(2, "0")).join("")} 和主色 ${entry.robe} ${entry.hex} 相近（${clash}）——底色规格 D-149，这一张不出图。换底色重生成`);
      process.exit(1);
    }
    const kbFull = save(join(PUB, "char", "full", `${file}.webp`), r.full);
    const kbKnee = save(join(PUB, "char", "knee", `${file}.webp`), r.knee);
    save(join(CHECK, `${file}-check.png`), r.check);

    const warn: string[] = [];
    const hex = "#" + r.bg.map((v) => v.toString(16).padStart(2, "0")).join("");
    if (r.w !== 1024 || r.h !== 1536) warn.push(`原件是 ${r.w}×${r.h}，规格是 1024×1536`);
    if (r.ringOk < 0.95) warn.push(`背景不是纯色：外圈只有 ${(r.ringOk * 100).toFixed(0)}% 接近底色 ${hex}（渐变底、暗角、地面、投影）——退回重生成`);
    if (entry.bg === "gray" && Math.min(...r.bg) > 200) warn.push(`这一套规定中灰底，原件是白底 ${hex}：浅色衣服的边会被一起抠掉，看检查图的墨底那一格`);
    if (entry.bg === "green" && !(r.bg[1] > r.bg[0] + 60 && r.bg[1] > r.bg[2] + 60)) warn.push(`这一套规定绿幕底，原件底色是 ${hex}，不是绿：浅色衣服会被一起抠掉（E18 许静和 v1 就是这么坏的）`);
    if (entry.bg === "green") warn.push("绿幕底：看品红底那一格的衣服边有没有一圈发绿（绿光反到衣服上，抠底只减得掉最外两圈）");
    if (r.box.minY <= 2) warn.push("头顶出画");
    else if (r.box.minY < r.h * 0.02) warn.push(`发髻顶离上边只有 ${r.box.minY} 像素：再高一点的髻或冠就出画了，提示词要求头顶留出画面高 3% 以上`);
    if (r.box.maxY >= r.h - 3) warn.push("脚出画（或者脚下有地面／投影连到了底边）");
    if (r.box.minX <= 2 || r.box.maxX >= r.w - 3) warn.push("侧边出画（帔帛、袖、剑被裁）");
    if (r.scale > 1.05) warn.push(`要放大 ${r.scale.toFixed(2)} 倍才够尺寸，会糊：人在原件里画得太小——多半脸也不够大，按「脸糊了」否决`);
    if (r.clipX) warn.push("缩放后有一部分出了 1024×1536 画布（太宽，或者给的眼睛那一行不对）");
    if (!r.eyeUsed) warn.push("没给 --eye：身高按外框算，高髻、高冠、幞头硬脚会把人缩矮。验收时读出眼睛所在的行补上");
    if (r.holes) console.log(`挖掉了 ${r.holes} 个被围住的底色空洞，共 ${r.holeArea} 像素——看检查图，衣服上的浅色块有没有被当成空洞挖掉`);
    // 头顶透光（E14）：眼睛那一行以上挖掉的空洞，就是髻、冠上透得见背景的孔。
    // 双鬟望仙髻连三版画成实心，这一条单列成门槛（SKILL.md 门槛 1 的「环里透光」）：两个孔，每个宽 ≥ 45、高 ≥ 60 像素（原件尺寸）
    const eyeRow = eyeArg !== undefined ? Number(eyeArg) : r.box.minY + (r.box.maxY - r.box.minY) * 0.1;
    const top = r.holeList.filter((q) => q.y1 < eyeRow).sort((a, b) => a.x0 - b.x0);
    const big = top.filter((q) => q.x1 - q.x0 + 1 >= RING_W && q.y1 - q.y0 + 1 >= RING_H);
    // 身上的空洞（E17）：眼睛行以下挖掉的。两臂和身体之间那种是对的；衣服暗面被当成底挖掉的是错的——看检查图品红底那一格逐个认
    const body = r.holeList.filter((q) => q.y1 >= eyeRow).sort((a, b) => b.area - a.area);
    if (body.length) console.log(`  身上的空洞 ${body.length} 个（最大几个：${body.slice(0, 4).map((q) => `${q.area}px @${q.x0},${q.y0}`).join("、")}）——品红底那一格逐个认：该透的是臂弯、帔帛和身体之间，衣服上不许有洞`);
    // E17 定过「超过 3% 报警」。E18 拿到两张真样本：阿荻 22.2% 抠得干净，许静和 12.8% 抠坏了——这个数分不开好坏，降为诊断参考（D-129）。
    // 判好坏看检查图的墨底和品红底
    console.log(`  险边（诊断参考，不判）：人身上离底色只差 ${TOL_IN + 1}–${TOL_IN * 2} 的像素占 ${(r.risky * 100).toFixed(1)}%——判抠没抠坏看墨底那一格的衣服边`);
    console.log(`  头顶透光：眼睛行以上 ${top.length} 个孔` + (top.length ? `（${top.map((q) => `${q.x1 - q.x0 + 1}×${q.y1 - q.y0 + 1}`).join("、")}）` : "") +
      `，够大的（宽 ≥ ${RING_W}、高 ≥ ${RING_H}）${big.length} 个`);

    console.log(`${file}：底色 ${hex}，外框 ${r.box.minX},${r.box.minY}—${r.box.maxX},${r.box.maxY}，身高 ${r.stature.toFixed(0)} 像素 → ×${r.scale.toFixed(3)}（${entry.height}）`);
    console.log(`  char/full/${file}.webp ${kbFull} KB · char/knee/${file}.webp ${kbKnee} KB（在 ${PUB} 下）`);
    console.log(`  检查图 Claude outputs/art-post/${file}-check.png`);
    for (const w of warn) console.log(`  ⚠ ${w}`);
  } finally { await b.dispose(); }
}

/**
 * 背景与事件图（CG，E19）走同一套：只缩不放、出 webp、检查图画手机竖屏看得见的三条。
 * CG 原件在 assets/cg/，产物在 public/cg/。CG 默认竖构图（D-150），手机上铺满裁掉的是两侧；
 * 横的 CG 按 src/scene/cgs.ts 的 focus 裁（E22 起），检查图的品红框画在焦点那一条上——脸和手必须在框里
 */
async function scene(k: string, kind: "scene" | "cg" = "scene") {
  const sdir = join(ROOT, "assets", kind === "cg" ? "cg" : "scenes");
  const sv = opt("v") ?? String((existsSync(sdir) ? readdirSync(sdir)
    .map((f) => (f.startsWith(`${k}_v`) ? f.slice(k.length).match(/^_v(\d+)\.png$/) : null)).filter(Boolean).map((m) => Number(m![1])) : [])
    .sort((a, b) => a - b).at(-1) ?? "");
  const src = opt("src") ?? join(sdir, `${k}_v${sv}.png`);
  if (!existsSync(src)) { console.error(`没有原件：${src}`); process.exit(1); }
  // 焦点（CC1 的 cgs.ts，横 CG 必填）：引擎是 background-position: x% —— 看得见的那一条左边 = x% ×（图宽 − 条宽）
  const focusX = kind === "cg" ? ((await import("../src/scene/cgs.ts")).CGS[k]?.focus?.x ?? null) : null;
  const b = await launch();
  try {
    await b.cdp.evaluate(PAGE_LIB);
    const r = await b.cdp.evaluate<{ w: number; h: number; ow: number; oh: number; out: string; check: string }>(`(async () => {
      const img = await loadImg(${JSON.stringify(dataUrl(src))});
      const w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, ${SCENE_LONG} / Math.max(w, h));
      const ow = Math.round(w * s), oh = Math.round(h * s);
      const c = canvasOf(ow, oh), g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, ow, oh);
      // 检查图：手机竖屏（390×844）铺满时看得见的那一条，左、中、右三个位置——整图轻推平移的范围；
      // 下面 22% 是对话框，人站的地方在它上面
      const S = 900 / ow, cw = 900, ch = Math.round(oh * S);
      const chk = canvasOf(cw, ch), cg = chk.getContext('2d');
      cg.drawImage(c, 0, 0, cw, ch);
      const vw = ch * 390 / 844;
      const fx = ${focusX === null ? 50 : focusX} / 100;
      (${kind === "cg"} ? [[Math.max(0, cw - vw) * fx, '#FF00C8']] : [[0, '#00A0FF'], [(cw - vw) / 2, '#FF00C8'], [cw - vw, '#00A0FF']]).forEach(([x, col]) => {
        cg.strokeStyle = col; cg.lineWidth = 3; cg.strokeRect(x + 1.5, 1.5, vw - 3, ch - 3);
      });
      cg.fillStyle = 'rgba(26,24,21,0.45)'; cg.fillRect(0, ch * 0.78, cw, ch * 0.22);
      return { w, h, ow, oh, out: c.toDataURL('image/webp', ${WEBP_Q}), check: chk.toDataURL('image/png') };
    })()`);
    const kb = save(join(PUB, kind, `${k}.webp`), r.out);
    save(join(CHECK, `${k}-check.png`), r.check);
    console.log(`${k}：原件 ${r.w}×${r.h} → ${r.ow}×${r.oh}，${kind}/${k}.webp ${kb} KB（在 ${PUB} 下）`);
    if (kind === "cg") {
      console.log(`  检查图 Claude outputs/art-post/${k}-check.png（品红框是手机竖屏铺满时看得见的范围${r.w > r.h ? `，按焦点 x=${focusX ?? "未填→居中"}` : ""}；暗条是对话框）`);
      console.log("  CG：两张脸和所有看得见的手，都要落在品红框里，而且不压在暗条下");
      if (Math.max(r.w, r.h) < 1536) console.log(`  ⚠ 长边不到 1536，没有放大，手机上会软`);
      if (r.w > r.h && focusX === null) console.log(`  ⚠ 横构图但 src/scene/cgs.ts 没写 focus：check:art 会拦（D-150）。看检查图定 x，填进表里再跑一次`);
      return;
    }
    console.log(`  检查图 Claude outputs/art-post/${k}-check.png（三道竖框是手机竖屏看得见的范围；暗条是对话框）`);
    if (Math.max(r.w, r.h) < 1536) console.log(`  ⚠ 长边不到 1536，没有放大，手机上会软`);
    if (r.h > r.w) console.log(`  ⚠ 竖构图。背景规格是横构图（手机上靠平移看全）`);
    else if (Math.abs(r.w / r.h - 16 / 9) > 0.12) console.log(`  ⚠ 比例 ${(r.w / r.h).toFixed(2)}，规格 16:9（1.78）。3:2 的原件引擎按 cover 铺也行，但上下会多裁`);
  } finally { await b.dispose(); }
}

async function lineup() {
  const dir = join(PUB, "char", "full");
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".webp")).sort() : [];
  if (!files.length) { console.error("public/char/full/ 里还没有图"); process.exit(1); }
  const b = await launch();
  try {
    await b.cdp.evaluate(PAGE_LIB);
    const urls = files.map((f) => `data:image/webp;base64,${readFileSync(join(dir, f)).toString("base64")}`);
    const png = await b.cdp.evaluate<string>(`(async () => {
      const C = ${JSON.stringify(CANVAS)}, names = ${JSON.stringify(files.map((f) => basename(f, ".webp")))};
      const imgs = await Promise.all(${JSON.stringify(urls)}.map(loadImg));
      // 相邻两人重叠一半：并排站着才看得出谁高谁矮、谁宽
      const S = 0.3, step = Math.round(C.width * S * 0.5), w = step * (imgs.length + 1), h = Math.round(C.height * S) + 30;
      const c = canvasOf(w, h), g = c.getContext('2d');
      g.fillStyle = '#EDE7DA'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(0,120,200,0.6)';
      for (const yy of [C.feetY, C.kneeCropY, C.feetY - C.stature]) { g.beginPath(); g.moveTo(0, yy * S); g.lineTo(w, yy * S); g.stroke(); }
      imgs.forEach((im, i) => g.drawImage(im, i * step, 0, C.width * S, C.height * S));
      g.font = '11px sans-serif'; g.fillStyle = '#333';
      names.forEach((n, i) => g.fillText(n.replace('_default', ''), i * step + C.width * S * 0.25, h - 8));
      return c.toDataURL('image/png');
    })()`);
    save(join(CHECK, "lineup.png"), png);
    console.log(`${files.length} 张 → Claude outputs/art-post/lineup.png（三道线：脚底、膝上裁切、主角头顶）`);
  } finally { await b.dispose(); }
}

async function silhouette(files: string[]) {
  if (!files.length) usage();
  const H = Number(opt("h") ?? 120);
  const mime = (f: string) => f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".webp") ? "image/webp" : "image/png";
  const items = files.map((f) => ({ name: basename(f).replace(/\.(png|webp|svg)$/, ""),
    url: `data:${mime(f)};base64,${readFileSync(f).toString("base64")}` }));
  const b = await launch();
  try {
    await b.cdp.evaluate(PAGE_LIB);
    const png = await b.cdp.evaluate<string>(`(async () => {
      const H = ${H}, items = ${JSON.stringify(items)};
      const sil = [];
      for (const it of items) {
        const img = await loadImg(it.url);
        const w = img.naturalWidth || 1024, h = img.naturalHeight || 1536;
        const probe = canvasOf(w, h), pg = probe.getContext('2d', { willReadFrequently: true });
        pg.drawImage(img, 0, 0, w, h);
        // 四角透明就直接用透明度（SVG、抠过的 webp），否则先抠底
        const corner = pg.getImageData(0, 0, 1, 1).data[3];
        const src = corner < 10 ? probe : cutout(img, ${TOL_IN}, ${TOL_OUT}, ${HOLE_MIN}, ${HOLE_SMALL}, ${HOLE_STRICT}).c;
        const d = src.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
        let x0 = w, y0 = h, x1 = -1, y1 = -1;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 127) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        const s = H / (y1 - y0 + 1), sw = Math.ceil((x1 - x0 + 1) * s);
        const c = canvasOf(sw, H), g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(src, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, sw, H);
        g.globalCompositeOperation = 'source-in'; g.fillStyle = '#111'; g.fillRect(0, 0, sw, H);
        sil.push({ c, name: it.name });
      }
      // 上排：真 120px（就是手机上那么大）；下排：同一张像素放大三倍，给人看清楚轮廓——不是更高清的剪影
      const gap = 28, Z = 3, top = 20;
      const W = sil.reduce((a, s) => a + Math.max(s.c.width * Z, 90) + gap, gap);
      const out = canvasOf(W, top + H + gap + H * Z + 40), og = out.getContext('2d');
      og.fillStyle = '#EDE7DA'; og.fillRect(0, 0, out.width, out.height);
      og.font = '12px sans-serif'; og.fillStyle = '#555';
      og.fillText('上：实际 ' + H + 'px 高　下：同一张放大 ' + Z + ' 倍', gap, 14);
      let x = gap;
      for (const s of sil) {
        const cw = Math.max(s.c.width * Z, 90);
        og.drawImage(s.c, x + (cw - s.c.width) / 2, top);
        og.imageSmoothingEnabled = false;
        og.drawImage(s.c, x + (cw - s.c.width * Z) / 2, top + H + gap, s.c.width * Z, H * Z);
        og.imageSmoothingEnabled = true;
        og.fillStyle = '#333'; og.fillText(s.name.slice(0, 22), x, out.height - 12);
        x += cw + gap;
      }
      return out.toDataURL('image/png');
    })()`);
    save(join(CHECK, "silhouette.png"), png);
    console.log(`${items.length} 个剪影 → Claude outputs/art-post/silhouette.png`);
  } finally { await b.dispose(); }
}

async function faces(specs: string[]) {
  if (!specs.length) usage();
  const items = specs.map((sp) => {
    const i = sp.lastIndexOf(":");
    const f = sp.slice(0, i);
    const [cx, cy, h] = sp.slice(i + 1).split(",").map(Number);
    if (!existsSync(f) || [cx, cy, h].some((n) => !Number.isFinite(n))) { console.error(`看不懂：${sp}`); process.exit(1); }
    const mime = f.endsWith(".webp") ? "image/webp" : "image/png";
    return { name: basename(f).replace(/_default.*$/, "").replace(/\.(png|webp)$/, ""), url: `data:${mime};base64,${readFileSync(f).toString("base64")}`, cx, cy, h };
  });
  const b = await launch();
  try {
    await b.cdp.evaluate(PAGE_LIB);
    const png = await b.cdp.evaluate<string>(`(async () => {
      const it = ${JSON.stringify(items)}, S = 240;
      const c = canvasOf(S * it.length, S + 24), g = c.getContext('2d');
      g.fillStyle = '#777'; g.fillRect(0, 0, c.width, c.height);
      for (let k = 0; k < it.length; k++) {
        const q = it[k], img = await loadImg(q.url), side = q.h * 1.75;
        g.save(); g.beginPath(); g.ellipse(k * S + S / 2, S * 0.5, S * 0.24, S * 0.33, 0, 0, 7); g.clip();
        g.drawImage(img, q.cx - side / 2, q.cy - side / 2, side, side, k * S, 0, S, S); g.restore();
        g.fillStyle = '#fff'; g.font = '13px sans-serif'; g.fillText(q.name, k * S + 8, S + 17);
      }
      return c.toDataURL('image/png');
    })()`);
    save(join(CHECK, "faces.png"), png);
    console.log(`${items.length} 张脸 → Claude outputs/art-post/faces.png（遮着名字看：认得出谁是谁吗）`);
  } finally { await b.dispose(); }
}

if (cmd === "faces") await faces(argv.slice(1).filter((a, i, arr) => !a.startsWith("--") && !(arr[i - 1] ?? "").startsWith("--")));
else if (cmd === "silhouette") await silhouette(argv.slice(1).filter((a, i, arr) => !a.startsWith("--") && !(arr[i - 1] ?? "").startsWith("--")));
else if (cmd === "portrait" && key) await portrait(key);
else if (cmd === "scene" && key) await scene(key);
else if (cmd === "cg" && key) await scene(key, "cg");
else if (cmd === "lineup") await lineup();
else usage();
