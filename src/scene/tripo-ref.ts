/**
 * Tripo 参考图（D-074）。只在 dev 下打开，不进产物。
 *
 *   /src/scene/tripo-ref.html                 四分之三视角、带明暗的参考图（喂给 image-to-3D 的那一张）
 *   /src/scene/tripo-ref.html?view=sheet      审图页：参考图、它的纯剪影、现有 SVG 的纯剪影、沈衡与唐简的纯剪影并排
 *
 * 为什么不直接喂 SVG：纯黑剪影没有明暗，就没有体积信息，image-to-3D 会给一片薄板（D-074 第二条）。
 * 所以这里用简易体块摆一个有前后关系的人，**灰阶分档**：幞头与靴最深，袍中灰，脸与手最浅，
 * 肩、胸、袖、下摆的转折各有一档光。
 *
 * 为什么是幞头圆领袍而不是 SVG 里的「束发 + 明光铠」：D-074 第 4 条写明「裴照夜是男装幞头」；
 * 铠甲的碎甲片是生成工具的重灾区；角色圣经说袍裤是她的公开日常（art-cc3-p2-spec.md 第一节）。
 *
 * 规格表（art-cc3-p2-spec.md 第二节）落在几何上：
 * - 脸光滑，没有五官——生成工具给不了它没见过的东西
 * - 幞头两脚极短、硬；没有飘带、披风、宽袖
 * - A 字站姿，两臂离身约三十度，两脚与肩同宽——自动绑骨要手臂离开身体
 * - 剑挂左胯，手不握
 * - 身形：十一人里最高、肩最宽（SVG 表里 height 1.07 / width 1.14）
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const qs = new URLSearchParams(location.search);
const sheet = qs.get("view") === "sheet";
/**
 * 版本。v2 是 E8 交过、并被拿去生成过的那一版，**几何保持能原样重渲**；
 * v3 按 D-080 改四处（剑去掉、手收进袖子、领子过渡、缺胯开衩），再加 D-077 的识别点（硬脚幞头、两腿分开）
 */
const V = Number(qs.get("v") ?? 2);
const SIZE = 1024;

/** 灰阶四档。不是色板色：这张图只给生成工具读体积，贴图一律丢弃（规格第 3 条） */
const G = { cap: 0x2a2a2a, robe: 0x7a7a78, belt: 0x333333, skin: 0xc9c6c0, boot: 0x2e2e2e, sword: 0x444444 };

function mat(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
}

/** 一个人。原点在两脚中间的地面上，身高约 1.72，面朝 +Z */
function figure(material?: THREE.Material): THREE.Group {
  const m = (c: number) => material ?? mat(c);
  const g = new THREE.Group();
  // 圆领袍：旋转体。下摆到小腿肚，腰收，胸厚，肩最宽。
  // 第一版下摆比肩还宽（像一只粽子），人显得矮胖——她是十一人里最高的。现在肩是最宽的地方，往下直直收窄
  const profile = [
    [0.0, 0.32], [0.19, 0.32], [0.2, 0.4], [0.185, 0.7], [0.165, 0.98], [0.175, 1.1],
    [0.2, 1.26], [0.21, 1.37], [0.16, 1.43], [0.07, 1.46], [0.0, 1.46],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  // v3：缺胯袍。旋转体只到膝（0.56），往下是前后两片，两侧开衩，腿从缝里露出来。
  // 第二版的下摆是一圈硬边，生成出来是一只筒；开衩之后下半截才是一个「人」字（D-077 的识别点）
  const prof = V >= 3 ? [[0.0, 0.56], [0.195, 0.56], ...profile.slice(3).map((p) => [p.x, p.y])].map(([r, y]) => new THREE.Vector2(r!, y!)) : profile;
  const robe = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), m(G.robe));
  robe.scale.set(1.3, 1, 0.74);
  g.add(robe);
  if (V >= 3) {
    // 下摆：同一个旋转体的前后两段弧，侧面各空出一段——开衩就是这两道缝，缝里是腿。
    // 第一次试的是两块平板挂在袍身外，四分之三视角里读成胸前拎着一只公文包
    const skirt = [[0.198, 0.6], [0.2, 0.46], [0.205, 0.34]].map(([r, y]) => new THREE.Vector2(r!, y!));
    for (const start of [-1.05, Math.PI - 1.05]) {
      const arc = new THREE.Mesh(new THREE.LatheGeometry(skirt, 20, start, 2.1), m(G.robe));
      (arc.material as THREE.Material).side = THREE.DoubleSide;
      arc.scale.set(1.3, 1, 0.74);
      g.add(arc);
    }
  }
  // 圆领：领口一圈，比袍深一档
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 8, 24), m(G.belt));
  collar.position.set(0, 1.44, 0.01);
  collar.rotation.x = Math.PI / 2;
  g.add(collar);
  // 前襟缝：一条浅浅的竖脊，给胸前一道转折
  const seam = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.5, 0.02, 2, 0.008), m(G.belt));
  seam.position.set(0.05, 1.18, 0.15);
  g.add(seam);
  // 革带与两个小囊
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 32), m(G.belt));
  belt.scale.set(1.32, 1, 0.78);
  belt.position.y = 1.0;
  g.add(belt);
  for (const x of [0.13, -0.05]) {
    const pouch = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.09, 0.04, 2, 0.012), m(G.belt));
    pouch.position.set(x, 0.93, 0.13);
    g.add(pouch);
  }
  // 腿与靴：两脚与肩同宽，靴筒到膝下
  // v3 两脚分得更开，腿在开衩里看得见（D-077「站姿最开」）
  const footX = V >= 3 ? 0.19 : 0.13;
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, V >= 3 ? 0.4 : 0.2, 16), m(G.robe));
    leg.position.set(s * (V >= 3 ? 0.155 : 0.12), V >= 3 ? 0.5 : 0.4, 0);
    if (V >= 3) leg.rotation.z = s * 0.14;
    g.add(leg);
    const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.07, 0.36, 16), m(G.boot));
    boot.position.set(s * footX, 0.2, 0);
    g.add(boot);
    const toe = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.07, 0.22, 3, 0.03), m(G.boot));
    toe.position.set(s * footX, 0.035, 0.05);
    g.add(toe);
  }
  // 臂：A 字，离身约三十度。窄袖——袖口不比上臂宽
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.26, 1.37, 0);
    arm.rotation.z = s * 0.52;
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, 0.26, 6, 16), m(G.robe));
    upper.position.y = -0.17;
    arm.add(upper);
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.24, 6, 16), m(G.robe));
    lower.position.set(0, -0.44, 0.02);
    arm.add(lower);
    if (V >= 3) {
      // v3：手收进袖子。第二版手是一只白椭圆，生成出来会是一个球（D-080）。袖口略放、口朝下，里面是暗的
      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, 0.12, 16, 1, true), m(G.robe));
      cuff.position.set(0, -0.64, 0.02);
      arm.add(cuff);
      const inside = new THREE.Mesh(new THREE.CircleGeometry(0.062, 16), m(G.belt));
      inside.rotation.x = Math.PI / 2;
      inside.position.set(0, -0.695, 0.02);
      arm.add(inside);
    } else {
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), m(G.skin));
      hand.scale.set(0.8, 1.15, 0.7);
      hand.position.set(0, -0.63, 0.02);
      arm.add(hand);
    }
    g.add(arm);
  }
  // 颈与头：头是一只光滑的蛋，没有五官
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 16), m(G.skin));
  neck.position.y = 1.49;
  g.add(neck);
  if (V >= 3) {
    // v3：领子一圈从肩收到下巴底下，把那根白圆柱的脖子包住（D-080）
    const collarUp = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.1, 0.09, 24), m(G.robe));
    collarUp.position.y = 1.48;
    g.add(collarUp);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 8, 24), m(G.belt));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.525;
    g.add(rim);
  }
  // 头比第一版大一圈：小头配宽袍更显得矮
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.108, 32, 24), m(G.skin));
  head.scale.set(0.88, 1.12, 0.98);
  head.position.y = 1.61;
  g.add(head);
  // 幞头：包住头顶到额上，后脑一个方髻，两脚极短、硬、平伸
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.114, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), m(G.cap));
  cap.scale.set(0.92, 1.12, 1.0);
  cap.position.y = 1.625;
  g.add(cap);
  // 巾子：幞头顶上后半的一个高起的包，比第一版高、靠后
  const knot = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.12, 0.09, 3, 0.035), m(G.cap));
  knot.position.set(0, 1.77, -0.04);
  g.add(knot);
  if (V >= 3) {
    // v3：硬脚幞头（D-077 的识别点）。两脚从巾子后面平伸，比 v1 那一对短而靠后、靠上——v1 贴着帽口伸，读成帽檐。
    // 做得比剑粗：细长附件会被生成成独立的棍子（D-080），所以宽一指、根部埋进巾子里
    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.03, 0.035, 2, 0.012), m(G.cap));
      wing.position.set(s * 0.14, 1.69, -0.08);
      g.add(wing);
    }
  }
  // 两脚：从脑后正中垂下、贴着颈后，短而硬。第一版向两侧平伸，四分之三视角里读成一顶棒球帽的帽檐
  if (V < 3) for (const s of [-1, 1]) {
    const tail = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.12, 0.018, 2, 0.006), m(G.cap));
    tail.position.set(s * 0.025, 1.56, -0.11);
    tail.rotation.set(0.25, 0, s * 0.12);
    g.add(tail);
  }
  // 剑：直刀带鞘，挂左胯，斜向后下，手不在上面
  const sword = new THREE.Group();
  // 第一版斜横过双腿，像腿前横着一根棍。现在贴着左胯外侧垂下，鞘尾往后翘一点
  sword.position.set(0.3, 1.0, -0.02);
  sword.rotation.set(0.28, 0, 0.1);
  const scab = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.78, 0.022, 2, 0.008), m(G.sword));
  scab.position.y = -0.39;
  sword.add(scab);
  const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 8), m(G.belt));
  hilt.position.y = 0.08;
  sword.add(hilt);
  const guard = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.02, 0.04, 2, 0.006), m(G.belt));
  sword.add(guard);
  // v3：剑去掉。细长附件生成出来是一根浮在身侧的独立细杆（D-080，网页端那一次就是），剑在引擎里单独挂
  if (V < 3) g.add(sword);
  return g;
}

function render(opts: { silhouette: boolean; yaw: number; w: number; h: number }): HTMLCanvasElement {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(opts.w, opts.h);
  renderer.setClearColor(opts.silhouette ? 0xede7da : 0xf4f4f2, 1);
  const scene = new THREE.Scene();
  const person = figure(opts.silhouette ? new THREE.MeshBasicMaterial({ color: 0x111111 }) : undefined);
  person.rotation.y = opts.yaw;
  scene.add(person);
  if (!opts.silhouette) {
    // 主光左前上方、补光半球、一道右后的轮廓光：肩、胸、袖、下摆的转折各亮一档
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-2, 3, 3);
    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(2.5, 2, -2);
    scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 0.9));
  }
  const cam = new THREE.PerspectiveCamera(22, opts.w / opts.h, 0.1, 50);
  cam.position.set(0, 1.05, 5.1);
  cam.lookAt(0, 0.88, 0);
  renderer.render(scene, cam);
  return renderer.domElement;
}

const css = document.createElement("style");
css.textContent = `body{margin:0;background:#2a2a28;color:#ccc;font:12px system-ui}
  .row{display:flex;gap:12px;padding:12px;flex-wrap:wrap;align-items:flex-end}
  figure{margin:0} figcaption{padding-top:4px} canvas,svg{display:block}
  .sil{background:#EDE7DA}
  .sil svg{height:320px;width:auto;display:block}
  .sil svg *{fill:#111 !important;stroke:none !important;opacity:1 !important}`;
document.head.appendChild(css);

if (!sheet) {
  // 喂给 Tripo 的那一张：1024 方图，人居中、四周留边，背景近白无纹理
  const c = render({ silhouette: false, yaw: -0.62, w: SIZE, h: SIZE });
  c.id = "ref";
  document.body.appendChild(c);
  (window as unknown as { __ref: string }).__ref = c.toDataURL("image/png");
} else {
  const files = import.meta.glob<string>("../char/*.svg", { query: "?raw", import: "default", eager: true });
  const row = document.createElement("div");
  row.className = "row";
  const add = (el: HTMLElement | SVGElement, cap: string, cls = "") => {
    const f = document.createElement("figure");
    if (cls) f.className = cls;
    f.append(el);
    const fc = document.createElement("figcaption");
    fc.textContent = cap;
    f.append(fc);
    row.append(f);
  };
  const ref = render({ silhouette: false, yaw: -0.62, w: 320, h: 320 });
  add(ref, "参考图（四分之三，带明暗）");
  add(render({ silhouette: true, yaw: -0.62, w: 320, h: 320 }), "参考图 · 纯剪影 · 四分之三");
  add(render({ silhouette: true, yaw: 0, w: 320, h: 320 }), "参考图 · 纯剪影 · 正面");
  for (const [k, cap] of [["peizhaoye", "现 SVG 裴照夜（D-077 新版）"], ["shenheng", "沈衡（幞头圆领袍）"], ["tangjian", "唐简（幞头圆领袍）"]] as const) {
    const box = document.createElement("div");
    box.innerHTML = files[`../char/${k}_default.svg`] ?? "";
    add(box, cap, "sil");
  }
  document.body.appendChild(row);
}
document.title = "Tripo 参考图 · 完成";
