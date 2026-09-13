/**
 * 立绘穿帮检查（D-072）：朱砂点、紫点是不是长在人身上。
 *
 *   node --experimental-strip-types tools/sprite-check.ts
 *
 * 为什么要机器查：「红点浮空」这一类错，看一张立绘看不出来，放进场景才出来——
 * 宋蕙贞的朱砂点点在她那把尺子的尖上，尺子是纸色的，一放到纸色的场景里尺子就没了，
 * 只剩一粒红悬在半空。三十多张图、三种表情、两套（带不带朱绳），人眼对不过来。
 *
 * 做法：每张立绘在无头 Chrome 里画两遍到 canvas 上——一遍原样，一遍把 accent/purple 藏掉。
 * 在藏掉的那一遍里，看每个点外面一圈有没有「墨」（不透明、而且不是纸色）。
 * 一圈都没有墨，这个点就是浮着的：它挨着的要么是空气，要么是一件纸色的东西，
 * 放进纸色的场景里都一样。
 *
 * 同一遍里顺手查半透明：人身上 alpha 在 0.15～0.9 之间的像素占比太高，
 * 就是有一大块东西（比如披帛）是半透明画上去的，背后的柱子会从她身上透出来。
 *
 * 输出在终端；有浮点或半透明就退出码 1。
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHAR = join(ROOT, "src", "char");
const files = readdirSync(CHAR).filter((f) => f.endsWith(".svg")).sort();

function findChrome(): string {
  const c = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"];
  const hit = c.find((p) => p && existsSync(p));
  if (!hit) throw new Error("找不到 Chrome 或 Edge，设 CHROME_PATH");
  return hit;
}

const profile = mkdtempSync(join(tmpdir(), "sprite-check-"));
const proc = spawn(findChrome(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "about:blank"],
  { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise<string>((res, rej) => {
  let buf = "";
  const t = setTimeout(() => rej(new Error("Chrome 十五秒没起来")), 15000);
  proc.stderr!.on("data", (d: Buffer) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]!); } });
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0;
const pending = new Map<number, (m: { result?: unknown; error?: { message: string } }) => void>();
ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); pending.get(m.id)?.(m); pending.delete(m.id); };
const raw = <T>(method: string, params: Record<string, unknown> = {}, sessionId?: string) => new Promise<T>((res, rej) => {
  id += 1;
  pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result as T)));
  ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});
const { targetId } = await raw<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
const { sessionId } = await raw<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
const evaluate = async <T>(expression: string): Promise<T> =>
  (await raw<{ result: { value: T } }>("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId)).result.value;

/** 在页面里跑的那一段：画、藏点再画、看点的外圈有没有墨、数半透明 */
const probe = `async (svg) => {
  const load = (text) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej;
    i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(text); });
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  const vb = (root.getAttribute("viewBox") || "0 0 1024 1536").split(/\\s+/).map(Number);
  const W = vb[2], H = vb[3];
  const dots = [...doc.querySelectorAll(".accent, .purple")].map((n) => ({ cls: n.getAttribute("class"), tag: n.tagName,
    cx: +(n.getAttribute("cx") ?? NaN), cy: +(n.getAttribute("cy") ?? NaN), x: +(n.getAttribute("x") ?? NaN), y: +(n.getAttribute("y") ?? NaN),
    w: +(n.getAttribute("width") ?? 0), h: +(n.getAttribute("height") ?? 0), r: +(n.getAttribute("r") ?? 0), d: n.getAttribute("points") }));
  for (const n of doc.querySelectorAll(".accent, .purple")) n.setAttribute("visibility", "hidden");
  const hidden = new XMLSerializer().serializeToString(doc);
  const img = await load(hidden);
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  // 墨：够不透明，而且和纸色差得开（纸色的道具、高光不算）。
  // 不按「够暗」判：许静和、阿荻是清墨，本来就浅，按暗度判她们整个人都算不上墨
  const inkAt = (x, y) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const i = (y * W + x) * 4; if (px[i + 3] <= 200) return false;
    const d = Math.abs(px[i] - 237) + Math.abs(px[i + 1] - 231) + Math.abs(px[i + 2] - 218); return d > 60; };
  const floating = [];
  for (const d of dots) {
    let cx = d.cx, cy = d.cy, r = d.r;
    if (Number.isNaN(cx)) {
      if (!Number.isNaN(d.x)) { cx = d.x + d.w / 2; cy = d.y + d.h / 2; r = Math.max(d.w, d.h) / 2; }
      else if (d.d) { const p = d.d.trim().split(/[\\s,]+/).map(Number); let sx = 0, sy = 0, k = 0;
        for (let i = 0; i + 1 < p.length; i += 2) { sx += p[i]; sy += p[i + 1]; k++; } cx = sx / k; cy = sy / k; r = 10; }
    }
    let hits = 0, total = 0;
    for (const ring of [r + 4, r + 10]) for (let a = 0; a < 48; a++) {
      total++; if (inkAt(cx + Math.cos(a / 48 * 6.283) * ring, cy + Math.sin(a / 48 * 6.283) * ring)) hits++;
    }
    if (hits / total < 0.08) floating.push({ cls: d.cls, at: [Math.round(cx), Math.round(cy)], ink: +(hits / total).toFixed(2) });
  }
  let body = 0, sheer = 0;
  for (let i = 3; i < px.length; i += 16) { const a = px[i]; if (a > 10) { body++; if (a > 38 && a < 230) sheer++; } }
  return { floating, sheer: body ? +(sheer / body).toFixed(3) : 0 };
}`;

const SHEER_MAX = 0.06;   // 边缘抗锯齿大约占 2%～4%；超过 6% 就是有整块东西是半透明画的
let bad = 0;
await raw("Page.navigate", { url: "about:blank" }, sessionId);
for (const f of files) {
  const svg = readFileSync(join(CHAR, f), "utf8");
  const r = await evaluate<{ floating: { cls: string; at: number[]; ink: number }[]; sheer: number }>(`(${probe})(${JSON.stringify(svg)})`);
  const issues: string[] = [];
  for (const d of r.floating) issues.push(`${d.cls === "purple" ? "紫点" : "朱砂"}浮空 @${d.at.join(",")}（外圈墨 ${Math.round(d.ink * 100)}%）`);
  if (r.sheer > SHEER_MAX) issues.push(`半透明像素 ${(r.sheer * 100).toFixed(1)}%`);
  if (issues.length) { bad++; console.log(`  ✗ ${f.padEnd(34)} ${issues.join("；")}`); }
}
console.log(bad ? `\n  ${bad}/${files.length} 张有穿帮。\n` : `\n  ${files.length} 张都干净：点都长在人身上，没有整块半透明。\n`);
ws.close(); proc.kill();
try { rmSync(profile, { recursive: true, force: true }); } catch { /* */ }
process.exit(bad ? 1 : 0);
