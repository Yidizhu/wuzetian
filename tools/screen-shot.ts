/**
 * 整屏截图（D-071 / D-072）：玩家实际看到的那一屏——场景 + 立绘 + 对话框 + HUD。
 *
 *   node --experimental-strip-types tools/screen-shot.ts ch01_s03_yeting ch02_s11_hanyuan
 *   node --experimental-strip-types tools/screen-shot.ts --renderer css ch01_s01_zhaoyang
 *   node --experimental-strip-types tools/screen-shot.ts --prologue --renderer three
 *
 * `--prologue`：从头开一局，按 D-076 的三段各截一张——题记那张纸、纸收起后的空景、人上台那一句。
 * 这三张要连起来看，单截一场看不出「变化」。
 *
 * 为什么 CC1 也要一个：CC3 的 art:loop 量的是场景那一层；D-072 那几个 bug（宽屏立绘不见、
 * 半透明、浮空红点、比例）全都出在层与层叠起来之后，只有整屏截得出来。
 * 另外它把每个立绘格子的位置、大小、透明度一起打印出来——「看不见」到底是没画、
 * 画在屏幕外、零尺寸，还是透明，截图分不出来，数字分得出来。
 *
 * 两个视口各截一张：手机竖屏 390×844，桌面宽屏 1440×900。
 * 输出在 Claude outputs/screens/，不进版本库。
 *
 * 零依赖：Chrome 走 DevTools 协议。启动方式照抄 tools/art-loop.ts（CC3），端口用 5178，不和谁撞。
 */
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
import { DATA_VERSION } from "../src/engine/types.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "Claude outputs", "screens");
const PORT = 5178;
const VIEWS = [
  { name: "phone", width: 390, height: 844, dpr: 2, mobile: true },
  { name: "wide", width: 1440, height: 900, dpr: 1, mobile: false },
];

const argv = process.argv.slice(2);
const rIdx = argv.indexOf("--renderer");
const renderer = rIdx >= 0 ? argv[rIdx + 1] : "";
const lIdx = argv.indexOf("--line");
const lineIndex = lIdx >= 0 ? Number(argv[lIdx + 1]) : 2;
// --flags a,b,c：存档里这几个 flag 写真；--taps N：进场后点 N 下再截（截结局卡用）
const fIdx = argv.indexOf("--flags");
const flags = Object.fromEntries((fIdx >= 0 ? argv[fIdx + 1]! : "").split(",").filter(Boolean).map((f) => [f, true]));
const tIdx = argv.indexOf("--taps");
const taps = tIdx >= 0 ? Number(argv[tIdx + 1]) : 0;
// --tap-gap 毫秒：两下之间隔多久。结局第一拍要停 1.5 秒才认点击（D-084），截第二拍时给 1600
const gIdx = argv.indexOf("--tap-gap");
const tapGap = gIdx >= 0 ? Number(argv[gIdx + 1]) : 300;
// --eval "<js>"：进场、点完之后，截图之前在页面里跑一段（B24：打开信箱、点开一封信）
const eIdx = argv.indexOf("--eval");
const evalJs = eIdx >= 0 ? argv[eIdx + 1]! : "";
// --letters id,id：存档里这几封信已经送到案上、没拆
const lsIdx = argv.indexOf("--letters");
const onDesk = lsIdx >= 0 ? argv[lsIdx + 1]!.split(",").filter(Boolean) : [];
// --size 宽x高：只截这一个视口（B24：矮屏复现信纸顶部被切）
const szIdx = argv.indexOf("--size");
if (szIdx >= 0) {
  const [w, h] = argv[szIdx + 1]!.split("x").map(Number);
  VIEWS.splice(0, VIEWS.length, { name: `${w}x${h}`, width: w!, height: h!, dpr: 2, mobile: true });
}
const prologue = argv.includes("--prologue");
const scenes = argv.filter((a, i) => !a.startsWith("--") && ![rIdx, lIdx, fIdx, tIdx, gIdx, eIdx, lsIdx, szIdx].some((j) => j >= 0 && i === j + 1));
if (!scenes.length && !prologue) scenes.push("ch01_s01_zhaoyang");

function findChrome(): string {
  const c = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"];
  const hit = c.find((p) => p && existsSync(p));
  if (!hit) throw new Error("找不到 Chrome 或 Edge，设 CHROME_PATH");
  return hit;
}

type Send = <T = Record<string, unknown>>(m: string, p?: Record<string, unknown>) => Promise<T>;

async function launch(): Promise<{ proc: ChildProcess; send: Send; close(): void; profile: string }> {
  const profile = mkdtempSync(join(tmpdir(), "screen-shot-"));
  const proc = spawn(findChrome(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
    "--no-first-run", "--hide-scrollbars", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise<string>((res, rej) => {
    let buf = "";
    const t = setTimeout(() => rej(new Error("Chrome 十五秒没起来")), 15000);
    proc.stderr!.on("data", (d: Buffer) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]!); } });
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map<number, (v: { result?: unknown; error?: { message: string } }) => void>();
  ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); pending.get(m.id)?.(m); pending.delete(m.id); };
  const raw = <T>(method: string, params: Record<string, unknown> = {}, sessionId?: string) => new Promise<T>((res, rej) => {
    id += 1;
    pending.set(id, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result as T)));
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await raw<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await raw<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
  return { proc, profile, send: (m, p) => raw(m, p, sessionId), close: () => ws.close() };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const server = await createServer({ root: ROOT, server: { port: PORT, strictPort: true }, logLevel: "error" });
await server.listen();
mkdirSync(OUT, { recursive: true });
const { proc, send, close, profile } = await launch();

const evaluate = async <T>(expr: string): Promise<T> =>
  (await send<{ result: { value: T } }>("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.value;

const tap = async (view: { width: number; height: number }): Promise<void> => {
  const at = { x: view.width / 2, y: view.height * 0.4, button: "left", clickCount: 1 };
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...at });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...at });
};
const shot = async (name: string): Promise<void> => {
  const info = await evaluate<string>(`JSON.stringify({
    tiji: !!document.querySelector('.tiji'),
    stage: document.querySelector('.stage')?.className,
    cast: [...document.querySelectorAll('.cast__slot')].map(n => n.dataset.char),
    dlg: document.querySelector('.dlg')?.hidden ? '（收起）' : (document.querySelector(".dlg")?.textContent ?? '').slice(0, 24),
  })`);
  const png = await send<{ data: string }>("Page.captureScreenshot", { format: "png" });
  const file = join(OUT, `${name}.png`);
  writeFileSync(file, Buffer.from(png.data, "base64"));
  console.log(`${name}  ->  ${file}\n  ${info}`);
};

try {
  if (prologue) {
    for (const view of VIEWS) {
      await send("Emulation.setDeviceMetricsOverride", { width: view.width, height: view.height, deviceScaleFactor: view.dpr, mobile: view.mobile });
      await send("Page.navigate", { url: `http://localhost:${PORT}/?notitle=1` });
      await sleep(400);
      await evaluate(`localStorage.clear(); localStorage.setItem("wuzetian.notice.storage","1"); true`);
      const q = new URLSearchParams({ notitle: "1" });
      if (renderer) q.set("renderer", renderer);
      await send("Page.navigate", { url: `http://localhost:${PORT}/?${q}` });
      const tag = `prologue-${view.name}${renderer ? "-" + renderer : ""}`;
      await sleep(4200);
      await shot(`${tag}-1-题记`);
      await tap(view); await sleep(300); await tap(view);          // 补完，合上
      await sleep(3600);                                           // 纸 460ms 合上 + 墨晕开 + 推镜
      await shot(`${tag}-2-空景`);
      for (let i = 0; i < 24; i++) {
        if (await evaluate<boolean>(`document.querySelectorAll('.cast__slot svg').length > 0`)) break;
        await tap(view); await sleep(350);
      }
      await sleep(1200);
      await shot(`${tag}-3-上台`);
    }
  }
  for (const view of VIEWS) {
    await send("Emulation.setDeviceMetricsOverride", { width: view.width, height: view.height, deviceScaleFactor: view.dpr, mobile: view.mobile });
    for (const sceneId of scenes) {
      // 直接写一份自动存档把人放到这一场，比从头点过去快，也不依赖路线
      const save = { version: 1, dataVersion: DATA_VERSION, savedAt: 0, sceneId, lineIndex, stats: { shi: 5, ming: 5, cai: 5, xin: 5 },
        affinity: {}, flags, protagonistName: "吾则添", seenLineIds: [], poemsCollected: [], endingsUnlocked: [], letters: onDesk.map((id) => ({ id, state: "arrived", dueAt: 1, repliedWith: null })), lastSeenAt: 0, introsSeen: [] };
      await send("Page.navigate", { url: `http://localhost:${PORT}/?notitle=1` });
      await sleep(400);
      await evaluate(`localStorage.clear(); localStorage.setItem("wuzetian.notice.storage","1"); localStorage.setItem("wuzetian.save.0", ${JSON.stringify(JSON.stringify(save))}); true`);
      const q = new URLSearchParams({ notitle: "1" });
      if (renderer) q.set("renderer", renderer);
      await send("Page.navigate", { url: `http://localhost:${PORT}/?${q}` });
      await sleep(4200);        // 推镜 2.6 秒 + 立绘挂上
      for (let i = 0; i < taps; i++) { await tap(view); await sleep(tapGap); }
      if (taps) await sleep(2500);
      if (evalJs) { await evaluate(`(async () => { ${evalJs} })()`); await sleep(900); }
      const info = await evaluate<string>(`JSON.stringify({
        renderer: document.querySelector('.stage')?.className,
        viewport: [innerWidth, innerHeight],
        cast: (() => { const e = document.querySelector('.cast'); const r = e.getBoundingClientRect(); return [r.x|0, r.y|0, r.width|0, r.height|0]; })(),
        slots: [...document.querySelectorAll('.cast__slot')].map(n => { const r = n.getBoundingClientRect(); const s = n.querySelector('svg, img')?.getBoundingClientRect(); const cs = getComputedStyle(n);
          return { who: n.dataset.char, side: n.dataset.side, active: n.dataset.active, box: [r.x|0, r.y|0, r.width|0, r.height|0], svg: s ? [s.x|0, s.y|0, s.width|0, s.height|0] : null, opacity: cs.opacity, filter: cs.filter }; }),
        dlg: (() => { const r = document.querySelector('.dlg').getBoundingClientRect(); return [r.x|0, r.y|0, r.width|0, r.height|0]; })(),
        probe: document.documentElement.dataset.probe,
      })`);
      const png = await send<{ data: string }>("Page.captureScreenshot", { format: "png" });
      const file = join(OUT, `${sceneId}-${view.name}${renderer ? "-" + renderer : ""}${taps ? "-taps" + taps : ""}.png`);
      writeFileSync(file, Buffer.from(png.data, "base64"));
      console.log(`${view.name.padEnd(5)} ${sceneId}  ->  ${file}\n  ${info}`);
    }
  }
} finally {
  close();
  proc.kill();
  await server.close();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Windows 上 Chrome 退得慢，删不掉就留着 */ }
}
