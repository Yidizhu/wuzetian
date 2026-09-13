import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { SceneDescriptor, SceneRenderer } from "./SceneRenderer.ts";
import type { Palette, SceneKey } from "../engine/types.ts";
import { STAGE_TUNE, tuneKey } from "./stage-tune.ts";

/**
 * 3D 舞台。D-003 的主实现：low-poly 场景，MeshToonMaterial 分级平涂，
 * 焦墨描边（反向法线外扩），固定机位，一次缓慢推镜。
 *
 * 三条自我约束：
 * 1. 只有背景层的事。对话、数值、立绘一概不知道，退回 CSS 版时零改动。
 * 2. 静止时不渲染。推镜和视差之外画面不变，一帧都不画，手机不发热。
 * 3. 几何全部程序化。没有 .glb 要下载，首屏只有代码。
 *
 * 纸纹沿用 CSS 那一层叠在画布上，比后处理便宜，效果一样。
 */

/**
 * 物件的用色。MeshToonMaterial 的 gradientMap 是光照的量化查表，不是调色板——
 * 把色板色塞进去会和光相乘，出来一片灰。标准做法：ramp 用灰阶分级，
 * 颜色由每个物件的 color 自己带，从当前色板里取。
 *
 * 角色名按「明暗位置」定，不按远近定（art-director 第 6 条：色要有主次）：
 *
 * - `flat`  底色本身，不参加光照。素屏风、未写的符纸、水面、碑面——画面里「空着」的东西。
 *           它同时是留白的来源，所以两块色板里它都占最大面。
 * - `pale`  水墨板是清墨（最远的山、雾）；金碧板是泥金，**只许当点睛用**（匾、脊饰），
 *           不许铺面。金碧板的大面浅色来自 `flat`（绢），不是泥金。
 * - `light` 水墨板淡墨；金碧板石绿（帷幔、瓦当、栏），中小面。
 * - `mid`   水墨板重墨；金碧板赭石（地面、梁柱、土木），中面到大面。
 * - `dark`  水墨板浓墨；金碧板石青（殿柱、朝服、最重的块面），画面最重的那一块。
 * - `line`  焦墨。两板共用，轮廓与最细的枝条。
 * - `wash`  水墨板的浓墨，**不随色板变**。专给 D-010 的「水墨侵入」用：
 *           金碧场景里她带进来的那一件东西（屏风、她写的字）要是墨色，不是石青。
 * - `paper` 白天的纸色，夜里也不换。只给月亮：夜景的底是夜纸，月亮要比它亮一档才看得见，
 *           用 `flat` 的话它会跟着换成夜纸色，于是整个月亮消失（第一版就是这样）。
 * - `accent` 朱砂。金碧板没有 `--c-accent`（palette.css 里置为 initial），自动落到泥金，
 *           与立绘的 `var(--c-accent, var(--c-ink-4))` 同一规则。
 */
type Tone = "flat" | "paper" | "pale" | "light" | "mid" | "dark" | "line" | "wash" | "accent";

const TONE_VAR: Record<Palette, Record<Tone, string>> = {
  ink: {
    flat: "--c-ground", paper: "--c-ground", pale: "--c-ink-4", light: "--c-ink-3", mid: "--c-ink-2",
    dark: "--c-ink-1", line: "--c-line", wash: "--c-ink-wash", accent: "--c-accent",
  },
  gold: {
    flat: "--c-ground", paper: "--c-ground", pale: "--c-ink-4", light: "--c-ink-2", mid: "--c-ink-3",
    dark: "--c-ink-1", line: "--c-line", wash: "--c-ink-wash", accent: "--c-accent",
  },
};

/**
 * 描边的基准。`lineW` 参数从此只是一个**倍数**（写成 LINE_W × k 是为了读起来还是宽度的样子），
 * 真正的世界宽度在 tuneOutlines 里算：以舞台宽度的 LINE_FRAC 为一个单位。
 * 这样同一根线在八个远近不同的场景里，落到屏幕上是同一个粗细量级——
 * 早先按固定世界宽度写死，无字碑（舞台 6.8 米宽）的线只有掖庭（3.6 米宽）的一半粗。
 */
const LINE_W = 0.028;
/**
 * 一根标准线占画面宽度的比例。390 宽的手机上约 3 像素，笔压再在 0.42 到 1.45 倍之间走。
 * 大块的背景（地、梁、墙）要把倍数压到 0.5 上下：粗线归主体，背景的线该退。
 */
const LINE_FRAC = 0.008;

/**
 * 毛笔线（E2）。
 *
 * 反向法线外扩的壳如果只是整体放大一个比例，出来的线粗细均匀，而且薄的那一维几乎没有线——
 * art-director 第 5 条的「差」档写的就是这个：均匀粗细的机器线。
 *
 * 这一版壳沿**平滑法线**外扩一个固定的世界宽度（所以每个面上的线一样厚，跟物件多长多扁无关），
 * 宽度再乘一个随物体坐标变化的「笔压」。笔压用三组不同频率的正弦叠起来：
 * 走一圈粗细就变几次，有按下去的地方也有提起来的地方，细处再把墨色提到浓墨，像笔尖抬起来。
 * 噪声取的是**物体坐标**，所以笔触钉在物件上，镜头动它不爬。
 *
 * 平滑法线是关键：盒子的法线是逐面的，沿逐面法线外扩会在棱上裂开；
 * 先 mergeVertices 再 computeVertexNormals，八个角各拿到一条对角法线，壳才是连的。
 */
const OUTLINE_VS = `
uniform float uW;
varying float vP;
float pressure(vec3 p) {
  float a = sin(p.x * 3.7 + p.y * 2.1 + 1.3);
  float b = sin(p.y * 6.1 - p.z * 4.3 + 2.7);
  float c = sin(p.z * 2.3 + p.x * 5.1 - 0.9);
  return a * 0.5 + b * 0.32 + c * 0.18;
}
void main() {
  float k = clamp(pressure(position) * 0.5 + 0.5, 0.0, 1.0);
  vP = k;
  // 平方一下：提笔的地方更细，落笔的地方才显得是压下去的。
  // 下限不能到 0：一条边整根消失看着像漏画，不像提笔
  float w = uW * mix(0.42, 1.45, k * k);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * w, 1.0);
}`;
const OUTLINE_FS = `
uniform vec3 uInk;
uniform vec3 uThin;
varying float vP;
void main() {
  gl_FragColor = vec4(mix(uThin, uInk, smoothstep(0.12, 0.62, vP)), 1.0);
}`;

interface Built {
  group: THREE.Group;
  camFrom: THREE.Vector3;
  camTo: THREE.Vector3;
  lookAt: THREE.Vector3;
  lights: THREE.Light[];
  /** 在 lookAt 处要装进画面的舞台宽度。竖屏靠它算视角，固定竖向 fov 在手机上只剩一条缝 */
  fitWidth: number;
  /**
   * 在 lookAt 处必须装进画面的高度。横屏靠它：只按宽度定视角的话，
   * 横屏的竖向视野会缩掉一半，昭阳殿就只剩几根柱子顶和一块匾，马和屏风全在画外。
   */
  fitHeight: number;
  /** 夜场：底色换成 --c-ground-night */
  night?: boolean;
  /** 墨层默认覆盖面积，0–1。只有金碧场景看得见，见 setInk */
  ink?: number;
  /** 布置的加设（公议的案、开课的席）。默认藏着，布置名在 dressOn 里才现 */
  dress?: THREE.Group;
  /** 哪几种布置让 dress 现身。不写就是公议那两种 */
  dressOn?: readonly string[];
  /** 只在没有布置时出现的东西（昭阳殿那匹马）。布置切换不重搭，所以要能单独藏 */
  bare?: THREE.Object3D;
}

interface Placement {
  rx?: number; ry?: number; rz?: number;
  /** 0 = 不描边（月亮这种不该有轮廓圈的东西） */
  lineW?: number;
  scale?: number;
  /** 不参加光照，平涂一块色。远山、水面、月——水墨里最远的东西没有明暗，只有一片淡 */
  unlit?: boolean;
}

export class ThreeStageRenderer implements SceneRenderer {
  readonly name = "three-stage";
  private root!: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(28, 1, 0.1, 200);
  private built: Built | null = null;
  private gradient: THREE.DataTexture | null = null;
  private cssVars: Record<string, string> = {};
  private palette: Palette = "ink";
  private night = false;
  private inkEl: HTMLElement | null = null;
  private inkValue = 0;
  private dressing = "";
  /** 最后一次 show 的场景。setDressing 改到影响几何或光的那几种布置时要照它重建 */
  private last: SceneDescriptor | null = null;
  private anim: { from: THREE.Vector3; to: THREE.Vector3; t0: number; dur: number } | null = null;
  private raf = 0;
  private onPointer = (e: PointerEvent) => this.parallax(e.clientX, e.clientY);
  private px = 0; private py = 0;
  /** 性能闸门用：最近一次推镜期间的帧率 */
  private frames = 0; private frameT0 = 0; lastFps = 0;

  mount(root: HTMLElement): void {
    this.root = root;
    root.classList.add("stage", "stage--three");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);   // 透明，底色交给 .stage 的 CSS，夜景换纸色也在那边
    this.renderer.setSize(root.clientWidth || window.innerWidth, root.clientHeight || window.innerHeight);
    this.renderer.domElement.className = "stage__canvas";
    root.appendChild(this.renderer.domElement);
    // 水墨侵入层（D-010 第 3 条）。在画布之上、纸纹之下，只在金碧场景显形
    const ink = document.createElement("div");
    ink.className = "stage__ink";
    ink.hidden = true;
    root.appendChild(ink);
    this.inkEl = ink;
    // 雨丝：只有女冠观的夜雨用得上，别的时候 CSS 把它收着（.stage 上的 data-dress）
    const rain = document.createElement("div");
    rain.className = "stage__rain";
    root.appendChild(rain);
    const paper = document.createElement("div");
    paper.className = "stage__paper";
    root.appendChild(paper);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
  }

  async load(_d: SceneDescriptor): Promise<void> {
    // 程序化几何，没有要预载的东西
  }

  async show(d: SceneDescriptor): Promise<void> {
    this.last = d;
    this.palette = d.palette;
    this.readPalette();
    this.root.classList.add("stage--wiping");
    await wait(160);
    this.dispose3d();
    this.night = false;
    this.useRamp([0.42, 0.72, 1.0]);
    const b = this.build(d);
    this.built = b;
    this.night = !!b.night;
    this.root.dataset.night = b.night ? "1" : "";
    // flat 材质在夜场要跟着换底色，所以建完再刷一遍它们的颜色
    if (b.night) this.repaintFlat(b.group);
    this.scene.add(b.group, ...b.lights);
    this.camera.aspect = (this.root.clientWidth || window.innerWidth) / (this.root.clientHeight || window.innerHeight);
    this.fitCamera();
    this.camera.position.copy(b.camFrom);
    this.camera.lookAt(b.lookAt);
    this.applyDress(b);
    this.tuneOutlines(b);
    this.markFloor(b);
    this.setInk(d.palette === "gold" ? (b.ink ?? actInk(d.act)) : 0);
    this.root.classList.remove("stage--wiping");
    // 一次缓慢缓慢推镜，像舞台灯光慢慢收拢
    this.dolly(b.camFrom, b.camTo, 2600);
    await wait(320);
    this.root.dataset.tris = String(this.triangles());
  }

  /**
   * 把「人站的那条线」在屏幕上的位置交出去，写成根元素上的 `--stage-floor`
   * （离画面底边的百分比）。立绘层读它来对脚。
   *
   * 每个场景的地平线高低不一样：掖庭是近景平视，地线在画面下三分之一；
   * 含元殿是大俯视，地线在画面正中。用一个写死的 bottom 值摆立绘，
   * 必然有几场人是浮着的或者陷进地里的。这是背景层唯一需要告诉外面的一件事，
   * 所以用一个 CSS 变量传，不进 SceneRenderer 接口。
   */
  private markFloor(b: Built): void {
    // 人站的地方不是 lookAt 那么远：立绘在画面上很大，说明她们站在机位与看点之间，
    // 大约四成五的位置。拿 lookAt 处的地平线去对脚，仰视的场景会把人整个顶到画面上半张去
    const keep = this.camera.position.clone();
    // 按推镜结束的机位算，而且要自己刷一遍矩阵：project 读的是 matrixWorldInverse，
    // 那个矩阵只在 render 里更新，这里不刷就是拿上一场的相机在算，数会离谱
    this.camera.position.copy(b.camTo);
    this.camera.lookAt(b.lookAt);
    this.camera.updateMatrixWorld(true);
    this.camera.matrixWorldInverse.copy(this.camera.matrixWorld).invert();
    // 站在哪（E8）：原来写死机位到看点的四成五。整屏闭环量出来，大多数场景那个位置的地
    // 在对话框下面（地线 3%、-7%），立绘被下限抬到 21%，于是人比真地面高出一截——R-017 说的「浮着」就是这个。
    // 现在往里走：从四成五开始，一步半成，直到脚下那块地露出对话框（23%）为止。人站远了，下面按同一处算身高，自然就小
    let at = b.camTo.clone().lerp(b.lookAt, 0.45);
    let p = new THREE.Vector3(at.x, 0, at.z).project(this.camera);
    for (let t = 0.5; t <= 0.95 && (p.y + 1) / 2 < 0.23; t += 0.05) {
      at = b.camTo.clone().lerp(b.lookAt, t);
      p = new THREE.Vector3(at.x, 0, at.z).project(this.camera);
    }
    // 同一个位置、一个 1.62 米的人头顶在哪（E8）：人和景用同一台相机量，才是同一个空间
    const head = new THREE.Vector3(at.x, PERSON_M, at.z).project(this.camera);
    this.camera.position.copy(keep);
    this.camera.lookAt(b.lookAt);
    // ndc.y 1 是顶、-1 是底；离底边的比例就是 (y + 1) / 2。
    // 下限 21%：对话框顶边大约在 19% 处，地平线再低，立绘的脚就被切在小腿上了。
    // 宁可让人站得比真地平线高一点点，也不能让她没有脚——E4 手机实机的第一条意见
    const fromBottom = Math.max(0.21, Math.min(0.42, (p.y + 1) / 2));
    document.documentElement.style.setProperty("--stage-floor", `${(fromBottom * 100).toFixed(1)}%`);
    this.personRaw = (head.y - p.y) / 2;
    // 给整屏闭环读：真人按这台相机该有多高、地线原本在哪（夹之前）
    document.documentElement.dataset.stageRaw = `${this.personRaw.toFixed(3)} ${((p.y + 1) / 2).toFixed(3)}`;
    document.documentElement.style.setProperty("--stage-person", this.personScale().toFixed(3));
  }

  /** 这个位置上一个真人在画面上占多高（0–1），给整屏闭环报数用 */
  personRaw = 0;

  /**
   * 人多大（E8，D-071 整屏闭环看出来的）。CC1 给了 --stage-person 这个旋钮，默认 1；
   * 1 的时候两个立绘各占竖屏七成高，景全被挡在腿后面，女冠观的殿读成她们腰边一张桌子，
   * 含元殿读成两个巨人脚下的沙盘——**立绘和场景不是同一个空间**。
   *
   * 所以人的大小不再写死，按相机算：站位上一个 1.62 米的人在画面上占多高，立绘就画多高
   * （立绘里人身占格子高的 86%，格子是视口高的 72% 或 76%）。
   * 算出来太小的场景（远景、俯视）夹到 PERSON_MIN：再小手机上认不出是谁，那一场该改的是机位，不是人——
   * 整屏闭环把「夹住了」的场标出来，交人决定改机位还是认。stage-tune.ts 里写了 person 的以写的为准
   */
  private personScale(): number {
    const d = this.last;
    const fixed = d ? STAGE_TUNE[tuneKey(d.key, d.palette, this.dressing)]?.person : undefined;
    if (fixed) return fixed;
    const slot = (window.innerWidth <= 480 ? 0.72 : 0.76) * 0.86;
    return Math.max(PERSON_MIN, Math.min(PERSON_MAX, this.personRaw / slot));
  }

  /**
   * 把推镜直接走到底，停在 camTo。给两个地方用：
   * 审图要的是推镜结束那一帧（构图按它定的），以及不想看动效的人。
   */
  settle(): void {
    if (!this.built) return;
    cancelAnimationFrame(this.raf);
    this.anim = null;
    this.camera.position.copy(this.built.camTo);
    this.camera.lookAt(this.built.lookAt);
    this.markFloor(this.built);
    this.render();
  }

  /**
   * 布置（E3 第 2 条）。同一座殿，平常是空的，公议那天摆开案、抬出收封簿。
   *
   * 为什么不做成新的 SceneKey：那会让 schema、数据、CSS 版都跟着长一份，
   * 而这不是另一个地方，是同一个地方的另一天。几何常驻，切的只是 visible——
   * 隐藏的那一份不计面数（见 triangles）。
   *
   * 现在只有昭阳殿和含元殿有 `gongyi` 这一套，别的场景调用它没有副作用。
   * 引擎怎么把「这一场是公议」传进来，见指挥日志「待协调」。
   */
  setDressing(name: string): void {
    if (name === this.dressing) return;
    const before = this.dressing;
    this.dressing = name;
    this.root.dataset.dress = name;
    // 有几种布置改的是几何和光，不只是 visible（女冠观的夜雨、含元殿的受位）。
    // 那时候整场重搭一次——**不走 show，所以没有墨晕、也不打断正在跑的推镜**。
    // 这样引擎在 show 之前还是之后调用都一样，不用给别人加一条调用顺序的规矩
    if (this.built && this.last && (rebuilds(before) || rebuilds(name))) this.rebuild();
    else if (this.built) {
      this.applyDress(this.built);
      // 取景的微调按「场景 | 色板 | 布置」记（stage-tune.ts），布置换了取景可能跟着换
      this.fitCamera();
      this.markFloor(this.built);
    }
    this.render();
  }

  private applyDress(b: Built): void {
    if (b.dress) b.dress.visible = (b.dressOn ?? DRESS_GONGYI).includes(this.dressing);
    if (b.bare) b.bare.visible = !this.dressing;
  }

  /**
   * 取景倍数。1 是场景里写的 fitWidth / fitHeight；大于 1 往后退，画面里的东西变小、留白变多。
   * 平时读 stage-tune.ts（自动审查循环写的，见 tools/art-loop.ts）；
   * 循环试探的那几轮用 setFitScale 直接压一个值，不落盘。
   */
  private fitOverride: number | null = null;
  setFitScale(k: number | null): void {
    this.fitOverride = k;
    if (!this.built) return;
    this.fitCamera();
    this.markFloor(this.built);
    this.render();
  }
  private fitScale(): number {
    if (this.fitOverride) return this.fitOverride;
    const d = this.last;
    return d ? STAGE_TUNE[tuneKey(d.key, d.palette, this.dressing)]?.fit ?? 1 : 1;
  }

  /** 原地重搭：几何和光换掉，相机和正在跑的推镜一概不动 */
  private rebuild(): void {
    const d = this.last!;
    this.dispose3d();
    this.useRamp([0.42, 0.72, 1.0]);
    const b = this.build(d);
    this.built = b;
    this.night = !!b.night;
    this.root.dataset.night = b.night ? "1" : "";
    if (b.night) this.repaintFlat(b.group);
    this.applyDress(b);
    this.scene.add(b.group, ...b.lights);
    this.fitCamera();
    this.tuneOutlines(b);
    this.markFloor(b);
  }

  /**
   * 题画用的三个预设机位（D-014）。拍一张就把相机放回原位，游戏那边看不出发生过什么。
   *
   * 为什么只给三个、而且不让玩家转镜头：D-003 定了「相机不交给玩家」。
   * 题画是让她挑一张构图，不是让她自己找角度——八个场景的机位是按构图规矩定的，
   * 交出去就没有构图了。三个预设都从场景自己的机位派生，所以每一张都还在规矩里。
   */
  shoot(view: 0 | 1 | 2): HTMLCanvasElement | null {
    const b = this.built;
    if (!b) return null;
    const dir = b.camTo.clone().sub(b.lookAt);
    const pos = view === 0 ? b.camTo.clone()
      : view === 1 ? b.camTo.clone().lerp(b.lookAt, 0.34)                    // 近：推进去三成
      : b.lookAt.clone().add(dir.multiplyScalar(1.3)).add(new THREE.Vector3(0, dir.length() * 0.22, 0));
    this.camera.position.copy(pos);
    this.camera.lookAt(b.lookAt);
    this.render();
    const shot = this.renderer.domElement;
    // 相机放回去，但先不重画：调用方马上要读画布的像素，重画会把刚拍的这一帧冲掉
    this.camera.position.copy(b.camTo);
    this.camera.lookAt(b.lookAt);
    return shot;
  }

  beat(_name: string): void {
    if (!this.built) return;
    const from = this.camera.position.clone();
    const to = from.clone().lerp(this.built.lookAt, 0.06);
    this.dolly(from, to, 900);
  }

  /**
   * 水墨侵入朝廷的进度（D-010 第 3 条）：0 是全金碧，1 是墨盖满。
   * 这一层覆盖面积就是她的权力进度，所以参数归引擎给，美术只负责它长什么样。
   * CC1 没有接上之前，默认值按场景的幕数推（第一幕 0、第二幕 0.22、第三幕 0.78）。
   * 水墨场景上这一层永远不显形——墨侵入墨没有意义。
   */
  setInk(v: number): void {
    this.inkValue = Math.max(0, Math.min(1, v));
    if (!this.inkEl) return;
    this.inkEl.style.setProperty("--ink-cover", this.inkValue.toFixed(3));
    this.inkEl.hidden = !(this.palette === "gold" && this.inkValue > 0.004);
    this.root.dataset.ink = this.inkEl.hidden ? "" : this.inkValue.toFixed(2);
  }

  /**
   * 性能基准：同步连画 n 帧，返回每帧毫秒。不靠 rAF，所以标签页在后台也测得出。
   * 30fps 的门槛是 33ms 一帧；桌面上跑出来的数只能当上限参考，手机要真机看。
   */
  benchmark(n = 60): number {
    if (!this.built) return 0;
    // 最后读回一个像素，逼 GPU 把排着的帧画完再停表：不读的话量到的只是 CPU 把命令交出去的时间。
    // 只读一次不逐帧读——逐帧读回本身要两三毫秒（E6 试过，280 面的碑也量出 3.3 ms），量的就成了读回
    const gl = this.renderer.getContext();
    this.render();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    const t1 = performance.now();
    for (let i = 0; i < n; i++) this.render();
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    const ms = (performance.now() - t1) / n;
    this.root.dataset.ms = ms.toFixed(2);
    return ms;
  }

  /** 三角面数，给性能闸门看：E1 要求每场不超过 1500 */
  triangles(): number {
    let n = 0;
    // traverseVisible 而不是 traverse：藏起来的布置连同它的子节点一起跳过，
    // 普通的 traverse 只会跳过那个节点本身，孩子照数——那样藏了也白藏
    this.scene.traverseVisible((o) => {
      if (o instanceof THREE.Mesh) {
        const g = o.geometry as THREE.BufferGeometry;
        n += g.index ? g.index.count / 3 : g.attributes.position!.count / 3;
      }
    });
    return Math.round(n);
  }

  resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.fitCamera();
    this.renderer.setSize(w, h);
    this.render();
  }

  /**
   * 取视角：宽和高两个要求各算一个竖向 fov，取大的那个，两边就都装得下。
   * 竖屏时宽度那一项大（纵向视野本来就富余），横屏时高度那一项大。
   * 上限 72° 免得透视变形——手机上会因此切掉一点宽度，那是可以接受的那一侧。
   */
  private fitCamera(): void {
    if (!this.built) { this.camera.updateProjectionMatrix(); return; }
    const d = this.built.camTo.distanceTo(this.built.lookAt);
    const k = this.fitScale();
    const byW = 2 * Math.atan((this.built.fitWidth * k) / 2 / (d * this.camera.aspect));
    const byH = 2 * Math.atan((this.built.fitHeight * k) / 2 / d);
    this.camera.fov = Math.min(72, (Math.max(byW, byH) * 180) / Math.PI);
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    window.removeEventListener("pointermove", this.onPointer);
    cancelAnimationFrame(this.raf);
    this.dispose3d();
    this.renderer.dispose();
    this.root.innerHTML = "";
    this.inkEl = null;
    this.root.classList.remove("stage", "stage--three");
  }

  // ------------------------------------------------------------ 色与材质

  private readPalette(): void {
    const cs = getComputedStyle(document.documentElement);
    for (const k of ["--c-line", "--c-ink-1", "--c-ink-2", "--c-ink-3", "--c-ink-4",
      "--c-ground", "--c-ground-night", "--c-ink-wash", "--c-accent"]) {
      this.cssVars[k] = cs.getPropertyValue(k).trim();
    }
  }

  private hex(tone: Tone): string {
    if (tone === "paper") return this.cssVars["--c-ground"] || "#EDE7DA";
    if (tone === "flat") {
      const night = this.cssVars["--c-ground-night"];
      return (this.night && night) || this.cssVars["--c-ground"] || "#EDE7DA";
    }
    // 金碧板没有朱砂：palette.css 把 --c-accent 置为 initial，这里读到空串，落到泥金。
    // 与 character.md「金碧场景里朱砂点转泥金」是同一条规则，实现也要同一条。
    const v = this.cssVars[TONE_VAR[this.palette][tone]];
    if (v) return v;
    if (tone === "accent") return this.cssVars["--c-ink-4"] || "#B8964F";
    if (tone === "wash") return "#33302B";
    return "#888888";
  }

  /** 灰阶 ramp。NearestFilter 是关键：插值了就成渐变，平涂就没了 */
  private useRamp(steps: number[]): void {
    this.gradient?.dispose();
    const data = new Uint8Array(steps.length * 4);
    steps.forEach((v, i) => {
      const g = Math.round(Math.max(0, Math.min(1, v)) * 255);
      data[i * 4] = g; data[i * 4 + 1] = g; data[i * 4 + 2] = g; data[i * 4 + 3] = 255;
    });
    const t = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
    t.minFilter = THREE.NearestFilter;
    t.magFilter = THREE.NearestFilter;
    t.colorSpace = THREE.NoColorSpace;
    t.needsUpdate = true;
    this.gradient = t;
  }

  /** 平涂材质加毛笔描边。描边是反向法线外扩的壳，见 OUTLINE_VS 上面那段 */
  private mesh(geo: THREE.BufferGeometry, tone: Tone = "mid", lineW = LINE_W, unlit = false): THREE.Group {
    const g = new THREE.Group();
    const color = this.hex(tone);
    const m = tone === "flat" || unlit
      ? new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }))
      : new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color, gradientMap: this.gradient! }));
    if (tone === "flat") m.userData.flat = true;
    if (lineW > 0) {
      // 壳用自己的一份几何：合顶点 + 平滑法线，棱上才不裂。填充那一份保持硬边，平涂要的就是硬边
      const shell = mergeVertices(geo.clone());
      shell.computeVertexNormals();
      const o = new THREE.Mesh(shell, new THREE.ShaderMaterial({
        vertexShader: OUTLINE_VS,
        fragmentShader: OUTLINE_FS,
        side: THREE.BackSide,
        uniforms: {
          uW: { value: lineW },
          uInk: { value: new THREE.Color(this.hex("line")) },
          uThin: { value: new THREE.Color(this.hex("wash")) },
        },
      }));
      o.userData.lineW = lineW;
      g.add(o);
    }
    g.add(m);
    return g;
  }

  /** 建好之后刷一遍不参加光照的那些面：夜场的底色不是白天的底色 */
  private repaintFlat(root: THREE.Object3D): void {
    const c = new THREE.Color(this.hex("flat"));
    root.traverse((o) => {
      if (o instanceof THREE.Mesh && o.userData.flat) {
        (o.material as THREE.MeshBasicMaterial).color.copy(c);
      }
    });
  }

  /**
   * 描边宽度随距离衰减（art-director 第 5 条的失分点之一）。
   * 让屏幕上的线宽按距离的 -0.45 次幂收细：近处的柱子压得住，远山的线细到快断。
   */
  private tuneOutlines(b: Built): void {
    const ref = Math.max(1, b.camTo.distanceTo(b.lookAt));
    b.group.updateMatrixWorld(true);
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    b.group.traverse((o) => {
      const base = o.userData?.lineW as number | undefined;
      if (!(o instanceof THREE.Mesh) || !base) return;
      o.getWorldPosition(p);
      o.getWorldScale(sc);
      const d = Math.max(0.4, p.distanceTo(b.camTo));
      // 倍数 × 舞台宽度 × LINE_FRAC 是这根线的标准宽度；
      // 再按距离的 0.55 次幂长，屏幕上的线宽就按 -0.45 次幂收细；
      // 最后除掉父级的缩放（马是整组缩小的），不然缩过的物件线也跟着细
      const w = ((base / LINE_W) * b.fitWidth * LINE_FRAC * Math.pow(d / ref, 0.55)) / Math.max(0.05, sc.x);
      (o.material as THREE.ShaderMaterial).uniforms.uW!.value = w;
    });
  }

  // ------------------------------------------------------------ 八个场景

  /**
   * 三条共用的做法，八个场景都照它建：
   *
   * 1. **没有铺满画面的地面。** 第一版每场都放了一块十几米见方的地板，在竖屏里它变成
   *    画面下半张的一块均匀灰板——正是 art-director 第 2 条说的「灰成一片」。
   *    水墨里地是画出来的几笔，不是一张板：这一版用 `pool()` 在物件脚下压几片错开的墨晕，
   *    其余留给纸。金碧场景例外，那里的「满」是意思的一部分，台基照旧铺。
   * 2. **竖屏优先定取景。** 手机上竖向视野是 fitWidth 的 2.16 倍，所以 fitWidth 要比
   *    横屏直觉小得多，主体才占得到画面高度的三到四成。第一版的 fitWidth 全大了一倍，
   *    人和物都缩成了摆件。
   * 3. **每场底下有一件近物。** 三段式的「地」交给它：瓮、香炉、栏、案角。
   *    没有它，竖屏下方那一大片就只是没画到的地方（rubric 第 3 条的「差」档）。
   *
   * 每场用色不超过三级加线：一个色占大面，一两个占中面，一个只占一点。
   */

  private build(d: SceneDescriptor): Built {
    // as string：yilu 是第九个地点（D-062），CC1 在 SceneKey 里加上之前这里也要能编译
    switch (d.key as string) {
      case "zhaoyang": return this.buildZhaoyang(d);
      case "shuge":    return this.buildShuge(d);
      case "yeting":   return this.buildYeting(d);
      case "nvguan":   return this.buildNvguan(d);
      case "shishe":   return this.buildShishe(d);
      case "yuanye":   return this.buildYuanye(d);
      case "hanyuan":  return this.buildHanyuan(d);
      case "wuzibei":  return this.buildWuzibei(d);
      case "yilu":     return this.buildYilu(d);
      default:         return this.buildFallback(d.key);
    }
  }

  /** 往 parent 里放一件东西。省掉三行 position/rotation 的样板 */
  private put(parent: THREE.Object3D, geo: THREE.BufferGeometry, tone: Tone,
    pos: readonly [number, number, number], p: Placement = {}): THREE.Group {
    const g = this.mesh(geo, tone, p.lineW ?? LINE_W, p.unlit);
    g.position.set(pos[0], pos[1], pos[2]);
    if (p.rx) g.rotation.x = p.rx;
    if (p.ry) g.rotation.y = p.ry;
    if (p.rz) g.rotation.z = p.rz;
    if (p.scale) g.scale.setScalar(p.scale);
    parent.add(g);
    return g;
  }

  /**
   * 地上的墨晕。四片错开的圆压在一起，所以边是不规整的，内部也不均——
   * composition.md 明说不要规整的椭圆阴影。不描边：墨晕没有轮廓线。
   */
  private pool(parent: THREE.Object3D, x: number, z: number, r: number, tone: Tone = "light"): void {
    // 墨晕是水墨的说法。金碧场景铺的是台基与地砖，那里没有洇开的墨——
    // 在绢上画一摊清墨会变成泥金的一滩，第一版就是这么让泥金从「点」变成 5.5% 的「面」的
    if (this.palette === "gold") return;
    // 四片半透明的圆错开叠，叠到的地方深、叠不到的地方浅，内部自然不均；
    // 不透明的平涂圆会变成一摊脏东西，第二版就是那样。depthWrite 关掉，免得互相切边
    const color = this.hex(tone);
    const spots: readonly (readonly [number, number, number])[] = [
      [0, 0, 1], [0.62, 0.18, 0.66], [-0.54, -0.3, 0.54], [0.16, -0.58, 0.44],
    ];
    spots.forEach(([dx, dz, k], i) => {
      const m = new THREE.Mesh(
        new THREE.CircleGeometry(r * k, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.17, depthWrite: false }),
      );
      m.position.set(x + dx * r, 0.01 + i * 0.004, z + dz * r);
      m.rotation.x = -Math.PI / 2;
      parent.add(m);
    });
  }

  /**
   * 树冠。一片扁平的四棱台，上小下大，正面看是个梯形——像一团被压扁的叶子。
   * 扁盒子从正面看就是一块悬空的板，第一版的槐和松都是那样。
   */
  private canopy(parent: THREE.Object3D, w: number, d: number, h: number,
    pos: readonly [number, number, number], tone: Tone, rz = 0): void {
    const c = this.put(parent, new THREE.CylinderGeometry(0.45, 1, h, 4), tone, pos,
      { ry: Math.PI / 4, rz, lineW: LINE_W * 0.6 });
    c.scale.set(w / 1.414, 1, d / 1.414);
  }

  /**
   * 屋顶。四段的圆柱就是一个方台——上窄下宽，正面看是个梯形，这才像坡屋顶；
   * 两块斜板从正面看只会叠成一条板（第一版的女冠观就是这样，像个候车亭）。
   * 檐口再压一条焦墨的线，屋顶的重量全在那条线上。
   */
  private roof(parent: THREE.Object3D, w: number, d: number, h: number,
    pos: readonly [number, number, number], tone: Tone = "dark"): void {
    const top = this.put(parent, new THREE.CylinderGeometry(0.62, 1, h, 4), tone, pos,
      { ry: Math.PI / 4, lineW: LINE_W * 1.1 });
    top.scale.set(w / 1.414, 1, d / 1.414);
    this.put(parent, new THREE.BoxGeometry(w * 1.06, 0.1, d * 1.06), "line",
      [pos[0], pos[1] - h / 2, pos[2]], { lineW: LINE_W * 0.5 });
  }

  /**
   * 公议的加设：两排案、案上各一份摊开的牍，外加一面**收封簿**——
   * 封好的条陈交上来记在这本册子上，它是这套布置里唯一有名字的东西。
   *
   * 无字碑母题在这里也成立：簿是摊开的，页面空着。公议记的是「谁交了」，不是「写了什么」。
   *
   * 案做成一块面板加一块桌面，不做四条腿：这个机位看不见腿，四条腿只换来一场多两百个面。
   * 面数是硬的——加了布置的那一场仍然要 ≤ 1500。
   */
  private gongyi(scale: number, rows: readonly (readonly [number, number])[],
    bookAt: readonly [number, number]): THREE.Group {
    const g = new THREE.Group();
    const w = 1.5 * scale, d = 0.6 * scale, h = 0.44 * scale;
    // 每一排给自己的 x：近的一排要收窄，不然透视把它推出画外。
    // 低机位下摆在远处的案会被地面前沿整片挡住，所以近处必须有一排横过画面下沿
    for (const [z, seatX] of rows) {
      for (const sx of [-1, 1]) {
        const x = sx * seatX;
        // 案用石绿，不用赭石：地就是赭石，同色的案眯眼看会和地糊成一块。
        // 石绿本来只在檐下那条帷幔上，给它一件正经差事，色的关系反而更清楚
        this.put(g, new THREE.BoxGeometry(w, 0.08 * scale, d), "light", [x, h, z], { lineW: LINE_W * 0.55 });
        this.put(g, new THREE.BoxGeometry(w * 0.92, h * 0.8, 0.06 * scale), "light",
          [x, h * 0.58, z + d * 0.42], { lineW: LINE_W * 0.45 });
        // 案上摊开的一份牍：纸色，每一张都空着
        this.put(g, new THREE.BoxGeometry(w * 0.44, 0.015 * scale, d * 0.5), "flat",
          [x - w * 0.12, h + 0.05 * scale, z], { ry: 0.08, lineW: LINE_W * 0.45 });
      }
    }
    // 收封簿：一面立着的册子，摊开，比案高一头。公议这一天，它是屋里唯一竖着的白
    const [bx, bz] = bookAt;
    this.put(g, new THREE.BoxGeometry(0.1 * scale, h * 2.0, 0.1 * scale), "line",
      [bx, h, bz], { lineW: LINE_W * 0.45 });
    this.put(g, new THREE.BoxGeometry(w * 0.8, h * 1.15, 0.04 * scale), "flat",
      [bx, h * 2.3, bz], { ry: -0.24, lineW: LINE_W * 1.2 });
    return g;
  }

  /**
   * 掖庭偏院。水墨，清晨薄雾侧逆光，平视略仰而且近。情绪：局促、观察、尚未被看见。
   * 无字碑母题：未写名的门牌——它是纸色的一小块，也是全画面唯一最亮的东西，焦点在它。
   *
   * 局促是靠一堵近墙压左边做出来的，不是靠把画面填满：
   * 墙近而高，门远而小，留白全部集中在右上——她要走的方向空着。
   */
  private buildYeting(_d: SceneDescriptor): Built {
    this.useRamp([0.66, 0.85, 1.0]);      // 薄雾：明暗差小，整屏偏亮。压暗一点点雾就没了
    const g = new THREE.Group();
    // 用色收到三级：纸（大面）＋淡墨（墙、门、阶、瓮）＋焦墨（檐与墙头两条线）。
    // E1 那一版五级墨色全用上了，是 rubric 第 6 条明写的失分点
    this.put(g, new THREE.BoxGeometry(0.2, 2.7, 5.8), "light", [-1.5, 1.35, -1.0], { lineW: LINE_W * 0.5 });
    this.put(g, new THREE.BoxGeometry(0.36, 0.15, 5.8), "dark", [-1.5, 2.82, -1.0], { lineW: LINE_W * 1.1 });
    // 对面墙：只给一条边，退到右后，淡
    this.put(g, new THREE.BoxGeometry(0.16, 1.9, 3.2), "pale", [1.5, 0.95, -2.4], { lineW: LINE_W * 0.5 });
    // 门：院子尽头一扇关着的板门。偏在画面左三分之一，不居中
    // E8：门加高到 3 米。整屏里人站上去，原来 2.3 米的门楣正好压在两个人头顶——院门本来就比人高得多
    this.put(g, new THREE.BoxGeometry(1.5, 3.0, 0.14), "light", [-0.2, 1.5, -3.75], { lineW: LINE_W * 0.8 });
    this.put(g, new THREE.BoxGeometry(0.06, 2.86, 0.04), "line", [-0.2, 1.48, -3.67], { lineW: LINE_W * 0.4 });
    // 门楣与檐：一条重横线压在门上，与墙头那条呼应
    this.put(g, new THREE.BoxGeometry(2.35, 0.17, 0.66), "dark", [-0.2, 3.18, -3.62], { lineW: LINE_W * 1.2 });
    // 未写名的门牌：纸色，空的，挂在门右侧，歪着。
    // 全画面最亮的一小块 + 最重的一圈线，视线只能落在它上面——这一场讲的就是「名字还没写上去」
    this.put(g, new THREE.BoxGeometry(0.34, 0.5, 0.05), "flat", [0.64, 2.85, -3.66], { rz: -0.055, lineW: LINE_W * 1.5 });   // E8：抬到人头以上，原来挨着右边那个人的头，像一块牌子挂在她脑袋上
    // 阶
    this.put(g, new THREE.BoxGeometry(1.85, 0.12, 0.5), "light", [-0.2, 0.06, -3.42], { lineW: LINE_W * 0.6 });
    // 水瓮：近物，压住画面右下角。压到淡墨——E1 那一版它是重墨，比门牌还扎眼，抢了焦点
    this.put(g, new THREE.CylinderGeometry(0.32, 0.25, 0.52, 8), "light", [0.78, 0.26, -1.5], { lineW: LINE_W * 0.9 });
    this.put(g, new THREE.CylinderGeometry(0.22, 0.22, 0.03, 8), "flat", [0.78, 0.53, -1.5], { lineW: LINE_W * 0.6 });
    // 槐：一条干从右边进来，两片淡冠压住右上角，免得留白空得没道理
    // E8：干原来在 x 1.02，右边那个人正好把它整根挡住，两片冠就成了悬在空中的灰盒子。挪到人外侧、往后退
    this.put(g, new THREE.CylinderGeometry(0.06, 0.09, 3.1, 6), "line", [1.5, 1.55, -2.2], { rz: -0.06, lineW: LINE_W * 0.45 });
    this.canopy(g, 1.5, 0.9, 0.34, [1.72, 3.2, -2.25], "pale", -0.09);
    this.canopy(g, 1.0, 0.7, 0.28, [1.4, 3.56, -2.4], "pale", 0.08);
    this.pool(g, 0.8, -1.55, 0.55);
    this.pool(g, -0.2, -3.35, 0.9);
    // 侧逆光：光从门那一侧的后上方来，墙和瓮只剩朝门的一面亮
    const sun = new THREE.DirectionalLight(0xffffff, 0.7);
    sun.position.set(2.4, 4.6, -6);
    return {
      group: g,
      camFrom: new THREE.Vector3(0.0, 1.52, 2.3),
      camTo: new THREE.Vector3(0.0, 1.5, 1.5),
      lookAt: new THREE.Vector3(0.1, 2.12, -3.7),      // 略仰：看点比机位高
      fitWidth: 3.6,
      fitHeight: 4.4,
      lights: [new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.95), sun],
    };
  }

  /**
   * 昭阳殿一角。金碧，正午硬光，低机位仰视柱列。情绪：秩序、压迫、规矩。
   * 无字碑母题：素屏风。
   *
   * 色的关系（art-director 第 6 条，这一版的主要修项）：
   * 绢底与素屏风占最大面，赭石的地与梁占中面，石青的柱列与那匹马是最重的一块，
   * 石绿只有檐下一条帷幔，泥金**只有那块匾**。第一版四色各占四分之一，是最典型的失分。
   */
  private buildZhaoyang(d: SceneDescriptor): Built {
    // 水墨版（第四章 01、04、06）：她登基之后回到这座殿，殿第一次是墨的。
    // 几何照旧——还是那座殿，变的是谁在画它。所以改的只有三样：
    // 台基不铺（水墨里地是几笔，不是一块板，E1 的老规矩），柱列按远近退墨，马换成一张案。
    // 夜里一盏灯（yedeng，夜谈四）：几何再不动，只改光、挂灯——灯油添到一半就停，所以灯小
    const ink = d.palette === "ink";
    const night = ink && this.dressing === "yedeng";
    this.useRamp(night ? [0.26, 0.64, 1.0] : ink ? [0.62, 0.85, 1.0] : [0.54, 0.81, 1.0]);
    this.night = night;
    const g = new THREE.Group();
    const act2 = d.palette === "gold" && d.act >= 2;
    if (!ink) {
      // 地与阶：赭石。金碧场景的「满」是意思的一部分，所以这里照旧铺台基
      this.put(g, new THREE.BoxGeometry(15, 0.3, 12), "mid", [0, 0.05, -4.0], { lineW: LINE_W * 0.45 });
    }
    // 地砖缝：四道细线。没有它，画面下沿就是一整片平砖，眯眼看是一块脏色。
    // 仰视机位看不见台阶的立面（踏道试过，全被地面前沿挡住），能看见的只有地上的线。
    // 水墨版没有台基，缝就是纸上的四笔，退到淡墨，只剩「这里有地」的意思
    for (const z of [1.6, 0.1, -1.6, -3.4]) {
      this.put(g, new THREE.BoxGeometry(15, 0.02, 0.045), ink ? "light" : "line",
        [0, ink ? 0.02 : 0.21, z], { lineW: 0, unlit: ink });
    }
    // 柱列：石青，画面最重的块面。近的一对顶天立地，仰视的压迫来自它们
    // 三对柱子。原来四对，最远那一对基本被前面挡住，省下来的面数给公议的案
    // E8（R-017 第 2 条）：最近那一对不要了。它在竖屏里被画面两边切断，右边那根的柱础成了一块读不出的浅方块；
    // 人站上去以后，它还和人的剪影叠在一起。中、远两对留着，框住殿，不框人
    for (let i = 1; i < 3; i++) {
      for (const side of [-1, 1]) {
        // 近的一对往外让：立绘站在画面三成和七成处，那一对柱子原来正好戳在两个人身上，
        // 而金碧板里主角的主调也是石青，人和柱同色同位，剪影就糊了（E2 的叠合检查）
        const cx = side * (1.66 + (i === 0 ? 0.52 : 0) + i * 0.14), cz = -0.7 - i * 2.3;
        // 水墨版柱子按远近退墨：近浓、中重、远淡。金碧版三对都是石青——那是「规定好的」，不分远近
        const colTone: Tone = ink ? (["dark", "dark", "mid"] as const)[i]! : "dark";
        // 柱子加高到 6.7：横梁抬上去了（见下），柱子要够得着它
        this.put(g, new THREE.CylinderGeometry(0.15 - i * 0.01, 0.185 - i * 0.01, 6.7, 8), colTone,
          [cx, 3.35, cz], { lineW: LINE_W * (1.1 - i * 0.1) });
        // 柱础：一块方石。唐代的柱子不是直接插进地里的，有没有这一块，像不像唐差很多
        this.put(g, new THREE.BoxGeometry(0.46, 0.16, 0.46), ink ? "pale" : "light",
          [cx, ink ? 0.08 : 0.24, cz], { lineW: LINE_W * 0.6 });
        if (ink && i === 1) this.pool(g, cx, cz, 0.5);
      }
    }
    // 横梁：赭石，压在画面顶上，是「天」与「人」的分界
    // 水墨版退到淡墨：仰视下它压在画面最顶上，重墨的一根横梁成了一道黑框（E6 截图上看出来的）
    // E8（R-017 第 1、6 条）：横梁原来在 y 5.3，竖屏里正好横在两个人头顶，把上半屏切成两块、把留白切碎。
    // 抬到 6.6、挪到中间那对柱子上：它退到画面最上沿、状态条后面，是框，不是一刀
    this.put(g, new THREE.BoxGeometry(4.4, 0.36, 0.45), ink ? "light" : "mid", [0, 6.6, -3.0], { lineW: LINE_W * 0.6 });
    // 檐下帷幔：石绿，只有这一条。石绿在这套画面里只占这么多
    this.put(g, new THREE.BoxGeometry(3.4, 0.32, 0.07), ink ? "pale" : "light", [0, 6.2, -3.2], { lineW: LINE_W * 0.6 });
    // 匾：泥金，全画面唯一的泥金，小、远、高。它是点，不是面
    this.put(g, new THREE.BoxGeometry(1.15, 0.42, 0.1), "pale", [0.1, 3.95, -7.6]);
    // 素屏风：绢底不参加光照，是这一幕的留白与无字碑母题。
    // 第二幕起换成她带进来的那一扇墨屏（D-010 第 3 条：画面里出现一个水墨元素，只有一个，要显眼）
    this.put(g, new THREE.BoxGeometry(2.5, 1.95, 0.08), act2 ? "wash" : "flat", [-1.15, 1.05, -4.3], { ry: 0.2 });
    if (act2) {
      // 她写在屏上的两笔：远看是一个记号，不是一段文字
      this.put(g, new THREE.BoxGeometry(0.78, 0.06, 0.02), "line", [-1.3, 1.5, -4.2], { ry: 0.2, lineW: LINE_W * 0.5 });
      this.put(g, new THREE.BoxGeometry(0.52, 0.06, 0.02), "line", [-1.42, 1.3, -4.23], { ry: 0.2, lineW: LINE_W * 0.5 });
    }
    // 那匹马：试才的马，第一章的象征，也是焦点。站在素屏风前面，最重的一块贴着最亮的一块
    // 只属于第一章：幕 1、金碧、没有布置（布置那一条走 bare，切布置时不重搭）。
    // 原来无条件画，于是第二章 14 场太后与宋蕙贞谈披帛、
    // 第三章公议、第四章她登基后回到这座殿，殿里都还站着那匹试骑的马（E5 对 C-12 时发现）
    // 马挪到两个人中间（E8）：原来在右边，正好被右边那个人整个挡住，只露出几条腿，像她脚下踩着一只蓝色的东西
    const horse = d.palette === "gold" && d.act === 1 ? this.horse(-0.45, 0, -3.1, 0.6) : undefined;
    if (horse) g.add(horse);                  // 马的线在 horse() 里加粗过：粗线归主体
    const lights: THREE.Light[] = [];
    if (ink) {
      // 马的位置换成一张低案：第四章 01「自己落这一笔」。案上一张纸、一支笔横在纸边——
      // 纸是全画面最亮的一小块，线最重，视线落它。笔没有落下去，那一笔归玩家
      this.put(g, new THREE.BoxGeometry(1.7, 0.08, 0.72), "mid", [0.55, 0.5, -2.2], { ry: -0.12, lineW: LINE_W * 0.9 });
      this.put(g, new THREE.BoxGeometry(1.56, 0.4, 0.06), "mid", [0.55, 0.27, -1.86], { ry: -0.12, lineW: LINE_W * 0.5 });
      this.put(g, new THREE.BoxGeometry(0.62, 0.02, 0.44), "flat", [0.36, 0.555, -2.18], { ry: -0.2, lineW: LINE_W * 1.4 });
      this.put(g, new THREE.CylinderGeometry(0.018, 0.018, 0.5, 5), "line", [0.86, 0.57, -2.02],
        { rz: Math.PI / 2, ry: -0.5, lineW: LINE_W * 0.4 });
      this.pool(g, 0.55, -2.2, 1.1);
      this.pool(g, -1.15, -4.3, 1.2, "pale");
      if (night) {
        // 灯：案角一盏小油灯，比书阁那盏矮一截、盏小一圈。火是一枚纸色的亮片，歪着
        this.put(g, new THREE.CylinderGeometry(0.02, 0.035, 0.34, 6), "line", [1.18, 0.71, -2.3], { lineW: LINE_W * 0.45 });
        this.put(g, new THREE.CylinderGeometry(0.09, 0.05, 0.05, 8), "line", [1.18, 0.9, -2.3], { lineW: LINE_W * 0.55 });
        this.put(g, new THREE.ConeGeometry(0.028, 0.1, 6), "paper", [1.19, 0.97, -2.3], { rz: -0.2, lineW: 0, unlit: true });
        // 夜里补一面清墨的后墙：不补的话柱子后面就是夜纸，远近没了
        this.put(g, new THREE.BoxGeometry(12, 7, 0.15), "pale", [0, 3.5, -8.4], { lineW: 0, unlit: true });
        // 光近乎白、够不着柱子：暖光打到近处那根浓墨柱上，染出一道赭色，那是色板外的颜色
        const lamp = new THREE.PointLight(0xfff2e2, 3.0, 1.9, 1.8);
        lamp.position.set(1.18, 1.05, -2.1);
        lights.push(new THREE.HemisphereLight(0xffffff, 0x555555, 0.3), lamp);
      } else {
        const sun = new THREE.DirectionalLight(0xffffff, 0.62);
        sun.position.set(3.2, 8, 4);
        lights.push(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.92), sun);
      }
    }
    // 公议那一天：柱列之间摆开两排案，右侧抬出收封簿
    const dress = this.gongyi(0.95, [[1.5, 1.0], [-1.9, 1.7]], [-1.45, 0.3]);
    dress.position.set(0.1, 0, 0);
    dress.visible = false;
    g.add(dress);
    if (!ink) {
      const sun = new THREE.DirectionalLight(0xffffff, 1.05);
      sun.position.set(3.2, 8, 4);          // position 是只读属性，只能 set，不能整个换
      lights.push(new THREE.HemisphereLight(0xffffff, 0x777777, 0.42), sun);
    }
    return {
      group: g,
      dress,
      bare: horse,
      night,
      camFrom: new THREE.Vector3(0.92, 1.18, 7.4),
      camTo: new THREE.Vector3(0.8, 1.1, 5.6),
      lookAt: new THREE.Vector3(-0.35, 3.2, -2.2),     // 仰视且偏轴：机位在右、看点在左，柱列就不对称了
      fitWidth: 5.0,
      fitHeight: 6.4,
      lights,
    };
  }

  private horse(x: number, y: number, z: number, s: number): THREE.Group {
    const h = new THREE.Group();
    // 唐马的比例：身子长、胸厚、腿短。第一版是个方盒子加一根斜脖子，剪影认不出是马
    const body = this.mesh(new THREE.BoxGeometry(2.3, 0.92, 0.86), "dark", LINE_W * 1.3);
    body.position.set(0, 1.42, 0);
    h.add(body);
    const chest = this.mesh(new THREE.BoxGeometry(0.7, 0.78, 0.82), "dark", LINE_W * 1.3);
    chest.position.set(0.98, 1.62, 0);
    h.add(chest);
    const neck = this.mesh(new THREE.BoxGeometry(0.52, 1.15, 0.52), "dark", LINE_W * 1.3);
    neck.position.set(1.28, 2.28, 0);
    neck.rotation.z = -0.38;
    h.add(neck);
    const head = this.mesh(new THREE.BoxGeometry(0.78, 0.36, 0.38), "dark", LINE_W * 1.3);
    head.position.set(1.86, 2.72, 0);
    head.rotation.z = -0.32;
    h.add(head);
    // 前腿直，后腿屈：站着也有重心，不是四根一样的棍
    for (const [lx, lz, len, rot] of [
      [-0.86, -0.3, 1.06, 0.16], [-0.86, 0.3, 1.06, 0.16],
      [0.86, -0.3, 1.12, -0.04], [0.86, 0.3, 1.12, -0.04],
    ] as const) {
      const leg = this.mesh(new THREE.CylinderGeometry(0.1, 0.085, len, 6), "dark");
      leg.position.set(lx, len / 2, lz);
      leg.rotation.z = rot;
      h.add(leg);
    }
    const tail = this.mesh(new THREE.ConeGeometry(0.14, 0.95, 6), "line");
    tail.position.set(-1.3, 1.2, 0);
    tail.rotation.z = 1.35;
    h.add(tail);
    const mane = this.mesh(new THREE.BoxGeometry(0.62, 0.14, 0.18), "line");
    mane.position.set(1.35, 2.72, 0);
    mane.rotation.z = -0.38;
    h.add(mane);
    h.position.set(x, y, z);
    h.scale.setScalar(s);
    h.rotation.y = 0.42;
    return h;
  }

  /**
   * 秘书省书阁。数据里它既出现在金碧（公务、势均力敌的对谈），也出现在水墨（夜里她一个人），
   * 所以这个场景按色板分两种光：
   *   金碧 → 午后斜光穿窗棂（scene.md 的原设定）
   *   水墨 → 夜，一盏灯
   * 无字碑母题：案上摊开未写的笺。
   *
   * 第一版这里最空：墙和地都用了 flat，而 flat 就是底色，于是整屏只剩几件浮着的家具。
   * 这一版把墙拆成窗框本身——窗棂围出的那块空是留白，不是漏画。
   */
  private buildShuge(d: SceneDescriptor): Built {
    const night = d.palette === "ink";
    const act2 = d.palette === "gold" && d.act >= 2;
    this.useRamp(night ? [0.26, 0.66, 1.0] : [0.5, 0.78, 1.0]);
    const g = new THREE.Group();
    this.night = night;   // hex("flat") 要用，所以先设
    // 直棂窗：一整扇，框把那块空围起来。窗内是纸色，白天是光，夜里是月
    this.put(g, new THREE.BoxGeometry(3.5, 2.5, 0.05), "flat", [-0.45, 2.72, -3.06], { lineW: 0 });
    this.put(g, new THREE.BoxGeometry(3.7, 0.16, 0.16), "mid", [-0.45, 4.02, -3.0], { lineW: LINE_W * 0.7 });
    this.put(g, new THREE.BoxGeometry(3.7, 0.16, 0.16), "mid", [-0.45, 1.44, -3.0], { lineW: LINE_W * 0.7 });
    for (const s2 of [-1, 1]) {
      this.put(g, new THREE.BoxGeometry(0.16, 2.7, 0.16), "mid", [-0.45 + s2 * 1.77, 2.73, -3.0], { lineW: LINE_W * 0.7 });
    }
    for (let i = -3; i <= 3; i++) {
      this.put(g, new THREE.BoxGeometry(0.06, 2.4, 0.09), "dark", [-0.45 + i * 0.45, 2.73, -3.0], { lineW: LINE_W * 0.4 });
    }
    // 书架：最重的块面，退到右后
    this.put(g, new THREE.BoxGeometry(1.5, 2.45, 0.42), "dark", [2.35, 1.22, -2.5], { lineW: LINE_W * 0.8 });
    this.put(g, new THREE.BoxGeometry(1.5, 0.09, 0.42), "line", [2.35, 1.72, -2.48], { lineW: LINE_W * 0.4 });
    this.put(g, new THREE.BoxGeometry(1.5, 0.09, 0.42), "line", [2.35, 0.92, -2.48], { lineW: LINE_W * 0.4 });
    // 案：放大一圈往前挪。E1 那一版的案坐不下两个人，而这一场是「势均力敌的对谈」
    this.put(g, new THREE.BoxGeometry(2.9, 0.12, 1.15), "mid", [-0.15, 0.84, -1.05], { lineW: LINE_W * 0.9 });
    for (const [lx, lz] of [[-1.32, -1.5], [1.06, -1.5], [-1.32, -0.6], [1.06, -0.6]] as const) {
      this.put(g, new THREE.BoxGeometry(0.1, 0.78, 0.1), "mid", [lx, 0.39, lz], { lineW: LINE_W * 0.6 });
    }
    // 摊开未写的笺：案上一张纸色薄片，压着一方小镇纸。本场的无字碑母题，线加重，视线落它
    this.put(g, new THREE.BoxGeometry(0.9, 0.02, 0.62), "flat", [-0.58, 0.91, -0.95], { ry: -0.14, lineW: LINE_W * 1.3 });
    this.put(g, new THREE.BoxGeometry(0.2, 0.07, 0.11), "line", [-0.2, 0.95, -1.18], { lineW: LINE_W * 0.5 });
    // 一叠书
    this.put(g, new THREE.BoxGeometry(0.62, 0.26, 0.44), "dark", [0.78, 1.03, -1.1], { ry: 0.25, lineW: LINE_W * 0.8 });
    // 近物：一只书箱压住画面下沿
    this.put(g, new THREE.BoxGeometry(0.9, 0.62, 0.62), "mid", [-1.55, 0.31, 1.6], { ry: 0.3, lineW: LINE_W * 1.2 });
    this.put(g, new THREE.BoxGeometry(0.92, 0.07, 0.64), "line", [-1.55, 0.5, 1.6], { ry: 0.3, lineW: LINE_W * 0.7 });
    const lights: THREE.Light[] = [new THREE.HemisphereLight(0xffffff, 0x666666, night ? 0.42 : 0.52)];
    if (night) {
      // 夜里补一面淡到几乎没有的后墙：清墨。E1 那一版五级墨色里清墨一档空着，画面少一层远
      this.put(g, new THREE.BoxGeometry(9, 4.6, 0.15), "pale", [-0.4, 2.3, -3.9],
        { lineW: LINE_W * 0.3, unlit: true });
      // 唐式油灯：细灯柱，上托一只浅盏，盏里一点火。火不发光晕，只是一枚亮片，歪着——那是全场唯一将动未动的地方
      this.put(g, new THREE.CylinderGeometry(0.03, 0.05, 0.9, 6), "line", [0.5, 1.36, -1.15], { lineW: LINE_W * 0.5 });
      this.put(g, new THREE.CylinderGeometry(0.14, 0.16, 0.05, 8), "line", [0.5, 0.94, -1.15], { lineW: LINE_W * 0.6 });
      this.put(g, new THREE.CylinderGeometry(0.14, 0.08, 0.07, 8), "line", [0.5, 1.83, -1.15], { lineW: LINE_W * 0.6 });
      this.put(g, new THREE.ConeGeometry(0.04, 0.14, 6), "paper", [0.52, 1.93, -1.15], { rz: -0.22, lineW: 0, unlit: true });
      const lamp = new THREE.PointLight(0xffe0b0, 5, 5, 1.6);
      lamp.position.set(0.5, 1.95, -1.1);
      lights.push(lamp);
      this.pool(g, -0.2, -1.0, 1.2);
      this.pool(g, 2.35, -2.5, 0.8);
    } else {
      // 午后斜光：从窗那一侧斜进来
      const sun = new THREE.DirectionalLight(0xffffff, 1.0);
      sun.position.set(-3.5, 6, -2.2);
      lights.push(sun);
      // 金碧场景不洇墨，地上铺一领席：只在案的下面，不铺满
      this.put(g, new THREE.BoxGeometry(4.2, 0.06, 3.0), "light", [-0.1, 0.03, -1.0], { lineW: LINE_W * 0.5 });
      this.put(g, new THREE.BoxGeometry(4.34, 0.03, 0.07), "line", [-0.1, 0.07, 0.45], { lineW: 0 });
      // 光柱：窗棂切出来的四道斜光，落在席上和案上。不参加光照，就是纸色的四片。
      // 「光柱里有浮尘」这一场的情绪全在它身上，E1 那一版一道光都没有，所以只有 61 分
      for (let i = 0; i < 5; i++) {
        this.put(g, new THREE.BoxGeometry(0.2, 0.02, 4.2), "paper",
          [-1.7 + i * 0.56, 0.08, -0.6], { ry: -0.26, lineW: 0, unlit: true });
      }
      this.put(g, new THREE.BoxGeometry(0.42, 0.02, 1.0), "paper", [-0.62, 0.91, -1.0], { ry: -0.3, lineW: 0, unlit: true });
      // 左侧一扇屏：把空得过头的左边填上。金碧的语义是满，E1 那一版留白 73.6% 太空了
      this.put(g, new THREE.BoxGeometry(1.5, 2.3, 0.08), act2 ? "wash" : "mid", [-2.65, 1.15, -1.9], { ry: 0.5, lineW: LINE_W * 0.8 });
      if (act2) {
        // 第二幕：她写的字上了屏。墨色，三笔，是整屏唯一的水墨元素
        for (const [i, h2] of [[0, 1.2], [1, 0.9], [2, 1.05]] as const) {
          this.put(g, new THREE.BoxGeometry(0.08, h2, 0.03), "line",
            [-2.9 + i * 0.26, 1.35 - i * 0.05, -1.75], { ry: 0.5, lineW: LINE_W * 0.4 });
        }
      }
      // 案上一只泥金小盒：金碧板唯一的泥金，那个点
      this.put(g, new THREE.BoxGeometry(0.28, 0.15, 0.22), "pale", [0.2, 0.97, -0.8], { ry: 0.2, lineW: LINE_W * 0.6 });
    }
    return {
      group: g,
      camFrom: new THREE.Vector3(0.38, 1.95, 5.3),
      camTo: new THREE.Vector3(0.3, 1.85, 4.0),
      lookAt: new THREE.Vector3(-0.2, 1.62, -1.9),
      fitWidth: 4.2,
      fitHeight: 5.0,
      night,
      lights,
    };
  }

  /**
   * 女冠观。水墨，阴天漫射几乎没有影子，平视稍远。情绪：自由、脱离、松弛。
   * 无字碑母题：幡杆上垂下来的空白符纸，也是画面里唯一「将动未动」的东西。
   *
   * 松弛靠三样：横线多于竖线、所有块面都矮、天占一半以上。
   * 漫射光用几乎平的 ramp，没有方向，所以没有一处在逼人——
   * negative.md 那条「不要让画面显得苦」，靠的就是这一场和诗社。
   */
  private buildNvguan(_d: SceneDescriptor): Built {
    // 夜雨（第三章 10 场，夜谈三）：同一座观，换成夜里下雨，檐下一盏灯。
    // 白天那一版是「自由、脱离、松弛」；夜雨这一版是「两个人待在同一个檐下」，
    // 所以只改光与一盏灯，不改一件几何——地方没变，是时候变了
    const rain = this.dressing === "yeyu";
    this.useRamp(rain ? [0.3, 0.62, 1.0] : [0.72, 0.87, 1.0]);
    const g = new THREE.Group();
    this.night = rain;
    // 远山：两片不参加光照的淡墨，左高右低，中间让开观的位置
    this.put(g, new THREE.BoxGeometry(4.8, 1.0, 0.3), "pale", [-4.6, 0.4, -13],
      { rz: 0.05, lineW: LINE_W * 0.3, unlit: true });
    this.put(g, new THREE.BoxGeometry(3.4, 0.6, 0.3), "pale", [4.2, 0.2, -14],
      { rz: -0.04, lineW: LINE_W * 0.28, unlit: true });
    // 观。**全场只有屋顶是重的**，台基、柱、松冠一律压到淡墨——
    // E1 那一版清墨 6.9 / 淡墨 6.7 / 焦墨 6.5 / 浓墨 4.4 四色平分，是 rubric 第 6 条的「差」档
    this.put(g, new THREE.BoxGeometry(5.8, 0.3, 2.6), "light", [0, 0.15, -4.6], { lineW: LINE_W * 0.6 });
    for (const x of [-2.3, -0.7, 0.9, 2.3]) {
      this.put(g, new THREE.CylinderGeometry(0.11, 0.13, 2.9, 6), "light", [x, 1.75, -3.6], { lineW: LINE_W * 0.6 });
    }
    // E8：柱子加高到 2.9、屋顶抬到 3.75。整屏里人站上去，原来的檐口正好在人头那条线上，人像顶着屋檐站着
    this.roof(g, 6.6, 3.4, 0.95, [0, 3.75, -3.7]);
    // 门内一片空：纸色。观里没有人，也没有神像
    this.put(g, new THREE.BoxGeometry(1.5, 2.2, 0.06), "flat", [0.1, 1.4, -4.5], { lineW: LINE_W * 0.7 });
    // 幡杆与空白符纸：符纸垂在屋檐前面，纸色压在最重的那条黑线上，线再加重，一眼就看见它
    // 幡杆挪到右边那个人外侧，原来一根黑线正好竖着穿过她
    this.put(g, new THREE.CylinderGeometry(0.05, 0.06, 5.2, 6), "line", [2.95, 2.6, -2.2], { lineW: LINE_W * 0.45 });
    this.put(g, new THREE.BoxGeometry(0.34, 2.0, 0.03), "flat", [3.14, 3.1, -2.2], { rz: -0.04, lineW: LINE_W * 1.4 });
    // 松：两片长而软的冠，与柱同一级淡墨
    this.put(g, new THREE.CylinderGeometry(0.08, 0.12, 2.6, 6), "line", [-2.05, 1.3, -1.2], { lineW: LINE_W * 0.5 });
    this.canopy(g, 2.1, 1.1, 0.32, [-2.3, 2.7, -1.3], "light", 0.05);
    this.canopy(g, 1.4, 0.85, 0.26, [-1.78, 3.06, -1.6], "light", -0.05);
    // 近物：一只三足香炉压住画面下沿，偏左。它和屋顶是画面上仅有的两块重的
    this.put(g, new THREE.CylinderGeometry(0.34, 0.38, 0.56, 8), "mid", [-1.05, 0.62, 1.6], { lineW: LINE_W * 1.2 });
    this.put(g, new THREE.CylinderGeometry(0.42, 0.42, 0.05, 8), "mid", [-1.05, 0.93, 1.6], { lineW: LINE_W * 0.8 });
    for (const a2 of [0.4, 2.5, 4.6]) {
      this.put(g, new THREE.CylinderGeometry(0.05, 0.05, 0.36, 5), "line",
        [-1.05 + Math.cos(a2) * 0.26, 0.18, 1.6 + Math.sin(a2) * 0.26], { lineW: LINE_W * 0.5 });
    }
    this.pool(g, -1.05, 1.6, 0.7);
    this.pool(g, 0, -4.4, 2.6);
    // 开课（第四章 11—13）：观前空地铺三领席、门前一张讲案，松与一根竹竿之间拉一道绳晾纸。
    // 照公议的办法常驻、只切 visible——同一座观，是有人付了一个月场租的那几天。
    // 席横、矮，和这座观「横线多、块面矮」的松弛是一路，不把这里画成学堂的规矩样
    const dress = new THREE.Group();
    for (const [x, z] of [[-0.95, -1.9], [0.45, -1.9], [-0.25, -0.7]] as const) {
      this.put(dress, new THREE.BoxGeometry(1.15, 0.04, 0.62), "light", [x, 0.02, z], { lineW: LINE_W * 0.4 });
    }
    // 讲案：门前正中，案上一叠摊开的经折册，纸色
    this.put(dress, new THREE.BoxGeometry(1.25, 0.08, 0.5), "mid", [0.1, 0.44, -3.0], { lineW: LINE_W * 0.7 });
    this.put(dress, new THREE.BoxGeometry(1.1, 0.4, 0.05), "mid", [0.1, 0.22, -2.78], { lineW: LINE_W * 0.4 });
    this.put(dress, new THREE.BoxGeometry(0.46, 0.03, 0.32), "flat", [-0.05, 0.5, -3.0], { ry: 0.1, lineW: LINE_W * 1.1 });
    // 晾纸：竿、绳、三张纸。纸是纸色的空页——温荞自己槽里出的纸，还没有字
    this.put(dress, new THREE.CylinderGeometry(0.03, 0.04, 2.3, 5), "line", [-0.55, 1.15, -1.25], { lineW: LINE_W * 0.4 });
    this.put(dress, new THREE.BoxGeometry(1.5, 0.018, 0.018), "line", [-1.3, 2.18, -1.22], { lineW: 0 });
    for (const [x, h, rz] of [[-1.78, 0.46, 0.03], [-1.3, 0.38, -0.05], [-0.86, 0.44, 0.02]] as const) {
      this.put(dress, new THREE.BoxGeometry(0.32, h, 0.012), "flat", [x, 2.17 - h / 2, -1.2], { rz, lineW: LINE_W * 0.7 });
    }
    dress.visible = false;
    g.add(dress);
    const lights: THREE.Light[] = rain
      ? [new THREE.HemisphereLight(0xffffff, 0x555555, 0.34)]
      : [new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 1.12)];
    if (rain) {
      // 檐下一盏灯：挂在屋檐前沿偏右，正好在符纸那一侧。雨夜里全场只有这一点亮
      this.put(g, new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), "line", [1.25, 3.08, -2.6], { lineW: LINE_W * 0.4 });
      this.put(g, new THREE.BoxGeometry(0.34, 0.42, 0.34), "paper", [1.25, 2.62, -2.6], { lineW: LINE_W * 1.1, unlit: true });
      const lamp = new THREE.PointLight(0xffe0b0, 4.2, 6, 1.7);
      lamp.position.set(1.25, 2.62, -2.4);
      lights.push(lamp);
    }
    return {
      group: g,
      dress,
      dressOn: ["kaike"],
      night: rain,
      lights,
      camFrom: new THREE.Vector3(0.35, 2.05, 7.0),
      camTo: new THREE.Vector3(0.25, 1.98, 5.6),
      lookAt: new THREE.Vector3(0.1, 2.95, -3.6),      // 平视稍远：机位与看点几乎等高
      fitWidth: 6.4,        // E1 是 7.4，观缩成了画面中段一条窄带
      fitHeight: 5.2,
    };
  }

  /**
   * 诗社水榭。水墨，黄昏水面反光，轻俯视。情绪：结盟、才华、愉悦。
   * 无字碑母题：案上未题字的团扇。
   *
   * 水不画：水面就是纸，只用远岸一线和三片荷叶点出它在那儿。
   * 柳条从左上垂进画面，是全场唯一将动未动的东西（rubric 第 10 条）。
   */
  private buildShishe(_d: SceneDescriptor): Built {
    this.useRamp([0.36, 0.73, 1.0]);      // 黄昏：一侧亮一侧暗，分得开
    const g = new THREE.Group();
    // 远岸一线：水就到这里为止
    this.put(g, new THREE.BoxGeometry(14, 0.26, 0.36), "pale", [-0.5, 0.13, -9], { lineW: LINE_W * 0.3, unlit: true });
    // 水不画，只用几道横纹点出它在那儿。不参加光照，所以它们是纸上的几笔，不是地上的板
    for (const [x, z, w] of [[-2.6, 2.2, 2.6], [2.4, 1.2, 1.8], [-3.4, -1.6, 2.2], [3.0, -3.4, 1.6],
      [-1.2, 3.6, 3.0]] as const) {
      this.put(g, new THREE.BoxGeometry(w, 0.02, 0.05), "pale", [x, 0.02, z], { lineW: 0, unlit: true });
    }
    // 榭台：偏右下，不居中
    this.put(g, new THREE.BoxGeometry(4.3, 0.22, 3.2), "light", [0.85, 0.52, -0.9]);
    for (const [x, z] of [[-0.95, 0.35], [2.65, 0.35], [-0.95, -2.15], [2.65, -2.15]] as const) {
      this.put(g, new THREE.CylinderGeometry(0.09, 0.11, 0.5, 6), "mid", [x, 0.2, z], { lineW: LINE_W * 0.55 });
    }
    // 栏：两道横杆加望柱。横线多，所以松
    for (const [x, z, w, ry] of [[0.85, 0.62, 4.2, 0], [2.9, -0.9, 3.1, Math.PI / 2]] as const) {
      this.put(g, new THREE.BoxGeometry(w, 0.06, 0.06), "mid", [x, 0.94, z], { ry, lineW: LINE_W * 0.5 });
      this.put(g, new THREE.BoxGeometry(w, 0.06, 0.06), "mid", [x, 0.72, z], { ry, lineW: LINE_W * 0.45 });
    }
    for (const x of [-0.9, 0.25, 1.4, 2.55]) {
      this.put(g, new THREE.BoxGeometry(0.08, 0.44, 0.08), "mid", [x, 0.76, 0.62], { lineW: LINE_W * 0.45 });
    }
    // 柱与一面坡顶：顶是最重的一块，斜着切过右上
    for (const [x, z] of [[-0.6, 0.1], [2.3, 0.1], [-0.6, -1.9], [2.3, -1.9]] as const) {
      this.put(g, new THREE.CylinderGeometry(0.1, 0.12, 2.7, 6), "mid", [x, 1.97, z], { lineW: LINE_W * 0.7 });
    }
    // E8：柱子 2.0 → 2.7、顶 2.75 → 3.45，檐口离开人头（和女冠观同一个毛病）
    this.roof(g, 5.0, 3.4, 0.8, [0.85, 3.45, -0.85]);
    // 低案与未题字的团扇：团扇是一枚纸色圆片，斜搁着。焦点
    this.put(g, new THREE.BoxGeometry(1.15, 0.07, 0.7), "mid", [0.72, 0.7, -1.05]);
    this.put(g, new THREE.CylinderGeometry(0.3, 0.3, 0.025, 14), "flat", [0.56, 0.76, -1.0], { rz: 0.1, ry: 0.35 });
    this.put(g, new THREE.BoxGeometry(0.34, 0.035, 0.035), "line", [0.88, 0.76, -0.79], { ry: 0.35, lineW: LINE_W * 0.45 });
    // 荷叶：三片淡墨圆片，铺在水上，不规则。也是近处的「地」
    for (const [x, z, r] of [[-1.9, 1.4, 0.36], [-2.5, -0.4, 0.28], [-1.4, -2.2, 0.24]] as const) {
      this.put(g, new THREE.CylinderGeometry(r, r, 0.025, 8), "light", [x, 0.03, z], { lineW: LINE_W * 0.45 });
    }
    // 柳：干在画外，四条长垂枝从左上进来
    this.put(g, new THREE.CylinderGeometry(0.09, 0.13, 2.6, 6), "mid", [-2.7, 1.9, 0.6], { rz: 0.12, lineW: LINE_W * 0.6 });
    for (const [i, rz] of [[0, 0.09], [1, 0.03], [2, -0.05], [3, -0.12]] as const) {
      this.put(g, new THREE.BoxGeometry(0.045, 2.1 - i * 0.22, 0.045), "line",
        [-2.4 + i * 0.3, 2.3 - i * 0.12, 0.5 + i * 0.08], { rz, lineW: LINE_W * 0.35 });
    }
    this.pool(g, 0.85, -0.9, 1.6);
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(-6, 2.2, 3);         // 黄昏的光是横着来的
    return {
      group: g,
      camFrom: new THREE.Vector3(-0.45, 4.3, 9.2),
      camTo: new THREE.Vector3(-0.35, 4.05, 7.9),
      lookAt: new THREE.Vector3(0.75, 0.95, -1.6),     // 轻俯视：看点比机位低三米
      fitWidth: 8.0,
      fitHeight: 4.8,
      lights: [new THREE.HemisphereLight(0xffffff, 0x888888, 0.5), sun],
    };
  }

  /**
   * 御花园夜。水墨夜景，近景平视，月光冷只见轮廓。情绪：亲密、私语、无用时刻。
   * 无字碑母题：曲栏当中缺一根望柱——「只余一线」。
   *
   * 夜景的做法见 palette.md：不反色，把主体推到焦墨、底色换成夜纸色。
   * 月亮是一枚平涂的圆片，不描边、不发光（negative.md 禁一切发光）。
   */
  private buildYuanye(_d: SceneDescriptor): Built {
    this.useRamp([0.2, 0.58, 1.0]);       // 月光：对比最狠，只剩轮廓
    const g = new THREE.Group();
    // 远处宫墙：一条线，提醒这里仍在宫里
    this.put(g, new THREE.BoxGeometry(13, 0.4, 0.3), "mid", [0, 0.28, -8], { lineW: LINE_W * 0.35 });
    // 月：推到右上角，小一圈。E1 那一版它和灯、栏的豁口三处抢焦点，谁也不是落点
    this.put(g, new THREE.CylinderGeometry(0.34, 0.34, 0.02, 16), "paper", [1.62, 5.15, -7.4],
      { rx: Math.PI / 2, lineW: 0, unlit: true });
    // 近景曲栏：横过画面下方，焦墨。当中缺一根望柱，那个豁口就是留空的那一线
    // E8：曲栏原来在 z 0.4，比人站的地方还近——该挡住腿的栏杆画在了腿后面（立绘是叠在画布上的）。挪到人身后
    this.put(g, new THREE.BoxGeometry(4.6, 0.08, 0.1), "line", [0.15, 1.02, -1.5], { lineW: LINE_W * 1.0 });
    this.put(g, new THREE.BoxGeometry(4.6, 0.08, 0.1), "line", [0.15, 0.72, -1.5], { lineW: LINE_W * 0.85 });
    for (const x of [-1.95, -1.15, -0.35, 1.25, 2.05]) {    // 0.45 那一根故意不放
      this.put(g, new THREE.BoxGeometry(0.11, 0.62, 0.11), "line", [x, 0.71, -1.5], { lineW: LINE_W * 0.7 });
    }
    // 太湖石：三块叠着，转着放，右后方的重量
    this.put(g, new THREE.BoxGeometry(1.0, 0.7, 0.8), "mid", [1.9, 0.36, -2.4], { ry: 0.5, rz: 0.3, lineW: LINE_W * 0.8 });
    this.put(g, new THREE.BoxGeometry(0.6, 0.85, 0.6), "mid", [2.2, 0.95, -2.15], { ry: -0.5, rz: -0.42, lineW: LINE_W * 0.8 });
    this.put(g, new THREE.BoxGeometry(0.42, 0.44, 0.42), "dark", [1.62, 0.92, -2.65], { ry: 0.9, rz: 0.55, lineW: LINE_W * 0.8 });
    // 海棠：干要看得见。E1 那一版干被栏挡住又偏出了画面，只剩三根悬空的斜棒，读不出是一株树
    // E8：枝原来和干不相接——干往左歪、枝从右边半空里长出来，整屏截图上就是三根悬在空中的黑棍和几个灰点。
    // 现在干往右歪，三根枝都从干上的一点起笔，花点落在枝梢
    const tx = (y: number) => -1.35 + (y - 1.6) * 0.16;
    this.put(g, new THREE.CylinderGeometry(0.08, 0.14, 3.2, 6), "line", [-1.35, 1.6, -0.9], { rz: -0.16, lineW: LINE_W * 0.9 });
    for (const [y0, len, rz] of [[2.3, 1.05, 0.5], [2.75, 0.9, 0.95], [3.05, 0.7, 0.2]] as const) {
      const cx = tx(y0) + Math.cos(rz) * len / 2, cy = y0 + Math.sin(rz) * len / 2;
      this.put(g, new THREE.BoxGeometry(len, 0.055, 0.055), "line", [cx, cy, -0.9], { rz, lineW: LINE_W * 0.5 });
      const ex = tx(y0) + Math.cos(rz) * len, ey = y0 + Math.sin(rz) * len;
      this.put(g, new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "pale", [ex + 0.04, ey + 0.06, -0.86],
        { rx: Math.PI / 2, lineW: 0, unlit: true });
    }
    // 一盏地灯：夜里唯一的人工光，压得很低。盏是全画面最亮的一点，视线落在这儿——
    // 这一场是「亲密、私语、无用时刻」，落点该在她们坐着的地方，不在天上
    this.put(g, new THREE.CylinderGeometry(0.11, 0.15, 0.46, 8), "dark", [0.85, 0.23, -0.5], { lineW: LINE_W * 0.7 });
    this.put(g, new THREE.CylinderGeometry(0.19, 0.1, 0.13, 8), "paper", [0.85, 0.53, -0.5], { lineW: LINE_W * 0.8, unlit: true });
    this.pool(g, 1.95, -2.4, 0.95);
    this.pool(g, -1.35, -0.9, 0.6);
    const moon = new THREE.DirectionalLight(0xffffff, 0.85);
    moon.position.set(4, 6, -5);          // 冷光从月亮那边来，所有东西只剩朝月的一面亮
    const lamp = new THREE.PointLight(0xffe0b0, 2.6, 3.0, 1.8);
    lamp.position.set(0.85, 0.6, -0.5);
    return {
      group: g,
      camFrom: new THREE.Vector3(0.08, 1.62, 3.5),
      camTo: new THREE.Vector3(0.05, 1.6, 2.6),
      lookAt: new THREE.Vector3(0.4, 2.1, -2.6),
      fitWidth: 4.4,
      fitHeight: 5.4,
      night: true,
      lights: [new THREE.HemisphereLight(0xffffff, 0x555555, 0.3), moon, lamp],
    };
  }

  /**
   * 含元殿。金碧，极远景大俯视人极小，逆光剪影。情绪：权力、孤高、不可逆。
   * 无字碑母题：近景案上那一卷未展开的诏书。
   *
   * 构图分两层：近处一案一轴（她还没打开的那件事），远处龙尾道一路上去到殿。
   * 逆光把整座殿压成一块石青的剪影，绢底的广场大片留亮，泥金只剩匾上一点。
   * 仪仗是两行很小的块——人极小，这是这一幕的全部意思。
   */
  private buildHanyuan(d: SceneDescriptor): Built {
    // 逆光：朝光的那一面才亮，其余全压下去。受位议决那一场反过来，见下面 shouwei
    this.useRamp(this.dressing === "shouwei" ? [0.62, 0.84, 1.0] : [0.3, 0.62, 1.0]);
    const g = new THREE.Group();
    const act2 = d.palette === "gold" && d.act >= 2;
    // 广场：绢底不参加光照，大片亮。逆光下地面是被照穿的
    this.put(g, new THREE.BoxGeometry(52, 0.2, 44), "flat", [0, -0.1, -8], { lineW: 0 });
    // 殿：台基、殿身、两坡顶。一整块石青的剪影
    this.put(g, new THREE.BoxGeometry(17, 2.4, 8.5), "dark", [0, 1.2, -20], { lineW: LINE_W * 1.4 });
    this.put(g, new THREE.BoxGeometry(12.5, 3.8, 6.0), "dark", [0, 4.3, -20], { lineW: LINE_W * 1.3 });
    this.put(g, new THREE.BoxGeometry(15.5, 0.5, 4.2), "dark", [0, 6.6, -18.6], { rx: -0.26, lineW: LINE_W * 1.3 });
    this.put(g, new THREE.BoxGeometry(15.5, 0.5, 4.2), "dark", [0, 6.6, -21.4], { rx: 0.26, lineW: LINE_W * 1.3 });
    // 匾：泥金，全画面唯一的泥金。它高、小、正中，所以是那个点
    this.put(g, new THREE.BoxGeometry(2.3, 0.8, 0.14), "pale", [0, 4.5, -16.9]);
    // 两阙：侧翼两座小楼，把殿夹住
    for (const side of [-1, 1]) {
      this.put(g, new THREE.BoxGeometry(2.6, 5.4, 2.6), "dark", [side * 11.5, 2.7, -16], { lineW: LINE_W * 1.1 });
      this.put(g, new THREE.BoxGeometry(3.4, 0.4, 3.4), "mid", [side * 11.5, 5.7, -16], { lineW: LINE_W * 0.9 });
    }
    // 龙尾道：一条长坡从近处上去到台基，赭石。她要走的那条线
    this.put(g, new THREE.BoxGeometry(3.6, 0.3, 15), "mid", [0, 1.2, -9.5], { rx: 0.152 });
    for (const side of [-1, 1]) {
      this.put(g, new THREE.BoxGeometry(0.22, 0.5, 15), "light", [side * 1.85, 1.45, -9.5], { rx: 0.152, lineW: LINE_W * 0.6 });
    }
    // 仪仗：两行很小的块，沿坡上去。人在这座殿前就是这个尺寸
    for (let i = 0; i < 5; i++) {
      for (const side of [-1, 1]) {
        this.put(g, new THREE.BoxGeometry(0.26, 0.72, 0.26), "mid",
          [side * 2.9, 0.5 + i * 0.36, -3.6 - i * 2.4], { lineW: LINE_W * 0.35 });
      }
    }
    // 近景：一案，一卷未展开的诏书，两枚轴头。近大远小，所以这一卷比整座殿显眼
    this.put(g, new THREE.BoxGeometry(2.6, 0.14, 1.3), "mid", [-2.4, 0.92, 6.2], { ry: 0.12 });
    for (const [lx, lz] of [[-3.4, 5.7], [-1.4, 5.7], [-3.4, 6.7], [-1.4, 6.7]] as const) {
      this.put(g, new THREE.BoxGeometry(0.12, 0.9, 0.12), "mid", [lx, 0.45, lz], { lineW: LINE_W * 0.7 });
    }
    this.put(g, new THREE.CylinderGeometry(0.17, 0.17, 1.5, 10), "flat", [-2.5, 1.08, 6.1], { rz: Math.PI / 2, ry: 0.12 });
    this.put(g, new THREE.CylinderGeometry(0.09, 0.09, 0.16, 8), "pale", [-3.35, 1.08, 6.1], { rz: Math.PI / 2, lineW: LINE_W * 0.5 });
    this.put(g, new THREE.CylinderGeometry(0.09, 0.09, 0.16, 8), "pale", [-1.65, 1.08, 6.1], { rz: Math.PI / 2, lineW: LINE_W * 0.5 });
    if (act2) {
      // 第二幕：案上多一方墨色的砚——她带进来的那一件东西
      this.put(g, new THREE.BoxGeometry(0.42, 0.12, 0.34), "wash", [-1.5, 1.05, 6.6], { ry: 0.12, lineW: LINE_W * 0.6 });
    }
    // 公议那一天：广场上沿龙尾道两侧摆开案，近处抬出收封簿
    const dress = this.gongyi(2.0, [[2.4, 3.6], [-2.6, 5.0]], [-5.6, 3.0]);
    dress.position.set(0, 0, 0);
    dress.visible = false;
    g.add(dress);
    // 逆光：光在殿的背后，环境光压到很低。半球光给多了，朝着相机的那些面会被抬出剪影，
    // 整座殿就变成一块亮蓝的积木——第一版就是那样，一点都不「逆光」。
    //
    // 受位议决那一场（第三章 12）例外：光从**正面顶上**压下来，全场最强，殿不再是剪影。
    // 前面十一场她都在逆光里看着这座殿，这一场殿被照亮了给她看——
    // 也是全游戏唯一一次金碧场景不压暗
    const shouwei = this.dressing === "shouwei";
    const back = new THREE.DirectionalLight(0xffffff, shouwei ? 2.1 : 1.15);
    back.position.set(shouwei ? 1 : -2, shouwei ? 16 : 7, shouwei ? 12 : -30);
    return {
      group: g,
      dress,
      // E8：原来是大俯视（机位 11 米高），场景那一层自评 72，整屏里却是两个巨人站在一张沙盘上——
      // 按相机算，站位上一个真人只该占画面 6%。俯视的场景放不下站着的人，所以机位落到广场上、人眼高，
      // 顺着龙尾道往上看殿。「人极小、殿压人」的意思没丢：现在是仰着看，殿比原来更高
      camFrom: new THREE.Vector3(-0.7, 1.55, 12.6),
      camTo: new THREE.Vector3(-0.6, 1.4, 11.2),
      lookAt: new THREE.Vector3(0.2, 5.2, -14.0),
      fitWidth: 13,
      fitHeight: 12,
      lights: [new THREE.HemisphereLight(0xffffff, 0x444444, shouwei ? 0.5 : 0.14), back],
    };
  }

  /**
   * 无字碑。纯水墨，正视，天占七成，正面平光没有方向。情绪：留白、拒绝被定义、终局。
   * 无字碑母题：碑面本身。全画面只有一枚朱砂印。
   *
   * 这一场是整套美术的落点，所以它比任何一场都空：
   * 碑偏左，右边三分之二什么都没有；碑面是纸色，连石头的质感都不给；
   * 朱砂印在碑面右下，占全屏不到百分之一，视线先到它，再顺着它走进右边的空白。
   */
  private buildWuzibei(d: SceneDescriptor): Built {
    // 碑样（第四章 18，夜谈五）：夜，**碑上没有印**，碑前一块低石上摊一张碑样纸。
    // 那枚印是「无字之碑」结局的记号，而这一场在判定之前、所有路线都经过——
    // 带印的那一版等于把一个玩家未必走得到的结局提前亮给每个人（E5 对 C-12 时发现）。
    // 非登基线也来这里，所以不能是谁的帝陵：石是空的石，纸是一张还没刻的样
    const beiyang = this.dressing === "beiyang";
    this.useRamp(beiyang ? [0.42, 0.72, 1.0] : [0.78, 0.9, 1.0]);   // 平光；夜里拉开一点，石头才立得住
    this.night = beiyang;
    const g = new THREE.Group();
    const x = -1.15;                       // 碑偏左，中心点不落在中央三分之一的框里
    this.pool(g, x, 0.1, 1.5, "pale");
    // 碑座
    this.put(g, new THREE.BoxGeometry(2.7, 0.5, 1.1), "pale", [x, 0.25, 0], { lineW: LINE_W * 1.2 });
    // 碑身：清墨的石头
    this.put(g, new THREE.BoxGeometry(1.78, 4.45, 0.44), "pale", [x, 2.72, 0], { lineW: LINE_W * 1.5 });
    // 碑帽：上窄下宽的四棱台，比碑身出檐两指。
    // E1 那一版是一块等宽的横板，看着像门楣不像碑（自评里「最该改的一条」就是它）
    const cap = this.put(g, new THREE.CylinderGeometry(0.74, 1, 0.44, 4), "pale", [x, 5.1, 0],
      { ry: Math.PI / 4, lineW: LINE_W * 1.4 });
    cap.scale.set(2.02 / 1.414, 1, 0.62 / 1.414);
    // 碑面：纸色，空的。本该有字的地方
    this.put(g, new THREE.BoxGeometry(1.44, 3.95, 0.04), "flat", [x, 2.72, 0.23], { lineW: LINE_W * 0.8 });
    const lights: THREE.Light[] = [];
    if (!beiyang) {
      // 朱砂印：碑面右下角一枚方印。全游戏最小的一个元素，也是最后一个——只属于结局卡那一刻。
      // D-067（CC1 改）：原来是「不写碑样就有印」，默认带着结局的记号。任何一场忘了写布置，
      // 就等于把一个玩家未必走得到的结局提前亮出来。现在反过来：只有布置写明「印」才盖
      if (this.dressing === "yin") {
        this.put(g, new THREE.BoxGeometry(0.26, 0.26, 0.03), d.palette === "gold" ? "pale" : "accent",
          [x + 0.48, 1.32, 0.26], { lineW: 0 });
      }
      lights.push(new THREE.HemisphereLight(0xffffff, 0xcccccc, 1.2));
    } else {
      // 碑前一块低石，石上一张碑样纸，一角翻起（「纸角翻到背面，今夜不命人写满它」）。
      // 纸是全画面最亮的一块：碑面在夜里退到夜纸色，亮的只剩这张没刻的样
      this.put(g, new THREE.BoxGeometry(1.25, 0.32, 0.78), "light", [0.45, 0.16, 1.7], { ry: -0.18, lineW: LINE_W * 0.9 });
      this.put(g, new THREE.BoxGeometry(0.72, 0.02, 0.5), "paper", [0.38, 0.335, 1.72], { ry: -0.08, lineW: LINE_W * 1.3, unlit: true });
      this.put(g, new THREE.BoxGeometry(0.2, 0.02, 0.16), "light", [0.68, 0.37, 1.52], { ry: -0.08, rz: 0.5, lineW: LINE_W * 0.6 });
      // 封着的私册：一小块浓墨，靠在纸边。它和碑是一对，谁都不打开
      this.put(g, new THREE.BoxGeometry(0.3, 0.07, 0.4), "dark", [-0.05, 0.36, 1.78], { ry: 0.3, lineW: LINE_W * 0.6 });
      this.pool(g, 0.45, 1.7, 0.9);
      const moon = new THREE.DirectionalLight(0xffffff, 0.7);
      moon.position.set(-5, 7, 6);         // 光从左前来，碑的右侧面暗下去，石头有了厚
      lights.push(new THREE.HemisphereLight(0xffffff, 0x666666, 0.62), moon);
    }
    return {
      group: g,
      night: beiyang,
      camFrom: new THREE.Vector3(0.1, 3.42, 10.4),
      camTo: new THREE.Vector3(0.08, 3.4, 9.2),
      lookAt: new THREE.Vector3(0.1, 3.4, 0),          // 正视：机位与看点等高
      fitWidth: 6.8,
      fitHeight: 7.0,        // 碑只占画面左边一小块，天与右边全空
      lights,
    };
  }

  /**
   * 驿路（D-062，第九个地点）。水墨，平视顺着路看出去。情绪：走、分开走、各有归期。
   * 给第四章 15「各自领一份」（启程，默认）与 16「驿旁不是归处」（yipang）。
   *
   * 「关山有信」这个结局的意象就是路，所以路要真的在画面上：
   * 从画面下沿宽宽地进来，斜着往右上收窄，收进远山之间那块空里——**路的尽头是留白**，
   * 她要去的地方画面不替她画。
   * 路不是一块地板（E1 的老规矩）：一条清墨的带子、两道车辙、几座里堠，其余是纸。
   *
   * 无字碑母题：里堠。驿路上隔几里一座土堠，本该记里数，这几座的牌子是空的。
   */
  private buildYilu(_d: SceneDescriptor): Built {
    const yipang = this.dressing === "yipang";
    // 启程是清晨，雾没散，档与档挨得近；驿旁是一个月以后的午后，尘土大，光横着来
    this.useRamp(yipang ? [0.4, 0.74, 1.0] : [0.62, 0.85, 1.0]);
    const g = new THREE.Group();
    // 路的走向：z 从 6 到 -14，x 跟着从 -0.8 走到 3.2
    const ry = -Math.atan2(4, 20);
    const along = (z: number): number => -0.4 + 0.2 * (4 - z);
    const nx = Math.cos(ry), nz = -Math.sin(ry);      // 横过路面的方向
    // 远山：左右两片，中间让开路的尽头
    this.put(g, new THREE.BoxGeometry(6, 1.3, 0.3), "pale", [-4.2, 0.55, -24], { rz: 0.06, lineW: LINE_W * 0.3, unlit: true });
    this.put(g, new THREE.BoxGeometry(4.4, 0.8, 0.3), "pale", [8.6, 0.3, -24], { rz: -0.05, lineW: LINE_W * 0.26, unlit: true });
    // 路面：一条清墨的带子，不参加光照——路是纸上的一笔，不是地上的板。
    // 带子只画远的那一段（车后面起）：第一版从机位脚下铺起，竖屏下半张整片是一块灰楔子，
    // 数字全过（留白 64%），眼睛一看就是 E1 那个毛病；第二版从 z 2 起，还是楔子。
    // 近处只留两道车辙——路在脚下是「走出来的」，到远处才成一条路
    this.put(g, new THREE.BoxGeometry(1.4, 0.02, 11), "pale", [along(-8.5), 0.01, -8.5], { ry, lineW: 0, unlit: true });
    // 车辙：两道淡墨细线，从画面下沿进来，比路面先到、也先消失
    for (const s of [-1, 1]) {
      this.put(g, new THREE.BoxGeometry(0.05, 0.02, 16), "light",
        [along(-3) + s * 0.5 * nx, 0.025, -3 + s * 0.5 * nz], { ry, lineW: 0, unlit: true });
    }
    // 里堠：路右侧三座土堠，近大远小。牌子是空的
    for (const z of [1.2, -5.4, -12]) {
      this.put(g, new THREE.CylinderGeometry(0.1, 0.24, 0.5, 6), "light", [along(z) + 1.35, 0.25, z], { lineW: LINE_W * 0.6 });
      this.put(g, new THREE.BoxGeometry(0.16, 0.26, 0.04), "flat", [along(z) + 1.35, 0.46, z + 0.2], { lineW: LINE_W * 0.5 });
    }
    // 柳：左侧近处一株，四条垂枝。折柳送别是唐人的规矩，这里不折，只是长着
    this.put(g, new THREE.CylinderGeometry(0.1, 0.15, 3.0, 6), "mid", [-2.25, 1.5, 0.2], { rz: 0.1, lineW: LINE_W * 0.7 });
    this.canopy(g, 1.6, 0.9, 0.3, [-2.0, 3.05, 0.1], "pale", -0.08);
    for (const [i, rz] of [[0, 0.07], [1, 0.02], [2, -0.04], [3, -0.1]] as const) {
      this.put(g, new THREE.BoxGeometry(0.04, 1.9 - i * 0.2, 0.04), "line",
        [-2.1 + i * 0.28, 2.0 + i * 0.1, 0.3 + i * 0.05], { rz, lineW: LINE_W * 0.35 });
    }
    this.pool(g, -2.2, 0.2, 0.7);
    const lights: THREE.Light[] = [];
    if (!yipang) {
      // 运粮车：停在路上，车头朝路的尽头。车身重墨，麻包淡墨，两只轮子浓墨。
      // 「裴队先走，主角随运粮车」——车就是她这一程，所以它是焦点
      const cart = new THREE.Group();
      this.put(cart, new THREE.BoxGeometry(0.95, 0.12, 1.6), "mid", [0, 0.78, 0], { lineW: LINE_W * 0.9 });
      for (const s of [-1, 1]) {
        this.put(cart, new THREE.BoxGeometry(0.06, 0.3, 1.6), "mid", [s * 0.46, 0.96, 0], { lineW: LINE_W * 0.5 });
      }
      for (const [x, z, h] of [[-0.2, -0.45, 0.36], [0.2, 0.05, 0.4], [-0.15, 0.5, 0.32]] as const) {
        this.put(cart, new THREE.BoxGeometry(0.42, h, 0.44), "light", [x, 0.84 + h / 2, z], { ry: x * 0.8, lineW: LINE_W * 0.7 });
      }
      for (const s of [-1, 1]) {
        this.put(cart, new THREE.CylinderGeometry(0.4, 0.4, 0.07, 10), "dark", [s * 0.56, 0.4, 0.1], { rz: Math.PI / 2, lineW: LINE_W * 0.9 });
        // 辕：两根往前伸，搭在地上——牲口还没套上，人还没走
        this.put(cart, new THREE.BoxGeometry(0.05, 0.05, 1.5), "line", [s * 0.3, 0.42, -1.45], { rx: -0.32, lineW: LINE_W * 0.4 });
      }
      cart.position.set(along(-1.6) - 0.15, 0, -1.6);
      cart.rotation.y = ry;
      g.add(cart);
      this.pool(g, along(-1.6), -1.4, 0.9, "mid");     // 车泥：比别处重一档的一摊
      const sun = new THREE.DirectionalLight(0xffffff, 0.68);
      sun.position.set(3, 4, -12);        // 晨光从路的尽头来：东西朝着她的那一面暗
      lights.push(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.95), sun);
    } else {
      // 驿：左边一段矮墙加一面坡顶，只露一角——驿是歇脚的地方，不是去处，画面上不给它全身
      // 第一版墙贴着画面左边，屋顶被切成一块悬空的黑三角——往后、往里挪，整个屋角进画
      // 第二版还贴边——墙挪到路左边、人的身后，屋角整个进画，退后的人正好站在驿前
      this.put(g, new THREE.BoxGeometry(2.6, 1.5, 0.2), "light", [-0.55, 0.75, -8.4], { lineW: LINE_W * 0.6 });
      this.roof(g, 3.2, 1.6, 0.6, [-0.55, 1.8, -8.2], "mid");
      // 系马桩与一块坐人的石：「脱靴倒砂」在这块石头上
      this.put(g, new THREE.CylinderGeometry(0.05, 0.06, 1.1, 5), "line", [-0.55, 0.55, -4.6], { lineW: LINE_W * 0.5 });
      this.put(g, new THREE.BoxGeometry(0.72, 0.34, 0.5), "light", [-0.8, 0.17, -1.6], { ry: 0.3, lineW: LINE_W * 0.9 });
      // 一只脱下来的靴，倒着放在石边。浓墨的一小块，不是一大坨：它是「倒砂」那个动作留下的，不是主体
      this.put(g, new THREE.BoxGeometry(0.1, 0.28, 0.2), "dark", [-0.35, 0.1, -1.4], { rz: 1.2, ry: 0.4, lineW: LINE_W * 0.5 });
      // 远处路上一辆很小的车：先走的那一队，已经在路上了
      const far = new THREE.Group();
      this.put(far, new THREE.BoxGeometry(0.95, 0.4, 1.6), "mid", [0, 0.9, 0], { lineW: LINE_W * 0.5 });
      this.put(far, new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), "dark", [0, 0.4, 0.1], { rz: Math.PI / 2, lineW: LINE_W * 0.4 });
      far.position.set(along(-11), 0, -11);
      far.rotation.y = ry;
      far.scale.setScalar(0.7);
      g.add(far);
      this.pool(g, -0.8, -1.6, 0.8);
      const sun = new THREE.DirectionalLight(0xffffff, 1.1);
      sun.position.set(-7, 2.6, 2);       // 午后的光横着来，石头和靴一侧亮一侧暗
      lights.push(new THREE.HemisphereLight(0xffffff, 0x888888, 0.52), sun);
    }
    return {
      group: g,
      camFrom: new THREE.Vector3(-0.35, 1.78, 7.2),
      camTo: new THREE.Vector3(-0.3, 1.72, 5.8),
      lookAt: new THREE.Vector3(0.9, 1.45, -6),
      fitWidth: 4.8,
      fitHeight: 5.0,
      lights,
    };
  }

  private buildFallback(_key: SceneKey): Built {
    // 还没建模的场景：一块地、一条远处的横线，先把机位撑起来
    const group = new THREE.Group();
    this.put(group, new THREE.BoxGeometry(14, 0.2, 10), "pale", [0, -0.1, 0], { lineW: 0 });
    this.put(group, new THREE.BoxGeometry(12, 0.15, 0.4), "mid", [0, 0.2, -5]);
    return {
      group,
      camFrom: new THREE.Vector3(0, 2.6, 12),
      camTo: new THREE.Vector3(0, 2.3, 10),
      lookAt: new THREE.Vector3(0, 1, -2),
      fitWidth: 7,
      fitHeight: 6,
      lights: [new THREE.HemisphereLight(0xffffff, 0x444444, 1.0)],
    };
  }

  // ------------------------------------------------------------ 相机与渲染

  private dolly(from: THREE.Vector3, to: THREE.Vector3, dur: number): void {
    this.anim = { from: from.clone(), to: to.clone(), t0: performance.now(), dur };
    this.frames = 0; this.frameT0 = performance.now();
    cancelAnimationFrame(this.raf);
    const step = () => {
      if (!this.anim || !this.built) return;
      const k = Math.min(1, (performance.now() - this.anim.t0) / this.anim.dur);
      const e = 1 - Math.pow(1 - k, 3);   // ease-out cubic，起快止慢
      this.camera.position.lerpVectors(this.anim.from, this.anim.to, e);
      this.camera.lookAt(this.built.lookAt);
      this.render();
      this.frames++;
      if (k < 1) this.raf = requestAnimationFrame(step);
      else {
        const dt = (performance.now() - this.frameT0) / 1000;
        this.lastFps = dt > 0 ? Math.round(this.frames / dt) : 0;
        this.anim = null;
        this.root.dataset.fps = String(this.lastFps);
      }
    };
    this.raf = requestAnimationFrame(step);
  }

  private parallax(x: number, y: number): void {
    if (!this.built || this.anim) return;
    const w = window.innerWidth || 1, h = window.innerHeight || 1;
    this.px = (x / w - 0.5) * 0.18;
    this.py = (y / h - 0.5) * 0.10;
    const base = this.built.camTo;
    this.camera.position.set(base.x + this.px, base.y - this.py, base.z);
    this.camera.lookAt(this.built.lookAt);
    this.render();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private dispose3d(): void {
    if (this.built) {
      this.scene.remove(this.built.group, ...this.built.lights);
      this.built.group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      this.built = null;
    }
    this.gradient?.dispose();
    this.gradient = null;
  }
}

/** 这几种布置改的是几何或光，不是 visible，切到／切走都要重搭 */
function rebuilds(name: string): boolean {
  return ["yeyu", "shouwei", "yedeng", "beiyang", "yipang", "yin"].includes(name);
}

const DRESS_GONGYI = ["gongyi", "shouwei"] as const;

/** 人的身高（米）与立绘缩放的上下限，见 personScale */
const PERSON_M = 1.62;
const PERSON_MIN = 0.62;
const PERSON_MAX = 1;

/** CC1 接上 setInk 之前的默认值：幕数就是她的权力进度（D-010 第 3 条） */
function actInk(act: number): number {
  return act >= 3 ? 0.78 : act === 2 ? 0.22 : 0;
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}
