/**
 * 看 Tripo 回来的模型（D-080）。只在 dev 下打开，不进产物。
 *
 *   /src/scene/tripo-view.html?file=peizhaoye-image_to_model-2246e0e9.glb
 *
 * 文件从 Claude outputs/tripo/ 读。一排六格：正面、四分之三、侧面（灰模带明暗），正面、侧面、四分之三（纯剪影）。
 * 不做任何修正——朝向、比例都按原样摆，只把高度归到 1.72 米、脚落地、水平居中，看的就是它回来的样子。
 * 模型原样多高、多宽、多深、多少面，一起写在页面上，也挂在 window.__view 上给脚本读。
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const qs = new URLSearchParams(location.search);
const file = qs.get("file") ?? "";
const H = 1.72;

const css = document.createElement("style");
css.textContent = `body{margin:0;background:#2a2a28;color:#ccc;font:12px system-ui}
  .row{display:flex;gap:10px;padding:10px;flex-wrap:wrap} figure{margin:0} figcaption{padding-top:4px}
  pre{margin:0 10px;color:#ddd}`;
document.head.appendChild(css);

const gltf = await new GLTFLoader().loadAsync(`/Claude outputs/tripo/${encodeURIComponent(file)}`);
const root = gltf.scene;
root.updateMatrixWorld(true);
const box0 = new THREE.Box3().setFromObject(root);
const size0 = box0.getSize(new THREE.Vector3());
let tris = 0, verts = 0;
root.traverse((o) => {
  if (o instanceof THREE.Mesh) {
    const g = o.geometry as THREE.BufferGeometry;
    verts += g.attributes.position!.count;
    tris += (g.index ? g.index.count : g.attributes.position!.count) / 3;
  }
});
const k = H / size0.y;
root.scale.setScalar(k);
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
const c = box.getCenter(new THREE.Vector3());
root.position.set(-c.x, -box.min.y, -c.z);

function panel(yaw: number, silhouette: boolean, label: string): HTMLElement {
  const W = 300, Hh = 360;
  const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, Hh);
  r.setClearColor(silhouette ? 0xede7da : 0xf4f4f2, 1);
  const scene = new THREE.Scene();
  const holder = new THREE.Group();
  const m = root.clone(true);
  m.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.material = silhouette
        ? new THREE.MeshBasicMaterial({ color: 0x111111 })
        : new THREE.MeshStandardMaterial({ color: 0x8a8a88, roughness: 0.9, flatShading: false });
    }
  });
  holder.add(m);
  holder.rotation.y = yaw;
  scene.add(holder);
  if (!silhouette) {
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-2, 3, 3);
    const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(2.5, 2, -2);
    scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 0.9));
  }
  const cam = new THREE.PerspectiveCamera(24, W / Hh, 0.1, 50);
  cam.position.set(0, 0.95, 5.2);
  cam.lookAt(0, 0.86, 0);
  r.render(scene, cam);
  const f = document.createElement("figure");
  f.append(r.domElement);
  const fc = document.createElement("figcaption");
  fc.textContent = label;
  f.append(fc);
  return f;
}

const row = document.createElement("div");
row.className = "row";
row.append(
  panel(0, false, "yaw 0（相机在 +Z）"),
  panel(Math.PI / 4, false, "yaw 45°"),
  panel(Math.PI / 2, false, "yaw 90°"),
  panel(0, true, "剪影 yaw 0"),
  panel(Math.PI / 2, true, "剪影 yaw 90°"),
  panel(-Math.PI / 4, true, "剪影 yaw −45°"),
);
document.body.append(row);
const info = { file, tris: Math.round(tris), verts, rawSize: size0.toArray().map((v) => +v.toFixed(3)) };
const pre = document.createElement("pre");
pre.textContent = JSON.stringify(info);
document.body.append(pre);
(window as unknown as { __view: unknown }).__view = info;
document.title = "Tripo 模型 · 完成";
