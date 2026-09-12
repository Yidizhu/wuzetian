/**
 * 生成 10 个角色 × 3 表情的 SVG 剪影立绘。第二版，按 R-005 返工。
 *
 *   node --experimental-strip-types tools/gen-char.ts
 *
 * R-005 要的四样：
 *   1. 边缘用带笔锋的贝塞尔，起笔收笔变细，不再是直线；
 *   2. 唐代剪影：齐胸襦裙的高腰外张、披帛两条长曲线、袖口外翻的弧；
 *   3. 重心偏移：一侧胯高一侧肩低，十个人各不相同；
 *   4. 发髻用真实唐代样式：高髻、双环望仙髻、堕马髻、幞头、黄冠、束发、高冠、双丫髻。
 *
 * 为什么参数化而不是手画：三十张要彼此分得开又像一个人画的，只有同一套笔法换参数做得到。
 * P2 换 3D 人物时引擎只认文件名，零改动。
 *
 * 规格见 art-style/references/character.md：1024 × 1536，底部 22% 被对话框遮住，
 * 重要信息在 y < 1198。面部无细节。每人一处朱砂点。
 * 颜色写 CSS 变量带默认值：进了页面跟色板走，单独打开也看得见。
 * 朱砂点用 var(--c-accent, var(--c-ink-4, #A8232A))：金碧板没有 --c-accent，自动落到泥金。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./load.ts";

type Tone = "line" | "ink-1" | "ink-2" | "ink-3" | "ink-4";
type Expr = "default" | "guarded" | "open";
type Hair = "shuanghuan" | "gaoji" | "duoma" | "putou" | "shufa" | "huangguan" | "gaoguan" | "shuangya" | "banfan";
type Robe = "ruqun" | "yuanling" | "kai" | "yuyi" | "dapao" | "duanru";
type Prop = "none" | "bi" | "jian" | "zhi" | "zhangben" | "chi" | "shu" | "zhenbao" | "yan" | "gao";
type Accent = "cuff" | "seal" | "tassel" | "paperline" | "hairpin" | "ruler" | "crown" | "belt" | "needle" | "cord";
type Hands = "down" | "front" | "sleeve" | "outR" | "upR" | "belt" | "table" | "backR" | "bend" | "hold" | "offer";

interface Pose {
  /** 肩线倾斜（度）。正值右肩低 */
  shoulder: number;
  /** 胯的偏移（度）。正值右胯高。重心在胯高的那一侧 */
  hip: number;
  /** 头倾斜（度） */
  head: number;
  /** 头前倾（像素） */
  headFwd: number;
  hands: Hands;
  /** 上身前倾（像素） */
  lean: number;
}

interface Char {
  key: string; name: string; tone: Tone; hair: Hair; robe: Robe; peibo: boolean;
  prop: Prop; accent: Accent; height: number; width: number;
  /** 结契者：衣缘上一线紫。规矩见 art-style/references/character.md「一点紫」 */
  jieqi?: boolean;
  /** 这几个表情不画道具。柳承欢的 guarded 是「空手却仍维持托纸姿势」，手势在、纸不在 */
  hidePropOn?: Expr[];
  /** 另出一套无朱砂的 `_bare`。柳承欢归还之后，那根朱绳还给了主角（D-038 第 8 条） */
  bare?: boolean;
  poses: Record<Expr, Pose>; note: string;
}

// -------------------------------------------------------------- 角色表（冻结）

const CHARS: Char[] = [
  { key: "wuze", name: "吾则添", tone: "ink-1", hair: "shuanghuan", robe: "ruqun", peibo: true,
    prop: "none", accent: "cuff", height: 1, width: 1,
    note: "袖口常挽起一折，站着先看桌面。朱砂在挽起的那只袖口滚边",
    poses: {
      default: { shoulder: 3, hip: 5, head: 7, headFwd: 14, hands: "table", lean: 8 },
      guarded: { shoulder: -2, hip: -3, head: 0, headFwd: -4, hands: "sleeve", lean: -2 },
      open:    { shoulder: -6, hip: 7, head: -9, headFwd: 0, hands: "down", lean: -4 },
    } },
  { key: "shenheng", name: "沈衡", tone: "line", hair: "putou", robe: "yuanling", peibo: false,
    prop: "bi", accent: "seal", height: 1.04, width: 0.96,
    note: "持笔位置很低，案边留一小叠草稿。女官着男装。朱砂是腰间那方印",
    poses: {
      default: { shoulder: 0, hip: 2, head: 0, headFwd: 0, hands: "down", lean: 0 },
      guarded: { shoulder: 1, hip: -4, head: -2, headFwd: -8, hands: "backR", lean: -8 },
      open:    { shoulder: -3, hip: 4, head: -4, headFwd: 4, hands: "outR", lean: 3 },
    } },
  { key: "peizhaoye", name: "裴照夜", tone: "ink-2", hair: "shufa", robe: "kai", peibo: false,
    prop: "jian", accent: "tassel", height: 1.07, width: 1.14,
    note: "不持续握剑，先给旁人留通道。朱砂是剑穗",
    poses: {
      default: { shoulder: 0, hip: 6, head: 0, headFwd: 0, hands: "down", lean: 0 },
      guarded: { shoulder: 0, hip: 0, head: 0, headFwd: 0, hands: "down", lean: -3 },
      open:    { shoulder: 4, hip: -3, head: 12, headFwd: 26, hands: "bend", lean: 22 },
    } },
  { key: "wenqiao", name: "温荞", tone: "ink-3", hair: "gaoji", robe: "ruqun", peibo: false,
    prop: "zhi", accent: "paperline", height: 0.97, width: 0.92,
    note: "指间常夹一角样纸，走路略快。没有帔帛，那东西碍事。朱砂是笺上的朱丝栏",
    poses: {
      default: { shoulder: -3, hip: 8, head: 5, headFwd: 18, hands: "outR", lean: 12 },
      guarded: { shoulder: 3, hip: -4, head: 0, headFwd: 0, hands: "sleeve", lean: -3 },
      open:    { shoulder: -6, hip: 5, head: -12, headFwd: -10, hands: "front", lean: -6 },
    } },
  { key: "liqinghe", name: "李令仪", tone: "ink-2", hair: "gaoguan", robe: "dapao", peibo: true,
    prop: "zhangben", accent: "hairpin", height: 1.03, width: 1.08,
    note: "衣饰整肃，俯身看账不顾折痕。清河公主。朱砂是发间那支步摇的簪头",
    poses: {
      default: { shoulder: 0, hip: 3, head: 0, headFwd: 0, hands: "front", lean: 0 },
      guarded: { shoulder: 0, hip: 0, head: 2, headFwd: 0, hands: "front", lean: -5 },
      open:    { shoulder: -4, hip: 6, head: -7, headFwd: 6, hands: "outR", lean: 8 },
    } },
  { key: "songhuizhen", name: "宋蕙贞", tone: "ink-2", hair: "duoma", robe: "ruqun", peibo: true,
    prop: "chi", accent: "ruler", height: 0.99, width: 1.03, jieqi: true,
    note: "袖中小尺是量布的，不是刑罚。堕马髻。朱砂在尺的一端；衣缘一线紫是结契的暗号，比朱砂点还小",
    poses: {
      default: { shoulder: 2, hip: 4, head: 4, headFwd: 6, hands: "down", lean: 3 },
      guarded: { shoulder: 3, hip: -2, head: 0, headFwd: 0, hands: "belt", lean: 0 },
      open:    { shoulder: -5, hip: 5, head: -8, headFwd: 0, hands: "down", lean: -3 },
    } },
  // 第 11 人（D-038）。她不是四条恋爱线之一，是主角差点成为的那种人。
  // 剪影上要一眼看出来的只有一件事：**胸前那一叠稿**，以及 guarded 时纸没了、姿势还在
  { key: "liuchenghuan", name: "柳承欢", tone: "ink-2", hair: "banfan", robe: "ruqun", peibo: false,
    prop: "gao", accent: "cord", height: 1.0, width: 1.06, hidePropOn: ["guarded"], bare: true,
    note: "稿托在胸前、偏向主角那一侧。朱砂是主角暂借的系稿朱绳，在腕上；归还之后收回（_bare）",
    poses: {
      // 先留出通道：身子让开半步，稿偏左递着
      default: { shoulder: 2, hip: -4, head: 6, headFwd: 10, hands: "hold", lean: -6 },
      // 空手，姿势不变。手还端着一份不存在的稿——这一张是她这个人的全部
      guarded: { shoulder: 4, hip: -2, head: 10, headFwd: 4, hands: "hold", lean: -2 },
      // 说完很短的愿望，又等人接
      open:    { shoulder: -3, hip: 3, head: -6, headFwd: 16, hands: "offer", lean: 6 },
    } },
  { key: "hetaihou", name: "何太后", tone: "line", hair: "gaoguan", robe: "dapao", peibo: true,
    prop: "none", accent: "hairpin", height: 1.0, width: 1.18,
    note: "动作少，先把坐具扶稳再落座。最宽的剪影。朱砂在冠上的簪头",
    poses: {
      default: { shoulder: 0, hip: 1, head: 0, headFwd: 0, hands: "table", lean: 0 },
      guarded: { shoulder: 0, hip: 0, head: 0, headFwd: 0, hands: "table", lean: -4 },
      open:    { shoulder: -2, hip: 2, head: -5, headFwd: 0, hands: "down", lean: 0 },
    } },
  { key: "xujinghe", name: "许静和", tone: "ink-4", hair: "huangguan", robe: "yuyi", peibo: false,
    prop: "shu", accent: "crown", height: 1.01, width: 1.04,
    note: "女冠。袖子利于做事，坐得随意。朱砂在黄冠顶那一点",
    poses: {
      default: { shoulder: 1, hip: 7, head: 3, headFwd: 0, hands: "down", lean: 0 },
      guarded: { shoulder: 0, hip: 0, head: 0, headFwd: 0, hands: "down", lean: 0 },
      open:    { shoulder: -4, hip: 5, head: -7, headFwd: 0, hands: "upR", lean: -3 },
    } },
  { key: "tangjian", name: "唐简", tone: "ink-3", hair: "putou", robe: "yuanling", peibo: false,
    prop: "yan", accent: "belt", height: 0.96, width: 0.98,
    note: "一手压纸一手沿行。同是女官着男装，比沈衡矮、方、更实在。朱砂在腰间绦带",
    poses: {
      default: { shoulder: 4, hip: -3, head: 9, headFwd: 20, hands: "table", lean: 14 },
      guarded: { shoulder: 0, hip: 0, head: 0, headFwd: 0, hands: "down", lean: 0 },
      open:    { shoulder: -2, hip: 2, head: -7, headFwd: -8, hands: "table", lean: -2 },
    } },
  { key: "adi", name: "阿荻", tone: "ink-4", hair: "shuangya", robe: "duanru", peibo: false,
    prop: "zhenbao", accent: "needle", height: 0.94, width: 0.9,
    note: "站着习惯换重心，手指灵活。掖庭宫人。朱砂是针包上露出的一截线头",
    poses: {
      default: { shoulder: 5, hip: 10, head: 4, headFwd: 0, hands: "down", lean: 0 },
      guarded: { shoulder: 0, hip: 0, head: 0, headFwd: 0, hands: "belt", lean: 0 },
      open:    { shoulder: -6, hip: 8, head: -14, headFwd: -6, hands: "upR", lean: -5 },
    } },
];

// ------------------------------------------------------------ 笔法

const W = 1024, H = 1536, CX = 512;
const FALLBACK: Record<Tone, string> = {
  line: "#1A1815", "ink-1": "#33302B", "ink-2": "#55524A", "ink-3": "#8C8880", "ink-4": "#C9C4B8",
};
/**
 * 人身上的颜色走 `--c-char-*`，**不是** `--c-ink-*`（E4）。
 *
 * 原来直接绑色板变量，金碧场景里 --c-ink-1 是石青，于是主角整个人被渲染成石青，
 * 和殿柱同色同位，剪影当场糊掉——手机实机才看出来，桌面上因为屏幕大不明显。
 * 规矩：金碧只属于场景与器物，人永远走墨色。
 */
const CHAR_VAR: Record<Tone, string> = {
  line: "--c-char-line", "ink-1": "--c-char-1", "ink-2": "--c-char-2",
  "ink-3": "--c-char-3", "ink-4": "--c-char-4",
};
const v = (t: Tone) => `var(${CHAR_VAR[t]}, ${FALLBACK[t]})`;
const GROUND = "var(--c-ground, #EDE7DA)";
const ACCENT = "var(--c-accent, var(--c-ink-4, #A8232A))";
/** 一点紫（D-035）：结契者的暗号。金碧板里 --c-purple 置为 initial，和朱砂一样回退到泥金 */
const PURPLE = "var(--c-purple, var(--c-ink-4, #6A4470))";

type P = [number, number];
/** 一位小数够了。立绘按视口高度缩放，第二位小数在屏幕上不足百分之一像素，只是体积 */
const f1 = (n: number) => (Math.round(n * 2) / 2).toString();

/** 二次贝塞尔上的点 */
function qpt(a: P, c: P, b: P, t: number): P {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

/**
 * 一笔：沿二次贝塞尔走的带子，宽度从 w0 到 w1，中段略鼓（笔肚），两端收锋。
 * 用多边形而不是描边，这样粗细才能变。这是 R-005 第 1 条的全部实现。
 */
function stroke(a: P, c: P, b: P, w0: number, w1: number, fill: string, extra = ""): string {
  const N = 11;   // 采样点。再密看不出差别，只让每张 SVG 变大
  const left: string[] = [], right: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = qpt(a, c, b, t);
    const [x2, y2] = qpt(a, c, b, Math.min(1, t + 0.01));
    const dx = x2 - x, dy = y2 - y, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    // 笔肚：中段比两端线性插值再鼓 22%，起笔收笔各压到 35%
    const belly = 1 + 0.22 * Math.sin(Math.PI * t);
    const tip = t < 0.08 ? 0.35 + t / 0.08 * 0.65 : t > 0.92 ? 0.35 + (1 - t) / 0.08 * 0.65 : 1;
    const w = (w0 + (w1 - w0) * t) * belly * tip / 2;
    left.push(`${f1(x + nx * w)},${f1(y + ny * w)}`);
    right.push(`${f1(x - nx * w)},${f1(y - ny * w)}`);
  }
  return `<polygon points="${left.join(" ")} ${right.reverse().join(" ")}" fill="${fill}"${extra}/>`;
}

/** 闭合形：一串 (点, 控制点) 用二次贝塞尔连起来。所有轮廓都用它，没有直边 */
function shape(pts: { p: P; c?: P }[], fill: string, extra = ""): string {
  let d = `M${f1(pts[0]!.p[0])},${f1(pts[0]!.p[1])}`;
  for (let i = 1; i <= pts.length; i++) {
    const cur = pts[i % pts.length]!;
    const prev = pts[i - 1]!;
    const c = cur.c ?? [(prev.p[0] + cur.p[0]) / 2, (prev.p[1] + cur.p[1]) / 2];
    d += ` Q${f1(c[0])},${f1(c[1])} ${f1(cur.p[0])},${f1(cur.p[1])}`;
  }
  return `<path d="${d}z" fill="${fill}"${extra}/>`;
}

interface Frame {
  hx: number; hy: number; hr: number;      // 头
  neckY: number;
  shL: P; shR: P;                          // 肩
  chestY: number;                          // 齐胸襦裙的腰线
  hipL: P; hipR: P;                        // 胯
  hemY: number;
  halfW: number;
  pose: Pose; s: number;
  /** 重心侧：+1 右 -1 左 */
  side: number;
}

function frame(c: Char, pose: Pose): Frame {
  const s = c.height;
  const halfW = 116 * c.width;
  const hr = 56;
  const side = pose.hip >= 0 ? 1 : -1;
  const hipTilt = (pose.hip * Math.PI) / 180;
  const shTilt = (pose.shoulder * Math.PI) / 180;
  const hy = 292 + (1 - s) * 380 + pose.headFwd * 0.25;
  const hx = CX + pose.lean + pose.headFwd - side * 4;
  const neckY = hy + hr + 24;
  const shY = neckY + 30;
  const shCx = CX + pose.lean * 0.7;
  const shL: P = [shCx - halfW, shY - Math.sin(shTilt) * halfW];
  const shR: P = [shCx + halfW, shY + Math.sin(shTilt) * halfW];
  const hipY = shY + 300 * s;
  const hw = halfW * 0.62;
  const hipL: P = [CX - hw + side * 12, hipY + Math.sin(hipTilt) * hw];
  const hipR: P = [CX + hw + side * 12, hipY - Math.sin(hipTilt) * hw];
  return { hx, hy, hr, neckY, shL, shR, chestY: shY + 120 * s, hipL, hipR, hemY: 1410, halfW, pose, s, side };
}

// ------------------------------------------------------------ 发髻（唐代样式）

function hair(kind: Hair, f: Frame, fill: string): string {
  const { hx: x, hy: y, hr: r } = f;
  const g = (inner: string) => `<g transform="rotate(${f.pose.head} ${x} ${y})">${inner}</g>`;
  // 发际线：盖住头顶的一层，所有样式共用
  const cap = shape([
    { p: [x - r - 6, y + 4] }, { p: [x - r + 8, y - r + 2], c: [x - r - 10, y - r + 10] },
    { p: [x + r - 8, y - r + 2], c: [x, y - r - 14] }, { p: [x + r + 6, y + 4], c: [x + r + 10, y - r + 10] },
    { p: [x, y + 16], c: [x, y + 22] },
  ], fill);
  switch (kind) {
    case "shuanghuan": {
      // 双环望仙髻：两个宽而扁的环贴着头顶向外倾，中间由发根连成一体。
      // 关键是宽 > 高、根部相接、外倾 —— 高而窄且分开的两团在纯剪影下就是兔耳。
      const ring = (cx: number, cy: number, rot: number) =>
        `<g transform="rotate(${rot} ${cx} ${cy})">` +
        `<ellipse cx="${cx}" cy="${cy}" rx="44" ry="34" fill="${fill}"/>` +
        `<ellipse cx="${cx}" cy="${cy}" rx="19" ry="12" fill="${GROUND}"/></g>`;
      return g(cap +
        // 发根：从头顶托起两环的一整块，两环因此不是浮在空中
        shape([{ p: [x - 52, y - r + 10] }, { p: [x - 40, y - r - 26], c: [x - 58, y - r - 10] },
               { p: [x + 40, y - r - 26], c: [x, y - r - 44] }, { p: [x + 52, y - r + 10], c: [x + 58, y - r - 10] }], fill) +
        ring(x - 40, y - r - 34, -22) + ring(x + 40, y - r - 34, 22));
    }
    case "gaoji": // 高髻：一团向后上方拢起，顶部微翘
      return g(cap +
        shape([{ p: [x - 34, y - r + 6] }, { p: [x - 18, y - r - 74], c: [x - 60, y - r - 40] }, { p: [x + 30, y - r - 66], c: [x + 6, y - r - 108] }, { p: [x + 38, y - r + 6], c: [x + 58, y - r - 30] }], fill));
    case "duoma": // 堕马髻：髻堕向一侧，斜垂在耳后
      return g(cap +
        shape([{ p: [x + 10, y - r + 4] }, { p: [x + 70, y - 10], c: [x + 62, y - r - 40] }, { p: [x + 62, y + 40], c: [x + 90, y + 16] }, { p: [x + 22, y + 24], c: [x + 40, y + 52] }], fill));
    case "putou": // 软脚幞头：方顶略前倾，两条软脚从后颈垂下弯出去
      return g(
        shape([{ p: [x - r - 6, y - 4] }, { p: [x - r + 2, y - 66], c: [x - r - 12, y - 40] }, { p: [x + r - 2, y - 66], c: [x, y - 80] }, { p: [x + r + 6, y - 4], c: [x + r + 12, y - 40] }, { p: [x, y + 12], c: [x, y + 20] }], fill) +
        `<rect x="${x - r - 4}" y="${y - 30}" width="${2 * r + 8}" height="8" fill="${GROUND}" opacity="0.5"/>` +
        stroke([x - r + 4, y - 20], [x - r - 30, y + 30], [x - r - 44, y + 96], 12, 3, fill) +
        stroke([x + r - 4, y - 20], [x + r + 30, y + 30], [x + r + 44, y + 96], 12, 3, fill));
    case "shufa": // 束发：紧束一髻，露出颈线，一根发带垂下
      return g(cap +
        `<ellipse cx="${x}" cy="${y - r - 16}" rx="24" ry="20" fill="${fill}"/>` +
        stroke([x + 8, y - r - 6], [x + 40, y + 20], [x + 30, y + 90], 6, 2, fill));
    case "huangguan": // 黄冠：高髻上一顶小冠，冠脚一线
      return g(cap +
        shape([{ p: [x - 26, y - r + 4] }, { p: [x - 10, y - r - 44], c: [x - 34, y - r - 24] }, { p: [x + 12, y - r - 44], c: [x, y - r - 60] }, { p: [x + 28, y - r + 4], c: [x + 36, y - r - 24] }], fill) +
        shape([{ p: [x - 20, y - r - 40] }, { p: [x - 12, y - r - 78], c: [x - 22, y - r - 60] }, { p: [x + 12, y - r - 78], c: [x, y - r - 84] }, { p: [x + 20, y - r - 40], c: [x + 22, y - r - 60] }], fill) +
        stroke([x - r - 2, y - 6], [x - r - 20, y + 40], [x - r - 14, y + 96], 8, 2, fill));
    case "gaoguan": // 高冠：宽而正，顶有横梁，两侧步摇垂珠
      return g(cap +
        shape([{ p: [x - 44, y - r + 6] }, { p: [x - 40, y - r - 44], c: [x - 50, y - r - 20] }, { p: [x + 40, y - r - 44], c: [x, y - r - 54] }, { p: [x + 44, y - r + 6], c: [x + 50, y - r - 20] }], fill) +
        `<rect x="${x - 60}" y="${y - r - 54}" width="120" height="10" rx="4" fill="${fill}"/>` +
        stroke([x + 58, y - r - 44], [x + 66, y - r], [x + 62, y + 30], 3, 1, fill) +
        stroke([x - 58, y - r - 44], [x - 66, y - r], [x - 62, y + 30], 3, 1, fill) +
        `<circle cx="${x + 62}" cy="${y + 34}" r="4" fill="${fill}"/><circle cx="${x - 62}" cy="${y + 34}" r="4" fill="${fill}"/>`);
    case "banfan": {
      // 单刀半翻髻：一片头发从后往前翻上去，顶是一道斜的直边，像一把刀立在头上。
      // 唐初到盛唐的常见样式，剪影上和高髻（圆）、堕马髻（低垂一侧）分得很开
      // 宽 > 高：一片斜过头顶的扁髻。第一版立得太高太尖，纯剪影下是一支蜡烛
      return g(cap +
        shape([
          { p: [x - 54, y - r + 8] },
          { p: [x - 46, y - r - 22], c: [x - 66, y - r - 4] },
          { p: [x + 58, y - r - 52], c: [x - 6, y - r - 52] },
          { p: [x + 50, y - r - 20], c: [x + 74, y - r - 40] },
          { p: [x + 44, y - r + 8], c: [x + 56, y - r - 8] },
        ], fill));
    }
    case "shuangya": // 双丫髻：两个小髻高高扎在头顶两侧，小
      return g(cap +
        `<circle cx="${x - 30}" cy="${y - r - 18}" r="15" fill="${fill}"/>` +
        `<circle cx="${x + 30}" cy="${y - r - 18}" r="15" fill="${fill}"/>` +
        stroke([x - 30, y - r - 4], [x - 36, y - r - 34], [x - 26, y - r - 48], 5, 2, fill) +
        stroke([x + 30, y - r - 4], [x + 36, y - r - 34], [x + 26, y - r - 48], 5, 2, fill));
  }
}

// ------------------------------------------------------------ 身体

/** 主体轮廓。每种服饰的外张、束腰、下摆各不同，全部贝塞尔 */
function body(c: Char, f: Frame, fill: string): string {
  const [lx, ly] = f.shL, [rx, ry] = f.shR;
  const [hlx, hly] = f.hipL, [hrx, hry] = f.hipR;
  const w = f.halfW, hem = f.hemY, side = f.side;
  const cx = CX + f.pose.lean * 0.4;
  const sway = side * 14;   // 重心侧的下摆更张

  switch (c.robe) {
    case "ruqun": { // 齐胸襦裙：腰线在胸下，腰以下立刻外张，下摆宽，重心侧更宽
      const cy = f.chestY;
      return shape([
        { p: [lx + 6, ly] }, { p: [rx - 6, ry], c: [cx, ly - 22] },
        { p: [cx + w * 0.46, cy], c: [rx - 12, cy - 60] },
        { p: [cx + w * 1.3 + sway, hem], c: [cx + w * 0.7 + sway * 0.5, cy + (hem - cy) * 0.62] },
        { p: [cx - w * 1.3 + sway, hem], c: [cx, hem + 22] },
        { p: [cx - w * 0.46, cy], c: [cx - w * 0.7 + sway * 0.5, cy + (hem - cy) * 0.62] },
        { p: [lx + 6, ly], c: [lx + 12, cy - 60] },
      ], fill) +
      // 腰线：一条淡的横带，说明这是齐胸
      stroke([cx - w * 0.46, cy + 4], [cx, cy + 14], [cx + w * 0.46, cy + 4], 5, 5, GROUND, ' opacity="0.45"');
    }
    case "yuanling": { // 圆领袍：直落，腰有革带，下摆略窄
      return shape([
        { p: [lx + 4, ly] }, { p: [rx - 4, ry], c: [cx, ly - 14] },
        { p: [hrx + 10, hry], c: [rx + 6, (ry + hry) / 2] },
        { p: [cx + w * 0.84 + sway * 0.4, hem], c: [hrx + 26, (hry + hem) / 2] },
        { p: [cx - w * 0.84 + sway * 0.4, hem], c: [cx, hem + 8] },
        { p: [hlx - 10, hly], c: [hlx - 26, (hly + hem) / 2] },
        { p: [lx + 4, ly], c: [lx - 6, (ly + hly) / 2] },
      ], fill) +
      stroke([hlx - 4, hly - 60], [cx, hly - 50], [hrx + 4, hry - 60], 14, 14, GROUND, ' opacity="0.5"');
    }
    case "kai": { // 明光铠：肩宽，胸前两块圆护，腰束，甲裙分三片
      const out = shape([
        { p: [lx - 14, ly + 6] }, { p: [rx + 14, ry + 6], c: [cx, ly - 34] },
        { p: [hrx + 6, hry - 30], c: [rx + 18, (ry + hry) / 2] },
        { p: [hlx - 6, hly - 30], c: [cx, hly - 20] },
        { p: [lx - 14, ly + 6], c: [lx - 18, (ly + hly) / 2] },
      ], fill);
      let skirt = "";
      for (const k of [-1, 0, 1]) {
        const x0 = cx + k * w * 0.62;
        skirt += shape([
          { p: [x0 - w * 0.36, hly - 36] }, { p: [x0 + w * 0.36, hly - 36] },
          { p: [x0 + w * 0.42, hem - 70], c: [x0 + w * 0.46, (hly + hem) / 2] },
          { p: [x0 - w * 0.42, hem - 70], c: [x0, hem - 56] },
        ], fill);
      }
      return out + skirt +
        `<circle cx="${cx - 46}" cy="${ly + 118}" r="32" fill="${GROUND}" opacity="0.45"/>` +
        `<circle cx="${cx + 46}" cy="${ly + 118}" r="32" fill="${GROUND}" opacity="0.45"/>` +
        stroke([hlx - 2, hly - 50], [cx, hly - 40], [hrx + 2, hry - 50], 18, 18, GROUND, ' opacity="0.5"');
    }
    case "yuyi": { // 羽衣：宽袖长褶，下摆最开，线最软，两条内褶
      return shape([
        { p: [lx + 4, ly] }, { p: [rx - 4, ry], c: [cx, ly - 18] },
        { p: [cx + w * 1.34 + sway, hem], c: [cx + w * 1.1, (ry + hem) / 2 + 60] },
        { p: [cx - w * 1.34 + sway, hem], c: [cx, hem + 26] },
        { p: [lx + 4, ly], c: [cx - w * 1.1, (ly + hem) / 2 + 60] },
      ], fill) +
      stroke([cx - w * 0.3, f.chestY + 80], [cx - w * 0.5, (f.chestY + hem) / 2], [cx - w * 0.7 + sway, hem - 10], 3, 8, GROUND, ' opacity="0.35"') +
      stroke([cx + w * 0.25, f.chestY + 120], [cx + w * 0.45, (f.chestY + hem) / 2], [cx + w * 0.62 + sway, hem - 10], 3, 8, GROUND, ' opacity="0.35"');
    }
    case "dapao": { // 大袖礼衣：最宽的剪影，肩平，下摆铺开成一个稳的三角
      return shape([
        { p: [lx - 8, ly] }, { p: [rx + 8, ry], c: [cx, ly - 10] },
        { p: [cx + w * 1.3 + sway * 0.6, hem], c: [rx + w * 0.5, (ry + hem) / 2] },
        { p: [cx - w * 1.3 + sway * 0.6, hem], c: [cx, hem + 16] },
        { p: [lx - 8, ly], c: [lx - w * 0.5, (ly + hem) / 2] },
      ], fill);
    }
    case "duanru": { // 短襦加围裳：腰以下收，围裳到下摆，便于走动
      return shape([
        { p: [lx + 6, ly] }, { p: [rx - 6, ry], c: [cx, ly - 12] },
        { p: [hrx + 4, hry], c: [rx + 4, (ry + hry) / 2] },
        { p: [cx + w * 0.94 + sway, hem], c: [hrx + 10, (hry + hem) / 2] },
        { p: [cx - w * 0.94 + sway, hem], c: [cx, hem + 10] },
        { p: [hlx - 4, hly], c: [hlx - 16, (hly + hem) / 2] },
        { p: [lx + 6, ly], c: [lx - 4, (ly + hly) / 2] },
      ], fill) +
      stroke([hlx + 6, hly + 24], [cx, hly + 34], [hrx - 6, hry + 24], 16, 16, GROUND, ' opacity="0.4"');
    }
  }
}

/** 袖：一笔从肩到手，末端外翻成弧。每种手位一组 */
function arms(c: Char, f: Frame, fill: string): string {
  const [lx, ly] = f.shL, [rx, ry] = f.shR;
  const wide = c.robe === "dapao" || c.robe === "yuyi" ? 1.55 : c.robe === "kai" ? 0.66 : 1;
  const sw = 82 * wide;
  const hipY = (f.hipL[1] + f.hipR[1]) / 2;
  const out: string[] = [];
  /** 袖口外翻：袖尾一个向外鼓的小弧，加一线浅色里子 */
  const cuff = (p: P, dir: number) =>
    shape([{ p: [p[0] - 26, p[1] - 10] }, { p: [p[0] + 26, p[1] - 10] }, { p: [p[0] + 30 * dir, p[1] + 26], c: [p[0] + 44 * dir, p[1] + 8] }, { p: [p[0] - 30 * dir, p[1] + 18], c: [p[0] - 10 * dir, p[1] + 34] }], fill) +
    stroke([p[0] - 18, p[1] + 4], [p[0], p[1] + 12], [p[0] + 18, p[1] + 4], 3, 3, GROUND, ' opacity="0.5"');
  const L = (a: P, ctl: P, b: P, w1 = sw * 0.72) => stroke(a, ctl, b, sw, w1, fill);
  switch (f.pose.hands) {
    case "down":
      out.push(L([lx + 8, ly + 18], [lx - 26, ly + 200], [lx - 18, hipY - 30]), cuff([lx - 18, hipY - 30], -1));
      out.push(L([rx - 8, ry + 18], [rx + 26, ry + 200], [rx + 18, hipY - 30]), cuff([rx + 18, hipY - 30], 1));
      break;
    case "sleeve": // 双手收入袖内：两袖在胸前接成一段，袖口相扣
      out.push(L([lx + 8, ly + 18], [lx + 10, ly + 190], [f.hx + 10, hipY - 150], sw * 0.95));
      out.push(L([rx - 8, ry + 18], [rx - 10, ry + 190], [f.hx - 10, hipY - 150], sw * 0.95));
      break;
    case "front": // 交叠胸前：肘外撑
      out.push(L([lx + 8, ly + 18], [lx - 30, ly + 150], [f.hx + 40, hipY - 200], sw * 0.85));
      out.push(L([rx - 8, ry + 18], [rx + 30, ry + 150], [f.hx - 40, hipY - 200], sw * 0.85));
      break;
    case "outR": // 右手外伸：袖口张开
      out.push(L([lx + 8, ly + 18], [lx - 26, ly + 200], [lx - 18, hipY - 30]), cuff([lx - 18, hipY - 30], -1));
      out.push(L([rx - 8, ry + 18], [rx + 90, ry + 60], [rx + 160, ry + 210], sw * 1.2), cuff([rx + 160, ry + 210], 1));
      break;
    case "upR": // 右手抬到头侧
      out.push(L([lx + 8, ly + 18], [lx - 26, ly + 200], [lx - 18, hipY - 30]), cuff([lx - 18, hipY - 30], -1));
      out.push(L([rx - 8, ry + 24], [rx + 90, ry + 60], [rx + 34, f.hy + 10], sw * 0.6));
      break;
    case "belt": // 双手在腰
      out.push(L([lx + 8, ly + 18], [lx - 20, ly + 160], [f.hx - 46, hipY - 90], sw * 0.8));
      out.push(L([rx - 8, ry + 18], [rx + 20, ry + 160], [f.hx + 46, hipY - 90], sw * 0.8));
      break;
    case "table": // 一手压案：右臂向前下压
      out.push(L([lx + 8, ly + 18], [lx - 20, ly + 200], [lx - 14, hipY - 50]), cuff([lx - 14, hipY - 50], -1));
      out.push(L([rx - 8, ry + 18], [rx + 70, ry + 140], [rx + 96, hipY - 20], sw * 0.95), cuff([rx + 96, hipY - 20], 1));
      break;
    case "backR": // 右手背到身后：只看得见左袖
      out.push(L([lx + 8, ly + 18], [lx - 26, ly + 200], [lx - 18, hipY - 30]), cuff([lx - 18, hipY - 30], -1));
      out.push(L([rx - 8, ry + 18], [rx - 4, ry + 60], [rx - 24, ry + 130], sw * 0.3));
      break;
    case "hold": { // 双手托在胸前：肘往外撑开，袖子先鼓出去再收回来托住。
      // 控制点贴着身子的那一版，肩膀整个消失，剪影像一盏油灯——捧东西的人肘是开的
      const y0 = f.chestY - 34;
      out.push(L([lx + 8, ly + 18], [lx - 78, ly + 150], [f.hx - 54, y0], sw * 0.9), cuff([f.hx - 54, y0], -1));
      out.push(L([rx - 8, ry + 18], [rx + 78, ry + 150], [f.hx + 54, y0], sw * 0.9), cuff([f.hx + 54, y0], 1));
      break;
    }
    case "offer": { // 递出去一点，又停住：肘仍外开，两袖向前下伸，袖口朝上翻
      const y0 = f.chestY + 18;
      out.push(L([lx + 8, ly + 18], [lx - 86, ly + 160], [f.hx - 74, y0], sw * 0.86), cuff([f.hx - 74, y0], -1));
      out.push(L([rx - 8, ry + 18], [rx + 90, ry + 160], [f.hx + 78, y0 + 10], sw * 0.86), cuff([f.hx + 78, y0 + 10], 1));
      break;
    }
    case "bend": // 弯身解带：两袖向前下方
      out.push(L([lx + 8, ly + 18], [lx + 10, ly + 170], [f.hx - 30, hipY - 60], sw * 0.8));
      out.push(L([rx - 8, ry + 18], [rx - 10, ry + 170], [f.hx + 36, hipY - 60], sw * 0.8));
      break;
  }
  return out.join("");
}

/**
 * 披帛：一条宽带子，不是绳。
 * 唐代披帛是二三尺宽的长巾，绕过双肩在胸前垂成一个 U，一端搭下去。
 * 宽度是它的全部特征 —— 细了就成了挂在身上的线，纯剪影下先毁掉的就是这一处。
 */
function peibo(f: Frame, fill: string): string {
  const [lx, ly] = f.shL, [rx, ry] = f.shR;
  const dropY = ly + 300 + f.side * 30;   // U 底，重心侧垂得更低
  return (
    // 胸前那道 U：从左肩过胸前兜到右肩，中段最宽
    stroke([lx + 26, ly + 26], [CX + f.pose.lean, dropY], [rx - 26, ry + 26], 46, 46, fill, ' opacity="0.72"') +
    // 一端顺着重心侧的身侧落下，到膝上收住
    stroke([rx - 30, ry + 34], [rx - 6 + f.side * 26, ly + 420], [CX + f.side * f.halfW * 0.86, f.hemY - 210], 40, 16, fill, ' opacity="0.72"')
  );
}

/** 道具与朱砂点。`expr` 用来判断这一张要不要画道具，`bare` 是无朱砂的那一套 */
function propAndAccent(c: Char, f: Frame, expr: Expr, bare: boolean): string {
  const [lx] = f.shL, [rx, ry] = f.shR;
  const hipY = (f.hipL[1] + f.hipR[1]) / 2, x = f.hx;
  const dot = (cx: number, cy: number, r = 9) => `<circle class="accent" cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" fill="${ACCENT}"/>`;
  const out: string[] = [];
  const showProp = !(c.hidePropOn ?? []).includes(expr);
  if (showProp) switch (c.prop) {
    case "bi": out.push(stroke([rx + 22, hipY - 70], [rx + 44, hipY + 10], [rx + 60, hipY + 96], 8, 2, v("line"))); break;
    case "jian": out.push(stroke([lx - 26, hipY - 130], [lx - 56, hipY + 40], [lx - 72, hipY + 250], 16, 6, v("line"))); break;
    case "zhi": out.push(shape([{ p: [rx + 128, ry + 156] }, { p: [rx + 188, ry + 138] }, { p: [rx + 198, ry + 206], c: [rx + 200, ry + 170] }, { p: [rx + 138, ry + 224] }], GROUND, ' opacity="0.9"')); break;
    case "zhangben": out.push(`<rect x="${x - 60}" y="${hipY - 236}" width="120" height="54" rx="3" fill="${GROUND}" opacity="0.85"/>`); break;
    case "chi": out.push(stroke([lx - 22, hipY - 40], [lx - 26, hipY + 40], [lx - 28, hipY + 124], 9, 9, GROUND)); break;
    case "shu": out.push(`<rect x="${lx - 52}" y="${hipY - 72}" width="70" height="90" rx="2" fill="${GROUND}" opacity="0.85"/>`); break;
    case "zhenbao": out.push(`<ellipse cx="${x + 72}" cy="${hipY - 42}" rx="30" ry="22" fill="${GROUND}" opacity="0.8"/>`); break;
    case "yan": out.push(`<rect x="${rx + 44}" y="${hipY - 36}" width="120" height="22" rx="4" fill="${v("line")}"/>`); break;
    case "gao": {
      // 一叠核过两遍的稿：托在胸前，偏向主角那一侧（主角总在左），略歪。
      // 纸色实心，是这个人剪影里唯一的亮块——远看认她就认这一块
      const ty = f.chestY - 60, tw = 104, th = 62;
      out.push(`<g transform="rotate(-5 ${f1(x)} ${f1(ty)})">`
        + `<rect x="${f1(x - tw - 12)}" y="${f1(ty)}" width="${tw * 2}" height="${th}" rx="3" fill="${GROUND}"/>`
        + stroke([x - tw + 4, ty + 20], [x, ty + 22], [x + tw - 24, ty + 20], 3, 3, v("ink-3"), ' opacity="0.55"')
        + stroke([x - tw + 4, ty + 40], [x, ty + 42], [x + tw - 40, ty + 40], 3, 3, v("ink-3"), ' opacity="0.45"')
        + `</g>`);
      break;
    }
  }
  // 一点紫：簪头上一枚比朱砂点更小的圆。只给结契者（D-035：结契的两人互换发簪）。
  // 试过画成衣缘的一道线，面积反而比朱砂点大，破了 art-style 里自己定的规矩；簪头这处也更有出处
  if (c.jieqi) {
    out.push(`<circle class="purple" cx="${f1(x - 58)}" cy="${f1(f.hy + 30)}" r="5" fill="${PURPLE}"/>`);
  }
  // 一点紫：簪头上一枚比朱砂点更小的圆。只给结契者（D-035：结契的两人互换发簪）。
  // 试过画成衣缘的一道线，面积反而比朱砂点大，破了 art-style 里自己定的规矩；簪头这处也更有出处
  if (c.jieqi) {
    out.push(`<circle class="purple" cx="${f1(x - 58)}" cy="${f1(f.hy + 30)}" r="5" fill="${PURPLE}"/>`);
  }
  if (bare) return out.join("");     // 归还之后那一处朱砂不在了，别的都不动
  switch (c.accent) {
    case "cuff": out.push(dot(rx + 96, hipY - 6, 8)); break;
    case "seal": out.push(`<rect class="accent" x="${x + 30}" y="${hipY - 118}" width="22" height="22" fill="${ACCENT}"/>`); break;
    case "tassel": out.push(dot(lx - 28, hipY - 132, 8)); break;
    case "paperline": out.push(`<rect class="accent" x="${rx + 150}" y="${ry + 146}" width="4" height="70" transform="rotate(-18 ${rx + 150} ${ry + 146})" fill="${ACCENT}"/>`); break;
    case "hairpin": out.push(dot(x + 62, f.hy + 36, 8)); break;
    case "ruler": out.push(dot(lx - 28, hipY + 124, 7)); break;
    case "crown": out.push(dot(x, f.hy - f.hr - 82, 8)); break;
    case "belt": out.push(dot(x - 30, hipY - 118, 8)); break;
    case "needle": out.push(stroke([x + 94, hipY - 52], [x + 106, hipY - 74], [x + 120, hipY - 92], 4, 1, ACCENT).replace("<polygon", '<polygon class="accent"')); break;
    case "cord": {
      // 系稿的朱绳，绕在右腕上。不是首饰，是一件工具——而且是主角的工具，暂借给她的
      const wy = f.pose.hands === "offer" ? f.chestY + 18 : f.chestY - 34;
      const wx = f.pose.hands === "offer" ? x + 74 : x + 52;
      out.push(stroke([wx - 26, wy + 26], [wx, wy + 38], [wx + 26, wy + 24], 6, 6, ACCENT)
        .replace("<polygon", '<polygon class="accent"'));
      out.push(`<circle class="accent" cx="${f1(wx + 24)}" cy="${f1(wy + 30)}" r="5" fill="${ACCENT}"/>`);
      break;
    }
  }
  return out.join("");
}

function render(c: Char, expr: Expr, bare = false): string {
  const pose = c.poses[expr];
  const f = frame(c, pose);
  const fill = v(c.tone);
  const line = v("line");
  const parts = [
    c.peibo ? peibo(f, fill) : "",
    body(c, f, fill),
    arms(c, f, fill),
    // 颈与头
    stroke([f.hx, f.hy + f.hr - 10], [f.hx, f.neckY], [f.hx, f.neckY + 16], 26, 46, fill),
    `<g transform="rotate(${pose.head} ${f.hx} ${f.hy})"><ellipse cx="${f.hx}" cy="${f.hy}" rx="${f.hr}" ry="${f.hr + 8}" fill="${fill}"/></g>`,
    hair(c.hair, f, fill),
    propAndAccent(c, f, expr, bare),
    // 焦墨提精神：肩线一笔、下摆一笔、重心侧的衣褶一笔。粗到细
    stroke([f.shL[0] + 6, f.shL[1] + 2], [f.hx, f.shL[1] - 10], [f.shR[0] - 6, f.shR[1] + 2], 7, 2, line),
    stroke([CX - f.halfW * 0.9, f.hemY - 6], [CX, f.hemY + 4], [CX + f.halfW * 0.9 + f.side * 14, f.hemY - 6], 2, 6, line),
    stroke([CX + f.side * f.halfW * 0.3, f.chestY + 40], [CX + f.side * f.halfW * 0.55, (f.chestY + f.hemY) / 2], [CX + f.side * f.halfW * 0.8, f.hemY - 40], 1, 5, line, ' opacity="0.55"'),
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-char="${c.key}" data-expr="${expr}"${bare ? ' data-bare="1"' : ""}>
<!-- ${c.name} · ${expr}${bare ? " · 无朱砂" : ""} · ${c.note} -->
${parts.filter(Boolean).join("\n")}
</svg>
`;
}

// ------------------------------------------------------------ 输出

/** 放 src 下而不是 public：立绘要打进包里。单文件 Artifact 没有目录可 fetch */
const OUT = join(ROOT, "src", "char");
mkdirSync(OUT, { recursive: true });
const exprs: Expr[] = ["default", "guarded", "open"];
let n = 0;
/** 对照表要把 SVG **内联**进去，见下面的注释 */
const inline: Record<string, string> = {};
for (const c of CHARS) for (const e of exprs) {
  const one = render(c, e);
  writeFileSync(join(OUT, `${c.key}_${e}.svg`), one, "utf8");
  inline[`${c.key}_${e}`] = one;
  n++;
  // 无朱砂的一套：文件名 `<key>_<expr>_bare.svg`，归还之后引擎切过去（D-038 第 8 条）
  if (c.bare) {
    const bare = render(c, e, true);
    writeFileSync(join(OUT, `${c.key}_${e}_bare.svg`), bare, "utf8");
    inline[`${c.key}_${e}_bare`] = bare;
    n++;
  }
}

const sheet = `<!doctype html><html lang="zh-Hans"><head><meta charset="utf-8"><title>立绘对照表</title>
<style>
:root{--c-line:#1A1815;--c-ink-1:#33302B;--c-ink-2:#55524A;--c-ink-3:#8C8880;--c-ink-4:#C9C4B8;--c-accent:#A8232A;--c-ground:#EDE7DA;
--c-char-line:#1A1815;--c-char-1:#33302B;--c-char-2:#55524A;--c-char-3:#8C8880;--c-char-4:#C9C4B8;--c-purple:#6A4470}
/* 金碧板只换场景与器物的色。--c-char-* 不在这里重声明——人永远走墨色（E4） */
body.gold{--c-line:#1A1815;--c-ink-1:#2F5C8F;--c-ink-2:#5B8C6A;--c-ink-3:#8B4A2F;--c-ink-4:#B8964F;--c-accent:initial;--c-purple:initial;--c-ground:#E6D9B9}
body{margin:0;background:var(--c-ground);font-family:"Noto Serif SC","Songti SC",serif;color:var(--c-line);padding:24px}
h1{font-weight:normal;font-size:18px;letter-spacing:.2em;margin:0 0 12px}
.row{display:grid;grid-template-columns:120px repeat(3,1fr);gap:12px;align-items:center;border-top:1px solid var(--c-ink-4);padding:10px 0}
.row .n{font-size:14px}.row .n small{display:block;color:var(--c-ink-3);font-size:11px;line-height:1.6;margin-top:4px}
.row .fig{width:100%;max-width:210px;display:block;margin:0 auto}
.row .fig svg{width:100%;height:auto;display:block}
.sil .row .fig{filter:brightness(0)}
button{font:inherit;border:1px solid var(--c-ink-4);background:none;padding:4px 10px;margin-right:8px;cursor:pointer;color:inherit}
</style></head><body>
<h1>立绘对照表 · ${n} 张</h1>
<!-- SVG 是**内联**的，不是 <img src>。用 img 引进来的 SVG 是一个独立文档，
     拿不到这个页面的 CSS 变量——「切色板」按钮那时候等于没接线，
     不管切成哪一板，图都用自己的回退色，看不出金碧下人会变成什么样。
     E4 那个「主角在昭阳殿里整个人是石青」的 bug，正是因为这一页当时验不出来。 -->
<p><button onclick="document.body.classList.toggle('gold')">切色板</button><button onclick="document.body.classList.toggle('sil')">纯剪影</button>
<span style="font-size:12px;color:var(--c-ink-3)">纯剪影用来查 art-director 第 1 条：涂黑还认不认得出</span></p>
${CHARS.map((c) => `<div class="row"><div class="n">${c.name}<small>${c.key} · ${c.tone}<br>${c.note}</small></div>${exprs.map((e) => `<div class="fig">${inline[`${c.key}_${e}`]}</div>`).join("")}</div>`).join("\n")}
</body></html>`;
writeFileSync(join(ROOT, "docs", "char-sheet.html"), sheet, "utf8");

console.log(`\n生成 ${n} 张到 src/char/，对照表 docs/char-sheet.html\n`);
